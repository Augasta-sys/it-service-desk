import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock3,
  X,
} from "lucide-react";

import type {
  Ticket,
  TicketStatus,
} from "../../types/ticket";

import type { User } from "../../types/user";

interface NotificationDropdownProps {
  user: User;
  tickets: Ticket[];
  onClose: () => void;
  onNotificationClick: (ticketId: string) => void;
}

interface NotificationItem {
  id: string;
  ticketId: string;
  title: string;
  message: string;
  type: "warning" | "info" | "success" | "alert";
  createdDate: string;
}

const formatStatus = (status: TicketStatus) => {
  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};

const NotificationDropdown = ({
  user,
  tickets,
  onClose,
  onNotificationClick,
}: NotificationDropdownProps) => {
  const accessibleTickets = tickets.filter(
    (ticket) => {
      if (user.role === "admin") {
        return true;
      }

      if (user.role === "support_agent") {
        return ticket.assignedAgent === user.id;
      }

      if (user.role === "employee") {
        return ticket.createdBy === user.id;
      }

      return false;
    }
  );

  const notifications: NotificationItem[] =
    accessibleTickets
      .filter((ticket) =>
        [
          "open",
          "assigned",
          "in_progress",
          "pending",
          "resolved",
          "reopened",
        ].includes(ticket.status)
      )
      .sort(
        (a, b) =>
          new Date(b.updatedDate).getTime() -
          new Date(a.updatedDate).getTime()
      )
      .slice(0, 8)
      .map((ticket) => {
        let type: NotificationItem["type"] =
          "info";

        if (
          ticket.priority === "critical"
        ) {
          type = "alert";
        } else if (
          ticket.status === "resolved"
        ) {
          type = "success";
        } else if (
          ticket.status === "pending"
        ) {
          type = "warning";
        }

        return {
          id: `${ticket.id}-${ticket.updatedDate}`,
          ticketId: ticket.id,
          title: ticket.subject,
          message: `Ticket ${ticket.id} is ${formatStatus(
            ticket.status
          )}.`,
          type,
          createdDate: ticket.updatedDate,
        };
      });

  const getIcon = (
    type: NotificationItem["type"]
  ) => {
    if (type === "alert") {
      return (
        <AlertCircle
          size={17}
          className="text-red-600"
        />
      );
    }

    if (type === "success") {
      return (
        <CheckCircle2
          size={17}
          className="text-emerald-600"
        />
      );
    }

    if (type === "warning") {
      return (
        <Clock3
          size={17}
          className="text-amber-600"
        />
      );
    }

    return (
      <Bell
        size={17}
        className="text-blue-600"
      />
    );
  };

  return (
   <div
  className="
    absolute right-0 top-12 z-50
    w-[calc(100vw-2rem)] max-w-sm
    overflow-hidden
    rounded-2xl
    border border-slate-200
    bg-white
    shadow-[0_18px_45px_rgba(15,23,42,0.14)]
    sm:right-0
  "
>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Notifications
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {notifications.length} notification
            {notifications.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close notifications"
        >
          <X size={17} />
        </button>
      </div>

      {/* Notification List */}
      <div className="hide-scrollbar max-h-[min(70vh,420px)] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Bell
                size={21}
                className="text-slate-400"
              />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-700">
              No notifications
            </p>

            <p className="mt-1 text-xs text-slate-500">
              You're all caught up.
            </p>
          </div>
        ) : (
          notifications.map(
            (notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() =>
                  onNotificationClick(
                    notification.ticketId
                  )
                }
                className="flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  {getIcon(
                    notification.type
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {notification.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {notification.message}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Updated{" "}
                    {notification.createdDate}
                  </p>
                </div>
              </button>
            )
          )
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;