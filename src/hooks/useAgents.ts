import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Agent } from "@/types/agent";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('agents-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agents' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAgent = mapDbToAgent(payload.new);
            setAgents(prev => [...prev, newAgent]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedAgent = mapDbToAgent(payload.new);
            setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
          } else if (payload.eventType === 'DELETE') {
            setAgents(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const mapDbToAgent = (row: Record<string, unknown>): Agent => ({
    id: row.id as string,
    name: row.name as string,
    role: row.role as string,
    status: (row.status as Agent['status']) || 'idle',
    avatar: row.avatar as string | undefined,
    lastActive: row.last_active ? new Date(row.last_active as string) : undefined,
  });

  const fetchAgents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching agents:', error);
    } else {
      setAgents((data || []).map(mapDbToAgent));
    }
    setLoading(false);
  };

  const createAgent = async (data: Omit<Agent, "id" | "status" | "lastActive">) => {
    const { data: newAgent, error } = await supabase
      .from('agents')
      .insert({ 
        name: data.name, 
        role: data.role, 
        status: 'idle',
        last_active: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
    return mapDbToAgent(newAgent);
  };

  const updateAgent = async (id: string, data: Partial<Agent>) => {
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.status) updateData.status = data.status;
    if (data.avatar) updateData.avatar = data.avatar;
    if (data.lastActive) updateData.last_active = data.lastActive.toISOString();

    const { error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  };

  const deleteAgent = async (id: string) => {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  };

  const startAgent = async (id: string) => {
    await updateAgent(id, { status: 'running', lastActive: new Date() });
  };

  const stopAgent = async (id: string) => {
    await updateAgent(id, { status: 'idle' });
  };

  return {
    agents,
    loading,
    createAgent,
    updateAgent,
    deleteAgent,
    startAgent,
    stopAgent,
    refetch: fetchAgents,
  };
}
