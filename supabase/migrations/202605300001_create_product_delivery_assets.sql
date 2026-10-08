-- 1. Create table
CREATE TABLE IF NOT EXISTS product_delivery_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_drive', 'mega', 's3', 'supabase_storage', 'external')),
  delivery_url TEXT NOT NULL CHECK (delivery_url LIKE 'https://%'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_by UUID
);

-- 2. Constraints and Indexes
-- Ensure only one delivery asset per product (we can upsert based on product_id)
CREATE UNIQUE INDEX IF NOT EXISTS product_delivery_assets_product_id_idx ON product_delivery_assets(product_id);

-- 3. RLS and Grants
-- Revoke all access from standard roles to enforce server-side access only
REVOKE ALL ON product_delivery_assets FROM anon, authenticated;
-- Ensure service_role has full access
GRANT ALL ON product_delivery_assets TO service_role;

ALTER TABLE product_delivery_assets ENABLE ROW LEVEL SECURITY;

-- No policies are created for anon or authenticated.
-- This guarantees that the table can ONLY be queried or modified 
-- using the service_role key (which bypasses RLS).

-- 4. Triggers
-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_product_delivery_assets_updated_at
BEFORE UPDATE ON product_delivery_assets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
