import { Schema } from "mongoose";

export const attachmentSubSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, required: true },
    storageKey: { type: String },
    safeName: { type: String },
    hash: { type: String },
    scanStatus: { type: String, enum: ["pending", "passed", "flagged"] },
    dataBase64: { type: String },
    role: { type: String }
  },
  { _id: false }
);

export const reminderSubSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String },
    remindAt: { type: Date, required: true },
    channel: { type: String, enum: ["in_app", "push", "email"], required: true },
    deliveredAt: { type: Date },
    dismissedAt: { type: Date },
    sourceKey: { type: String }
  },
  { _id: false }
);

export const vaultAccessEventSubSchema = new Schema(
  {
    id: { type: String, required: true },
    action: { type: String, enum: ["viewed", "revealed", "downloaded", "exported"], required: true },
    at: { type: Date, required: true },
    actor: { type: String },
    ipAddress: { type: String }
  },
  { _id: false }
);

export const checklistItemSubSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, required: true, default: false }
  },
  { _id: false }
);

export const linkedRecordSubSchema = new Schema(
  {
    entityType: { type: String, enum: ["exam", "jobApplication", "certificate", "idVault", "task"], required: true },
    entityId: { type: String, required: true },
    label: { type: String }
  },
  { _id: false }
);

export const examStageSubSchema = new Schema(
  {
    id: { type: String, required: true },
    stageName: { type: String, required: true },
    scheduledFor: { type: Date },
    location: { type: String },
    status: { type: String, enum: ["planned", "completed", "missed", "cancelled", "result_published"], required: true },
    admitCardUrl: { type: String },
    resultDate: { type: Date },
    resultUrl: { type: String },
    notes: { type: String }
  },
  { _id: false }
);

export const stageHistorySubSchema = new Schema(
  {
    id: { type: String, required: true },
    status: { type: String, enum: ["wishlist", "applied", "shortlisted", "interview", "offered", "rejected"], required: true },
    changedAt: { type: Date, required: true },
    note: { type: String }
  },
  { _id: false }
);

export const interviewRoundSubSchema = new Schema(
  {
    id: { type: String, required: true },
    roundName: { type: String, required: true },
    scheduledFor: { type: Date },
    mode: { type: String, enum: ["onsite", "virtual", "telephonic", "assignment"] },
    interviewer: { type: String },
    feedback: { type: String },
    outcome: { type: String, enum: ["pending", "cleared", "rejected"] }
  },
  { _id: false }
);

export function createBaseRecordFields() {
  return {
    notes: { type: String, default: "" },
    tags: { type: [String], default: [] },
    attachments: { type: [attachmentSubSchema], default: [] },
    reminders: { type: [reminderSubSchema], default: [] },
    archivedAt: { type: Date, index: true },
    syncStatus: { type: String, enum: ["synced", "pending", "failed"], default: "pending", index: true }
  };
}
