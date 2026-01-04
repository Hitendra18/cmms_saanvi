import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "resolved" | "unresolved" | "warning" | "info" | "critical" | "linked" | "unlinked";
  children: React.ReactNode;
  size?: "sm" | "md";
}

export function StatusBadge({ status, children, size = "sm" }: StatusBadgeProps) {
  const styles = {
    resolved: "status-resolved",
    unresolved: "status-unresolved",
    warning: "status-warning",
    info: "status-info",
    critical: "bg-critical/15 text-critical animate-pulse-slow",
    linked: "bg-info/15 text-info",
    unlinked: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "status-badge",
        styles[status],
        size === "md" && "px-3 py-1 text-sm"
      )}
    >
      {children}
    </span>
  );
}
