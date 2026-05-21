-- Insert default categories
INSERT INTO categories (slug, name, description, active) VALUES
('whatsapp', 'WhatsApp', 'Ferramentas para WhatsApp', true),
('ia', 'IA', 'Inteligência Artificial', true),
('saas', 'SaaS', 'Softwares como Serviço', true),
('crm', 'CRM', 'Gestão de Relacionamento', true),
('dashboard', 'Dashboard', 'Painéis Administrativos', true),
('automacao', 'Automação', 'Automação de processos', true),
('agencia', 'Agência', 'Ferramentas para agências', true),
('financeiro', 'Financeiro', 'Sistemas financeiros', true),
('landing-pages', 'Landing Pages', 'Páginas de alta conversão', true),
('e-commerce', 'E-commerce', 'Lojas virtuais', true),
('delivery', 'Delivery', 'Sistemas de entrega', true)
ON CONFLICT (slug) DO NOTHING;
