-- 202605280006_analytics_and_roas.sql
-- FASE 3: Dashboard Analytics Avançado (RPCs)

-- 1. Tabela: campaign_costs
CREATE TABLE IF NOT EXISTS campaign_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) DEFAULT '00000000-0000-0000-0000-000000000000',
    utm_campaign TEXT NOT NULL,
    date DATE NOT NULL,
    cost NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, utm_campaign, date)
);

CREATE INDEX IF NOT EXISTS idx_campaign_costs_tenant_date ON campaign_costs(tenant_id, date);
ALTER TABLE campaign_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Full Access Campaign Costs" ON campaign_costs FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');


-- 2. RPC: get_dashboard_metrics
-- Retorna os KPIs principais agregados
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
  p_tenant_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_total_revenue NUMERIC := 0;
  v_approved_orders INT := 0;
  v_total_orders INT := 0;
  v_pix_abandonment INT := 0;
  v_bump_revenue NUMERIC := 0;
  v_pending_commissions NUMERIC := 0;
  v_conversion_rate NUMERIC := 0;
BEGIN
  -- Vendas aprovadas e receita
  SELECT 
    COALESCE(SUM(amount), 0),
    COUNT(*)
  INTO v_total_revenue, v_approved_orders
  FROM orders 
  WHERE tenant_id = p_tenant_id AND status = 'approved' AND created_at >= p_start_date AND created_at <= p_end_date;

  -- Bump revenue (soma do bump dos pedidos aprovados)
  SELECT COALESCE(SUM(order_bump_amount), 0)
  INTO v_bump_revenue
  FROM orders
  WHERE tenant_id = p_tenant_id AND status = 'approved' AND order_bump_id IS NOT NULL AND created_at >= p_start_date AND created_at <= p_end_date;

  -- Total pedidos iniciados
  SELECT COUNT(*) INTO v_total_orders
  FROM orders
  WHERE tenant_id = p_tenant_id AND created_at >= p_start_date AND created_at <= p_end_date;

  -- Abandono (pendentes/expirados)
  SELECT COUNT(*) INTO v_pix_abandonment
  FROM orders
  WHERE tenant_id = p_tenant_id AND status IN ('pending', 'expired', 'canceled', 'failed') AND created_at >= p_start_date AND created_at <= p_end_date;

  -- Comissões pendentes (apenas saldo global pendente, sem filtro de data)
  SELECT COALESCE(SUM(amount), 0) INTO v_pending_commissions
  FROM commissions
  WHERE tenant_id = p_tenant_id AND status = 'pending';

  -- Taxa de conversão real
  IF v_total_orders > 0 THEN
    v_conversion_rate := ROUND((v_approved_orders::NUMERIC / v_total_orders::NUMERIC) * 100, 2);
  END IF;

  v_result := jsonb_build_object(
    'total_revenue', v_total_revenue,
    'approved_orders', v_approved_orders,
    'total_orders', v_total_orders,
    'average_ticket', CASE WHEN v_approved_orders > 0 THEN ROUND(v_total_revenue / v_approved_orders, 2) ELSE 0 END,
    'pix_abandonment', v_pix_abandonment,
    'bump_revenue', v_bump_revenue,
    'pending_commissions', v_pending_commissions,
    'conversion_rate', v_conversion_rate
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. RPC: get_dashboard_charts
-- Retorna os dados para gráficos: Top Produtos, Top Afiliados, Top UTMs c/ Custo e ROAS
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
    SELECT a.code, u.full_name, SUM(o.amount) as revenue, COUNT(*) as sales
    FROM orders o
    JOIN affiliates a ON o.affiliate_id = a.id
    JOIN admin_users u ON a.user_id = u.id
    WHERE o.tenant_id = p_tenant_id AND o.status = 'approved' AND o.created_at >= p_start_date AND o.created_at <= p_end_date
    GROUP BY a.id, a.code, u.full_name
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
