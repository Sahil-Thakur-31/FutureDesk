import { openDB } from "idb";
import type { OfflineOperation } from "@futuredesk/shared";

const dbPromise = openDB("futuredesk-desktop", 1, {
  upgrade(database) {
    database.createObjectStore("offlineQueue", {
      keyPath: "id"
    });
  }
});

export async function enqueueOperation(operation: OfflineOperation): Promise<void> {
  const db = await dbPromise;
  await db.put("offlineQueue", operation);
}

export async function getQueuedOperations(): Promise<OfflineOperation[]> {
  const db = await dbPromise;
  return db.getAll("offlineQueue");
}

export async function removeQueuedOperation(id: string): Promise<void> {
  const db = await dbPromise;
  await db.delete("offlineQueue", id);
}
