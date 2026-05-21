import type { Request, Response } from "express";
import { UserProfileService } from "../services/UserProfileService.js";

export class UserProfileController {
  constructor(private readonly userProfileService = new UserProfileService()) {}

  getProfile = async (request: Request, response: Response): Promise<void> => {
    const profile = await this.userProfileService.getProfile(request.user!.id);
    response.json(profile);
  };

  updateProfile = async (request: Request, response: Response): Promise<void> => {
    const profile = await this.userProfileService.updateProfile(request.user!.id, request.body);
    response.json(profile);
  };

  getSettings = async (request: Request, response: Response): Promise<void> => {
    const settings = await this.userProfileService.getSettings(request.user!.id);
    response.json(settings);
  };

  updateSettings = async (request: Request, response: Response): Promise<void> => {
    const settings = await this.userProfileService.updateSettings(request.user!.id, request.body);
    response.json(settings);
  };
}
