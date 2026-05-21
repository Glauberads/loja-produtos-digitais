CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID, -- For future multi-tenant support
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category TEXT NOT NULL, -- Kept for legacy/simplicity as requested in setup-db
  short_description TEXT,
  long_description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  sales_count INTEGER DEFAULT 0,
  badge TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  tech_stack JSONB DEFAULT '[]'::jsonb,
  gradient TEXT,
  icon_name TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);
