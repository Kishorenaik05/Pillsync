import json
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.profile import PatientProfileCreate, PatientProfileResponse, CaregiverProfileCreate, CaregiverProfileResponse
from app.api.deps import require_role, get_current_active_user
from app.db.connection import get_db_connection

router = APIRouter()

# Patient Profiles
@router.post("/patient/me", response_model=PatientProfileResponse, status_code=status.HTTP_201_CREATED)
def create_patient_profile(
    profile_in: PatientProfileCreate,
    current_user: dict = Depends(require_role("PATIENT"))
):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Check if profile already exists
            cur.execute("SELECT id FROM patient_profiles WHERE user_id = %s", (current_user["id"],))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Profile already exists")
                
            cur.execute(
                """
                INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, blood_group, medical_history)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, user_id, first_name, last_name, date_of_birth, gender, blood_group, medical_history
                """,
                (
                    current_user["id"],
                    profile_in.first_name,
                    profile_in.last_name,
                    profile_in.date_of_birth,
                    profile_in.gender,
                    profile_in.blood_group,
                    json.dumps(profile_in.medical_history) if profile_in.medical_history else None
                )
            )
            new_profile = cur.fetchone()
            conn.commit()
            return {
                "id": new_profile[0],
                "user_id": new_profile[1],
                "first_name": new_profile[2],
                "last_name": new_profile[3],
                "date_of_birth": new_profile[4],
                "gender": new_profile[5],
                "blood_group": new_profile[6],
                "medical_history": new_profile[7]
            }

@router.get("/patient/me", response_model=PatientProfileResponse)
def get_patient_profile(current_user: dict = Depends(require_role("PATIENT"))):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, user_id, first_name, last_name, date_of_birth, gender, blood_group, medical_history FROM patient_profiles WHERE user_id = %s", (current_user["id"],))
            profile = cur.fetchone()
            if not profile:
                raise HTTPException(status_code=404, detail="Profile not found")
            return {
                "id": profile[0],
                "user_id": profile[1],
                "first_name": profile[2],
                "last_name": profile[3],
                "date_of_birth": profile[4],
                "gender": profile[5],
                "blood_group": profile[6],
                "medical_history": profile[7]
            }


# Caregiver Profiles
@router.post("/caregiver/me", response_model=CaregiverProfileResponse, status_code=status.HTTP_201_CREATED)
def create_caregiver_profile(
    profile_in: CaregiverProfileCreate,
    current_user: dict = Depends(require_role("CAREGIVER"))
):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM caregiver_profiles WHERE user_id = %s", (current_user["id"],))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Profile already exists")
                
            cur.execute(
                """
                INSERT INTO caregiver_profiles (user_id, first_name, last_name, phone_number)
                VALUES (%s, %s, %s, %s)
                RETURNING id, user_id, first_name, last_name, phone_number
                """,
                (
                    current_user["id"],
                    profile_in.first_name,
                    profile_in.last_name,
                    profile_in.phone_number
                )
            )
            new_profile = cur.fetchone()
            conn.commit()
            return {
                "id": new_profile[0],
                "user_id": new_profile[1],
                "first_name": new_profile[2],
                "last_name": new_profile[3],
                "phone_number": new_profile[4]
            }

@router.get("/caregiver/me", response_model=CaregiverProfileResponse)
def get_caregiver_profile(current_user: dict = Depends(require_role("CAREGIVER"))):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, user_id, first_name, last_name, phone_number FROM caregiver_profiles WHERE user_id = %s", (current_user["id"],))
            profile = cur.fetchone()
            if not profile:
                raise HTTPException(status_code=404, detail="Profile not found")
            return {
                "id": profile[0],
                "user_id": profile[1],
                "first_name": profile[2],
                "last_name": profile[3],
                "phone_number": profile[4]
            }
