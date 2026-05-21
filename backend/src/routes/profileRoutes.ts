import { Router } from "express";
import { UserProfileController } from "../controllers/UserProfileController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const controller = new UserProfileController();

router.get("/", asyncHandler(controller.getProfile));
router.put("/", asyncHandler(controller.updateProfile));
router.get("/settings", asyncHandler(controller.getSettings));
router.put("/settings", asyncHandler(controller.updateSettings));

export { router as profileRoutes };
