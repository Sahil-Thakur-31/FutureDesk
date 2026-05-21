import type { NotificationItem } from "@futuredesk/shared";
import { CertificateModel } from "../models/CertificateModel.js";
import { ExamModel } from "../models/ExamModel.js";
import { JobApplicationModel } from "../models/JobApplicationModel.js";
import { TaskModel } from "../models/TaskModel.js";
import { NotificationRepository } from "../repositories/NotificationRepository.js";
import { toNotification } from "../utils/mappers.js";

const DAY = 1000 * 60 * 60 * 24;

export class NotificationService {
  constructor(private readonly repository = new NotificationRepository()) {}

  async list(userId: string): Promise<NotificationItem[]> {
    await this.syncSystemNotifications(userId);
    const items = await this.repository.listByUser(userId);
    return items.map(toNotification);
  }

  async markRead(userId: string, id: string): Promise<NotificationItem | null> {
    const item = await this.repository.markRead(userId, id);
    return item ? toNotification(item) : null;
  }

  private async syncSystemNotifications(userId: string): Promise<void> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + DAY * 7);
    const nextMonth = new Date(now.getTime() + DAY * 30);

    const [exams, tasks, certificates, applications] = await Promise.all([
      ExamModel.find({
        userId,
        archivedAt: { $exists: false },
        applicationDeadline: { $gte: now, $lte: nextWeek }
      }).lean(),
      TaskModel.find({
        userId,
        archivedAt: { $exists: false },
        status: { $ne: "done" },
        deadline: { $gte: now, $lte: nextWeek }
      }).lean(),
      CertificateModel.find({
        userId,
        archivedAt: { $exists: false },
        expiryDate: { $gte: now, $lte: nextMonth }
      }).lean(),
      JobApplicationModel.find({
        userId,
        archivedAt: { $exists: false },
        nextActionDate: { $gte: now, $lte: nextWeek }
      }).lean()
    ]);

    await Promise.all([
      ...exams.map((exam) =>
        this.repository.upsertBySourceKey(userId, `exam-deadline-${exam._id}`, {
          userId,
          type: "exam_deadline",
          title: `${exam.examName} application deadline`,
          message: `${exam.organization} closes on ${new Date(exam.applicationDeadline).toDateString()}`,
          severity: "warning",
          channel: "in_app",
          scheduledFor: exam.applicationDeadline,
          entityType: "exam",
          entityId: exam._id.toString(),
          sourceKey: `exam-deadline-${exam._id}`
        } as any)
      ),
      ...tasks.map((task) =>
        this.repository.upsertBySourceKey(userId, `task-deadline-${task._id}`, {
          userId,
          type: "task_deadline",
          title: `${task.title} due`,
          message: `Task deadline on ${new Date(task.deadline as Date).toDateString()}`,
          severity: "warning",
          channel: "in_app",
          scheduledFor: task.deadline as Date,
          entityType: "task",
          entityId: task._id.toString(),
          sourceKey: `task-deadline-${task._id}`
        } as any)
      ),
      ...certificates.map((certificate) =>
        this.repository.upsertBySourceKey(userId, `certificate-expiry-${certificate._id}`, {
          userId,
          type: "certificate_expiry",
          title: `${certificate.title} expiring`,
          message: `Certificate expires on ${new Date(certificate.expiryDate as Date).toDateString()}`,
          severity: "critical",
          channel: "in_app",
          scheduledFor: certificate.expiryDate as Date,
          entityType: "certificate",
          entityId: certificate._id.toString(),
          sourceKey: `certificate-expiry-${certificate._id}`
        } as any)
      ),
      ...applications.map((application) =>
        this.repository.upsertBySourceKey(userId, `application-follow-up-${application._id}`, {
          userId,
          type: "application_follow_up",
          title: `${application.company} follow-up`,
          message: `${application.role} next action due ${new Date(application.nextActionDate as Date).toDateString()}`,
          severity: "info",
          channel: "in_app",
          scheduledFor: application.nextActionDate as Date,
          entityType: "jobApplication",
          entityId: application._id.toString(),
          sourceKey: `application-follow-up-${application._id}`
        } as any)
      ),
      ...applications.flatMap((application) =>
        (application.interviews ?? [])
          .filter((interview) => {
            if (!interview.scheduledFor) {
              return false;
            }

            const scheduledFor = new Date(interview.scheduledFor);
            return scheduledFor >= now && scheduledFor <= nextWeek;
          })
          .map((interview) =>
            this.repository.upsertBySourceKey(userId, `interview-${application._id}-${interview.id}`, {
              userId,
              type: "interview",
              title: `${application.company} ${interview.roundName}`,
              message: `${application.role} interview scheduled on ${new Date(interview.scheduledFor as Date).toDateString()}`,
              severity: "warning",
              channel: "in_app",
              scheduledFor: interview.scheduledFor as Date,
              entityType: "jobApplication",
              entityId: application._id.toString(),
              sourceKey: `interview-${application._id}-${interview.id}`
            } as any)
          )
      )
    ]);
  }
}
