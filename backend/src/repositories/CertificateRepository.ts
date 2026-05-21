import type { CertificateFilters } from "@futuredesk/shared";
import { CertificateModel, type CertificateDocument } from "../models/CertificateModel.js";
import { BaseRepository } from "./BaseRepository.js";

export class CertificateRepository extends BaseRepository<CertificateDocument> {
  constructor() {
    super(CertificateModel);
  }

  protected override buildListQuery(userId: string, filters: CertificateFilters) {
    const query = super.buildListQuery(userId, filters) as Record<string, unknown>;

    if (filters.category) {
      query.category =
        filters.category === "__exists__" ? { $exists: true, $ne: "" } : { $regex: filters.category, $options: "i" };
    }
    if (filters.issuer) {
      query.issuer =
        filters.issuer === "__exists__" ? { $exists: true, $ne: "" } : { $regex: filters.issuer, $options: "i" };
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.verificationStatus) {
      query.verificationStatus = filters.verificationStatus;
    }
    if (filters.expiringBefore) {
      query.expiryDate = { $lte: new Date(filters.expiringBefore) };
    }
    if (filters.renewalRequired) {
      query.renewalRequired = true;
    }

    return query;
  }
}
