import { Request, Response, NextFunction } from "express";

type handler =
  | ((req: Request, res: Response, next: NextFunction) => void)
  | ((req: Request, res: Response, next: NextFunction) => Promise<any>);

/**
 * This function is a wrapper of try/catch block
 * @param fn
 * @returns fn
 */
export default function AsyncHandler(fn: handler) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
