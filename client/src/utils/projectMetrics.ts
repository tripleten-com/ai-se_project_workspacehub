import type { Project, ProjectWithTaskCount, Task } from "../types/models";

export function buildProjectWithTaskCount(
  project: Project,
  tasks: Task[],
): ProjectWithTaskCount {
  return {
    ...project,
    taskCount: tasks.filter((task) => task.projectId === project._id).length,
  };
}
