from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import date
from uuid import UUID

class PatientProfileBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    medical_history: Optional[Any] = None

class PatientProfileCreate(PatientProfileBase):
    pass

class PatientProfileResponse(PatientProfileBase):
    id: UUID
    user_id: UUID
    model_config = ConfigDict(from_attributes=True)

class CaregiverProfileBase(BaseModel):
    first_name: str
    last_name: str
    phone_number: Optional[str] = None

class CaregiverProfileCreate(CaregiverProfileBase):
    pass

class CaregiverProfileResponse(CaregiverProfileBase):
    id: UUID
    user_id: UUID
    model_config = ConfigDict(from_attributes=True)
