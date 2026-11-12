import type { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  void next;

  res.status(500).json({
    error: err.message ?? "Internal server error",
  });
};
