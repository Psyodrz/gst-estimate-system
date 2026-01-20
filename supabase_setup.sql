-- Run this in your Supabase SQL Editor

create table if not exists drafts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  data jsonb not null
);

-- Enable RLS
alter table drafts enable row level security;

-- Allow public access (or restrict as needed)
create policy "Allow public access to drafts"
on drafts for all
using (true)
with check (true);
