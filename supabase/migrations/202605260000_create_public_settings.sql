CREATE TABLE IF NOT EXISTS public.public_settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

ALTER TABLE public.public_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY ""Allow public read access to public_settings""
    ON public.public_settings
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY ""Admins can manage public_settings""
    ON public.public_settings
    FOR ALL
    USING (auth.role() = 'authenticated');
