// Sends one-time password-reset links without exposing SMTP credentials.
import nodemailer from "nodemailer";

export const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.EMAIL_FROM);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const createTransporter = () => {
  if (!isEmailConfigured()) {
    const error = new Error(
      "Password reset email is not configured. Please contact support.",
    );
    error.statusCode = 503;
    throw error;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === "true",
    ...(process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? {
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        }
      : {}),
  });
};

export const sendPasswordResetEmail = async ({ user, resetUrl }) => {
  const safeUsername = escapeHtml(user.username);
  const safeResetUrl = escapeHtml(resetUrl);
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Reset your LearnQuick password",
    text: `Hi ${user.username}, reset your LearnQuick password using this link: ${resetUrl}. This link expires in one hour.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>Reset your LearnQuick password</h2>
        <p>Hi ${safeUsername},</p>
        <p>Use the button below to choose a new password. This link expires in one hour.</p>
        <p><a href="${safeResetUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#0ea5e9;color:#fff;text-decoration:none">Reset password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};
