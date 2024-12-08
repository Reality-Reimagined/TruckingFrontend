from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, UUID4

class Driver(BaseModel):
    id: UUID4
    user_id: UUID4
    driver_number: str
    first_name: str
    last_name: str
    gender: str
    date_of_birth: datetime
    citizenship_country: str
    fast_card_number: Optional[str]
    created_at: datetime
    updated_at: datetime

class Vehicle(BaseModel):
    id: UUID4
    user_id: UUID4
    number: str
    type: str
    vin_number: str
    dot_number: Optional[str]
    license_plate_number: str
    license_plate_state: str
    created_at: datetime
    updated_at: datetime

class Insurance(BaseModel):
    id: UUID4
    vehicle_id: UUID4
    company_name: str
    policy_number: str
    issued_date: datetime
    policy_amount: float
    created_at: datetime
    updated_at: datetime

class Manifest(BaseModel):
    id: UUID4
    user_id: UUID4
    manifest_type: str
    trip_number: str
    port_of_entry: str
    estimated_arrival: datetime
    status: str
    created_at: datetime
    updated_at: datetime