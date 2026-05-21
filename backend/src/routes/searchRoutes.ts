import { Router } from "express";
import { SearchController } from "../controllers/SearchController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const controller = new SearchController();

router.get("/", asyncHandler(controller.search));

export { router as searchRoutes };
