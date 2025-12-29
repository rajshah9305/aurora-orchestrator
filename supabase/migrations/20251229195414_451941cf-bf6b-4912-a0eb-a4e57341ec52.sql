-- Create agents table for persistent storage
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  avatar TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_settings table for persistent settings
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'system',
  auto_scroll BOOLEAN NOT NULL DEFAULT true,
  ai_model TEXT NOT NULL DEFAULT 'gpt-5',
  refresh_interval INTEGER NOT NULL DEFAULT 5,
  log_retention INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create execution_messages table for execution history
CREATE TABLE public.execution_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create log_entries table for persistent logs
CREATE TABLE public.log_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  source TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create presence table for real-time collaboration
CREATE TABLE public.user_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Anonymous',
  user_color TEXT NOT NULL DEFAULT '#3b82f6',
  active_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  cursor_position JSONB,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (dashboard is shared)
CREATE POLICY "Allow public read on agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Allow public insert on agents" ON public.agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on agents" ON public.agents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on agents" ON public.agents FOR DELETE USING (true);

CREATE POLICY "Allow public read on user_settings" ON public.user_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on user_settings" ON public.user_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on user_settings" ON public.user_settings FOR UPDATE USING (true);

CREATE POLICY "Allow public read on execution_messages" ON public.execution_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on execution_messages" ON public.execution_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on execution_messages" ON public.execution_messages FOR DELETE USING (true);

CREATE POLICY "Allow public read on log_entries" ON public.log_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert on log_entries" ON public.log_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on log_entries" ON public.log_entries FOR DELETE USING (true);

CREATE POLICY "Allow public read on user_presence" ON public.user_presence FOR SELECT USING (true);
CREATE POLICY "Allow public insert on user_presence" ON public.user_presence FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on user_presence" ON public.user_presence FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on user_presence" ON public.user_presence FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.execution_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.log_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;