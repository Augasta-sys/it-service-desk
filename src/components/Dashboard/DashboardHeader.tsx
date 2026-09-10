import {
  CalendarDays,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { User } from "../../types/user";

interface DashboardHeaderProps {
  user: User | null;
  onRefresh: () => void;
  refreshing?: boolean;
  onCreateTicket?: () => void;
}

const DashboardHeader = ({
  user,
  onRefresh,
  refreshing = false,
  onCreateTicket,
}: DashboardHeaderProps) => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "support_agent"
        ? "Support Agent"
        : "Employee";

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-2xl
        bg-gradient-to-br
        from-slate-950
        via-slate-900
        to-blue-950
        px-5
        py-6
        shadow-[0_12px_35px_rgba(15,23,42,0.18)]
        sm:px-7
        sm:py-7
        lg:px-8
      "
    >
      {/* Decorative 3D shapes */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-500/20 blur-2xl" />

      <div className="pointer-events-none absolute -bottom-20 right-20 h-40 w-40 rotate-12 rounded-3xl bg-cyan-400/10 blur-xl" />

      <div
        className="
          pointer-events-none
          absolute
          right-8
          top-1/2
          hidden
          h-28
          w-28
          -translate-y-1/2
          rotate-12
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.2)]
          lg:block
        "
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
              <Sparkles size={16} />
            </span>

            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
              Service Desk Overview
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
            Welcome back, {user?.fullName?.split(" ")[0] || "User"}!
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Here's what's happening with your service desk today.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Date */}
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300">
              <CalendarDays size={14} />
              {today}
            </div>

            {/* Role */}
            <div className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-300">
              {roleLabel}
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap lg:shrink-0">
          {user?.role === "employee" && onCreateTicket && (
            <button
              type="button"
              onClick={onCreateTicket}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-white
                w-full 
                px-4 
                sm:w-auto
                py-2.5
                text-sm
                font-bold
                text-slate-900
                shadow-lg
                transition
                duration-200
                hover:-translate-y-0.5
                hover:bg-slate-100
                hover:shadow-xl
                active:translate-y-0
              "
            >
              <Plus size={17} />
              Create Ticket
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              backdrop-blur-sm
              transition
              duration-200
              hover:-translate-y-0.5
              hover:bg-white/10
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;