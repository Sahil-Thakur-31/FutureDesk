import type { SyncEvent } from "@futuredesk/shared";
import type { ZodTypeAny } from "zod";
import { ioManager } from "../socket/io.js";

type Repository<TDocument> = {
  listByUser(userId: string, filters?: Record<string, unknown>): Promise<TDocument[]>;
  create(payload: Partial<TDocument>): Promise<TDocument>;
  updateById(userId: string, id: string, payload: Partial<TDocument>): Promise<TDocument | null>;
  deleteById(userId: string, id: string): Promise<boolean>;
};

export class CrudService<TDocument, TResponse> {
  constructor(
    private readonly repository: Repository<TDocument>,
    private readonly schema: ZodTypeAny,
    private readonly mapper: (document: TDocument) => TResponse,
    private readonly entity: SyncEvent["entity"],
    private readonly filterSchema?: ZodTypeAny
  ) {}

  async list(userId: string, filters: Record<string, unknown> = {}): Promise<TResponse[]> {
    const parsedFilters = this.filterSchema ? this.filterSchema.parse(filters) : filters;
    const items = await this.repository.listByUser(userId, parsedFilters);
    return items.map(this.mapper);
  }

  async create(userId: string, payload: unknown): Promise<TResponse> {
    const parsedPayload = this.schema.parse(payload) as Partial<TDocument>;
    const created = await this.repository.create({
      ...parsedPayload,
      userId
    } as Partial<TDocument>);
    const response = this.mapper(created);
    ioManager.emitUserEvent(userId, { entity: this.entity, action: "created", payload: response });
    return response;
  }

  async update(userId: string, id: string, payload: unknown): Promise<TResponse | null> {
    const parsedPayload = (this.schema as any).partial().parse(payload) as Partial<TDocument>;
    const updated = await this.repository.updateById(userId, id, parsedPayload);

    if (!updated) {
      return null;
    }

    const response = this.mapper(updated);
    ioManager.emitUserEvent(userId, { entity: this.entity, action: "updated", payload: response });
    return response;
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const removed = await this.repository.deleteById(userId, id);
    if (removed) {
      ioManager.emitUserEvent(userId, { entity: this.entity, action: "deleted", payload: { id } });
    }
    return removed;
  }
}
