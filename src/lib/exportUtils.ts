import { Bus, Entry } from "@/types/fleet";
import { FleetStats } from "@/hooks/useFleetData";

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          // Escape quotes and wrap in quotes if contains comma or quote
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportBusTableToCSV(buses: Bus[]) {
  const data = buses.map((bus) => {
    const breakdowns = bus.entries.filter((e) => e.entry_type === "BREAKDOWN_REPORT");
    const resolved = breakdowns.filter((e) => e.is_resolved).length;
    const unresolved = breakdowns.filter((e) => !e.is_resolved).length;
    const oldestUnresolved = bus.entries
      .filter((e) => e.entry_type === "BREAKDOWN_REPORT" && !e.is_resolved)
      .sort((a, b) => (b.time_since_breakdown_days || 0) - (a.time_since_breakdown_days || 0))[0];

    return {
      bus_number: bus.bus_number,
      total_entries: bus.total_entries,
      total_breakdowns: breakdowns.length,
      resolved_breakdowns: resolved,
      unresolved_breakdowns: unresolved,
      oldest_issue_days: oldestUnresolved?.time_since_breakdown_days || 0,
      latest_depot: bus.entries.find((e) => e.breakdown?.depot)?.breakdown?.depot || "",
    };
  });

  exportToCSV(data, "fleet_buses");
}

export function exportBreakdownsToCSV(buses: Bus[]) {
  const breakdowns: Record<string, unknown>[] = [];

  buses.forEach((bus) => {
    bus.entries
      .filter((e) => e.entry_type === "BREAKDOWN_REPORT")
      .forEach((entry) => {
        breakdowns.push({
          bus_number: bus.bus_number,
          date: entry.date,
          reported_date: entry.breakdown?.reported_date || "",
          location: entry.breakdown?.location || "",
          defect: entry.breakdown?.defect || "",
          defect_category: entry.breakdown?.defect_category || "",
          severity: entry.breakdown?.defect_severity || "",
          depot: entry.breakdown?.depot || "",
          route_number: entry.breakdown?.route_number || "",
          assigned_team: entry.breakdown?.assigned_team || "",
          is_resolved: entry.is_resolved ? "Yes" : "No",
          resolution_status: entry.resolution_status,
          time_since_breakdown: entry.time_since_breakdown_formatted || "",
          days_open: entry.time_since_breakdown_days || 0,
        });
      });
  });

  exportToCSV(breakdowns, "fleet_breakdowns");
}

export function exportAnalyticsToCSV(stats: FleetStats) {
  // Export category distribution
  const categoryData = Object.entries(stats.categoryDistribution).map(([category, count]) => ({
    category,
    breakdown_count: count,
    percentage: ((count / (stats.resolvedBreakdowns + stats.unresolvedBreakdowns)) * 100).toFixed(2),
  }));
  exportToCSV(categoryData, "analytics_by_category");
}

export function exportDepotAnalyticsToCSV(stats: FleetStats) {
  const depotData = Object.entries(stats.depotDistribution).map(([depot, count]) => ({
    depot,
    breakdown_count: count,
    percentage: ((count / (stats.resolvedBreakdowns + stats.unresolvedBreakdowns)) * 100).toFixed(2),
  }));
  exportToCSV(depotData, "analytics_by_depot");
}

export function exportSeverityAnalyticsToCSV(stats: FleetStats) {
  const severityData = Object.entries(stats.severityDistribution).map(([severity, count]) => ({
    severity,
    breakdown_count: count,
    percentage: ((count / (stats.resolvedBreakdowns + stats.unresolvedBreakdowns)) * 100).toFixed(2),
  }));
  exportToCSV(severityData, "analytics_by_severity");
}
