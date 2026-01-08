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
  body: string,
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
      html: body
    });
    logger("Email sent successfully", "success");
  } catch (error) {
    logger("Error sending email:", "error");
  }
}
