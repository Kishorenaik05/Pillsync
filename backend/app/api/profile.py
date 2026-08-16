import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.security import get_password_hash, verify_password
from app.api.deps import require_role, get_current_active_user
from app.api.medicines import get_patient_id
from app.db.connection import get_db_connection

router = APIRouter()

UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _get_or_create_profile(user_id, cur):
    """Return profile row, auto-creating if missing."""
    cur.execute(
        "SELECT id, first_name, last_name, phone, emergency_contact_name, emergency_contact_phone FROM patient_profiles WHERE user_id = %s",
        (user_id,)
    )
    return cur.fetchone()


@router.get("/")
def get_profile(current_user: dict = Depends(get_current_active_user)):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            row = _get_or_create_profile(current_user["id"], cur)
            if not row:
                return {
                    "name": "",
                    "phone": "",
                    "emergency_contact_name": "",
                    "emergency_contact_phone": "",
                    "notifications_enabled": True,
                    "email_notifications": True,
                    "sms_notifications": False,
                    "language": "en",
                }
            first = row[1] or ""
            last  = row[2] or ""
            full_name = f"{first} {last}".strip()
            return {
                "name": full_name,
                "phone": row[3] or "",
                "emergency_contact_name": row[4] or "",
                "emergency_contact_phone": row[5] or "",
                "notifications_enabled": True,
                "email_notifications": True,
                "sms_notifications": False,
                "language": "en",
            }


@router.put("/")
def update_profile(payload: dict, current_user: dict = Depends(get_current_active_user)):
    name  = payload.get("name", "").strip()
    parts = name.split(" ", 1)
    first_name = parts[0]
    last_name  = parts[1] if len(parts) > 1 else ""
    phone = payload.get("phone", "")
    ec_name  = payload.get("emergency_contact_name", "")
    ec_phone = payload.get("emergency_contact_phone", "")

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM patient_profiles WHERE user_id = %s", (current_user["id"],))
            existing = cur.fetchone()
            if existing:
                cur.execute(
                    """
                    UPDATE patient_profiles
                    SET first_name = %s, last_name = %s,
                        phone = %s,
                        emergency_contact_name = %s, emergency_contact_phone = %s
                    WHERE user_id = %s
                    """,
                    (first_name, last_name, phone, ec_name, ec_phone, current_user["id"])
                )
            else:
                cur.execute(
                    """
                    INSERT INTO patient_profiles
                        (user_id, first_name, last_name, date_of_birth, gender, blood_group,
                         phone, emergency_contact_name, emergency_contact_phone)
                    VALUES (%s, %s, %s, '2000-01-01', 'Other', 'Unknown', %s, %s, %s)
                    """,
                    (current_user["id"], first_name, last_name, phone, ec_name, ec_phone)
                )
            conn.commit()
    return {"success": True}


@router.put("/settings")
def update_settings(payload: dict, current_user: dict = Depends(get_current_active_user)):
    # Settings stored in profile table extras; for now just return success
    return {"success": True}


@router.post("/change-password")
def change_password(payload: dict, current_user: dict = Depends(get_current_active_user)):
    current_pw  = payload.get("current_password")
    new_pw      = payload.get("new_password")
    if not current_pw or not new_pw:
        raise HTTPException(status_code=400, detail="current_password and new_password required")
    if len(new_pw) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT hashed_password FROM users WHERE id = %s", (current_user["id"],))
            row = cur.fetchone()
            if not row or not verify_password(current_pw, row[0]):
                raise HTTPException(status_code=400, detail="Current password is incorrect")

            new_hash = get_password_hash(new_pw)
            cur.execute("UPDATE users SET hashed_password = %s WHERE id = %s", (new_hash, current_user["id"]))
            conn.commit()
    return {"success": True}


@router.post("/avatar")
async def update_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB")

    with open(filepath, "wb") as f:
        f.write(contents)

    url = f"/uploads/avatars/{filename}"
    return {"profile_picture": url}
