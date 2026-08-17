import logging
import resend

from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_active_user
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/test-email", status_code=200)
def send_test_email(current_user: dict = Depends(get_current_active_user)):
    """
    Send a test email to the currently logged-in user's email address via Resend.
    """
    if not settings.RESEND_API_KEY:
        raise HTTPException(
            status_code=404,
            detail="RESEND_API_KEY not configured. Add it to your Render environment variables."
        )

    resend.api_key = settings.RESEND_API_KEY
    to_email = current_user["email"]

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }}
    .container {{ max-width: 500px; margin: 40px auto; background: #fff;
                  border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #6366f1, #a855f7); padding: 32px 28px; text-align: center; }}
    .header h1 {{ color: #fff; margin: 0; font-size: 22px; }}
    .body {{ padding: 28px; color: #374151; font-size: 15px; line-height: 1.6; }}
    .badge {{ display: inline-block; background: #d1fae5; color: #065f46;
              border-radius: 20px; padding: 6px 16px; font-weight: bold; font-size: 14px; margin: 16px 0; }}
    .footer {{ background: #f9fafb; text-align: center; padding: 16px;
               color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💊 PillSync</h1>
    </div>
    <div class="body">
      <p>Hi <strong>{to_email}</strong>,</p>
      <p>This is a <strong>test notification</strong> from PillSync to confirm that your email reminders are working correctly.</p>
      <div class="badge">✅ Email notifications are active!</div>
      <p>You will receive reminders like this <strong>5 minutes before</strong> each scheduled medicine time.</p>
      <p style="color:#6b7280;font-size:13px;">If you did not expect this email, you can safely ignore it.</p>
    </div>
    <div class="footer">
      PillSync — Your Smart Medication Assistant<br>
      This is an automated test email.
    </div>
  </div>
</body>
</html>
"""

    try:
<<<<<<< HEAD
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, [to_email], msg.as_string())
    except smtplib.SMTPAuthenticationError as exc:
        logger.error(f"SMTP Authentication failed: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="SMTP Authentication failed. Ensure your App Password is correct."
        )
    except (TimeoutError, OSError) as exc:
        logger.error(f"SMTP Timeout/OSError: {exc}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="Connection to SMTP server timed out. Render might be blocking outbound SMTP on port 587. Consider using port 465, 2525, or an alternative provider."
=======
        params = resend.Emails.SendParams(
            from_=f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_ADDRESS}>",
            to=[to_email],
            subject="✅ PillSync — Email Notifications Working!",
            html=html,
>>>>>>> milestone_04
        )
        resend.Emails.send(params)
        logger.info(f"Test email sent to {to_email} via Resend")
    except Exception as exc:
        logger.error(f"Resend email failed: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(exc)}")

    return {"status": "ok", "message": f"Test email sent to {to_email}"}
