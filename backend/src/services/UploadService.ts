import crypto from "node:crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import { b2Client } from "../lib/b2.js";

export class UploadService {
  async upload(file: Express.Multer.File): Promise<{ key: string; url: string }> {
    const extension = file.originalname.split(".").pop() ?? "bin";
    const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    await b2Client.send(
      new PutObjectCommand({
        Bucket: env.B2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    return {
      key,
      url: `${env.API_PUBLIC_URL}/uploads/file/${encodeURIComponent(key)}`
    };
  }

  async getFile(key: string) {
    return b2Client.send(
      new GetObjectCommand({
        Bucket: env.B2_BUCKET,
        Key: key
      })
    );
  }
}
