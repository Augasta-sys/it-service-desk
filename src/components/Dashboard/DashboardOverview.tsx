import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CircleDot,
  Clock3,
  PieChart,
  TrendingUp,
} from "lucide-react";

import DashboardChartCard from "./DashboardChartCard";
import type { Ticket } from "../../types/ticket";

interface DashboardOverviewProps {
  tickets: Ticket[];
}

interface ChartItem {
  label: string;
  value: number;
  color: string;
}

const STATUS_DATA: ChartItem[] = [
  { label: "Open", value: 0, color: "#3b82f6" },
  { label: "Assigned", value: 0, color: "#8b5cf6" },
  { label: "In Progress", value: 0, color: "#06b6d4" },
  { label: "Pending", value: 0, color: "#f59e0b" },
  { label: "Resolved", value: 0, color: "#22c55e" },
  { label: "Closed", value: 0, color: "#64748b" },
  { label: "Cancelled", value: 0, color: "#ef4444" },
  { label: "Reopened", value: 0, color: "#ec4899" },
];

const STATUS_LABELS: Record<Ticket["status"], string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
  cancelled: "Cancelled",
  reopened: "Reopened",
};

const PRIORITY_DATA: ChartItem[] = [
  { label: "Low", value: 0, color: "#10b981" },
  { label: "Medium", value: 0, color: "#f59e0b" },
  { label: "High", value: 0, color: "#f97316" },
  { label: "Critical", value: 0, color: "#ef4444" },
];

const PRIORITY_LABELS: Record<Ticket["priority"], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const DashboardOverview = ({
  tickets,
}: DashboardOverviewProps) => {
  const statusData = useMemo(() => {
    return STATUS_DATA
      .map((item) => ({
        ...item,
        value: tickets.filter(
          (ticket) =>
            STATUS_LABELS[ticket.status] === item.label
        ).length,
      }))
      .filter((item) => item.value > 0);
  }, [tickets]);

  const priorityData = useMemo(() => {
    return PRIORITY_DATA
      .map((item) => ({
        ...item,
        value: tickets.filter(
          (ticket) =>
            PRIORITY_LABELS[ticket.priority] === item.label
        ).length,
      }))
      .filter((item) => item.value > 0);
  }, [tickets]);

  const categoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};

    tickets.forEach((ticket) => {
      const category =
        ticket.category?.trim() || "Uncategorized";

      categoryMap[category] =
        (categoryMap[category] || 0) + 1;
    });

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

    return Object.entries(categoryMap)
      .map(([label, value], index) => ({
        label,
        value,
        color:
          chartColors[index % chartColors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [tickets]);

  const dailyTicketData = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);

      date.setDate(
        today.getDate() - (6 - index)
      );

      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      const count = tickets.filter((ticket) => {
        const ticketDate = new Date(ticket.createdDate);

        if (Number.isNaN(ticketDate.getTime())) {
          return false;
        }

        return (
          ticketDate.getFullYear() === year &&
          ticketDate.getMonth() === month &&
          ticketDate.getDate() === day
        );
      }).length;

      return {
        label: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        shortDate: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        value: count,
      };
    });
  }, [tickets]);

  const lineChartData = useMemo(() => {
    const values = dailyTicketData.map(
      (item) => item.value
    );

    const maxValue = Math.max(...values, 1);

    const width = 700;
    const height = 240;
    const horizontalPadding = 30;
    const verticalPadding = 30;

    const usableWidth =
      width - horizontalPadding * 2;

    const usableHeight =
      height - verticalPadding * 2;

    const points = values.map(
      (value, index) => {
        const x =
          horizontalPadding +
          (index /
            Math.max(values.length - 1, 1)) *
            usableWidth;

        const y =
          height -
          verticalPadding -
          (value / maxValue) *
            usableHeight;

        return {
          x,
          y,
          value,
        };
      }
    );

    const linePath = points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
      )
      .join(" ");

    const areaPath = `
      M ${points[0]?.x ?? 0} ${height - verticalPadding}
      ${points
        .map(
          (point) =>
            `L ${point.x} ${point.y}`
        )
        .join(" ")}
      L ${
        points[points.length - 1]?.x ?? 0
      } ${height - verticalPadding}
      Z
    `;

    return {
      points,
      linePath,
      areaPath,
      maxValue,
    };
  }, [dailyTicketData]);

  const resolvedTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.status === "resolved" ||
          ticket.status === "closed"
      ).length,
    [tickets]
  );

  const criticalTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.priority === "critical"
      ).length,
    [tickets]
  );

  const resolutionRate =
    tickets.length > 0
      ? Math.round(
          (resolvedTickets / tickets.length) * 100
        )
      : 0;

  return (
    <section className="space-y-5">
      {/* SECTION HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="
                flex h-8 w-8 items-center justify-center
                rounded-lg bg-slate-900 text-white
                dark:bg-slate-700
              "
            >
              <BarChart3 size={16} />
            </div>

            <h2
              className="
                text-base font-bold text-slate-300
                dark:text-white
                sm:text-lg
              "
            >
              Analytics Overview
            </h2>
          </div>

          <p
            className="
              mt-1 text-xs text-slate-500
              dark:text-slate-100
              sm:text-sm
            "
          >
            Monitor ticket activity, workload and service
            desk performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div
            className="
              inline-flex items-center gap-2 rounded-lg
              border border-slate-200 bg-white
              px-3 py-2 text-xs font-semibold text-slate-600
              shadow-sm
              dark:border-slate-700 dark:bg-slate-900
              dark:text-slate-300
            "
          >
            <CircleDot
              size={13}
              className="text-blue-500"
            />
            {tickets.length} Total
          </div>

          <div
            className="
              inline-flex items-center gap-2 rounded-lg
              border border-slate-200 bg-white
              px-3 py-2 text-xs font-semibold text-slate-600
              shadow-sm
              dark:border-slate-700 dark:bg-slate-900
              dark:text-slate-300
            "
          >
            <CheckCircle2
              size={13}
              className="text-emerald-500"
            />
            {resolutionRate}% Resolved
          </div>
        </div>
      </div>

      {/* TREND + STATUS */}
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
        <DashboardChartCard
          title="Ticket Trend"
          subtitle="Tickets created during the last 7 days"
        >
          <TicketTrendChart
            data={dailyTicketData}
            points={lineChartData.points}
            linePath={lineChartData.linePath}
            areaPath={lineChartData.areaPath}
            maxValue={lineChartData.maxValue}
          />
        </DashboardChartCard>

        <DashboardChartCard
          title="Tickets by Status"
          subtitle="Current ticket status distribution"
        >
          <StatusDonutChart data={statusData} />
        </DashboardChartCard>
      </div>

      {/* CATEGORY + PRIORITY */}
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardChartCard
          title="Tickets by Category"
          subtitle="Tickets grouped by service category"
        >
          <CategoryBarChart data={categoryData} />
        </DashboardChartCard>

        <DashboardChartCard
          title="Priority Distribution"
          subtitle="Ticket volume by priority level"
        >
          <PriorityPieChart data={priorityData} />
        </DashboardChartCard>
      </div>

      {/* ACTIVITY + PERFORMANCE */}
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <DashboardChartCard
          title="Weekly Ticket Activity"
          subtitle="Daily ticket creation volume"
          action={
            <div
              className="
                flex h-8 w-8 items-center justify-center
                rounded-lg bg-slate-100 text-slate-600
                dark:bg-slate-800 dark:text-slate-300
              "
            >
              <Activity size={15} />
            </div>
          }
        >
          <WeeklyActivityChart
            data={dailyTicketData}
          />
        </DashboardChartCard>

        <DashboardChartCard
          title="Service Desk Health"
          subtitle="Key performance indicators"
        >
          <PerformanceOverview
            total={tickets.length}
            resolved={resolvedTickets}
            critical={criticalTickets}
            resolutionRate={resolutionRate}
          />
        </DashboardChartCard>
      </div>
    </section>
  );
};

/* ============================================================
   TICKET TREND
   ============================================================ */

interface TicketTrendChartProps {
  data: {
    label: string;
    shortDate: string;
    value: number;
  }[];
  points: {
    x: number;
    y: number;
    value: number;
  }[];
  linePath: string;
  areaPath: string;
  maxValue: number;
}

const TicketTrendChart = ({
  data,
  points,
  linePath,
  areaPath,
  maxValue,
}: TicketTrendChartProps) => {
  if (data.every((item) => item.value === 0)) {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <div className="text-center">
          <div
            className="
              mx-auto flex h-14 w-14 items-center justify-center
              rounded-2xl bg-slate-100 text-slate-400
              dark:bg-slate-800 dark:text-slate-500
            "
          >
            <TrendingUp size={24} />
          </div>

          <p
            className="
              mt-3 text-sm font-semibold
              text-slate-500 dark:text-slate-400
            "
          >
            No ticket activity yet
          </p>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            New tickets will appear in the trend chart.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox="0 0 700 240"
        className="h-[220px] w-full sm:h-[260px]"
        preserveAspectRatio="none"
      >
        {[0, 1, 2, 3].map((line) => {
          const y = 30 + line * 60;

          return (
            <line
              key={line}
              x1="30"
              y1={y}
              x2="670"
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 5"
            />
          );
        })}

        <path
          d={areaPath}
          fill="#3b82f6"
          opacity="0.08"
          className="transition-all duration-500"
        />

        <path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500"
        />

        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="9"
              fill="#3b82f6"
              opacity="0"
              className="transition-all duration-200 hover:opacity-10"
            />

            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#ffffff"
              stroke="#3b82f6"
              strokeWidth="3"
              className="transition-all duration-200 hover:r-7"
            />

            <title>
              {data[index]?.shortDate}:{" "}
              {point.value} tickets
            </title>
          </g>
        ))}
      </svg>

      <div className="grid grid-cols-7 gap-1 px-2">
        {data.map((item) => (
          <div
            key={`${item.label}-${item.shortDate}`}
            className="text-center"
          >
            <p
              className="
                text-[10px] font-bold text-slate-500
                dark:text-slate-400
                sm:text-xs
              "
            >
              {item.label}
            </p>

            <p className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500">
              {item.shortDate}
            </p>
          </div>
        ))}
      </div>

      <div
        className="
          mt-3 flex items-center justify-between
          border-t border-slate-100 pt-3
          dark:border-slate-700
        "
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Created tickets
          </span>
        </div>

        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          Peak: {maxValue}
        </span>
      </div>
    </div>
  );
};

/* ============================================================
   STATUS DONUT
   ============================================================ */

const StatusDonutChart = ({
  data,
}: {
  data: ChartItem[];
}) => {
  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div
            className="
              mx-auto flex h-16 w-16 items-center justify-center
              rounded-full bg-slate-100
              dark:bg-slate-800
            "
          >
            <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
              0
            </span>
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
            No tickets available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative h-44 w-44 shrink-0 sm:h-48 sm:w-48">
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full -rotate-90"
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="21"
          />

          {data.map((item, index) => {
            const percentage = item.value / total;

            const accumulated = data
              .slice(0, index)
              .reduce(
                (sum, currentItem) =>
                  sum + currentItem.value / total,
                0
              );

            const dashLength =
              percentage * circumference;

            const dashOffset =
              -accumulated * circumference;

            return (
              <circle
                key={item.label}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="21"
                strokeDasharray={`${dashLength} ${
                  circumference - dashLength
                }`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-700 hover:brightness-110"
              >
                <title>
                  {item.label}: {item.value}
                </title>
              </circle>
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="
              text-3xl font-black text-slate-900
              dark:text-white
              sm:text-4xl
            "
          >
            {total}
          </span>

          <span className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Tickets
          </span>
        </div>
      </div>

      <div className="mt-7 w-full border-t border-slate-100 pt-5 dark:border-slate-700">
        <div
          className="
            grid w-full grid-cols-1 gap-2.5
            sm:grid-cols-2
          "
        >
          {data.map((item) => {
            const percentage = Math.round(
              (item.value / total) * 100
            );

            return (
              <div
                key={item.label}
                className="
                  flex min-h-[58px] w-full items-center
                  justify-between rounded-xl border
                  border-slate-100 bg-slate-50
                  px-3 py-3
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:border-slate-200
                  hover:bg-white
                  hover:shadow-sm

                  dark:border-slate-700
                  dark:bg-slate-800

                  dark:hover:border-slate-200
                  dark:hover:bg-white
                "
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span
                    className="
                      text-sm font-semibold leading-5
                      text-slate-700
                      dark:text-slate-200
                      dark:hover:text-slate-900
                    "
                  >
                    {item.label}
                  </span>
                </div>

                <div className="ml-3 flex shrink-0 items-center gap-2">
                  <span
                    className="
                      text-sm font-bold text-slate-900
                      dark:text-white
                      group-hover:text-slate-900
                    "
                  >
                    {item.value}
                  </span>

                  <span
                    className="
                      rounded-md bg-white
                      px-1.5 py-0.5
                      text-[11px] font-semibold text-slate-500

                      dark:bg-slate-700
                      dark:text-slate-300

                      dark:hover:bg-slate-100
                      dark:hover:text-slate-900
                    "
                  >
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   CATEGORY BAR
   ============================================================ */

const CategoryBarChart = ({
  data,
}: {
  data: ChartItem[];
}) => {
  if (data.length === 0) {
    return (
      <div className="flex min-h-[225px] items-center justify-center">
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
          No category data available
        </p>
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.map((item) => item.value),
    1
  );

  return (
    <div className="max-h-[300px] space-y-2.5 overflow-y-auto pr-1 hide-scrollbar sm:space-y-3">
      {data.map((item) => {
        const percentage =
          (item.value / maxValue) * 100;

        return (
          <div
            key={item.label}
            className="
              category-chart-item
              group rounded-xl px-2 py-2
              transition-all duration-200

              hover:bg-slate-50
              hover:shadow-sm

              dark:hover:bg-white
            "
          >
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                />

                <span
                  title={item.label}
                  className="
                    min-w-0 truncate
                    text-[11px] font-semibold
                    text-slate-600
                    transition-colors

                    group-hover:text-slate-900

                    dark:text-slate-300
                    dark:group-hover:text-slate-900

                    sm:text-xs
                  "
                >
                  {item.label}
                </span>
              </div>

              <span
                className="
                  shrink-0 rounded-md
                  bg-slate-100 px-2 py-1
                  text-[10px] font-bold
                  text-slate-600
                  transition-all duration-200

                  group-hover:bg-slate-900
                  group-hover:text-white

                  dark:bg-slate-700
                  dark:text-slate-300

                  dark:group-hover:bg-slate-100
                  dark:group-hover:text-slate-900
                "
              >
                {item.value}
              </span>
            </div>

            <div
              className="
                h-2.5 w-full overflow-hidden
                rounded-full bg-slate-100
                dark:bg-slate-700
              "
            >
              <div
                className="
                  h-full rounded-full
                  transition-all duration-700 ease-out
                  group-hover:brightness-110
                "
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
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
   PRIORITY PIE
   ============================================================ */

const PriorityPieChart = ({
  data,
}: {
  data: ChartItem[];
}) => {
  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  if (total === 0) {
    return (
      <div className="flex min-h-[225px] items-center justify-center">
        <div className="text-center">
          <div
            className="
              mx-auto flex h-16 w-16 items-center justify-center
              rounded-full bg-slate-100 text-slate-400
              dark:bg-slate-800 dark:text-slate-500
            "
          >
            <PieChart size={25} />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
            No priority data
          </p>
        </div>
      </div>
    );
  }

  const segments = data.map((item, index) => {
    const percentage =
      (item.value / total) * 100;

    const start = data
      .slice(0, index)
      .reduce(
        (sum, currentItem) =>
          sum +
          (currentItem.value / total) * 100,
        0
      );

    const end = start + percentage;

    return `${item.color} ${start}% ${end}%`;
  });

  const gradient = `conic-gradient(${segments.join(
    ", "
  )})`;

  return (
    <div className="flex min-h-[225px] flex-col items-center justify-center gap-5 sm:flex-row">
      <div
        className="
          group relative h-40 w-40 shrink-0
          rounded-full p-5 shadow-sm
          transition-all duration-300
          hover:scale-105 hover:shadow-lg
          sm:h-44 sm:w-44
        "
        style={{
          background: gradient,
        }}
      >
        <div
          className="
            flex h-full w-full items-center justify-center
            rounded-full bg-white shadow-inner
            dark:bg-slate-900
          "
        >
          <div className="text-center">
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {total}
            </p>

            <p
              className="
                text-[10px] font-semibold uppercase
                tracking-wider text-slate-400
                dark:text-slate-500
              "
            >
              Priority
            </p>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-2">
        {data.map((item) => {
          const percentage = Math.round(
            (item.value / total) * 100
          );

          return (
            <div
              key={item.label}
              className="
                group rounded-xl
                border border-transparent p-2.5
                transition-all duration-200

                hover:border-slate-200
                hover:bg-slate-50

                dark:hover:border-slate-200
                dark:hover:bg-white
              "
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                />

                <span
                  className="
                    text-xs font-semibold
                    text-slate-600

                    group-hover:text-slate-900

                    dark:text-slate-300
                    dark:group-hover:text-slate-900
                  "
                >
                  {item.label}
                </span>
              </div>

              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className="
                    ml-4 text-sm font-black
                    text-slate-900
                    dark:text-white
                    dark:group-hover:text-slate-900
                  "
                >
                  {item.value}
                </span>

                <span
                  className="
                    text-[10px] font-medium
                    text-slate-400
                    dark:text-slate-500
                    dark:group-hover:text-slate-600
                  "
                >
                  ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================
   WEEKLY ACTIVITY
   ============================================================ */

const WeeklyActivityChart = ({
  data,
}: {
  data: {
    label: string;
    shortDate: string;
    value: number;
  }[];
}) => {
  const maxValue = Math.max(
    ...data.map((item) => item.value),
    1
  );

  return (
    <div className="flex min-h-[250px] items-end gap-2 px-1 pb-2 pt-5 sm:gap-4">
      {data.map((item) => {
        const height =
          item.value === 0
            ? 5
            : Math.max(
                (item.value / maxValue) * 100,
                10
              );

        return (
          <div
            key={`${item.label}-${item.shortDate}`}
            className="
              group flex h-[220px] min-w-0
              flex-1 flex-col items-center justify-end
            "
          >
            <span
              className="
                mb-2 rounded-md
                bg-slate-900
                px-1.5 py-1
                text-[9px] font-bold text-white
                opacity-0 shadow-lg
                transition-all duration-200
                group-hover:-translate-y-1
                group-hover:opacity-100
                dark:bg-slate-700
              "
            >
              {item.value}
            </span>

            <div className="flex h-[170px] w-full items-end justify-center">
              <div
                className="
                  relative w-full max-w-12
                  overflow-hidden rounded-t-xl
                  bg-gradient-to-t
                  from-blue-600 to-cyan-400
                  transition-all duration-500 ease-out
                  group-hover:-translate-y-1
                  group-hover:shadow-lg
                "
                style={{
                  height: `${height}%`,
                  minHeight: "8px",
                }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-white/30" />
              </div>
            </div>

            <p
              className="
                mt-2 text-[10px] font-bold
                text-slate-500
                dark:text-slate-400
                sm:text-xs
              "
            >
              {item.label}
            </p>

            <p className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500">
              {item.shortDate}
            </p>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================
   PERFORMANCE OVERVIEW
   ============================================================ */

interface PerformanceOverviewProps {
  total: number;
  resolved: number;
  critical: number;
  resolutionRate: number;
}

const PerformanceOverview = ({
  total,
  resolved,
  critical,
  resolutionRate,
}: PerformanceOverviewProps) => {
  const metrics = [
    {
      label: "Total Tickets",
      value: total,
      icon: CircleDot,
      iconClass:
        "bg-blue-80 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    },
    {
      label: "Resolved / Closed",
      value: resolved,
      icon: CheckCircle2,
      iconClass:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    },
    {
      label: "Critical",
      value: critical,
      icon: AlertTriangle,
      iconClass:
        "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    },
    {
      label: "Resolution Rate",
      value: `${resolutionRate}%`,
      icon: TrendingUp,
      iconClass:
        "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    },
  ];

  return (
    <div className="space-y-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.label}
            className="
              group flex items-center gap-3
              rounded-xl
              border border-slate-100
              bg-slate-50/60
              p-3
              transition-all duration-200
              hover:-translate-y-0.5
              hover:border-slate-200
              hover:bg-white
              hover:shadow-md

              dark:border-slate-700
              dark:bg-slate-800/60

              /* IMPORTANT:
                 Dark-mode hover becomes WHITE
                 so all text stays visible. */
              dark:hover:border-slate-200
              dark:hover:bg-white
            "
          >
           <div
  className={`
    flex h-10 w-10 shrink-0
    items-center justify-center
    rounded-xl
    ${metric.iconClass}
    transition-transform duration-200
    group-hover:scale-105
  `}
>
  <Icon
    size={18}
    className="text-black dark:text-black"
  />
</div>
            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate
                  text-[10px] font-bold uppercase
                  tracking-wider
                  text-slate-400

                  dark:text-slate-500
                  dark:group-hover:text-slate-600
                "
              >
                {metric.label}
              </p>

              <p
                className="
                  mt-0.5 text-xl font-black
                  text-slate-900

                  dark:text-white
                  dark:group-hover:text-slate-900
                "
              >
                {metric.value}
              </p>
            </div>
          </div>
        );
      })}

      {/* Resolution Performance */}
      <div
        className="
          mt-4 rounded-xl
          border border-slate-200
          bg-white
          p-3 shadow-sm

          dark:border-slate-700
          dark:bg-slate-900

          dark:hover:border-slate-200
          dark:hover:bg-white
        "
      >
        <div className="mb-2 flex items-center justify-between">
          <span
            className="
              text-xs font-bold
              text-slate-600

              dark:text-slate-300
              dark:hover:text-slate-900
            "
          >
            Resolution Performance
          </span>

          <span
            className="
              text-xs font-black
              text-slate-900

              dark:text-white
              dark:hover:text-slate-900
            "
          >
            {resolutionRate}%
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className="
              h-full rounded-full
              bg-gradient-to-r
              from-blue-500 via-cyan-500 to-emerald-500
              transition-all duration-700
            "
            style={{
              width: `${resolutionRate}%`,
            }}
          />
        </div>

        <div
          className="
            mt-2 flex items-center justify-between
            text-[10px]
            text-slate-400
            dark:text-slate-500
          "
        >
          <span>0%</span>

          <span className="flex items-center gap-1">
            <Clock3 size={11} />
            Service desk health
          </span>

          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;