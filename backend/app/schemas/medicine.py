from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, time, datetime
from uuid import UUID

# Medicines
class MedicineBase(BaseModel):
    name: str
    form: Optional[str] = None
    strength: Optional[str] = None
    quantity_in_stock: Optional[int] = 0

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    form: Optional[str] = None
    strength: Optional[str] = None
    quantity_in_stock: Optional[int] = None

class MedicineResponse(MedicineBase):
    id: UUID
    patient_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Schedules
class MedicationScheduleBase(BaseModel):
    frequency: str
    time_of_day: time
    start_date: date
    end_date: Optional[date] = None

class MedicationScheduleCreate(MedicationScheduleBase):
    pass

class MedicationScheduleResponse(MedicationScheduleBase):
    id: UUID
    medicine_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Logs
class MedicationLogBase(BaseModel):
    status: str # TAKEN, MISSED, SNOOZED
    scheduled_time: datetime

class MedicationLogCreate(MedicationLogBase):
    pass

class MedicationLogResponse(MedicationLogBase):
    id: UUID
    schedule_id: UUID
    action_time: datetime

    class Config:
        from_attributes = True

# Aggregated Response for dashboard
class MedicineWithSchedules(MedicineResponse):
    schedules: List[MedicationScheduleResponse] = []
