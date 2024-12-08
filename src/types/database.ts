// Base types for common fields
interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

// User related types
export interface User extends BaseRecord {
  company_name: string | null;
  company_address: string | null;
  company_phone: string | null;
}

export interface Driver extends BaseRecord {
  user_id: string;
  driver_number: string;
  first_name: string;
  last_name: string;
  gender: 'M' | 'F';
  date_of_birth: string;
  citizenship_country: string;
  fast_card_number: string | null;
  license_number: string;
  license_state: string;
  license_expiry: string;
}

export interface Vehicle extends BaseRecord {
  user_id: string;
  number: string;
  type: 'TR' | 'TL';
  vin_number: string;
  dot_number: string | null;
  license_plate_number: string;
  license_plate_state: string;
}

export interface InsurancePolicy extends BaseRecord {
  vehicle_id: string;
  company_name: string;
  policy_number: string;
  issued_date: string;
  expiry_date: string;
  policy_amount: number;
}

export interface Manifest extends BaseRecord {
  user_id: string;
  manifest_type: 'ACE' | 'ACI';
  trip_number: string;
  port_of_entry: string;
  estimated_arrival: string;
  driver_id: string | null;
  vehicle_id: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  borderconnect_response: any | null;
}

export interface Shipment extends BaseRecord {
  manifest_id: string;
  shipment_control_number: string;
  type: string;
  province_of_loading: string;
  shipper_name: string;
  shipper_address: string;
  shipper_city: string;
  shipper_state: string;
  shipper_postal_code: string;
  consignee_name: string;
  consignee_address: string;
  consignee_city: string;
  consignee_state: string;
  consignee_postal_code: string;
}

export interface Commodity extends BaseRecord {
  shipment_id: string;
  description: string;
  quantity: number;
  packaging_unit: string;
  weight: number;
  weight_unit: string;
} 