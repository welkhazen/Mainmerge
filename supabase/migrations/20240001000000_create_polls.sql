create table if not exists polls (
  id text primary key,
  question text not null,
  options jsonb not null,
  locked boolean default false,
  created_at timestamptz default now()
);

alter table polls enable row level security;

create policy "Public read" on polls for select using (true);
create policy "Public insert" on polls for insert with check (true);
create policy "Public delete" on polls for delete using (true);
