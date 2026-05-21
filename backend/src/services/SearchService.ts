import type { SearchResults } from "@futuredesk/shared";
import { CertificateRepository } from "../repositories/CertificateRepository.js";
import { ExamRepository } from "../repositories/ExamRepository.js";
import { IDVaultRepository } from "../repositories/IDVaultRepository.js";
import { JobApplicationRepository } from "../repositories/JobApplicationRepository.js";
import { TaskRepository } from "../repositories/TaskRepository.js";
import { toCertificate, toExam, toIDVault, toJobApplication, toTask } from "../utils/mappers.js";

export class SearchService {
  constructor(
    private readonly exams = new ExamRepository(),
    private readonly applications = new JobApplicationRepository(),
    private readonly certificates = new CertificateRepository(),
    private readonly idVault = new IDVaultRepository(),
    private readonly tasks = new TaskRepository()
  ) {}

  async search(userId: string, query: string): Promise<SearchResults> {
    const [exams, jobApplications, certificates, idVault, tasks] = await Promise.all([
      this.exams.searchByUser(userId, query),
      this.applications.searchByUser(userId, query),
      this.certificates.searchByUser(userId, query),
      this.idVault.searchByUser(userId, query),
      this.tasks.searchByUser(userId, query)
    ]);

    return {
      exams: exams.map(toExam),
      jobApplications: jobApplications.map(toJobApplication),
      certificates: certificates.map(toCertificate),
      idVault: idVault.map((item) => toIDVault({ ...item, encryptedNumber: item.maskedNumber ?? "********" })),
      tasks: tasks.map(toTask)
    };
  }
}
