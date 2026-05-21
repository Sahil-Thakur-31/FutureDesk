import { UserModel, type UserDocument } from "../models/UserModel.js";

export class UserRepository {
  async create(email: string, passwordHash: string): Promise<UserDocument> {
    return (await UserModel.create({ email, passwordHash })).toObject() as unknown as UserDocument;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return (await UserModel.findOne({ email: email.toLowerCase() }).lean()) as UserDocument | null;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return (await UserModel.findById(id).lean()) as UserDocument | null;
  }
}
