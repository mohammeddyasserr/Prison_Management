from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
import os
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "dummy_user"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "dummy_password"),
    MAIL_FROM=os.getenv("MAIL_FROM", "test@test.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fm = FastMail(conf)

async def visit_requested_email(email: EmailStr, visitor_name: str, inmate_name: str, visit_date: str, prison_name: str):
    html = f"""
    <p>Dear {visitor_name},</p>
    <p>Thank you for submitting a request to visit inmate <strong>{inmate_name}</strong>.</p>
    <p>Your visit request for <strong>{visit_date}</strong> has been received and is currently pending approval. We will notify you once a decision has been made.</p>
    <p>If you have any questions, please contact us.</p>
    <br>
    <p>Best regards,</p>
    <p>{prison_name} Administration</p>
    """

    message = MessageSchema(
        subject="Visit Requested Successfully",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    await fm.send_message(message)

async def visit_confirmed_email(email: EmailStr, visitor_name: str, inmate_name: str, visit_date: str, visit_time: str, prison_name: str):
    html = f"""
    <p>Dear {visitor_name},</p>
    <p>We are pleased to inform you that your request to visit inmate <strong>{inmate_name}</strong> has been approved.</p>
    <p><strong>Visit Details:</strong></p>
    <ul>
        <li><strong>Date:</strong> {visit_date}</li>
        <li><strong>Time:</strong> {visit_time}</li>
        <li><strong>Location:</strong> {prison_name}</li>
    </ul>
    <p>Please make sure to arrive at least 15 minutes before your scheduled time and bring a valid ID for verification.</p>
    <p>Kindly follow all facility rules and regulations during your visit.</p>
    <p>If you have any questions or need to reschedule, please contact us.</p>
    <br>
    <p>Best regards,</p>
    <p>{prison_name} Administration</p>
    """

    message = MessageSchema(
        subject="Visit Confirmed",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    await fm.send_message(message)

async def visit_rejected_email(email: EmailStr, visitor_name: str, inmate_name: str, prison_name: str, reason: str = ""):
    reason_html = f"<p><strong>Reason:</strong> {reason}</p>" if reason else ""
    html = f"""
    <p>Dear {visitor_name},</p>
    <p>Thank you for your request to visit inmate <strong>{inmate_name}</strong>.</p>
    <p>We regret to inform you that your visit request has been declined.</p>
    {reason_html}
    <p>You may submit a new request for a different date or contact the administration for further clarification.</p>
    <p>We appreciate your understanding.</p>
    <br>
    <p>Best regards,</p>
    <p>{prison_name} Administration</p>
    """

    message = MessageSchema(
        subject="Visit Rejected",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    await fm.send_message(message)
