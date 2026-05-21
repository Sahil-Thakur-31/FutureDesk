import { InferSchemaType, Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["exam_deadline", "task_deadline", "certificate_expiry", "application_follow_up", "interview", "sync_issue"],
      required: true,
      index: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ["info", "warning", "critical"], default: "info", index: true },
    channel: { type: String, enum: ["in_app", "push", "email"], default: "in_app", index: true },
    scheduledFor: { type: Date, required: true, index: true },
    deliveredAt: { type: Date },
    readAt: { type: Date, index: true },
    dismissedAt: { type: Date },
    entityType: { type: String, enum: ["exam", "jobApplication", "certificate", "idVault", "task"] },
    entityId: { type: String },
    sourceKey: { type: String, required: true, index: true },
    actionUrl: { type: String },
    batchKey: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, readAt: 1, scheduledFor: -1 });
notificationSchema.index({ userId: 1, sourceKey: 1 }, { unique: true });

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & { _id: string };
export const NotificationModel = model("Notification", notificationSchema);
