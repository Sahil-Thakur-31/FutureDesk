import { Router } from "express";
import {
  certificateFilterSchema,
  certificateSchema,
  examFilterSchema,
  examSchema,
  jobApplicationFilterSchema,
  jobApplicationSchema,
  taskFilterSchema,
  taskSchema
} from "@futuredesk/shared";
import { CrudController } from "../controllers/CrudController.js";
import { CertificateRepository } from "../repositories/CertificateRepository.js";
import { ExamRepository } from "../repositories/ExamRepository.js";
import { JobApplicationRepository } from "../repositories/JobApplicationRepository.js";
import { TaskRepository } from "../repositories/TaskRepository.js";
import { CrudService } from "../services/CrudService.js";
import { IDVaultService } from "../services/IDVaultService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toCertificate, toExam, toJobApplication, toTask } from "../utils/mappers.js";

function buildCrudRoutes<TResponse>(controller: CrudController<TResponse>): Router {
  const router = Router();
  router.get("/", asyncHandler(controller.list));
  router.post("/", asyncHandler(controller.create));
  router.put("/:id", asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.remove));
  return router;
}

const examController = new CrudController(
  new CrudService(new ExamRepository(), examSchema, toExam, "exam", examFilterSchema)
);
const applicationController = new CrudController(
  new CrudService(new JobApplicationRepository(), jobApplicationSchema, toJobApplication, "jobApplication", jobApplicationFilterSchema)
);
const certificateController = new CrudController(
  new CrudService(new CertificateRepository(), certificateSchema, toCertificate, "certificate", certificateFilterSchema)
);
const taskController = new CrudController(
  new CrudService(new TaskRepository(), taskSchema, toTask, "task", taskFilterSchema)
);
const idVaultController = new CrudController(new IDVaultService());

export const examRoutes = buildCrudRoutes(examController);
export const applicationRoutes = buildCrudRoutes(applicationController);
export const certificateRoutes = buildCrudRoutes(certificateController);
export const taskRoutes = buildCrudRoutes(taskController);
export const idVaultRoutes = buildCrudRoutes(idVaultController);
