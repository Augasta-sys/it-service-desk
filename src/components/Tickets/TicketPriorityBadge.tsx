import type { TicketPriority } from "../../types/ticket";

interface TicketPriorityBadgeProps {
  priority: TicketPriority;
}

const priorityConfig: Record<
  TicketPriority,
  {
    label: string;
    className: string;
  }
> = {
  low: {
    label: "Low",
    className: "bg-slate-100 text-slate-700",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-100 text-blue-700",
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-700",
  },
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-700",
  },
};

const TicketPriorityBadge = ({
  priority,
}: TicketPriorityBadgeProps) => {
  const config = priorityConfig[priority];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default TicketPriorityBadge;