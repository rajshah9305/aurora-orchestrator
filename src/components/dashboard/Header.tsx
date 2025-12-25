import { Activity, Bell, Settings, HelpCircle, User, ChevronDown, Wifi, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="flex-shrink-0 h-16 border-b border-border bg-background/95 backdrop-blur-sm px-6 sticky top-0 z-50">
      <div className="h-full flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="h-10 w-10 rounded-xl bg-foreground flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105">
              <Activity className="h-5 w-5 text-background" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-status-completed border-2 border-background" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">
              Agent Orchestrator
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-medium">Enterprise</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">v2.0</span>
            </div>
          </div>
        </div>

        {/* Center - System Metrics */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60">
            <Wifi className="h-3.5 w-3.5 text-status-completed" />
            <span className="text-xs font-medium text-foreground">Connected</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-semibold text-foreground">99.9%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Latency</span>
              <span className="font-semibold text-status-completed">12ms</span>
            </div>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* System Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-status-completed/10 mr-2">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-status-completed" />
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-status-completed animate-ping opacity-50" />
            </div>
            <span className="text-xs font-medium text-status-completed">
              All systems operational
            </span>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-border hidden md:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              className={cn(
                "btn-icon",
                "hover:bg-secondary"
              )}
              title="Documentation"
            >
              <HelpCircle className="h-[18px] w-[18px]" />
            </button>
            <button
              className={cn(
                "btn-icon relative",
                "hover:bg-secondary"
              )}
              title="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
            </button>
            <button
              className={cn(
                "btn-icon",
                "hover:bg-secondary"
              )}
              title="Settings"
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-border" />

          {/* User Menu */}
          <button className="flex items-center gap-2.5 hover:bg-secondary rounded-lg px-2.5 py-2 transition-all duration-200 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-foreground leading-none">Admin</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" />
                Super Admin
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}
