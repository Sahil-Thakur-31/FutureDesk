import { InferSchemaType, Schema, model } from "mongoose";

const userSettingsSchema = new Schema(
  {
    notificationPreferences: {
      inAppEnabled: { type: Boolean, default: true },
      emailEnabled: { type: Boolean, default: false },
      pushEnabled: { type: Boolean, default: true },
      examLeadDays: { type: [Number], default: [14, 7, 1] },
      taskLeadHours: { type: [Number], default: [24, 2] },
      certificateLeadDays: { type: [Number], default: [30, 7, 1] }
    },
    calendarPreferences: {
      googleCalendarSyncEnabled: { type: Boolean, default: false },
      connectedGoogleEmail: { type: String },
      defaultCalendarId: { type: String },
      syncExams: { type: Boolean, default: true },
      syncTasks: { type: Boolean, default: true },
      syncApplications: { type: Boolean, default: false }
    },
    dashboardPreferences: {
      defaultLandingPage: { type: String, enum: ["dashboard", "exams", "applications", "tasks"], default: "dashboard" },
      compactMode: { type: Boolean, default: false },
      weekStartsOn: { type: String, enum: ["monday", "sunday"], default: "monday" }
    },
    vaultPreferences: {
      maskSensitiveByDefault: { type: Boolean, default: true },
      requireReauthForSensitiveView: { type: Boolean, default: false }
    }
  },
  { _id: false }
);

const userProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    email: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    avatarUrl: { type: String },
    headline: { type: String },
    phone: { type: String },
    bio: { type: String },
    timezone: { type: String, default: "Asia/Kolkata" },
    locale: { type: String, default: "en-IN" },
    targetRoles: { type: [String], default: [] },
    settings: { type: userSettingsSchema, default: {} }
  },
  { timestamps: true }
);

export type UserProfileDocument = InferSchemaType<typeof userProfileSchema> & { _id: string };
export const UserProfileModel = model("UserProfile", userProfileSchema);
