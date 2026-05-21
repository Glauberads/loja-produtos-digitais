-- Insert dummy settings
INSERT INTO system_settings (key, value, description) VALUES
('site_name', '"NexusSaaS"', 'Nome global da plataforma'),
('currency', '"BRL"', 'Moeda padrão'),
('maintenance_mode', 'false', 'Ativar modo de manutenção')
ON CONFLICT (key) DO NOTHING;
