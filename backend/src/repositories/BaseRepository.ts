import type { FilterQuery, Model, SortOrder, UpdateQuery } from "mongoose";

type ListFilters = {
  search?: string;
  tags?: string[];
  includeArchived?: boolean;
  hasAttachments?: boolean;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export class BaseRepository<TDocument> {
  constructor(protected readonly model: Model<any>) {}

  async listByUser(userId: string, filters: Record<string, unknown> = {}): Promise<TDocument[]> {
    const listFilters = filters as ListFilters;
    const query = this.buildListQuery(userId, listFilters);
    const sort = this.buildSort(listFilters);

    return (await this.model.find(query).sort(sort).limit(listFilters.limit ?? 100).lean()) as TDocument[];
  }

  async create(payload: Partial<TDocument>): Promise<TDocument> {
    return (await this.model.create(payload)).toObject() as unknown as TDocument;
  }

  async updateById(userId: string, id: string, payload: UpdateQuery<TDocument>): Promise<TDocument | null> {
    return (await this.model
      .findOneAndUpdate({ _id: id, userId } as FilterQuery<TDocument>, payload, {
        new: true,
        lean: true
      })
      .exec()) as TDocument | null;
  }

  async deleteById(userId: string, id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id, userId } as FilterQuery<TDocument>);
    return result.deletedCount > 0;
  }

  async searchByUser(userId: string, query: string): Promise<TDocument[]> {
    return (await this.model
      .find({
        ...this.buildListQuery(userId, {}),
        $text: { $search: query }
      } as FilterQuery<TDocument>)
      .lean()) as TDocument[];
  }

  protected buildListQuery(userId: string, filters: ListFilters): FilterQuery<TDocument> {
    const query: Record<string, unknown> = { userId };

    if (!filters.includeArchived) {
      query.archivedAt = { $exists: false };
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }

    if (filters.hasAttachments) {
      query["attachments.0"] = { $exists: true };
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    return query as FilterQuery<TDocument>;
  }

  protected buildSort(filters: ListFilters): Record<string, SortOrder> {
    const direction: SortOrder = filters.sortOrder === "asc" ? 1 : -1;
    return { [filters.sortBy ?? "createdAt"]: direction };
  }
}
