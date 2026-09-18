import { describe, expect, it } from "vitest";
import type { Project, Task } from "../types/models";
import { buildProjectWithTaskCount } from "./projectMetrics";

const project: Project = {
  _id: "project-1",
  organizationId: "org-1",
  name: "Website Redesign",
  description: "Redesign the website.",
  createdBy: "user-1",
  createdAt: "2026-09-18T10:00:00.000Z",
  updatedAt: "2026-09-18T10:00:00.000Z",
};

const taskFor = (id: string, projectId: string): Task => ({
  _id: id,
  organizationId: "org-1",
  projectId,
  title: `Task ${id}`,
  description: "",
  status: "todo",
  priority: "medium",
  assignedTo: "user-1",
  dueDate: "2026-09-30T10:00:00.000Z",
  createdAt: "2026-09-18T10:00:00.000Z",
  updatedAt: "2026-09-18T10:00:00.000Z",
});

describe("buildProjectWithTaskCount", () => {
  it("counts tasks belonging to the project", () => {
    const tasks = [
      taskFor("task-1", "project-1"),
      taskFor("task-2", "project-1"),
    ];

    expect(buildProjectWithTaskCount(project, tasks).taskCount).toBe(2);
  });

  it("returns zero when there are no tasks", () => {
    expect(buildProjectWithTaskCount(project, []).taskCount).toBe(0);
  });

  it("does not count tasks belonging to a different project", () => {
    const tasks = [
      taskFor("task-1", "project-1"),
      taskFor("task-2", "project-2"),
    ];

    expect(buildProjectWithTaskCount(project, tasks).taskCount).toBe(1);
  });
});
