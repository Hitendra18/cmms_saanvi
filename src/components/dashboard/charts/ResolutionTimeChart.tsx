import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { FleetStats } from "@/hooks/useFleetData";

interface ResolutionTimeChartProps {
  stats: FleetStats;
  showDistribution?: boolean;
}

export function ResolutionTimeChart({ stats, showDistribution = false }: ResolutionTimeChartProps) {
  // Simulated resolution time distribution data
  const distributionData = [
    { range: "0-2h", count: 145, percentage: 18 },
    { range: "2-6h", count: 234, percentage: 29 },
    { range: "6-12h", count: 189, percentage: 24 },
    { range: "12-24h", count: 156, percentage: 19 },
    { range: "24-48h", count: 52, percentage: 6 },
    { range: "48h+", count: 28, percentage: 4 },
  ];

  // Simulated trend data
  const trendData = [
    { month: "Oct", avgTime: 12.4, target: 8 },
    { month: "Nov", avgTime: 10.2, target: 8 },
    { month: "Dec", avgTime: 9.8, target: 8 },
    { month: "Jan", avgTime: stats.avgResolutionTime || 8.5, target: 8 },
  ];

  if (showDistribution) {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={distributionData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number, name: string) => [
              name === "count" ? `${value} breakdowns` : `${value}%`,
              name === "count" ? "Count" : "Percentage",
            ]}
          />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="85%">
      <LineChart data={trendData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="h" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`${value.toFixed(1)}h`, ""]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="avgTime"
          name="Avg Resolution Time"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: "hsl(var(--primary))" }}
        />
        <Line
          type="monotone"
          dataKey="target"
          name="Target"
          stroke="hsl(160, 84%, 39%)"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
