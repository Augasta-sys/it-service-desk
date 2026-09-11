import {
  ArrowRight,
  CalendarDays,
  CircleDot,
  Clock3,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Ticket } from "../../types/ticket";

interface RecentTicketsProps {
  tickets: Ticket[];
  viewAllPath?: string;
}

const statusStyles: Record<Ticket["status"], string> = {
  open: "bg-blue-50 text-blue-700 ring-blue-600/10",
  assigned: "bg-purple-50 text-purple-700 ring-purple-600/10",
  in_progress: "bg-cyan-50 text-cyan-700 ring-cyan-600/10",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/10",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  closed: "bg-slate-100 text-slate-700 ring-slate-500/10",
  cancelled: "bg-red-50 text-red-700 ring-red-600/10",
  reopened: "bg-pink-50 text-pink-700 ring-pink-600/10",
};

const priorityStyles: Record<Ticket["priority"], string> = {
  low: "text-emerald-600",
  medium: "text-amber-600",
  high: "text-orange-600",
  critical: "text-red-600",
};

const statusLabels: Record<Ticket["status"], string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
  cancelled: "Cancelled",
  reopened: "Reopened",
};

const formatDate = (date: string) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPriority = (priority: Ticket["priority"]) =>
  priority.charAt(0).toUpperCase() + priority.slice(1);

const RecentTickets = ({
  tickets,
  viewAllPath = "/tickets",
}: RecentTicketsProps) => {
  const navigate = useNavigate();

  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.updatedDate).getTime() -
        new Date(a.updatedDate).getTime(),
    )
    .slice(0, 6);

  return (
    <section
      className="
        recent-tickets-section
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-[0_4px_20px_rgba(15,23,42,0.05)]
      "
    >
      {/* =====================================================
          HEADER
          ===================================================== */}
      <div
        className="
          recent-tickets-header
          flex flex-col gap-3
          border-b border-slate-100
          px-5 py-5
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        "
      >
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Recent Tickets
          </h2>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Latest ticket activity across your service desk.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(viewAllPath)}
          className="
            group
            inline-flex
            w-fit
            items-center
            gap-1.5
            rounded-lg
            px-3
            py-2
            text-xs
            font-bold
            text-blue-600
            transition
            hover:bg-blue-50
            sm:text-sm
          "
        >
          View all

          <ArrowRight
            size={16}
            className="
              transition-transform
              duration-200
              group-hover:translate-x-1
            "
          />
        </button>
      </div>

      {/* =====================================================
          DESKTOP / TABLET TABLE
          ===================================================== */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr
              className="
                recent-tickets-table-head
                border-b
                border-slate-100
                bg-slate-50/70
                text-left
              "
            >
              <th
                className="
                  px-5
                  py-3
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Ticket
              </th>

              <th
                className="
                  px-5
                  py-3
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Category
              </th>

              <th
                className="
                  px-5
                  py-3
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Priority
              </th>

              <th
                className="
                  px-5
                  py-3
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Status
              </th>

              <th
                className="
                  px-5
                  py-3
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Updated
              </th>

              <th
                className="
                  px-5
                  py-3
                  text-right
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {recentTickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="
                  recent-tickets-row
                  group
                  cursor-pointer
                  border-b
                  border-slate-100
                  bg-white
                  transition-all
                  duration-200
                  last:border-b-0
                  hover:bg-slate-50
                "
              >
                {/* =================================================
                    TICKET
                    ================================================= */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        recent-ticket-icon
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                        transition-all
                        duration-200
                        group-hover:scale-105
                      "
                    >
                      <CircleDot size={18} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          recent-ticket-subject
                          max-w-[260px]
                          truncate
                          text-sm
                          font-bold
                          text-slate-800
                        "
                      >
                        {ticket.subject}
                      </p>

                      <p
                        className="
                          recent-ticket-id
                          mt-1
                          text-xs
                          font-medium
                          text-slate-400
                        "
                      >
                        #{ticket.id}
                      </p>
                    </div>
                  </div>
                </td>

                {/* =================================================
                    CATEGORY
                    ================================================= */}
                <td className="px-5 py-4">
                  <span
                    className="
                      recent-ticket-category
                      text-sm
                      font-medium
                      text-slate-600
                    "
                  >
                    {ticket.category || "Uncategorized"}
                  </span>
                </td>

                {/* =================================================
                    PRIORITY
                    ================================================= */}
                <td className="px-5 py-4">
                  <span
                    className={`
                      recent-ticket-priority
                      text-xs
                      font-bold
                      ${priorityStyles[ticket.priority]}
                    `}
                  >
                    {formatPriority(ticket.priority)}
                  </span>
                </td>

                {/* =================================================
                    STATUS
                    ================================================= */}
                <td className="px-5 py-4">
                  <span
                    className={`
                      recent-ticket-status
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-2.5
                      py-1
                      text-[11px]
                      font-bold
                      ring-1
                      ring-inset
                      ${statusStyles[ticket.status]}
                    `}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />

                    {statusLabels[ticket.status]}
                  </span>
                </td>

                {/* =================================================
                    UPDATED
                    ================================================= */}
                <td className="px-5 py-4">
                  <div
                    className="
                      recent-ticket-updated
                      flex
                      items-center
                      gap-1.5
                      text-xs
                      text-slate-500
                    "
                  >
                    <CalendarDays size={14} />

                    {formatDate(ticket.updatedDate)}
                  </div>
                </td>

                {/* =================================================
                    ACTION
                    ================================================= */}
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/tickets/${ticket.id}`);
                    }}
                    className="
                      recent-ticket-view
                      rounded-lg
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-blue-600
                      transition
                      hover:bg-blue-50
                    "
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          MOBILE CARDS
          ===================================================== */}
      <div
        className="
          divide-y
          divide-slate-100
          md:hidden
        "
      >
        {recentTickets.map((ticket) => (
          <button
            key={ticket.id}
            type="button"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            className="
              recent-ticket-mobile
              group
              flex
              w-full
              flex-col
              gap-4
              p-4
              text-left
              transition-all
              duration-200
              hover:bg-slate-50
              active:bg-slate-100
            "
          >
            {/* =================================================
                TOP
                ================================================= */}
            <div className="flex items-start gap-3">
              <div
                className="
                  recent-ticket-icon
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-blue-600
                  transition-all
                  duration-200
                  group-hover:scale-105
                "
              >
                <CircleDot size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="
                    recent-ticket-subject
                    truncate
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  {ticket.subject}
                </p>

                <p
                  className="
                    recent-ticket-id
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  #{ticket.id}
                </p>
              </div>

              <ArrowRight
                size={17}
                className="
                  recent-ticket-arrow
                  mt-1
                  shrink-0
                  text-slate-400
                "
              />
            </div>

            {/* =================================================
                DETAILS
                ================================================= */}
            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <p
                  className="
                    recent-ticket-label
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Category
                </p>

                <p
                  className="
                    recent-ticket-category
                    mt-1
                    truncate
                    text-xs
                    font-semibold
                    text-slate-600
                  "
                >
                  {ticket.category || "Uncategorized"}
                </p>
              </div>

              {/* Priority */}
              <div>
                <p
                  className="
                    recent-ticket-label
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Priority
                </p>

                <p
                  className={`
                    recent-ticket-priority
                    mt-1
                    text-xs
                    font-bold
                    ${priorityStyles[ticket.priority]}
                  `}
                >
                  {formatPriority(ticket.priority)}
                </p>
              </div>
            </div>

            {/* =================================================
                BOTTOM
                ================================================= */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Status */}
              <span
                className={`
                  recent-ticket-status
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  ring-1
                  ring-inset
                  ${statusStyles[ticket.status]}
                `}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                {statusLabels[ticket.status]}
              </span>

              {/* Date */}
              <span
                className="
                  recent-ticket-updated
                  flex
                  items-center
                  gap-1.5
                  text-[11px]
                  text-slate-400
                "
              >
                <Clock3 size={13} />

                {formatDate(ticket.updatedDate)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* =====================================================
          EMPTY STATE
          ===================================================== */}
      {recentTickets.length === 0 && (
        <div
          className="
            flex
            min-h-[220px]
            flex-col
            items-center
            justify-center
            px-6
            text-center
          "
        >
          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-slate-100
              text-slate-400
            "
          >
            <UserRound size={24} />
          </div>

          <h3
            className="
              mt-4
              text-sm
              font-bold
              text-slate-700
            "
          >
            No recent tickets
          </h3>

          <p
            className="
              mt-1
              max-w-sm
              text-xs
              text-slate-400
            "
          >
            Tickets will appear here when there is activity in your service
            desk.
          </p>
        </div>
      )}
    </section>
  );
};

export default RecentTickets;