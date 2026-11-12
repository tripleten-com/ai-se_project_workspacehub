import { api, unwrapResponse } from "./api";
import type { Comment, CommentCreatePayload } from "../types/models";

export const commentService = {
  list: (taskId: string) =>
    unwrapResponse<Comment[]>(api.get(`/tasks/${taskId}/comments`)),
  create: (taskId: string, payload: CommentCreatePayload) =>
    unwrapResponse<Comment>(api.post(`/tasks/${taskId}/comments`, payload)),
  update: (taskId: string, commentId: string, payload: { content: string }) =>
    unwrapResponse<Comment>(
      api.patch(`/tasks/${taskId}/comments/${commentId}`, payload),
    ),
  delete: (taskId: string, commentId: string) =>
    unwrapResponse<{ deleted: boolean }>(
      api.delete(`/tasks/${taskId}/comments/${commentId}`),
    ),
};
