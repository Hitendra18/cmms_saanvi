import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DrillDownData {
  name: string;
  resolved: number;
  unresolved: number;
  total: number;
}

interface DrillDownChartProps {
  data: DrillDownData[];
  drillDownType: "depot" | "category" | "severity";
}

export function DrillDownChart({ data, drillDownType }: DrillDownChartProps) {
  const xAxisLabel = drillDownType === "depot" ? "Category" : drillDownType === "category" ? "Depot" : "Depot";

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 10)} margin={{ top: 10, right: 20, bottom: 60, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number, name: string) => [
              value,
              name === "resolved" ? "Resolved" : "Unresolved",
            ]}
          />
          <Legend />
          <Bar
            dataKey="resolved"
            name="Resolved"
            stackId="a"
            fill="hsl(160, 84%, 39%)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="unresolved"
            name="Unresolved"
            stackId="a"
            fill="hsl(0, 72%, 51%)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-muted-foreground mt-2">
        Breakdown distribution by {xAxisLabel.toLowerCase()}
      </p>
    </div>
  );
}
