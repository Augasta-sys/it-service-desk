import type { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color:
    | "blue"
    | "purple"
    | "cyan"
    | "green"
    | "yellow"
    | "orange"
    | "red"
    | "navy";
  description?: string;
  onClick?: () => void;
}

const DashboardStatCard = ({
  title,
  value,
  icon: Icon,
  color,
  description,
  onClick,
}: DashboardStatCardProps) => {
  const styles = {
    blue: {
      accent: "bg-blue-500",
      icon: "bg-blue-50 text-blue-600",
      hover: "group-hover:bg-blue-100",
    },
    purple: {
      accent: "bg-purple-500",
      icon: "bg-purple-50 text-purple-600",
      hover: "group-hover:bg-purple-100",
    },
    cyan: {
      accent: "bg-cyan-500",
      icon: "bg-cyan-50 text-cyan-600",
      hover: "group-hover:bg-cyan-100",
    },
    green: {
      accent: "bg-emerald-500",
      icon: "bg-emerald-50 text-emerald-600",
      hover: "group-hover:bg-emerald-100",
    },
    yellow: {
      accent: "bg-amber-500",
      icon: "bg-amber-50 text-amber-600",
      hover: "group-hover:bg-amber-100",
    },
    orange: {
      accent: "bg-orange-500",
      icon: "bg-orange-50 text-orange-600",
      hover: "group-hover:bg-orange-100",
    },
    red: {
      accent: "bg-red-500",
      icon: "bg-red-50 text-red-600",
      hover: "group-hover:bg-red-100",
    },
    navy: {
      accent: "bg-slate-800",
      icon: "bg-slate-100 text-slate-700",
      hover: "group-hover:bg-slate-200",
    },
  };

  const currentStyle = styles[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        relative
        w-full
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        p-3
        text-left
        shadow-[0_2px_12px_rgba(15,23,42,0.04)]
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-slate-300
        hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]
        active:translate-y-0
        sm:p-3.5
      "
    >
      {/* Left accent */}
      <div
        className={`
          absolute
          left-0
          top-0
          h-full
          w-1
          ${currentStyle.accent}
        `}
      />

      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${currentStyle.icon}
            ${currentStyle.hover}
            transition-all
            duration-200
            group-hover:scale-105
          `}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-xl font-black leading-none text-slate-900 sm:text-2xl">
              {value}
            </span>

            {description && (
              <span className="hidden truncate text-[10px] font-medium text-slate-400 sm:inline">
                {description}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default DashboardStatCard;