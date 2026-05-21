import { formatDate } from "@futuredesk/shared";
import { apiClient } from "../../lib/api";
import { useAppStore } from "../../store/appStore";

export function NotificationsPage() {
  const notifications = useAppStore((state) => state.notifications);
  const setNotifications = useAppStore((state) => state.setNotifications);

  return (
    <div className="rounded-[22px] bg-white p-4 shadow-card">
      <div className="space-y-3">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            className="w-full rounded-[18px] border border-stone-200 px-4 py-3 text-left"
            onClick={() => {
              void apiClient.request(`/notifications/${notification.id}/read`, { method: "PATCH" }).then(() => {
                setNotifications(
                  notifications.map((item) =>
                    item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item
                  )
                );
              });
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium text-ink">{notification.title}</div>
                <div className="mt-1 text-sm text-slate-500">{notification.message}</div>
              </div>
              <div className="text-xs text-slate-400">{formatDate(notification.scheduledFor)}</div>
            </div>
          </button>
        ))}
        {notifications.length === 0 ? <div className="py-10 text-center text-sm text-slate-500">No notifications.</div> : null}
      </div>
    </div>
  );
}
