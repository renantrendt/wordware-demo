-- Adicionar coluna de sentimento
alter table companies
  add column if not exists sentiment text;
