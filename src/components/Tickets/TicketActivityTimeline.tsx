import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleDot,
  Clock,
  MessageCircle,
  UserPlus,
} from "lucide-react";

import type { TicketActivity } from "../../types/activity";
import type { User } from "../../types/user";

import { getActivitiesByTicket } from "../../services/activityService";

interface TicketActivityTimelineProps {
  ticketId: string;
  users: User[];
}

const TicketActivityTimeline = ({
  ticketId,
  users,
}: TicketActivityTimelineProps) => {
  const [activities, setActivities] = useState<TicketActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getActivitiesByTicket(ticketId);

        // Oldest activity first
        const sortedActivities = [...data].sort((a, b) => {
          const dateA = new Date(
            `${a.createdDate} ${a.createdTime}`
          ).getTime();

          const dateB = new Date(
            `${b.createdDate} ${b.createdTime}`
          ).getTime();

          return dateA - dateB;
        });

        setActivities(sortedActivities);
      } catch (error) {
        console.error(
          "Failed to load ticket activities:",
          error
        );

        setError(
          "Unable to load activity history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [ticketId]);

  const getUserName = (userId: string) => {
    const user = users.find(
      (item) => item.id === userId
    );

    return user?.fullName ?? "Unknown User";
  };

  const getActivityIcon = (
    type: TicketActivity["type"]
  ) => {
    switch (type) {
      case "assigned":
      case "reassigned":
      case "unassigned":
        return <UserPlus size={16} />;

      case "comment_added":
        return <MessageCircle size={16} />;

      case "resolved":
      case "closed":
        return <CheckCircle2 size={16} />;

      case "created":
        return <CircleDot size={16} />;

      default:
        return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-[#404040] dark:text-white">
        <p className="text-sm text-slate-500 dark:text-white">
          Loading activity history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/40 dark:bg-[#404040] dark:text-white">
        <p className="text-sm font-medium text-red-700 dark:text-white">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 dark:border-slate-600 dark:bg-[#404040] dark:text-white dark:hover:bg-white dark:hover:text-black">
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6 dark:border-slate-600">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white dark:group-hover:text-black">
          Activity History
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-200 dark:group-hover:text-black">
          Chronological history of this ticket.
        </p>
      </div>

      {/* Timeline */}
      <div className="p-5 sm:p-6">
        {activities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center dark:border-slate-500 dark:bg-[#404040] dark:text-white dark:group-hover:bg-white dark:group-hover:text-black">
            <p className="text-sm text-slate-500 dark:text-white dark:group-hover:text-black">
              No activity history available.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute bottom-0 left-[9px] top-0 w-px bg-slate-200 dark:bg-slate-500 dark:group-hover:bg-slate-300" />

            <div className="space-y-6">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="relative flex gap-4"
                >
                  {/* Timeline icon */}
                  <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 dark:border-slate-500 dark:bg-[#404040] dark:text-white dark:group-hover:bg-white dark:group-hover:text-black">
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Activity content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white dark:group-hover:text-black">
                        {activity.description}
                      </p>

                      <span className="text-xs text-slate-400 dark:text-slate-200 dark:group-hover:text-black">
                        {activity.createdDate}{" "}
                        {activity.createdTime}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-200 dark:group-hover:text-black">
                      By {getUserName(activity.performedBy)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketActivityTimeline;
