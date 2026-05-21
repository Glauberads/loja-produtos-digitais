CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID, -- Multi-tenant readiness
  user_id UUID, -- references auth.users if registered
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  document TEXT, -- CPF/CNPJ
  billing_address JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
