import { NotificationModel, type NotificationDocument } from "../models/NotificationModel.js";

export class NotificationRepository {
  async listByUser(userId: string): Promise<NotificationDocument[]> {
    return (await NotificationModel.find({ userId }).sort({ scheduledFor: -1 }).limit(100).lean()) as unknown as NotificationDocument[];
  }

  async upsertBySourceKey(userId: string, sourceKey: string, payload: Partial<NotificationDocument>): Promise<NotificationDocument> {
    return (await NotificationModel.findOneAndUpdate(
      { userId, sourceKey },
      { $set: payload },
      { upsert: true, new: true, lean: true }
    ).exec()) as unknown as NotificationDocument;
  }

  async markRead(userId: string, id: string): Promise<NotificationDocument | null> {
    return (await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { readAt: new Date() } },
      { new: true, lean: true }
    ).exec()) as NotificationDocument | null;
  }
}
