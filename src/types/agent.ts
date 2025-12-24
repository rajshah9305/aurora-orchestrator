export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  avatar?: string;
  lastActive?: Date;
}

export interface ExecutionMessage {
  id: string;
  agentId: string;
  type: 'message' | 'tool_call' | 'reasoning' | 'error' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    toolName?: string;
    toolInput?: string;
    toolOutput?: string;
    duration?: number;
  };
}

export interface LogEntry {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  source?: string;
  details?: string;
}
