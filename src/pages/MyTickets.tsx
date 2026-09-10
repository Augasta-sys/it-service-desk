import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FilePlus2,
  ListChecks,
  Plus,
  RefreshCw,
  Ticket as TicketIcon,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Ticket } from "../types/ticket";
import type { User } from "../types/user";
import type { Category } from "../types/category";

import { getTickets } from "../services/ticketService";
import { getUsers } from "../services/userService";
import { getCategories } from "../services/categoryService";

import { useAuth } from "../hooks/useAuth";

import TicketTable from "../components/Tickets/TicketTable";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  iconClassName: string;
  bgClassName: string;
  description: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconClassName,
  bgClassName,
  description,
}: StatCardProps) => {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-slate-300
        hover:shadow-lg
        sm:p-5
      "
    >
      {/* Decorative circle */}
      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-24
          w-24
          rounded-full
          bg-slate-100
          opacity-70
          transition-transform
          duration-500
          group-hover:scale-150
        "
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              transition-all
              duration-300
              group-hover:scale-105
              ${bgClassName}
              ${iconClassName}
            `}
          >
            <Icon size={19} />
          </div>

          <span
            className="
              rounded-full
              border
              border-slate-100
              bg-slate-50
              px-2
              py-1
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            My Tickets
          </span>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
};

const MyTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMyTickets = async (showRefresh = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        ticketsData,
        usersData,
        categoriesData,
      ] = await Promise.all([
        getTickets(),
        getUsers(),
        getCategories(),
      ]);

      const myTickets = ticketsData.filter(
        (ticket) => ticket.createdBy === user.id,
      );

      setTickets(myTickets);
      setUsers(usersData);
      setCategories(categoriesData);
    } catch (error) {
      console.error(
        "Failed to load my tickets:",
        error,
      );

      setError(
        "Unable to load your tickets. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

 useEffect(() => {
  const loadTickets = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getTickets();

      const myTickets = data.filter(
        (ticket) => ticket.createdBy === user.id
      );

      setTickets(myTickets);
    } catch (error) {
      console.error(
        "Failed to load my tickets:",
        error
      );

      setError(
        "Unable to load your tickets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  void loadTickets();
}, [user]);

  const handleViewTicket = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  /*
   * Ticket statistics
   */
  const stats = useMemo(() => {
    const total = tickets.length;

    const open = tickets.filter(
      (ticket) => ticket.status === "open",
    ).length;

    const inProgress = tickets.filter(
      (ticket) => ticket.status === "in_progress",
    ).length;

    const resolved = tickets.filter(
      (ticket) =>
        ticket.status === "resolved" ||
        ticket.status === "closed",
    ).length;

    const pending = tickets.filter(
      (ticket) => ticket.status === "pending",
    ).length;

    const cancelled = tickets.filter(
      (ticket) => ticket.status === "cancelled",
    ).length;

    return {
      total,
      open,
      inProgress,
      resolved,
      pending,
      cancelled,
    };
  }, [tickets]);

  return (
    <div className="mx-auto w-full max-w-[1800px] pb-8">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div
        className="
          group
          relative
          mb-5
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          border-t-4
          border-t-slate-900
          bg-white
          p-5
          shadow-sm
          transition-all
          duration-300
          hover:border-slate-300
          hover:border-t-slate-950
          hover:shadow-lg
          sm:p-6
        "
      >
        {/* Background decoration */}
        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-20
            h-48
            w-48
            rounded-full
            bg-slate-900
            opacity-[0.035]
            transition-transform
            duration-700
            group-hover:scale-125
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* Title */}
          <div className="flex items-start gap-4">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-slate-900
                text-white
                shadow-sm
                transition-all
                duration-300
                group-hover:scale-105
                group-hover:shadow-md
              "
            >
              <TicketIcon size={22} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  My Tickets
                </h1>

                <span
                  className="
                    rounded-full
                    border
                    border-emerald-200
                    bg-emerald-50
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-emerald-700
                  "
                >
                  Employee
                </span>
              </div>

              <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                View, track and manage the IT support
                requests you have submitted.
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => loadMyTickets(true)}
              disabled={loading || refreshing}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-slate-700
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-900
                hover:shadow-md
                active:translate-y-0
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : "transition-transform duration-300 group-hover:rotate-12"
                }
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/tickets/create")}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-900
                bg-slate-900
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-slate-800
                hover:shadow-lg
                active:translate-y-0
                active:scale-[0.98]
              "
            >
              <Plus
                size={17}
                className="transition-transform duration-200 group-hover:rotate-90"
              />

              Create Ticket
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ====================================================== */}
      {!loading && !error && (
        <section
          aria-label="My ticket statistics"
          className="
            mb-5
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-6
          "
        >
          <StatCard
            title="Total"
            value={stats.total}
            icon={ListChecks}
            iconClassName="text-blue-700"
            bgClassName="border-blue-100 bg-blue-50"
            description="All submitted tickets"
          />

          <StatCard
            title="Open"
            value={stats.open}
            icon={AlertCircle}
            iconClassName="text-cyan-700"
            bgClassName="border-cyan-100 bg-cyan-50"
            description="Waiting for assignment"
          />

          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock3}
            iconClassName="text-amber-700"
            bgClassName="border-amber-100 bg-amber-50"
            description="Currently being handled"
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock3}
            iconClassName="text-orange-700"
            bgClassName="border-orange-100 bg-orange-50"
            description="Waiting for an update"
          />

          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={CheckCircle2}
            iconClassName="text-emerald-700"
            bgClassName="border-emerald-100 bg-emerald-50"
            description="Resolved or closed"
          />

          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={XCircle}
            iconClassName="text-red-700"
            bgClassName="border-red-100 bg-red-50"
            description="Cancelled requests"
          />
        </section>
      )}

      {/* =====================================================
          QUICK CREATE / INFORMATION PANEL
      ====================================================== */}
      {!loading && !error && (
        <div
          className="
            group
            relative
            mb-5
            overflow-hidden
            rounded-2xl
            border
            border-blue-100
            bg-gradient-to-r
            from-blue-50
            via-white
            to-slate-50
            p-4
            shadow-sm
            transition-all
            duration-300
            hover:border-blue-200
            hover:shadow-md
            sm:p-5
          "
        >
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-blue-100
                  bg-white
                  text-blue-600
                  shadow-sm
                  transition-all
                  duration-300
                  group-hover:scale-105
                "
              >
                <FilePlus2 size={19} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Need IT assistance?
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                  Create a new support request and our
                  IT team will review it.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/tickets/create")}
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-blue-200
                bg-white
                px-4
                py-2.5
                text-xs
                font-bold
                text-blue-700
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-blue-300
                hover:bg-blue-50
                hover:shadow-md
                active:scale-[0.98]
                sm:text-sm
              "
            >
              <Plus size={15} />
              New Request
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}
      {loading && (
        <div
          className="
            flex
            min-h-[360px]
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            border-t-4
            border-t-slate-900
            bg-white
            px-5
            shadow-sm
          "
        >
          <div
            className="
              h-9
              w-9
              animate-spin
              rounded-full
              border-[3px]
              border-slate-200
              border-t-slate-900
            "
          />

          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading your tickets...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Please wait while we fetch your requests.
          </p>
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}
      {!loading && error && (
        <div
          className="
            rounded-2xl
            border
            border-red-200
            border-t-4
            border-t-red-500
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >
              <AlertCircle size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-red-800">
                Unable to load tickets
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => loadMyTickets()}
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-red-200
                  bg-white
                  px-4
                  py-2
                  text-xs
                  font-bold
                  text-red-700
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-red-50
                  hover:shadow-sm
                  active:scale-[0.98]
                "
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}
      {!loading && !error && tickets.length === 0 && (
        <div
          className="
            group
            rounded-2xl
            border
            border-dashed
            border-slate-300
            bg-white
            px-5
            py-14
            text-center
            shadow-sm
            transition-all
            duration-300
            hover:border-slate-400
            hover:shadow-md
            sm:py-20
          "
        >
          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              text-slate-500
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:bg-slate-100
            "
          >
            <TicketIcon size={27} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            No tickets yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            You haven't created any support requests.
            Create your first ticket to get help from
            the IT support team.
          </p>

          <button
            type="button"
            onClick={() => navigate("/tickets/create")}
            className="
              mt-6
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-900
              bg-slate-900
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-slate-800
              hover:shadow-lg
              active:translate-y-0
              active:scale-[0.98]
            "
          >
            <Plus size={17} />
            Create Your First Ticket
          </button>
        </div>
      )}

      {/* =====================================================
          TICKETS TABLE
      ====================================================== */}
      {!loading && !error && tickets.length > 0 && (
        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            border-t-4
            border-t-indigo-600
            bg-white
            shadow-sm
            transition-all
            duration-300
            hover:border-slate-300
            hover:border-t-indigo-700
            hover:shadow-lg
          "
        >
          {/* Table header */}
          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-slate-100
              bg-slate-50/70
              px-4
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-5
            "
          >
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-indigo-50
                    text-indigo-600
                  "
                >
                  <ListChecks size={17} />
                </div>

                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Ticket Requests
                </h2>
              </div>

              <p className="mt-1 pl-10 text-xs text-slate-500">
                Track the status and progress of your
                submitted requests.
              </p>
            </div>

            <div
              className="
                inline-flex
                w-fit
                items-center
                rounded-full
                border
                border-slate-200
                bg-white
                px-3
                py-1.5
                text-xs
                font-bold
                text-slate-600
                shadow-sm
              "
            >
              {tickets.length}{" "}
              {tickets.length === 1
                ? "Ticket"
                : "Tickets"}
            </div>
          </div>

          {/* Table */}
          <div className="p-3 sm:p-4">
            <TicketTable
              tickets={tickets}
              users={users}
              categories={categories}
              onView={handleViewTicket}
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default MyTickets;