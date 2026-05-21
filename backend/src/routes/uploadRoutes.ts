import { Router } from "express";
import { UploadController } from "../controllers/UploadController.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const controller = new UploadController();

router.post("/", uploadMiddleware.single("file"), asyncHandler(controller.upload));
router.get("/file/:key(*)", asyncHandler(controller.getFile));

export { router as uploadRoutes };
