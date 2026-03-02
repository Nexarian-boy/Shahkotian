// Generic SMTP email — works with Amazon SES, Gmail, or any SMTP provider.
// Set these env vars on DigitalOcean App Platform:
//
// Amazon SES (recommended — free 62,000 emails/month from EC2/App Platform):
//   EMAIL_HOST = email-smtp.us-east-1.amazonaws.com
//   EMAIL_PORT = 587
//   EMAIL_USER = <your SES SMTP username from AWS Console → SES → SMTP Settings → Manage credentials>
//   EMAIL_PASS = <your SES SMTP password>
//
// Gmail fallback:
//   EMAIL_HOST = smtp.gmail.com
//   EMAIL_PORT = 465
//   EMAIL_USER = your@gmail.com
//   EMAIL_PASS = <16-char App Password from myaccount.google.com/security>

const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  // port 465 uses SSL (secure:true), 587 uses STARTTLS (secure:false, starttls upgrades automatically)
  const secure = port === 465;
  _transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return _transporter;
}

/**
 * Send email via Gmail SMTP
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 */
async function sendEmail(to, subject, html) {
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.error('EMAIL_USER or EMAIL_PASS is not set in environment variables');
      return { ok: false, error: 'Email credentials not configured (set EMAIL_USER and EMAIL_PASS)' };
    }

    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"Apna Shahkot" <${user}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${subject} (messageId: ${info.messageId})`);
    return { ok: true };
  } catch (error) {
    console.error('Email send error:', error.message);
    // Reset transporter so next call retries fresh
    _transporter = null;
    return { ok: false, error: error.message };
  }
}

/**
 * Send Rishta approval email
 */
async function sendRishtaApprovalEmail(email, name) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; text-align: center;">Apna Shahkot</h1>
        <p style="color: #e8e8e8; text-align: center; margin-top: 10px;">Rishta Service</p>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333;">Congratulations, ${name}! 🎉</h2>
        <p style="color: #555; line-height: 1.6;">
          Your Rishta profile has been <strong style="color: #27ae60;">APPROVED</strong> by our admin team.
        </p>
        <p style="color: #555; line-height: 1.6;">
          You can now browse and connect with other verified profiles on the Apna Shahkot Rishta section.
        </p>
        <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="color: #555; margin: 0;"><strong>Remember:</strong> All profiles are verified. Any misuse or illegal activity will result in strict action.</p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This is an automated email from Apna Shahkot. Do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail(email, '✅ Your Rishta Profile is Approved - Apna Shahkot', html).then(r => r.ok);
}

/**
 * Send Rishta rejection email
 */
async function sendRishtaRejectionEmail(email, name, reason) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; text-align: center;">Apna Shahkot</h1>
        <p style="color: #e8e8e8; text-align: center; margin-top: 10px;">Rishta Service</p>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333;">Hello, ${name}</h2>
        <p style="color: #555; line-height: 1.6;">
          Unfortunately, your Rishta profile has been <strong style="color: #e74c3c;">not approved</strong> at this time.
        </p>
        ${reason ? `<p style="color: #555; line-height: 1.6;"><strong>Reason:</strong> ${reason}</p>` : ''}
        <p style="color: #555; line-height: 1.6;">
          Please review and resubmit your profile with correct information.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This is an automated email from Shahkot App. Do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return sendEmail(email, '❌ Rishta Profile Update - Apna Shahkot', html).then(r => r.ok);
}

module.exports = {
  sendEmail,
  sendRishtaApprovalEmail,
  sendRishtaRejectionEmail,
};
