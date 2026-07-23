import json
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.medicine import MedicineCreate, MedicineResponse, MedicineWithSchedules, MedicationScheduleCreate, MedicationScheduleResponse
from app.api.deps import require_role
from app.db.connection import get_db_connection

router = APIRouter()

def get_patient_id(user_id: str, cur):
    cur.execute("SELECT id FROM patient_profiles WHERE user_id = %s", (user_id,))
    profile = cur.fetchone()
    if not profile:
        raise HTTPException(status_code=400, detail="Patient profile not found. Please create one first.")
    return profile[0]

@router.post("/", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def create_medicine(
    medicine_in: MedicineCreate,
    current_user: dict = Depends(require_role("PATIENT"))
):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = get_patient_id(current_user["id"], cur)
            
            cur.execute(
                """
                INSERT INTO medicines (patient_id, name, form, strength, quantity_in_stock)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, patient_id, name, form, strength, quantity_in_stock, created_at, updated_at
                """,
                (
                    patient_id,
                    medicine_in.name,
                    medicine_in.form,
                    medicine_in.strength,
                    medicine_in.quantity_in_stock
                )
            )
            new_medicine = cur.fetchone()
            conn.commit()
            
            return {
                "id": new_medicine[0],
                "patient_id": new_medicine[1],
                "name": new_medicine[2],
                "form": new_medicine[3],
                "strength": new_medicine[4],
                "quantity_in_stock": new_medicine[5],
                "created_at": new_medicine[6],
                "updated_at": new_medicine[7]
            }

@router.get("/", response_model=list[MedicineWithSchedules])
def get_medicines(current_user: dict = Depends(require_role("PATIENT"))):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = get_patient_id(current_user["id"], cur)
            
            cur.execute(
                """
                SELECT id, patient_id, name, form, strength, quantity_in_stock, created_at, updated_at
                FROM medicines
                WHERE patient_id = %s
                ORDER BY created_at DESC
                """,
                (patient_id,)
            )
            medicines = cur.fetchall()
            
            result = []
            for med in medicines:
                med_dict = {
                    "id": med[0],
                    "patient_id": med[1],
                    "name": med[2],
                    "form": med[3],
                    "strength": med[4],
                    "quantity_in_stock": med[5],
                    "created_at": med[6],
                    "updated_at": med[7],
                    "schedules": [] # We can fetch schedules if needed, keeping it empty for now or query them
                }
                
                # Fetch schedules for this medicine
                cur.execute(
                    """
                    SELECT id, medicine_id, frequency, time_of_day, start_date, end_date, created_at
                    FROM medication_schedules
                    WHERE medicine_id = %s
                    """,
                    (med_dict["id"],)
                )
                schedules = cur.fetchall()
                for sch in schedules:
                    med_dict["schedules"].append({
                        "id": sch[0],
                        "medicine_id": sch[1],
                        "frequency": sch[2],
                        "time_of_day": sch[3],
                        "start_date": sch[4],
                        "end_date": sch[5],
                        "created_at": sch[6]
                    })
                    
                result.append(med_dict)
                
            return result

@router.post("/{medicine_id}/schedules", response_model=MedicationScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(
    medicine_id: str,
    schedule_in: MedicationScheduleCreate,
    current_user: dict = Depends(require_role("PATIENT"))
):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = get_patient_id(current_user["id"], cur)
            
            # Verify medicine belongs to patient
            cur.execute("SELECT id FROM medicines WHERE id = %s AND patient_id = %s", (medicine_id, patient_id))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Medicine not found")
                
            cur.execute(
                """
                INSERT INTO medication_schedules (medicine_id, frequency, time_of_day, start_date, end_date)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, medicine_id, frequency, time_of_day, start_date, end_date, created_at
                """,
                (
                    medicine_id,
                    schedule_in.frequency,
                    schedule_in.time_of_day,
                    schedule_in.start_date,
                    schedule_in.end_date
                )
            )
            new_schedule = cur.fetchone()
            conn.commit()
            
            return {
                "id": new_schedule[0],
                "medicine_id": new_schedule[1],
                "frequency": new_schedule[2],
                "time_of_day": new_schedule[3],
                "start_date": new_schedule[4],
                "end_date": new_schedule[5],
                "created_at": new_schedule[6]
            }
