import type { Request, Response } from "express";

type CrudService<TResponse> = {
  list(userId: string, filters: Record<string, unknown>): Promise<TResponse[]>;
  create(userId: string, payload: unknown): Promise<TResponse>;
  update(userId: string, id: string, payload: unknown): Promise<TResponse | null>;
  remove(userId: string, id: string): Promise<boolean>;
};

export class CrudController<TResponse> {
  constructor(private readonly service: CrudService<TResponse>) {}

  list = async (request: Request, response: Response): Promise<void> => {
    const items = await this.service.list(request.user!.id, request.query as Record<string, unknown>);
    response.json(items);
  };

  create = async (request: Request, response: Response): Promise<void> => {
    const item = await this.service.create(request.user!.id, request.body);
    response.status(201).json(item);
  };

  update = async (request: Request, response: Response): Promise<void> => {
    const item = await this.service.update(request.user!.id, String(request.params.id), request.body);
    if (!item) {
      response.status(404).json({ message: "Resource not found" });
      return;
    }
    response.json(item);
  };

  remove = async (request: Request, response: Response): Promise<void> => {
    const removed = await this.service.remove(request.user!.id, String(request.params.id));
    if (!removed) {
      response.status(404).json({ message: "Resource not found" });
      return;
    }
    response.status(204).send();
  };
}
