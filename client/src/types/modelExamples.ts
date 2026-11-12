import type { Project, ProjectWithTaskCount, Task } from "./models";
import { buildProjectWithTaskCount } from "../utils/projectMetrics";

export const exampleProject: Project = {
  _id: "project-101",
  organizationId: "org-123",
  name: "Website Redesign",
  description: "Refresh the marketing site and improve conversion flow.",
  createdBy: "user-42",
  createdAt: "2026-10-01T09:30:00.000Z",
  updatedAt: "2026-10-12T15:45:00.000Z",
};

export const exampleTask: Task = {
  _id: "task-201",
  organizationId: "org-123",
  projectId: exampleProject._id,
  title: "Finalize landing page copy",
  description: "Review headline and CTA copy for the new homepage.",
  status: "todo",
  priority: "medium",
  assignedTo: "user-42",
  dueDate: "2026-10-18T17:00:00.000Z",
  createdAt: "2026-10-13T10:00:00.000Z",
  updatedAt: "2026-10-13T10:00:00.000Z",
};

export const exampleProjectWithTaskCount: ProjectWithTaskCount =
  buildProjectWithTaskCount(exampleProject, [exampleTask]);
