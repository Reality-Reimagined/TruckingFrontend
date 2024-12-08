import { 
  Manifest, 
  Driver, 
  Vehicle, 
  InsurancePolicy, 
  Shipment, 
  Commodity 
} from '../types/database';
import { BorderConnectManifest } from '../types/borderconnect';
import { Logger } from '../services/logger';

export class BorderConnectError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly data?: any
  ) {
    super(message);
    this.name = 'BorderConnectError';
  }
}

export class BorderConnectFormatter {
  private static companyKey = process.env.BORDERCONNECT_COMPANY_KEY;

  static formatManifest(
    manifest: Manifest,
    driver: Driver,
    vehicle: Vehicle,
    insurance: InsurancePolicy | null,
    shipments: Array<{
      shipment: Shipment;
      commodities: Commodity[];
    }>
  ): BorderConnectManifest {
    try {
      Logger.log('info', 'Starting manifest formatting', {
        manifestId: manifest.id,
        manifestType: manifest.manifest_type
      });

      this.validateRequiredData(manifest, driver, vehicle, shipments);

      const formattedManifest = manifest.manifest_type === 'ACE'
        ? this.formatACEManifest(manifest, driver, vehicle, insurance, shipments)
        : this.formatACIManifest(manifest, driver, vehicle, insurance, shipments);

      Logger.log('info', 'Successfully formatted manifest', {
        manifestId: manifest.id,
        tripNumber: formattedManifest.tripNumber
      });

      return formattedManifest;
    } catch (error) {
      Logger.log('error', 'Failed to format manifest', {
        manifestId: manifest.id,
        manifestType: manifest.manifest_type
      }, error as Error);

      if (error instanceof BorderConnectError) {
        throw error;
      }

      throw new BorderConnectError(
        'Failed to format manifest',
        'FORMAT_ERROR',
        { manifestId: manifest.id }
      );
    }
  }

  private static validateRequiredData(
    manifest: Manifest,
    driver: Driver,
    vehicle: Vehicle,
    shipments: Array<{
      shipment: Shipment;
      commodities: Commodity[];
    }>
  ) {
    if (!manifest.trip_number) {
      throw new BorderConnectError(
        'Missing trip number',
        'MISSING_TRIP_NUMBER',
        { manifestId: manifest.id }
      );
    }

    if (!driver.license_number) {
      throw new BorderConnectError(
        'Missing driver license',
        'MISSING_DRIVER_LICENSE',
        { driverId: driver.id }
      );
    }

    if (!vehicle.vin_number) {
      throw new BorderConnectError(
        'Missing vehicle VIN',
        'MISSING_VEHICLE_VIN',
        { vehicleId: vehicle.id }
      );
    }

    if (shipments.length === 0) {
      throw new BorderConnectError(
        'No shipments provided',
        'MISSING_SHIPMENTS',
        { manifestId: manifest.id }
      );
    }

    // Add more validation as needed
  }

  private static formatACEManifest(
    manifest: Manifest,
    driver: Driver,
    vehicle: Vehicle,
    insurance: InsurancePolicy | null,
    shipments: Array<{
      shipment: Shipment;
      commodities: Commodity[];
    }>
  ): BorderConnectManifest {
    return {
      data: 'ACE_TRIP',
      sendId: this.generateSendId(),
      companyKey: this.companyKey!,
      operation: 'CREATE',
      tripNumber: manifest.trip_number,
      usPortOfArrival: manifest.port_of_entry,
      estimatedArrivalDateTime: manifest.estimated_arrival,
      truck: this.formatVehicle(vehicle, insurance),
      drivers: [this.formatDriver(driver)],
      shipments: shipments.map(s => this.formatACEShipment(s.shipment, s.commodities)),
      autoSend: false
    };
  }

  private static formatACIManifest(
    manifest: Manifest,
    driver: Driver,
    vehicle: Vehicle,
    insurance: InsurancePolicy | null,
    shipments: Array<{
      shipment: Shipment;
      commodities: Commodity[];
    }>
  ): BorderConnectManifest {
    return {
      data: 'ACI_TRIP',
      sendId: this.generateSendId(),
      companyKey: this.companyKey!,
      operation: 'CREATE',
      tripNumber: manifest.trip_number,
      portOfEntry: manifest.port_of_entry,
      estimatedArrivalDateTime: manifest.estimated_arrival,
      truck: this.formatVehicle(vehicle, insurance),
      drivers: [this.formatDriver(driver)],
      shipments: shipments.map(s => this.formatACIShipment(s.shipment, s.commodities)),
      autoSend: false
    };
  }

  private static formatVehicle(vehicle: Vehicle, insurance: InsurancePolicy | null) {
    return {
      number: vehicle.number,
      type: vehicle.type,
      vinNumber: vehicle.vin_number,
      dotNumber: vehicle.dot_number,
      licensePlate: {
        number: vehicle.license_plate_number,
        stateProvince: vehicle.license_plate_state
      },
      ...(insurance && {
        insurancePolicy: {
          insuranceCompanyName: insurance.company_name,
          policyNumber: insurance.policy_number,
          issuedDate: insurance.issued_date,
          policyAmount: insurance.policy_amount
        }
      })
    };
  }

  private static formatDriver(driver: Driver) {
    return {
      driverNumber: driver.driver_number,
      firstName: driver.first_name,
      lastName: driver.last_name,
      gender: driver.gender,
      dateOfBirth: driver.date_of_birth,
      citizenshipCountry: driver.citizenship_country,
      ...(driver.fast_card_number && {
        fastCardNumber: driver.fast_card_number
      })
    };
  }

  private static formatACEShipment(shipment: Shipment, commodities: Commodity[]) {
    return {
      data: 'ACE_SHIPMENT',
      sendId: this.generateSendId(),
      companyKey: this.companyKey!,
      operation: 'CREATE',
      type: shipment.type,
      shipmentControlNumber: shipment.shipment_control_number,
      provinceOfLoading: shipment.province_of_loading,
      shipper: this.formatParty(
        shipment.shipper_name,
        shipment.shipper_address,
        shipment.shipper_city,
        shipment.shipper_state,
        shipment.shipper_postal_code
      ),
      consignee: this.formatParty(
        shipment.consignee_name,
        shipment.consignee_address,
        shipment.consignee_city,
        shipment.consignee_state,
        shipment.consignee_postal_code
      ),
      commodities: commodities.map(this.formatCommodity)
    };
  }

  private static formatACIShipment(shipment: Shipment, commodities: Commodity[]) {
    return {
      ...this.formatACEShipment(shipment, commodities),
      data: 'ACI_SHIPMENT'
    };
  }

  private static formatParty(
    name: string,
    addressLine: string,
    city: string,
    stateProvince: string,
    postalCode: string
  ) {
    return {
      name,
      address: {
        addressLine,
        city,
        stateProvince,
        postalCode
      }
    };
  }

  private static formatCommodity(commodity: Commodity) {
    return {
      description: commodity.description,
      quantity: commodity.quantity,
      packagingUnit: commodity.packaging_unit,
      weight: commodity.weight,
      weightUnit: commodity.weight_unit
    };
  }

  private static generateSendId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
} 