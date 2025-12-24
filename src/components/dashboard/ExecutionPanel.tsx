import { useRef, useEffect } from "react";
import { ExecutionBlock } from "./ExecutionBlock";
import type { ExecutionMessage, Agent } from "@/types/agent";
import { StatusIndicator } from "./StatusIndicator";
import { Play, Pause, RotateCcw, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionPanelProps {
  messages: ExecutionMessage[];
  activeAgent: Agent | null;
}

export function ExecutionPanel({ messages, activeAgent }: ExecutionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">
              Live Execution
            </h2>
            {activeAgent && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary">
                <StatusIndicator status={activeAgent.status} size="sm" />
                <span className="text-xs font-medium text-foreground">
                  {activeAgent.name}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center",
                "hover:bg-secondary transition-colors",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors"
              )}
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
                "hover:bg-secondary transition-colors",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Execution Stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Play className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No Active Execution
              </p>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Select an agent and start a task to see the live execution stream
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => <ExecutionBlock key={msg.id} message={msg} />)
        )}
      </div>

      {/* Streaming Indicator */}
      {activeAgent?.status === "running" && (
        <div className="flex-shrink-0 px-6 py-3 border-t border-border bg-secondary/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-75" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-150" />
            </div>
            <span className="text-xs text-muted-foreground">
              Streaming execution...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
