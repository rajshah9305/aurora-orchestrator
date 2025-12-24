import { cn } from "@/lib/utils";
import type { ExecutionMessage } from "@/types/agent";
import { Bot, Cog, AlertCircle, Terminal, MessageSquare, Clock } from "lucide-react";
import { format } from "date-fns";

interface ExecutionBlockProps {
  message: ExecutionMessage;
}

const typeConfig: Record<
  ExecutionMessage["type"],
  { icon: React.ElementType; label: string; className: string }
> = {
  message: {
    icon: MessageSquare,
    label: "Response",
    className: "border-l-foreground/20",
  },
  tool_call: {
    icon: Cog,
    label: "Tool Call",
    className: "border-l-primary",
  },
  reasoning: {
    icon: Bot,
    label: "Reasoning",
    className: "border-l-muted-foreground",
  },
  error: {
    icon: AlertCircle,
    label: "Error",
    className: "border-l-status-error",
  },
  system: {
    icon: Terminal,
    label: "System",
    className: "border-l-muted-foreground/50",
  },
};

export function ExecutionBlock({ message }: ExecutionBlockProps) {
  const config = typeConfig[message.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "execution-enter",
        "rounded-lg border border-border bg-card",
        "border-l-2",
        config.className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "h-3.5 w-3.5",
              message.type === "tool_call" && "text-primary",
              message.type === "error" && "text-status-error",
              message.type !== "tool_call" &&
                message.type !== "error" &&
                "text-muted-foreground"
            )}
          />
          <span className="text-xs font-medium text-foreground">{config.label}</span>
          {message.metadata?.toolName && (
            <span className="tool-badge">{message.metadata.toolName}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {message.metadata?.duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {message.metadata.duration}ms
            </span>
          )}
          <span>{format(message.timestamp, "HH:mm:ss")}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <p
          className={cn(
            "text-sm leading-relaxed",
            message.type === "reasoning" && "text-muted-foreground italic",
            message.type === "error" && "text-status-error",
            message.type !== "reasoning" &&
              message.type !== "error" &&
              "text-foreground"
          )}
        >
          {message.content}
        </p>

        {/* Tool I/O */}
        {message.type === "tool_call" && message.metadata && (
          <div className="mt-3 space-y-2">
            {message.metadata.toolInput && (
              <div className="rounded-md bg-secondary p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Input
                </p>
                <pre className="text-xs mono text-foreground overflow-x-auto">
                  {message.metadata.toolInput}
                </pre>
              </div>
            )}
            {message.metadata.toolOutput && (
              <div className="rounded-md bg-secondary p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Output
                </p>
                <pre className="text-xs mono text-foreground overflow-x-auto">
                  {message.metadata.toolOutput}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
