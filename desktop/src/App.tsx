import { useEffect, useMemo, useRef, useState } from "react";
import { AuthScreen } from "./features/auth/AuthScreen";
import { DashboardView } from "./features/dashboard/DashboardView";
import { EntityWorkspace } from "./features/entities/EntityWorkspace";
import { Sidebar } from "./components/Sidebar";
import { useBootstrap } from "./hooks/useBootstrap";
import { useAppStore, type Section } from "./store/appStore";
import { useSessionStore } from "./store/sessionStore";
import { NotificationsPage } from "./features/notifications/NotificationsPage";
import { ProfilePage } from "./features/profile/ProfilePage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { CalendarModal } from "./components/CalendarModal";

const pageTitles: Record<Section, string> = {
  dashboard: "Dashboard",
  exams: "Exams",
  applications: "Applications",
  certificates: "Certificates",
  idVault: "ID Vault",
  tasks: "Tasks",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings"
};

function CalendarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M10 17a2 2 0 0 0 4 0" />
    </svg>
  );
}

function renderPage(activeSection: Section) {
  if (activeSection === "dashboard") {
    return <DashboardView />;
  }

  if (activeSection === "notifications") {
    return <NotificationsPage />;
  }

  if (activeSection === "profile") {
    return <ProfilePage />;
  }

  if (activeSection === "settings") {
    return <SettingsPage />;
  }

  return <EntityWorkspace section={activeSection} />;
}

function Workspace() {
  const activeSection = useAppStore((state) => state.activeSection);
  const setActiveSection = useAppStore((state) => state.setActiveSection);
  const notifications = useAppStore((state) => state.notifications);
  const error = useAppStore((state) => state.error);
  const profile = useAppStore((state) => state.profile);
  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const notificationMenuRef = useRef<HTMLDivElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useBootstrap();

  const lastNotifications = useMemo(() => notifications.slice(0, 10), [notifications]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const inNotification =
        notificationButtonRef.current?.contains(target) || notificationMenuRef.current?.contains(target);
      const inProfile = profileButtonRef.current?.contains(target) || profileMenuRef.current?.contains(target);

      if (!inNotification) {
        setNotificationOpen(false);
      }
      if (!inProfile) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <main className="flex h-screen gap-4 overflow-hidden p-4">
      <Sidebar activeSection={activeSection} onSelect={setActiveSection} />
      <section className="flex min-h-0 flex-1 flex-col gap-3">
        <header className="flex items-center justify-between rounded-[22px] bg-white px-5 py-4 shadow-card">
          <h1 className="font-display text-2xl font-semibold text-ink">{pageTitles[activeSection]}</h1>
          <div className="relative flex items-center gap-2">
            <button className="rounded-xl border border-stone-200 p-2.5 text-slate-600" onClick={() => setCalendarOpen(true)}>
              <CalendarIcon />
            </button>
            <button
              ref={notificationButtonRef}
              className="rounded-xl border border-stone-200 p-2.5 text-slate-600"
              onClick={() => setNotificationOpen((value) => !value)}
            >
              <BellIcon />
            </button>
            <button
              ref={profileButtonRef}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-ink text-sm font-semibold text-white"
              onClick={() => setProfileOpen((value) => !value)}
            >
              {profile?.avatarUrl ? <img alt="Avatar" className="h-full w-full object-cover" src={profile.avatarUrl} /> : (profile?.displayName?.slice(0, 1) ?? user?.email?.slice(0, 1) ?? "F").toUpperCase()}
            </button>

            {notificationOpen ? (
              <div
                ref={notificationMenuRef}
                className="absolute right-12 top-12 z-30 w-80 rounded-[18px] border border-stone-200 bg-white p-3 shadow-card"
              >
                <div className="space-y-2">
                  {lastNotifications.map((item) => (
                    <button key={item.id} className="w-full rounded-xl px-3 py-2 text-left hover:bg-stone-50" onClick={() => { setActiveSection("notifications"); setNotificationOpen(false); }}>
                      <div className="text-sm font-medium text-ink">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.message}</div>
                    </button>
                  ))}
                  {lastNotifications.length === 0 ? <div className="px-3 py-5 text-center text-sm text-slate-500">No notifications.</div> : null}
                </div>
                <button className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-ink" onClick={() => { setActiveSection("notifications"); setNotificationOpen(false); }}>
                  View all
                </button>
              </div>
            ) : null}

            {profileOpen ? (
              <div
                ref={profileMenuRef}
                className="absolute right-0 top-12 z-30 w-52 rounded-[18px] border border-stone-200 bg-white p-2 shadow-card"
              >
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-stone-50" onClick={() => { setActiveSection("profile"); setProfileOpen(false); }}>
                  View profile
                </button>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-stone-50" onClick={() => { setActiveSection("settings"); setProfileOpen(false); }}>
                  Settings
                </button>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-stone-50" onClick={() => { logout(); setProfileOpen(false); }}>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] bg-white shadow-card">
          {error ? <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{renderPage(activeSection)}</div>
        </div>
      </section>

      <CalendarModal open={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </main>
  );
}

export function App() {
  const token = useSessionStore((state) => state.token);

  if (!token) {
    return <AuthScreen />;
  }

  return <Workspace />;
}
