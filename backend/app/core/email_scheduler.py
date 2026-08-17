import logging
import resend
from datetime import datetime, date, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from app.db.connection import get_db_connection
from app.core.config import settings

logger = logging.getLogger(__name__)

# In-memory set to avoid sending duplicate emails in the same session
# Key: (schedule_id, date_str)  e.g. ("42", "2026-08-16")
_sent_today: set = set()


def _build_html(user_name: str, medicine_name: str, strength: str, form: str, reminder_time: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }}
    .container {{ max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 12px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #6366f1, #a855f7); padding: 32px 28px; text-align: center; }}
    .header h1 {{ color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px; }}
    .header p  {{ color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }}
    .body {{ padding: 32px 28px; }}
    .pill-card {{ background: #f0f4ff; border-left: 4px solid #6366f1; border-radius: 8px;
                  padding: 18px 20px; margin: 20px 0; }}
    .pill-card h2 {{ margin: 0 0 6px; color: #1e1b4b; font-size: 20px; }}
    .pill-card p  {{ margin: 4px 0; color: #4b5563; font-size: 14px; }}
    .time-badge {{ display: inline-block; background: #6366f1; color: #fff;
                   border-radius: 20px; padding: 6px 16px; font-size: 15px;
                   font-weight: bold; margin: 8px 0; }}
    .footer {{ background: #f9fafb; text-align: center; padding: 18px;
               color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💊 PillSync</h1>
      <p>Medicine Reminder</p>
    </div>
    <div class="body">
      <p style="color:#374151;font-size:15px;">Hi <strong>{user_name}</strong>,</p>
      <p style="color:#6b7280;font-size:14px;">
        This is a friendly reminder that it's almost time to take your medicine:
      </p>
      <div class="pill-card">
        <h2>{medicine_name}</h2>
        <p>💊 Strength: <strong>{strength or "—"}</strong></p>
        <p>🔷 Form: <strong>{form or "—"}</strong></p>
      </div>
      <p style="color:#374151;font-size:14px;">Scheduled time:</p>
      <div class="time-badge">⏰ {reminder_time}</div>
      <p style="color:#9ca3af;font-size:13px;margin-top:24px;">
        Please take your medicine on time. Stay healthy! 💪
      </p>
    </div>
    <div class="footer">
      PillSync — Your Smart Medication Assistant<br>
      This is an automated reminder. Do not reply to this email.
    </div>
  </div>
</body>
</html>
"""


def _send_email(to_email: str, to_name: str, medicine_name: str, strength: str, form: str, reminder_time: str):
    """Send a single reminder email via Gmail SMTP."""
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured — skipping email send.")
        return

    resend.api_key = settings.RESEND_API_KEY
    html_body = _build_html(to_name or to_email, medicine_name, strength, form, reminder_time)

    try:
<<<<<<< HEAD
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, [to_email], msg.as_string())
=======
        params = resend.Emails.SendParams(
            from_=f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_ADDRESS}>",
            to=[to_email],
            subject=f"💊 PillSync Reminder: Take {medicine_name} at {reminder_time}",
            html=html_body,
        )
        resend.Emails.send(params)
>>>>>>> milestone_04
        logger.info(f"Reminder email sent to {to_email} for medicine '{medicine_name}' at {reminder_time}")
    except Exception as exc:
        logger.error(f"Failed to send reminder email to {to_email}: {exc}", exc_info=True)


def _check_and_send_reminders():
    """
    Runs every minute. Finds medicine schedules whose time is within the next
    5 minutes (±1 min window) and sends an email reminder if not already sent today.
    """
    today = date.today()
    now = datetime.now()
    # ±1 min window centred on now+5min → catches any schedule in the 4–6 min ahead range
    window_start = (now + timedelta(minutes=4)).time()
    window_end   = (now + timedelta(minutes=6)).time()

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # IMPORTANT: medicines.patient_id = patient_profiles.id (not users.id)
                # So we join patient_profiles first, then users via patient_profiles.user_id
                cur.execute(
                    """
                    SELECT
                        ms.id            AS schedule_id,
                        ms.time_of_day,
                        m.name           AS medicine_name,
                        m.strength,
                        m.form,
                        u.email,
                        COALESCE(pp.first_name, u.email) AS user_name
                    FROM medication_schedules ms
                    JOIN medicines m         ON ms.medicine_id = m.id
                    JOIN patient_profiles pp ON pp.id = m.patient_id
                    JOIN users u             ON u.id = pp.user_id
                    WHERE ms.start_date <= %s
                      AND (ms.end_date IS NULL OR ms.end_date >= %s)
                      AND ms.time_of_day >= %s
                      AND ms.time_of_day <= %s
                    """,
                    (today, today, window_start, window_end)
                )
                rows = cur.fetchall()
    except Exception as exc:
        logger.error(f"Email scheduler DB error: {exc}")
        return

    logger.info(f"Email scheduler: checked window {window_start}–{window_end}, found {len(rows)} schedule(s)")

    for row in rows:
        schedule_id, time_of_day, medicine_name, strength, form, email, user_name = row
        key = (str(schedule_id), str(today))
        if key in _sent_today:
            logger.debug(f"Skipping already-sent reminder {key}")
            continue

        reminder_time = time_of_day.strftime("%H:%M")
        logger.info(f"Sending reminder email to {email} for '{medicine_name}' at {reminder_time}")
        _send_email(email, user_name, medicine_name, strength or "", form or "", reminder_time)
        _sent_today.add(key)

    # Purge yesterday's entries to keep memory clean
    yesterday = str(today - timedelta(days=1))
    stale = {k for k in _sent_today if k[1] == yesterday}
    _sent_today.difference_update(stale)



def start_email_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(_check_and_send_reminders, "interval", seconds=60, id="email_reminders")
    scheduler.start()
    logger.info("📧 Email reminder scheduler started (checking every 60 seconds)")
    return scheduler
