-- Create indexes for products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_org_id ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_org_id ON orders(organization_id);

-- Create indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_org_id ON customers(organization_id);

-- Create indexes for logs and analytics
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_org_id ON webhook_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_org_id ON analytics(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
