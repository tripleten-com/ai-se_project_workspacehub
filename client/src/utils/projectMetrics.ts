import type { Project, Task } from "../types/models";
import type { ProjectWithTaskCount } from "../types/views";

export const buildProjectWithTaskCount = (
  project: Project,
  tasks: Task[],
): ProjectWithTaskCount => ({
  ...project,
  taskCount: tasks.filter((task) => task.projectId === project._id).length,
});
