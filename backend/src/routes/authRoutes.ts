import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authRateLimit } from "../middlewares/rateLimitMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const controller = new AuthController();

router.post("/register", authRateLimit, asyncHandler(controller.register));
router.post("/login", authRateLimit, asyncHandler(controller.login));

export { router as authRoutes };
