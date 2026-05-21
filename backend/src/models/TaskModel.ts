import { InferSchemaType, Schema, model } from "mongoose";
import { checklistItemSubSchema, createBaseRecordFields, linkedRecordSubSchema } from "./base.js";

const taskSchema = new Schema(
  {
    ...createBaseRecordFields(),
    title: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, default: "" },
    startDate: { type: Date, index: true },
    deadline: { type: Date, index: true },
    completedAt: { type: Date, index: true },
    status: { type: String, enum: ["todo", "in_progress", "done"], required: true, index: true },
    priority: { type: String, enum: ["low", "medium", "high"], required: true, index: true },
    checklistItems: { type: [checklistItemSubSchema], default: [] },
    recurrenceRule: { type: String },
    estimateMinutes: { type: Number },
    actualMinutes: { type: Number },
    focusArea: { type: String, trim: true, index: true },
    energyLevel: { type: String, enum: ["low", "medium", "high"], index: true },
    calendarEventId: { type: String, trim: true },
    linkedRecord: { type: linkedRecordSubSchema },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, deadline: 1 });
taskSchema.index({ userId: 1, status: 1, priority: 1 });
taskSchema.index({ userId: 1, "linkedRecord.entityType": 1 });
taskSchema.index({ userId: 1, energyLevel: 1, focusArea: 1 });

export type TaskDocument = InferSchemaType<typeof taskSchema> & { _id: string };
export const TaskModel = model("Task", taskSchema);
