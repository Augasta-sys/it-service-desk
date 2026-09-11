import type { TicketStatus } from "../../types/ticket";

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

const statusConfig: Record<
  TicketStatus,
  {
    label: string;
    className: string;
  }
> = {
  open: {
    label: "Open",
    className: "bg-blue-100 text-blue-700",
  },
  assigned: {
    label: "Assigned",
    className: "bg-purple-100 text-purple-700",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-100 text-amber-700",
  },
  pending: {
    label: "Pending",
    className: "bg-orange-100 text-orange-700",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-100 text-emerald-700",
  },
  closed: {
    label: "Closed",
    className: "bg-slate-200 text-slate-700",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700",
  },
  reopened: {
    label: "Reopened",
    className: "bg-cyan-100 text-cyan-700",
  },
};

const TicketStatusBadge = ({
  status,
}: TicketStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${config.className} dark:group-hover:bg-white dark:group-hover:text-black`}
    >
      {config.label}
    </span>
  );
};

export default TicketStatusBadge;
