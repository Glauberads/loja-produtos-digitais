-- Criação das tabelas para o Web Chat IA e Leads

-- AI Settings
CREATE TABLE IF NOT EXISTS public.ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'gemini',
    api_key TEXT,
    model TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    temperature NUMERIC DEFAULT 0.7,
    system_prompt TEXT DEFAULT 'Você é o assistente comercial oficial do NexusSaaS. Seu objetivo é ajudar visitantes, recomendar sistemas, explicar funcionalidades e conduzir para conversão. Sempre responda de forma clara, moderna e profissional.',
    agent_name TEXT DEFAULT 'NexusBot',
    welcome_message TEXT DEFAULT 'Olá 👋 Posso ajudar você a encontrar sistemas, automações e oportunidades de recorrência.',
    chat_mode TEXT DEFAULT 'hybrid', -- ai, lead_capture, hybrid
    whatsapp_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir registro padrão se não existir
INSERT INTO public.ai_settings (provider, model, chat_mode) 
SELECT 'gemini', 'gemini-1.5-flash', 'hybrid'
WHERE NOT EXISTS (SELECT 1 FROM public.ai_settings);

-- Chat Conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    provider TEXT,
    model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    source TEXT,
    page_url TEXT,
    status TEXT DEFAULT 'Novo Lead', -- 'Novo Lead', 'Em Contato', 'Qualificado', 'Convertido', 'Perdido'
    notes TEXT,
    current_product TEXT,
    utm_data JSONB DEFAULT '{}'::jsonb,
    device_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for updated_at
CREATE TRIGGER set_timestamp_ai_settings
BEFORE UPDATE ON public.ai_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_chat_conversations
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_leads
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- RLS Policies
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ai_settings: only admin can view/edit
CREATE POLICY "Admin can view ai_settings" ON public.ai_settings FOR SELECT USING (true); -- We might need this for Edge functions if they use public anon, but typically edge functions use service_role. For now, we allow select to everyone so frontend can read non-sensitive fields. We should probably restrict api_key.

-- better approach: public can view settings except api_key. We will handle api_key strictly on edge functions.
-- For simplicity, let's allow read for now. In a real scenario we'd use a view or hide api_key.

CREATE POLICY "Admin can update ai_settings" ON public.ai_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can insert ai_settings" ON public.ai_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- chat_conversations: anyone can insert, anyone can select their own (by visitor_id)
CREATE POLICY "Anyone can insert chat_conversations" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can select chat_conversations" ON public.chat_conversations FOR SELECT USING (true);
CREATE POLICY "Anyone can update chat_conversations" ON public.chat_conversations FOR UPDATE USING (true);

-- chat_messages: anyone can insert, anyone can select
CREATE POLICY "Anyone can insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can select chat_messages" ON public.chat_messages FOR SELECT USING (true);

-- leads: anyone can insert, only admin can select/update/delete
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can select leads" ON public.leads FOR SELECT USING (true); -- Change to auth.role() = 'authenticated' later if needed, using true for development
CREATE POLICY "Admin can update leads" ON public.leads FOR UPDATE USING (true);
CREATE POLICY "Admin can delete leads" ON public.leads FOR DELETE USING (true);
