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

        bg-[#0F172A]
        dark:bg-[#262626] 
        px-5
        py-6

        shadow-[0_12px_35px_rgba(37,99,235,0.20)]

        transition-all
        duration-300
        sm:px-7
        sm:py-7
        lg:px-8
      "
    >
      {/* Decorative circle */}

      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-20
          h-52
          w-52
          rounded-full
          bg-white/15
          blur-2xl

          dark:bg-white/5
        "
      />

      {/* Decorative shape */}

      <div
        className="
          pointer-events-none
          absolute
          -bottom-20
          right-20
          h-40
          w-40
          rotate-12
          rounded-3xl
          bg-white/10
          blur-xl

          dark:bg-white/5
        "
      />

      {/* Decorative square */}

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
          border-white/20
          bg-white/10

          shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_20px_40px_rgba(0,0,0,0.12)]

          lg:block

          dark:border-white/10
          dark:bg-white/5
        "
      />

      {/* Main content */}

      <div
        className="
          relative
          z-10
          flex
          flex-col
          gap-6

          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* Left content */}

        <div className="min-w-0">
          {/* Service Desk Overview */}

          <div className="mb-3 flex items-center gap-2">
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg

                bg-white/15
                text-white

                transition-colors
                duration-200

                hover:bg-white/25
              "
            >
              <Sparkles size={16} />
            </span>

            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white
              "
            >
              Service Desk Overview
            </span>
          </div>

          {/* Welcome heading */}

          <h1
            className="
              text-2xl
              font-black
              tracking-tight
              text-white

              sm:text-3xl
              lg:text-4xl
            "
          >
            Welcome back,{" "}
            {user?.fullName?.split(" ")[0] || "User"}!
          </h1>

          {/* Subtitle */}

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-white/90

              sm:text-base
            "
          >
            Here's what's happening with your service desk today.
          </p>

          {/* Date + Role */}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Date */}

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg

                border
                border-white/20
                bg-white/10

                px-3
                py-2

                text-xs
                font-medium
                text-white

                backdrop-blur-sm

                transition-all
                duration-200

                hover:bg-white/20
              "
            >
              <CalendarDays size={14} />
              {today}
            </div>

            {/* Role */}

            <div
              className="
                rounded-lg

                border
                border-white/20
                bg-white/10

                px-3
                py-2

                text-xs
                font-bold
                text-white

                transition-all
                duration-200

                hover:bg-white/20
              "
            >
              {roleLabel}
            </div>
          </div>
        </div>

        {/* Right actions */}

        <div
          className="
            flex
            w-full
            flex-col
            gap-2

            sm:w-auto
            sm:flex-row
            sm:flex-wrap

            lg:shrink-0
          "
        >
          {/* Create Ticket */}

          {user?.role === "employee" && onCreateTicket && (
            <button
              type="button"
              onClick={onCreateTicket}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl

                bg-white

                px-4
                py-2.5

                text-sm
                font-bold
                text-black

                shadow-lg

                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:bg-blue-950
                hover:text-white
                hover:shadow-xl

                active:translate-y-0

                sm:w-auto

                dark:bg-[#6B7280]
                dark:text-white

                dark:hover:bg-white
                dark:hover:text-black
              "
            >
              <Plus size={17} />
              Create Ticket
            </button>
          )}

          {/* Refresh */}

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
              border-white/25
              bg-white/10

              px-4
              py-2.5

              text-sm
              font-semibold
              text-white

              backdrop-blur-sm

              transition-all
              duration-200

              hover:-translate-y-0.5
              hover:bg-white
              hover:text-black
              hover:border-white

              disabled:cursor-not-allowed
              disabled:opacity-60

              sm:w-auto

              dark:border-white/10
              dark:bg-[#6B7280]
              dark:text-white

              dark:hover:bg-white
              dark:hover:text-black
              dark:hover:border-white
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