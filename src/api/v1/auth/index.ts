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

authRouter.get(
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
      await sendEmail(email, "Your Login Link (Expires in 1 Hour)", {
        url: `https://localhost:3000/verify-email?token=${token}`,
      });

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
      throwError("Invalid or expired token");
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
