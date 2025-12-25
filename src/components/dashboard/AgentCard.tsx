import { cn } from "@/lib/utils";
import { StatusIndicator } from "./StatusIndicator";
import type { Agent } from "@/types/agent";
import { Bot, Cpu, Database, Globe, Sparkles, ArrowRight } from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
  onClick: () => void;
}

const roleIcons: Record<string, React.ElementType> = {
  orchestrator: Sparkles,
  researcher: Globe,
  analyst: Cpu,
  executor: Bot,
  default: Database,
};

const roleColors: Record<string, string> = {
  orchestrator: "text-primary",
  researcher: "text-status-running",
  analyst: "text-log-warning",
  executor: "text-status-completed",
  default: "text-muted-foreground",
};

export function AgentCard({ agent, isActive, onClick }: AgentCardProps) {
  const Icon = roleIcons[agent.role.toLowerCase()] || roleIcons.default;
  const iconColor = roleColors[agent.role.toLowerCase()] || roleColors.default;

  return (
    <button
      onClick={onClick}
      className={cn(
        "agent-card w-full text-left px-3 py-3 rounded-xl",
        "flex items-center gap-3 group",
        "border border-transparent",
        isActive && "active"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center",
          "bg-secondary border border-border transition-all duration-200",
          isActive && "bg-primary/10 border-primary/30 shadow-sm",
          !isActive && "group-hover:border-border/80"
        )}
      >
        <Icon
          className={cn(
            "h-4.5 w-4.5 transition-colors duration-200",
            isActive ? "text-primary" : iconColor
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm font-semibold truncate transition-colors duration-200",
              isActive ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
            )}
          >
            {agent.name}
          </span>
          <StatusIndicator status={agent.status} size="sm" showLabel={false} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-[11px] text-muted-foreground truncate capitalize">
            {agent.role}
          </p>
          {agent.status === "running" && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wider">
              Live
            </span>
          )}
        </div>
      </div>

      <ArrowRight 
        className={cn(
          "h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-200",
          "group-hover:opacity-100 group-hover:translate-x-0",
          isActive && "opacity-100 translate-x-0 text-primary"
        )} 
      />
    </button>
  );
}
