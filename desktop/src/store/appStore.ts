import { create } from "zustand";
import type {
  Certificate,
  DashboardOverview,
  Exam,
  IDVault,
  JobApplication,
  NotificationItem,
  OfflineOperation,
  Task,
  UserProfile,
  UserSettings
} from "@futuredesk/shared";

export type Section =
  | "dashboard"
  | "exams"
  | "applications"
  | "certificates"
  | "idVault"
  | "tasks"
  | "notifications"
  | "profile"
  | "settings";

type AppState = {
  activeSection: Section;
  dashboard: DashboardOverview | null;
  exams: Exam[];
  applications: JobApplication[];
  certificates: Certificate[];
  idVault: IDVault[];
  tasks: Task[];
  notifications: NotificationItem[];
  queue: OfflineOperation[];
  error: string | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  setActiveSection: (section: Section) => void;
  setDashboard: (dashboard: DashboardOverview) => void;
  setCollection: <TSection extends keyof Pick<AppState, "exams" | "applications" | "certificates" | "idVault" | "tasks">>(
    key: TSection,
    value: AppState[TSection]
  ) => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSettings: (settings: UserSettings | null) => void;
  setQueue: (queue: OfflineOperation[]) => void;
  setError: (error: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  activeSection: "dashboard",
  dashboard: null,
  exams: [],
  applications: [],
  certificates: [],
  idVault: [],
  tasks: [],
  notifications: [],
  queue: [],
  error: null,
  profile: null,
  settings: null,
  setActiveSection: (activeSection) => set({ activeSection }),
  setDashboard: (dashboard) => set({ dashboard }),
  setCollection: (key, value) => set({ [key]: value } as Partial<AppState>),
  setNotifications: (notifications) => set({ notifications }),
  setProfile: (profile) => set({ profile }),
  setSettings: (settings) => set({ settings }),
  setQueue: (queue) => set({ queue }),
  setError: (error) => set({ error })
}));
