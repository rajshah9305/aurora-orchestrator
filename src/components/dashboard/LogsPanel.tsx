import { useState, useRef, useEffect } from "react";
import { LogEntryComponent } from "./LogEntry";
import type { LogEntry } from "@/types/agent";
import { Search, Filter, ArrowDown, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogsPanelProps {
  logs: LogEntry[];
}

type LogLevel = "all" | "info" | "warning" | "error" | "success";

export function LogsPanel({ logs }: LogsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const levelCounts = {
    info: logs.filter((l) => l.level === "info").length,
    warning: logs.filter((l) => l.level === "warning").length,
    error: logs.filter((l) => l.level === "error").length,
    success: logs.filter((l) => l.level === "success").length,
  };

  return (
    <div className="h-full flex flex-col bg-panel border-l border-panel-border">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">System Logs</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={cn(
                "h-7 w-7 rounded-md flex items-center justify-center transition-colors",
                autoScroll
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              className={cn(
                "h-7 w-7 rounded-md flex items-center justify-center",
                "text-muted-foreground hover:bg-secondary transition-colors"
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-8 pl-8 pr-3 rounded-md text-sm",
              "bg-background border border-input",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-1 focus:ring-ring"
            )}
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Filter className="h-3 w-3" />
          <span>Filter</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform",
              showFilter && "rotate-180"
            )}
          />
        </button>

        {/* Filter Options */}
        {showFilter && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(["all", "info", "warning", "error", "success"] as const).map(
              (level) => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wide transition-colors",
                    levelFilter === level
                      ? "bg-foreground text-background"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {level}
                  {level !== "all" && (
                    <span className="ml-1 opacity-60">
                      ({levelCounts[level]})
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Log Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-1">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4">
            <p className="text-xs text-muted-foreground text-center">
              {logs.length === 0
                ? "No logs yet"
                : "No logs match your filters"}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <LogEntryComponent key={log.id} log={log} />
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="flex-shrink-0 p-3 border-t border-border">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {filteredLogs.length}
              </span>{" "}
              entries
            </span>
          </div>
          <div className="flex items-center gap-2">
            {levelCounts.error > 0 && (
              <span className="text-log-error font-medium">
                {levelCounts.error} errors
              </span>
            )}
            {levelCounts.warning > 0 && (
              <span className="text-log-warning font-medium">
                {levelCounts.warning} warnings
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
