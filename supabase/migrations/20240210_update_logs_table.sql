-- Adicionar colunas específicas para campos importantes
alter table logs
  add column if not exists session_id text,
  add column if not exists user_id text,
  add column if not exists user_nickname text,
  add column if not exists message_type text,
  add column if not exists message_content text,
  add column if not exists website_id text;

-- Criar índices para busca rápida
create index if not exists idx_logs_session_id on logs(session_id);
create index if not exists idx_logs_user_id on logs(user_id);
create index if not exists idx_logs_website_id on logs(website_id);
