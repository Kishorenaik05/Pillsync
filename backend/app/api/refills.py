from fastapi import APIRouter, Depends, HTTPException
from datetime import date, timedelta
from app.api.deps import require_role
from app.api.medicines import get_patient_id
from app.db.connection import get_db_connection

router = APIRouter()


@router.get("/")
def get_refills(current_user: dict = Depends(require_role("PATIENT"))):
    """
    Returns refill status for every medicine the patient has.
    Uses quantity_in_stock from the medicines table.
    Daily dosage is derived from the number of scheduled doses per day.
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            try:
                patient_id = get_patient_id(current_user["id"], cur)
            except HTTPException:
                return []

            today = date.today()

            # Fetch all medicines for this patient
            cur.execute(
                """
                SELECT m.id, m.name, m.strength, m.quantity_in_stock
                FROM medicines m
                WHERE m.patient_id = %s
                ORDER BY m.name ASC
                """,
                (patient_id,)
            )
            medicines = cur.fetchall()

            result = []
            for med in medicines:
                med_id, med_name, strength, qty_in_stock = med
                qty_in_stock = qty_in_stock or 0

                # Count active schedule entries = doses per day
                cur.execute(
                    """
                    SELECT COUNT(*) FROM medication_schedules
                    WHERE medicine_id = %s
                      AND start_date <= %s
                      AND (end_date IS NULL OR end_date >= %s)
                    """,
                    (med_id, today, today)
                )
                daily_dosage = cur.fetchone()[0] or 1  # at least 1 to avoid division by zero

                remaining_days = int(qty_in_stock / daily_dosage)
                alert_threshold = 7  # days
                needs_refill = remaining_days <= alert_threshold
                refill_date = str(today + timedelta(days=remaining_days))

                result.append({
                    "id": str(med_id),
                    "medicine_id": str(med_id),
                    "medicine_name": med_name,
                    "strength": strength or "",
                    "remaining_stock": qty_in_stock,
                    "daily_dosage": daily_dosage,
                    "remaining_days": remaining_days,
                    "alert_threshold": alert_threshold,
                    "needs_refill": needs_refill,
                    "refill_date": refill_date,
                })
            return result


@router.put("/{medicine_id}")
def update_refill(
    medicine_id: str,
    payload: dict,
    current_user: dict = Depends(require_role("PATIENT"))
):
    """Update remaining stock and daily dosage for a medicine."""
    remaining_stock = payload.get("remaining_stock")
    if remaining_stock is None:
        raise HTTPException(status_code=400, detail="remaining_stock is required")

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = get_patient_id(current_user["id"], cur)
            cur.execute(
                "SELECT id FROM medicines WHERE id = %s AND patient_id = %s",
                (medicine_id, patient_id)
            )
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Medicine not found")

            cur.execute(
                "UPDATE medicines SET quantity_in_stock = %s WHERE id = %s",
                (int(remaining_stock), medicine_id)
            )
            conn.commit()
    return {"success": True}
