-- 202605280003_align_event_queue.sql
-- Alinhamento da tabela event_queue com o schema da Fase 1

-- 1. Adicionar novas colunas usando IF NOT EXISTS
ALTER TABLE IF EXISTS event_queue 
    ADD COLUMN IF NOT EXISTS event_type TEXT,
    ADD COLUMN IF NOT EXISTS event_name TEXT,
    ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 5,
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_error TEXT,
    ADD COLUMN IF NOT EXISTS request_id TEXT,
    ADD COLUMN IF NOT EXISTS trace_id TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Migrar dados antigos (se a coluna 'type' existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_queue' AND column_name = 'type') THEN
        UPDATE event_queue SET event_type = type WHERE event_type IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_queue' AND column_name = 'error_message') THEN
        UPDATE event_queue SET last_error = error_message WHERE last_error IS NULL;
    END IF;
END $$;

-- 3. Atualizar Constraint de Status para incluir 'dead'
-- Postgres requer remover a constraint antiga e adicionar a nova. 
-- Como não sabemos o nome exato da constraint, pegamos do catálogo e removemos.
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'event_queue'::regclass AND contype = 'c' 
    AND pg_get_constraintdef(oid) LIKE '%status%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE event_queue DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Adiciona a nova constraint
ALTER TABLE IF EXISTS event_queue 
    ADD CONSTRAINT event_queue_status_check 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead'));

-- 4. Criar Índices (Idempotentes)
CREATE INDEX IF NOT EXISTS idx_event_queue_status ON event_queue(status);
CREATE INDEX IF NOT EXISTS idx_event_queue_scheduled_at ON event_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_event_queue_tenant_id ON event_queue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_event_queue_event_type ON event_queue(event_type);

-- Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_event_queue_updated_at ON event_queue;
CREATE TRIGGER trigger_event_queue_updated_at
    BEFORE UPDATE ON event_queue
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_column();
