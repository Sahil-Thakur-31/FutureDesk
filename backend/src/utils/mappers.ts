import type {
  Attachment,
  Certificate,
  ChecklistItem,
  Exam,
  ExamStage,
  IDVault,
  InterviewRound,
  JobApplication,
  NotificationItem,
  Reminder,
  StageHistoryItem,
  Task,
  User,
  UserProfile
} from "@futuredesk/shared";

function toIsoDate(value?: Date | string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(value).toISOString();
}

function toAttachment(attachment: {
  id: string;
  name: string;
  url?: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  storageKey?: string;
  safeName?: string;
  hash?: string;
  scanStatus?: Attachment["scanStatus"];
  dataBase64?: string;
  role?: string;
}): Attachment {
  return {
    id: attachment.id,
    name: attachment.name,
    url: attachment.url,
    mimeType: attachment.mimeType,
    size: attachment.size,
    uploadedAt: attachment.uploadedAt.toISOString(),
    storageKey: attachment.storageKey,
    safeName: attachment.safeName,
    hash: attachment.hash,
    scanStatus: attachment.scanStatus,
    dataBase64: attachment.dataBase64,
    role: attachment.role
  };
}

function toReminder(reminder: {
  id: string;
  title?: string;
  remindAt: Date;
  channel: Reminder["channel"];
  deliveredAt?: Date;
  dismissedAt?: Date;
  sourceKey?: string;
}): Reminder {
  return {
    id: reminder.id,
    title: reminder.title,
    remindAt: reminder.remindAt.toISOString(),
    channel: reminder.channel,
    deliveredAt: toIsoDate(reminder.deliveredAt),
    dismissedAt: toIsoDate(reminder.dismissedAt),
    sourceKey: reminder.sourceKey
  };
}

function mapBaseRecord(document: any) {
  return {
    userId: document.userId.toString(),
    notes: document.notes,
    tags: document.tags ?? [],
    attachments: (document.attachments ?? []).map(toAttachment),
    reminders: (document.reminders ?? []).map(toReminder),
    archivedAt: toIsoDate(document.archivedAt),
    syncStatus: document.syncStatus ?? "pending",
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}

function toExamStage(stage: any): ExamStage {
  return {
    id: stage.id,
    stageName: stage.stageName,
    scheduledFor: toIsoDate(stage.scheduledFor),
    location: stage.location,
    status: stage.status,
    admitCardUrl: stage.admitCardUrl,
    resultDate: toIsoDate(stage.resultDate),
    resultUrl: stage.resultUrl,
    notes: stage.notes
  };
}

function toStageHistoryItem(item: any): StageHistoryItem {
  return {
    id: item.id,
    status: item.status,
    changedAt: new Date(item.changedAt).toISOString(),
    note: item.note
  };
}

function toInterviewRound(item: any): InterviewRound {
  return {
    id: item.id,
    roundName: item.roundName,
    scheduledFor: toIsoDate(item.scheduledFor),
    mode: item.mode,
    interviewer: item.interviewer,
    feedback: item.feedback,
    outcome: item.outcome
  };
}

function toChecklistItem(item: any): ChecklistItem {
  return {
    id: item.id,
    title: item.title,
    completed: item.completed
  };
}

export function toUser(document: { _id: string; email: string; createdAt: Date }): User {
  return {
    id: document._id.toString(),
    email: document.email,
    createdAt: document.createdAt.toISOString()
  };
}

export function toExam(document: any): Exam {
  return {
    id: document._id.toString(),
    ...mapBaseRecord(document),
    examName: document.examName,
    organization: document.organization,
    examCode: document.examCode,
    category: document.category,
    level: document.level,
    region: document.region,
    officialUrl: document.officialUrl,
    applicationOpenDate: toIsoDate(document.applicationOpenDate),
    applicationDeadline: new Date(document.applicationDeadline).toISOString(),
    applicationStatus: document.applicationStatus,
    applicationReference: document.applicationReference,
    examDate: toIsoDate(document.examDate),
    examCity: document.examCity,
    examCenter: document.examCenter,
    examShift: document.examShift,
    admitCardUrl: document.admitCardUrl,
    answerKeyUrl: document.answerKeyUrl,
    objectionWindowEnd: toIsoDate(document.objectionWindowEnd),
    preparationStatus: document.preparationStatus,
    paymentStatus: document.paymentStatus,
    feeAmount: document.feeAmount,
    feeCurrency: document.feeCurrency,
    priority: document.priority,
    studyPlanLink: document.studyPlanLink,
    resultStatus: document.resultStatus,
    resultScore: document.resultScore,
    resultRank: document.resultRank,
    resultUrl: document.resultUrl,
    lastCheckedAt: toIsoDate(document.lastCheckedAt),
    stages: (document.stages ?? []).map(toExamStage)
  };
}

export function toJobApplication(document: any): JobApplication {
  return {
    id: document._id.toString(),
    ...mapBaseRecord(document),
    company: document.company,
    role: document.role,
    applicationDate: new Date(document.applicationDate).toISOString(),
    status: document.status,
    currentStage: document.currentStage,
    timeInStageDays: document.timeInStageDays,
    lastActivityAt: toIsoDate(document.lastActivityAt),
    jobType: document.jobType,
    workMode: document.workMode,
    location: document.location,
    sourcePlatform: document.sourcePlatform,
    jobUrl: document.jobUrl,
    recruiterName: document.recruiterName,
    recruiterEmail: document.recruiterEmail,
    referralName: document.referralName,
    referralContact: document.referralContact,
    salaryMin: document.salaryMin,
    salaryMax: document.salaryMax,
    currency: document.currency,
    nextAction: document.nextAction,
    nextActionDate: toIsoDate(document.nextActionDate),
    owner: document.owner,
    priority: document.priority,
    resumeVersion: document.resumeVersion,
    coverLetterVersion: document.coverLetterVersion,
    stageHistory: (document.stageHistory ?? []).map(toStageHistoryItem),
    interviews: (document.interviews ?? []).map(toInterviewRound),
    offerStatus: document.offerStatus,
    rejectionReason: document.rejectionReason
  };
}

export function toCertificate(document: any): Certificate {
  return {
    id: document._id.toString(),
    ...mapBaseRecord(document),
    title: document.title,
    category: document.category,
    issuer: document.issuer,
    ownerName: document.ownerName,
    issueCountry: document.issueCountry,
    certificateNumber: document.certificateNumber,
    issueDate: new Date(document.issueDate).toISOString(),
    expiryDate: toIsoDate(document.expiryDate),
    fileUrl: document.fileUrl,
    verificationUrl: document.verificationUrl,
    verificationStatus: document.verificationStatus,
    fileHash: document.fileHash,
    renewalRequired: document.renewalRequired,
    renewalWindowStart: toIsoDate(document.renewalWindowStart),
    status: document.status
  };
}

export function toIDVault(document: any): IDVault {
  return {
    id: document._id.toString(),
    ...mapBaseRecord(document),
    documentName: document.documentName,
    documentType: document.documentType,
    issuingAuthority: document.issuingAuthority,
    country: document.country,
    maskedNumber: document.maskedNumber,
    encryptedNumber: document.encryptedNumber,
    encryptionKeyVersion: document.encryptionKeyVersion,
    issueDate: toIsoDate(document.issueDate),
    expiryDate: toIsoDate(document.expiryDate),
    fileUrl: document.fileUrl,
    fileFrontUrl: document.fileFrontUrl,
    fileBackUrl: document.fileBackUrl,
    lastViewedAt: toIsoDate(document.lastViewedAt),
    accessLog: (document.accessLog ?? []).map((entry: any) => ({
      id: entry.id,
      action: entry.action,
      at: new Date(entry.at).toISOString(),
      actor: entry.actor,
      ipAddress: entry.ipAddress
    }))
  };
}

export function toTask(document: any): Task {
  return {
    id: document._id.toString(),
    ...mapBaseRecord(document),
    title: document.title,
    description: document.description,
    startDate: toIsoDate(document.startDate),
    deadline: toIsoDate(document.deadline),
    completedAt: toIsoDate(document.completedAt),
    status: document.status,
    priority: document.priority,
    checklistItems: (document.checklistItems ?? []).map(toChecklistItem),
    recurrenceRule: document.recurrenceRule,
    estimateMinutes: document.estimateMinutes,
    actualMinutes: document.actualMinutes,
    focusArea: document.focusArea,
    energyLevel: document.energyLevel,
    calendarEventId: document.calendarEventId,
    linkedRecord: document.linkedRecord
      ? {
          entityType: document.linkedRecord.entityType,
          entityId: document.linkedRecord.entityId,
          label: document.linkedRecord.label
        }
      : undefined
  };
}

export function toNotification(document: any): NotificationItem {
  return {
    id: document._id.toString(),
    type: document.type,
    title: document.title,
    message: document.message,
    severity: document.severity,
    channel: document.channel,
    scheduledFor: new Date(document.scheduledFor).toISOString(),
    deliveredAt: toIsoDate(document.deliveredAt),
    readAt: toIsoDate(document.readAt),
    dismissedAt: toIsoDate(document.dismissedAt),
    entityType: document.entityType,
    entityId: document.entityId,
    sourceKey: document.sourceKey,
    actionUrl: document.actionUrl,
    batchKey: document.batchKey,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}

export function toUserProfile(document: any): UserProfile {
  return {
    id: document._id.toString(),
    userId: document.userId.toString(),
    email: document.email,
    displayName: document.displayName,
    avatarUrl: document.avatarUrl,
    headline: document.headline,
    phone: document.phone,
    bio: document.bio,
    timezone: document.timezone,
    locale: document.locale,
    targetRoles: document.targetRoles ?? [],
    settings: document.settings,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}
