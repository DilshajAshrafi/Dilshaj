"""
Email Dispatcher Module for Dilshaj Ashrafi's Portfolio
Delivers contact form submissions directly to dilshajashrafi@gmail.com via SMTP
"""

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

# Load configuration from environment or .env file
def load_env_file():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ.setdefault(k.strip(), v.strip())

load_env_file()

SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SENDER_EMAIL = os.environ.get('SMTP_USER', 'dilshajashrafi@gmail.com')
SENDER_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '') # 16-character Google App Password
RECIPIENT_EMAIL = os.environ.get('NOTIFICATION_EMAIL', 'dilshajashrafi@gmail.com')

def generate_gmail_compose_url(sender_name, sender_email, subject, message):
    """Generates a direct Gmail Web Compose URL pre-filled with the message."""
    import urllib.parse
    su = f"Portfolio Inquiry: {subject or 'New Message'} (from {sender_name})"
    body = f"Hello Dilshaj,\n\nYou received a new message from your portfolio website:\n\n" \
           f"Name: {sender_name}\n" \
           f"Email: {sender_email}\n" \
           f"Subject: {subject}\n\n" \
           f"Message:\n{message}\n\n" \
           f"Sent on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    encoded_su = urllib.parse.quote(su)
    encoded_body = urllib.parse.quote(body)
    return f"https://mail.google.com/mail/?view=cm&fs=1&to={RECIPIENT_EMAIL}&su={encoded_su}&body={encoded_body}"

def send_contact_email(sender_name, sender_email, subject, message):
    """
    Sends an email notification to dilshajashrafi@gmail.com.
    Returns (success: bool, status_message: str, gmail_url: str).
    """
    gmail_url = generate_gmail_compose_url(sender_name, sender_email, subject, message)

    if not SENDER_PASSWORD:
        print(f">> [INFO] GMAIL_APP_PASSWORD not set in .env. Message recorded in database. Gmail Compose URL prepared.")
        return False, "SMTP password not configured. Direct Gmail compose link ready.", gmail_url

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"📬 Portfolio Message from {sender_name}: {subject or 'General Inquiry'}"
        msg['From'] = f"Portfolio Contact Form <{SENDER_EMAIL}>"
        msg['To'] = RECIPIENT_EMAIL
        msg['Reply-To'] = sender_email

        timestamp_str = datetime.now().strftime("%B %d, %Y at %I:%M %p")

        # Plain text fallback
        text_content = f"""New Message Received on Dilshaj Ashrafi's Portfolio
--------------------------------------------------
Sender:  {sender_name} ({sender_email})
Subject: {subject}
Time:    {timestamp_str}

Message:
{message}
--------------------------------------------------
Reply directly to: {sender_email}
"""

        # Sleek HTML Template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }}
            .header {{ background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4); padding: 24px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 20px; color: #ffffff; letter-spacing: -0.5px; }}
            .content {{ padding: 28px; line-height: 1.6; color: #cbd5e1; }}
            .meta-box {{ background: #0f172a; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #6366f1; }}
            .meta-item {{ margin-bottom: 8px; font-size: 14px; }}
            .meta-label {{ color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 12px; }}
            .meta-value {{ color: #f8fafc; font-weight: 500; }}
            .message-box {{ background: #0f172a; border-radius: 8px; padding: 18px; margin-top: 16px; border: 1px solid rgba(255,255,255,0.06); font-size: 15px; color: #f1f5f9; white-space: pre-wrap; }}
            .cta-btn {{ display: inline-block; background: #6366f1; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 24px; }}
            .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Message from Your Portfolio</h1>
            </div>
            <div class="content">
              <div class="meta-box">
                <div class="meta-item"><span class="meta-label">From:</span> <span class="meta-value">{sender_name}</span></div>
                <div class="meta-item"><span class="meta-label">Email:</span> <a href="mailto:{sender_email}" style="color:#06b6d4;">{sender_email}</a></div>
                <div class="meta-item"><span class="meta-label">Subject:</span> <span class="meta-value">{subject or 'General Inquiry'}</span></div>
                <div class="meta-item"><span class="meta-label">Date:</span> <span class="meta-value">{timestamp_str}</span></div>
              </div>

              <div class="meta-label" style="margin-bottom: 6px;">Message Content:</div>
              <div class="message-box">{message}</div>

              <div style="text-align: center;">
                <a href="mailto:{sender_email}?subject=Re: {subject or 'Your Inquiry'}" class="cta-btn">Reply to {sender_name}</a>
              </div>
            </div>
            <div class="footer">
              Sent automatically from your Dilshaj Ashrafi Full-Stack Portfolio Application.
            </div>
          </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))

        # Connect and send
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, [RECIPIENT_EMAIL], msg.as_string())
        server.quit()

        print(f">> [SUCCESS] Email delivered directly to {RECIPIENT_EMAIL} via SMTP.")
        return True, f"Email notification delivered to {RECIPIENT_EMAIL}.", gmail_url

    except Exception as e:
        print(f">> [ERROR] Failed to send email via SMTP: {e}")
        return False, f"SMTP Error: {str(e)}", gmail_url
