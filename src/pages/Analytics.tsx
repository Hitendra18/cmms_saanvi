import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useFleetData } from "@/hooks/useFleetData";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResolutionPieChart } from "@/components/dashboard/charts/ResolutionPieChart";
import { CategoryBarChart } from "@/components/dashboard/charts/CategoryBarChart";
import { SeverityChart } from "@/components/dashboard/charts/SeverityChart";
import { DepotChart } from "@/components/dashboard/charts/DepotChart";
import { TrendChart } from "@/components/dashboard/charts/TrendChart";
import { ResolutionTimeChart } from "@/components/dashboard/charts/ResolutionTimeChart";
import { ComparisonChart } from "@/components/dashboard/charts/ComparisonChart";
import { DrillDownChart } from "@/components/dashboard/charts/DrillDownChart";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

type DrillDownView = null | { type: "depot" | "category" | "severity"; value: string };

export default function Analytics() {
  const {
    stats,
    loading,
    isRefreshing,
    lastRefresh,
    refresh,
    dateRange,
    setDateRange,
    filteredBuses,
  } = useFleetData();

  const [drillDown, setDrillDown] = useState<DrillDownView>(null);
  const [comparisonPeriod, setComparisonPeriod] = useState<"week" | "month" | "quarter">("month");

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    if (!stats) return null;

    // Simulated comparison data - in production this would be from actual historical data
    const currentBreakdowns = stats.resolvedBreakdowns + stats.unresolvedBreakdowns;
    const previousBreakdowns = Math.round(currentBreakdowns * (0.85 + Math.random() * 0.3));
    const breakdownChange = ((currentBreakdowns - previousBreakdowns) / previousBreakdowns) * 100;

    const currentResolutionRate = (stats.resolvedBreakdowns / currentBreakdowns) * 100;
    const previousResolutionRate = 75 + Math.random() * 15;
    const resolutionChange = currentResolutionRate - previousResolutionRate;

    const currentAvgTime = stats.avgResolutionTime;
    const previousAvgTime = currentAvgTime * (0.9 + Math.random() * 0.2);
    const timeChange = ((currentAvgTime - previousAvgTime) / previousAvgTime) * 100;

    return {
      breakdowns: { current: currentBreakdowns, previous: previousBreakdowns, change: breakdownChange },
      resolutionRate: { current: currentResolutionRate, previous: previousResolutionRate, change: resolutionChange },
      avgResolutionTime: { current: currentAvgTime, previous: previousAvgTime, change: timeChange },
    };
  }, [stats, comparisonPeriod]);

  // Drill-down data
  const drillDownData = useMemo(() => {
    if (!drillDown || !filteredBuses) return null;

    const relevantEntries = filteredBuses.flatMap((bus) =>
      bus.entries.filter((entry) => {
        if (entry.entry_type !== "BREAKDOWN_REPORT") return false;
        if (drillDown.type === "depot") return entry.breakdown?.depot === drillDown.value;
        if (drillDown.type === "category") return entry.breakdown?.defect_category === drillDown.value;
        if (drillDown.type === "severity") return entry.breakdown?.defect_severity === drillDown.value;
        return false;
      })
    );

    // Group by different dimensions based on drill-down type
    const distribution: Record<string, { resolved: number; unresolved: number }> = {};
    
    relevantEntries.forEach((entry) => {
      let key: string;
      if (drillDown.type === "depot") {
        key = entry.breakdown?.defect_category || "Unknown";
      } else if (drillDown.type === "category") {
        key = entry.breakdown?.depot || "Unknown";
      } else {
        key = entry.breakdown?.depot || "Unknown";
      }

      if (!distribution[key]) {
        distribution[key] = { resolved: 0, unresolved: 0 };
      }
      if (entry.is_resolved) {
        distribution[key].resolved++;
      } else {
        distribution[key].unresolved++;
      }
    });

    return {
      totalEntries: relevantEntries.length,
      resolved: relevantEntries.filter((e) => e.is_resolved).length,
      unresolved: relevantEntries.filter((e) => !e.is_resolved).length,
      distribution: Object.entries(distribution).map(([name, data]) => ({
        name,
        ...data,
        total: data.resolved + data.unresolved,
      })).sort((a, b) => b.total - a.total),
    };
  }, [drillDown, filteredBuses]);

  const handleDrillDown = (type: "depot" | "category" | "severity", value: string) => {
    setDrillDown({ type, value });
  };

  const getTrendIcon = (change: number) => {
    if (change > 2) return <TrendingUp className="h-4 w-4" />;
    if (change < -2) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = (change: number, inverse = false) => {
    const isPositive = inverse ? change < 0 : change > 0;
    if (Math.abs(change) < 2) return "text-muted-foreground";
    return isPositive ? "text-resolved" : "text-critical";
  };

  if (loading || !stats) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      lastUpdated={lastRefresh?.toLocaleTimeString()}
      isRefreshing={isRefreshing}
      onRefresh={refresh}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Analytics & Insights
            </h1>
            <p className="text-muted-foreground">Deep dive into fleet performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangeFilter
              startDate={dateRange.start}
              endDate={dateRange.end}
              onStartDateChange={(date) => setDateRange((prev) => ({ ...prev, start: date }))}
              onEndDateChange={(date) => setDateRange((prev) => ({ ...prev, end: date }))}
              onClear={() => setDateRange({ start: undefined, end: undefined })}
            />
          </div>
        </div>

        {/* Comparison Period Selector */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Compare with Previous Period</span>
              </div>
              <Select value={comparisonPeriod} onValueChange={(v: "week" | "month" | "quarter") => setComparisonPeriod(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">vs Last Week</SelectItem>
                  <SelectItem value="month">vs Last Month</SelectItem>
                  <SelectItem value="quarter">vs Last Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {comparisonData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground">Total Breakdowns</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-bold">{comparisonData.breakdowns.current}</span>
                    <Badge variant="outline" className={cn("flex items-center gap-1", getTrendColor(comparisonData.breakdowns.change, true))}>
                      {getTrendIcon(comparisonData.breakdowns.change)}
                      {Math.abs(comparisonData.breakdowns.change).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Previous: {comparisonData.breakdowns.previous}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground">Resolution Rate</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-bold">{comparisonData.resolutionRate.current.toFixed(1)}%</span>
                    <Badge variant="outline" className={cn("flex items-center gap-1", getTrendColor(comparisonData.resolutionRate.change))}>
                      {getTrendIcon(comparisonData.resolutionRate.change)}
                      {Math.abs(comparisonData.resolutionRate.change).toFixed(1)}pp
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Previous: {comparisonData.resolutionRate.previous.toFixed(1)}%
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground">Avg Resolution Time</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-bold">{comparisonData.avgResolutionTime.current.toFixed(1)}h</span>
                    <Badge variant="outline" className={cn("flex items-center gap-1", getTrendColor(comparisonData.avgResolutionTime.change, true))}>
                      {getTrendIcon(comparisonData.avgResolutionTime.change)}
                      {Math.abs(comparisonData.avgResolutionTime.change).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Previous: {comparisonData.avgResolutionTime.previous.toFixed(1)}h
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drill-down View */}
        {drillDown && drillDownData && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setDrillDown(null)}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <CardTitle className="text-lg">
                    Drill-down: {drillDown.type.charAt(0).toUpperCase() + drillDown.type.slice(1)} - {drillDown.value}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{drillDownData.totalEntries} breakdowns</Badge>
                  <Badge variant="outline" className="text-resolved">{drillDownData.resolved} resolved</Badge>
                  <Badge variant="outline" className="text-critical">{drillDownData.unresolved} open</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DrillDownChart data={drillDownData.distribution} drillDownType={drillDown.type} />
            </CardContent>
          </Card>
        )}

        {/* Charts Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="resolution">Resolution Analysis</TabsTrigger>
            <TabsTrigger value="comparison">Period Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div onClick={() => {}} className="cursor-default">
                <ResolutionPieChart stats={stats} />
              </div>
              <SeverityChart stats={stats} onBarClick={(severity) => handleDrillDown("severity", severity)} />
              <CategoryBarChart stats={stats} onBarClick={(category) => handleDrillDown("category", category)} />
              <div className="lg:col-span-2">
                <TrendChart stats={stats} />
              </div>
              <DepotChart stats={stats} onBarClick={(depot) => handleDrillDown("depot", depot)} />
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Breakdown Trends Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <TrendChart stats={stats} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resolution Time Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResolutionTimeChart stats={stats} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resolution" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResolutionPieChart stats={stats} />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resolution Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResolutionTimeChart stats={stats} showDistribution />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <ComparisonChart stats={stats} period={comparisonPeriod} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
