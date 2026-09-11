import { useState } from "react";

import type {
  TicketStatus,
} from "../../types/ticket";

import type {
  User,
} from "../../types/user";

import {
  getAllowedNextStatuses,
} from "../../utils/ticketLifecycle";

interface TicketStatusControlProps {
  currentStatus: TicketStatus;

  user: User;

  onStatusChange: (
    status: TicketStatus
  ) => Promise<void>;

  disabled?: boolean;
}

const statusLabels: Record<
  TicketStatus,
  string
> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
  cancelled: "Cancelled",
  reopened: "Reopened",
};


const TicketStatusControl = ({
  currentStatus,
  user,
  onStatusChange,
  disabled = false,
}: TicketStatusControlProps) => {

  const [selectedStatus, setSelectedStatus] =
    useState<TicketStatus>(currentStatus);

  const [updating, setUpdating] =
    useState(false);


  /*
   * Get lifecycle statuses
   */
  let allowedStatuses =
    getAllowedNextStatuses(currentStatus);


  /*
   * Employees cannot assign tickets.
   *
   * They can:
   * Open → Cancelled
   * Resolved → Reopened
   */
  if (user.role === "employee") {
    allowedStatuses =
      allowedStatuses.filter(
        (status) =>
          status === "cancelled" ||
          status === "reopened"
      );
  }


  /*
   * Handle status change
   */
  const handleChange = async (
    status: TicketStatus
  ) => {

    if (status === currentStatus) {
      return;
    }


    try {
      setUpdating(true);

      await onStatusChange(status);

      setSelectedStatus(status);

    } catch (error) {

      console.error(
        "Failed to update status:",
        error
      );

      setSelectedStatus(currentStatus);

    } finally {

      setUpdating(false);

    }
  };


  /*
   * No available transitions
   */
  if (allowedStatuses.length === 0) {
    return (
      <div className="group">

        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-white dark:group-hover:text-black">
          Status
        </p>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black">

          <span className="text-sm font-medium text-slate-600 dark:text-white dark:group-hover:text-black">
            {statusLabels[currentStatus]}
          </span>

        </div>

      </div>
    );
  }


  return (
    <div className="group">

      <label
        htmlFor="ticket-status"
        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-white dark:group-hover:text-black"
      >
        Update Status
      </label>


      <select
        id="ticket-status"
        value={selectedStatus}
        disabled={
          disabled || updating
        }
        onChange={(event) =>
          handleChange(
            event.target.value as TicketStatus
          )
        }
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-600 dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black dark:focus:bg-[#404040]"
      >

        <option
          value={currentStatus}
          className="bg-white text-slate-700 dark:bg-[#404040] dark:text-white"
        >
          {statusLabels[currentStatus]}
        </option>


        {allowedStatuses.map(
          (status) => (
            <option
              key={status}
              value={status}
              className="bg-white text-slate-700 dark:bg-[#404040] dark:text-white"
            >
              {statusLabels[status]}
            </option>
          )
        )}

      </select>


      {updating && (
        <p className="mt-2 text-xs text-slate-500 dark:text-white">
          Updating status...
        </p>
      )}

    </div>
  );
};


export default TicketStatusControl;
