import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FleetStats } from "@/hooks/useFleetData";

interface CategoryBarChartProps {
  stats: FleetStats;
  onBarClick?: (category: string) => void;
}

export function CategoryBarChart({ stats, onBarClick }: CategoryBarChartProps) {
  const data = Object.entries(stats.categoryDistribution)
    .map(([name, value]) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value,
      shortName: name.split("_")[0].slice(0, 8),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="chart-container h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Breakdowns by Category</h3>
        <span className="text-sm text-muted-foreground">
          {Object.keys(stats.categoryDistribution).length} categories
        </span>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis
            dataKey="shortName"
            type="category"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            width={70}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number) => [value.toLocaleString(), "Breakdowns"]}
            labelFormatter={(label) => data.find((d) => d.shortName === label)?.name || label}
          />
          <Bar
            dataKey="value"
            fill="hsl(var(--chart-4))"
            radius={[0, 4, 4, 0]}
            maxBarSize={24}
            onClick={(data) => onBarClick?.(data.name.replace(/ /g, "_").toUpperCase())}
            cursor={onBarClick ? "pointer" : "default"}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
