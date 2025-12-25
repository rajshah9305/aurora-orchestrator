import { useState, useRef, useEffect } from "react";
import { LogEntryComponent } from "./LogEntry";
import type { LogEntry } from "@/types/agent";
import { Search, Filter, ArrowDown, Trash2, ChevronDown, Terminal, AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogsPanelProps {
  logs: LogEntry[];
}

type LogLevel = "all" | "info" | "warning" | "error" | "success";

const levelIcons: Record<Exclude<LogLevel, 'all'>, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
};

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
              <Terminal className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">System Logs</h2>
              <p className="text-[10px] text-muted-foreground">{logs.length} entries</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200",
                autoScroll
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "btn-icon"
              )}
              title={autoScroll ? "Auto-scroll on" : "Auto-scroll off"}
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <button
              className="btn-icon"
              title="Clear logs"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            showFilter 
              ? "bg-foreground text-background" 
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filters</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              showFilter && "rotate-180"
            )}
          />
        </button>

        {/* Filter Options */}
        {showFilter && (
          <div className="mt-3 flex flex-wrap gap-1.5 animate-fade-in">
            {(["all", "info", "warning", "error", "success"] as const).map(
              (level) => {
                const Icon = level !== 'all' ? levelIcons[level] : null;
                return (
                  <button
                    key={level}
                    onClick={() => setLevelFilter(level)}
                    className={cn(
                      "filter-chip flex items-center gap-1.5",
                      levelFilter === level
                        ? "filter-chip-active"
                        : "filter-chip-inactive"
                    )}
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    <span className="capitalize">{level}</span>
                    {level !== "all" && (
                      <span className={cn(
                        "text-[9px] px-1 py-0.5 rounded-full",
                        levelFilter === level ? "bg-background/20" : "bg-muted"
                      )}>
                        {levelCounts[level]}
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Log Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <Terminal className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {logs.length === 0 ? "No logs yet" : "No matching logs"}
              </p>
              <p className="text-xs text-muted-foreground">
                {logs.length === 0
                  ? "System events will appear here"
                  : "Try adjusting your filters"}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-1">
            {filteredLogs.map((log, index) => (
              <LogEntryComponent 
                key={log.id} 
                log={log} 
                isLatest={index === filteredLogs.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="flex-shrink-0 p-3 border-t border-border bg-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-muted-foreground">
              Showing <span className="font-bold text-foreground">{filteredLogs.length}</span> of {logs.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {levelCounts.error > 0 && (
              <div className="flex items-center gap-1 text-[11px]">
                <AlertCircle className="h-3 w-3 text-log-error" />
                <span className="text-log-error font-semibold">{levelCounts.error}</span>
              </div>
            )}
            {levelCounts.warning > 0 && (
              <div className="flex items-center gap-1 text-[11px]">
                <AlertTriangle className="h-3 w-3 text-log-warning" />
                <span className="text-log-warning font-semibold">{levelCounts.warning}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
