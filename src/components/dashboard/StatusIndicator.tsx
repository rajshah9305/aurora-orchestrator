import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/types/agent";

interface StatusIndicatorProps {
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusConfig: Record<AgentStatus, { color: string; label: string; pulse: boolean }> = {
  idle: { color: 'bg-status-idle', label: 'Idle', pulse: false },
  running: { color: 'bg-status-running', label: 'Running', pulse: true },
  completed: { color: 'bg-status-completed', label: 'Completed', pulse: false },
  error: { color: 'bg-status-error', label: 'Error', pulse: true },
};

const sizeConfig = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

export function StatusIndicator({ status, size = 'md', showLabel = false }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={cn(
            "rounded-full",
            sizeConfig[size],
            config.color,
            config.pulse && "status-pulse"
          )}
        />
        {config.pulse && (
          <div
            className={cn(
              "absolute inset-0 rounded-full opacity-40",
              config.color,
              "animate-ping"
            )}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {config.label}
        </span>
      )}
    </div>
  );
}
