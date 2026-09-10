import type { ReactNode } from "react";

interface DashboardChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

const DashboardChartCard = ({
  title,
  subtitle,
  children,
  className = "",
  action,
}: DashboardChartCardProps) => {
  return (
    <section
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-[0_3px_18px_rgba(15,23,42,0.05)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-slate-300
        hover:shadow-[0_12px_30px_rgba(15,23,42,0.09)]
        ${className}
      `}
    >
      {/* Decorative background */}
      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          bg-blue-500
          opacity-[0.025]
          transition-transform
          duration-500
          group-hover:scale-150
        "
      />

      {/* Header */}
      <div
        className="
          relative
          flex
          items-start
          justify-between
          gap-3
          border-b
          border-slate-100
          px-4
          py-3
          sm:px-5
        "
      >
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Chart content */}
      <div className="relative p-3 sm:p-4 lg:p-5">
        {children}
      </div>

      {/* Bottom hover line */}
      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          h-px
          w-full
          bg-gradient-to-r
          from-transparent
          via-blue-300
          to-transparent
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />
    </section>
  );
};

export default DashboardChartCard;