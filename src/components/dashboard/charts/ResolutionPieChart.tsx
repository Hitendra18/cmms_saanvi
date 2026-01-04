import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { FleetStats } from "@/hooks/useFleetData";

interface ResolutionPieChartProps {
  stats: FleetStats;
}

const COLORS = ["hsl(160, 84%, 39%)", "hsl(0, 72%, 51%)"];

export function ResolutionPieChart({ stats }: ResolutionPieChartProps) {
  const data = [
    { name: "Resolved", value: stats.resolvedBreakdowns, fill: COLORS[0] },
    { name: "Unresolved", value: stats.unresolvedBreakdowns, fill: COLORS[1] },
  ];

  const total = stats.resolvedBreakdowns + stats.unresolvedBreakdowns;
  const percentage = Math.round((stats.resolvedBreakdowns / total) * 100);

  return (
    <div className="chart-container h-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Resolution Status</h3>
        <span className="text-sm text-muted-foreground">
          {percentage}% resolved
        </span>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number) => [value.toLocaleString(), "Count"]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
