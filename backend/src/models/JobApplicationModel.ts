import { InferSchemaType, Schema, model } from "mongoose";
import { createBaseRecordFields, interviewRoundSubSchema, stageHistorySubSchema } from "./base.js";

const jobApplicationSchema = new Schema(
  {
    ...createBaseRecordFields(),
    company: { type: String, required: true, trim: true, index: "text" },
    role: { type: String, required: true, trim: true, index: "text" },
    applicationDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["wishlist", "applied", "shortlisted", "interview", "offered", "rejected"],
      required: true,
      index: true
    },
    currentStage: { type: String, trim: true, index: true },
    timeInStageDays: { type: Number, min: 0 },
    lastActivityAt: { type: Date, index: true },
    jobType: { type: String, enum: ["full_time", "part_time", "contract", "internship", "freelance"], index: true },
    workMode: { type: String, enum: ["onsite", "hybrid", "remote"], index: true },
    location: { type: String, trim: true, index: true },
    sourcePlatform: { type: String, trim: true, index: true },
    jobUrl: { type: String },
    recruiterName: { type: String, trim: true },
    recruiterEmail: { type: String, trim: true },
    referralName: { type: String, trim: true },
    referralContact: { type: String, trim: true },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, trim: true },
    nextAction: { type: String },
    nextActionDate: { type: Date, index: true },
    owner: { type: String, trim: true },
    priority: { type: String, enum: ["low", "medium", "high"], index: true },
    resumeVersion: { type: String, trim: true },
    coverLetterVersion: { type: String, trim: true },
    stageHistory: { type: [stageHistorySubSchema], default: [] },
    interviews: { type: [interviewRoundSubSchema], default: [] },
    offerStatus: { type: String, enum: ["pending", "accepted", "declined"] },
    rejectionReason: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

jobApplicationSchema.index({ userId: 1, applicationDate: -1 });
jobApplicationSchema.index({ userId: 1, status: 1, nextActionDate: 1 });
jobApplicationSchema.index({ userId: 1, currentStage: 1, priority: 1 });

export type JobApplicationDocument = InferSchemaType<typeof jobApplicationSchema> & { _id: string };
export const JobApplicationModel = model("JobApplication", jobApplicationSchema);
