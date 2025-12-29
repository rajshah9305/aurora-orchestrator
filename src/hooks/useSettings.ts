import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppSettings } from "@/components/dashboard/modals/SettingsSheet";

const getUserIdentifier = (): string => {
  let id = localStorage.getItem('user_identifier');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('user_identifier', id);
  }
  return id;
};

export const defaultSettings: AppSettings = {
  theme: "system",
  autoScroll: true,
  soundEnabled: false,
  notificationsEnabled: true,
  aiModel: "gemini-2.5-flash",
  refreshInterval: 5,
  logRetention: 100,
};

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const userIdentifier = getUserIdentifier();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_identifier', userIdentifier)
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
    } else if (data) {
      setSettingsState({
        theme: data.theme as AppSettings['theme'],
        autoScroll: data.auto_scroll,
        soundEnabled: false,
        notificationsEnabled: true,
        aiModel: data.ai_model,
        refreshInterval: data.refresh_interval,
        logRetention: data.log_retention,
      });
    }
    setLoading(false);
  }, [userIdentifier]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (newSettings: AppSettings) => {
    setSettingsState(newSettings);
    
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_identifier: userIdentifier,
        theme: newSettings.theme,
        auto_scroll: newSettings.autoScroll,
        ai_model: newSettings.aiModel,
        refresh_interval: newSettings.refreshInterval,
        log_retention: newSettings.logRetention,
      }, { onConflict: 'user_identifier' });

    if (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  return {
    settings,
    loading,
    saveSettings,
    refetch: fetchSettings,
  };
}
