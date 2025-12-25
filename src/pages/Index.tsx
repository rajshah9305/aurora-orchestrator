import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { AgentPanel } from "@/components/dashboard/AgentPanel";
import { ExecutionPanel } from "@/components/dashboard/ExecutionPanel";
import { LogsPanel } from "@/components/dashboard/LogsPanel";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { mockAgents, mockMessages, mockLogs } from "@/data/mockData";
import type { Agent, ExecutionMessage, LogEntry } from "@/types/agent";

const Index = () => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [activeAgentId, setActiveAgentId] = useState<string | null>("1");
  const [messages, setMessages] = useState<ExecutionMessage[]>(mockMessages);
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeAgent = agents.find((a) => a.id === activeAgentId) || null;

  const handleAgentSelect = (agentId: string) => {
    setActiveAgentId(agentId);
  };

  const handleCommand = async (command: string) => {
    setIsProcessing(true);

    // Add user command as a new message
    const newMessage: ExecutionMessage = {
      id: `msg-${Date.now()}`,
      agentId: activeAgentId || "1",
      type: "system",
      content: `User command received: "${command}"`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Add log entry
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      level: "info",
      message: `Processing command: ${command.slice(0, 50)}${command.length > 50 ? "..." : ""}`,
      timestamp: new Date(),
      source: "command_bar",
    };
    setLogs((prev) => [...prev, newLog]);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate agent response
    const responseMessage: ExecutionMessage = {
      id: `msg-${Date.now() + 1}`,
      agentId: activeAgentId || "1",
      type: "reasoning",
      content: `Analyzing request and determining optimal execution path for: "${command}"`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, responseMessage]);

    // Add completion log
    const completionLog: LogEntry = {
      id: `log-${Date.now() + 1}`,
      level: "success",
      message: "Command processed successfully",
      timestamp: new Date(),
      source: "orchestrator",
    };
    setLogs((prev) => [...prev, completionLog]);

    setIsProcessing(false);
  };

  // Simulate real-time log updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomLogs: LogEntry[] = [
        {
          id: `log-${Date.now()}`,
          level: "info",
          message: "Heartbeat check - all agents responsive",
          timestamp: new Date(),
          source: "health_monitor",
        },
        {
          id: `log-${Date.now()}`,
          level: "info",
          message: `Memory pool: ${Math.floor(Math.random() * 20 + 60)}% utilized`,
          timestamp: new Date(),
          source: "system",
        },
      ];
      const randomLog = randomLogs[Math.floor(Math.random() * randomLogs.length)];
      setLogs((prev) => [...prev.slice(-50), randomLog]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Agent Management */}
        <div className="w-72 flex-shrink-0 hidden md:block">
          <AgentPanel
            agents={agents}
            activeAgentId={activeAgentId}
            onAgentSelect={handleAgentSelect}
          />
        </div>

        {/* Center Panel - Execution View */}
        <div className="flex-1 min-w-0">
          <ExecutionPanel messages={messages} activeAgent={activeAgent} />
        </div>

        {/* Right Panel - Logs */}
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <LogsPanel logs={logs} />
        </div>
      </div>

      {/* Command Bar - Full Width */}
      <CommandBar onSubmit={handleCommand} isProcessing={isProcessing} />
    </div>
  );
};

export default Index;
