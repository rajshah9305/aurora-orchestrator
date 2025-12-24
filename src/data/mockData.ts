import type { Agent, ExecutionMessage, LogEntry } from "@/types/agent";

export const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Orchestrator Prime",
    role: "Orchestrator",
    status: "running",
    lastActive: new Date(),
  },
  {
    id: "2",
    name: "Research Agent",
    role: "Researcher",
    status: "running",
    lastActive: new Date(),
  },
  {
    id: "3",
    name: "Data Analyst",
    role: "Analyst",
    status: "idle",
    lastActive: new Date(Date.now() - 300000),
  },
  {
    id: "4",
    name: "Code Executor",
    role: "Executor",
    status: "completed",
    lastActive: new Date(Date.now() - 600000),
  },
  {
    id: "5",
    name: "Memory Agent",
    role: "Database",
    status: "idle",
    lastActive: new Date(Date.now() - 900000),
  },
];

export const mockMessages: ExecutionMessage[] = [
  {
    id: "1",
    agentId: "1",
    type: "system",
    content: "Orchestration session initialized. Ready to process tasks.",
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: "2",
    agentId: "1",
    type: "reasoning",
    content:
      "Analyzing the user request to determine optimal agent allocation and execution strategy...",
    timestamp: new Date(Date.now() - 55000),
  },
  {
    id: "3",
    agentId: "2",
    type: "tool_call",
    content: "Initiating web search for market research data",
    timestamp: new Date(Date.now() - 50000),
    metadata: {
      toolName: "web_search",
      toolInput: '{ "query": "AI market trends 2024", "limit": 10 }',
      toolOutput: '{ "results": 10, "status": "success" }',
      duration: 1234,
    },
  },
  {
    id: "4",
    agentId: "2",
    type: "message",
    content:
      "Successfully retrieved 10 relevant documents on AI market trends. Key findings include a 40% YoY growth in enterprise AI adoption and emerging focus on agent-based architectures.",
    timestamp: new Date(Date.now() - 45000),
  },
  {
    id: "5",
    agentId: "1",
    type: "tool_call",
    content: "Delegating analysis task to specialized agent",
    timestamp: new Date(Date.now() - 40000),
    metadata: {
      toolName: "delegate_task",
      toolInput: '{ "agent": "Data Analyst", "task": "analyze_findings" }',
      duration: 89,
    },
  },
  {
    id: "6",
    agentId: "3",
    type: "reasoning",
    content:
      "Processing research findings through statistical analysis pipeline. Identifying correlations and anomalies in the dataset...",
    timestamp: new Date(Date.now() - 35000),
  },
  {
    id: "7",
    agentId: "1",
    type: "message",
    content:
      "Analysis complete. The orchestration has identified 3 key market opportunities with high confidence scores. Preparing comprehensive summary for presentation.",
    timestamp: new Date(Date.now() - 20000),
  },
];

export const mockLogs: LogEntry[] = [
  {
    id: "1",
    level: "info",
    message: "Session initialized with 5 active agents",
    timestamp: new Date(Date.now() - 65000),
    source: "orchestrator",
  },
  {
    id: "2",
    level: "info",
    message: "Agent pool connected to execution runtime",
    timestamp: new Date(Date.now() - 64000),
    source: "runtime",
  },
  {
    id: "3",
    level: "success",
    message: "Orchestrator Prime status changed to RUNNING",
    timestamp: new Date(Date.now() - 60000),
    source: "agent:1",
  },
  {
    id: "4",
    level: "info",
    message: "Task queue initialized with priority scheduling",
    timestamp: new Date(Date.now() - 58000),
    source: "scheduler",
  },
  {
    id: "5",
    level: "success",
    message: "Research Agent activated for data collection",
    timestamp: new Date(Date.now() - 55000),
    source: "agent:2",
  },
  {
    id: "6",
    level: "warning",
    message: "Rate limit approaching for external API calls (85%)",
    timestamp: new Date(Date.now() - 48000),
    source: "api_gateway",
    details: "Consider implementing request batching",
  },
  {
    id: "7",
    level: "info",
    message: "web_search tool invoked with 10 result limit",
    timestamp: new Date(Date.now() - 50000),
    source: "tools",
  },
  {
    id: "8",
    level: "success",
    message: "Web search completed in 1234ms",
    timestamp: new Date(Date.now() - 49000),
    source: "tools",
  },
  {
    id: "9",
    level: "info",
    message: "Task delegation initiated to Data Analyst",
    timestamp: new Date(Date.now() - 40000),
    source: "orchestrator",
  },
  {
    id: "10",
    level: "warning",
    message: "Memory usage at 72% - monitoring threshold",
    timestamp: new Date(Date.now() - 30000),
    source: "system",
    details: "Current: 5.8GB / 8GB allocated",
  },
  {
    id: "11",
    level: "success",
    message: "Analysis pipeline completed successfully",
    timestamp: new Date(Date.now() - 22000),
    source: "agent:3",
  },
  {
    id: "12",
    level: "info",
    message: "Results cached for future reference",
    timestamp: new Date(Date.now() - 20000),
    source: "cache",
  },
];
