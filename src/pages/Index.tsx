import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { AgentPanel } from "@/components/dashboard/AgentPanel";
import { ExecutionPanel } from "@/components/dashboard/ExecutionPanel";
import { LogsPanel } from "@/components/dashboard/LogsPanel";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { mockAgents, mockMessages, mockLogs } from "@/data/mockData";
import { useAIChat } from "@/hooks/useAIChat";
import { toast } from "sonner";
import type { Agent, ExecutionMessage, LogEntry } from "@/types/agent";

const Index = () => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [activeAgentId, setActiveAgentId] = useState<string | null>("1");
  const [messages, setMessages] = useState<ExecutionMessage[]>(mockMessages);
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [isProcessing, setIsProcessing] = useState(false);

  const { sendMessage, analyzeContent, isLoading: isAILoading, error: aiError } = useAIChat();

  const activeAgent = agents.find((a) => a.id === activeAgentId) || null;

  const handleAgentSelect = (agentId: string) => {
    setActiveAgentId(agentId);
  };

  const handleCommand = async (command: string) => {
    setIsProcessing(true);

    // Add user command as a new message
    const userMessage: ExecutionMessage = {
      id: `msg-${Date.now()}`,
      agentId: activeAgentId || "1",
      type: "system",
      content: `User command: "${command}"`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add log entry
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      level: "info",
      message: `Processing command: ${command.slice(0, 50)}${command.length > 50 ? "..." : ""}`,
      timestamp: new Date(),
      source: "command_bar",
    };
    setLogs((prev) => [...prev, newLog]);

    try {
      // Create a placeholder for the AI response
      const aiMessageId = `msg-${Date.now() + 1}`;
      let aiContent = "";

      // Add initial AI response message
      setMessages((prev) => [...prev, {
        id: aiMessageId,
        agentId: activeAgentId || "1",
        type: "reasoning",
        content: "",
        timestamp: new Date(),
      }]);

      // Stream AI response
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [{ role: "user", content: command }],
          type: "orchestrate"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              aiContent += content;
              setMessages((prev) => prev.map((m) => 
                m.id === aiMessageId ? { ...m, content: aiContent } : m
              ));
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Add completion log
      const completionLog: LogEntry = {
        id: `log-${Date.now() + 2}`,
        level: "success",
        message: "AI command processed successfully",
        timestamp: new Date(),
        source: "ai_orchestrator",
      };
      setLogs((prev) => [...prev, completionLog]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`AI Error: ${errorMessage}`);
      
      // Add error log
      const errorLog: LogEntry = {
        id: `log-${Date.now() + 2}`,
        level: "error",
        message: `AI processing failed: ${errorMessage}`,
        timestamp: new Date(),
        source: "ai_orchestrator",
      };
      setLogs((prev) => [...prev, errorLog]);

      // Add error message
      setMessages((prev) => [...prev, {
        id: `msg-${Date.now() + 2}`,
        agentId: activeAgentId || "1",
        type: "error",
        content: `Failed to process command: ${errorMessage}`,
        timestamp: new Date(),
      }]);
    }

    setIsProcessing(false);
  };

  const handleAnalyzeLogs = async (logsToAnalyze: LogEntry[]): Promise<string> => {
    const logsText = logsToAnalyze
      .slice(-30) // Last 30 logs
      .map((log) => `[${log.level.toUpperCase()}] ${log.timestamp.toISOString()} - ${log.source}: ${log.message}`)
      .join("\n");

    const prompt = `Analyze these system logs and provide insights:\n\n${logsText}`;
    return analyzeContent(prompt);
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
          <LogsPanel 
            logs={logs} 
            onAnalyze={handleAnalyzeLogs}
            isAnalyzing={isAILoading}
          />
        </div>
      </div>

      {/* Command Bar - Full Width */}
      <CommandBar onSubmit={handleCommand} isProcessing={isProcessing} />
    </div>
  );
};

export default Index;
