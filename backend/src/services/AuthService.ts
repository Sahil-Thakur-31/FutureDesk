import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema, type AuthResponse } from "@futuredesk/shared";
import { env } from "../config/env.js";
import { UserProfileRepository } from "../repositories/UserProfileRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { toUser } from "../utils/mappers.js";

export class AuthService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly userProfileRepository = new UserProfileRepository()
  ) {}

  async register(input: unknown): Promise<AuthResponse> {
    const { email, password } = registerSchema.parse(input);
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("Email already in use");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepository.create(email, passwordHash);

    await this.userProfileRepository.create({
      userId: user._id,
      email: user.email,
      displayName: email.split("@")[0],
      timezone: "Asia/Kolkata",
      locale: "en-IN",
      targetRoles: [],
      settings: {}
    } as any);

    return {
      user: toUser(user),
      tokens: {
        accessToken: this.signToken(user._id.toString(), user.email)
      }
    };
  }

  async login(input: unknown): Promise<AuthResponse> {
    const { email, password } = loginSchema.parse(input);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new Error("Invalid credentials");
    }

    return {
      user: toUser(user),
      tokens: {
        accessToken: this.signToken(user._id.toString(), user.email)
      }
    };
  }

  verifyToken(token: string): { sub: string; email: string } {
    return jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string };
  }

  private signToken(userId: string, email: string): string {
    return jwt.sign({ email }, env.JWT_SECRET, {
      subject: userId,
      expiresIn: "7d"
    });
  }
}
