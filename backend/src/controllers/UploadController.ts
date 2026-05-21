import crypto from "node:crypto";
import type { Request, Response } from "express";
import { UploadService } from "../services/UploadService.js";

export class UploadController {
  constructor(private readonly uploadService = new UploadService()) {}

  upload = async (request: Request, response: Response): Promise<void> => {
    if (!request.file) {
      response.status(400).json({ message: "No file uploaded" });
      return;
    }

    const uploaded = await this.uploadService.upload(request.file);
    response.status(201).json({
      id: crypto.randomUUID(),
      name: request.file.originalname,
      url: uploaded.url,
      mimeType: request.file.mimetype,
      size: request.file.size,
      uploadedAt: new Date().toISOString()
    });
  };

  getFile = async (request: Request, response: Response): Promise<void> => {
    const key = decodeURIComponent(String(request.params.key));
    const file = await this.uploadService.getFile(key);

    if (file.ContentType) {
      response.setHeader("Content-Type", file.ContentType);
    }

    if (file.ContentLength) {
      response.setHeader("Content-Length", String(file.ContentLength));
    }

    if (file.LastModified) {
      response.setHeader("Last-Modified", file.LastModified.toUTCString());
    }

    response.setHeader("Cache-Control", "private, max-age=60");

    const body = file.Body as { pipe?: (destination: Response) => void } | undefined;

    if (!body?.pipe) {
      response.status(404).json({ message: "File not found" });
      return;
    }

    body.pipe(response);
  };
}
