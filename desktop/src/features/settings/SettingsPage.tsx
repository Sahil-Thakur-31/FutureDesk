import { useAppStore } from "../../store/appStore";

export function SettingsPage() {
  const queue = useAppStore((state) => state.queue);
  const settings = useAppStore((state) => state.settings);
  const profile = useAppStore((state) => state.profile);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-[22px] bg-white p-5 shadow-card">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Calendar</div>
        <div className="mt-2 font-display text-xl font-semibold text-ink">Google Calendar</div>
        <div className="mt-2 text-sm text-slate-500">
          {settings?.calendarPreferences.connectedGoogleEmail ?? profile?.email}
        </div>
        <button
          className="mt-4 rounded-xl bg-ink px-4 py-2 text-sm text-white"
          onClick={() => window.open("https://calendar.google.com/calendar/u/0/r", "_blank", "noopener,noreferrer")}
        >
          Open Google Calendar
        </button>
      </div>
      <div className="rounded-[22px] bg-white p-5 shadow-card">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Preferences</div>
        <div className="mt-2 font-display text-xl font-semibold text-ink">Notifications and sync</div>
        <div className="mt-2 text-sm text-slate-500">
          {queue.length} pending operations, in-app notifications {settings?.notificationPreferences.inAppEnabled ? "enabled" : "disabled"}
        </div>
      </div>
    </div>
  );
}
