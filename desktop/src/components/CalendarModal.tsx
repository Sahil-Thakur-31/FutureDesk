import { formatDate } from "@futuredesk/shared";
import { useAppStore } from "../store/appStore";
import { useSessionStore } from "../store/sessionStore";
import { Modal } from "./Modal";

type CalendarModalProps = {
  open: boolean;
  onClose: () => void;
};

function createIcs(events: Array<{ title: string; description: string; date: string }>) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FutureDesk//Schedule//EN"];

  for (const event of events) {
    const start = new Date(event.date).toISOString().replace(/[-:]/g, "").replace(".000", "");
    const end = new Date(new Date(event.date).getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, "").replace(".000", "");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${start}-${event.title}@futuredesk`);
    lines.push(`DTSTAMP:${start}`);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${event.title}`);
    lines.push(`DESCRIPTION:${event.description}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function CalendarModal({ open, onClose }: CalendarModalProps) {
  const user = useSessionStore((state) => state.user);
  const exams = useAppStore((state) => state.exams);
  const applications = useAppStore((state) => state.applications);
  const certificates = useAppStore((state) => state.certificates);
  const tasks = useAppStore((state) => state.tasks);

  const schedule = [
    ...exams.map((item) => ({ id: item.id, title: item.examName, description: item.organization, date: item.examDate })),
    ...applications.map((item) => ({ id: item.id, title: `${item.company} ${item.role}`, description: item.status, date: item.applicationDate })),
    ...certificates.filter((item) => item.expiryDate).map((item) => ({ id: item.id, title: `${item.title} expiry`, description: item.category, date: item.expiryDate! })),
    ...tasks.filter((item) => item.deadline).map((item) => ({ id: item.id, title: item.title, description: item.status, date: item.deadline! }))
  ].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  const exportCalendar = () => {
    const blob = new Blob([createIcs(schedule)], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "futuredesk-schedule.ics";
    anchor.click();
    URL.revokeObjectURL(href);
  };

  return (
    <Modal
      title="Calendar"
      open={open}
      onClose={onClose}
      actions={
        <>
          <button className="rounded-xl border border-stone-200 px-4 py-2 text-sm" onClick={exportCalendar}>
            Sync Google Calendar
          </button>
          <button className="rounded-xl bg-ink px-4 py-2 text-sm text-white" onClick={() => window.open("https://calendar.google.com/calendar/u/0/r", "_blank", "noopener,noreferrer")}>
            {user?.email}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {schedule.map((item) => (
          <div key={item.id} className="rounded-[18px] border border-stone-200 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-ink">{item.title}</div>
                <div className="text-sm text-slate-500">{item.description}</div>
              </div>
              <div className="text-sm text-slate-500">{formatDate(item.date)}</div>
            </div>
          </div>
        ))}
        {schedule.length === 0 ? <div className="py-10 text-center text-sm text-slate-500">No scheduled items.</div> : null}
      </div>
    </Modal>
  );
}
