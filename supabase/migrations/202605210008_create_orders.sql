CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID, -- Multi-tenant readiness
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Payment generic fields
  payment_provider TEXT, -- 'stripe', 'mercadopago', 'asaas', 'pix', 'manual'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  external_payment_id TEXT,
  checkout_url TEXT,
  
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'BRL',
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
