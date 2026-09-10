import { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";

import type { Comment } from "../../types/comment";
import type { User } from "../../types/user";
import type { Ticket } from "../../types/ticket";

import {
  createComment,
  getCommentsByTicket,
  deleteComment,
} from "../../services/commentService";

import {
  canCommentOnTicket,
} from "../../utils/ticketPermissions";

import { createActivity } from "../../services/activityService";

interface CommentSectionProps {
  ticket: Ticket;
  user: User;
  users: User[];
}

const CommentSection = ({
  ticket,
  user,
  users,
}: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canComment = canCommentOnTicket(ticket, user);

  /*
   * Load comments
   */
  useEffect(() => {
    let cancelled = false;

    const loadComments = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCommentsByTicket(ticket.id);

        if (!cancelled) {
          setComments(data);
        }
      } catch (err) {
        console.error("Failed to load comments:", err);

        if (!cancelled) {
          setError("Failed to load comments.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [ticket.id]);

  /*
   * Check whether current user can delete
   * a particular comment.
   */
  const canDeleteComment = (comment: Comment): boolean => {
    if (user.role === "admin") {
      return true;
    }

    if (user.role === "support_agent") {
      return ticket.assignedAgent === user.id;
    }

    if (user.role === "employee") {
      return comment.userId === user.id;
    }

    return false;
  };

  /*
   * Add comment
   */
  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedComment = commentText.trim();

    if (!trimmedComment) {
      setError("Please enter a comment.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const now = new Date();

      const createdDate =
        now.toISOString().split("T")[0];

      const createdTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newComment: Comment = {
        id: `COM${Date.now()}`,
        ticketId: ticket.id,
        userId: user.id,
        comment: trimmedComment,
        createdDate,
        createdTime,
      };

      const createdComment =
        await createComment(newComment);

      setComments((previousComments) => [
        ...previousComments,
        createdComment,
      ]);

      try {
        await createActivity({
          id: `ACT${Date.now()}`,
          ticketId: ticket.id,
          type: "comment_added",
          description: `${user.fullName} added a comment.`,
          performedBy: user.id,
          createdDate,
          createdTime,
        });
      } catch (activityError) {
        console.error(
          "Failed to create comment activity:",
          activityError
        );
      }

      setCommentText("");

      setSuccess("Comment added successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to add comment:", err);

      setError(
        "Failed to add comment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * Delete comment
   */
  const handleDeleteComment = async (
    comment: Comment
  ) => {
    if (!canDeleteComment(comment)) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(comment.id);
      setError("");
      setSuccess("");

      await deleteComment(comment.id);

      setComments((previousComments) =>
        previousComments.filter(
          (item) => item.id !== comment.id
        )
      );

      try {
  const now = new Date();

  await createActivity({
    id: `ACT-${now.getTime()}`,
    ticketId: ticket.id,
    type: "updated",
    description: `${user.fullName} deleted a comment.`,
    performedBy: user.id,
    createdDate: now.toISOString().split("T")[0],
    createdTime: now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
} catch (activityError) {
        console.error(
          "Failed to create delete activity:",
          activityError
        );
      }

      setSuccess("Comment deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to delete comment:",
        err
      );

      setError(
        "Failed to delete comment. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * Get user's name
   */
  const getUserName = (userId: string) => {
    const commentUser = users.find(
      (item) => item.id === userId
    );

    return commentUser?.fullName ?? "Unknown User";
  };

  /*
   * Get user's initial
   */
  const getUserInitial = (userId: string) => {
    return getUserName(userId)
      .charAt(0)
      .toUpperCase();
  };

  return (
    <section
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-cyan-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-cyan-300
        hover:shadow-lg
      "
    >
      {/* Top colored border */}
      <div className="h-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600" />

      <div className="flex flex-1 flex-col">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-cyan-100
            bg-cyan-50/50
            px-5
            py-4
            sm:px-6
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-cyan-100
                text-cyan-700
                transition-all
                duration-300
                group-hover:scale-105
                group-hover:bg-cyan-200
              "
            >
              <MessageSquare size={20} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Comments
                </h2>

                <span
                  className="
                    inline-flex
                    min-w-6
                    items-center
                    justify-center
                    rounded-full
                    bg-cyan-100
                    px-2
                    py-0.5
                    text-xs
                    font-bold
                    text-cyan-700
                  "
                >
                  {comments.length}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Discussion and updates
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            COMMENTS
        ====================================================== */}
        <div className="flex-1 p-5 sm:p-6">
          {loading ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center">
              <div
                className="
                  h-8
                  w-8
                  animate-spin
                  rounded-full
                  border-4
                  border-slate-200
                  border-t-cyan-600
                "
              />

              <p className="mt-3 text-sm font-medium text-slate-500">
                Loading comments...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div
              className="
                flex
                min-h-[180px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-cyan-200
                bg-cyan-50/30
                px-4
                py-8
                text-center
                transition-all
                duration-300
                hover:border-cyan-300
                hover:bg-cyan-50/60
              "
            >
              <div
                className="
                  mb-3
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-cyan-100
                  text-cyan-600
                "
              >
                <MessageSquare size={23} />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                No comments yet
              </p>

              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                Start the conversation by adding the
                first comment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((item) => (
                <div
                  key={item.id}
                  className="
                    group/comment
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50/70
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-cyan-200
                    hover:bg-white
                    hover:shadow-md
                    sm:p-5
                  "
                >
                  {/* Comment Header */}
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">

                      {/* Avatar */}
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-gradient-to-br
                          from-cyan-500
                          to-blue-600
                          text-xs
                          font-bold
                          text-white
                          shadow-sm
                        "
                      >
                        {getUserInitial(item.userId)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {getUserName(item.userId)}
                          </p>

                          {item.userId === user.id && (
                            <span
                              className="
                                rounded-full
                                bg-blue-100
                                px-2
                                py-0.5
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wide
                                text-blue-700
                              "
                            >
                              You
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {item.createdDate} ·{" "}
                          {item.createdTime}
                        </p>
                      </div>
                    </div>

                    {/* Delete */}
                    {canDeleteComment(item) && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteComment(item)
                        }
                        disabled={
                          deletingId === item.id
                        }
                        title="Delete comment"
                        className="
                          inline-flex
                          shrink-0
                          items-center
                          gap-1.5
                          rounded-lg
                          px-2.5
                          py-1.5
                          text-xs
                          font-semibold
                          text-red-500
                          opacity-70
                          transition-all
                          duration-200
                          hover:bg-red-50
                          hover:text-red-700
                          hover:opacity-100
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >
                        <Trash2 size={14} />

                        {deletingId === item.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    )}
                  </div>

                  {/* Comment Body */}
                  <div
                    className="
                      rounded-xl
                      border
                      border-slate-100
                      bg-white
                      px-4
                      py-3
                      shadow-sm
                      transition-colors
                      duration-200
                      group-hover/comment:border-cyan-100
                    "
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {item.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===================================================
              MESSAGES
          ==================================================== */}
          {(error || success) && (
            <div className="mt-4 space-y-2">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              )}
            </div>
          )}

          {/* ===================================================
              ADD COMMENT
          ==================================================== */}
          {canComment && (
            <form
              onSubmit={handleSubmit}
              className="mt-6 border-t border-cyan-100 pt-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-blue-100
                    text-blue-700
                  "
                >
                  <UserRound size={15} />
                </div>

                <div>
                  <label
                    htmlFor="ticket-comment"
                    className="block text-sm font-bold text-slate-900"
                  >
                    Add Comment
                  </label>

                  <p className="text-[11px] text-slate-400">
                    Share an update or response
                  </p>
                </div>
              </div>

              <textarea
                id="ticket-comment"
                value={commentText}
                onChange={(event) =>
                  setCommentText(event.target.value)
                }
                placeholder="Write a comment..."
                rows={4}
                disabled={submitting}
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-slate-800
                  outline-none
                  transition-all
                  duration-200
                  placeholder:text-slate-400
                  hover:border-cyan-300
                  hover:bg-white
                  focus:border-cyan-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-cyan-100
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    submitting || !commentText.trim()
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-slate-900
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:bg-slate-800
                    hover:shadow-lg
                    active:translate-y-0
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    disabled:hover:translate-y-0
                    disabled:hover:shadow-none
                  "
                >
                  <Send size={16} />

                  {submitting
                    ? "Adding..."
                    : "Add Comment"}
                </button>
              </div>
            </form>
          )}

          {/* No permission */}
          {!canComment && !loading && (
            <div
              className="
                mt-6
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
              "
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-slate-200
                  text-slate-500
                "
              >
                <MessageSquare size={15} />
              </div>

              <p className="text-sm font-medium text-slate-500">
                You do not have permission to add comments
                to this ticket.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CommentSection;