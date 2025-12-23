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
import verifyCookies from "./verify-cookies-m.js";
import {
  clearLoginSession,
  createLoginSession,
  getLoginSession,
} from "./libs.js";
import logger from "../../../utils/logger.js";

const authRouter = expres.Router();

authRouter.get(
  "/login",
  verifyCookies,
  loginFieldValidate,
  AsyncHandler(async (req, res) => {
    if (req.email) {
      return failureRes(res, "User is already logged in", 401);
    }

    const { email } = req.body;

    const token = createJwtToken(email, "1h");

    if (!token) {
      throwError("Token generation failed");
    }

    const isSessionExist = await getLoginSession(email);

    if (isSessionExist) {
      return failureRes(res, "Email is already send", 401);
    }

    await sendEmail(email, "Your Login Link (Expires in 1 Hour)", {
      url: `https://localhost:3000/verify-email?token=${token}`,
    });

    await createLoginSession(email);

    return successRes(res, "check your email", 200, {
      url: `https://localhost:3000/verify-email?token=${token}`,
    });
  }),
);

authRouter.get(
  "/verify-email",
  verifyCookies,
  verifyEmailQueryFieldValidate,
  AsyncHandler(async (req, res) => {
    if (req.email) {
      return failureRes(res, "User is already logged in", 401);
    }
    const { token } = req.query;

    const decoded = verifyJwtToken(token as string);

    if (!decoded || !decoded.email) {
      throwError("Invalid or expired token");
    }

    const isExistedUser = await User.findOne({
      email: decoded?.email as string,
    });

    if (!isExistedUser) {
      await User.create({
        email: decoded?.email as string,
        username: decoded?.email.split("@")[0],
      });
    }

    await clearLoginSession(decoded?.email as string);

    const authToken = createJwtToken(decoded?.email as string, "7d");

    if (!authToken) {
      throwError("Token generation failed");
    }

    res.cookie("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    logger(`${decoded?.email} - logged in`, "info");
    return successRes(res, "Logged in successfully", 202);
  }),
);

authRouter.get(
  "/logout",
  verifyCookies,
  AsyncHandler(async (req, res) => {
    const email = req.email!;

    if (!email) {
      return failureRes(res, "User is not logged in", 401);
    }

    res.clearCookie("token");

    logger(`${email} - logged out`, "info");

    return successRes(res, "Logged out successfully", 200);
  }),
);

export default authRouter;
