import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Ticket as TicketIcon,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import { getTickets } from "../services/ticketService";

import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../types/ticket";

import DashboardStats, {
  type DashboardStat,
} from "../components/Dashboard/DashboardStats";

import DashboardOverview from "../components/Dashboard/DashboardOverview";

import RecentTickets from "../components/Dashboard/RecentTickets";

import DashboardHeader from "../components/Dashboard/DashboardHeader";

const Dashboard = () => {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /*
   * Load tickets from JSON Server
   */
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getTickets();

        setTickets(data);
      } catch (error) {
        console.error(
          "Failed to load dashboard tickets:",
          error
        );

        setError(
          "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  /*
   * Refresh dashboard data
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      const data = await getTickets();

      setTickets(data);
    } catch (error) {
      console.error(
        "Failed to refresh dashboard:",
        error
      );

      setError(
        "Unable to refresh dashboard data."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /*
   * Get tickets visible to the logged-in user.
   *
   * Admin:
   * → All tickets
   *
   * Support Agent:
   * → Tickets assigned to them
   *
   * Employee:
   * → Tickets created by them
   */
  const accessibleTickets = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.role === "admin") {
      return tickets;
    }

    if (user.role === "support_agent") {
      return tickets.filter(
        (ticket) =>
          ticket.assignedAgent === user.id
      );
    }

    if (user.role === "employee") {
      return tickets.filter(
        (ticket) =>
          ticket.createdBy === user.id
      );
    }

    return [];
  }, [tickets, user]);

  /*
   * Count tickets by status
   */
  const countByStatus = (
    status: TicketStatus
  ): number => {
    return accessibleTickets.filter(
      (ticket) =>
        ticket.status === status
    ).length;
  };

  /*
   * Count tickets by priority
   */
  const countByPriority = (
    priority: TicketPriority
  ): number => {
    return accessibleTickets.filter(
      (ticket) =>
        ticket.priority === priority
    ).length;
  };

  /*
   * Navigate when a dashboard card is clicked.
   *
   * Employees use My Tickets.
   * Admins and Support Agents use Tickets.
   */
  const handleStatClick = (
    filter: string
  ) => {
    if (user?.role === "employee") {
      navigate(
        filter
          ? `/my-tickets?${filter}`
          : "/my-tickets"
      );

      return;
    }

    navigate(
      filter
        ? `/tickets?${filter}`
        : "/tickets"
    );
  };

  /*
   * Admin Dashboard
   */
  const adminStats: DashboardStat[] = [
    {
      title: "Total Tickets",
      value: accessibleTickets.length,
      icon: TicketIcon,
      color: "navy",
      filter: "",
    },
    {
      title: "Open Tickets",
      value: countByStatus("open"),
      icon: AlertCircle,
      color: "blue",
      filter: "status=open",
    },
    {
      title: "Assigned Tickets",
      value: countByStatus("assigned"),
      icon: UserCheck,
      color: "purple",
      filter: "status=assigned",
    },
    {
      title: "In Progress Tickets",
      value: countByStatus(
        "in_progress"
      ),
      icon: Clock3,
      color: "cyan",
      filter: "status=in_progress",
    },
    {
      title: "Pending Tickets",
      value: countByStatus("pending"),
      icon: Clock3,
      color: "yellow",
      filter: "status=pending",
    },
    {
      title: "Resolved Tickets",
      value: countByStatus("resolved"),
      icon: CheckCircle2,
      color: "green",
      filter: "status=resolved",
    },
    {
      title: "Closed Tickets",
      value: countByStatus("closed"),
      icon: CheckCircle2,
      color: "navy",
      filter: "status=closed",
    },
    {
      title: "Critical Tickets",
      value: countByPriority("critical"),
      icon: CircleAlert,
      color: "red",
      filter: "priority=critical",
    },
    {
      title: "Unassigned Tickets",
      value: accessibleTickets.filter(
        (ticket) =>
          !ticket.assignedAgent
      ).length,
      icon: UserX,
      color: "orange",
      filter: "assignment=unassigned",
    },
  ];

  /*
   * Support Agent Dashboard
   *
   * New Tickets = Assigned status
   */
  const supportAgentStats: DashboardStat[] = [
    {
      title: "My Assigned Tickets",
      value: accessibleTickets.length,
      icon: TicketIcon,
      color: "navy",
      filter: "",
    },
    {
      title: "New Tickets",
      value: countByStatus("assigned"),
      icon: AlertCircle,
      color: "blue",
      filter: "status=assigned",
    },
    {
      title: "In Progress Tickets",
      value: countByStatus(
        "in_progress"
      ),
      icon: Clock3,
      color: "cyan",
      filter: "status=in_progress",
    },
    {
      title: "Pending Tickets",
      value: countByStatus("pending"),
      icon: Clock3,
      color: "yellow",
      filter: "status=pending",
    },
    {
      title: "Resolved Tickets",
      value: countByStatus("resolved"),
      icon: CheckCircle2,
      color: "green",
      filter: "status=resolved",
    },
    {
      title: "High Priority Tickets",
      value: countByPriority("high"),
      icon: CircleAlert,
      color: "orange",
      filter: "priority=high",
    },
  ];

  /*
   * Employee Dashboard
   */
  const employeeStats: DashboardStat[] = [
    {
      title: "My Total Tickets",
      value: accessibleTickets.length,
      icon: TicketIcon,
      color: "navy",
      filter: "",
    },
    {
      title: "Open Tickets",
      value: countByStatus("open"),
      icon: AlertCircle,
      color: "blue",
      filter: "status=open",
    },
    {
      title: "In Progress Tickets",
      value: countByStatus(
        "in_progress"
      ),
      icon: Clock3,
      color: "cyan",
      filter: "status=in_progress",
    },
    {
      title: "Resolved Tickets",
      value: countByStatus("resolved"),
      icon: CheckCircle2,
      color: "green",
      filter: "status=resolved",
    },
    {
      title: "Closed Tickets",
      value: countByStatus("closed"),
      icon: XCircle,
      color: "navy",
      filter: "status=closed",
    },
  ];

  /*
   * Select dashboard cards based on role
   */
  const stats: DashboardStat[] =
    (() => {
      if (!user) {
        return [];
      }

      if (user.role === "admin") {
        return adminStats;
      }

      if (
        user.role ===
        "support_agent"
      ) {
        return supportAgentStats;
      }

      return employeeStats;
    })();

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1
            className="
              text-2xl
              font-bold
              text-slate-900
              transition-colors
              duration-300
              dark:text-slate-100
              sm:text-3xl
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              transition-colors
              duration-300
              dark:text-slate-400
              sm:text-base
            "
          >
            Loading your service desk
            overview...
          </p>
        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-3
          "
        >
          {Array.from({
            length: 9,
          }).map((_, index) => (
            <div
              key={index}
              className="
                h-32
                animate-pulse
                rounded-2xl
                border
                border-slate-200
                bg-white
                transition-colors
                duration-300
                dark:border-slate-700
                dark:bg-slate-800
              "
            />
          ))}
        </div>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1
            className="
              text-2xl
              font-bold
              text-slate-900
              transition-colors
              duration-300
              dark:text-slate-100
              sm:text-3xl
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              transition-colors
              duration-300
              dark:text-slate-400
            "
          >
            Welcome back,{" "}
            {user?.fullName}.
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-5
            transition-colors
            duration-300
            dark:border-red-900/60
            dark:bg-red-950/40
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-red-700
              dark:text-red-300
            "
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  /*
   * Dashboard
   */
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <DashboardHeader
        user={user}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onCreateTicket={() =>
          navigate("/tickets/create")
        }
      />

      {/* Dashboard Statistics Cards */}
      <section
        className="
          dashboard-stats-section
          rounded-2xl
          transition-colors
          duration-300
        "
      >
        <DashboardStats
          stats={stats}
          onStatClick={handleStatClick}
        />
      </section>

      {/* Ticket Trend / Ticket By Status */}
      <section
        className="
          dashboard-overview-section
          rounded-2xl
          transition-colors
          duration-300
        "
      >
        <DashboardOverview
          tickets={accessibleTickets}
        />
      </section>

      {/* Recent Tickets */}
      <section
        className="
          dashboard-recent-section
          rounded-2xl
          transition-colors
          duration-300
        "
      >
        <RecentTickets
          tickets={accessibleTickets}
          viewAllPath={
            user?.role === "employee"
              ? "/my-tickets"
              : "/tickets"
          }
        />
      </section>
    </div>
  );
};

export default Dashboard;