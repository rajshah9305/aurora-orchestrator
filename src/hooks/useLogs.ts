import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LogEntry } from "@/types/agent";

export function useLogs(retentionLimit: number = 100) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('logs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'log_entries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newLog = mapDbToLog(payload.new);
            setLogs(prev => [...prev.slice(-retentionLimit + 1), newLog]);
          } else if (payload.eventType === 'DELETE') {
            if (!payload.old.id) {
              setLogs([]);
            } else {
              setLogs(prev => prev.filter(l => l.id !== payload.old.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [retentionLimit]);

  const mapDbToLog = (row: Record<string, unknown>): LogEntry => ({
    id: row.id as string,
    level: row.level as LogEntry['level'],
    message: row.message as string,
    timestamp: new Date(row.created_at as string),
    source: row.source as string | undefined,
    details: row.details as string | undefined,
  });

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('log_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(retentionLimit);

    if (error) {
      console.error('Error fetching logs:', error);
    } else {
      setLogs((data || []).map(mapDbToLog).reverse());
    }
    setLoading(false);
  };

  const addLog = async (log: Omit<LogEntry, "id" | "timestamp">) => {
    const { data, error } = await supabase
      .from('log_entries')
      .insert({
        level: log.level,
        message: log.message,
        source: log.source || null,
        details: log.details || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding log:', error);
      throw error;
    }
    return mapDbToLog(data);
  };

  const clearLogs = async () => {
    const { error } = await supabase
      .from('log_entries')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Error clearing logs:', error);
      throw error;
    }
    setLogs([]);
  };

  return {
    logs,
    loading,
    addLog,
    clearLogs,
    refetch: fetchLogs,
  };
}
