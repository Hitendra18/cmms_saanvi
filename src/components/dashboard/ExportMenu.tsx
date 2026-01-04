import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bus } from "@/types/fleet";
import { FleetStats } from "@/hooks/useFleetData";
import {
  exportBusTableToCSV,
  exportBreakdownsToCSV,
  exportAnalyticsToCSV,
  exportDepotAnalyticsToCSV,
  exportSeverityAnalyticsToCSV,
} from "@/lib/exportUtils";

interface ExportMenuProps {
  buses: Bus[];
  stats: FleetStats;
}

export function ExportMenu({ buses, stats }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Data</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => exportBusTableToCSV(buses)}>
          Bus Fleet Summary (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportBreakdownsToCSV(buses)}>
          All Breakdowns (CSV)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Analytics</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => exportAnalyticsToCSV(stats)}>
          By Category (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportDepotAnalyticsToCSV(stats)}>
          By Depot (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportSeverityAnalyticsToCSV(stats)}>
          By Severity (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
