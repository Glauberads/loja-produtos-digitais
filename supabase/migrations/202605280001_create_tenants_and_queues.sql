-- 1. Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. Insert a default tenant (for existing data)
INSERT INTO tenants (id, name) VALUES ('00000000-0000-0000-0000-000000000000', 'NexusSaaS Default Workspace') ON CONFLICT DO NOTHING;

-- 3. Add tenant_id to existing tables
-- We use the default tenant ID for existing rows
ALTER TABLE IF EXISTS admin_users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE IF EXISTS product_access ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE IF EXISTS downloads ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE IF EXISTS webhook_events ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE IF EXISTS customers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000';

-- 4. Create event_queue table for Event-Driven Architecture
CREATE TABLE IF NOT EXISTS event_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
  type TEXT NOT NULL, -- e.g., 'meta_capi_purchase', 'n8n_post_purchase', 'pix_recovery'
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  processing_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Index for fast polling of the queue
CREATE INDEX IF NOT EXISTS idx_event_queue_status_next_retry 
ON event_queue(status, next_retry_at) 
WHERE status = 'pending';

-- 5. Create audit_logs table for Observability
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
  user_id UUID, -- Optional, user who performed the action
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  trace_id TEXT, -- For tracking cross-service requests
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Add trace_id to webhook_events
ALTER TABLE IF EXISTS webhook_events ADD COLUMN IF NOT EXISTS trace_id TEXT;

-- RLS Policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service Role Full Access Tenants" ON tenants FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service Role Full Access Event Queue" ON event_queue FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service Role Full Access Audit Logs" ON audit_logs FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
