import { Types } from "mongoose";
import { Comment } from "../models/Comment";
import { Project } from "../models/Project";
import { Task } from "../models/Task";
import { User } from "../models/User";
import type { AuthPayload } from "../types/domain";
import { AppError } from "../utils/appError";
import { assertFound } from "../utils/scopedQuery";
import {
  optionalString,
  parseDate,
  parseTaskPriority,
  parseTaskStatus,
  requireString,
  requireStringLength,
} from "../utils/validators";
import {
  canDeleteResource,
  canUpdateTask,
  isPrivilegedRole,
} from "./permissionService";

const ensureProjectInOrganization = async (
  projectId: string,
  organizationId: string,
) => {
  const project = await Project.findOne({ _id: projectId, organizationId });

  if (!project) {
    throw new AppError("Project not found", 404);
  }
};

const ensureAssigneeInOrganization = async (
  assignedTo: string,
  organizationId: string,
) => {
  const user = await User.findOne({ _id: assignedTo, organizationId });

  if (!user) {
    throw new AppError("Assigned user not found", 404);
  }
};

export const listTasks = async (organizationId: string, projectId?: string) => {
  const query = projectId ? { organizationId, projectId } : { organizationId };
  const tasks = await Task.find(query).sort({ createdAt: -1 });
  const taskIds = tasks.map((task) => task._id);
  const comments = taskIds.length
    ? await Comment.find(
        { organizationId, taskId: { $in: taskIds } },
        { taskId: 1 },
      ).lean()
    : [];
  const commentCounts = new Map<string, number>();

  for (const comment of comments) {
    const taskId = String(comment.taskId);
    commentCounts.set(taskId, (commentCounts.get(taskId) ?? 0) + 1);
  }

  return tasks.map((task) => ({
    ...task.toObject(),
    commentCount: commentCounts.get(String(task._id)) ?? 0,
  }));
};

export const createTask = async (
  actor: AuthPayload,
  payload: Record<string, unknown>,
) => {
  const title = requireStringLength(payload.title, "Title", 2);
  const projectId = requireString(payload.projectId, "Project ID");
  const description = optionalString(payload.description) ?? "";
  const status =
    payload.status === undefined ? "todo" : parseTaskStatus(payload.status);
  const priority =
    payload.priority === undefined
      ? "medium"
      : parseTaskPriority(payload.priority);
  const dueDate = payload.dueDate
    ? parseDate(payload.dueDate, "Due date")
    : null;
  const assignedTo =
    payload.assignedTo === undefined
      ? null
      : requireString(payload.assignedTo, "Assigned user");

  await ensureProjectInOrganization(projectId, actor.organizationId);

  if (assignedTo) {
    await ensureAssigneeInOrganization(assignedTo, actor.organizationId);
  }

  if (
    !isPrivilegedRole(actor.role) &&
    assignedTo &&
    assignedTo !== actor.userId
  ) {
    throw new AppError("Members can only assign tasks to themselves", 403);
  }

  return Task.create({
    organizationId: actor.organizationId,
    projectId,
    title,
    description,
    status,
    priority,
    assignedTo,
    dueDate,
  });
};

export const getTaskById = async (organizationId: string, id: string) => {
  const task = await Task.findOne({ _id: id, organizationId });
  return assertFound(task, "Task");
};

export const updateTask = async (
  actor: AuthPayload,
  id: string,
  payload: Record<string, unknown>,
) => {
  const task = await getTaskById(actor.organizationId, id);

  if (!canUpdateTask(actor, task.assignedTo ? String(task.assignedTo) : null)) {
    throw new AppError("You do not have permission to update this task", 403);
  }

  if (payload.projectId !== undefined) {
    if (!isPrivilegedRole(actor.role)) {
      throw new AppError("Only admins can move tasks between projects", 403);
    }

    const projectId = requireString(payload.projectId, "Project ID");
    await ensureProjectInOrganization(projectId, actor.organizationId);
    task.projectId = new Types.ObjectId(projectId);
  }

  if (payload.title !== undefined) {
    task.title = requireStringLength(payload.title, "Title", 2);
  }

  if (payload.description !== undefined) {
    task.description = optionalString(payload.description) ?? "";
  }

  if (payload.status !== undefined) {
    task.status = parseTaskStatus(payload.status);
  }

  if (payload.priority !== undefined) {
    task.priority = parseTaskPriority(payload.priority);
  }

  if (payload.dueDate !== undefined) {
    task.dueDate = payload.dueDate
      ? parseDate(payload.dueDate, "Due date")
      : null;
  }

  if (payload.assignedTo !== undefined) {
    if (!isPrivilegedRole(actor.role)) {
      throw new AppError("Only admins can reassign tasks", 403);
    }

    if (payload.assignedTo === null || payload.assignedTo === "") {
      task.assignedTo = null;
    } else {
      const assignedTo = requireString(payload.assignedTo, "Assigned user");
      await ensureAssigneeInOrganization(assignedTo, actor.organizationId);
      task.assignedTo = new Types.ObjectId(assignedTo);
    }
  }

  await task.save();
  return task;
};

export const deleteTask = async (actor: AuthPayload, id: string) => {
  const task = await getTaskById(actor.organizationId, id);

  if (!canDeleteResource(actor)) {
    throw new AppError("You do not have permission to delete this task", 403);
  }

  await task.deleteOne();
  await Comment.deleteMany({
    organizationId: actor.organizationId,
    taskId: task._id,
  });
  return { deleted: true };
};
