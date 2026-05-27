-- 202605280009_create_member_area_settings.sql

CREATE TABLE IF NOT EXISTS member_area_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
    title TEXT DEFAULT 'Minha Área',
    subtitle TEXT DEFAULT 'Acesse seus produtos',
    welcome_text TEXT,
    banner_url TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#FF6A00',
    secondary_color TEXT DEFAULT '#3B82F6',
    support_whatsapp TEXT,
    support_link TEXT,
    button_text TEXT DEFAULT 'Acessar Produto',
    custom_notice TEXT,
    show_downloads BOOLEAN DEFAULT true,
    show_products BOOLEAN DEFAULT true,
    show_support BOOLEAN DEFAULT true,
    show_orders BOOLEAN DEFAULT true,
    layout_config JSONB DEFAULT '{}'::jsonb,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_member_area_settings_tenant_id ON member_area_settings(tenant_id);

-- Trigger para updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_member_area_settings_updated_at') THEN
        CREATE TRIGGER trigger_member_area_settings_updated_at
            BEFORE UPDATE ON member_area_settings
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at_column();
    END IF;
END $$;

-- Row Level Security
ALTER TABLE member_area_settings ENABLE ROW LEVEL SECURITY;

-- Select é liberado para todos (pois a página precisa carregar a interface antes mesmo de logar)
CREATE POLICY "Public Select on Member Area Settings" 
    ON member_area_settings FOR SELECT 
    USING (true);

-- Update e Insert liberados apenas para admins (service_role no servidor ou usuarios com role admin)
CREATE POLICY "Admin Insert Member Area Settings" 
    ON member_area_settings FOR INSERT 
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Admin Update Member Area Settings" 
    ON member_area_settings FOR UPDATE 
    USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
