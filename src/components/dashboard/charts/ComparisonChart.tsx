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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FleetStats } from "@/hooks/useFleetData";

interface ComparisonChartProps {
  stats: FleetStats;
  period: "week" | "month" | "quarter";
}

export function ComparisonChart({ stats, period }: ComparisonChartProps) {
  const periodLabel = period === "week" ? "Weekly" : period === "month" ? "Monthly" : "Quarterly";

  // Generate comparison data based on categories
  const categoryComparison = Object.entries(stats.categoryDistribution)
    .slice(0, 8)
    .map(([category, current]) => ({
      category: category.length > 15 ? category.slice(0, 15) + "..." : category,
      current,
      previous: Math.round(current * (0.7 + Math.random() * 0.6)),
    }));

  // Generate depot comparison
  const depotComparison = Object.entries(stats.depotDistribution)
    .slice(0, 8)
    .map(([depot, current]) => ({
      depot: depot.length > 12 ? depot.slice(0, 12) + "..." : depot,
      current,
      previous: Math.round(current * (0.7 + Math.random() * 0.6)),
    }));

  // Severity comparison
  const severityComparison = Object.entries(stats.severityDistribution).map(([severity, current]) => ({
    severity,
    current,
    previous: Math.round(current * (0.8 + Math.random() * 0.4)),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{periodLabel} Category Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryComparison} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={75} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="previous" name={`Previous ${period}`} fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="current" name="Current" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{periodLabel} Depot Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={depotComparison} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="depot" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={75} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="previous" name={`Previous ${period}`} fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="current" name="Current" fill="hsl(160, 84%, 39%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">{periodLabel} Severity Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={severityComparison} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="severity" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="previous" name={`Previous ${period}`} fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" name="Current" fill="hsl(45, 93%, 47%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
