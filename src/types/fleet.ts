export interface Breakdown {
  reported_date: string;
  location: string;
  defect: string;
  defect_category: string;
  defect_severity: string;
  depot: string;
  route_number: string;
  bd_number: string;
  mobile_number: string;
  assigned_team: string;
}

export interface Means {
  status: string;
  work_done: string;
  resolution_details: string;
  parts_changed: string[];
}

export interface TimeSinceBreakdown {
  total_seconds: number;
  total_minutes: number;
  total_hours: number;
  formatted: string;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface Entry {
  bus: string;
  date: string;
  breakdown: Breakdown | null;
  means: Means | null;
  entry_type: "BREAKDOWN_REPORT" | "STATUS_UPDATE";
  sender: string;
  entry_id: string;
  resolution_status: string;
  resolution_time: string | null;
  resolution_time_hours: number | null;
  resolution_time_minutes: number | null;
  resolution_time_formatted: string | null;
  is_resolved: boolean;
  linked_to: string | null;
  time_since_breakdown?: TimeSinceBreakdown;
  time_since_breakdown_hours?: number;
  time_since_breakdown_minutes?: number;
  time_since_breakdown_formatted?: string;
  time_since_breakdown_days?: number;
}

export interface Bus {
  bus_number: string;
  total_entries: number;
  entries: Entry[];
}

export interface FleetMetadata {
  total_buses: number;
  total_entries: number;
  entries_with_bus_numbers: number;
  entries_without_bus_numbers: number;
  grouped_by: string;
  format_version: string;
  original_total_batches: number;
  original_successful_batches: number;
  original_failed_batches: number;
  linked_breakdowns: number;
  unlinked_breakdowns: number;
  linked_pairs: number;
  unlinked_status_updates: number;
  resolved_breakdowns: number;
  unresolved_breakdowns: number;
  status_updates_without_breakdowns: number;
  last_updated: string;
}

export interface FleetData {
  status: string;
  metadata: FleetMetadata;
  buses: Bus[];
}

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type ResolutionStatus = "resolved" | "unresolved";
