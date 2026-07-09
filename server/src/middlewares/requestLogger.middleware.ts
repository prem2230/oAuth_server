import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info("[HTTP]", {
    method: req.method,
    path: req.originalUrl,
  });

  next();
};
