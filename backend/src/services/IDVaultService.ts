import { idVaultFilterSchema, idVaultSchema, type IDVault } from "@futuredesk/shared";
import { IDVaultRepository } from "../repositories/IDVaultRepository.js";
import { ioManager } from "../socket/io.js";
import { encryptText } from "../utils/crypto.js";
import { toIDVault } from "../utils/mappers.js";

export class IDVaultService {
  constructor(private readonly repository = new IDVaultRepository()) {}

  async list(userId: string, filters: Record<string, unknown> = {}): Promise<IDVault[]> {
    const parsedFilters = idVaultFilterSchema.parse(filters);
    const items = await this.repository.listByUser(userId, parsedFilters);
    return items.map((item) => toIDVault({ ...item, encryptedNumber: item.maskedNumber ?? "********" }));
  }

  async create(userId: string, payload: unknown): Promise<IDVault> {
    const parsed = idVaultSchema.parse(payload);
    const created = await this.repository.create({
      ...parsed,
      maskedNumber: parsed.maskedNumber ?? parsed.encryptedNumber.slice(-4).padStart(parsed.encryptedNumber.length, "*"),
      encryptedNumber: encryptText(parsed.encryptedNumber),
      encryptionKeyVersion: parsed.encryptionKeyVersion ?? "v1",
      userId
    } as any);
    const response = toIDVault({ ...created, encryptedNumber: created.maskedNumber ?? "********" });
    ioManager.emitUserEvent(userId, { entity: "idVault", action: "created", payload: response });
    return response;
  }

  async update(userId: string, id: string, payload: unknown): Promise<IDVault | null> {
    const parsed = idVaultSchema.partial().parse(payload);
    const updatePayload = parsed.encryptedNumber
      ? {
          ...parsed,
          maskedNumber: parsed.maskedNumber ?? parsed.encryptedNumber.slice(-4).padStart(parsed.encryptedNumber.length, "*"),
          encryptedNumber: encryptText(parsed.encryptedNumber),
          encryptionKeyVersion: parsed.encryptionKeyVersion ?? "v1"
        }
      : parsed;
    const updated = await this.repository.updateById(userId, id, updatePayload as any);

    if (!updated) {
      return null;
    }

    const response = toIDVault({ ...updated, encryptedNumber: updated.maskedNumber ?? "********" });
    ioManager.emitUserEvent(userId, { entity: "idVault", action: "updated", payload: response });
    return response;
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const removed = await this.repository.deleteById(userId, id);
    if (removed) {
      ioManager.emitUserEvent(userId, { entity: "idVault", action: "deleted", payload: { id } });
    }
    return removed;
  }
}
