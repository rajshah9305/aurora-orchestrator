import { useState } from "react";
import { AgentCard } from "./AgentCard";
import type { Agent } from "@/types/agent";
import { Plus, Search, Users, Zap, MoreHorizontal } from "lucide-react";
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
  const activeCount = agents.filter((a) => a.status === "running").length;

  return (
    <div className="h-full flex flex-col bg-panel border-r border-panel-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
              <Users className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Agents</h2>
              <p className="text-[10px] text-muted-foreground">{agents.length} registered</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-all duration-200",
                "shadow-sm shadow-primary/20 active:scale-95"
              )}
              title="Add Agent"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button className="btn-icon" title="More options">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-status-running" />
              {activeCount > 0 && (
                <div className="absolute inset-0 h-2 w-2 rounded-full bg-status-running animate-ping" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{activeCount}</span> active
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-primary" />
            <span className="font-medium">{agents.filter(a => a.status === 'completed').length} completed</span>
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {runningAgents.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Running ({runningAgents.length})
              </p>
            </div>
            <div className="space-y-1">
              {runningAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isActive={agent.id === activeAgentId}
                  onClick={() => onAgentSelect(agent.id)}
                />
              ))}
            </div>
          </div>
        )}

        {otherAgents.length > 0 && (
          <div>
            {runningAgents.length > 0 && (
              <div className="px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  All Agents
                </p>
              </div>
            )}
            <div className="space-y-1">
              {otherAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isActive={agent.id === activeAgentId}
                  onClick={() => onAgentSelect(agent.id)}
                />
              ))}
            </div>
          </div>
        )}

        {filteredAgents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No agents found</p>
            <p className="text-xs text-muted-foreground text-center">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border bg-secondary/20">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 rounded-lg bg-background border border-border">
            <p className="text-lg font-bold text-foreground">{agents.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Total</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-lg font-bold text-primary">{activeCount}</p>
            <p className="text-[10px] text-primary/70 font-medium">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
