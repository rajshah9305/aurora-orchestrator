import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { AgentPanel } from "@/components/dashboard/AgentPanel";
import { ExecutionPanel } from "@/components/dashboard/ExecutionPanel";
import { LogsPanel } from "@/components/dashboard/LogsPanel";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { AgentModal } from "@/components/dashboard/modals/AgentModal";
import { DeleteConfirmModal } from "@/components/dashboard/modals/DeleteConfirmModal";
import { SettingsSheet, defaultSettings } from "@/components/dashboard/modals/SettingsSheet";
import { NotificationsSheet, Notification } from "@/components/dashboard/modals/NotificationsSheet";
import { ProfileSheet, UserProfile } from "@/components/dashboard/modals/ProfileSheet";
import { FullscreenModal } from "@/components/dashboard/modals/FullscreenModal";
import { PresenceIndicator } from "@/components/dashboard/PresenceIndicator";
import { useAgents } from "@/hooks/useAgents";
import { useExecutionMessages } from "@/hooks/useExecutionMessages";
import { useLogs } from "@/hooks/useLogs";
import { useSettings } from "@/hooks/useSettings";
import { usePresence } from "@/hooks/usePresence";
import { useAIChat } from "@/hooks/useAIChat";
import { toast } from "sonner";
import type { Agent, LogEntry } from "@/types/agent";
import { Loader2 } from "lucide-react";

const Index = () => {
  // Supabase hooks for persistence and real-time
  const { agents, loading: agentsLoading, createAgent, updateAgent, deleteAgent, startAgent, stopAgent } = useAgents();
  const { messages, loading: messagesLoading, addMessage, clearMessages, updateMessageLocally } = useExecutionMessages();
  const { settings, saveSettings, loading: settingsLoading } = useSettings();
  const { logs, addLog, clearLogs } = useLogs(settings.logRetention);
  
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Real-time presence
  const { users, userIdentifier, userName, setUserName } = usePresence(activeAgentId);

  // Modal states
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [agentModalMode, setAgentModalMode] = useState<"create" | "edit">("create");
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Local state for notifications (could be persisted too)
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", type: "success", title: "Dashboard ready", message: "Real-time collaboration enabled", timestamp: new Date(), read: false },
  ]);
  const [profile, setProfile] = useState<UserProfile>({ name: userName, email: "user@example.com", role: "Collaborator" });

  const { analyzeContent, isLoading: isAILoading } = useAIChat();
  const activeAgent = agents.find((a) => a.id === activeAgentId) || null;

  // Set first agent as active when loaded
  useEffect(() => {
    if (!activeAgentId && agents.length > 0) {
      setActiveAgentId(agents[0].id);
    }
  }, [agents, activeAgentId]);

  // Sync profile name with presence
  useEffect(() => {
    if (profile.name !== userName) {
      setUserName(profile.name);
    }
  }, [profile.name, userName, setUserName]);

  // Agent handlers
  const handleCreateAgent = () => { setAgentModalMode("create"); setEditingAgent(null); setAgentModalOpen(true); };
  const handleEditAgent = (agent: Agent) => { setAgentModalMode("edit"); setEditingAgent(agent); setAgentModalOpen(true); };
  const handleDeleteAgent = (agent: Agent) => { setDeletingAgent(agent); setDeleteModalOpen(true); };
  
  const handleSaveAgent = async (data: Omit<Agent, "id" | "status" | "lastActive">) => {
    try {
      if (agentModalMode === "create") {
        await createAgent(data);
        toast.success(`Agent "${data.name}" created`);
      } else if (editingAgent) {
        await updateAgent(editingAgent.id, data);
        toast.success(`Agent "${data.name}" updated`);
      }
    } catch (error) {
      toast.error("Failed to save agent");
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingAgent) {
      try {
        await deleteAgent(deletingAgent.id);
        if (activeAgentId === deletingAgent.id) setActiveAgentId(null);
        toast.success(`Agent "${deletingAgent.name}" deleted`);
      } catch (error) {
        toast.error("Failed to delete agent");
      }
    }
  };

  const handleStartAgent = async (agentId: string) => {
    try {
      await startAgent(agentId);
      await addLog({ level: "success", message: `Agent started`, source: `agent:${agentId}` });
      toast.success("Agent started");
    } catch (error) {
      toast.error("Failed to start agent");
    }
  };

  const handleStopAgent = async (agentId: string) => {
    try {
      await stopAgent(agentId);
      await addLog({ level: "info", message: `Agent stopped`, source: `agent:${agentId}` });
      toast.info("Agent stopped");
    } catch (error) {
      toast.error("Failed to stop agent");
    }
  };

  // Notification handlers
  const handleMarkAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const handleMarkAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const handleDeleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const handleClearAllNotifications = () => setNotifications([]);

  const handleCommand = async (command: string) => {
    setIsProcessing(true);
    
    try {
      // Add user message to execution history
      await addMessage({
        agentId: activeAgentId || agents[0]?.id || 'system',
        type: "system",
        content: `User command: "${command}"`,
      });
      
      await addLog({ level: "info", message: `Processing: ${command.slice(0, 50)}...`, source: "command_bar" });

      // Create placeholder for AI response
      const aiMessage = await addMessage({
        agentId: activeAgentId || agents[0]?.id || 'system',
        type: "reasoning",
        content: "",
      });

      let aiContent = "";
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const response = await fetch(CHAT_URL, { 
        method: "POST", 
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` }, 
        body: JSON.stringify({ messages: [{ role: "user", content: command }], type: "orchestrate" }) 
      });
      
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `HTTP ${response.status}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx); buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try { 
            const p = JSON.parse(json); 
            const c = p.choices?.[0]?.delta?.content; 
            if (c) { 
              aiContent += c; 
              updateMessageLocally(aiMessage.id, aiContent); 
            } 
          } catch {}
        }
      }
      
      await addLog({ level: "success", message: "AI command processed", source: "ai_orchestrator" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`AI Error: ${msg}`);
      await addLog({ level: "error", message: `AI failed: ${msg}`, source: "ai_orchestrator" });
      await addMessage({
        agentId: activeAgentId || 'system',
        type: "error",
        content: `Failed: ${msg}`,
      });
    }
    setIsProcessing(false);
  };

  const handleAnalyzeLogs = async (logsToAnalyze: LogEntry[]): Promise<string> => {
    const logsText = logsToAnalyze.slice(-30).map(log => `[${log.level.toUpperCase()}] ${log.timestamp.toISOString()} - ${log.source}: ${log.message}`).join("\n");
    return analyzeContent(`Analyze these system logs:\n\n${logsText}`);
  };

  const handleReset = async () => {
    await clearMessages();
    toast.info("Execution reset");
  };

  const handleClearLogs = async () => {
    await clearLogs();
    toast.info("Logs cleared");
  };

  const handleSaveSettings = async (newSettings: typeof settings) => {
    await saveSettings(newSettings);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setUserName(newProfile.name);
  };

  // Auto-generate system logs
  useEffect(() => {
    const interval = setInterval(() => {
      addLog({ 
        level: "info", 
        message: `Memory pool: ${Math.floor(Math.random() * 20 + 60)}% utilized`, 
        source: "system" 
      });
    }, settings.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [settings.refreshInterval, addLog]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isLoading = agentsLoading || messagesLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header 
        notificationCount={unreadCount} 
        onNotificationsClick={() => setNotificationsOpen(true)} 
        onSettingsClick={() => setSettingsOpen(true)} 
        onProfileClick={() => setProfileOpen(true)} 
        onHelpClick={() => toast.info("Documentation coming soon")} 
        userName={profile.name} 
        userRole={profile.role}
      >
        <PresenceIndicator users={users} currentUserIdentifier={userIdentifier} />
      </Header>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 flex-shrink-0 hidden md:block">
          <AgentPanel 
            agents={agents} 
            activeAgentId={activeAgentId} 
            onAgentSelect={setActiveAgentId} 
            onCreateAgent={handleCreateAgent} 
            onEditAgent={handleEditAgent} 
            onDeleteAgent={handleDeleteAgent} 
            onStartAgent={handleStartAgent} 
            onStopAgent={handleStopAgent}
            onlineUsers={users}
          />
        </div>
        <div className="flex-1 min-w-0">
          <ExecutionPanel 
            messages={messages} 
            activeAgent={activeAgent} 
            isPaused={isPaused} 
            onTogglePause={() => setIsPaused(!isPaused)} 
            onReset={handleReset} 
            onFullscreen={() => setFullscreenOpen(true)} 
          />
        </div>
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <LogsPanel 
            logs={logs} 
            onAnalyze={handleAnalyzeLogs} 
            isAnalyzing={isAILoading} 
            onClearLogs={handleClearLogs} 
          />
        </div>
      </div>
      <CommandBar onSubmit={handleCommand} isProcessing={isProcessing} />

      {/* Modals */}
      <AgentModal open={agentModalOpen} onOpenChange={setAgentModalOpen} agent={editingAgent} onSave={handleSaveAgent} mode={agentModalMode} />
      <DeleteConfirmModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} onConfirm={handleConfirmDelete} title="Delete Agent" description={`Are you sure you want to delete "${deletingAgent?.name}"? This action cannot be undone.`} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onSaveSettings={handleSaveSettings} />
      <NotificationsSheet open={notificationsOpen} onOpenChange={setNotificationsOpen} notifications={notifications} onMarkAsRead={handleMarkAsRead} onMarkAllAsRead={handleMarkAllAsRead} onDelete={handleDeleteNotification} onClearAll={handleClearAllNotifications} />
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} profile={profile} onSaveProfile={handleSaveProfile} onLogout={() => toast.info("Logged out")} />
      <FullscreenModal open={fullscreenOpen} onOpenChange={setFullscreenOpen} messages={messages} activeAgent={activeAgent} />
    </div>
  );
};

export default Index;
