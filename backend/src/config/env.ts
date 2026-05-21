import "dotenv/config";
import { z } from "zod";

const optionalUrl = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().url().optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_PUBLIC_URL: z.string().url().default("http://localhost:4000"),
  DNS_SERVERS: z.string().default("1.1.1.1,8.8.8.8"),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  DESKTOP_URL: z.string().default("http://localhost:5173"),
  MOBILE_DEEP_LINK: z.string().default("futuredesk://"),
  B2_BUCKET: z.string().min(1),
  B2_ACCESS_KEY: z.string().min(1),
  B2_SECRET_KEY: z.string().min(1),
  B2_ENDPOINT: z.string().url(),
  B2_PUBLIC_URL: optionalUrl,
  ENCRYPTION_KEY: z.string().min(32)
});

export const env = envSchema.parse(process.env);
