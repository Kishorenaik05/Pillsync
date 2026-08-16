from fastapi import APIRouter, Depends, HTTPException
from datetime import date, timedelta
from app.api.deps import require_role
from app.api.medicines import get_patient_id
from app.db.connection import get_db_connection

router = APIRouter()


def _get_patient_id_safe(current_user, cur):
    try:
        return get_patient_id(current_user["id"], cur)
    except HTTPException:
        return None


@router.get("/summary")
def get_summary(current_user: dict = Depends(require_role("PATIENT"))):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = _get_patient_id_safe(current_user, cur)
            if not patient_id:
                return {"total_doses": 0, "taken": 0, "missed": 0, "adherence_percentage": 0}

            cur.execute(
                """
                SELECT
                    COUNT(*)                                                      AS total,
                    SUM(CASE WHEN ml.status = 'TAKEN'  THEN 1 ELSE 0 END)        AS taken,
                    SUM(CASE WHEN ml.status = 'MISSED' THEN 1 ELSE 0 END)        AS missed
                FROM medication_logs ml
                JOIN medication_schedules ms ON ml.schedule_id = ms.id
                JOIN medicines m             ON ms.medicine_id  = m.id
                WHERE m.patient_id = %s
                """,
                (patient_id,)
            )
            row = cur.fetchone()
            total  = row[0] or 0
            taken  = row[1] or 0
            missed = row[2] or 0
            adherence = round((taken / total * 100) if total > 0 else 0)
            return {
                "total_doses": total,
                "taken": taken,
                "missed": missed,
                "adherence_percentage": adherence,
            }


@router.get("/daily")
def get_daily(current_user: dict = Depends(require_role("PATIENT"))):
    """Last 7 days of taken / missed per day."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = _get_patient_id_safe(current_user, cur)
            if not patient_id:
                return []

            today = date.today()
            rows = []
            for i in range(6, -1, -1):
                day = today - timedelta(days=i)
                cur.execute(
                    """
                    SELECT
                        SUM(CASE WHEN ml.status = 'TAKEN'  THEN 1 ELSE 0 END),
                        SUM(CASE WHEN ml.status = 'MISSED' THEN 1 ELSE 0 END)
                    FROM medication_logs ml
                    JOIN medication_schedules ms ON ml.schedule_id = ms.id
                    JOIN medicines m             ON ms.medicine_id  = m.id
                    WHERE m.patient_id = %s
                      AND DATE(ml.scheduled_time) = %s
                    """,
                    (patient_id, day)
                )
                r = cur.fetchone()
                rows.append({
                    "date": day.strftime("%d %b"),
                    "taken":  r[0] or 0,
                    "missed": r[1] or 0,
                })
            return rows


@router.get("/weekly")
def get_weekly(current_user: dict = Depends(require_role("PATIENT"))):
    """Last 4 weeks of taken / missed per week."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = _get_patient_id_safe(current_user, cur)
            if not patient_id:
                return []

            today = date.today()
            rows = []
            for i in range(3, -1, -1):
                week_end   = today - timedelta(weeks=i)
                week_start = week_end - timedelta(days=6)
                cur.execute(
                    """
                    SELECT
                        SUM(CASE WHEN ml.status = 'TAKEN'  THEN 1 ELSE 0 END),
                        SUM(CASE WHEN ml.status = 'MISSED' THEN 1 ELSE 0 END)
                    FROM medication_logs ml
                    JOIN medication_schedules ms ON ml.schedule_id = ms.id
                    JOIN medicines m             ON ms.medicine_id  = m.id
                    WHERE m.patient_id = %s
                      AND DATE(ml.scheduled_time) BETWEEN %s AND %s
                    """,
                    (patient_id, week_start, week_end)
                )
                r = cur.fetchone()
                rows.append({
                    "week":   week_start.strftime("%d %b"),
                    "taken":  r[0] or 0,
                    "missed": r[1] or 0,
                })
            return rows


@router.get("/monthly")
def get_monthly(current_user: dict = Depends(require_role("PATIENT"))):
    """Last 6 months of taken / missed."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            patient_id = _get_patient_id_safe(current_user, cur)
            if not patient_id:
                return []

            today = date.today()
            rows = []
            for i in range(5, -1, -1):
                # Go back i months
                month = today.replace(day=1) - timedelta(days=i * 30)
                month_start = month.replace(day=1)
                next_month  = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
                month_end   = next_month - timedelta(days=1)

                cur.execute(
                    """
                    SELECT
                        SUM(CASE WHEN ml.status = 'TAKEN'  THEN 1 ELSE 0 END),
                        SUM(CASE WHEN ml.status = 'MISSED' THEN 1 ELSE 0 END)
                    FROM medication_logs ml
                    JOIN medication_schedules ms ON ml.schedule_id = ms.id
                    JOIN medicines m             ON ms.medicine_id  = m.id
                    WHERE m.patient_id = %s
                      AND DATE(ml.scheduled_time) BETWEEN %s AND %s
                    """,
                    (patient_id, month_start, month_end)
                )
                r = cur.fetchone()
                rows.append({
                    "month":  month_start.strftime("%b %Y"),
                    "taken":  r[0] or 0,
                    "missed": r[1] or 0,
                })
            return rows
