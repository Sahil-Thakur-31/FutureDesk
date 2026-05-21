import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

export const b2Client = new S3Client({
  region: "us-west-000",
  endpoint: env.B2_ENDPOINT,
  credentials: {
    accessKeyId: env.B2_ACCESS_KEY,
    secretAccessKey: env.B2_SECRET_KEY
  }
});
