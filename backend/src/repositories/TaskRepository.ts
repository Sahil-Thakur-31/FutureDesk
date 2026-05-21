import type { TaskFilters } from "@futuredesk/shared";
import { TaskModel, type TaskDocument } from "../models/TaskModel.js";
import { BaseRepository } from "./BaseRepository.js";

export class TaskRepository extends BaseRepository<TaskDocument> {
  constructor() {
    super(TaskModel);
  }

  protected override buildListQuery(userId: string, filters: TaskFilters) {
    const query = super.buildListQuery(userId, filters) as Record<string, unknown>;

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.energyLevel) {
      query.energyLevel = filters.energyLevel;
    }
    if (filters.linkedEntityType) {
      query["linkedRecord.entityType"] = filters.linkedEntityType;
    }
    if (filters.focusArea) {
      query.focusArea =
        filters.focusArea === "__exists__"
          ? { $exists: true, $ne: "" }
          : { $regex: filters.focusArea, $options: "i" };
    }
    if (filters.dueBefore) {
      query.deadline = { $lte: new Date(filters.dueBefore) };
    }
    if (filters.overdueOnly) {
      query.deadline = { ...(query.deadline as Record<string, unknown> | undefined), $lt: new Date() };
      query.status = { $ne: "done" };
    }
    if (filters.recurringOnly) {
      query.recurrenceRule = { $exists: true, $ne: "" };
    }

    return query;
  }
}
