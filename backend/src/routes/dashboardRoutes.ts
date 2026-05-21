import { Router } from "express";
import { DashboardController } from "../controllers/DashboardController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const controller = new DashboardController();

router.get("/overview", asyncHandler(controller.overview));
router.get("/notifications", asyncHandler(controller.notifications));

export { router as dashboardRoutes };
