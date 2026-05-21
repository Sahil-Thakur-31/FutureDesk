import crypto from "node:crypto";
import { env } from "../config/env.js";

const algorithm = "aes-256-gcm";
const key = crypto.createHash("sha256").update(env.ENCRYPTION_KEY).digest();

export function encryptText(value: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}
