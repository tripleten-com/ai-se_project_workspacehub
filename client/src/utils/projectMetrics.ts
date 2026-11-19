import type {
  Project,
  ProjectWithTaskCount,
  Task,
} from "../types/models";

export const buildProjectWithTaskCount = (
  project: Project,
  tasks: Task[]
): ProjectWithTaskCount => {
  const taskCountsByProjectId = new Map<string, number>();

  for (const task of tasks) {
    taskCountsByProjectId.set(
      task.projectId,
      (taskCountsByProjectId.get(task.projectId) ?? 0) + 1,
    );
  }

  return { ...project, taskCount: taskCountsByProjectId.get(project._id) ?? 0,
  };
};
