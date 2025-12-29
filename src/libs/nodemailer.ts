import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
});

export default async function sendEmail(
  to: string,
  subject: string,
  body: any,
) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger(
        "Email credentials are not set. Cannot send email.",

        "error",
      );
      return;
    }
    const response = await transporter.sendMail({
      from: `"Fellow Notes" <otp.providers@gmail.com>`,
      to,
      subject,
      html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Login Link</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
        font-family: Geist, sans-serif;
      color: #ffffff;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style=" padding: 40px 0"
    >
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              background-color: #0a0a0a;
              border: 1px solid #1f1f1f;
              border-radius: 8px;
              padding: 32px;
            "
          >
            <tr>
              <td style="text-align: center">
                <h1 style="margin: 0 0 16px; font-size: 24px; color: #ffffff">
                  Secure Login
                </h1>

                <p style="margin: 0 0 24px; font-size: 15px; color: #cccccc">
                  Use the button below to securely log in to your account.
                </p>

                <a
                  href="${body.url}"
                  style="
                    display: inline-block;
                    padding: 14px 28px;
                    background-color: #ffffff;
                    color: #0a0a0a;
                    text-decoration: none;
                    font-weight: 600;
                    border-radius: 6px;
                    font-size: 14px;
                  "
                >
                  Login to Your Account
                </a>

                <p
                  style="
                    margin: 24px 0 0;
                    font-size: 13px;
                    color: #aaaaaa;
                  "
                >
                  ⏳ This login link will expire in <strong>1 hour</strong>.
                </p>

                <p
                  style="
                    margin: 16px 0 0;
                    font-size: 12px;
                    color: #777777;
                  "
                >
                  If you did not request this login, you can safely ignore this
                  email.
                </p>

                <hr
                  style="
                    margin: 32px 0;
                    border: none;
                    border-top: 1px solid #1f1f1f;
                  "
                />

                <p style="margin: 0; font-size: 11px; color: #666666">
                  © 2025 FellowNotes. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
    });
    logger("Email sent successfully", "success");
  } catch (error) {
    logger("Error sending email:", "error");
  }
}
