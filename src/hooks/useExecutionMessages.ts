import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ExecutionMessage } from "@/types/agent";

export function useExecutionMessages() {
  const [messages, setMessages] = useState<ExecutionMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'execution_messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = mapDbToMessage(payload.new);
            setMessages(prev => [...prev, newMessage]);
          } else if (payload.eventType === 'DELETE') {
            // Handle bulk delete (clear all)
            if (!payload.old.id) {
              setMessages([]);
            } else {
              setMessages(prev => prev.filter(m => m.id !== payload.old.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const mapDbToMessage = (row: Record<string, unknown>): ExecutionMessage => ({
    id: row.id as string,
    agentId: row.agent_id as string,
    type: row.type as ExecutionMessage['type'],
    content: row.content as string,
    timestamp: new Date(row.created_at as string),
    metadata: row.metadata as ExecutionMessage['metadata'],
  });

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('execution_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages((data || []).map(mapDbToMessage));
    }
    setLoading(false);
  };

  const addMessage = async (message: Omit<ExecutionMessage, "id" | "timestamp">) => {
    const { data, error } = await supabase
      .from('execution_messages')
      .insert({
        agent_id: message.agentId,
        type: message.type,
        content: message.content,
        metadata: message.metadata || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      throw error;
    }
    return mapDbToMessage(data);
  };

  const clearMessages = async () => {
    const { error } = await supabase
      .from('execution_messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Error clearing messages:', error);
      throw error;
    }
    setMessages([]);
  };

  // For streaming updates - update a message in local state without DB
  const updateMessageLocally = (id: string, content: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content } : m));
  };

  return {
    messages,
    loading,
    addMessage,
    clearMessages,
    updateMessageLocally,
    setMessages,
    refetch: fetchMessages,
  };
}
