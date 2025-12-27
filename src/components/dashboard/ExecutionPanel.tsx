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
  ArrowDown,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionPanelProps {
  messages: ExecutionMessage[];
  activeAgent: Agent | null;
  isPaused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  onFullscreen: () => void;
}

export function ExecutionPanel({ 
  messages, 
  activeAgent,
  isPaused,
  onTogglePause,
  onReset,
  onFullscreen,
}: ExecutionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (scrollRef.current && isAutoScroll && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAutoScroll, isPaused]);

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
    <div className="h-full flex flex-col bg-background relative">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Title Block */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-sm">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                {activeAgent?.status === "running" && !isPaused && (
                  <div className="absolute -top-1 -right-1">
                    <div className="h-3.5 w-3.5 rounded-full bg-primary border-2 border-background" />
                    <div className="absolute inset-0 h-3.5 w-3.5 rounded-full bg-primary animate-ping opacity-50" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  Live Execution
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isPaused ? "Paused" : "Real-time agent activity stream"}
                </p>
              </div>
            </div>
            
            {/* Active Agent Badge */}
            {activeAgent && (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-secondary/80 border border-border">
                <StatusIndicator status={activeAgent.status} size="sm" showLabel={false} />
                <span className="text-xs font-semibold text-foreground">
                  {activeAgent.name}
                </span>
                {activeAgent.status === "running" && !isPaused && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
                    Live
                  </span>
                )}
                {isPaused && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-log-warning/10 text-log-warning font-bold uppercase tracking-wider">
                    Paused
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Stats & Controls */}
          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="stat-card">
                <div className="h-6 w-6 rounded-md bg-secondary flex items-center justify-center">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Steps</span>
                  <span className="font-bold text-foreground ml-1.5">{stats.total}</span>
                </div>
              </div>
              <div className="stat-card border-primary/20 bg-primary/5">
                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Tools</span>
                  <span className="font-bold text-primary ml-1.5">{stats.tools}</span>
                </div>
              </div>
              {stats.errors > 0 && (
                <div className="stat-card border-status-error/20 bg-status-error/5">
                  <span className="text-xs font-bold text-status-error">{stats.errors} errors</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/60 border border-border">
              <button 
                onClick={onReset}
                className="btn-icon" 
                title="Reset execution"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={onTogglePause}
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90",
                  "shadow-sm shadow-primary/20 active:scale-95"
                )}
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </button>
              <button 
                onClick={onFullscreen}
                className="btn-icon" 
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
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scroll-smooth relative"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="relative mx-auto mb-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center border border-border shadow-sm">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="absolute inset-0 h-20 w-20 rounded-2xl bg-primary/5 animate-ping" style={{ animationDuration: '3s' }} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Ready for Execution
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Select an agent and enter a command to see the live execution stream with real-time updates
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="font-medium">Waiting for input</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Timeline line */}
            <div className="absolute left-[2.15rem] top-4 bottom-4 w-px bg-border" />
            
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
            "absolute bottom-24 right-8 z-20",
            "h-10 w-10 rounded-xl",
            "bg-foreground text-background",
            "shadow-lg",
            "flex items-center justify-center",
            "hover:scale-105 active:scale-95 transition-all duration-200",
            "animate-fade-in"
          )}
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}

      {/* Streaming Indicator */}
      {activeAgent?.status === "running" && !isPaused && (
        <div className="flex-shrink-0 px-6 py-3 border-t border-border bg-gradient-to-r from-primary/5 via-background to-primary/5 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <Radio className="h-4 w-4 text-primary" />
                <div className="absolute h-4 w-4 rounded-full bg-primary/20 animate-ping" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">
                  Processing
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  Agent is executing your request
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
