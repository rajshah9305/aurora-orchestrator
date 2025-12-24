import { cn } from "@/lib/utils";
import { StatusIndicator } from "./StatusIndicator";
import type { Agent } from "@/types/agent";
import { Bot, Cpu, Database, Globe, Sparkles } from "lucide-react";

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

export function AgentCard({ agent, isActive, onClick }: AgentCardProps) {
  const Icon = roleIcons[agent.role.toLowerCase()] || roleIcons.default;

  return (
    <button
      onClick={onClick}
      className={cn(
        "agent-card w-full text-left px-3 py-3 rounded-lg",
        "flex items-center gap-3",
        "border border-transparent",
        isActive && "active"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center",
          "bg-secondary border border-border",
          isActive && "bg-primary/10 border-primary/20"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm font-medium truncate",
              isActive ? "text-foreground" : "text-foreground/80"
            )}
          >
            {agent.name}
          </span>
          <StatusIndicator status={agent.status} size="sm" />
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {agent.role}
        </p>
      </div>
    </button>
  );
}
