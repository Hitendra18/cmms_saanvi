import { MainLayout } from "@/components/layout/MainLayout";
import { useFleetData } from "@/hooks/useFleetData";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Phone,
  Download,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { BusDetailView } from "@/components/dashboard/BusDetailView";
import { exportBreakdownsToCSV } from "@/lib/exportUtils";

const ActiveIssues = () => {
  const {
    data,
    loading,
    isRefreshing,
    unresolvedBreakdowns,
    selectedBus,
    setSelectedBus,
    dateRange,
    setDateRange,
    lastRefresh,
    refresh,
    filteredBuses,
  } = useFleetData();

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [depotFilter, setDepotFilter] = useState<string>("all");

  // Get unique depots
  const depots = useMemo(() => {
    const depotSet = new Set<string>();
    unresolvedBreakdowns.forEach(({ entry }) => {
      if (entry.breakdown?.depot) {
        depotSet.add(entry.breakdown.depot);
      }
    });
    return Array.from(depotSet).sort();
  }, [unresolvedBreakdowns]);

  // Filter breakdowns
  const filteredBreakdowns = useMemo(() => {
    return unresolvedBreakdowns.filter(({ bus, entry }) => {
      if (search && !bus.bus_number.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (severityFilter !== "all" && entry.breakdown?.defect_severity !== severityFilter) {
        return false;
      }
      if (depotFilter !== "all" && entry.breakdown?.depot?.toLowerCase() !== depotFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [unresolvedBreakdowns, search, severityFilter, depotFilter]);

  // Get escalation status
  const getEscalationStatus = (days: number, severity: string) => {
    if (severity === "CRITICAL" && days > 3) return "critical-escalation";
    if (severity === "HIGH" && days > 7) return "high-escalation";
    if (days > 30) return "sla-breach";
    if (days > 14) return "warning";
    return "normal";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return "bg-critical/10 text-critical border-critical/20";
      case "HIGH":
        return "bg-warning/10 text-warning border-warning/20";
      case "MEDIUM":
        return "bg-info/10 text-info border-info/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading || !data) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading issues...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const criticalCount = filteredBreakdowns.filter(
    ({ entry }) => entry.breakdown?.defect_severity === "CRITICAL"
  ).length;
  const highCount = filteredBreakdowns.filter(
    ({ entry }) => entry.breakdown?.defect_severity === "HIGH"
  ).length;
  const escalatedCount = filteredBreakdowns.filter(
    ({ entry }) =>
      getEscalationStatus(
        entry.time_since_breakdown_days || 0,
        entry.breakdown?.defect_severity || ""
      ) !== "normal"
  ).length;

  return (
    <MainLayout
      lastUpdated={lastRefresh.toLocaleTimeString()}
      isRefreshing={isRefreshing}
      onRefresh={refresh}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-critical" />
              Active Issues
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredBreakdowns.length} unresolved breakdowns requiring attention
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DateRangeFilter
              startDate={dateRange.start}
              endDate={dateRange.end}
              onStartDateChange={(date) => setDateRange({ ...dateRange, start: date })}
              onEndDateChange={(date) => setDateRange({ ...dateRange, end: date })}
              onClear={() => setDateRange({ start: undefined, end: undefined })}
            />
            <Button variant="outline" onClick={() => exportBreakdownsToCSV(filteredBuses)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-critical/10 border border-critical/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-critical/20">
                <AlertTriangle className="h-5 w-5 text-critical" />
              </div>
              <div>
                <p className="text-2xl font-bold text-critical">{criticalCount}</p>
                <p className="text-sm text-critical/80">Critical Issues</p>
              </div>
            </div>
          </div>
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{highCount}</p>
                <p className="text-sm text-warning/80">High Priority</p>
              </div>
            </div>
          </div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <Flame className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{escalatedCount}</p>
                <p className="text-sm text-destructive/80">Escalated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bus number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={depotFilter} onValueChange={setDepotFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Depot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depots</SelectItem>
                {depots.slice(0, 20).map((depot) => (
                  <SelectItem key={depot} value={depot.toLowerCase()}>
                    {depot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-3">
          {filteredBreakdowns.slice(0, 100).map(({ bus, entry }, index) => {
            const escalation = getEscalationStatus(
              entry.time_since_breakdown_days || 0,
              entry.breakdown?.defect_severity || ""
            );

            return (
              <div
                key={`${bus.bus_number}-${entry.entry_id}-${index}`}
                className={cn(
                  "bg-card rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md",
                  escalation === "critical-escalation" && "border-critical/50 bg-critical/5",
                  escalation === "sla-breach" && "border-destructive/50 bg-destructive/5",
                  escalation === "high-escalation" && "border-warning/50 bg-warning/5"
                )}
                onClick={() => setSelectedBus(bus)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold">{bus.bus_number}</span>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full mt-1",
                          getSeverityColor(entry.breakdown?.defect_severity || "")
                        )}
                      >
                        {entry.breakdown?.defect_severity}
                      </span>
                    </div>

                    <div className="flex-1">
                      <p className="font-medium">{entry.breakdown?.defect}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {entry.breakdown?.location}
                        </span>
                        {entry.breakdown?.depot && (
                          <span className="flex items-center gap-1">
                            Depot: {entry.breakdown.depot}
                          </span>
                        )}
                        {entry.breakdown?.assigned_team && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {entry.breakdown.assigned_team}
                          </span>
                        )}
                        {entry.breakdown?.mobile_number && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {entry.breakdown.mobile_number}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {entry.breakdown?.defect_category?.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Route: {entry.breakdown?.route_number}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={cn(
                          "flex items-center gap-1.5 font-medium",
                          (entry.time_since_breakdown_days || 0) > 30
                            ? "text-critical"
                            : (entry.time_since_breakdown_days || 0) > 14
                            ? "text-warning"
                            : "text-muted-foreground"
                        )}
                      >
                        <Clock className="h-4 w-4" />
                        {entry.time_since_breakdown_formatted}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.breakdown?.reported_date}
                      </p>
                    </div>

                    {escalation !== "normal" && (
                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse-slow",
                          escalation === "critical-escalation" && "bg-critical/20 text-critical",
                          escalation === "high-escalation" && "bg-warning/20 text-warning",
                          escalation === "sla-breach" && "bg-destructive/20 text-destructive"
                        )}
                      >
                        <Flame className="h-3.5 w-3.5" />
                        {escalation === "sla-breach" ? "SLA Breach" : "Escalate"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredBreakdowns.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active issues match your filters</p>
          </div>
        )}

        <div className="text-sm text-muted-foreground text-center py-4">
          Showing {Math.min(filteredBreakdowns.length, 100)} of {filteredBreakdowns.length} issues
        </div>
      </div>

      {selectedBus && (
        <BusDetailView bus={selectedBus} onClose={() => setSelectedBus(null)} />
      )}
    </MainLayout>
  );
};

export default ActiveIssues;
