import { useEffect, useMemo, useRef, useState } from "react";
import { createOfflineOperation, type Attachment } from "@futuredesk/shared";
import { apiClient } from "../../lib/api";
import { enqueueOperation } from "../../lib/offlineDb";
import { Modal } from "../../components/Modal";
import { useAppStore } from "../../store/appStore";
import {
  entityConfig,
  isFieldVisible,
  prepareModulePayload,
  toInputDateTimeValue,
  type EntitySection,
  type ModuleFieldDefinition
} from "./entityConfig";

type AddEntityModalProps = {
  section: EntitySection | null;
  open: boolean;
  onClose: () => void;
  record?: Record<string, any> | null;
};

type FormState = Record<string, string | boolean>;
type FileRole = "certificate" | "id_front" | "id_back" | "resume";
type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "custom";

function normalizeDefaults(defaults: Record<string, string | boolean>): FormState {
  return { ...defaults };
}

function formatOption(value: string): string {
  return value.replaceAll("_", " ");
}

function createAttachment(file: File, role?: FileRole): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.includes(",") ? result.split(",")[1] ?? "" : result;
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `att-${Date.now()}`;

      resolve({
        id,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataBase64: base64,
        role
      });
    };
    reader.readAsDataURL(file);
  });
}

function toInputDateValue(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 10);
}

const weekdayOptions = [
  { label: "Mon", value: "MO" },
  { label: "Tue", value: "TU" },
  { label: "Wed", value: "WE" },
  { label: "Thu", value: "TH" },
  { label: "Fri", value: "FR" },
  { label: "Sat", value: "SA" },
  { label: "Sun", value: "SU" }
] as const;

function parseRecurrenceRule(rule: string | undefined): {
  type: RecurrenceType;
  weeklyDay: string;
  monthlyDay: string;
  customDays: string[];
} {
  if (!rule) {
    return { type: "none", weeklyDay: "MO", monthlyDay: "1", customDays: [] };
  }

  const normalized = rule.toUpperCase();
  if (normalized.startsWith("FREQ=DAILY")) {
    return { type: "daily", weeklyDay: "MO", monthlyDay: "1", customDays: [] };
  }

  if (normalized.startsWith("FREQ=MONTHLY")) {
    const match = normalized.match(/BYMONTHDAY=(\d{1,2})/);
    return { type: "monthly", weeklyDay: "MO", monthlyDay: match?.[1] ?? "1", customDays: [] };
  }

  if (normalized.startsWith("FREQ=WEEKLY")) {
    const match = normalized.match(/BYDAY=([A-Z,]+)/);
    const days = match?.[1]?.split(",").filter(Boolean) ?? [];
    if (days.length <= 1) {
      return {
        type: "weekly",
        weeklyDay: days[0] ?? "MO",
        monthlyDay: "1",
        customDays: days
      };
    }
    return { type: "custom", weeklyDay: days[0] ?? "MO", monthlyDay: "1", customDays: days };
  }

  return { type: "custom", weeklyDay: "MO", monthlyDay: "1", customDays: [] };
}

function buildRecurrenceRule(
  type: RecurrenceType,
  weeklyDay: string,
  monthlyDay: string,
  customDays: string[]
): string {
  if (type === "daily") {
    return "FREQ=DAILY";
  }
  if (type === "weekly") {
    return `FREQ=WEEKLY;BYDAY=${weeklyDay}`;
  }
  if (type === "monthly") {
    return `FREQ=MONTHLY;BYMONTHDAY=${monthlyDay}`;
  }
  if (type === "custom") {
    const days = customDays.length > 0 ? customDays.join(",") : weeklyDay;
    return `FREQ=WEEKLY;BYDAY=${days}`;
  }

  return "";
}

function getEntity(section: EntitySection) {
  switch (section) {
    case "applications":
      return "jobApplication";
    case "certificates":
      return "certificate";
    case "tasks":
      return "task";
    case "idVault":
      return "idVault";
    default:
      return "exam";
  }
}

function buildInitialValues(
  definition: (typeof entityConfig)[EntitySection],
  record?: Record<string, any> | null
): FormState {
  const nextValues = normalizeDefaults(definition.defaults);
  if (!record) {
    return nextValues;
  }

  const fieldTypes = new Map(definition.fields.map((field) => [field.name, field.type]));
  for (const key of Object.keys(nextValues)) {
    const rawValue = record[key];
    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    const fieldType = fieldTypes.get(key);
    if (fieldType === "checkbox") {
      nextValues[key] = Boolean(rawValue);
      continue;
    }

    if (fieldType === "datetime-local") {
      nextValues[key] = typeof rawValue === "string" ? toInputDateTimeValue(rawValue) : "";
      continue;
    }

    if (fieldType === "date") {
      nextValues[key] = typeof rawValue === "string" ? toInputDateValue(rawValue) : "";
      continue;
    }

    if (fieldType === "tags") {
      nextValues[key] = Array.isArray(rawValue) ? rawValue.join(", ") : String(rawValue);
      continue;
    }

    if (fieldType === "number") {
      nextValues[key] = typeof rawValue === "number" ? String(rawValue) : String(rawValue);
      continue;
    }

    nextValues[key] = typeof rawValue === "string" ? rawValue : String(rawValue);
  }

  return nextValues;
}

function renderField(
  field: ModuleFieldDefinition,
  value: string | boolean | undefined,
  error: string | undefined,
  onChange: (nextValue: string | boolean) => void
) {
  const wrapperClassName = field.span === "full" || field.type === "textarea" ? "md:col-span-2" : "";

  return (
    <label key={field.name} className={wrapperClassName}>
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{field.label}</div>
      {field.type === "select" ? (
        <select
          className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        >
          {typeof value === "string" && value === "" ? <option value="">Select {field.label.toLowerCase()}</option> : null}
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {formatOption(option)}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          className="min-h-28 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
          placeholder={field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === "checkbox" ? (
        <div className="flex h-[42px] items-center rounded-xl border border-stone-200 px-3">
          <input checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
        </div>
      ) : (
        <input
          className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
          placeholder={field.placeholder}
          type={field.type === "tags" ? "text" : field.type}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error ? <div className="mt-1 text-xs text-red-700">{error}</div> : null}
    </label>
  );
}

export function AddEntityModal({ section, open, onClose, record }: AddEntityModalProps) {
  const resolvedSection = section ?? "exams";
  const setCollection = useAppStore((state) => state.setCollection);
  const setError = useAppStore((state) => state.setError);
  const items = useAppStore((state) => state[resolvedSection]);
  const definition = entityConfig[resolvedSection];
  const initialValues = useMemo(() => buildInitialValues(definition, record), [definition, record]);
  const [values, setValues] = useState<FormState>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [examTab, setExamTab] = useState<"details" | "results">("details");
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("none");
  const [weeklyDay, setWeeklyDay] = useState("MO");
  const [monthlyDay, setMonthlyDay] = useState("1");
  const [customDays, setCustomDays] = useState<string[]>([]);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);
  const idFrontInputRef = useRef<HTMLInputElement | null>(null);
  const idBackInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setFieldErrors({});
    setAttachments(Array.isArray(record?.attachments) ? (record?.attachments as Attachment[]) : []);
    setExamTab("details");
    const parsedRecurrence = parseRecurrenceRule(
      typeof initialValues.recurrenceRule === "string" ? initialValues.recurrenceRule : ""
    );
    setRecurrenceType(parsedRecurrence.type);
    setWeeklyDay(parsedRecurrence.weeklyDay);
    setMonthlyDay(parsedRecurrence.monthlyDay);
    setCustomDays(parsedRecurrence.customDays);
  }, [initialValues, open, record, section]);

  useEffect(() => {
    setValues((current) => {
      let changed = false;
      const next = { ...current };

      for (const field of definition.fields) {
        if (!isFieldVisible(section, field.name, current)) {
          const nextValue = field.type === "checkbox" ? false : "";
          if (next[field.name] !== nextValue) {
            next[field.name] = nextValue;
            changed = true;
          }
        }
      }

      return changed ? next : current;
    });
  }, [
    definition.fields,
    section,
    values.applicationStatus,
    values.applicationDeadline,
    values.paymentStatus,
    values.recurrenceRule,
    values.resultStatus,
    values.renewalRequired,
    values.verificationStatus,
    values.nextAction,
    values.status
  ]);

  if (!section) {
    return null;
  }

  const isEditing = Boolean(record);
  const examResultFields = new Set(["resultStatus", "resultScore", "resultRank", "resultUrl"]);
  useEffect(() => {
    if (section !== "tasks") {
      return;
    }

    const nextRule = buildRecurrenceRule(recurrenceType, weeklyDay, monthlyDay, customDays);
    setValues((current) => ({
      ...current,
      recurrenceRule: nextRule
    }));
  }, [customDays, monthlyDay, recurrenceType, section, weeklyDay]);

  const handleFileSelection = async (file: File | undefined, role?: FileRole) => {
    if (!file) {
      return;
    }

    const attachment = await createAttachment(file, role);
    setAttachments((current) => {
      if (!role) {
        return [...current, attachment];
      }

      return [...current.filter((item) => item.role !== role), attachment];
    });
  };

  const submit = async () => {
    const payload = prepareModulePayload(section, {
      ...values,
      attachments: attachments.length > 0 ? attachments : undefined
    });
    const parsed = definition.schema.safeParse(payload);

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string" && !nextErrors[path]) {
          nextErrors[path] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    try {
      const endpoint = isEditing ? `${definition.endpoint}/${record?.id}` : definition.endpoint;
      const method = isEditing ? "PUT" : "POST";
      const result = await apiClient.request<any>(endpoint, {
        method,
        body: JSON.stringify(parsed.data)
      });
      if (isEditing) {
        const next = (items as any[]).map((item) => (item.id === result.id ? result : item));
        setCollection(section, next as any);
      } else {
        setCollection(section, [result, ...(items as any[])] as any);
      }
      setError(null);
      setValues(initialValues);
      setFieldErrors({});
      onClose();
    } catch (error) {
      const action = isEditing ? "update" : "create";
      const payloadWithId = isEditing ? { id: record?.id, ...parsed.data } : parsed.data;
      await enqueueOperation(createOfflineOperation(getEntity(section), action, payloadWithId));
      setError(error instanceof Error ? error.message : "Saved to offline queue");
      onClose();
    }
  };

  return (
    <Modal
      title={`${isEditing ? "Edit" : "Add"} ${definition.singularLabel}`}
      open={open}
      onClose={onClose}
      actions={
        <>
          <button className="rounded-xl border border-stone-200 px-4 py-2 text-sm" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="rounded-xl bg-ink px-4 py-2 text-sm text-white" onClick={() => void submit()} type="button">
            {isEditing ? "Update" : "Save"}
          </button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {section === "exams" ? (
          <div className="md:col-span-2 flex items-center gap-2 rounded-xl border border-stone-200 bg-white p-2">
            <button
              className={`flex-1 rounded-lg px-3 py-2 text-sm ${examTab === "details" ? "bg-ink text-white" : "text-slate-600"}`}
              onClick={() => setExamTab("details")}
              type="button"
            >
              Exam details
            </button>
            <button
              className={`flex-1 rounded-lg px-3 py-2 text-sm ${examTab === "results" ? "bg-ink text-white" : "text-slate-600"}`}
              onClick={() => setExamTab("results")}
              type="button"
            >
              Result details
            </button>
          </div>
        ) : null}
        {definition.fields
          .filter((field) => isFieldVisible(section, field.name, values))
          .filter((field) => {
            if (section !== "exams") {
              return true;
            }
            const isResultField = examResultFields.has(field.name);
            return examTab === "results" ? isResultField : !isResultField;
          })
          .map((field) => {
            if (section === "certificates" && field.name === "expiryDate") {
              return null;
            }

            if (section === "certificates" && field.name === "renewalRequired") {
              const isChecked = Boolean(values.renewalRequired);
              return (
                <div key={field.name}>
                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Renewal</div>
                  <div className="flex items-center gap-3 rounded-xl border border-stone-200 px-3 py-2.5 text-sm">
                    <label className="flex items-center gap-2 text-slate-600">
                      <input
                        checked={isChecked}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setValues((current) => ({
                            ...current,
                            renewalRequired: checked
                          }));
                        }}
                        type="checkbox"
                      />
                      <span>Required?</span>
                    </label>
                    {isChecked ? (
                      <input
                        className="ml-auto h-7 w-[190px] rounded-md border border-stone-200 px-2 text-[11px]"
                        type="date"
                        value={typeof values.expiryDate === "string" ? values.expiryDate : ""}
                        onChange={(event) => setValues((current) => ({ ...current, expiryDate: event.target.value }))}
                      />
                    ) : (
                      <input
                        className="ml-auto h-7 w-[190px] rounded-md border border-stone-200 px-2 text-[11px] text-slate-400 opacity-70"
                        type="date"
                        value={typeof values.expiryDate === "string" ? values.expiryDate : ""}
                        disabled
                      />
                    )}
                  </div>
                  {fieldErrors.expiryDate ? <div className="mt-1 text-xs text-red-700">{fieldErrors.expiryDate}</div> : null}
                </div>
              );
            }

            return renderField(field, values[field.name], fieldErrors[field.name], (nextValue) => {
              setValues((current) => ({ ...current, [field.name]: nextValue }));
              setFieldErrors((current) => {
                if (!current[field.name]) {
                  return current;
                }

                const nextErrors = { ...current };
                delete nextErrors[field.name];
                return nextErrors;
              });
            });
          })}

        {section === "tasks" ? (
          <div className="md:col-span-2 space-y-3">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Recurrence</div>
              <div className="flex flex-wrap gap-2">
                {(["none", "daily", "weekly", "monthly", "custom"] as RecurrenceType[]).map((type) => (
                  <button
                    key={type}
                    className={`rounded-xl border px-3 py-2 text-sm capitalize ${
                      recurrenceType === type ? "border-ink bg-ink text-white" : "border-stone-200 text-slate-600"
                    }`}
                    onClick={() => setRecurrenceType(type)}
                    type="button"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {recurrenceType === "weekly" ? (
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Day of week</div>
                <div className="flex flex-wrap gap-2">
                  {weekdayOptions.map((day) => (
                    <button
                      key={day.value}
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        weeklyDay === day.value ? "border-ink bg-ink text-white" : "border-stone-200 text-slate-600"
                      }`}
                      onClick={() => setWeeklyDay(day.value)}
                      type="button"
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {recurrenceType === "monthly" ? (
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Day of month</div>
                <select
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
                  value={monthlyDay}
                  onChange={(event) => setMonthlyDay(event.target.value)}
                >
                  {Array.from({ length: 31 }, (_, index) => `${index + 1}`).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {recurrenceType === "custom" ? (
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Days of week</div>
                <div className="flex flex-wrap gap-2">
                  {weekdayOptions.map((day) => {
                    const checked = customDays.includes(day.value);
                    return (
                      <label
                        key={day.value}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                          checked ? "border-ink bg-ink text-white" : "border-stone-200 text-slate-600"
                        }`}
                      >
                        <input
                          checked={checked}
                          onChange={() =>
                            setCustomDays((current) =>
                              checked ? current.filter((value) => value !== day.value) : [...current, day.value]
                            )
                          }
                          type="checkbox"
                        />
                        <span>{day.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {section === "certificates" ? (
          <div className="md:col-span-2">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Certificate file</div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-xl border border-stone-200 px-4 py-2 text-sm"
                type="button"
                onClick={() => certificateInputRef.current?.click()}
              >
                Upload file
              </button>
              <input
                ref={certificateInputRef}
                className="hidden"
                type="file"
                onChange={(event) => void handleFileSelection(event.target.files?.[0], "certificate")}
              />
              <div className="text-sm text-slate-500">
                {attachments.find((item) => item.role === "certificate")?.name ?? "No file selected"}
              </div>
            </div>
          </div>
        ) : null}

        {section === "applications" ? (
          <div className="md:col-span-2">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Resume file</div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-xl border border-stone-200 px-4 py-2 text-sm"
                type="button"
                onClick={() => resumeInputRef.current?.click()}
              >
                Upload resume
              </button>
              <input
                ref={resumeInputRef}
                className="hidden"
                type="file"
                onChange={(event) => void handleFileSelection(event.target.files?.[0], "resume")}
              />
              <div className="text-sm text-slate-500">
                {attachments.find((item) => item.role === "resume")?.name ?? "No file selected"}
              </div>
            </div>
          </div>
        ) : null}

        {section === "idVault" ? (
          <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">ID front</div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="rounded-xl border border-stone-200 px-4 py-2 text-sm"
                  type="button"
                  onClick={() => idFrontInputRef.current?.click()}
                >
                  Upload front
                </button>
                <input
                  ref={idFrontInputRef}
                  className="hidden"
                  type="file"
                  onChange={(event) => void handleFileSelection(event.target.files?.[0], "id_front")}
                />
                <div className="text-sm text-slate-500">
                  {attachments.find((item) => item.role === "id_front")?.name ?? "No file selected"}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">ID back</div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="rounded-xl border border-stone-200 px-4 py-2 text-sm"
                  type="button"
                  onClick={() => idBackInputRef.current?.click()}
                >
                  Upload back
                </button>
                <input
                  ref={idBackInputRef}
                  className="hidden"
                  type="file"
                  onChange={(event) => void handleFileSelection(event.target.files?.[0], "id_back")}
                />
                <div className="text-sm text-slate-500">
                  {attachments.find((item) => item.role === "id_back")?.name ?? "No file selected"}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
