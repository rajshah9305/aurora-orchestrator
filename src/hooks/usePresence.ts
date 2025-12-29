import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PresenceUser {
  id: string;
  userIdentifier: string;
  userName: string;
  userColor: string;
  activeAgentId: string | null;
  lastSeen: Date;
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

const getUserIdentifier = (): string => {
  let id = localStorage.getItem('user_identifier');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('user_identifier', id);
  }
  return id;
};

const getUserName = (): string => {
  return localStorage.getItem('user_name') || 'Anonymous';
};

export function usePresence(activeAgentId: string | null) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const userIdentifier = getUserIdentifier();
  const userName = getUserName();
  const userColor = localStorage.getItem('user_color') || getRandomColor();

  // Save color if not set
  useEffect(() => {
    if (!localStorage.getItem('user_color')) {
      localStorage.setItem('user_color', userColor);
    }
  }, [userColor]);

  const updatePresence = useCallback(async () => {
    const { data, error } = await supabase
      .from('user_presence')
      .upsert({
        user_identifier: userIdentifier,
        user_name: userName,
        user_color: userColor,
        active_agent_id: activeAgentId,
        last_seen: new Date().toISOString(),
      }, { onConflict: 'user_identifier' })
      .select()
      .single();

    if (!error && data) {
      setCurrentUserId(data.id);
    }
  }, [userIdentifier, userName, userColor, activeAgentId]);

  const fetchPresence = useCallback(async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('user_presence')
      .select('*')
      .gte('last_seen', fiveMinutesAgo);

    if (error) {
      console.error('Error fetching presence:', error);
    } else {
      setUsers((data || []).map(row => ({
        id: row.id,
        userIdentifier: row.user_identifier,
        userName: row.user_name,
        userColor: row.user_color,
        activeAgentId: row.active_agent_id,
        lastSeen: new Date(row.last_seen),
      })));
    }
  }, []);

  useEffect(() => {
    updatePresence();
    fetchPresence();

    // Update presence every 30 seconds
    const presenceInterval = setInterval(updatePresence, 30000);
    
    // Fetch presence every 10 seconds
    const fetchInterval = setInterval(fetchPresence, 10000);

    // Subscribe to realtime changes
    const channel = supabase
      .channel('presence-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_presence' },
        () => {
          fetchPresence();
        }
      )
      .subscribe();

    return () => {
      clearInterval(presenceInterval);
      clearInterval(fetchInterval);
      supabase.removeChannel(channel);
    };
  }, [updatePresence, fetchPresence]);

  // Update when active agent changes
  useEffect(() => {
    updatePresence();
  }, [activeAgentId, updatePresence]);

  const setUserName = (name: string) => {
    localStorage.setItem('user_name', name);
    updatePresence();
  };

  const otherUsers = users.filter(u => u.userIdentifier !== userIdentifier);

  return {
    users,
    otherUsers,
    currentUserId,
    userIdentifier,
    userName,
    userColor,
    setUserName,
    refetch: fetchPresence,
  };
}
