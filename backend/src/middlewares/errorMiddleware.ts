import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorMiddleware(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Validation failed",
      issues: error.issues
    });
    return;
  }

  if (error instanceof Error) {
    response.status(400).json({ message: error.message });
    return;
  }

  response.status(500).json({ message: "Internal server error" });
}
