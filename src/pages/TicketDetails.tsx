import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  MessageSquare,
  Phone,
  User,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  canUpdateStatus,
  canUpdatePriority,
  canEditTicket,
  canAssignTicket,
  canViewTicket,
  canCancelTicket,
  canReopenTicket,
  canDeleteTicket,
} from "../utils/ticketPermissions";

import { useAuth } from "../hooks/useAuth";

import {
  getTicketById,
  updateTicket,
  deleteTicket,
} from "../services/ticketService";

import { createActivity } from "../services/activityService";

import { getUsers } from "../services/userService";
import { getCategories } from "../services/categoryService";

import type {
  Ticket,
  TicketPriority,
} from "../types/ticket";

import type { User as UserType } from "../types/user";
import type { Category } from "../types/category";

import TicketStatusBadge from "../components/Tickets/TicketStatusBadge";
import TicketPriorityBadge from "../components/Tickets/TicketPriorityBadge";
import CommentSection from "../components/Comments/CommentSection";
import ResolutionSection from "../components/Tickets/ResolutionSection";
import TicketStatusControl from "../components/Tickets/TicketStatusControl";
import TicketActivityTimeline from "../components/Tickets/TicketActivityTimeline";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPriority, setSelectedPriority] =
    useState<TicketPriority>("medium");

  const [selectedAgent, setSelectedAgent] = useState("");

  const [updating, setUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [assignmentSuccess, setAssignmentSuccess] =
    useState("");

  const [assignmentError, setAssignmentError] =
    useState("");

  const [updateSuccess, setUpdateSuccess] =
    useState("");

  const [updateError, setUpdateError] = useState("");

  /*
   * Format status / priority text
   *
   * Example:
   * in_progress -> In Progress
   * high -> High
   */
  const formatStatus = (
    value: Ticket["status"] | TicketPriority
  ) => {
    return value
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  /*
   * Load ticket and related data
   */
  useEffect(() => {
    const loadTicketDetails = async () => {
      if (!id) {
        setError("Ticket ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [
          ticketData,
          usersData,
          categoriesData,
        ] = await Promise.all([
          getTicketById(id),
          getUsers(),
          getCategories(),
        ]);

        setTicket(ticketData);

        setSelectedPriority(ticketData.priority);

        setSelectedAgent(
          ticketData.assignedAgent ?? ""
        );

        setUsers(usersData);
        setCategories(categoriesData);
      } catch (error) {
        console.error(
          "Failed to load ticket details:",
          error
        );

        setError(
          "Unable to load ticket details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTicketDetails();
  }, [id]);

  /*
   * Resolve user ID to user name
   */
  const getUserName = (
    userId: string | null
  ) => {
    if (!userId) {
      return "Unassigned";
    }

    const foundUser = users.find(
      (item) => item.id === userId
    );

    return (
      foundUser?.fullName ??
      "Unknown User"
    );
  };

  /*
   * Resolve category ID to category name
   */
  const getCategoryName = (
    categoryId: string
  ) => {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return (
      category?.name ??
      "Unknown Category"
    );
  };

  /*
   * Contact method icon
   */
  const getContactIcon = () => {
    if (
      ticket?.preferredContactMethod ===
      "email"
    ) {
      return <Mail size={17} />;
    }

    if (
      ticket?.preferredContactMethod ===
      "phone"
    ) {
      return <Phone size={17} />;
    }

    return <MessageSquare size={17} />;
  };

  /*
   * Format contact method
   */
  const formatContactMethod = () => {
    if (!ticket) {
      return "";
    }

    return (
      ticket.preferredContactMethod
        .charAt(0)
        .toUpperCase() +
      ticket.preferredContactMethod.slice(1)
    );
  };

  /*
   * Update ticket priority
   *
   * Status is handled separately by
   * TicketStatusControl.
   */
  const handleUpdateTicket = async () => {
    if (!ticket || !user) {
      return;
    }

    const priorityChanged =
      selectedPriority !== ticket.priority;

    if (
      priorityChanged &&
      !canUpdatePriority(ticket, user)
    ) {
      setUpdateError(
        "You do not have permission to change the ticket priority."
      );

      return;
    }

    if (!priorityChanged) {
      setUpdateError(
        "No changes were made."
      );

      return;
    }

    try {
      setUpdating(true);
      setUpdateSuccess("");
      setUpdateError("");

      const now = new Date();

      const today = now
        .toISOString()
        .split("T")[0];

      const currentTime =
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

      const oldPriority =
        ticket.priority;

      /*
       * Update ticket priority
       */
      const updatedTicket =
        await updateTicket(
          ticket.id,
          {
            priority: selectedPriority,
            updatedDate: today,
          }
        );

      setTicket(updatedTicket);

      /*
       * Record priority activity
       */
      await createActivity({
        id: `ACT${Date.now()}`,
        ticketId: ticket.id,
        type: "priority_changed",
        description: `Ticket priority changed from ${formatStatus(
          oldPriority
        )} to ${formatStatus(
          selectedPriority
        )}`,
        performedBy: user.id,
        createdDate: today,
        createdTime: currentTime,
      });

      setUpdateSuccess(
        "Ticket priority updated successfully."
      );

      setTimeout(() => {
        setUpdateSuccess("");
      }, 3000);
    } catch (error) {
      console.error(
        "Failed to update ticket priority:",
        error
      );

      setUpdateError(
        "Unable to update ticket priority. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  /*
   * Delete ticket
   *
   * Admin only.
   */
  const handleDeleteTicket = async () => {
    if (!ticket || !user) {
      return;
    }

    if (!canDeleteTicket(user)) {
      setUpdateError(
        "You do not have permission to delete this ticket."
      );

      return;
    }

    const shouldDelete =
      window.confirm(
        `Are you sure you want to delete ticket ${ticket.id}? This action cannot be undone.`
      );

    if (!shouldDelete) {
      return;
    }

    try {
      setUpdating(true);

      setUpdateError("");
      setUpdateSuccess("");

      await deleteTicket(ticket.id);

      navigate("/tickets", {
        replace: true,
        state: {
          successMessage:
            "Ticket deleted successfully.",
        },
      });
    } catch (error) {
      console.error(
        "Failed to delete ticket:",
        error
      );

      setUpdateError(
        "Failed to delete ticket. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  /*
   * Update ticket status
   *
   * TicketStatusControl is responsible for
   * deciding which lifecycle transitions are
   * available.
   */
  const handleStatusChange = async (
    newStatus: Ticket["status"]
  ) => {
    if (!ticket || !user) {
      return;
    }

    if (!canUpdateStatus(ticket, user)) {
      setUpdateError(
        "You do not have permission to update the ticket status."
      );

      return;
    }

    try {
      setUpdating(true);

      setUpdateSuccess("");
      setUpdateError("");

      const now = new Date();

      const today = now
        .toISOString()
        .split("T")[0];

      const currentTime =
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

      const oldStatus = ticket.status;

      /*
       * Update ticket status
       */
      const updatedTicket =
        await updateTicket(
          ticket.id,
          {
            status: newStatus,
            updatedDate: today,
          }
        );

      setTicket(updatedTicket);

      /*
       * Decide activity type
       */
      let activityType:
        | "status_changed"
        | "resolved"
        | "closed"
        | "cancelled"
        | "reopened" =
        "status_changed";

      if (newStatus === "resolved") {
        activityType = "resolved";
      } else if (
        newStatus === "closed"
      ) {
        activityType = "closed";
      } else if (
        newStatus === "cancelled"
      ) {
        activityType = "cancelled";
      } else if (
        newStatus === "reopened"
      ) {
        activityType = "reopened";
      }

      /*
       * Create activity history
       */
      await createActivity({
        id: `ACT${Date.now()}`,
        ticketId: ticket.id,
        type: activityType,
        description: `Ticket status changed from ${formatStatus(
          oldStatus
        )} to ${formatStatus(newStatus)}`,
        performedBy: user.id,
        createdDate: today,
        createdTime: currentTime,
      });

      setUpdateSuccess(
        "Ticket status updated successfully."
      );

      setTimeout(() => {
        setUpdateSuccess("");
      }, 3000);
    } catch (error) {
      console.error(
        "Failed to update ticket status:",
        error
      );

      setUpdateError(
        "Unable to update ticket status. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  /*
   * Assign or reassign ticket
   *
   * Admin only.
   */
  const handleAssignTicket = async () => {
    if (!ticket || !user) {
      return;
    }

    if (!canAssignTicket(user)) {
      setAssignmentError(
        "You do not have permission to assign tickets."
      );

      return;
    }

    const previousAgent =
      ticket.assignedAgent;

    const newAgent =
      selectedAgent || null;

    /*
     * Nothing changed
     */
    if (previousAgent === newAgent) {
      setAssignmentError(
        "No assignment changes were made."
      );

      return;
    }

    try {
      setAssigning(true);

      setAssignmentSuccess("");
      setAssignmentError("");

      const now = new Date();

      const today =
        now.toISOString().split("T")[0];

      const currentTime =
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

      /*
       * Find agent names for activity messages
       */
      const previousAgentName =
        users.find(
          (item) =>
            item.id === previousAgent
        )?.fullName ??
        "Unassigned";

      const newAgentName =
        users.find(
          (item) => item.id === newAgent
        )?.fullName ??
        "Unassigned";

      /*
       * Determine assignment action
       */
      let activityType:
        | "assigned"
        | "reassigned"
        | "unassigned";

      let activityDescription = "";

      if (!previousAgent && newAgent) {
        activityType = "assigned";

        activityDescription =
          `Ticket assigned to ${newAgentName}`;
      } else if (
        previousAgent &&
        newAgent
      ) {
        activityType = "reassigned";

        activityDescription =
          `Ticket reassigned from ${previousAgentName} to ${newAgentName}`;
      } else {
        activityType = "unassigned";

        activityDescription =
          `Ticket unassigned from ${previousAgentName}`;
      }

      /*
       * Update ticket assignment
       */
      const updatedTicket =
        await updateTicket(
          ticket.id,
          {
            assignedAgent: newAgent,
            assignmentDate: newAgent
              ? today
              : null,
            updatedDate: today,

            /*
             * When an open ticket gets assigned,
             * move it into Assigned status.
             */
            ...(ticket.status ===
              "open" &&
            newAgent
              ? {
                  status: "assigned",
                }
              : {}),
          }
        );

      /*
       * Save assignment activity
       */
      await createActivity({
        id: `ACT${Date.now()}`,
        ticketId: ticket.id,
        type: activityType,
        description:
          activityDescription,
        performedBy: user.id,
        createdDate: today,
        createdTime: currentTime,
      });

      /*
       * If an open ticket was assigned,
       * record the status change as another activity.
       */
      if (
        ticket.status === "open" &&
        newAgent
      ) {
        await createActivity({
          id: `ACT${Date.now() + 1}`,
          ticketId: ticket.id,
          type: "status_changed",
          description:
            "Ticket status changed from Open to Assigned",
          performedBy: user.id,
          createdDate: today,
          createdTime: currentTime,
        });
      }

      setTicket(updatedTicket);

      setSelectedAgent(
        newAgent ?? ""
      );

      if (
        !previousAgent &&
        newAgent
      ) {
        setAssignmentSuccess(
          "Ticket assigned successfully."
        );
      } else if (
        previousAgent &&
        newAgent
      ) {
        setAssignmentSuccess(
          "Ticket reassigned successfully."
        );
      } else {
        setAssignmentSuccess(
          "Ticket unassigned successfully."
        );
      }

      setTimeout(() => {
        setAssignmentSuccess("");
      }, 3000);
    } catch (error) {
      console.error(
        "Failed to update ticket assignment:",
        error
      );

      setAssignmentError(
        "Unable to update assignment. Please try again."
      );
    } finally {
      setAssigning(false);
    }
  };

  /*
   * Cancel ticket
   *
   * Employee can cancel their own
   * ticket only when the ticket is open.
   */
  const handleCancelTicket =
    async () => {
      if (!ticket || !user) {
        return;
      }

      if (
        !canCancelTicket(
          ticket,
          user
        )
      ) {
        setUpdateError(
          "You do not have permission to cancel this ticket."
        );

        return;
      }

      const shouldCancel =
        window.confirm(
          "Are you sure you want to cancel this ticket?"
        );

      if (!shouldCancel) {
        return;
      }

      try {
        setUpdating(true);

        setUpdateError("");
        setUpdateSuccess("");

        const now = new Date();

        const today =
          now.toISOString().split("T")[0];

        const currentTime =
          now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

        const updatedTicket =
          await updateTicket(
            ticket.id,
            {
              status: "cancelled",
              updatedDate: today,
            }
          );

        /*
         * Record cancellation activity
         */
        await createActivity({
          id: `ACT${Date.now()}`,
          ticketId: ticket.id,
          type: "cancelled",
          description:
            "Ticket was cancelled",
          performedBy: user.id,
          createdDate: today,
          createdTime: currentTime,
        });

        setTicket(updatedTicket);

        setUpdateSuccess(
          "Ticket cancelled successfully."
        );

        setTimeout(() => {
          setUpdateSuccess("");
        }, 3000);
      } catch (error) {
        console.error(
          "Failed to cancel ticket:",
          error
        );

        setUpdateError(
          "Failed to cancel ticket. Please try again."
        );
      } finally {
        setUpdating(false);
      }
    };

  /*
   * Reopen ticket
   *
   * Admin, assigned Support Agent, or
   * ticket owner can reopen a resolved ticket.
   */
  const handleReopenTicket =
    async () => {
      if (!ticket || !user) {
        return;
      }

      if (
        !canReopenTicket(
          ticket,
          user
        )
      ) {
        setUpdateError(
          "You do not have permission to reopen this ticket."
        );

        return;
      }

      const shouldReopen =
        window.confirm(
          "Are you sure you want to reopen this ticket?"
        );

      if (!shouldReopen) {
        return;
      }

      try {
        setUpdating(true);

        setUpdateError("");
        setUpdateSuccess("");

        const now = new Date();

        const today =
          now.toISOString().split("T")[0];

        const currentTime =
          now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

        const updatedTicket =
          await updateTicket(
            ticket.id,
            {
              status: "reopened",
              updatedDate: today,
            }
          );

        /*
         * Record reopening activity
         */
        await createActivity({
          id: `ACT${Date.now()}`,
          ticketId: ticket.id,
          type: "reopened",
          description:
            "Ticket was reopened",
          performedBy: user.id,
          createdDate: today,
          createdTime: currentTime,
        });

        setTicket(updatedTicket);

        setUpdateSuccess(
          "Ticket reopened successfully."
        );

        setTimeout(() => {
          setUpdateSuccess("");
        }, 3000);
      } catch (error) {
        console.error(
          "Failed to reopen ticket:",
          error
        );

        setUpdateError(
          "Failed to reopen ticket. Please try again."
        );
      } finally {
        setUpdating(false);
      }
    };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="group mx-auto flex min-h-[420px] w-full max-w-[1800px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-[#404040] dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 dark:border-slate-500 dark:border-t-white" />

          <p className="text-sm font-medium text-slate-500 dark:text-white">
            Loading ticket details...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Ticket not found / API error
   */
  if (error || !ticket) {
    return (
      <div className="group mx-auto w-full max-w-[1800px] rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6 dark:border-red-500/40 dark:bg-[#404040] dark:text-white">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <span className="text-lg font-bold">
              !
            </span>
          </div>

          <div>
            <h2 className="text-base font-semibold text-red-800">
              Unable to load ticket
            </h2>

            <p className="mt-1 text-sm leading-6 text-red-700">
              {error ||
                "Ticket not found."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] dark:hover:bg-white dark:hover:text-black"
        >
          <ArrowLeft size={17} />
          Go Back
        </button>
      </div>
    );
  }

  /*
   * Role-based ticket access
   */
  if (
    !user ||
    !canViewTicket(ticket, user)
  ) {
    return (
      <div className="group mx-auto w-full max-w-[1800px] rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-6 dark:border-red-500/40 dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <span className="text-lg font-bold">
              !
            </span>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white dark:group-hover:text-black">
              Access Denied
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-200 dark:group-hover:text-black">
              You do not have permission
              to view this ticket.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] dark:hover:bg-white dark:hover:text-black"
        >
          <ArrowLeft size={17} />
          Go Back
        </button>
      </div>
    );
  }

  const canCancel =
    canCancelTicket(ticket, user);

  const canReopen =
    canReopenTicket(ticket, user);

  const canUpdateStatusValue =
    canUpdateStatus(
      ticket,
      user
    );

  const canUpdatePriorityValue =
    canUpdatePriority(
      ticket,
      user
    );

  /*
   * Show Ticket Actions when the user can:
   * - update status
   * - update priority
   * - cancel
   * - reopen
   * - delete
   */
  const showTicketActions =
    canUpdateStatusValue ||
    canUpdatePriorityValue ||
    canCancel ||
    canReopen ||
    canDeleteTicket(user);

  return (
    <div className="mx-auto w-full max-w-[1800px] pb-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900 dark:text-slate-300"
      >
        <ArrowLeft size={17} />
        Back
      </button>

      {/* ====================================================== */}
      {/* Ticket Header */}
      {/* ====================================================== */}

      <div className="group overflow-hidden rounded-2xl border border-slate-100 border-t-4 border-t-slate-900 bg-white text-slate-900 shadow-sm transition-all duration-300 hover:border-slate-200 hover:border-t-slate-950 hover:shadow-md dark:border-slate-600 dark:border-t-slate-300 dark:bg-[#404040] dark:text-white dark:hover:border-white dark:hover:border-t-white dark:hover:bg-white dark:hover:text-black">
        <div className="h-1 bg-slate-900" />

        <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold tracking-wide text-slate-600 dark:bg-slate-500 dark:text-white dark:group-hover:bg-slate-100 dark:group-hover:text-black">
              {ticket.id}
            </span>

            <h1 className="mt-3 max-w-4xl text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl dark:text-white dark:group-hover:text-black">
              {ticket.subject}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-200 dark:group-hover:text-black">
              Ticket details and current
              status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:max-w-[480px] lg:justify-end">
            <TicketStatusBadge
              status={ticket.status}
            />

            <TicketPriorityBadge
              priority={ticket.priority}
            />

            {user &&
              canEditTicket(
                ticket,
                user
              ) && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/tickets/${ticket.id}/edit`
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 dark:border-white dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-800 hover:shadow-md active:scale-[0.98]"
                >
                  <Pencil size={16} />
                  Edit Ticket
                </button>
              )}
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* Ticket Information */}
      {/* ====================================================== */}

      <div className="group mt-6 overflow-hidden rounded-2xl border border-blue-100 border-t-4 border-t-blue-500 bg-white text-slate-900 shadow-sm transition-all duration-300 hover:border-blue-200 hover:border-t-blue-600 hover:shadow-md dark:border-slate-600 dark:border-t-blue-400 dark:bg-[#404040] dark:text-white dark:hover:border-white dark:hover:border-t-white dark:hover:bg-white dark:hover:text-black">
        <div className="border-b border-blue-100 bg-blue-50/40 px-5 py-4 sm:px-6 dark:border-slate-600 dark:bg-[#404040] dark:group-hover:bg-white">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white dark:group-hover:text-black">
            Ticket Information
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-200 dark:group-hover:text-black">
            Overview of the ticket metadata and contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Category */}
          <div className="border-b border-slate-100 px-5 py-5 transition-colors duration-300 hover:bg-slate-50/70 sm:px-6 dark:border-slate-600 dark:bg-[#404040] dark:hover:bg-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
              Category
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white dark:group-hover:text-black">
              {getCategoryName(
                ticket.category
              )}
            </p>
          </div>

          {/* Created By */}
          <div className="border-b border-slate-100 px-5 py-5 transition-colors duration-300 hover:bg-slate-50/70 sm:px-6 dark:border-slate-600 dark:bg-[#404040] dark:hover:bg-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
              Created By
            </p>

            <div className="mt-2 flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-500 dark:text-white dark:group-hover:bg-slate-100 dark:group-hover:text-black">
                <User size={15} />
              </div>

              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white dark:group-hover:text-black">
                {getUserName(
                  ticket.createdBy
                )}
              </p>
            </div>
          </div>

          {/* Assigned Agent */}
          <div className="border-b border-slate-100 px-5 py-5 transition-colors duration-300 hover:bg-slate-50/70 sm:px-6 dark:border-slate-600 dark:bg-[#404040] dark:hover:bg-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
              Assigned Agent
            </p>

            <div className="mt-2 flex min-w-0 items-center gap-2.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  ticket.assignedAgent
                    ? "bg-blue-50 text-blue-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <User size={15} />
              </div>

              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white dark:group-hover:text-black">
                {getUserName(
                  ticket.assignedAgent
                )}
              </p>
            </div>
          </div>

          {/* Assignment Date */}
          <div className="border-b border-slate-100 px-5 py-5 transition-colors duration-300 hover:bg-slate-50/70 sm:px-6 dark:border-slate-600 dark:bg-[#404040] dark:hover:bg-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
              Assignment Date
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white dark:group-hover:text-black">
              {ticket.assignmentDate ||
                "Not assigned"}
            </p>
          </div>

          {/* Created Date */}
          <div className="border-b border-slate-100 px-5 py-5 transition-colors duration-300 hover:bg-slate-50/70 sm:px-6 dark:border-slate-600 dark:bg-[#404040] dark:hover:bg-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
              Created Date
            </p>

            <div className="mt-2 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <CalendarDays size={15} />
              </div>

              <p className="text-sm font-semibold text-slate-900">
                {ticket.createdDate}
              </p>
            </div>
          </div>

          {/* Updated Date */}
          <div className="border-b border-slate-100 px-5 py-5 transition-colors duration-300 hover:bg-slate-50/70 sm:px-6 dark:border-slate-600 dark:bg-[#404040] dark:hover:bg-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
              Updated Date
            </p>

            <div className="mt-2 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Clock3 size={15} />
              </div>

              <p className="text-sm font-semibold text-slate-900">
                {ticket.updatedDate}
              </p>
            </div>
          </div>

          {/* Due Date */}
          <div className="border-b border-slate-100 px-5 py-5 transition-colors duration-300 hover:bg-slate-50/70 sm:px-6 dark:border-slate-600 dark:bg-[#404040] dark:hover:bg-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
              Due Date
            </p>

            <div className="mt-2 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <CalendarDays size={15} />
              </div>

              <p className="text-sm font-semibold text-slate-900">
                {ticket.dueDate}
              </p>
            </div>
          </div>

          {/* Contact Method */}
          <div className="border-b border-slate-100 px-5 py-5 transition-colors duration-300 hover:bg-slate-50/70 sm:px-6 dark:border-slate-600 dark:bg-[#404040] dark:hover:bg-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
              Preferred Contact
            </p>

            <div className="mt-2 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                {getContactIcon()}
              </div>

              <p className="text-sm font-semibold text-slate-900">
                {formatContactMethod()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* Ticket Assignment - Admin Only */}
      {/* ====================================================== */}

      {user &&
        canAssignTicket(user) && (
          <div className="group mt-6 overflow-hidden rounded-2xl border border-indigo-100 border-t-4 border-t-indigo-500 bg-white text-slate-900 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:border-t-indigo-600 hover:shadow-md dark:border-slate-600 dark:border-t-indigo-400 dark:bg-[#404040] dark:text-white dark:hover:border-white dark:hover:border-t-white dark:hover:bg-white dark:hover:text-black">
            <div className="border-b border-indigo-100 bg-indigo-50/40 px-5 py-4 sm:px-6 dark:border-slate-600 dark:bg-[#404040] dark:group-hover:bg-white">
              <h2 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white dark:group-hover:text-black">
                Ticket Assignment
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-200 dark:group-hover:text-black">
                Assign or reassign this
                ticket to a support
                agent.
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="min-w-0">
                  <label
                    htmlFor="assigned-agent"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-white dark:group-hover:text-black"
                  >
                    Support Agent
                  </label>

                  <select
                    id="assigned-agent"
                    value={selectedAgent}
                    onChange={(event) =>
                      setSelectedAgent(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-300 hover:border-cyan-300 hover:shadow-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 dark:border-slate-500 dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black dark:focus:bg-[#404040]"
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {users
                      .filter(
                        (item) =>
                          item.role ===
                            "support_agent" &&
                          item.status ===
                            "active"
                      )
                      .map((agent) => (
                        <option
                          key={agent.id}
                          value={agent.id}
                        >
                          {agent.fullName}
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={
                    handleAssignTicket
                  }
                  disabled={assigning}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-5 py-3 dark:border-white dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-800 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {assigning
                    ? "Updating..."
                    : "Update Assignment"}
                </button>
              </div>

              {assignmentSuccess && (
                <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {assignmentSuccess}
                </p>
              )}

              {assignmentError && (
                <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {assignmentError}
                </p>
              )}
            </div>
          </div>
        )}

     {/* ====================================================== */}
{/* Ticket Actions + Resolution */}
{/* ====================================================== */}

<div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
  {/* Ticket Actions */}
  {showTicketActions && (
    <div className="group overflow-hidden rounded-2xl border border-amber-100 border-t-4 border-t-amber-500 bg-white text-slate-900 shadow-sm transition-all duration-300 hover:border-amber-200 hover:border-t-amber-600 hover:shadow-md dark:border-slate-600 dark:border-t-amber-400 dark:bg-[#404040] dark:text-white dark:hover:border-white dark:hover:border-t-white dark:hover:bg-white dark:hover:text-black">
      <div className="border-b border-amber-100 bg-amber-50/40 px-5 py-4 sm:px-6 dark:border-slate-600 dark:bg-[#404040] dark:group-hover:bg-white">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white dark:group-hover:text-black">
          Ticket Actions
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-200 dark:group-hover:text-black">
          Manage ticket status, priority and lifecycle
          actions.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {/* Status and Priority */}
        {(canUpdateStatusValue ||
          canUpdatePriorityValue) && (
          <div className="grid grid-cols-1 gap-5">
            {/* Status */}
            {canUpdateStatusValue && (
              <div className="group rounded-xl border border-cyan-100 bg-cyan-50/20 p-4 transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-50/40 hover:shadow-sm dark:border-slate-500 dark:bg-[#404040] dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black">
                <TicketStatusControl
                  currentStatus={ticket.status}
                  user={user}
                  onStatusChange={handleStatusChange}
                  disabled={updating}
                />
              </div>
            )}

            {/* Priority */}
            {canUpdatePriorityValue && (
              <div className="group rounded-xl border border-cyan-100 bg-cyan-50/20 p-4 transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-50/40 hover:shadow-sm dark:border-slate-500 dark:bg-[#404040] dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black">
                <label
                  htmlFor="ticket-priority"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-white dark:group-hover:text-black"
                >
                  Priority
                </label>

                <select
                  id="ticket-priority"
                  value={selectedPriority}
                  onChange={(event) =>
                    setSelectedPriority(
                      event.target
                        .value as TicketPriority
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition-all duration-300 hover:border-cyan-300 hover:shadow-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 dark:border-slate-500 dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black dark:focus:bg-[#404040]"
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="critical">
                    Critical
                  </option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Update Success */}
        {updateSuccess && (
          <p className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {updateSuccess}
          </p>
        )}

        {/* Update Error */}
        {updateError && (
          <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {updateError}
          </p>
        )}

        {/* Update Priority Button */}
        {canUpdatePriorityValue &&
          selectedPriority !== ticket.priority && (
            <button
              type="button"
              onClick={handleUpdateTicket}
              disabled={updating}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-5 py-3 dark:border-white dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-800 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating
                ? "Updating..."
                : "Update Priority"}
            </button>
          )}

        {/* Cancel Ticket */}
        {canCancel && (
          <div className="mt-6 border-t border-slate-200 pt-5 transition-colors duration-300 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-400">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white dark:group-hover:text-black">
                  Cancel this ticket
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-200 dark:group-hover:text-black">
                  You can cancel this ticket while it is
                  still open.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelTicket}
                disabled={updating}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 shadow-sm transition-all duration-300 hover:border-red-300 hover:bg-red-100 hover:shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
              >
                {updating
                  ? "Cancelling..."
                  : "Cancel Ticket"}
              </button>
            </div>
          </div>
        )}

        {/* Reopen Ticket */}
        {canReopen && (
          <div className="mt-6 border-t border-slate-200 pt-5 transition-colors duration-300 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-400">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white dark:group-hover:text-black">
                  Reopen this ticket
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-200 dark:group-hover:text-black">
                  This resolved ticket can be reopened
                  if further work is required.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReopenTicket}
                disabled={updating}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 shadow-sm transition-all duration-300 hover:border-amber-300 hover:bg-amber-100 hover:shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
              >
                {updating
                  ? "Reopening..."
                  : "Reopen Ticket"}
              </button>
            </div>
          </div>
        )}

        {/* Delete Ticket */}
        {canDeleteTicket(user) && (
          <div className="mt-6 border-t border-slate-200 pt-5 transition-colors duration-300 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-400">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white dark:group-hover:text-black">
                  Delete this ticket
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-200 dark:group-hover:text-black">
                  Deleting a ticket permanently removes
                  it from the system.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDeleteTicket}
                disabled={updating}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 shadow-sm transition-all duration-300 hover:border-red-300 hover:bg-red-50 hover:shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
              >
                <Trash2 size={17} />

                {updating
                  ? "Deleting..."
                  : "Delete Ticket"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )}

  {/* Resolution */}
  <div className="group overflow-hidden rounded-2xl border border-emerald-100 border-t-4 border-t-emerald-500 bg-white shadow-sm transition-all duration-300 hover:border-emerald-200 hover:border-t-emerald-600 hover:shadow-md dark:border-slate-600 dark:border-t-emerald-400 dark:bg-[#404040] dark:hover:border-white dark:hover:border-t-white dark:hover:bg-white dark:hover:text-black">
    <ResolutionSection
      ticket={ticket}
      user={user}
      onUpdated={(updatedTicket) => {
        setTicket(updatedTicket);

        setSelectedPriority(
          updatedTicket.priority
        );
      }}
    />
  </div>
</div>

      {/* ====================================================== */}
      {/* Comments + Activity History */}
      {/* ====================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="dark:bg-[#404040] dark:text-white">
          <CommentSection
          ticket={ticket}
          user={user}
          users={users}
          />
        </div>

        <div className="group overflow-hidden rounded-2xl border border-violet-100 border-t-4 border-t-violet-500 bg-white shadow-sm transition-all duration-300 hover:border-violet-200 hover:border-t-violet-600 hover:shadow-md dark:border-slate-600 dark:border-t-violet-400 dark:bg-[#404040] dark:hover:border-white dark:hover:border-t-white dark:hover:bg-white dark:hover:text-black">
          <TicketActivityTimeline
            ticketId={ticket.id}
            users={users}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;