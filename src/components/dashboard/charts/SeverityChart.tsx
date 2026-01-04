import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { FleetStats } from "@/hooks/useFleetData";

interface SeverityChartProps {
  stats: FleetStats;
  onBarClick?: (severity: string) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "hsl(0, 72%, 51%)",
  HIGH: "hsl(38, 92%, 50%)",
  MEDIUM: "hsl(217, 91%, 60%)",
  LOW: "hsl(160, 84%, 39%)",
};

export function SeverityChart({ stats, onBarClick }: SeverityChartProps) {
  const severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const data = severityOrder
    .map((severity) => ({
      name: severity,
      value: stats.severityDistribution[severity] || 0,
      color: SEVERITY_COLORS[severity],
    }))
    .filter((d) => d.value > 0);

  return (
    <div className="chart-container h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Breakdowns by Severity</h3>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
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
          />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={60}
            onClick={(data) => onBarClick?.(data.name)}
            cursor={onBarClick ? "pointer" : "default"}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
