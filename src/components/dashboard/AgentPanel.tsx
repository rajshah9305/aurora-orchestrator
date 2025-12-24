import { useState } from "react";
import { AgentCard } from "./AgentCard";
import type { Agent } from "@/types/agent";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentPanelProps {
  agents: Agent[];
  activeAgentId: string | null;
  onAgentSelect: (agentId: string) => void;
}

export function AgentPanel({ agents, activeAgentId, onAgentSelect }: AgentPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runningAgents = filteredAgents.filter((a) => a.status === "running");
  const otherAgents = filteredAgents.filter((a) => a.status !== "running");

  return (
    <div className="h-full flex flex-col bg-panel border-r border-panel-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Agents</h2>
          <button
            className={cn(
              "h-7 w-7 rounded-md flex items-center justify-center",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 transition-colors"
            )}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents..."
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
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {runningAgents.length > 0 && (
          <div className="mb-3">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Running
            </p>
            {runningAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isActive={agent.id === activeAgentId}
                onClick={() => onAgentSelect(agent.id)}
              />
            ))}
          </div>
        )}

        {otherAgents.length > 0 && (
          <div>
            {runningAgents.length > 0 && (
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                All Agents
              </p>
            )}
            {otherAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isActive={agent.id === activeAgentId}
                onClick={() => onAgentSelect(agent.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total Agents</span>
          <span className="font-medium text-foreground">{agents.length}</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-muted-foreground">Active</span>
          <span className="font-medium text-primary">
            {agents.filter((a) => a.status === "running").length}
          </span>
        </div>
      </div>
    </div>
  );
}
