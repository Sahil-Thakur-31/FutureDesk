import { UserProfileModel, type UserProfileDocument } from "../models/UserProfileModel.js";

export class UserProfileRepository {
  async findByUserId(userId: string): Promise<UserProfileDocument | null> {
    return (await UserProfileModel.findOne({ userId }).lean()) as UserProfileDocument | null;
  }

  async create(payload: Partial<UserProfileDocument>): Promise<UserProfileDocument> {
    return (await UserProfileModel.create(payload)).toObject() as unknown as UserProfileDocument;
  }

  async updateByUserId(userId: string, payload: Partial<UserProfileDocument>): Promise<UserProfileDocument | null> {
    return (await UserProfileModel.findOneAndUpdate({ userId }, payload, { new: true, lean: true }).exec()) as UserProfileDocument | null;
  }
}
