from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, date
from app.schemas.medicine import MedicationLogCreate, MedicationLogResponse
from app.api.deps import require_role
from app.db.connection import get_db_connection
from app.api.medicines import get_patient_id

router = APIRouter()

@router.get("/today")
def get_todays_reminders(current_user: dict = Depends(require_role("PATIENT"))):
    """
    Fetch all scheduled medications for the current day for the logged-in patient.
    Also returns their status if they've been logged already today.
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = get_patient_id(current_user["id"], cur)
            today = date.today()
            
            # Fetch schedules where today is within start_date and end_date (or end_date is null)
            cur.execute(
                """
                SELECT ms.id, ms.time_of_day, ms.frequency, m.name, m.strength, m.form, m.id as medicine_id
                FROM medication_schedules ms
                JOIN medicines m ON ms.medicine_id = m.id
                WHERE m.patient_id = %s 
                AND ms.start_date <= %s
                AND (ms.end_date IS NULL OR ms.end_date >= %s)
                ORDER BY ms.time_of_day ASC
                """,
                (patient_id, today, today)
            )
            schedules = cur.fetchall()
            
            reminders = []
            for sch in schedules:
                schedule_id = sch[0]
                
                # Check if there's a log for this schedule today
                cur.execute(
                    """
                    SELECT status, action_time 
                    FROM medication_logs 
                    WHERE schedule_id = %s 
                    AND DATE(scheduled_time) = %s
                    ORDER BY action_time DESC LIMIT 1
                    """,
                    (schedule_id, today)
                )
                log = cur.fetchone()
                
                reminders.append({
                    "schedule_id": schedule_id,
                    "medicine_id": sch[6],
                    "time_of_day": sch[1],
                    "frequency": sch[2],
                    "medicine_name": sch[3],
                    "medicine_strength": sch[4],
                    "medicine_form": sch[5],
                    "status": log[0] if log else "PENDING",
                    "action_time": log[1] if log else None
                })
                
            return reminders

@router.post("/{schedule_id}/log", response_model=MedicationLogResponse, status_code=status.HTTP_201_CREATED)
def log_medication(
    schedule_id: str,
    log_in: MedicationLogCreate,
    current_user: dict = Depends(require_role("PATIENT"))
):
    """
    Log a medication as TAKEN, MISSED, or SNOOZED.
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = get_patient_id(current_user["id"], cur)
            
            # Verify schedule belongs to this patient
            cur.execute(
                """
                SELECT ms.id 
                FROM medication_schedules ms
                JOIN medicines m ON ms.medicine_id = m.id
                WHERE ms.id = %s AND m.patient_id = %s
                """,
                (schedule_id, patient_id)
            )
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Schedule not found")
                
            cur.execute(
                """
                INSERT INTO medication_logs (schedule_id, status, scheduled_time)
                VALUES (%s, %s, %s)
                RETURNING id, schedule_id, status, scheduled_time, action_time
                """,
                (
                    schedule_id,
                    log_in.status,
                    log_in.scheduled_time
                )
            )
            new_log = cur.fetchone()
            conn.commit()
            
            return {
                "id": new_log[0],
                "schedule_id": new_log[1],
                "status": new_log[2],
                "scheduled_time": new_log[3],
                "action_time": new_log[4]
            }
