import { describe, expect, it } from "vitest";
import type { Project, Task } from "../types/models";
import { buildProjectWithTaskCount } from "./projectMetrics";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  _id: overrides._id ?? "task-1",
  organizationId: overrides.organizationId ?? "org-1",
  projectId: overrides.projectId ?? "project-1",
  title: overrides.title ?? "Sample task",
  description: overrides.description ?? "Task description",
  status: overrides.status ?? "todo",
  priority: overrides.priority ?? "medium",
  assignedTo: overrides.assignedTo ?? null,
  dueDate: overrides.dueDate ?? null,
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
});

describe("buildProjectWithTaskCount", () => {
  const project: Project = {
    _id: "project-1",
    organizationId: "org-1",
    name: "Alpha",
    description: "Alpha project",
    createdBy: "user-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("returns zero when there are no tasks", () => {
    const result = buildProjectWithTaskCount(project, []);

    expect(result).toMatchObject({
      _id: project._id,
      organizationId: project.organizationId,
      name: project.name,
      description: project.description,
      createdBy: project.createdBy,
      taskCount: 0,
    });
  });

  it("returns zero when all tasks belong to different projects", () => {
    const tasks: Task[] = [
      makeTask({ _id: "task-1", projectId: "project-2" }),
      makeTask({ _id: "task-2", projectId: "project-3" }),
    ];

    const result = buildProjectWithTaskCount(project, tasks);

    expect(result.taskCount).toBe(0);
  });

  it("throws when tasks is null", () => {
    expect(() =>
      buildProjectWithTaskCount(project, null as unknown as Task[]),
    ).toThrow();
  });

  it("returns one when exactly one task belongs to the project", () => {
    const tasks: Task[] = [makeTask({ _id: "task-1", projectId: "project-1" })];

    const result = buildProjectWithTaskCount(project, tasks);

    expect(result.taskCount).toBe(1);
  });

  it("returns the total matching task count when multiple tasks belong to the project", () => {
    const tasks: Task[] = [
      makeTask({ _id: "task-1", projectId: "project-1" }),
      makeTask({ _id: "task-2", projectId: "project-1" }),
      makeTask({ _id: "task-3", projectId: "project-2" }),
      makeTask({ _id: "task-4", projectId: "project-1" }),
    ];

    const result = buildProjectWithTaskCount(project, tasks);

    expect(result.taskCount).toBe(3);
  });

  it("preserves project fields and counts only matching project tasks in mixed data", () => {
    const tasks: Task[] = [
      makeTask({ _id: "task-1", projectId: "project-1", title: "Task A" }),
      makeTask({
        _id: "task-2",
        projectId: "project-999",
        title: "Other project",
      }),
      makeTask({ _id: "task-3", projectId: "project-1", title: "Task B" }),
      makeTask({ _id: "task-4", projectId: "project-1", title: "Task C" }),
    ];

    const result = buildProjectWithTaskCount(project, tasks);

    expect(result).toMatchObject({
      _id: project._id,
      name: project.name,
      description: project.description,
      organizationId: project.organizationId,
      taskCount: 3,
    });
  });

  it("handles other edge cases without double-counting or miscounting", () => {
    const tasks: Task[] = [
      makeTask({ _id: "task-1", projectId: "project-1" }),
      makeTask({ _id: "task-2", projectId: "project-1" }),
      makeTask({ _id: "task-3", projectId: "project-1", assignedTo: "user-2" }),
      makeTask({ _id: "task-4", projectId: "project-1", dueDate: null }),
      makeTask({ _id: "task-5", projectId: "project-2" }),
    ];

    const result = buildProjectWithTaskCount(project, tasks);

    expect(result.taskCount).toBe(4);
  });
});
