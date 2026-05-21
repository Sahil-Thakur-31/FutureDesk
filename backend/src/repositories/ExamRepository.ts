import type { ExamFilters } from "@futuredesk/shared";
import { ExamModel, type ExamDocument } from "../models/ExamModel.js";
import { BaseRepository } from "./BaseRepository.js";

export class ExamRepository extends BaseRepository<ExamDocument> {
  constructor() {
    super(ExamModel);
  }

  protected override buildListQuery(userId: string, filters: ExamFilters) {
    const query = super.buildListQuery(userId, filters) as Record<string, unknown>;

    if (filters.organization) {
      query.organization =
        filters.organization === "__exists__"
          ? { $exists: true, $ne: "" }
          : { $regex: filters.organization, $options: "i" };
    }
    if (filters.category) {
      query.category =
        filters.category === "__exists__" ? { $exists: true, $ne: "" } : { $regex: filters.category, $options: "i" };
    }
    if (filters.preparationStatus) {
      query.preparationStatus = filters.preparationStatus;
    }
    if (filters.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }
    if (filters.applicationStatus) {
      query.applicationStatus = filters.applicationStatus;
    }
    if (filters.resultStatus) {
      query.resultStatus = filters.resultStatus;
    }
    if (filters.deadlineBefore) {
      query.applicationDeadline = { $lte: new Date(filters.deadlineBefore) };
    }
    if (filters.upcomingOnly) {
      query.examDate = { ...(query.examDate as Record<string, unknown> | undefined), $gte: new Date() };
    }
    if (filters.admitCardAvailable) {
      query.admitCardUrl = { $exists: true, $ne: "" };
    }
    if (filters.dateFrom || filters.dateTo) {
      query.examDate = {
        ...(query.examDate as Record<string, unknown> | undefined),
        ...(filters.dateFrom ? { $gte: new Date(filters.dateFrom) } : {}),
        ...(filters.dateTo ? { $lte: new Date(filters.dateTo) } : {})
      };
    }

    return query;
  }
}
