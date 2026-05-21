import type { JobApplicationFilters } from "@futuredesk/shared";
import { JobApplicationModel, type JobApplicationDocument } from "../models/JobApplicationModel.js";
import { BaseRepository } from "./BaseRepository.js";

export class JobApplicationRepository extends BaseRepository<JobApplicationDocument> {
  constructor() {
    super(JobApplicationModel);
  }

  protected override buildListQuery(userId: string, filters: JobApplicationFilters) {
    const query = super.buildListQuery(userId, filters) as Record<string, unknown>;

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.company) {
      query.company =
        filters.company === "__exists__" ? { $exists: true, $ne: "" } : { $regex: filters.company, $options: "i" };
    }
    if (filters.sourcePlatform) {
      query.sourcePlatform =
        filters.sourcePlatform === "__exists__"
          ? { $exists: true, $ne: "" }
          : { $regex: filters.sourcePlatform, $options: "i" };
    }
    if (filters.workMode) {
      query.workMode = filters.workMode;
    }
    if (filters.currentStage) {
      query.currentStage =
        filters.currentStage === "__exists__"
          ? { $exists: true, $ne: "" }
          : { $regex: filters.currentStage, $options: "i" };
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.nextActionBefore) {
      query.nextActionDate = { $lte: new Date(filters.nextActionBefore) };
    }
    if (filters.dateFrom || filters.dateTo) {
      query.applicationDate = {
        ...(filters.dateFrom ? { $gte: new Date(filters.dateFrom) } : {}),
        ...(filters.dateTo ? { $lte: new Date(filters.dateTo) } : {})
      };
    }
    if (filters.activeOnly && !filters.status) {
      query.status = { $nin: ["offered", "rejected"] };
    }

    return query;
  }
}
