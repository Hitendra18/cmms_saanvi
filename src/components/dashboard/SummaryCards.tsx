import { FleetStats } from "@/hooks/useFleetData";
import { StatCard } from "./StatCard";
import {
  Bus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Link2,
  Unlink,
  Clock,
  Activity,
} from "lucide-react";

interface SummaryCardsProps {
  stats: FleetStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  const resolutionRate = Math.round(
    (stats.resolvedBreakdowns / (stats.resolvedBreakdowns + stats.unresolvedBreakdowns)) * 100
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Fleet"
        value={stats.totalBuses}
        subtitle={`${stats.totalEntries.toLocaleString()} total records`}
        icon={Bus}
        variant="default"
      />
      <StatCard
        title="Resolved Breakdowns"
        value={stats.resolvedBreakdowns.toLocaleString()}
        subtitle={`${resolutionRate}% resolution rate`}
        icon={CheckCircle2}
        variant="success"
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Unresolved Issues"
        value={stats.unresolvedBreakdowns.toLocaleString()}
        subtitle={`${stats.criticalIssues} critical, ${stats.highPriorityIssues} high`}
        icon={XCircle}
        variant="critical"
      />
      <StatCard
        title="Avg Resolution Time"
        value={`${Math.round(stats.avgResolutionTime)}h`}
        subtitle="Target: 24 hours"
        icon={Clock}
        variant={stats.avgResolutionTime > 24 ? "warning" : "success"}
      />
      <StatCard
        title="Linked Records"
        value={stats.linkedBreakdowns.toLocaleString()}
        subtitle="Breakdown-resolution pairs"
        icon={Link2}
        variant="default"
      />
      <StatCard
        title="Unlinked Records"
        value={stats.unlinkedBreakdowns.toLocaleString()}
        subtitle="Pending linkage"
        icon={Unlink}
        variant="warning"
      />
      <StatCard
        title="Critical Issues"
        value={stats.criticalIssues}
        subtitle="Require immediate attention"
        icon={AlertTriangle}
        variant="critical"
      />
      <StatCard
        title="System Status"
        value="Operational"
        subtitle={`Last updated: ${new Date().toLocaleTimeString()}`}
        icon={Activity}
        variant="success"
      />
    </div>
  );
}
