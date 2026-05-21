import type { Request, Response } from "express";
import { SearchService } from "../services/SearchService.js";

export class SearchController {
  constructor(private readonly searchService = new SearchService()) {}

  search = async (request: Request, response: Response): Promise<void> => {
    const query = String(request.query.q ?? "").trim();

    if (!query) {
      response.status(400).json({ message: "Search query is required" });
      return;
    }

    const results = await this.searchService.search(request.user!.id, query);
    response.json(results);
  };
}
