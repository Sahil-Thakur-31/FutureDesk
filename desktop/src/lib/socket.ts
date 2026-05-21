import { io } from "socket.io-client";
import { useSessionStore } from "../store/sessionStore";

export function createSocket() {
  const { user } = useSessionStore.getState();

  return io(import.meta.env.VITE_API_URL ?? "http://localhost:4000", {
    autoConnect: false,
    auth: {
      userId: user?.id
    }
  });
}
