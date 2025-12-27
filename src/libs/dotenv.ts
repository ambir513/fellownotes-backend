import "dotenv/config";
import logger from "../utils/logger.js";

if (process.env.NODE_ENV! === "production") {
  logger("Running in PROD mode", "info");
}

if (
  process.env.NODE_ENV! !== "production" &&
  process.env.NODE_ENV! !== "development"
) {
  logger("NODE_ENV is not set to production or development", "warning");
}

if (process.env.NODE_ENV! === "development") {
  logger("Running in DEV mode", "info");
}

if (!process.env.PORT!) {
  logger(
    "PORT is not defined in environment variables But it uses 5001",
    "warning",
  );
}

if (!process.env.DATABASE_URL!) {
  logger("DATABASE_URL is not defined in environment variables", "error");
  process.exit(1);
}

if (!process.env.SECRET_KEY!) {
  logger("SECRET_KEY is not defined in environment variables", "error");
  process.exit(1);
}
if (!process.env.EMAIL_USER!) {
  logger("EMAIL_USER is not defined in environment variables", "error");
  process.exit(1);
}
if (!process.env.EMAIL_PASS!) {
  logger("EMAIL_PASS is not defined in environment variables", "error");
  process.exit(1);
}
if (!process.env.AWS_ACCESS_KEY_ID!) {
  logger("AWS_ACCESS_KEY_ID is not defined in environment variables", "error");
  process.exit(1);
}

if (!process.env.AWS_SECRET_ACCESS_KEY!) {
  logger(
    "AWS_SECRET_ACCESS_KEY is not defined in environment variables",
    "error",
  );
  process.exit(1);
}

if (!process.env.AWS_REGION!) {
  logger("AWS_REGION is not defined in environment variables", "error");
  process.exit(1);
}

if (!process.env.AWS_BUCKET_NAME!) {
  logger("AWS_BUCKET_NAME is not defined in environment variables", "error");
  process.exit(1);
}
