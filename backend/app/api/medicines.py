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

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_medicine(
    payload: dict,
    current_user: dict = Depends(require_role("PATIENT"))
):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                patient_id = get_patient_id(current_user["id"], cur)
            except HTTPException:
                cur.execute(
                    """
                    INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, blood_group, medical_history)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (current_user["id"], "User", "", "2000-01-01", "Other", "Unknown", "[]")
                )
                patient_id = cur.fetchone()[0]

            name = payload.get("name")
            if not name:
                raise HTTPException(status_code=400, detail="Medicine name is required")
                
            dosage = payload.get("dosage") or payload.get("strength")
            quantity = payload.get("quantity") or payload.get("quantity_in_stock") or 0
            form_val = payload.get("instructions") or payload.get("form") or ""
            
            cur.execute(
                """
                INSERT INTO medicines (patient_id, name, strength, quantity_in_stock, form)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, patient_id, name, form, strength, quantity_in_stock, created_at, updated_at
                """,
                (patient_id, name, dosage, int(quantity), form_val)
            )
            med_row = cur.fetchone()
            medicine_id = med_row[0]
            
            # If payload has scheduling fields (Pattern A)
            frequency = payload.get("frequency")
            start_date = payload.get("start_date")
            if frequency and start_date:
                import re
                times = []
                m = re.match(r'^\[(.*?)\]', form_val)
                if m:
                    times = [t.strip() for t in m.group(1).split(",") if t.strip()]
                
                for t in times:
                    cur.execute(
                        """
                        INSERT INTO medication_schedules (medicine_id, frequency, time_of_day, start_date, end_date)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (medicine_id, str(frequency), f"{t}:00", start_date, payload.get("end_date") or None)
                    )
            
            conn.commit()
            
            return {
                "id": str(medicine_id),
                "patient_id": str(med_row[1]),
                "name": med_row[2],
                "form": med_row[3],
                "strength": med_row[4],
                "quantity_in_stock": med_row[5],
                "created_at": med_row[6],
                "updated_at": med_row[7]
            }

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
            row = cur.fetchone()
            conn.commit()
            
            return {
                "id": row[0],
                "medicine_id": row[1],
                "frequency": row[2],
                "time_of_day": row[3],
                "start_date": row[4],
                "end_date": row[5],
                "created_at": row[6]
            }

@router.put("/{medicine_id}")
def update_medicine(medicine_id: str, payload: dict, current_user: dict = Depends(require_role("PATIENT"))):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = get_patient_id(current_user["id"], cur)
            # Update medicine
            cur.execute(
                "UPDATE medicines SET name = %s, strength = %s, quantity_in_stock = %s, form = %s WHERE id = %s AND patient_id = %s",
                (payload.get("name"), payload.get("dosage"), payload.get("quantity", 0), payload.get("instructions", ""), medicine_id, patient_id)
            )
            # Recreate schedules
            cur.execute("DELETE FROM medication_logs WHERE schedule_id IN (SELECT id FROM medication_schedules WHERE medicine_id = %s)", (medicine_id,))
            cur.execute("DELETE FROM medication_schedules WHERE medicine_id = %s", (medicine_id,))
            
            import re
            instr = payload.get("instructions", "")
            times = []
            m = re.match(r'^\[(.*?)\]', instr)
            if m:
                times = [t.strip() for t in m.group(1).split(",") if t.strip()]
            for t in times:
                cur.execute(
                    "INSERT INTO medication_schedules (medicine_id, frequency, time_of_day, start_date, end_date) VALUES (%s, %s, %s, %s, %s)",
                    (medicine_id, payload.get("frequency", "1"), f"{t}:00", payload.get("start_date"), payload.get("end_date") or None)
                )
            conn.commit()
            return {"success": True}

@router.delete("/{medicine_id}")
def delete_medicine(medicine_id: str, current_user: dict = Depends(require_role("PATIENT"))):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = get_patient_id(current_user["id"], cur)
            cur.execute("DELETE FROM medication_logs WHERE schedule_id IN (SELECT id FROM medication_schedules WHERE medicine_id = %s)", (medicine_id,))
            cur.execute("DELETE FROM medication_schedules WHERE medicine_id = %s", (medicine_id,))
            cur.execute("DELETE FROM medicines WHERE id = %s AND patient_id = %s", (medicine_id, patient_id))
            conn.commit()
            return {"success": True}

@router.get("/")
def get_medicines_unified(current_user: dict = Depends(require_role("PATIENT"))):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                patient_id = get_patient_id(current_user["id"], cur)
            except HTTPException as e:
                return []
            
            cur.execute("SELECT id, name, strength, quantity_in_stock, form FROM medicines WHERE patient_id = %s ORDER BY created_at DESC", (patient_id,))
            medicines = cur.fetchall()
            
            result = []
            for med in medicines:
                med_dict = {
                    "id": str(med[0]),
                    "name": med[1],
                    "dosage": med[2] or "",
                    "quantity": med[3],
                    "instructions": med[4] or "",
                    "frequency": "1",
                    "start_date": "",
                    "end_date": ""
                }
                cur.execute("SELECT frequency, time_of_day, start_date, end_date FROM medication_schedules WHERE medicine_id = %s ORDER BY time_of_day", (med[0],))
                schedules = cur.fetchall()
                if schedules:
                    med_dict["frequency"] = schedules[0][0]
                    med_dict["start_date"] = str(schedules[0][2])
                    med_dict["end_date"] = str(schedules[0][3]) if schedules[0][3] else ""
                
                result.append(med_dict)
            return result
