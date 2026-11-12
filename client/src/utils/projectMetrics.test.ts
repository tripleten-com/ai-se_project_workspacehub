import { describe, expect, it } from "vitest";
import type { Project, Task } from "../types/models";
import { buildProjectWithTaskCount } from "./projectMetrics";

const project: Project = {
  _id: "project-1",
  organizationId: "org-1",
  name: "Website redesign",
  description: "Refresh the marketing site",
  createdBy: "user-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const buildTask = (id: string, projectId: string): Task => ({
  _id: id,
  organizationId: "org-1",
  projectId,
  title: `Task ${id}`,
  description: "",
  status: "todo",
  priority: "medium",
  assignedTo: null,
  dueDate: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("buildProjectWithTaskCount", () => {
  it("counts only the tasks that belong to the project", () => {
    const tasks = [
      buildTask("task-1", "project-1"),
      buildTask("task-2", "project-2"),
      buildTask("task-3", "project-1"),
    ];

    expect(buildProjectWithTaskCount(project, tasks).taskCount).toBe(2);
  });

  it("reports zero when the project has no tasks", () => {
    const tasks = [buildTask("task-1", "project-2")];

    expect(buildProjectWithTaskCount(project, tasks).taskCount).toBe(0);
    expect(buildProjectWithTaskCount(project, []).taskCount).toBe(0);
  });

  it("keeps the original project fields", () => {
    const result = buildProjectWithTaskCount(project, []);

    expect(result).toMatchObject(project);
  });

  it("does not mutate the project or the task list", () => {
    const tasks = [buildTask("task-1", "project-1")];
    const projectBefore = structuredClone(project);
    const tasksBefore = structuredClone(tasks);

    buildProjectWithTaskCount(project, tasks);

    expect(project).toEqual(projectBefore);
    expect(project).not.toHaveProperty("taskCount");
    expect(tasks).toEqual(tasksBefore);
  });
});
