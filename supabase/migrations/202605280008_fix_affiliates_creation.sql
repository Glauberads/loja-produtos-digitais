-- 202605280008_fix_affiliates_creation.sql

-- Torna user_id opcional, pois agora vamos permitir criar afiliados diretamente com nome e email
ALTER TABLE affiliates 
  ALTER COLUMN user_id DROP NOT NULL;

-- Adiciona os campos de contato direto no afiliado
ALTER TABLE affiliates 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Atualiza a view de analytics (RPC get_dashboard_charts) para buscar o nome do próprio affiliate, 
-- já que u.full_name não existe e causava erro se fosse referenciado no admin_users
CREATE OR REPLACE FUNCTION get_dashboard_charts(
  p_tenant_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
) RETURNS JSONB AS $$
DECLARE
  v_products JSONB;
  v_affiliates JSONB;
  v_utms JSONB;
BEGIN
  -- Top Produtos
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_products
  FROM (
    SELECT p.name, SUM(o.amount) as revenue, COUNT(*) as sales
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.tenant_id = p_tenant_id AND o.status = 'approved' AND o.created_at >= p_start_date AND o.created_at <= p_end_date
    GROUP BY p.id, p.name
    ORDER BY revenue DESC
    LIMIT 5
  ) t;

  -- Top Afiliados
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_affiliates
  FROM (
    SELECT a.code, COALESCE(a.name, a.email, 'Desconhecido') as full_name, SUM(o.amount) as revenue, COUNT(*) as sales
    FROM orders o
    JOIN affiliates a ON o.affiliate_id = a.id
    WHERE o.tenant_id = p_tenant_id AND o.status = 'approved' AND o.created_at >= p_start_date AND o.created_at <= p_end_date
    GROUP BY a.id, a.code, a.name, a.email
    ORDER BY revenue DESC
    LIMIT 5
  ) t;

  -- Top UTMs com Custo e ROAS
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO v_utms
  FROM (
    SELECT 
      COALESCE(o.utm_campaign, 'orgânico') as campaign,
      SUM(o.amount) as revenue,
      COUNT(*) as sales,
      COALESCE((
        SELECT SUM(cost) 
        FROM campaign_costs c 
        WHERE c.utm_campaign = COALESCE(o.utm_campaign, 'orgânico') 
          AND c.tenant_id = p_tenant_id 
          AND c.date >= p_start_date::date 
          AND c.date <= p_end_date::date
      ), 0) as cost
    FROM orders o
    WHERE o.tenant_id = p_tenant_id AND o.status = 'approved' AND o.created_at >= p_start_date AND o.created_at <= p_end_date
    GROUP BY o.utm_campaign
    ORDER BY revenue DESC
    LIMIT 10
  ) t;

  RETURN jsonb_build_object(
    'top_products', v_products,
    'top_affiliates', v_affiliates,
    'top_utms', v_utms
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
