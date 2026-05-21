import { InferSchemaType, Schema, model } from "mongoose";
import { createBaseRecordFields, vaultAccessEventSubSchema } from "./base.js";

const idVaultSchema = new Schema(
  {
    ...createBaseRecordFields(),
    documentName: { type: String, required: true, trim: true, index: "text" },
    documentType: { type: String, trim: true, index: true },
    issuingAuthority: { type: String, trim: true },
    country: { type: String, trim: true, index: true },
    maskedNumber: { type: String, trim: true },
    encryptedNumber: { type: String, required: true, select: false },
    encryptionKeyVersion: { type: String, trim: true },
    issueDate: { type: Date },
    expiryDate: { type: Date, index: true },
    fileUrl: { type: String },
    fileFrontUrl: { type: String },
    fileBackUrl: { type: String },
    lastViewedAt: { type: Date },
    accessLog: { type: [vaultAccessEventSubSchema], default: [] },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

idVaultSchema.index({ userId: 1, documentType: 1, expiryDate: 1 });
idVaultSchema.index({ userId: 1, issuingAuthority: 1, country: 1 });

export type IDVaultDocument = InferSchemaType<typeof idVaultSchema> & { _id: string };
export const IDVaultModel = model("IDVault", idVaultSchema);
