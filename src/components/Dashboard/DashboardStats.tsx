import type { LucideIcon } from "lucide-react";
import DashboardStatCard from "./DashboardStatCard";

export interface DashboardStat {
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
  filter: string;
}

interface DashboardStatsProps {
  stats: DashboardStat[];
  onStatClick: (filter: string) => void;
}

const DashboardStats = ({
  stats,
  onStatClick,
}: DashboardStatsProps) => {
  return (
    <section
      aria-label="Ticket statistics"
      className="
        grid
        grid-cols-1
        gap-3
        sm:grid-cols-2
        lg:grid-cols-3
        2xl:grid-cols-4
      "
    >
      {stats.map((stat) => (
        <DashboardStatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          description="View tickets"
          onClick={() => onStatClick(stat.filter)}
        />
      ))}
    </section>
  );
};

export default DashboardStats;