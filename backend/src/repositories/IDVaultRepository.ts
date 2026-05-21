import type { IDVaultFilters } from "@futuredesk/shared";
import { IDVaultModel, type IDVaultDocument } from "../models/IDVaultModel.js";
import { BaseRepository } from "./BaseRepository.js";

export class IDVaultRepository extends BaseRepository<IDVaultDocument> {
  constructor() {
    super(IDVaultModel);
  }

  protected override buildListQuery(userId: string, filters: IDVaultFilters) {
    const query = super.buildListQuery(userId, filters) as Record<string, unknown>;

    if (filters.documentType) {
      query.documentType =
        filters.documentType === "__exists__"
          ? { $exists: true, $ne: "" }
          : { $regex: filters.documentType, $options: "i" };
    }
    if (filters.issuingAuthority) {
      query.issuingAuthority =
        filters.issuingAuthority === "__exists__"
          ? { $exists: true, $ne: "" }
          : { $regex: filters.issuingAuthority, $options: "i" };
    }
    if (filters.country) {
      query.country =
        filters.country === "__exists__" ? { $exists: true, $ne: "" } : { $regex: filters.country, $options: "i" };
    }
    if (filters.expiringBefore) {
      query.expiryDate = { $lte: new Date(filters.expiringBefore) };
    }

    return query;
  }
}
