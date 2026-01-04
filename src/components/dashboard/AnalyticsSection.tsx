import { FleetStats } from "@/hooks/useFleetData";
import { ResolutionPieChart } from "./charts/ResolutionPieChart";
import { CategoryBarChart } from "./charts/CategoryBarChart";
import { SeverityChart } from "./charts/SeverityChart";
import { DepotChart } from "./charts/DepotChart";
import { TrendChart } from "./charts/TrendChart";

interface AnalyticsSectionProps {
  stats: FleetStats;
}

export function AnalyticsSection({ stats }: AnalyticsSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Analytics & Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResolutionPieChart stats={stats} />
        <SeverityChart stats={stats} />
        <CategoryBarChart stats={stats} />
        <div className="lg:col-span-2">
          <TrendChart stats={stats} />
        </div>
        <DepotChart stats={stats} />
      </div>
    </div>
  );
}
