import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/appError";
import { sendError } from "../utils/apiResponse";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    return sendError(res, error.message, error.statusCode);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return sendError(res, error.message, 400);
  }

  if (error instanceof mongoose.Error.CastError) {
    return sendError(res, "Resource not found", 404);
  }

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400 &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    return sendError(res, "Invalid JSON request body", 400);
  }

  return sendError(res, "Internal server error", 500);
};
