import type { Project, Task } from "./models";
import type { ProjectWithTaskCount } from "./views";
import { buildProjectWithTaskCount } from "../utils/projectMetrics";

export const exampleProject: Project = {
  _id: "project-example-1",
  organizationId: "organization-example-1",
  name: "Workspace Refresh",
  description: "Improve the internal workspace experience.",
  createdBy: "user-example-1",
  createdAt: "2026-10-12T09:00:00.000Z",
  updatedAt: "2026-10-12T09:00:00.000Z",
};

export const exampleTask: Task = {
  _id: "task-example-1",
  organizationId: "organization-example-1",
  projectId: "project-example-1",
  title: "Review project navigation",
  description: "Identify improvements to the project navigation.",
  status: "todo",
  priority: "medium",
  assignedTo: null,
  dueDate: "2026-10-19T17:00:00.000Z",
  createdAt: "2026-10-12T09:30:00.000Z",
  updatedAt: "2026-10-12T09:30:00.000Z",
};

export const exampleProjectWithTaskCount: ProjectWithTaskCount =
  buildProjectWithTaskCount(exampleProject, [exampleTask]);
