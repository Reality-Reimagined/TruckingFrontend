from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class ManifestRequest(BaseModel):
    manifest_type: str
    border_crossing: str
    crossing_time: datetime

class DriverBase(BaseModel):
    driver_number: str
    first_name: str
    last_name: str
    gender: str
    date_of_birth: datetime
    citizenship_country: str
    fast_card_number: Optional[str] = None

class DriverCreate(DriverBase):
    pass

class Driver(DriverBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ManifestResponse(BaseModel):
    status: str
    message: str
    trip_number: Optional[str] = None
    errors: Optional[List[dict]] = None
    datetime: datetime

class BorderConnectRequest(BaseModel):
    data: str
    sendId: str
    companyKey: str
    operation: str
    tripNumber: str
    portOfEntry: str
    estimatedArrivalDateTime: str
    autoSend: bool = False