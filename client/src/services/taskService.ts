import { api, unwrapResponse } from "./api";
import type {
  Task,
  TaskCreatePayload,
  TaskUpdatePayload,
} from "../types/models";

export const taskService = {
  list: (projectId?: string) =>
    unwrapResponse<Task[]>(
      api.get("/tasks", {
        params: projectId ? { projectId } : undefined,
      }),
    ),
  getById: (id: string) => unwrapResponse<Task>(api.get(`/tasks/${id}`)),
  create: (payload: TaskCreatePayload) =>
    unwrapResponse<Task>(api.post("/tasks", payload)),
  update: (id: string, payload: TaskUpdatePayload) =>
    unwrapResponse<Task>(api.patch(`/tasks/${id}`, payload)),
  delete: (id: string) =>
    unwrapResponse<{ deleted: boolean }>(api.delete(`/tasks/${id}`)),
};
