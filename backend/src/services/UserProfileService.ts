import { userProfileSchema, userSettingsSchema, type UserProfile, type UserSettings } from "@futuredesk/shared";
import { UserProfileRepository } from "../repositories/UserProfileRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { toUserProfile } from "../utils/mappers.js";

export class UserProfileService {
  constructor(
    private readonly profileRepository = new UserProfileRepository(),
    private readonly userRepository = new UserRepository()
  ) {}

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.ensureProfile(userId);
    return toUserProfile(profile);
  }

  async updateProfile(userId: string, payload: unknown): Promise<UserProfile> {
    const parsed = (userProfileSchema as any).partial({ settings: true }).parse(payload);
    const updated = await this.profileRepository.updateByUserId(userId, parsed as any);
    const profile = updated ?? (await this.ensureProfile(userId));
    return toUserProfile(profile);
  }

  async getSettings(userId: string): Promise<UserSettings> {
    const profile = await this.ensureProfile(userId);
    return toUserProfile(profile).settings;
  }

  async updateSettings(userId: string, payload: unknown): Promise<UserSettings> {
    const parsed = userSettingsSchema.parse(payload);
    const updated = await this.profileRepository.updateByUserId(userId, { settings: parsed });
    const profile = updated ?? (await this.ensureProfile(userId));
    return toUserProfile(profile).settings;
  }

  private async ensureProfile(userId: string) {
    const existing = await this.profileRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User profile not found");
    }

    return this.profileRepository.create({
      userId,
      email: user.email,
      displayName: user.email.split("@")[0],
      timezone: "Asia/Kolkata",
      locale: "en-IN",
      targetRoles: [],
      settings: {}
    } as any);
  }
}
