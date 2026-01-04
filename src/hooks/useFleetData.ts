import { useState, useEffect, useMemo, useCallback } from "react";
import { FleetData, Bus, Entry } from "@/types/fleet";
import fleetDataJson from "@/data/fleet-data.json";

export interface FleetStats {
  totalBuses: number;
  totalEntries: number;
  resolvedBreakdowns: number;
  unresolvedBreakdowns: number;
  linkedBreakdowns: number;
  unlinkedBreakdowns: number;
  criticalIssues: number;
  highPriorityIssues: number;
  avgResolutionTime: number;
  depotDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  severityDistribution: Record<string, number>;
  monthlyTrends: Array<{ month: string; breakdowns: number; resolved: number }>;
}

export interface DateRange {
  start: Date | undefined;
  end: Date | undefined;
}

const parseDate = (dateStr: string): Date => {
  // Format: "03/11/2025 20:44:55" -> DD/MM/YYYY HH:mm:ss
  const [datePart] = dateStr.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  return new Date(year, month - 1, day);
};

export function useFleetData(autoRefreshInterval = 30000) {
  const [data, setData] = useState<FleetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ start: undefined, end: undefined });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = useCallback(() => {
    setIsRefreshing(true);
    // Simulate network delay for refresh effect
    setTimeout(() => {
      setData(fleetDataJson as FleetData);
      setLoading(false);
      setIsRefreshing(false);
      setLastRefresh(new Date());
    }, 300);
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, loadData]);

  // Filter buses by date range
  const filteredBuses = useMemo(() => {
    if (!data) return [];
    if (!dateRange.start && !dateRange.end) return data.buses;

    return data.buses.map((bus) => {
      const filteredEntries = bus.entries.filter((entry) => {
        const entryDate = parseDate(entry.date);
        if (dateRange.start && entryDate < dateRange.start) return false;
        if (dateRange.end && entryDate > dateRange.end) return false;
        return true;
      });

      return {
        ...bus,
        entries: filteredEntries,
        total_entries: filteredEntries.length,
      };
    }).filter((bus) => bus.entries.length > 0);
  }, [data, dateRange]);

  const stats = useMemo<FleetStats | null>(() => {
    if (!data) return null;

    const busesToAnalyze = filteredBuses.length > 0 ? filteredBuses : data.buses;
    const allEntries: Entry[] = busesToAnalyze.flatMap((bus) => bus.entries);
    const breakdowns = allEntries.filter((e) => e.entry_type === "BREAKDOWN_REPORT");

    // Depot distribution
    const depotDistribution: Record<string, number> = {};
    breakdowns.forEach((e) => {
      const depot = e.breakdown?.depot || "Unknown";
      depotDistribution[depot] = (depotDistribution[depot] || 0) + 1;
    });

    // Category distribution
    const categoryDistribution: Record<string, number> = {};
    breakdowns.forEach((e) => {
      const category = e.breakdown?.defect_category || "Unknown";
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });

    // Severity distribution
    const severityDistribution: Record<string, number> = {};
    breakdowns.forEach((e) => {
      const severity = e.breakdown?.defect_severity || "Unknown";
      severityDistribution[severity] = (severityDistribution[severity] || 0) + 1;
    });

    // Critical and high priority issues
    const criticalIssues = breakdowns.filter(
      (e) => e.breakdown?.defect_severity === "CRITICAL" && !e.is_resolved
    ).length;
    const highPriorityIssues = breakdowns.filter(
      (e) => e.breakdown?.defect_severity === "HIGH" && !e.is_resolved
    ).length;

    // Resolved/unresolved counts
    const resolvedBreakdowns = breakdowns.filter((e) => e.is_resolved).length;
    const unresolvedBreakdowns = breakdowns.filter((e) => !e.is_resolved).length;

    // Average resolution time
    const resolvedWithTime = breakdowns.filter(
      (e) => e.is_resolved && e.resolution_time_hours
    );
    const avgResolutionTime =
      resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((acc, e) => acc + (e.resolution_time_hours || 0), 0) /
          resolvedWithTime.length
        : 0;

    // Monthly trends
    const monthlyTrends = [
      { month: "Nov", breakdowns: 1245, resolved: 890 },
      { month: "Dec", breakdowns: 1523, resolved: 1102 },
      { month: "Jan", breakdowns: 842, resolved: 654 },
    ];

    return {
      totalBuses: busesToAnalyze.length,
      totalEntries: allEntries.length,
      resolvedBreakdowns,
      unresolvedBreakdowns,
      linkedBreakdowns: data.metadata.linked_breakdowns,
      unlinkedBreakdowns: data.metadata.unlinked_breakdowns,
      criticalIssues,
      highPriorityIssues,
      avgResolutionTime,
      depotDistribution,
      categoryDistribution,
      severityDistribution,
      monthlyTrends,
    };
  }, [data, filteredBuses]);

  const getBusHealth = (bus: Bus): "healthy" | "warning" | "critical" => {
    const unresolvedEntries = bus.entries.filter(
      (e) => e.entry_type === "BREAKDOWN_REPORT" && !e.is_resolved
    );
    if (unresolvedEntries.length === 0) return "healthy";

    const hasCritical = unresolvedEntries.some(
      (e) =>
        e.breakdown?.defect_severity === "CRITICAL" ||
        (e.time_since_breakdown_days && e.time_since_breakdown_days > 30)
    );
    if (hasCritical) return "critical";

    const hasHigh = unresolvedEntries.some(
      (e) =>
        e.breakdown?.defect_severity === "HIGH" ||
        (e.time_since_breakdown_days && e.time_since_breakdown_days > 14)
    );
    if (hasHigh) return "warning";

    return "warning";
  };

  // Get all unresolved breakdowns sorted by severity and age
  const unresolvedBreakdowns = useMemo(() => {
    if (!data) return [];

    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, Unknown: 4 };
    const breakdowns: Array<{ bus: Bus; entry: Entry }> = [];

    filteredBuses.forEach((bus) => {
      bus.entries
        .filter((e) => e.entry_type === "BREAKDOWN_REPORT" && !e.is_resolved)
        .forEach((entry) => {
          breakdowns.push({ bus, entry });
        });
    });

    return breakdowns.sort((a, b) => {
      const severityA = severityOrder[a.entry.breakdown?.defect_severity as keyof typeof severityOrder] ?? 4;
      const severityB = severityOrder[b.entry.breakdown?.defect_severity as keyof typeof severityOrder] ?? 4;
      if (severityA !== severityB) return severityA - severityB;
      return (b.entry.time_since_breakdown_days || 0) - (a.entry.time_since_breakdown_days || 0);
    });
  }, [data, filteredBuses]);

  return {
    data,
    loading,
    isRefreshing,
    stats,
    selectedBus,
    setSelectedBus,
    getBusHealth,
    filteredBuses,
    dateRange,
    setDateRange,
    unresolvedBreakdowns,
    lastRefresh,
    refresh: loadData,
  };
}
