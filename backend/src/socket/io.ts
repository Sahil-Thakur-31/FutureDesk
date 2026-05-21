import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";

class IoManager {
  private io?: Server;

  initialize(server: HttpServer): Server {
    this.io = new Server(server, {
      cors: {
        origin: [env.CLIENT_URL, env.DESKTOP_URL],
        credentials: true
      }
    });

    this.io.on("connection", (socket) => {
      const userId = socket.handshake.auth.userId as string | undefined;
      if (userId) {
        socket.join(this.getUserRoom(userId));
      }
    });

    return this.io;
  }

  emitUserEvent(userId: string, event: unknown): void {
    this.io?.to(this.getUserRoom(userId)).emit("sync:event", event);
  }

  private getUserRoom(userId: string): string {
    return `user:${userId}`;
  }
}

export const ioManager = new IoManager();
