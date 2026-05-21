import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const controller = new NotificationController();

router.get("/", asyncHandler(controller.list));
router.patch("/:id/read", asyncHandler(controller.markRead));

export { router as notificationRoutes };
