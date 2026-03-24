-- İlanYaz.ai — Supabase Veritabanı Şeması
-- Bu dosyayı Supabase Dashboard > SQL Editor'da çalıştırın

-- Kullanıcılar tablosu
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  phone text,
  plan text default 'free' check (plan in ('free', 'registered', 'pro', 'enterprise')),
  usage_count integer default 0,
  usage_reset_at timestamp with time zone,
  stripe_customer_id text,
  created_at timestamp with time zone default now()
);

-- İlan geçmişi tablosu
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  sector text not null check (sector in ('emlak', 'galeri')),
  input_data jsonb not null,
  output_sahibinden text,
  output_hepsiemlak text,
  output_whatsapp text,
  output_instagram text,
  created_at timestamp with time zone default now()
);

-- Abonelikler tablosu
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  stripe_subscription_id text unique,
  plan text not null,
  status text not null,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS) aktif et
alter table users enable row level security;
alter table listings enable row level security;
alter table subscriptions enable row level security;

-- RLS Politikaları

-- Kullanıcılar: sadece kendi verisini okuyabilir/güncelleyebilir
create policy "users_select_own" on users
  for select using (auth.uid() = id);

create policy "users_update_own" on users
  for update using (auth.uid() = id);

-- İlanlar: sadece kendi ilanlarını görebilir
create policy "listings_select_own" on listings
  for select using (auth.uid() = user_id);

create policy "listings_insert_own" on listings
  for insert with check (auth.uid() = user_id);

-- Abonelikler: sadece kendi aboneliğini görebilir
create policy "subscriptions_select_own" on subscriptions
  for select using (auth.uid() = user_id);

-- Service role politikaları (backend için)
create policy "service_role_users_all" on users
  for all using (auth.role() = 'service_role');

create policy "service_role_listings_all" on listings
  for all using (auth.role() = 'service_role');

create policy "service_role_subscriptions_all" on subscriptions
  for all using (auth.role() = 'service_role');

-- İndeksler
create index if not exists listings_user_id_idx on listings(user_id);
create index if not exists listings_created_at_idx on listings(created_at desc);
create index if not exists subscriptions_user_id_idx on subscriptions(user_id);
create index if not exists users_stripe_customer_id_idx on users(stripe_customer_id);

-- Kullanım sayacını artıran RPC fonksiyonu (backend'den çağrılır)
create or replace function increment_usage(user_id uuid)
returns void as $$
  update users
  set usage_count = usage_count + 1
  where id = user_id;
$$ language sql security definer;
