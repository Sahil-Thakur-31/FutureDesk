import { useEffect } from "react";
import type {
  Certificate,
  DashboardOverview,
  Exam,
  IDVault,
  JobApplication,
  NotificationItem,
  SyncEvent,
  Task,
  UserProfile,
  UserSettings
} from "@futuredesk/shared";
import { apiClient } from "../lib/api";
import { getQueuedOperations, removeQueuedOperation } from "../lib/offlineDb";
import { createSocket } from "../lib/socket";
import { useAppStore } from "../store/appStore";
import { useSessionStore } from "../store/sessionStore";

type EntityMap = {
  exam: "exams";
  jobApplication: "applications";
  certificate: "certificates";
  idVault: "idVault";
  task: "tasks";
};

const entityMap: EntityMap = {
  exam: "exams",
  jobApplication: "applications",
  certificate: "certificates",
  idVault: "idVault",
  task: "tasks"
};

function isCollectionEntity(entity: SyncEvent["entity"]): entity is keyof EntityMap {
  return entity in entityMap;
}

export function useBootstrap(): void {
  const token = useSessionStore((state) => state.token);
  const setDashboard = useAppStore((state) => state.setDashboard);
  const setCollection = useAppStore((state) => state.setCollection);
  const setNotifications = useAppStore((state) => state.setNotifications);
  const setProfile = useAppStore((state) => state.setProfile);
  const setSettings = useAppStore((state) => state.setSettings);
  const setQueue = useAppStore((state) => state.setQueue);
  const setError = useAppStore((state) => state.setError);

  useEffect(() => {
    if (!token) {
      return;
    }

    void Promise.all([
      apiClient.request<DashboardOverview>("/dashboard/overview"),
      apiClient.request<Exam[]>("/exams"),
      apiClient.request<JobApplication[]>("/applications"),
      apiClient.request<Certificate[]>("/certificates"),
      apiClient.request<IDVault[]>("/id-vault"),
      apiClient.request<Task[]>("/tasks"),
      apiClient.request<NotificationItem[]>("/notifications"),
      apiClient.request<UserProfile>("/profile"),
      apiClient.request<UserSettings>("/profile/settings")
    ]).then(([dashboard, exams, applications, certificates, idVault, tasks, notifications, profile, settings]) => {
      setDashboard(dashboard);
      setCollection("exams", exams);
      setCollection("applications", applications);
      setCollection("certificates", certificates);
      setCollection("idVault", idVault);
      setCollection("tasks", tasks);
      setNotifications(notifications);
      setProfile(profile);
      setSettings(settings);
      setError(null);
    }).catch((error) => {
      setError(error instanceof Error ? error.message : "Failed to load workspace");
    });

    void getQueuedOperations().then(async (queue) => {
      setQueue(queue);
      try {
        for (const operation of queue) {
          const pathByEntity = {
            exam: "/exams",
            jobApplication: "/applications",
            certificate: "/certificates",
            idVault: "/id-vault",
            task: "/tasks"
          } as const;

          if (!isCollectionEntity(operation.entity)) {
            continue;
          }

          const basePath = pathByEntity[operation.entity];
          const targetId = (operation.payload as { id?: string } | undefined)?.id;
          const endpoint =
            operation.action === "create" ? basePath : targetId ? `${basePath}/${targetId}` : basePath;
          await apiClient.request(endpoint, {
            method: operation.action === "create" ? "POST" : operation.action === "update" ? "PUT" : "DELETE",
            body: operation.action === "delete" ? undefined : JSON.stringify(operation.payload)
          });
          await removeQueuedOperation(operation.id);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to sync offline changes");
      }
    }).catch((error) => {
      setError(error instanceof Error ? error.message : "Failed to read offline queue");
    });

    const socket = createSocket();
    socket.on("sync:event", (event: SyncEvent<any>) => {
      if (!isCollectionEntity(event.entity)) {
        return;
      }

      const key = entityMap[event.entity];
      const current = useAppStore.getState()[key] as Array<{ id: string }>;
      if (event.action === "deleted") {
        setCollection(key as any, current.filter((item) => item.id !== event.payload.id) as any);
        return;
      }

      const next = [...current.filter((item) => item.id !== event.payload.id), event.payload];
      setCollection(key as any, next as any);
    });
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [token, setCollection, setDashboard, setError, setNotifications, setProfile, setQueue, setSettings]);
}
