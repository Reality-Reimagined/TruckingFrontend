// BorderConnect specific types
export interface BorderConnectAddress {
  addressLine: string;
  city: string;
  stateProvince: string;
  postalCode: string;
}

export interface BorderConnectParty {
  name: string;
  address: BorderConnectAddress;
}

export interface BorderConnectLicensePlate {
  number: string;
  stateProvince: string;
}

export interface BorderConnectVehicle {
  number: string;
  type: 'TR' | 'TL';
  vinNumber: string;
  licensePlate: BorderConnectLicensePlate;
  dotNumber?: string;
  insurancePolicy?: {
    insuranceCompanyName: string;
    policyNumber: string;
    issuedDate: string;
    policyAmount: number;
  };
}

export interface BorderConnectDriver {
  driverNumber: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  citizenshipCountry: string;
  fastCardNumber?: string;
  travelDocuments?: Array<{
    number: string;
    type: string;
    stateProvince: string;
  }>;
}

export interface BorderConnectCommodity {
  description: string;
  quantity: number;
  packagingUnit: string;
  weight: number;
  weightUnit: string;
  loadedOn?: {
    type: 'TRUCK' | 'TRAILER';
    number: string;
  };
}

export interface BorderConnectManifest {
  data: 'ACE_TRIP' | 'ACI_TRIP';
  sendId: string;
  companyKey: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  tripNumber: string;
  usPortOfArrival?: string;
  portOfEntry?: string;
  estimatedArrivalDateTime: string;
  truck: BorderConnectVehicle;
  trailers?: BorderConnectVehicle[];
  drivers: BorderConnectDriver[];
  shipments: Array<{
    data: 'ACE_SHIPMENT' | 'ACI_SHIPMENT';
    sendId: string;
    companyKey: string;
    operation: 'CREATE';
    type: string;
    shipmentControlNumber: string;
    provinceOfLoading?: string;
    shipper: BorderConnectParty;
    consignee: BorderConnectParty;
    commodities: BorderConnectCommodity[];
  }>;
  autoSend: boolean;
} 