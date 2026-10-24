-- JJ Baked Goods database schema.
-- Run once in the Supabase SQL editor, then run seed.sql.
--
-- Security model: Row Level Security is ON with no policies, so the public
-- anon key can read or write nothing. The Next.js server talks to the
-- database with the service-role key, which is only ever used server-side.

create extension if not exists pgcrypto;

create table if not exists products (
  id text primary key,
  name_en text not null,
  name_es text not null,
  description_en text not null default '',
  description_es text not null default '',
  price_cents integer not null check (price_cents >= 0),
  pack_size integer not null default 1 check (pack_size >= 1),
  flavors jsonb not null default '[]'::jsonb,
  image text not null default '',
  sort integer not null default 0,
  active boolean not null default true,
  sold_out boolean not null default false
);

create table if not exists settings (
  id integer primary key default 1 check (id = 1),
  data jsonb not null
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'ready', 'picked_up', 'cancelled')),
  bake_date date not null,
  pickup_window text not null,
  customer_name text not null,
  phone text not null,
  email text,
  notes text,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  lang text not null default 'en'
);
create index if not exists orders_bake_date_idx on orders (bake_date);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders (id) on delete cascade,
  product_id text not null,
  name text not null,
  packs integer not null check (packs > 0),
  pack_size integer not null,
  flavors jsonb,
  unit_price_cents integer not null,
  line_total_cents integer not null
);
create index if not exists order_items_order_idx on order_items (order_id);

create table if not exists custom_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'quoted', 'done', 'declined')),
  name text not null,
  phone text not null,
  email text,
  event_date date,
  quantity text,
  details text not null,
  lang text not null default 'en'
);

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact text not null unique,
  lang text not null default 'en'
);

alter table products enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table custom_requests enable row level security;
alter table subscribers enable row level security;

-- Places an order atomically. A per-bake-day lock makes the capacity check and
-- the insert one step, so two customers can't both take the last spot.
create or replace function place_order(p_order jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_date date := (p_order->>'bake_date')::date;
  v_max integer;
  v_count integer;
  v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('bake_day:' || v_date::text));

  select coalesce((data->>'maxOrdersPerDay')::integer, 0) into v_max from settings where id = 1;
  select count(*) into v_count from orders where bake_date = v_date and status <> 'cancelled';
  if v_count >= v_max then
    return jsonb_build_object('error', 'full');
  end if;

  insert into orders (code, bake_date, pickup_window, customer_name, phone, email, notes, subtotal_cents, lang)
  values (
    p_order->>'code',
    v_date,
    p_order->>'pickup_window',
    p_order->>'customer_name',
    p_order->>'phone',
    nullif(p_order->>'email', ''),
    nullif(p_order->>'notes', ''),
    (p_order->>'subtotal_cents')::integer,
    coalesce(p_order->>'lang', 'en')
  )
  returning id into v_id;

  insert into order_items (order_id, product_id, name, packs, pack_size, flavors, unit_price_cents, line_total_cents)
  select
    v_id,
    x->>'product_id',
    x->>'name',
    (x->>'packs')::integer,
    (x->>'pack_size')::integer,
    case when jsonb_typeof(x->'flavors') = 'object' then x->'flavors' else null end,
    (x->>'unit_price_cents')::integer,
    (x->>'line_total_cents')::integer
  from jsonb_array_elements(p_items) as x;

  return jsonb_build_object('id', v_id);
end;
$$;

revoke all on function place_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function place_order(jsonb, jsonb) to service_role;
