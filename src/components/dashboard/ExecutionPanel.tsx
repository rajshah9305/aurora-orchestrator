import { useRef, useEffect, useState } from "react";
import { ExecutionBlock } from "./ExecutionBlock";
import type { ExecutionMessage, Agent } from "@/types/agent";
import { StatusIndicator } from "./StatusIndicator";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Zap,
  Activity,
  Layers,
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionPanelProps {
  messages: ExecutionMessage[];
  activeAgent: Agent | null;
}

export function ExecutionPanel({ messages, activeAgent }: ExecutionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (scrollRef.current && isAutoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAutoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
      if (!isNearBottom) {
        setIsAutoScroll(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setIsAutoScroll(true);
    }
  };

  // Calculate stats
  const stats = {
    total: messages.length,
    tools: messages.filter(m => m.type === 'tool_call').length,
    errors: messages.filter(m => m.type === 'error').length,
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                {activeAgent?.status === "running" && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Live Execution
                </h2>
                <p className="text-xs text-muted-foreground">
                  Real-time agent activity stream
                </p>
              </div>
            </div>
            
            {activeAgent && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                <StatusIndicator status={activeAgent.status} size="sm" />
                <span className="text-xs font-medium text-foreground">
                  {activeAgent.name}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center">
                  <Layers className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">Steps</span>
                <span className="font-bold text-foreground">{stats.total}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <Activity className="h-3 w-3 text-primary" />
                </div>
                <span className="text-muted-foreground">Tools</span>
                <span className="font-bold text-primary">{stats.tools}</span>
              </div>
              {stats.errors > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-6 w-6 rounded-md bg-status-error/10 flex items-center justify-center">
                    <span className="text-status-error font-bold">{stats.errors}</span>
                  </div>
                  <span className="text-status-error">Errors</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
              <button
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center",
                  "hover:bg-background transition-all duration-200",
                  "text-muted-foreground hover:text-foreground"
                )}
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 transition-all duration-200",
                  "shadow-lg shadow-primary/25"
                )}
                title={activeAgent?.status === "running" ? "Pause" : "Play"}
              >
                {activeAgent?.status === "running" ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              <button
                className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center",
                  "hover:bg-background transition-all duration-200",
                  "text-muted-foreground hover:text-foreground"
                )}
                title="Fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Stream */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="relative mx-auto mb-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center border border-border">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="absolute inset-0 h-20 w-20 rounded-2xl bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready for Execution
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select an agent and start a task to see the live execution stream with real-time updates
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>Waiting for input</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <ExecutionBlock 
                key={msg.id} 
                message={msg} 
                isLatest={index === messages.length - 1}
              />
            ))}
          </>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className={cn(
            "absolute bottom-24 right-8 z-10",
            "h-10 w-10 rounded-full",
            "bg-primary text-primary-foreground",
            "shadow-lg shadow-primary/25",
            "flex items-center justify-center",
            "hover:scale-110 transition-transform duration-200",
            "animate-fade-in"
          )}
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}

      {/* Streaming Indicator */}
      {activeAgent?.status === "running" && (
        <div className="flex-shrink-0 px-6 py-3 border-t border-border bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="absolute h-2 w-2 rounded-full bg-primary animate-ping" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Executing...
              </span>
              <span className="text-xs text-muted-foreground">
                Agent is processing your request
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
