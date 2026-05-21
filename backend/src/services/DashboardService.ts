import type { DashboardOverview } from "@futuredesk/shared";
import { CertificateModel } from "../models/CertificateModel.js";
import { ExamModel } from "../models/ExamModel.js";
import { JobApplicationModel } from "../models/JobApplicationModel.js";
import { TaskModel } from "../models/TaskModel.js";
import { NotificationService } from "./NotificationService.js";
import { toCertificate, toExam, toJobApplication, toTask } from "../utils/mappers.js";

const DAY = 1000 * 60 * 60 * 24;

export class DashboardService {
  constructor(private readonly notificationService = new NotificationService()) {}

  async getOverview(userId: string): Promise<DashboardOverview> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + DAY * 7);
    const nextMonth = new Date(now.getTime() + DAY * 30);

    const [upcomingExams, pendingApplications, tasksDueSoon, overdueTasks, expiringCertificates, notifications] =
      await Promise.all([
        ExamModel.find({ userId, archivedAt: { $exists: false }, examDate: { $gte: now } }).sort({ examDate: 1 }).limit(5).lean(),
        JobApplicationModel.find({
          userId,
          archivedAt: { $exists: false },
          status: { $in: ["wishlist", "applied", "shortlisted", "interview"] }
        }).sort({ nextActionDate: 1, applicationDate: -1 }).limit(5).lean(),
        TaskModel.find({
          userId,
          archivedAt: { $exists: false },
          status: { $ne: "done" },
          deadline: { $gte: now, $lte: nextWeek }
        }).sort({ deadline: 1 }).limit(5).lean(),
        TaskModel.find({
          userId,
          archivedAt: { $exists: false },
          status: { $ne: "done" },
          deadline: { $lt: now }
        }).sort({ deadline: 1 }).limit(5).lean(),
        CertificateModel.find({
          userId,
          archivedAt: { $exists: false },
          expiryDate: { $gte: now, $lte: nextMonth }
        }).sort({ expiryDate: 1 }).limit(5).lean(),
        this.notificationService.list(userId)
      ]);

    const latestNotifications = notifications.slice(0, 10);
    const unreadNotifications = notifications.filter((item) => !item.readAt).length;

    return {
      stats: {
        upcomingExams: upcomingExams.length,
        pendingApplications: pendingApplications.length,
        tasksDueSoon: tasksDueSoon.length,
        overdueTasks: overdueTasks.length,
        expiringCertificates: expiringCertificates.length,
        unreadNotifications
      },
      upcomingExams: upcomingExams.map(toExam),
      pendingApplications: pendingApplications.map(toJobApplication),
      tasksDueSoon: tasksDueSoon.map(toTask),
      overdueTasks: overdueTasks.map(toTask),
      expiringCertificates: expiringCertificates.map(toCertificate),
      latestNotifications
    };
  }
}
