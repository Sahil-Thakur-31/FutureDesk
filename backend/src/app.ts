import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { authRoutes } from "./routes/authRoutes.js";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { applicationRoutes, certificateRoutes, examRoutes, idVaultRoutes, taskRoutes } from "./routes/entityRoutes.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";
import { profileRoutes } from "./routes/profileRoutes.js";
import { searchRoutes } from "./routes/searchRoutes.js";
import { uploadRoutes } from "./routes/uploadRoutes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: [env.CLIENT_URL, env.DESKTOP_URL],
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/auth", authRoutes);
  app.use(authMiddleware);
  app.use("/dashboard", dashboardRoutes);
  app.use("/notifications", notificationRoutes);
  app.use("/profile", profileRoutes);
  app.use("/search", searchRoutes);
  app.use("/uploads", uploadRoutes);
  app.use("/exams", examRoutes);
  app.use("/applications", applicationRoutes);
  app.use("/certificates", certificateRoutes);
  app.use("/id-vault", idVaultRoutes);
  app.use("/tasks", taskRoutes);

  app.use(errorMiddleware);
  return app;
}
