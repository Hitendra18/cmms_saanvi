import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FleetStats } from "@/hooks/useFleetData";

interface TrendChartProps {
  stats: FleetStats;
}

export function TrendChart({ stats }: TrendChartProps) {
  return (
    <div className="chart-container h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Breakdown Trends</h3>
        <span className="text-sm text-muted-foreground">Last 3 months</span>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={stats.monthlyTrends} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <defs>
            <linearGradient id="colorBreakdowns" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="breakdowns"
            stroke="hsl(0, 72%, 51%)"
            fillOpacity={1}
            fill="url(#colorBreakdowns)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="resolved"
            stroke="hsl(160, 84%, 39%)"
            fillOpacity={1}
            fill="url(#colorResolved)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
