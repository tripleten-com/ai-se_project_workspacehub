import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { commentService } from "../services/commentService";
import type { Comment, CommentCreatePayload, User } from "../types/models";
import { formatDateTime } from "../utils/date";
import { canManageComment } from "../utils/permissions";

interface TaskCommentsProps {
  taskId: string;
  users: User[];
  commentCount: number;
}

export const TaskComments = ({
  taskId,
  users,
  commentCount,
}: TaskCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>(
    {},
  );

  const loadComments = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextComments = await commentService.list(taskId);
      setComments(nextComments);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load comments",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const shouldExpand = !isExpanded;
    setIsExpanded(shouldExpand);

    if (shouldExpand && !hasLoaded && !isLoading) {
      void loadComments();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = newComment.trim();

    if (!content) {
      return;
    }

    const payload: CommentCreatePayload = { content };
    setIsCreating(true);
    setCreateError(null);

    try {
      const comment = await commentService.create(taskId, payload);
      setComments((current) => [comment, ...current]);
      setNewComment("");
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Unable to create comment",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async (
    event: FormEvent<HTMLFormElement>,
    commentId: string,
  ) => {
    event.preventDefault();
    const content = editingContent.trim();

    if (!content) {
      setCommentErrors((current) => ({
        ...current,
        [commentId]: "Comment cannot be empty",
      }));
      return;
    }

    setCommentErrors((current) => ({ ...current, [commentId]: "" }));

    try {
      const updatedComment = await commentService.update(taskId, commentId, {
        content,
      });
      setComments((current) =>
        current.map((comment) =>
          comment._id === commentId ? updatedComment : comment,
        ),
      );
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      setCommentErrors((current) => ({
        ...current,
        [commentId]:
          error instanceof Error ? error.message : "Unable to update comment",
      }));
    }
  };

  const handleDelete = async (commentId: string) => {
    setCommentErrors((current) => ({ ...current, [commentId]: "" }));

    try {
      await commentService.delete(taskId, commentId);
      setComments((current) =>
        current.filter((comment) => comment._id !== commentId),
      );
      setCommentErrors((current) => {
        const next = { ...current };
        delete next[commentId];
        return next;
      });
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingContent("");
      }
    } catch (error) {
      setCommentErrors((current) => ({
        ...current,
        [commentId]:
          error instanceof Error ? error.message : "Unable to delete comment",
      }));
    }
  };

  return (
    <>
      <button
        className="rounded-[10px] bg-panel px-4 py-2 text-sm font-medium text-ink transition hover:bg-slate-200 active:bg-slate-300"
        onClick={handleToggle}
        type="button"
      >
        {isExpanded
          ? "Hide Comments"
          : `Show Comments (${hasLoaded ? comments.length : commentCount})`}
      </button>
      {isExpanded ? (
        <div className="mt-4 basis-full space-y-4 rounded-2xl border border-slate-200 p-4">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <input
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-slate-300"
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Write a comment"
              value={newComment}
            />
            <button
              className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!hasLoaded || !newComment.trim() || isCreating}
              type="submit"
            >
              {isCreating ? "Adding..." : "Add comment"}
            </button>
          </form>
          {createError ? (
            <p className="text-sm text-danger">{createError}</p>
          ) : null}
          {isLoading ? (
            <p className="text-sm text-slate-600">Loading comments...</p>
          ) : null}
          {loadError ? (
            <p className="text-sm text-danger">{loadError}</p>
          ) : null}
          {hasLoaded && !isLoading && !loadError ? (
            comments.length ? (
              <ul className="space-y-3">
                {comments.map((comment) => {
                  const author = users.find(
                    (user) => user._id === comment.authorId,
                  );
                  const authorName = author
                    ? `${author.firstName} ${author.lastName}`
                    : "Unknown user";
                  const canManage = canManageComment(user, comment);
                  const isEditing = editingCommentId === comment._id;

                  return (
                    <li
                      className="rounded-2xl border border-slate-200 p-4"
                      key={comment._id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">
                          {authorName}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <time
                            className="text-xs text-slate-500"
                            dateTime={comment.createdAt}
                          >
                            {formatDateTime(comment.createdAt)}
                          </time>
                          {canManage ? (
                            <>
                              <button
                                className="text-sm font-medium text-brand transition hover:underline"
                                onClick={() => {
                                  setEditingCommentId(comment._id);
                                  setEditingContent(comment.content);
                                  setCommentErrors((current) => ({
                                    ...current,
                                    [comment._id]: "",
                                  }));
                                }}
                                type="button"
                              >
                                Edit
                              </button>
                              <button
                                className="text-sm font-medium text-danger transition hover:underline"
                                onClick={() => void handleDelete(comment._id)}
                                type="button"
                              >
                                Delete
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                      {isEditing ? (
                        <form
                          className="mt-3 flex flex-col gap-3 sm:flex-row"
                          onSubmit={(event) =>
                            void handleSave(event, comment._id)
                          }
                        >
                          <input
                            className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-slate-300"
                            onChange={(event) =>
                              setEditingContent(event.target.value)
                            }
                            value={editingContent}
                          />
                          <button
                            className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-80 active:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!editingContent.trim()}
                            type="submit"
                          >
                            Save
                          </button>
                        </form>
                      ) : (
                        <p className="mt-1 text-sm text-slate-600">
                          {comment.content}
                        </p>
                      )}
                      {commentErrors[comment._id] ? (
                        <p className="mt-2 text-sm text-danger">
                          {commentErrors[comment._id]}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">No comments yet.</p>
            )
          ) : null}
        </div>
      ) : null}
    </>
  );
};
