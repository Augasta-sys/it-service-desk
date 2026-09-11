import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  PieChart,
  Plus,
  Search,
  Ticket as TicketIcon,
  UserX,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../types/ticket";

import { getTickets } from "../services/ticketService";

import TicketTable from "../components/Tickets/TicketTable";
import useTicketRelatedData from "../hooks/useTicketRelatedData";
import TicketFilters from "../components/Tickets/TicketFilters";
import { useAuth } from "../hooks/useAuth";

/* ============================================================
   TYPES
   ============================================================ */

interface ChartItem {
  label: string;
  value: number;
  color: string;
}

/* ============================================================
   STATUS CONFIG
   ============================================================ */

const STATUS_LABELS: Record<
  TicketStatus,
  string
> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
  cancelled: "Cancelled",
  reopened: "Reopened",
};

const STATUS_COLORS: Record<
  TicketStatus,
  string
> = {
  open: "#3b82f6",
  assigned: "#8b5cf6",
  in_progress: "#06b6d4",
  pending: "#f59e0b",
  resolved: "#22c55e",
  closed: "#64748b",
  cancelled: "#ef4444",
  reopened: "#ec4899",
};

/* ============================================================
   PRIORITY CONFIG
   ============================================================ */

const PRIORITY_LABELS: Record<
  TicketPriority,
  string
> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const PRIORITY_COLORS: Record<
  TicketPriority,
  string
> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

/* ============================================================
   PAGE
   ============================================================ */

const Tickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchParams] =
    useSearchParams();

  const [tickets, setTickets] =
    useState<Ticket[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  /* ----------------------------------------------------------
     Initial URL filters
     ---------------------------------------------------------- */

  const initialStatus =
    searchParams.get("status");

  const initialPriority =
    searchParams.get("priority");

  const initialCategory =
    searchParams.get("category");

  const initialAssignment =
    searchParams.get("assignment");

  const [status, setStatus] =
    useState<TicketStatus | "all">(
      initialStatus &&
        [
          "open",
          "assigned",
          "in_progress",
          "pending",
          "resolved",
          "closed",
          "cancelled",
          "reopened",
        ].includes(initialStatus)
        ? (initialStatus as TicketStatus)
        : "all"
    );

  const [priority, setPriority] =
    useState<TicketPriority | "all">(
      initialPriority &&
        [
          "low",
          "medium",
          "high",
          "critical",
        ].includes(initialPriority)
        ? (initialPriority as TicketPriority)
        : "all"
    );

  const [category, setCategory] =
    useState(
      initialCategory || "all"
    );

  const [assignment, setAssignment] =
    useState<
      "all" | "unassigned"
    >(
      initialAssignment ===
        "unassigned"
        ? "unassigned"
        : "all"
    );

  const [sortBy, setSortBy] =
    useState<
      "newest" | "oldest" | "priority"
    >("newest");

  /* ----------------------------------------------------------
     Related data
     ---------------------------------------------------------- */

  const {
    users,
    categories,
    loading: relatedDataLoading,
    error: relatedDataError,
  } = useTicketRelatedData();

  /* ==========================================================
     LOAD TICKETS
     ========================================================== */

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getTickets();

        setTickets(data);
      } catch (error) {
        console.error(
          "Failed to load tickets:",
          error
        );

        setError(
          "Unable to load tickets. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  /* ==========================================================
     ROLE-BASED ACCESS
     ========================================================== */

  const accessibleTickets = useMemo(() => {
    if (!user) {
      return [];
    }

    /* Admin → all tickets */

    if (user.role === "admin") {
      return tickets;
    }

    /* Support Agent → assigned tickets */

    if (
      user.role ===
      "support_agent"
    ) {
      return tickets.filter(
        (ticket) =>
          ticket.assignedAgent ===
          user.id
      );
    }

    return [];
  }, [tickets, user]);

  /* ==========================================================
     FILTERED TICKETS
     ========================================================== */

  const filteredTickets =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      const filtered =
        accessibleTickets.filter(
          (ticket) => {
            const matchesSearch =
              !normalizedSearch ||
              ticket.id
                .toLowerCase()
                .includes(
                  normalizedSearch
                ) ||
              ticket.subject
                .toLowerCase()
                .includes(
                  normalizedSearch
                ) ||
              ticket.description
                .toLowerCase()
                .includes(
                  normalizedSearch
                );

            const matchesStatus =
              status === "all" ||
              ticket.status === status;

            const matchesPriority =
              priority === "all" ||
              ticket.priority ===
                priority;

            const matchesCategory =
              category === "all" ||
              ticket.category ===
                category;

            const matchesAssignment =
              assignment === "all" ||
              (assignment ===
                "unassigned" &&
                !ticket.assignedAgent);

            return (
              matchesSearch &&
              matchesStatus &&
              matchesPriority &&
              matchesCategory &&
              matchesAssignment
            );
          }
        );

      return [...filtered].sort(
        (a, b) => {
          if (
            sortBy === "newest"
          ) {
            return (
              new Date(
                b.createdDate
              ).getTime() -
              new Date(
                a.createdDate
              ).getTime()
            );
          }

          if (
            sortBy === "oldest"
          ) {
            return (
              new Date(
                a.createdDate
              ).getTime() -
              new Date(
                b.createdDate
              ).getTime()
            );
          }

          const priorityOrder: Record<
            TicketPriority,
            number
          > = {
            critical: 1,
            high: 2,
            medium: 3,
            low: 4,
          };

          return (
            priorityOrder[
              a.priority
            ] -
            priorityOrder[
              b.priority
            ]
          );
        }
      );
    }, [
      accessibleTickets,
      search,
      status,
      priority,
      category,
      assignment,
      sortBy,
    ]);

  /* ==========================================================
     CLEAR FILTERS
     ========================================================== */

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setCategory("all");
    setAssignment("all");
    setSortBy("newest");

    navigate("/tickets", {
      replace: true,
    });
  };

  /* ==========================================================
     VIEW TICKET
     ========================================================== */

  const handleViewTicket = (
    ticketId: string
  ) => {
    navigate(
      `/tickets/${ticketId}`
    );
  };

  /* ==========================================================
     ANALYTICS
     ========================================================== */

  const statusData =
    useMemo<ChartItem[]>(() => {
      return (
        Object.keys(
          STATUS_LABELS
        ) as TicketStatus[]
      )
        .map((ticketStatus) => ({
          label:
            STATUS_LABELS[
              ticketStatus
            ],
          value:
            filteredTickets.filter(
              (ticket) =>
                ticket.status ===
                ticketStatus
            ).length,
          color:
            STATUS_COLORS[
              ticketStatus
            ],
        }))
        .filter(
          (item) => item.value > 0
        );
    }, [filteredTickets]);

  const priorityData =
    useMemo<ChartItem[]>(() => {
      return (
        Object.keys(
          PRIORITY_LABELS
        ) as TicketPriority[]
      )
        .map((ticketPriority) => ({
          label:
            PRIORITY_LABELS[
              ticketPriority
            ],
          value:
            filteredTickets.filter(
              (ticket) =>
                ticket.priority ===
                ticketPriority
            ).length,
          color:
            PRIORITY_COLORS[
              ticketPriority
            ],
        }))
        .filter(
          (item) => item.value > 0
        );
    }, [filteredTickets]);

  const categoryData =
    useMemo<ChartItem[]>(() => {
      const categoryMap: Record<
        string,
        number
      > = {};

      filteredTickets.forEach(
        (ticket) => {
          const key =
            ticket.category?.trim() ||
            "Uncategorized";

          categoryMap[key] =
            (categoryMap[key] || 0) +
            1;
        }
      );

      const chartColors = [
        "#3b82f6",
        "#8b5cf6",
        "#06b6d4",
        "#22c55e",
        "#f59e0b",
        "#f97316",
        "#ec4899",
        "#6366f1",
      ];

      return Object.entries(
        categoryMap
      )
        .map(
          (
            [categoryId, value],
            index
          ) => {
            const foundCategory =
              categories.find(
                (item) =>
                  item.id ===
                  categoryId
              );

            return {
              label:
                foundCategory?.name ||
                categoryId,
              value,
              color:
                chartColors[
                  index %
                    chartColors.length
                ],
            };
          }
        )
        .sort(
          (a, b) =>
            b.value - a.value
        );
    }, [
      filteredTickets,
      categories,
    ]);

  /* ==========================================================
     QUICK METRICS
     ========================================================== */

  const criticalCount =
    filteredTickets.filter(
      (ticket) =>
        ticket.priority ===
        "critical"
    ).length;

  const unresolvedCount =
    filteredTickets.filter(
      (ticket) =>
        ![
          "resolved",
          "closed",
          "cancelled",
        ].includes(ticket.status)
    ).length;

  const resolvedCount =
    filteredTickets.filter(
      (ticket) =>
        ticket.status ===
          "resolved" ||
        ticket.status ===
          "closed"
    ).length;

  const unassignedCount =
    filteredTickets.filter(
      (ticket) =>
        !ticket.assignedAgent
    ).length;

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="tickets-page w-full min-w-0 pb-8">
      {/* ======================================================
          MAIN HEADER
          ====================================================== */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-100
          border-t-4
          border-t-slate-900
          bg-white
          dark:!bg-[#404040] dark:text-white
          shadow-sm
          transition-all
          duration-300
          hover:border-slate-200
          hover:border-t-slate-950
          hover:shadow-lg
        "
      >
        {/* Header */}

        <div
          className="
            border-b
            border-slate-100
            dark:border-slate-600
            dark:!bg-[#404040]
            px-4
            py-5
            sm:px-6
            sm:py-6
            lg:px-7
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              xl:flex-row
              xl:items-center
              xl:justify-between
            "
          >
            {/* Title */}

            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-900
                  text-white
                  shadow-sm
                  transition-all
                  duration-300
                  hover:scale-105
                  hover:bg-slate-800
                  hover:shadow-lg
                  sm:h-12
                  sm:w-12
                "
              >
                <TicketIcon
                  size={21}
                  strokeWidth={2.2}
                />
              </div>

              <div className="min-w-0">
                <h1
                  className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    dark:text-white
                    sm:text-3xl
                  "
                >
                  Tickets
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-200 sm:text-base">
                  Manage and track service
                  desk tickets.
                </p>
              </div>
            </div>

            {/* Create Ticket */}

            {user?.role ===
              "employee" && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/tickets/create"
                  )
                }
                className="
                  inline-flex
                  min-h-[44px]
                  w-full
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
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-slate-700
                  hover:bg-slate-800
                  hover:shadow-lg
                  active:scale-[0.98]
                  xl:w-fit
                "
              >
                <Plus
                  size={18}
                  strokeWidth={2.4}
                />
                Create Ticket
              </button>
            )}
          </div>
        </div>

        {/* ====================================================
            FILTERS
            ==================================================== */}

        <div
          className="
            border-b
            border-slate-100
            dark:border-slate-600
            dark:!bg-[#404040]
            px-4
            py-5
            sm:px-6
            lg:px-7
          "
        >
          <TicketFilters
            search={search}
            status={status}
            priority={priority}
            category={category}
            sortBy={sortBy}
            categories={categories}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onPriorityChange={
              setPriority
            }
            onCategoryChange={
              setCategory
            }
            onSortChange={setSortBy}
            onClear={clearFilters}
          />
        </div>

        {/* ====================================================
            SEARCH + TOTAL
            ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-3
            bg-slate-50/60
            dark:!bg-[#404040]
            px-4
            py-4
            sm:px-6
            lg:grid-cols-[minmax(0,1fr)_220px]
            lg:px-7
          "
        >
          {/* Search */}

          <div
            className="
              flex
              min-h-[72px]
              items-center
              rounded-xl
              border
              border-blue-100
              bg-white
              dark:!bg-[#404040] dark:text-white
              dark:hover:!bg-white dark:hover:text-black
              px-4
              shadow-sm
              transition-all
              duration-300
              hover:border-blue-300
              hover:shadow-md
            "
          >
            <div className="w-full">
              <p
                className="
                  mb-1
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Search Tickets
              </p>

              <div className="relative">
                <Search
                  size={17}
                  className="
                    absolute
                    left-0
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search by ticket ID, subject or description..."
                  className="
                    w-full
                    border-0
                    bg-transparent
                    py-1
                    pl-7
                    pr-2
                    text-sm
                    font-medium
                    text-slate-900
                    dark:text-white
                    outline-none
                    placeholder:text-slate-400
                  "
                />
              </div>
            </div>
          </div>

          {/* Total */}

          <div
            className="
              group
              flex
              min-h-[72px]
              items-center
              justify-between
              rounded-xl
              border
              border-cyan-100
              bg-white
              dark:!bg-[#404040] dark:text-white
              dark:hover:!bg-white dark:hover:text-black
              px-4
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-cyan-300
              hover:shadow-md
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-cyan-600
                "
              >
                Total Tickets
              </p>

              <p className="mt-1 text-2xl font-bold leading-none text-slate-900 dark:text-white">
                {filteredTickets.length}
              </p>
            </div>

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-cyan-50
                text-cyan-600
                transition-all
                duration-300
                group-hover:scale-110
                group-hover:bg-cyan-100
              "
            >
              <TicketIcon
                size={19}
                strokeWidth={2.2}
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            QUICK ANALYTICS
            ==================================================== */}

        {!loading &&
          !error &&
          !relatedDataLoading &&
          !relatedDataError && (
            <div
              className="
                grid
                grid-cols-2
                gap-3
                border-b
                border-slate-100
                dark:border-slate-600
                dark:!bg-[#404040]
                px-4
                py-4
                sm:grid-cols-4
                sm:px-6
                lg:px-7
              "
            >
              <TicketMetric
                label="Unresolved"
                value={unresolvedCount}
                icon={Clock3}
                iconClass="bg-blue-50 text-blue-600"
              />

              <TicketMetric
                label="Resolved"
                value={resolvedCount}
                icon={CheckCircle2}
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <TicketMetric
                label="Critical"
                value={criticalCount}
                icon={AlertTriangle}
                iconClass="bg-red-50 text-red-600"
              />

              <TicketMetric
                label="Unassigned"
                value={unassignedCount}
                icon={UserX}
                iconClass="bg-orange-50 text-orange-600"
              />
            </div>
          )}

        {/* ====================================================
            ANALYTICS HEADER
            ==================================================== */}

        {!loading &&
          !error &&
          !relatedDataLoading &&
          !relatedDataError && (
            <div className="border-b border-slate-100 dark:border-slate-600 dark:!bg-[#404040] dark:text-white px-4 py-5 sm:px-6 lg:px-7">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <BarChart3
                        size={15}
                      />
                    </div>

                    <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                      Ticket Analytics
                    </h2>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-200 sm:text-sm">
                    Visual overview of the
                    currently displayed
                    tickets.
                  </p>
                </div>

                <div className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-600 dark:bg-[#404040] dark:text-slate-200 sm:mt-0">
                  <Activity
                    size={13}
                    className="text-blue-500"
                  />
                  Live Data
                </div>
              </div>
            </div>
          )}

        {/* ====================================================
            CHARTS
            ==================================================== */}

        {!loading &&
          !error &&
          !relatedDataLoading &&
          !relatedDataError && (
            <div
              className="
                grid
                min-w-0
                grid-cols-1
                gap-4
                border-b
                border-slate-100
                dark:border-slate-600
                dark:!bg-[#404040]
                px-4
                py-5
                sm:px-6
                lg:grid-cols-2
                lg:px-7
                xl:grid-cols-[1fr_1fr]
              "
            >
              {/* STATUS DONUT */}

              <ChartPanel
                title="Status Distribution"
                subtitle="Current ticket lifecycle"
              >
                <StatusDonut
                  data={statusData}
                />
              </ChartPanel>

              {/* PRIORITY */}

              <ChartPanel
                title="Priority Distribution"
                subtitle="Tickets grouped by priority"
              >
                <PriorityBars
                  data={priorityData}
                />
              </ChartPanel>

              {/* CATEGORY */}

              <div className="lg:col-span-2">
                <ChartPanel
                  title="Tickets by Category"
                  subtitle="Ticket volume across service categories"
                >
                  <CategoryBars
                    data={categoryData}
                  />
                </ChartPanel>
              </div>
            </div>
          )}

        {/* ====================================================
            UNASSIGNED BANNER
            ==================================================== */}

        {assignment ===
          "unassigned" && (
          <div className="px-4 pb-4 pt-4 sm:px-6 lg:px-7">
            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-orange-100
                border-l-4
                border-l-orange-500
                bg-orange-50/70
                px-4
                py-3
                transition-all
                duration-300
                hover:border-orange-200
                hover:border-l-orange-600
                hover:bg-orange-50
                hover:shadow-md
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-orange-100
                  text-orange-600
                "
              >
                <TicketIcon
                  size={17}
                  strokeWidth={2.2}
                />
              </div>

              <div>
                <p className="text-sm font-bold text-orange-800">
                  Unassigned Tickets
                </p>

                <p className="mt-0.5 text-xs text-orange-600">
                  Showing tickets that
                  currently have no support
                  agent assigned.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          LOADING
          ====================================================== */}

      {loading && (
        <div
          className="
            mt-6
            flex
            min-h-60
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-100
            border-t-4
            border-t-slate-500
            bg-white
            dark:!bg-[#404040] dark:text-white
            dark:hover:!bg-white dark:hover:text-black
            shadow-sm
          "
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="
                h-9
                w-9
                animate-spin
                rounded-full
                border-2
                border-slate-200
                border-t-slate-700
              "
            />

            <p className="text-sm font-medium text-slate-500 dark:text-slate-200">
              Loading tickets...
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          ERROR
          ====================================================== */}

      {!loading && error && (
        <div
          className="
            mt-6
            rounded-2xl
            border
            border-red-100
            border-t-4
            border-t-red-500
            bg-white
            dark:!bg-[#404040] dark:text-white
            dark:hover:!bg-white dark:hover:text-black
            p-5
            shadow-sm
            transition-all
            duration-300
            hover:border-red-200
            hover:shadow-md
          "
        >
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ======================================================
          RELATED DATA ERROR
          ====================================================== */}

      {!loading &&
        !error &&
        !relatedDataLoading &&
        relatedDataError && (
          <div
            className="
              mt-6
              rounded-2xl
              border
              border-red-100
              border-t-4
              border-t-red-500
              bg-white
              dark:!bg-[#404040] dark:text-white
              p-5
              shadow-sm
            "
          >
            <p className="text-sm font-semibold text-red-700">
              {relatedDataError}
            </p>
          </div>
        )}

      {/* ======================================================
          TABLE
          ====================================================== */}

      {!loading &&
        !error &&
        !relatedDataLoading &&
        !relatedDataError && (
          <div
            className="
              mt-6
              overflow-hidden
              rounded-2xl
              border
              border-indigo-100
              border-t-4
              border-t-indigo-500
              bg-white
              dark:!bg-[#404040] dark:text-white
              dark:hover:!bg-white dark:hover:text-black
              shadow-sm
              transition-all
              duration-300
              hover:border-indigo-200
              hover:border-t-indigo-600
              hover:shadow-md
            "
          >
            <TicketTable
              tickets={filteredTickets}
              users={users}
              categories={categories}
              onView={handleViewTicket}
            />
          </div>
        )}
    </div>
  );
};

/* ============================================================
   METRIC CARD
   ============================================================ */

interface TicketMetricProps {
  label: string;
  value: number;
  icon: typeof Clock3;
  iconClass: string;
}

const TicketMetric = ({
  label,
  value,
  icon: Icon,
  iconClass,
}: TicketMetricProps) => {
  return (
    <div
      className="
        group
        flex
        min-w-0
        items-center
        gap-2.5
        rounded-xl
        border
        border-slate-200
        bg-white
        dark:!bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black
        p-3
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-md
        sm:gap-3
        sm:p-3.5
      "
    >
      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          ${iconClass}
          transition-transform
          duration-300
          group-hover:scale-110
        `}
      >
        <Icon
  size={18}
  className="!text-black dark:!text-black"
/>
      </div>

      <div className="min-w-0">
        <p className="truncate text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-200 group-hover:text-black sm:text-[10px]">
          {label}
        </p>

        <p className="mt-0.5 text-lg font-black text-slate-900 dark:text-white group-hover:text-black sm:text-xl">
          {value}
        </p>
      </div>
    </div>
  );
};

/* ============================================================
   CHART PANEL
   ============================================================ */

interface ChartPanelProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const ChartPanel = ({
  title,
  subtitle,
  children,
}: ChartPanelProps) => {
  return (
    <section
      className="
        group
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        border-t-2
        border-t-blue-500
        bg-white
        dark:!bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black
        shadow-[0_3px_18px_rgba(15,23,42,0.04)]
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]
      "
    >
      <div className="border-b border-slate-100 dark:border-slate-600 px-4 py-3 sm:px-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-black sm:text-base">
          {title}
        </h3>

        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-200 group-hover:text-black sm:text-xs">
          {subtitle}
        </p>
      </div>

      <div className="min-w-0 bg-white p-3 sm:p-5 dark:!bg-[#404040] dark:text-white dark:group-hover:!bg-white dark:group-hover:text-black">
        {children}
      </div>
    </section>
  );
};

/* ============================================================
   STATUS DONUT
   ============================================================ */

const StatusDonut = ({
  data,
}: {
  data: ChartItem[];
}) => {
  const total = data.reduce(
    (sum, item) =>
      sum + item.value,
    0
  );

  if (total === 0) {
    return (
      <EmptyChart
        icon={PieChart}
        text="No status data available"
      />
    );
  }

  const radius = 57;
  const circumference =
    2 * Math.PI * radius;

  return (
    <div
      className="
        flex
        min-h-[235px]
        flex-col
        items-center
        justify-center
        gap-5
        sm:flex-row
      "
    >
      {/* Donut */}

      <div className="relative h-40 w-40 shrink-0 sm:h-44 sm:w-44">
        <svg
          viewBox="0 0 200 200"
          className="
            h-full
            w-full
            -rotate-90
            transition-transform
            duration-500
            group-hover:scale-105
          "
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="22"
          />

          {data.map(
            (item, index) => {
              const percentage =
                item.value /
                total;

              const accumulated =
                data
                  .slice(0, index)
                  .reduce(
                    (sum, currentItem) =>
                      sum +
                      currentItem.value /
                        total,
                    0
                  );

              const dashLength =
                percentage *
                circumference;

              const dashOffset =
                -accumulated *
                circumference;

              return (
                <circle
                  key={item.label}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="22"
                  strokeDasharray={`${dashLength} ${
                    circumference -
                    dashLength
                  }`}
                  strokeDashoffset={
                    dashOffset
                  }
                  strokeLinecap="round"
                  className="transition-all duration-700"
                >
                  <title>
                    {item.label}:{" "}
                    {item.value}
                  </title>
                </circle>
              );
            }
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-black">
            {total}
          </span>

          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-200 group-hover:text-black">
            Tickets
          </span>
        </div>
      </div>

      {/* Legend */}

      <div className="grid w-full grid-cols-2 gap-2">
        {data.map(
          (item) => {
            const percentage =
              Math.round(
                (item.value /
                  total) *
                  100
              );

            return (
              <div
                key={item.label}
                className="
                  group
                  rounded-xl
                  border
                  border-transparent
                  dark:!bg-[#404040] dark:text-white
                  p-2.5
                  transition-all
                  duration-200
                  hover:border-slate-200
                  hover:bg-slate-50
                  dark:hover:bg-white dark:hover:text-black
                  hover:shadow-sm
                "
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        item.color,
                    }}
                  />

                  <span className="truncate text-xs font-semibold text-slate-600 dark:text-white group-hover:text-black">
                    {item.label}
                  </span>
                </div>

                <p className="ml-4 mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-200 group-hover:text-black">
                  {item.value} ·{" "}
                  {percentage}%
                </p>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

/* ============================================================
   PRIORITY BARS
   ============================================================ */

const PriorityBars = ({
  data,
}: {
  data: ChartItem[];
}) => {
  if (data.length === 0) {
    return (
      <EmptyChart
        icon={AlertTriangle}
        text="No priority data available"
      />
    );
  }

  const maxValue =
    Math.max(
      ...data.map(
        (item) => item.value
      ),
      1
    );

  return (
    <div className="flex min-h-[235px] flex-col justify-center space-y-5">
      {data.map((item) => {
        const width =
          (item.value /
            maxValue) *
          100;

        return (
          <div
            key={item.label}
            className="group"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      item.color,
                  }}
                />

                <span className="text-xs font-bold text-slate-600 dark:text-white transition-colors group-hover:text-black">
                  {item.label}
                </span>
              </div>

              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600 transition-all dark:bg-slate-500 dark:text-white group-hover:bg-slate-900 group-hover:text-white">
                {item.value}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-600">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110"
                style={{
                  width: `${width}%`,
                  backgroundColor:
                    item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================
   CATEGORY BARS
   ============================================================ */

const CategoryBars = ({
  data,
}: {
  data: ChartItem[];
}) => {
  if (data.length === 0) {
    return (
      <EmptyChart
        icon={BarChart3}
        text="No category data available"
      />
    );
  }

  const maxValue =
    Math.max(
      ...data.map(
        (item) => item.value
      ),
      1
    );

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4
        sm:grid-cols-2
        lg:grid-cols-3
      "
    >
      {data.map((item) => {
        const width =
          (item.value /
            maxValue) *
          100;

        return (
          <div
            key={item.label}
            className="
              group
              rounded-xl
              border
              border-slate-100
              bg-slate-50/60
              dark:!bg-[#404040] dark:text-white dark:hover:!bg-white dark:hover:text-black
              p-3
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-slate-200
              hover:bg-white
              hover:shadow-md
            "
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span
                title={item.label}
                className="min-w-0 truncate text-xs font-bold text-slate-600 dark:text-white group-hover:text-black"
              >
                {item.label}
              </span>

              <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[10px] font-black text-slate-700 shadow-sm dark:bg-slate-500 dark:text-white group-hover:bg-slate-100 group-hover:text-black">
                {item.value}
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
              <div
                className="h-full rounded-full transition-all duration-700 group-hover:brightness-110"
                style={{
                  width: `${width}%`,
                  backgroundColor:
                    item.color,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-200 group-hover:text-black">
                Ticket volume
              </span>

              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-200 group-hover:text-black">
                {Math.round(
                  (item.value /
                    data.reduce(
                      (sum, current) =>
                        sum +
                        current.value,
                      0
                    )) *
                    100
                )}
                %
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================
   EMPTY CHART
   ============================================================ */

const EmptyChart = ({
  icon: Icon,
  text,
}: {
  icon: typeof PieChart;
  text: string;
}) => {
  return (
    <div className="flex min-h-[235px] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-500 dark:text-slate-300">
        <Icon size={24}
         className="!text-black dark:!text-black" />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-200">
        {text}
      </p>

      <p className="mt-1 text-xs text-slate-400 dark:text-slate-300">
        Data will appear when tickets
        are available.
      </p>
    </div>
  );
};

export default Tickets;