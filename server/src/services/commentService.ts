import { Comment } from "../models/Comment";
import { Task } from "../models/Task";
import type { AuthPayload } from "../types/domain";
import { AppError } from "../utils/appError";
import { assertFound } from "../utils/scopedQuery";
import { requireStringLength } from "../utils/validators";
import { canManageComment } from "./permissionService";

const getCommentContent = (payload: Record<string, unknown>) => {
  return requireStringLength(payload.content, "Content", 1);
};

const ensureTaskInOrganization = async (
  taskId: string,
  organizationId: string,
) => {
  const task = await Task.findOne({ _id: taskId, organizationId });
  return assertFound(task, "Task");
};

const getCommentInTask = async (
  organizationId: string,
  taskId: string,
  commentId: string,
) => {
  await ensureTaskInOrganization(taskId, organizationId);
  const comment = await Comment.findOne({
    _id: commentId,
    taskId,
    organizationId,
  });
  return assertFound(comment, "Comment");
};

export const listComments = async (organizationId: string, taskId: string) => {
  await ensureTaskInOrganization(taskId, organizationId);
  return Comment.find({ organizationId, taskId }).sort({ createdAt: -1 });
};

export const getCommentById = async (
  organizationId: string,
  taskId: string,
  commentId: string,
) => {
  return getCommentInTask(organizationId, taskId, commentId);
};

export const createComment = async (
  actor: AuthPayload,
  taskId: string,
  payload: unknown,
) => {
  await ensureTaskInOrganization(taskId, actor.organizationId);
  const safePayload =
    typeof payload === "object" && payload !== null && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  const content = getCommentContent(safePayload);

  return Comment.create({
    organizationId: actor.organizationId,
    taskId,
    authorId: actor.userId,
    content,
  });
};

export const updateComment = async (
  actor: AuthPayload,
  taskId: string,
  commentId: string,
  payload: unknown,
) => {
  const comment = await getCommentInTask(
    actor.organizationId,
    taskId,
    commentId,
  );

  if (!canManageComment(actor, String(comment.authorId))) {
    throw new AppError(
      "You do not have permission to update this comment",
      403,
    );
  }

  const safePayload =
    typeof payload === "object" && payload !== null && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  comment.content = getCommentContent(safePayload);
  await comment.save();
  return comment;
};

export const deleteComment = async (
  actor: AuthPayload,
  taskId: string,
  commentId: string,
) => {
  const comment = await getCommentInTask(
    actor.organizationId,
    taskId,
    commentId,
  );

  if (!canManageComment(actor, String(comment.authorId))) {
    throw new AppError(
      "You do not have permission to delete this comment",
      403,
    );
  }

  await comment.deleteOne();
  return { deleted: true };
};
