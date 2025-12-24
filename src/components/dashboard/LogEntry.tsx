import { cn } from "@/lib/utils";
import type { LogEntry as LogEntryType } from "@/types/agent";
import { Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface LogEntryProps {
  log: LogEntryType;
}

const levelConfig: Record<
  LogEntryType["level"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  info: {
    icon: Info,
    color: "text-log-info",
    bg: "bg-log-info/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-log-warning",
    bg: "bg-log-warning/10",
  },
  error: {
    icon: XCircle,
    color: "text-log-error",
    bg: "bg-log-error/10",
  },
  success: {
    icon: CheckCircle,
    color: "text-log-success",
    bg: "bg-log-success/10",
  },
};

export function LogEntryComponent({ log }: LogEntryProps) {
  const config = levelConfig[log.level];
  const Icon = config.icon;

  return (
    <div className="log-enter px-3 py-2 hover:bg-secondary/50 transition-colors rounded">
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "flex-shrink-0 h-5 w-5 rounded flex items-center justify-center mt-0.5",
            config.bg
          )}
        >
          <Icon className={cn("h-3 w-3", config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[10px] mono text-muted-foreground">
              {format(log.timestamp, "HH:mm:ss.SSS")}
            </span>
            {log.source && (
              <span className="text-[10px] mono text-muted-foreground truncate">
                {log.source}
              </span>
            )}
          </div>
          <p className={cn("text-xs", config.color, "leading-relaxed")}>
            {log.message}
          </p>
          {log.details && (
            <pre className="mt-1 text-[10px] mono text-muted-foreground bg-secondary rounded px-2 py-1 overflow-x-auto">
              {log.details}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
