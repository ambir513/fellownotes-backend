import expres from "express";
import AsyncHandler from "../../../utils/async-handler.js";
import loginFieldValidate from "./verify-login-fields-m.js";
import createJwtToken from "../../../utils/create-jwt.js";
import throwError from "../../../utils/throw-error.js";
import { failureRes, successRes } from "../../../utils/response.js";
import sendEmail from "../../../libs/nodemailer.js";
import verifyEmailQueryFieldValidate from "./verify-email-fields-m.js";
import verifyJwtToken from "../../../utils/verify-jwt.js";
import User from "../../../schema/users.js";
import verifyCookies from "../../../utils/verify-cookies-m.js";
import {
  clearLoginSession,
  createLoginSession,
  getLoginSession,
} from "./utils.js";
import logger from "../../../utils/logger.js";

const authRouter = expres.Router();

const RUNNING_MODE = process.env.NODE_ENV! || "development";

authRouter.post(
  "/login",
  verifyCookies,
  loginFieldValidate,
  AsyncHandler(async (req, res) => {
    if (req._id) {
      return failureRes(res, "User is already logged in", 401);
    }

    const { email } = req.body;

    const token = createJwtToken({ email, _id: email }, "1h");

    if (!token) {
      throwError("Token generation failed");
    }

    const isSessionExist = await getLoginSession(email);

    if (isSessionExist) {
      return failureRes(res, "Email is already send", 401);
    }

    if (RUNNING_MODE === "development") {
      return successRes(res, "Development mode - token generated", 200, {
        url: `${token}`,
      });
    } else {
      await sendEmail(
        email,
        "Your Login Link (Expires in 1 Hour)",
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Sign in</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
  </style>
</head>

<body
  style="
    margin:0;
    padding:0;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  "
>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:10px 8px;">
        <!-- CARD -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width:420px;
            background:#18181b;
            border:1px solid #27272a;
            border-radius:16px;
          "
        >
<tr>
  <td
    style="
      padding:32px 32px 20px 32px;
      border-bottom:1px solid #27272a;
      color:#fafafa;
    "
  >
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      width="100%"
    >
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <!-- LOGO -->
              <td style="padding-right:10px;">
                <img
                  src="https://res.cloudinary.com/dvvxpzajh/image/upload/v1767719955/fellow_notes_gwi7up.png"
                  alt="Fellow Notes"
                  width="40"
                  style="display:block;border:0;"
                />
              </td>

              <!-- TEXT -->
              <td>
                <p
                  style="
                    margin:0;
                    font-size:20px;
                    font-weight:700;
                    letter-spacing:-0.01em;
                    color:#fafafa;
                  "
                >
                  FellowNotes.app
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>


          <!-- CONTENT -->
          <tr>
            <td style="padding:24px 32px;color:#fafafa;">
            <p  style="
                  font-size:18px;">Sign in to Fellow Notes </p>
              <p
                style="
                  margin:0 0 20px 0;
                  font-size:14px;
                  color:#a1a1aa;
                  line-height:1.6;
                "
              >
                Use the button below to securely sign in to your account.
                This magic link is valid for <strong>1 hour</strong>.
              </p>

              <a
                href=${`${process.env.WEB_URL!}/verify-email?token=${token}`}
                style="
                  display:inline-block;
                  padding:12px 20px;
                  background:#fafafa;
                  color:#09090b;
                  text-decoration:none;
                  border-radius:10px;
                  font-weight:600;
                  font-size:14px;
                "
              >
                Sign in securely
              </a>

              <p
                style="
                  margin-top:24px;
                  font-size:12px;
                  color:#71717a;
                  line-height:1.5;
                "
              >
                Didn’t request this email? You can safely ignore it.
                Your account will remain secure.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              style="
                padding:20px 32px;
                border-top:1px solid #27272a;
                text-align:center;
              "
            >
              <p
                style="
                  margin:0;
                  font-size:12px;
                  color:#71717a;
                "
              >
                © 2026 Fellow Notes. All rights reserved.
              </p>

              <p
                style="
                  margin:6px 0 0 0;
                  font-size:11px;
                  color:#52525b;
                "
              >
                This is an automated message. Please do not reply.
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
      );

      await createLoginSession(email);
      return successRes(res, "check your email", 200, {
        url: `https://localhost:3000/verify-email?token=${token}`,
      });
    }
  }),
);

authRouter.get(
  "/verify-email",
  verifyCookies,
  verifyEmailQueryFieldValidate,
  AsyncHandler(async (req, res) => {
    if (req._id) {
      return failureRes(res, "User is already logged in", 401);
    }
    const { token } = req.query;

    const decoded = verifyJwtToken(token as string);

    logger(decoded?.email! + " - invalid or expired token", "warning");
    if (!decoded || !decoded.email) {
      return failureRes(res, "Invalid or expired token");
    }

    const isUserCahedExis = await getLoginSession(decoded?.email as string);

    if (!isUserCahedExis) {
      return failureRes(res, "Session expired or invalid token");
    }

    let id;

    const isExistedUser = await User.findOne({
      email: decoded?.email as string,
    });

    const uniqureUsername = decoded?.email.split("@")[0];

    if (!isExistedUser) {
      const newUser = await User.create({
        email: decoded?.email as string,
        username: uniqureUsername,
      });
      id = newUser._id.toString();
    }

    await clearLoginSession(decoded?.email as string);

    const authToken = createJwtToken(
      {
        email: decoded?.email!,
        _id: isExistedUser?._id.toString() || id!,
      },
      "30d",
    );

    if (!authToken) {
      throwError("Token generation failed");
    }

    res.cookie("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    logger(`${decoded?.email} - logged in`, "info");
    return successRes(res, "Logged in successfully", 202);
  }),
);

authRouter.get(
  "/logout",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    if (!req._id) {
      return failureRes(res, "Unauthorized, logged in now", 401);
    }

    res.clearCookie("token");

    logger(`${req.email!} - logged out`, "info");

    return successRes(res, "Logged out successfully", 200);
  }),
);

export default authRouter;
