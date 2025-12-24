import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ExecutionMessage } from "@/types/agent";
import { 
  Bot, 
  Cog, 
  AlertCircle, 
  Terminal, 
  MessageSquare, 
  Clock, 
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Copy,
  Check
} from "lucide-react";
import { format } from "date-fns";

interface ExecutionBlockProps {
  message: ExecutionMessage;
  isLatest?: boolean;
}

const typeConfig: Record<
  ExecutionMessage["type"],
  { 
    icon: React.ElementType; 
    label: string; 
    borderClass: string;
    bgClass: string;
    iconClass: string;
    glowClass?: string;
  }
> = {
  message: {
    icon: MessageSquare,
    label: "Response",
    borderClass: "border-l-foreground/30",
    bgClass: "bg-card",
    iconClass: "text-foreground",
  },
  tool_call: {
    icon: Cog,
    label: "Tool Execution",
    borderClass: "border-l-primary",
    bgClass: "bg-gradient-to-r from-primary/5 to-transparent",
    iconClass: "text-primary",
    glowClass: "shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]",
  },
  reasoning: {
    icon: Sparkles,
    label: "Thinking",
    borderClass: "border-l-muted-foreground/50",
    bgClass: "bg-muted/30",
    iconClass: "text-muted-foreground",
  },
  error: {
    icon: AlertCircle,
    label: "Error",
    borderClass: "border-l-status-error",
    bgClass: "bg-status-error/5",
    iconClass: "text-status-error",
    glowClass: "shadow-[0_0_20px_-5px_hsl(var(--status-error)/0.3)]",
  },
  system: {
    icon: Terminal,
    label: "System Event",
    borderClass: "border-l-muted-foreground/30",
    bgClass: "bg-secondary/50",
    iconClass: "text-muted-foreground",
  },
};

export function ExecutionBlock({ message, isLatest }: ExecutionBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  
  const config = typeConfig[message.type];
  const Icon = config.icon;

  const handleCopy = async (text: string, type: 'input' | 'output') => {
    await navigator.clipboard.writeText(text);
    if (type === 'input') {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "execution-enter group relative",
        "rounded-xl border border-border/80",
        "border-l-[3px] transition-all duration-300",
        "hover:border-border hover:shadow-lg",
        config.borderClass,
        config.bgClass,
        config.glowClass,
        isLatest && "ring-1 ring-primary/20"
      )}
    >
      {/* Animated gradient border for latest */}
      {isLatest && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />
        </div>
      )}

      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-300",
            message.type === "tool_call" && "bg-primary/10",
            message.type === "error" && "bg-status-error/10",
            message.type === "reasoning" && "bg-muted",
            message.type === "message" && "bg-secondary",
            message.type === "system" && "bg-secondary",
            isLatest && message.type === "tool_call" && "animate-pulse"
          )}>
            <Icon className={cn("h-4 w-4", config.iconClass)} />
          </div>
          
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {config.label}
              </span>
              {message.metadata?.toolName && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  {message.metadata.toolName}
                </span>
              )}
              {message.type === "tool_call" && message.metadata?.duration && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-success/10 text-status-success text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {format(message.timestamp, "HH:mm:ss.SSS")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {message.metadata?.duration && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-xs font-mono text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{message.metadata.duration}ms</span>
            </div>
          )}
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              !isExpanded && "-rotate-90"
            )}
          />
        </div>
      </button>

      {/* Content */}
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 pb-4 pt-1">
          {/* Message Content */}
          <div className={cn(
            "relative pl-11",
            message.type === "reasoning" && "border-l-2 border-dashed border-muted-foreground/20 ml-4 pl-4"
          )}>
            <p className={cn(
              "text-sm leading-relaxed",
              message.type === "reasoning" && "text-muted-foreground italic",
              message.type === "error" && "text-status-error font-medium",
              message.type !== "reasoning" && message.type !== "error" && "text-foreground"
            )}>
              {message.content}
            </p>
          </div>

          {/* Tool I/O with enhanced styling */}
          {message.type === "tool_call" && message.metadata && (
            <div className="mt-4 ml-11 space-y-3">
              {message.metadata.toolInput && (
                <div className="group/code relative rounded-lg bg-background border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-secondary/50 border-b border-border">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Input
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(message.metadata!.toolInput!, 'input');
                      }}
                      className="opacity-0 group-hover/code:opacity-100 transition-opacity p-1 hover:bg-secondary rounded"
                    >
                      {copiedInput ? (
                        <Check className="h-3 w-3 text-status-success" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <pre className="p-3 text-xs font-mono text-foreground overflow-x-auto scrollbar-thin">
                    {message.metadata.toolInput}
                  </pre>
                </div>
              )}
              
              {message.metadata.toolOutput && (
                <div className="group/code relative rounded-lg bg-background border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-status-success/5 border-b border-status-success/20">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-status-success">
                      Output
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(message.metadata!.toolOutput!, 'output');
                      }}
                      className="opacity-0 group-hover/code:opacity-100 transition-opacity p-1 hover:bg-secondary rounded"
                    >
                      {copiedOutput ? (
                        <Check className="h-3 w-3 text-status-success" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <pre className="p-3 text-xs font-mono text-foreground overflow-x-auto scrollbar-thin">
                    {message.metadata.toolOutput}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interactive hover indicator */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full bg-primary/0 group-hover:bg-primary/50 transition-all duration-300" />
    </div>
  );
}
