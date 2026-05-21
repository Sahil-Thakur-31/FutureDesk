import type { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService.js";
import { NotificationService } from "../services/NotificationService.js";

export class DashboardController {
  constructor(
    private readonly dashboardService = new DashboardService(),
    private readonly notificationService = new NotificationService()
  ) {}

  overview = async (request: Request, response: Response): Promise<void> => {
    const data = await this.dashboardService.getOverview(request.user!.id);
    response.json(data);
  };

  notifications = async (request: Request, response: Response): Promise<void> => {
    const data = await this.notificationService.list(request.user!.id);
    response.json(data);
  };
}
