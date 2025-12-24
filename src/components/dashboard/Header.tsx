import { Activity, Bell, Settings, HelpCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="flex-shrink-0 h-14 border-b border-border bg-background px-6">
      <div className="h-full flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
            <Activity className="h-4 w-4 text-background" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground tracking-tight">
              Agent Orchestrator
            </h1>
            <p className="text-[10px] text-muted-foreground">v1.0.0</p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-6">
          {/* System Status */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-status-completed" />
            <span className="text-xs text-muted-foreground">
              All systems operational
            </span>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-border" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center",
                "text-muted-foreground hover:text-foreground hover:bg-secondary",
                "transition-colors"
              )}
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <button
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center relative",
                "text-muted-foreground hover:text-foreground hover:bg-secondary",
                "transition-colors"
              )}
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <button
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center",
                "text-muted-foreground hover:text-foreground hover:bg-secondary",
                "transition-colors"
              )}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-border" />

          {/* User */}
          <button className="flex items-center gap-2 hover:bg-secondary rounded-md px-2 py-1.5 transition-colors">
            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
