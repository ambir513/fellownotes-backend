import { Response } from "express";

type ApiResponse<T = any> = {
  statusCode: number;
  success?: boolean;
  message: string;
  data?: T;
};

/**
 * The wrapper for sending response
 * @param res Response
 * @param message string
 * @param statusCode number
 * @param data any
 */

export function response<T>(
  res: Response,
  { statusCode, success, message, data }: ApiResponse<T>,
) {
  return res.status(statusCode).json({
    success: success ?? (statusCode >= 200 && statusCode < 300),
    message,
    data: data !== undefined ? data : null,
  });
}

/**
 * Success Response
 * @param res Response
 * @param message string
 * @param statusCode number
 * @param data any
 */
export function successRes(
  res: Response,
  message: string,
  statusCode?: number,
  data?: any,
) {
  response(res, {
    statusCode: statusCode || 200,
    success: true,
    message,
    data,
  });
}

/**
 * failure Response
 * @param res Response
 * @param message string
 * @param statusCode number
 * @param data null | any
 */
export function failureRes(
  res: Response,
  message: string,
  statusCode?: number,
  data?: null | any,
) {
  response(res, {
    statusCode: statusCode || 500,
    success: false,
    message: message || "Something went wrong",
    data,
  });
}
