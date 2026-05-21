import type { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";

const authService = new AuthService();

export function authMiddleware(request: Request, response: Response, next: NextFunction): void {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const payload = authService.verifyToken(authorization.replace("Bearer ", ""));
    request.user = {
      id: payload.sub,
      email: payload.email
    };
    next();
  } catch {
    response.status(401).json({ message: "Unauthorized" });
  }
}
