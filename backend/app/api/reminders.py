from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, date, timedelta
from app.schemas.medicine import MedicationLogCreate, MedicationLogResponse
from app.api.deps import require_role
from app.db.connection import get_db_connection
from app.api.medicines import get_patient_id

router = APIRouter()

@router.get("/today")
def get_todays_reminders(current_user: dict = Depends(require_role("PATIENT"))):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                patient_id = get_patient_id(current_user["id"], cur)
            except HTTPException as e:
                if e.status_code == 400:
                    return []
                raise e
            
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
                
                time_of_day = sch[1]
                hour = time_of_day.hour
                if 5 <= hour < 12:
                    period = "morning"
                elif 12 <= hour < 17:
                    period = "afternoon"
                elif 17 <= hour < 20:
                    period = "evening"
                else:
                    period = "night"
                
                reminders.append({
                    "id": str(schedule_id),
                    "schedule_id": str(schedule_id),
                    "medicine_id": str(sch[6]),
                    "time_of_day": str(time_of_day),
                    "reminder_time": time_of_day.strftime("%H:%M"),
                    "date": str(today),
                    "frequency": sch[2],
                    "medicine_name": sch[3],
                    "medicine_strength": sch[4],
                    "medicine_form": sch[5],
                    "status": log[0].lower() if log else "pending",
                    "period": period,
                    "action_time": log[1] if log else None
                })
            return reminders

@router.get("/upcoming")
def get_upcoming_reminders(current_user: dict = Depends(require_role("PATIENT"))):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                patient_id = get_patient_id(current_user["id"], cur)
            except HTTPException as e:
                if e.status_code == 400:
                    return []
                raise e
            
            today = date.today()
            next_week = today + timedelta(days=7)
            
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
                (patient_id, next_week, today + timedelta(days=1))
            )
            schedules = cur.fetchall()
            
            upcoming = []
            for d in range(1, 8):
                day = today + timedelta(days=d)
                for sch in schedules:
                    time_of_day = sch[1]
                    hour = time_of_day.hour
                    if 5 <= hour < 12:
                        period = "morning"
                    elif 12 <= hour < 17:
                        period = "afternoon"
                    elif 17 <= hour < 20:
                        period = "evening"
                    else:
                        period = "night"
                        
                    upcoming.append({
                        "id": f"{sch[0]}_{day}",
                        "schedule_id": str(sch[0]),
                        "medicine_id": str(sch[6]),
                        "time_of_day": str(time_of_day),
                        "reminder_time": time_of_day.strftime("%H:%M"),
                        "date": str(day),
                        "frequency": sch[2],
                        "medicine_name": sch[3],
                        "medicine_strength": sch[4],
                        "medicine_form": sch[5],
                        "status": "pending",
                        "period": period,
                        "action_time": None
                    })
            return upcoming

@router.get("/missed")
def get_missed_reminders(current_user: dict = Depends(require_role("PATIENT"))):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                patient_id = get_patient_id(current_user["id"], cur)
            except HTTPException as e:
                if e.status_code == 400:
                    return []
                raise e
            
            today = date.today()
            current_time = datetime.now().time()
            
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
            
            missed_reminders = []
            for sch in schedules:
                schedule_id = sch[0]
                time_of_day = sch[1]
                
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
                status_val = log[0].upper() if log else "PENDING"
                
                # If status is MISSED, or status is PENDING and scheduled time has passed
                if status_val == "MISSED" or (status_val == "PENDING" and time_of_day < current_time):
                    hour = time_of_day.hour
                    if 5 <= hour < 12:
                        period = "morning"
                    elif 12 <= hour < 17:
                        period = "afternoon"
                    elif 17 <= hour < 20:
                        period = "evening"
                    else:
                        period = "night"
                        
                    missed_reminders.append({
                        "id": str(schedule_id),
                        "schedule_id": str(schedule_id),
                        "medicine_id": str(sch[6]),
                        "time_of_day": str(time_of_day),
                        "reminder_time": time_of_day.strftime("%H:%M"),
                        "date": str(today),
                        "frequency": sch[2],
                        "medicine_name": sch[3],
                        "medicine_strength": sch[4],
                        "medicine_form": sch[5],
                        "status": status_val.lower(),
                        "period": period,
                        "action_time": log[1] if log else None
                    })
            return missed_reminders

@router.patch("/{schedule_id}/status", status_code=status.HTTP_200_OK)
def update_reminder_status(
    schedule_id: str,
    payload: dict,
    current_user: dict = Depends(require_role("PATIENT"))
):
    status_val = payload.get("status")
    if not status_val or status_val.upper() not in ('TAKEN', 'MISSED', 'SNOOZED'):
        raise HTTPException(status_code=400, detail="Invalid status. Must be taken, missed, or snoozed.")
    
    status_val = status_val.upper()
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = get_patient_id(current_user["id"], cur)
            
            # Verify schedule belongs to this patient
            cur.execute(
                """
                SELECT ms.id, ms.time_of_day 
                FROM medication_schedules ms
                JOIN medicines m ON ms.medicine_id = m.id
                WHERE ms.id = %s AND m.patient_id = %s
                """,
                (schedule_id, patient_id)
            )
            schedule = cur.fetchone()
            if not schedule:
                raise HTTPException(status_code=404, detail="Schedule not found")
            
            time_of_day = schedule[1]
            today = date.today()
            scheduled_time = datetime.combine(today, time_of_day)
            
            # Check if log for today already exists
            cur.execute(
                """
                SELECT id FROM medication_logs
                WHERE schedule_id = %s AND DATE(scheduled_time) = %s
                """,
                (schedule_id, today)
            )
            log = cur.fetchone()
            if log:
                cur.execute(
                    """
                    UPDATE medication_logs 
                    SET status = %s, action_time = CURRENT_TIMESTAMP
                    WHERE id = %s
                    """,
                    (status_val, log[0])
                )
            else:
                cur.execute(
                    """
                    INSERT INTO medication_logs (schedule_id, status, scheduled_time)
                    VALUES (%s, %s, %s)
                    """,
                    (schedule_id, status_val, scheduled_time)
                )
            conn.commit()
            return {"success": True}

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_manual_reminder(
    payload: dict,
    current_user: dict = Depends(require_role("PATIENT"))
):
    medicine_id = payload.get("medicine_id")
    period = payload.get("period", "morning")
    date_val = payload.get("date")
    
    if not medicine_id or not date_val:
        raise HTTPException(status_code=400, detail="medicine_id and date are required")
        
    time_map = {
        "morning": "08:00:00",
        "afternoon": "13:00:00",
        "evening": "18:00:00",
        "night": "21:00:00"
    }
    time_str = time_map.get(period.lower(), "08:00:00")
    
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
                RETURNING id
                """,
                (medicine_id, "1", time_str, date_val, date_val)
            )
            schedule_id = cur.fetchone()[0]
            conn.commit()
            
            return {"id": str(schedule_id), "message": "Reminder created successfully"}

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
