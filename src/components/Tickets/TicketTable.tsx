import {
  Ticket as TicketIcon,
  UserRound,
  FolderKanban,
  CalendarDays,
  ArrowRight,
  Eye,
} from "lucide-react";

import type { Ticket } from "../../types/ticket";
import type { User } from "../../types/user";
import type { Category } from "../../types/category";

import TicketStatusBadge from "./TicketStatusBadge";
import TicketPriorityBadge from "./TicketPriorityBadge";

interface TicketTableProps {
  tickets: Ticket[];
  users: User[];
  categories: Category[];
  onView: (ticketId: string) => void;
}

const TicketTable = ({
  tickets,
  users,
  categories,
  onView,
}: TicketTableProps) => {
  const getUserName = (userId: string | null) => {
    if (!users) {
      return "Loading...";
    }

    if (!userId) {
      return "Unassigned";
    }

    const user = users.find(
      (item) => item.id === userId,
    );

    return user?.fullName ?? "Unknown User";
  };

  const getCategoryName = (categoryId: string) => {
    if (!categories) {
      return "Loading...";
    }

    const category = categories.find(
      (item) => item.id === categoryId,
    );

    return category?.name ?? "Unknown Category";
  };

  /*
   * Empty State
   */
  if (tickets.length === 0) {
    return (
      <div
        className="
          dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black
          flex
          min-h-52
          items-center
          justify-center
          rounded-2xl
          border
          border-dashed
          border-indigo-200
          border-t-4
          border-t-indigo-400
          bg-slate-50/70
          px-4
          py-8
          transition-all
          duration-300
          hover:border-indigo-300
          hover:bg-indigo-50/30
          hover:shadow-sm
        "
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="
              mb-3
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-indigo-100
              bg-white
              text-indigo-500
              shadow-sm
              transition-all
              duration-300
              hover:scale-105
              hover:bg-indigo-50
              hover:shadow-md
            "
          >
            <TicketIcon
              size={21}
              strokeWidth={2}
            />
          </div>

          <p className="text-sm font-semibold text-slate-700 dark:text-white">
            No tickets found
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400 dark:text-slate-300">
            There are currently no tickets to display.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-list-container w-full bg-white dark:bg-[#404040] dark:text-white">
      {/* =====================================================
          TABLE HEADER
      ====================================================== */}
      <div
        className="
          ticket-list-header
          flex
          flex-col
          gap-3
          border-b
          border-slate-100
          bg-white
          dark:bg-[#404040] dark:text-white
          px-4
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-5
        "
      >
        <div className="flex items-center gap-2.5">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-indigo-100
              bg-indigo-50
              text-indigo-600
              shadow-sm
              transition-all
              duration-300
              hover:scale-105
              hover:bg-indigo-100
              hover:shadow-md
            "
          >
            <TicketIcon
              size={16}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white sm:text-base">
              Ticket List
            </p>

            <p className="text-[11px] text-slate-400 dark:text-slate-300">
              {tickets.length}{" "}
              {tickets.length === 1
                ? "ticket"
                : "tickets"}{" "}
              displayed
            </p>
          </div>
        </div>

        <div
          className="
            w-fit
            rounded-full
            border
            border-slate-200
            bg-slate-50
            px-3
            py-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-wide
            text-slate-500
          "
        >
          {tickets.length} Total
        </div>
      </div>

      {/* =====================================================
          MOBILE TICKET CARDS
          Visible below md
      ====================================================== */}
      <div className="block space-y-3 bg-slate-50/50 p-3 sm:p-4 md:hidden dark:bg-[#404040]">
        {tickets.map((ticket) => (
          <article
            key={ticket.id}
            className="
              group
              relative
              dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              border-l-4
              border-l-indigo-500
              bg-white
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-slate-300
              hover:border-l-indigo-600
              hover:shadow-lg
              active:scale-[0.995]
            "
          >
            {/* Decorative top line */}
            <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                h-20
                w-20
                rounded-full
                bg-indigo-500
                opacity-[0.025]
                transition-transform
                duration-500
                group-hover:scale-150
              "
            />

            <div className="relative p-4">
              {/* Ticket heading */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      text-slate-500
                      dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-blue-50 dark:group-hover:text-blue-600
                      shadow-sm
                      transition-all
                      duration-300
                      group-hover:border-indigo-100
                      group-hover:bg-indigo-50
                      group-hover:text-indigo-600
                    "
                  >
                    <TicketIcon size={16} />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        ticket-id
                        truncate
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-indigo-500
                        dark:group-hover:text-black
                      "
                      title={ticket.id}
                    >
                      {ticket.id}
                    </p>

                    <h3
                      className="
                        ticket-subject
                        mt-1
                        break-words
                        text-sm
                        font-bold
                        leading-5
                        text-slate-900
                        transition-colors
                        dark:group-hover:text-black
                        duration-200
                        group-hover:text-indigo-700
                      "
                      title={ticket.subject}
                    >
                      {ticket.subject}
                    </h3>
                  </div>
                </div>

                {/* View icon */}
                <button
                  type="button"
                  onClick={() => onView(ticket.id)}
                  aria-label={`View ${ticket.id}`}
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-slate-500
                    dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-white dark:group-hover:text-black
                    shadow-sm
                    transition-all
                    duration-200
                    hover:border-indigo-200
                    hover:bg-indigo-50
                    hover:text-indigo-600
                    hover:shadow-md
                    active:scale-90
                  "
                >
                  <Eye size={16} />
                </button>
              </div>

              {/* Status + Priority */}
              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  border-b
                  border-slate-100
                  pb-4
                "
              >
                <div className="origin-left scale-95">
                  <TicketPriorityBadge
                    priority={ticket.priority}
                  />
                </div>

                <div className="origin-left scale-95">
                  <TicketStatusBadge
                    status={ticket.status}
                  />
                </div>
              </div>

              {/* Details grid */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Category */}
                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50/70
                    p-3
                    transition-all
                    duration-200
                    hover:border-blue-100
                    hover:bg-blue-50/40
                  "
                >
                  <div className="flex items-center gap-2">
                    <FolderKanban
                      size={14}
                      className="shrink-0 text-blue-500"
                    />

                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
                      Category
                    </span>
                  </div>

                  <p className="mt-1.5 break-words text-xs font-semibold text-slate-700 dark:group-hover:text-black">
                    {getCategoryName(
                      ticket.category,
                    )}
                  </p>
                </div>

                {/* Created By */}
                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50/70
                    p-3
                    transition-all
                    duration-200
                    hover:border-violet-100
                    hover:bg-violet-50/40
                  "
                >
                  <div className="flex items-center gap-2">
                    <UserRound
                      size={14}
                      className="shrink-0 text-violet-500"
                    />

                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
                      Created By
                    </span>
                  </div>

                  <p className="mt-1.5 break-words text-xs font-semibold text-slate-700 dark:group-hover:text-black">
                    {getUserName(
                      ticket.createdBy,
                    )}
                  </p>
                </div>

                {/* Assigned Agent */}
                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50/70
                    p-3
                    transition-all
                    duration-200
                    hover:border-indigo-100
                    hover:bg-indigo-50/40
                  "
                >
                  <div className="flex items-center gap-2">
                    <UserRound
                      size={14}
                      className="shrink-0 text-indigo-500"
                    />

                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
                      Assigned Agent
                    </span>
                  </div>

                  {ticket.assignedAgent ? (
                    <p className="mt-1.5 break-words text-xs font-semibold text-slate-700 dark:group-hover:text-black">
                      {getUserName(
                        ticket.assignedAgent,
                      )}
                    </p>
                  ) : (
                    <span
                      className="
                        mt-1.5
                        inline-flex
                        rounded-md
                        border
                        border-orange-100
                        bg-orange-50
                        px-2
                        py-1
                        text-[10px]
                        font-bold
                        text-orange-600
                      "
                    >
                      Unassigned
                    </span>
                  )}
                </div>

                {/* Created Date */}
                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50/70
                    p-3
                    transition-all
                    duration-200
                    hover:border-emerald-100
                    hover:bg-emerald-50/40
                  "
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={14}
                      className="shrink-0 text-emerald-500"
                    />

                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-300 dark:group-hover:text-slate-600">
                      Created Date
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs font-semibold text-slate-700 dark:group-hover:text-black">
                    {ticket.createdDate}
                  </p>
                </div>
              </div>

              {/* View Ticket Button */}
              <button
                type="button"
                onClick={() => onView(ticket.id)}
                className="
                  mt-4
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-indigo-200
                  bg-indigo-50
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-indigo-700
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-indigo-300
                  hover:bg-indigo-100
                  hover:shadow-md
                  active:translate-y-0
                  active:scale-[0.98]
                "
              >
                <Eye size={15} />

                View Ticket

                <ArrowRight
                  size={14}
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-0.5
                  "
                />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* =====================================================
          TABLET + DESKTOP TABLE
          Visible md and above
      ====================================================== */}
      <div className="hidden w-full overflow-hidden md:block">
        <table
          className="
            w-full
            table-fixed
            border-collapse
            text-left
          "
        >
          {/* Column widths */}
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[10%]" />
            <col className="w-[9%]" />
            <col className="w-[11%]" />
            <col className="w-[12%]" />
            <col className="w-[13%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
          </colgroup>

          {/* Table header */}
          <thead
            className="
              border-b
              border-slate-200
              bg-slate-50/90
              dark:bg-[#404040] dark:text-white
            "
          >
            <tr>
              {[
                "Ticket",
                "Category",
                "Priority",
                "Status",
                "Created By",
                "Assigned Agent",
                "Created Date",
                "Action",
              ].map((heading, index) => (
                <th
                  key={heading}
                  className={`
                    px-2
                    py-3
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-500
                    dark:text-slate-300
                    ${index === 0 ? "pl-3 sm:pl-4" : ""}
                    ${index === 7 ? "pr-3 text-right sm:pr-4" : ""}
                  `}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="
                  ticket-table-row
                  group
                  bg-white
                  dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black
                  transition-all
                  duration-300
                  hover:bg-slate-50
                "
              >
                {/* Ticket */}
                <td className="px-2 py-3 pl-3 sm:pl-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className="
                        ticket-row-icon
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-slate-100
                        bg-slate-50
                        text-slate-400
                    dark:group-hover:text-slate-600
                        transition-all
                        duration-300
                        group-hover:border-indigo-100
                        group-hover:bg-indigo-50
                        group-hover:text-indigo-600
                      "
                    >
                      <TicketIcon size={14} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          ticket-id
                          truncate
                          text-[9px]
                          font-semibold
                          text-slate-400
                    dark:group-hover:text-slate-600
                          transition-colors
                          duration-300
                          group-hover:text-indigo-500
                        "
                        title={ticket.id}
                      >
                        {ticket.id}
                      </p>

                      <p
                        className="
                          ticket-subject
                          mt-0.5
                          break-words
                          text-[11px]
                          font-semibold
                          leading-4
                          text-slate-900
                          transition-colors
                          duration-300
                          group-hover:text-indigo-700
                        "
                        title={ticket.subject}
                      >
                        {ticket.subject}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-2 py-3">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <FolderKanban
                      size={13}
                      className="
                        shrink-0
                        text-blue-500
                        transition-colors
                        duration-300
                        group-hover:text-blue-600
                      "
                    />

                    <span className="break-words text-[10px] font-medium leading-4 text-slate-600 dark:group-hover:text-black">
                      {getCategoryName(
                        ticket.category,
                      )}
                    </span>
                  </div>
                </td>

                {/* Priority */}
                <td className="px-2 py-3">
                  <div
                    className="
                      origin-left
                      scale-90
                      transition-transform
                      duration-300
                      group-hover:scale-95
                    "
                  >
                    <TicketPriorityBadge
                      priority={ticket.priority}
                    />
                  </div>
                </td>

                {/* Status */}
                <td className="px-2 py-3">
                  <div
                    className="
                      origin-left
                      scale-90
                      transition-transform
                      duration-300
                      group-hover:scale-95
                    "
                  >
                    <TicketStatusBadge
                      status={ticket.status}
                    />
                  </div>
                </td>

                {/* Created By */}
                <td className="px-2 py-3">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <div
                      className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                        text-slate-400
                        transition-all
                        duration-300
                        group-hover:bg-blue-50
                        group-hover:text-blue-600
                      "
                    >
                      <UserRound size={12} />
                    </div>

                    <span className="min-w-0 break-words text-[10px] font-medium leading-4 text-slate-600 dark:group-hover:text-black">
                      {getUserName(
                        ticket.createdBy,
                      )}
                    </span>
                  </div>
                </td>

                {/* Assigned Agent */}
                <td className="px-2 py-3">
                  {ticket.assignedAgent ? (
                    <div className="flex min-w-0 items-center gap-1.5">
                      <div
                        className="
                          flex
                          h-6
                          w-6
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-indigo-50
                          text-indigo-400
                          transition-all
                          duration-300
                          group-hover:bg-indigo-100
                          group-hover:text-indigo-600
                        "
                      >
                        <UserRound size={12} />
                      </div>

                      <span className="min-w-0 break-words text-[10px] font-medium leading-4 text-slate-600 dark:group-hover:text-black">
                        {getUserName(
                          ticket.assignedAgent,
                        )}
                      </span>
                    </div>
                  ) : (
                    <span
                      className="
                        inline-flex
                        max-w-full
                        rounded-md
                        border
                        border-orange-100
                        bg-orange-50
                        px-2
                        py-1
                        text-[9px]
                        font-semibold
                        text-orange-600
                        transition-all
                        duration-300
                        group-hover:border-orange-200
                        group-hover:bg-orange-100
                      "
                    >
                      Unassigned
                    </span>
                  )}
                </td>

                {/* Created Date */}
                <td className="px-2 py-3">
                  <div className="flex min-w-0 items-start gap-1.5">
                    <CalendarDays
                      size={12}
                      className="
                        mt-0.5
                        shrink-0
                        text-slate-400
                        transition-colors
                        duration-300
                        group-hover:text-indigo-500
                        dark:group-hover:text-black
                      "
                    />

                    <span className="break-words text-[10px] font-medium leading-4 text-slate-600 dark:group-hover:text-black">
                      {ticket.createdDate}
                    </span>
                  </div>
                </td>

                {/* Action */}
                <td className="px-2 py-3 pr-3 text-right sm:pr-4">
                  <button
                    type="button"
                    onClick={() =>
                      onView(ticket.id)
                    }
                    className="
                      inline-flex
                      min-h-[32px]
                      items-center
                      justify-center
                      gap-1.5
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      text-slate-600
                      shadow-sm
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:border-indigo-200
                      hover:bg-indigo-50
                      hover:text-indigo-700
                      hover:shadow-md
                      active:translate-y-0
                      active:scale-95
                    "
                  >
                    <Eye size={13} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketTable;