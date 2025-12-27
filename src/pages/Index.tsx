import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { AgentPanel } from "@/components/dashboard/AgentPanel";
import { ExecutionPanel } from "@/components/dashboard/ExecutionPanel";
import { LogsPanel } from "@/components/dashboard/LogsPanel";
import { CommandBar } from "@/components/dashboard/CommandBar";
import { AgentModal } from "@/components/dashboard/modals/AgentModal";
import { DeleteConfirmModal } from "@/components/dashboard/modals/DeleteConfirmModal";
import { SettingsSheet, AppSettings, defaultSettings } from "@/components/dashboard/modals/SettingsSheet";
import { NotificationsSheet, Notification } from "@/components/dashboard/modals/NotificationsSheet";
import { ProfileSheet, UserProfile } from "@/components/dashboard/modals/ProfileSheet";
import { FullscreenModal } from "@/components/dashboard/modals/FullscreenModal";
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
  const [isPaused, setIsPaused] = useState(false);

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

  // App state
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", type: "success", title: "Agent started", message: "Orchestrator Prime is now running", timestamp: new Date(), read: false },
    { id: "2", type: "info", title: "System update", message: "New AI model available for orchestration", timestamp: new Date(Date.now() - 3600000), read: false },
  ]);
  const [profile, setProfile] = useState<UserProfile>({ name: "Admin", email: "admin@example.com", role: "Super Admin" });

  const { analyzeContent, isLoading: isAILoading } = useAIChat();
  const activeAgent = agents.find((a) => a.id === activeAgentId) || null;

  // Agent handlers
  const handleCreateAgent = () => { setAgentModalMode("create"); setEditingAgent(null); setAgentModalOpen(true); };
  const handleEditAgent = (agent: Agent) => { setAgentModalMode("edit"); setEditingAgent(agent); setAgentModalOpen(true); };
  const handleDeleteAgent = (agent: Agent) => { setDeletingAgent(agent); setDeleteModalOpen(true); };
  const handleSaveAgent = (data: Omit<Agent, "id" | "status" | "lastActive">) => {
    if (agentModalMode === "create") {
      const newAgent: Agent = { id: `${Date.now()}`, ...data, status: "idle", lastActive: new Date() };
      setAgents(prev => [...prev, newAgent]);
      toast.success(`Agent "${data.name}" created`);
    } else if (editingAgent) {
      setAgents(prev => prev.map(a => a.id === editingAgent.id ? { ...a, ...data } : a));
      toast.success(`Agent "${data.name}" updated`);
    }
  };
  const handleConfirmDelete = () => {
    if (deletingAgent) {
      setAgents(prev => prev.filter(a => a.id !== deletingAgent.id));
      if (activeAgentId === deletingAgent.id) setActiveAgentId(null);
      toast.success(`Agent "${deletingAgent.name}" deleted`);
    }
  };
  const handleStartAgent = (agentId: string) => { setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: "running", lastActive: new Date() } : a)); toast.success("Agent started"); };
  const handleStopAgent = (agentId: string) => { setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: "idle" } : a)); toast.info("Agent stopped"); };

  // Notification handlers
  const handleMarkAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const handleMarkAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const handleDeleteNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const handleClearAllNotifications = () => setNotifications([]);

  const handleCommand = async (command: string) => {
    setIsProcessing(true);
    const userMessage: ExecutionMessage = { id: `msg-${Date.now()}`, agentId: activeAgentId || "1", type: "system", content: `User command: "${command}"`, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const newLog: LogEntry = { id: `log-${Date.now()}`, level: "info", message: `Processing: ${command.slice(0, 50)}...`, timestamp: new Date(), source: "command_bar" };
    setLogs(prev => [...prev, newLog]);

    try {
      const aiMessageId = `msg-${Date.now() + 1}`;
      let aiContent = "";
      setMessages(prev => [...prev, { id: aiMessageId, agentId: activeAgentId || "1", type: "reasoning", content: "", timestamp: new Date() }]);
      
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const response = await fetch(CHAT_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` }, body: JSON.stringify({ messages: [{ role: "user", content: command }], type: "orchestrate" }) });
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
          try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) { aiContent += c; setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: aiContent } : m)); } } catch {}
        }
      }
      setLogs(prev => [...prev, { id: `log-${Date.now() + 2}`, level: "success", message: "AI command processed", timestamp: new Date(), source: "ai_orchestrator" }]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`AI Error: ${msg}`);
      setLogs(prev => [...prev, { id: `log-${Date.now()}`, level: "error", message: `AI failed: ${msg}`, timestamp: new Date(), source: "ai_orchestrator" }]);
      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, agentId: activeAgentId || "1", type: "error", content: `Failed: ${msg}`, timestamp: new Date() }]);
    }
    setIsProcessing(false);
  };

  const handleAnalyzeLogs = async (logsToAnalyze: LogEntry[]): Promise<string> => {
    const logsText = logsToAnalyze.slice(-30).map(log => `[${log.level.toUpperCase()}] ${log.timestamp.toISOString()} - ${log.source}: ${log.message}`).join("\n");
    return analyzeContent(`Analyze these system logs:\n\n${logsText}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const randomLog: LogEntry = { id: `log-${Date.now()}`, level: "info", message: `Memory pool: ${Math.floor(Math.random() * 20 + 60)}% utilized`, timestamp: new Date(), source: "system" };
      setLogs(prev => [...prev.slice(-settings.logRetention), randomLog]);
    }, settings.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [settings.refreshInterval, settings.logRetention]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header notificationCount={unreadCount} onNotificationsClick={() => setNotificationsOpen(true)} onSettingsClick={() => setSettingsOpen(true)} onProfileClick={() => setProfileOpen(true)} onHelpClick={() => toast.info("Documentation coming soon")} userName={profile.name} userRole={profile.role} />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 flex-shrink-0 hidden md:block">
          <AgentPanel agents={agents} activeAgentId={activeAgentId} onAgentSelect={setActiveAgentId} onCreateAgent={handleCreateAgent} onEditAgent={handleEditAgent} onDeleteAgent={handleDeleteAgent} onStartAgent={handleStartAgent} onStopAgent={handleStopAgent} />
        </div>
        <div className="flex-1 min-w-0">
          <ExecutionPanel messages={messages} activeAgent={activeAgent} isPaused={isPaused} onTogglePause={() => setIsPaused(!isPaused)} onReset={() => { setMessages([]); toast.info("Execution reset"); }} onFullscreen={() => setFullscreenOpen(true)} />
        </div>
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <LogsPanel logs={logs} onAnalyze={handleAnalyzeLogs} isAnalyzing={isAILoading} onClearLogs={() => setLogs([])} />
        </div>
      </div>
      <CommandBar onSubmit={handleCommand} isProcessing={isProcessing} />

      {/* Modals */}
      <AgentModal open={agentModalOpen} onOpenChange={setAgentModalOpen} agent={editingAgent} onSave={handleSaveAgent} mode={agentModalMode} />
      <DeleteConfirmModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} onConfirm={handleConfirmDelete} title="Delete Agent" description={`Are you sure you want to delete "${deletingAgent?.name}"? This action cannot be undone.`} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} settings={settings} onSaveSettings={setSettings} />
      <NotificationsSheet open={notificationsOpen} onOpenChange={setNotificationsOpen} notifications={notifications} onMarkAsRead={handleMarkAsRead} onMarkAllAsRead={handleMarkAllAsRead} onDelete={handleDeleteNotification} onClearAll={handleClearAllNotifications} />
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} profile={profile} onSaveProfile={setProfile} onLogout={() => toast.info("Logged out")} />
      <FullscreenModal open={fullscreenOpen} onOpenChange={setFullscreenOpen} messages={messages} activeAgent={activeAgent} />
    </div>
  );
};

export default Index;
