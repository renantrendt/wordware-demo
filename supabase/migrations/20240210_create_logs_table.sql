create table if not exists logs (
  id uuid default gen_random_uuid() primary key,
  timestamp timestamptz default now(),
  source text not null,
  event_type text not null,
  payload jsonb not null
);

-- Enable realtime for the logs table
alter publication supabase_realtime add table logs;

-- Create index for faster searches
create index if not exists idx_logs_timestamp on logs(timestamp desc);
create index if not exists idx_logs_source on logs(source);
create index if not exists idx_logs_event_type on logs(event_type);
