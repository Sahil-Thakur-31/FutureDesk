import type { Request, Response } from "express";
import { NotificationService } from "../services/NotificationService.js";

export class NotificationController {
  constructor(private readonly notificationService = new NotificationService()) {}

  list = async (request: Request, response: Response): Promise<void> => {
    const data = await this.notificationService.list(request.user!.id);
    response.json(data);
  };

  markRead = async (request: Request, response: Response): Promise<void> => {
    const item = await this.notificationService.markRead(request.user!.id, String(request.params.id));
    if (!item) {
      response.status(404).json({ message: "Notification not found" });
      return;
    }

    response.json(item);
  };
}
