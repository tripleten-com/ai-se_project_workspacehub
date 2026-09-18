import { buildProjectWithTaskCount } from "../utils/projectMetrics";
import type { Project, ProjectWithTaskCount, Task } from "./models";

export const exampleProject: Project = {
  _id: "project-001",
  organizationId: "org-001",
  name: "Website Redesign",
  description: "Redesign the company marketing website.",
  createdBy: "user-001",
  createdAt: "2026-09-18T17:00:00.000Z",
  updatedAt: "2026-09-18T17:30:00.000Z",
};

export const exampleTask: Task = {
  _id: "task-001",
  organizationId: "org-001",
  projectId: exampleProject._id,
  title: "Create homepage wireframe",
  description: "Prepare the first wireframe for the redesigned homepage.",
  status: "todo",
  priority: "medium",
  assignedTo: "user-002",
  dueDate: "2026-09-25T17:00:00.000Z",
  createdAt: "2026-09-18T18:00:00.000Z",
  updatedAt: "2026-09-18T18:15:00.000Z",
};

const exampleTasks: Task[] = [exampleTask];

export const exampleProjectWithTaskCount: ProjectWithTaskCount =
  buildProjectWithTaskCount(exampleProject, exampleTasks);
