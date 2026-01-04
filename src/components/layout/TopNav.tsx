import { NavLink, useLocation } from "react-router-dom";
import { Bell, Search, RefreshCw, Bus, LayoutDashboard, AlertTriangle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TopNavProps {
  lastUpdated?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Active Issues", href: "/issues", icon: AlertTriangle },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function TopNav({ lastUpdated, isRefreshing, onRefresh }: TopNavProps) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-card border-b">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo & Nav */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Bus className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">FleetOps</h1>
              <p className="text-xs text-muted-foreground">Maintenance Hub</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              <span>Updated {lastUpdated}</span>
            </div>
          )}
          
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          )}

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 w-48 bg-background" />
          </div>

          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-critical text-[10px] font-medium text-critical-foreground flex items-center justify-center">
              3
            </span>
          </Button>

          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
