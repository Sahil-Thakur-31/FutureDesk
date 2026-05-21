import { InferSchemaType, Schema, model } from "mongoose";
import { createBaseRecordFields } from "./base.js";

const certificateSchema = new Schema(
  {
    ...createBaseRecordFields(),
    title: { type: String, required: true, trim: true, index: "text" },
    category: { type: String, required: true, trim: true, index: true },
    issuer: { type: String, trim: true, index: true },
    ownerName: { type: String, trim: true },
    issueCountry: { type: String, trim: true, index: true },
    certificateNumber: { type: String, trim: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, index: true },
    fileUrl: { type: String },
    verificationUrl: { type: String },
    verificationStatus: { type: String, enum: ["unverified", "verified", "needs_review"], index: true },
    fileHash: { type: String },
    renewalRequired: { type: Boolean, default: false },
    renewalWindowStart: { type: Date },
    status: { type: String, enum: ["valid", "expiring", "expired", "revoked"], index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

certificateSchema.index({ userId: 1, expiryDate: 1 });
certificateSchema.index({ userId: 1, category: 1, status: 1 });
certificateSchema.index({ userId: 1, verificationStatus: 1, renewalRequired: 1 });

export type CertificateDocument = InferSchemaType<typeof certificateSchema> & { _id: string };
export const CertificateModel = model("Certificate", certificateSchema);
