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

interface DepotChartProps {
  stats: FleetStats;
  onBarClick?: (depot: string) => void;
}

export function DepotChart({ stats, onBarClick }: DepotChartProps) {
  const data = Object.entries(stats.depotDistribution)
    .map(([name, value]) => ({
      name: name.slice(0, 10),
      fullName: name,
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <div className="chart-container h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Depot-wise Distribution</h3>
        <span className="text-sm text-muted-foreground">
          Top {data.length} depots
        </span>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number) => [value.toLocaleString(), "Breakdowns"]}
            labelFormatter={(label) => data.find((d) => d.name === label)?.fullName || label}
          />
          <Bar
            dataKey="value"
            fill="hsl(var(--chart-5))"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            onClick={(data) => onBarClick?.(data.fullName)}
            cursor={onBarClick ? "pointer" : "default"}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
