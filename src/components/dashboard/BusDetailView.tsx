import { Bus, Entry } from "@/types/fleet";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  MapPin,
  Calendar,
  Phone,
  Users,
  Route,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  Link2,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BusDetailViewProps {
  bus: Bus;
  onClose: () => void;
}

export function BusDetailView({ bus, onClose }: BusDetailViewProps) {
  // Sort entries by date (most recent first)
  const sortedEntries = [...bus.entries].sort((a, b) => {
    const dateA = new Date(a.date.split(" ")[0].split("/").reverse().join("-"));
    const dateB = new Date(b.date.split(" ")[0].split("/").reverse().join("-"));
    return dateB.getTime() - dateA.getTime();
  });

  const unresolvedCount = bus.entries.filter(
    (e) => e.entry_type === "BREAKDOWN_REPORT" && !e.is_resolved
  ).length;

  const getSeverityColor = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return "text-critical";
      case "HIGH":
        return "text-warning";
      case "MEDIUM":
        return "text-info";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-end">
      <div className="w-full max-w-2xl h-full bg-card border-l shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Bus {bus.bus_number}</h2>
              {unresolvedCount > 0 && (
                <StatusBadge status="critical" size="md">
                  {unresolvedCount} open issues
                </StatusBadge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {bus.total_entries} total records
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-6">
            <h3 className="font-semibold mb-4">Timeline</h3>
            <div className="relative space-y-0">
              {sortedEntries.map((entry, index) => (
                <TimelineEntry
                  key={entry.entry_id}
                  entry={entry}
                  isLast={index === sortedEntries.length - 1}
                  getSeverityColor={getSeverityColor}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface TimelineEntryProps {
  entry: Entry;
  isLast: boolean;
  getSeverityColor: (severity: string) => string;
}

function TimelineEntry({ entry, isLast, getSeverityColor }: TimelineEntryProps) {
  const isBreakdown = entry.entry_type === "BREAKDOWN_REPORT";

  return (
    <div className="relative pl-10 pb-8">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "absolute left-0 p-2 rounded-full",
          isBreakdown
            ? entry.is_resolved
              ? "bg-success/10 text-success"
              : "bg-critical/10 text-critical"
            : "bg-info/10 text-info"
        )}
      >
        {isBreakdown ? (
          entry.is_resolved ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )
        ) : (
          <Wrench className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="bg-muted/30 rounded-lg p-4 border">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">
                {isBreakdown ? "Breakdown Report" : "Status Update"}
              </span>
              {isBreakdown && (
                <>
                  <StatusBadge status={entry.is_resolved ? "resolved" : "unresolved"}>
                    {entry.is_resolved ? "Resolved" : "Unresolved"}
                  </StatusBadge>
                  {entry.breakdown?.defect_severity && (
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full bg-muted",
                        getSeverityColor(entry.breakdown.defect_severity)
                      )}
                    >
                      {entry.breakdown.defect_severity}
                    </span>
                  )}
                </>
              )}
              {entry.linked_to ? (
                <StatusBadge status="linked">
                  <Link2 className="h-3 w-3 mr-1" />
                  Linked
                </StatusBadge>
              ) : (
                <StatusBadge status="unlinked">
                  <Unlink className="h-3 w-3 mr-1" />
                  Unlinked
                </StatusBadge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{entry.date}</p>
          </div>

          {isBreakdown && entry.time_since_breakdown_formatted && !entry.is_resolved && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                (entry.time_since_breakdown_days || 0) > 30 ? "text-critical" : "text-warning"
              )}
            >
              <Clock className="h-4 w-4" />
              {entry.time_since_breakdown_formatted}
            </div>
          )}
        </div>

        {isBreakdown && entry.breakdown ? (
          <div className="space-y-3">
            <p className="text-sm">{entry.breakdown.defect}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{entry.breakdown.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{entry.breakdown.reported_date}</span>
              </div>
              {entry.breakdown.depot && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Route className="h-4 w-4" />
                  <span>
                    {entry.breakdown.depot} - Route {entry.breakdown.route_number}
                  </span>
                </div>
              )}
              {entry.breakdown.assigned_team && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Team: {entry.breakdown.assigned_team}</span>
                </div>
              )}
              {entry.breakdown.mobile_number && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{entry.breakdown.mobile_number}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap pt-2">
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {entry.breakdown.defect_category?.replace(/_/g, " ")}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                BD #{entry.breakdown.bd_number}
              </span>
            </div>
          </div>
        ) : entry.means ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusBadge
                status={
                  entry.means.status.includes("RESOLVED") ? "resolved" : "warning"
                }
              >
                {entry.means.status.replace(/_/g, " ")}
              </StatusBadge>
            </div>

            {entry.means.work_done && (
              <p className="text-sm">{entry.means.work_done}</p>
            )}

            {entry.means.parts_changed && entry.means.parts_changed.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Parts Changed:
                </p>
                <div className="flex gap-1 flex-wrap">
                  {entry.means.parts_changed.map((part, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {entry.resolution_time_formatted && (
              <div className="flex items-center gap-2 text-sm text-success">
                <Clock className="h-4 w-4" />
                <span>Resolved in {entry.resolution_time_formatted}</span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
