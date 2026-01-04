import { useState, useMemo } from "react";
import { Bus, Entry } from "@/types/fleet";
import { StatusBadge } from "./StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, ChevronRight, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusTableProps {
  buses: Bus[];
  onSelectBus: (bus: Bus) => void;
  getBusHealth: (bus: Bus) => "healthy" | "warning" | "critical";
}

export function BusTable({ buses, onSelectBus, getBusHealth }: BusTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [depotFilter, setDepotFilter] = useState<string>("all");

  // Get unique depots
  const depots = useMemo(() => {
    const depotSet = new Set<string>();
    buses.forEach((bus) => {
      bus.entries.forEach((entry) => {
        if (entry.breakdown?.depot) {
          depotSet.add(entry.breakdown.depot);
        }
      });
    });
    return Array.from(depotSet).sort();
  }, [buses]);

  // Filter buses
  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      // Search filter
      if (search && !bus.bus_number.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Status filter
      const health = getBusHealth(bus);
      if (statusFilter !== "all" && health !== statusFilter) {
        return false;
      }

      // Depot filter
      if (depotFilter !== "all") {
        const hasDepot = bus.entries.some(
          (e) => e.breakdown?.depot?.toLowerCase() === depotFilter.toLowerCase()
        );
        if (!hasDepot) return false;
      }

      return true;
    });
  }, [buses, search, statusFilter, depotFilter, getBusHealth]);

  const getBusSummary = (bus: Bus) => {
    const breakdowns = bus.entries.filter((e) => e.entry_type === "BREAKDOWN_REPORT");
    const resolved = breakdowns.filter((e) => e.is_resolved).length;
    const unresolved = breakdowns.filter((e) => !e.is_resolved).length;
    const updates = bus.entries.filter((e) => e.entry_type === "STATUS_UPDATE").length;

    // Get oldest unresolved issue age
    const oldestUnresolved = bus.entries
      .filter((e) => e.entry_type === "BREAKDOWN_REPORT" && !e.is_resolved)
      .sort((a, b) => (b.time_since_breakdown_days || 0) - (a.time_since_breakdown_days || 0))[0];

    return { breakdowns: breakdowns.length, resolved, unresolved, updates, oldestUnresolved };
  };

  const healthColors = {
    healthy: "bg-success",
    warning: "bg-warning",
    critical: "bg-critical",
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="p-4 border-b">
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
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr className="bg-muted/30">
              <th>Bus #</th>
              <th>Entries</th>
              <th>Status</th>
              <th>Breakdown Summary</th>
              <th>Aging</th>
              <th>Health</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredBuses.slice(0, 50).map((bus) => {
              const summary = getBusSummary(bus);
              const health = getBusHealth(bus);

              return (
                <tr
                  key={bus.bus_number}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelectBus(bus)}
                >
                  <td>
                    <span className="font-semibold">{bus.bus_number}</span>
                  </td>
                  <td>
                    <span className="text-muted-foreground">{bus.total_entries}</span>
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      {summary.unresolved > 0 && (
                        <StatusBadge status="unresolved">
                          {summary.unresolved} open
                        </StatusBadge>
                      )}
                      {summary.resolved > 0 && (
                        <StatusBadge status="resolved">
                          {summary.resolved} resolved
                        </StatusBadge>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-muted-foreground">
                      {summary.breakdowns} breakdowns, {summary.updates} updates
                    </span>
                  </td>
                  <td>
                    {summary.oldestUnresolved && summary.oldestUnresolved.time_since_breakdown_days ? (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            summary.oldestUnresolved.time_since_breakdown_days > 30
                              ? "text-critical"
                              : summary.oldestUnresolved.time_since_breakdown_days > 14
                              ? "text-warning"
                              : "text-muted-foreground"
                          )}
                        >
                          {summary.oldestUnresolved.time_since_breakdown_days}d
                        </span>
                        {summary.oldestUnresolved.time_since_breakdown_days > 30 && (
                          <AlertTriangle className="h-3.5 w-3.5 text-critical" />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2.5 w-2.5 rounded-full", healthColors[health])} />
                      <span className="text-sm capitalize">{health}</span>
                    </div>
                  </td>
                  <td>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t text-sm text-muted-foreground">
        Showing {Math.min(filteredBuses.length, 50)} of {filteredBuses.length} buses
        {filteredBuses.length !== buses.length && ` (filtered from ${buses.length})`}
      </div>
    </div>
  );
}
