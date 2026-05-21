import { InferSchemaType, Schema, model } from "mongoose";
import { createBaseRecordFields, examStageSubSchema } from "./base.js";

const examSchema = new Schema(
  {
    ...createBaseRecordFields(),
    examName: { type: String, required: true, trim: true, index: "text" },
    organization: { type: String, required: true, trim: true, index: "text" },
    examCode: { type: String, trim: true },
    category: { type: String, trim: true, index: true },
    level: { type: String, trim: true },
    region: { type: String, trim: true },
    officialUrl: { type: String },
    applicationOpenDate: { type: Date, index: true },
    applicationDeadline: { type: Date, required: true, index: true },
    applicationStatus: {
      type: String,
      enum: ["not_started", "draft", "submitted", "fee_pending", "completed"],
      index: true
    },
    applicationReference: { type: String, trim: true },
    examDate: { type: Date, index: true },
    examCity: { type: String, trim: true, index: true },
    examCenter: { type: String, trim: true },
    examShift: { type: String, trim: true },
    admitCardUrl: { type: String },
    answerKeyUrl: { type: String },
    objectionWindowEnd: { type: Date },
    preparationStatus: {
      type: String,
      enum: ["not_started", "planning", "in_progress", "ready"],
      required: true,
      index: true
    },
    paymentStatus: { type: String, enum: ["not_started", "pending", "paid", "waived"], index: true },
    feeAmount: { type: Number },
    feeCurrency: { type: String, trim: true },
    priority: { type: String, enum: ["low", "medium", "high"], index: true },
    studyPlanLink: { type: String },
    resultStatus: { type: String, enum: ["awaited", "qualified", "not_qualified", "withheld"], index: true },
    resultScore: { type: String },
    resultRank: { type: String },
    resultUrl: { type: String },
    lastCheckedAt: { type: Date, index: true },
    stages: { type: [examStageSubSchema], default: [] },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

examSchema.index({ userId: 1, examDate: 1 });
examSchema.index({ userId: 1, applicationDeadline: 1 });
examSchema.index({ userId: 1, category: 1, preparationStatus: 1 });
examSchema.index({ userId: 1, applicationStatus: 1 });

export type ExamDocument = InferSchemaType<typeof examSchema> & { _id: string };
export const ExamModel = model("Exam", examSchema);
