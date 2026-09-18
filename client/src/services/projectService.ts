import { api, unwrapResponse } from "./api";
import type {
  Project,
  ProjectCreatePayload,
  ProjectUpdatePayload,
} from "../types/models";

export const projectService = {
  list: () => unwrapResponse<Project[]>(api.get("/projects")),
  getById: (id: string) => unwrapResponse<Project>(api.get(`/projects/${id}`)),
  create: (payload: ProjectCreatePayload) =>
    unwrapResponse<Project>(api.post("/projects", payload)),
  update: (id: string, payload: ProjectUpdatePayload) =>
    unwrapResponse<Project>(api.patch(`/projects/${id}`, payload)),
  delete: (id: string) =>
    unwrapResponse<{ deleted: boolean }>(api.delete(`/projects/${id}`)),
};
