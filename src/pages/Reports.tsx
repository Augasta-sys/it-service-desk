import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileBarChart,
  FolderKanban,
  PieChart,
  Ticket as TicketIcon,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../types/ticket";

import type { Category } from "../types/category";
import type { User } from "../types/user";

import { getTickets } from "../services/ticketService";
import { getCategories } from "../services/categoryService";
import { getUsers } from "../services/userService";

const Reports = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        setError("");

        const [ticketData, categoryData, userData] =
          await Promise.all([
            getTickets(),
            getCategories(),
            getUsers(),
          ]);

        setTickets(ticketData);
        setCategories(categoryData);
        setUsers(userData);
      } catch (err) {
        console.error("Failed to load report data:", err);

        setError(
          "Unable to load reports. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================

  const formatLabel = (value: string) => {
    return value
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  // ============================================================
  // STATUS COUNTS
  // ============================================================

  const statusCounts = useMemo(() => {
    const statuses: TicketStatus[] = [
      "open",
      "assigned",
      "in_progress",
      "pending",
      "resolved",
      "closed",
      "cancelled",
      "reopened",
    ];

    return statuses.reduce(
      (result, status) => {
        result[status] = tickets.filter(
          (ticket) => ticket.status === status
        ).length;

        return result;
      },
      {} as Record<TicketStatus, number>
    );
  }, [tickets]);

  // ============================================================
  // PRIORITY COUNTS
  // ============================================================

  const priorityCounts = useMemo(() => {
    const priorities: TicketPriority[] = [
      "low",
      "medium",
      "high",
      "critical",
    ];

    return priorities.reduce(
      (result, priority) => {
        result[priority] = tickets.filter(
          (ticket) =>
            ticket.priority === priority
        ).length;

        return result;
      },
      {} as Record<TicketPriority, number>
    );
  }, [tickets]);

  // ============================================================
  // CATEGORY COUNTS
  // ============================================================

  const categoryCounts = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        count: tickets.filter(
          (ticket) =>
            ticket.category === category.id
        ).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [tickets, categories]);

  // ============================================================
  // BASIC METRICS
  // ============================================================

  const totalTickets = tickets.length;

  const assignedTickets = tickets.filter(
    (ticket) =>
      ticket.assignedAgent !== null
  ).length;

  const unassignedTickets =
    tickets.filter(
      (ticket) =>
        ticket.assignedAgent === null
    ).length;

  const activeTickets = tickets.filter(
    (ticket) =>
      [
        "open",
        "assigned",
        "in_progress",
        "pending",
        "reopened",
      ].includes(ticket.status)
  ).length;

  const resolvedTickets =
    statusCounts.resolved;

  const closedTickets =
    statusCounts.closed;

  const criticalTickets =
    priorityCounts.critical;

  // ============================================================
  // OVERDUE TICKETS
  // ============================================================

  const overdueTickets = useMemo(() => {
    const now = new Date();

    return tickets.filter((ticket) => {
      if (
        ["resolved", "closed", "cancelled"].includes(
          ticket.status
        )
      ) {
        return false;
      }

      if (!ticket.dueDate) return false;

      return new Date(ticket.dueDate) < now;
    }).length;
  }, [tickets]);

  // ============================================================
  // RESOLUTION RATE
  // ============================================================

  const resolutionRate =
    totalTickets > 0
      ? Math.round(
          ((resolvedTickets + closedTickets) /
            totalTickets) *
            100
        )
      : 0;

  // ============================================================
  // MONTHLY TICKET DATA
  // ============================================================

  const monthlyTicketData = useMemo(() => {
    const now = new Date();

    const months = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - (5 - index),
          1
        );

        return {
          month: date.toLocaleString(
            "en-US",
            { month: "short" }
          ),
          year: date.getFullYear(),
          monthIndex: date.getMonth(),
          count: 0,
        };
      }
    );

    tickets.forEach((ticket) => {
      const date = new Date(ticket.createdDate);

      const item = months.find(
        (month) =>
          month.year === date.getFullYear() &&
          month.monthIndex === date.getMonth()
      );

      if (item) {
        item.count += 1;
      }
    });

    return months;
  }, [tickets]);

  const maxMonthlyTickets = Math.max(
    ...monthlyTicketData.map(
      (item) => item.count
    ),
    1
  );

  // ============================================================
  // AGENT WORKLOAD
  // ============================================================

  const agentWorkload = useMemo(() => {
    return users
      .filter(
        (user) =>
          user.role === "support_agent"
      )
      .map((agent) => {
        const assigned = tickets.filter(
          (ticket) =>
            ticket.assignedAgent === agent.id
        );

        const active = assigned.filter(
          (ticket) =>
            [
              "assigned",
              "in_progress",
              "pending",
              "reopened",
            ].includes(ticket.status)
        ).length;

        const resolved = assigned.filter(
          (ticket) =>
            [
              "resolved",
              "closed",
            ].includes(ticket.status)
        ).length;

        return {
          id: agent.id,
          name: agent.fullName,
          assigned: assigned.length,
          active,
          resolved,
        };
      })
      .sort(
        (a, b) => b.assigned - a.assigned
      );
  }, [users, tickets]);

  const maxAgentTickets = Math.max(
    ...agentWorkload.map(
      (agent) => agent.assigned
    ),
    1
  );

  // ============================================================
  // SUMMARY CARDS
  // ============================================================

  const reportCards = [
    {
      title: "Total Tickets",
      value: totalTickets,
      subtitle: "All service requests",
      icon: TicketIcon,
      iconBackground: "bg-slate-100",
      iconColor: "text-slate-700",
    },
    {
      title: "Active Tickets",
      value: activeTickets,
      subtitle: "Currently being handled",
      icon: Zap,
      iconBackground: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Resolved",
      value: resolvedTickets,
      subtitle: `${resolutionRate}% resolution rate`,
      icon: CheckCircle2,
      iconBackground: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Critical",
      value: criticalTickets,
      subtitle: "High attention required",
      icon: AlertCircle,
      iconBackground: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "Unassigned",
      value: unassignedTickets,
      subtitle: "Waiting for assignment",
      icon: Users,
      iconBackground: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Overdue",
      value: overdueTickets,
      subtitle: "Past due date",
      icon: Clock3,
      iconBackground: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Closed",
      value: closedTickets,
      subtitle: "Successfully completed",
      icon: CheckCircle2,
      iconBackground: "bg-slate-100",
      iconColor: "text-slate-700",
    },
    {
      title: "Cancelled",
      value: statusCounts.cancelled,
      subtitle: "Cancelled requests",
      icon: XCircle,
      iconBackground: "bg-rose-50",
      iconColor: "text-rose-600",
    },
  ];

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <BarChart3
              size={22}
              className="animate-pulse"
            />
          </div>

          <p className="text-sm font-semibold text-slate-700">
            Loading reports...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Preparing your service desk analytics
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 border-t-4 border-t-red-500 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertCircle size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Reports unavailable
            </h2>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="space-y-6 pb-8">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="rounded-2xl border border-slate-200 border-t-4 border-t-slate-900 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <FileBarChart size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Reports & Analytics
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Monitor ticket activity, workload,
                priorities, categories and service desk
                performance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
            <TrendingUp
              size={16}
              className="text-emerald-600"
            />

            <span className="text-xs font-semibold text-emerald-700">
              Live JSON Server data
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          SUMMARY CARDS
      ======================================================== */}

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="group rounded-2xl border border-slate-200 border-t-4 border-t-slate-300 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:border-t-slate-900 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {card.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {card.subtitle}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${card.iconBackground}`}
                >
                  <Icon
                    size={21}
                    className={card.iconColor}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          MONTHLY BAR CHART + ASSIGNMENT DONUT
      ======================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Monthly bar chart */}

        <div className="rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-200 hover:border-t-blue-600 hover:shadow-lg sm:p-6 xl:col-span-2">

          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <BarChart3 size={18} />
                </div>

                <h2 className="text-lg font-bold text-slate-900">
                  Ticket Trend
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Tickets created over the last six months.
              </p>
            </div>

            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
              Monthly
            </span>
          </div>

          <div className="flex h-64 items-end gap-2 border-b border-slate-100 px-1 sm:gap-4">
            {monthlyTicketData.map((item) => {
              const height =
                item.count === 0
                  ? 4
                  : Math.max(
                      (item.count /
                        maxMonthlyTickets) *
                        100,
                      8
                    );

              return (
                <div
                  key={`${item.month}-${item.year}`}
                  className="group flex h-full flex-1 flex-col items-center justify-end"
                >
                  <div className="mb-2 text-xs font-bold text-slate-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {item.count}
                  </div>

                  <div
                    className="w-full max-w-14 rounded-t-xl bg-slate-900 transition-all duration-500 ease-out group-hover:bg-blue-600 group-hover:shadow-lg"
                    style={{
                      height: `${height}%`,
                    }}
                  />

                  <span className="mt-3 text-[11px] font-semibold text-slate-400">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Created tickets
            </span>

            <span className="text-xs font-semibold text-slate-700">
              {totalTickets} total
            </span>
          </div>
        </div>

        {/* Assignment donut */}

        <div className="rounded-2xl border border-slate-200 border-t-4 border-t-indigo-500 bg-white p-5 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:border-t-indigo-600 hover:shadow-lg sm:p-6">

          <div className="mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <PieChart size={18} />
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                Assignment
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Assigned versus unassigned tickets.
            </p>
          </div>

          <div className="flex flex-col items-center">

            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full transition-transform duration-500 hover:scale-105"
              style={{
                background:
                  totalTickets > 0
                    ? `conic-gradient(
                        #1e3a8a 0% ${
                          (assignedTickets /
                            totalTickets) *
                          100
                        }%,
                        #f59e0b ${
                          (assignedTickets /
                            totalTickets) *
                          100
                        }% 100%
                      )`
                    : "#e2e8f0",
              }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-2xl font-bold text-slate-900">
                  {totalTickets}
                </span>

                <span className="text-[11px] text-slate-400">
                  Tickets
                </span>
              </div>
            </div>

            <div className="mt-6 grid w-full grid-cols-2 gap-3">

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="mx-auto mb-1 h-2.5 w-2.5 rounded-full bg-blue-800" />

                <p className="text-lg font-bold text-slate-900">
                  {assignedTickets}
                </p>

                <p className="text-[11px] font-medium text-slate-500">
                  Assigned
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="mx-auto mb-1 h-2.5 w-2.5 rounded-full bg-amber-500" />

                <p className="text-lg font-bold text-slate-900">
                  {unassignedTickets}
                </p>

                <p className="text-[11px] font-medium text-slate-500">
                  Unassigned
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          STATUS + PRIORITY
      ======================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Status */}

        <div className="rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:border-t-emerald-600 hover:shadow-lg sm:p-6">

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp size={18} />
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                Tickets by Status
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Current ticket lifecycle distribution.
            </p>
          </div>

          <div className="space-y-4">
            {(Object.keys(
              statusCounts
            ) as TicketStatus[]).map(
              (status) => {
                const count =
                  statusCounts[status];

                const percentage =
                  totalTickets > 0
                    ? Math.round(
                        (count /
                          totalTickets) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={status}
                    className="group"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 sm:text-sm">
                        {formatLabel(status)}
                      </span>

                      <span className="text-xs font-bold text-slate-900">
                        {count}
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all duration-700 group-hover:bg-emerald-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-right text-[10px] font-medium text-slate-400">
                      {percentage}%
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Priority */}

        <div className="rounded-2xl border border-slate-200 border-t-4 border-t-orange-500 bg-white p-5 shadow-sm transition-all duration-300 hover:border-orange-200 hover:border-t-orange-600 hover:shadow-lg sm:p-6">

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <AlertCircle size={18} />
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                Tickets by Priority
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Understand where urgent attention is required.
            </p>
          </div>

          <div className="space-y-5">

            {(
              Object.keys(
                priorityCounts
              ) as TicketPriority[]
            ).map((priority) => {
              const count =
                priorityCounts[priority];

              const percentage =
                totalTickets > 0
                  ? Math.round(
                      (count /
                        totalTickets) *
                        100
                    )
                  : 0;

              const barClass =
                priority === "critical"
                  ? "bg-red-500 group-hover:bg-red-600"
                  : priority === "high"
                    ? "bg-orange-500 group-hover:bg-orange-600"
                    : priority === "medium"
                      ? "bg-blue-500 group-hover:bg-blue-600"
                      : "bg-slate-400 group-hover:bg-slate-600";

              return (
                <div
                  key={priority}
                  className="group"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${barClass}`}
                      />

                      <span className="text-xs font-semibold text-slate-600 sm:text-sm">
                        {formatLabel(priority)}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-900">
                      {count}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barClass}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-right text-[10px] font-medium text-slate-400">
                    {percentage}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================
          CATEGORY PIE + CATEGORY BARS
      ======================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Category Pie */}

        <div className="rounded-2xl border border-slate-200 border-t-4 border-t-violet-500 bg-white p-5 shadow-sm transition-all duration-300 hover:border-violet-200 hover:border-t-violet-600 hover:shadow-lg sm:p-6">

          <div className="mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <PieChart size={18} />
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                Category Mix
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Ticket share by category.
            </p>
          </div>

          <div className="flex justify-center">

            <div
              className="relative flex h-48 w-48 items-center justify-center rounded-full transition-transform duration-500 hover:scale-105"
              style={{
                background:
                  totalTickets === 0
                    ? "#e2e8f0"
                    : `conic-gradient(
                        #4f46e5 0deg  ${
                          categoryCounts.reduce(
                            (sum, category) =>
                              sum +
                              category.count,
                            0
                          ) > 0
                            ? 360
                            : 0
                        }deg
                      )`,
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 opacity-90" />

              {categoryCounts.length > 0 && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      #4f46e5 0deg  ${
                        totalTickets > 0
                          ? (categoryCounts[0]
                              .count /
                              totalTickets) *
                            360
                          : 0
                      }deg,
                      #06b6d4 ${
                        totalTickets > 0
                          ? (categoryCounts[0]
                              .count /
                              totalTickets) *
                            360
                          : 0
                      }deg ${
                        totalTickets > 0
                          ? ((categoryCounts[0]
                              .count +
                              (categoryCounts[1]
                                ?.count ??
                                0)) /
                              totalTickets) *
                            360
                          : 0
                      }deg,
                      #10b981 ${
                        totalTickets > 0
                          ? ((categoryCounts[0]
                              .count +
                              (categoryCounts[1]
                                ?.count ??
                                0)) /
                              totalTickets) *
                            360
                          : 0
                      }deg ${
                        totalTickets > 0
                          ? ((categoryCounts[0]
                              .count +
                              (categoryCounts[1]
                                ?.count ??
                                0) +
                              (categoryCounts[2]
                                ?.count ??
                                0)) /
                              totalTickets) *
                            360
                          : 0
                      }deg,
                      #f59e0b ${
                        totalTickets > 0
                          ? ((categoryCounts[0]
                              .count +
                              (categoryCounts[1]
                                ?.count ??
                                0) +
                              (categoryCounts[2]
                                ?.count ??
                                0)) /
                              totalTickets) *
                            360
                          : 0
                      }deg ${
                        totalTickets > 0
                          ? ((categoryCounts[0]
                              .count +
                              (categoryCounts[1]
                                ?.count ??
                                0) +
                              (categoryCounts[2]
                                ?.count ??
                                0) +
                              (categoryCounts[3]
                                ?.count ??
                                0)) /
                              totalTickets) *
                            360
                          : 0
                      }deg,
                      #ec4899 0deg
                    )`,
                  }}
                />
              )}

              <div className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-2xl font-bold text-slate-900">
                  {totalTickets}
                </span>

                <span className="text-[11px] text-slate-400">
                  Tickets
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {categoryCounts
              .slice(0, 5)
              .map((category, index) => {
                const dotClasses = [
                  "bg-indigo-500",
                  "bg-cyan-500",
                  "bg-emerald-500",
                  "bg-amber-500",
                  "bg-pink-500",
                ];

                const percentage =
                  totalTickets > 0
                    ? Math.round(
                        (category.count /
                          totalTickets) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors duration-300 hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClasses[index]}`}
                      />

                      <span className="truncate text-xs font-medium text-slate-600">
                        {category.name}
                      </span>
                    </div>

                    <span className="ml-2 text-xs font-bold text-slate-900">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Category horizontal bars */}

        <div className="rounded-2xl border border-slate-200 border-t-4 border-t-cyan-500 bg-white p-5 shadow-sm transition-all duration-300 hover:border-cyan-200 hover:border-t-cyan-600 hover:shadow-lg sm:p-6 xl:col-span-2">

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                <FolderKanban size={18} />
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                Category Performance
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Number of tickets generated in each category.
            </p>
          </div>

          {categoryCounts.length === 0 ? (
            <div className="flex min-h-48 items-center justify-center text-sm text-slate-400">
              No categories available.
            </div>
          ) : (
            <div className="space-y-5">
              {categoryCounts.map(
                (category) => {
                  const percentage =
                    totalTickets > 0
                      ? Math.round(
                          (category.count /
                            totalTickets) *
                            100
                        )
                      : 0;

                  const maxCategory =
                    Math.max(
                      ...categoryCounts.map(
                        (item) =>
                          item.count
                      ),
                      1
                    );

                  const width =
                    category.count === 0
                      ? 3
                      : Math.max(
                          (category.count /
                            maxCategory) *
                            100,
                          6
                        );

                  return (
                    <div
                      key={category.id}
                      className="group"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-700 sm:text-sm">
                            {category.name}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-[10px] font-medium text-slate-400">
                            {percentage}%
                          </span>

                          <span className="text-xs font-bold text-slate-900">
                            {category.count}
                          </span>
                        </div>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all duration-700 group-hover:bg-cyan-600 group-hover:shadow-md"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          AGENT WORKLOAD
      ======================================================== */}

      <div className="rounded-2xl border border-slate-200 border-t-4 border-t-slate-900 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-lg">

        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Users size={19} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Agent Workload
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Ticket distribution across support agents.
              </p>
            </div>
          </div>
        </div>

        {agentWorkload.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No support agents available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
            {agentWorkload.map(
              (agent) => {
                const width =
                  agent.assigned === 0
                    ? 3
                    : Math.max(
                        (agent.assigned /
                          maxAgentTickets) *
                          100,
                        8
                      );

                return (
                  <div
                    key={agent.id}
                    className="group rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white transition-transform duration-300 group-hover:scale-110">
                          {agent.name
                            .split(" ")
                            .map(
                              (name) =>
                                name.charAt(
                                  0
                                )
                            )
                            .slice(0, 2)
                            .join("")}
                        </div>

                        <p className="truncate text-sm font-semibold text-slate-800">
                          {agent.name}
                        </p>
                      </div>

                      <span className="shrink-0 text-lg font-bold text-slate-900">
                        {agent.assigned}
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all duration-700 group-hover:bg-blue-600"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white px-2 py-2 text-center">
                        <p className="text-sm font-bold text-blue-600">
                          {agent.active}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Active
                        </p>
                      </div>

                      <div className="rounded-lg bg-white px-2 py-2 text-center">
                        <p className="text-sm font-bold text-emerald-600">
                          {agent.resolved}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Resolved
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          INSIGHTS
      ======================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="group rounded-2xl border border-amber-100 border-t-4 border-t-amber-500 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform duration-300 group-hover:scale-110">
              <AlertCircle size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Attention
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {unassignedTickets}
              </p>

              <p className="text-xs leading-5 text-slate-500">
                tickets still need an assigned support agent.
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-red-100 border-t-4 border-t-red-500 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-transform duration-300 group-hover:scale-110">
              <Clock3 size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                SLA Risk
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {overdueTickets}
              </p>

              <p className="text-xs leading-5 text-slate-500">
                active tickets are currently past their due date.
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-emerald-100 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Resolution
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {resolutionRate}%
              </p>

              <p className="text-xs leading-5 text-slate-500">
                of all tickets are resolved or closed.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;