-- Print range orders (shop /shop/print): one row per paid Zeffy payment.
-- Written by ivor-core's Zeffy webhook (service role). Fulfilled by hand on wttb.co.uk
-- until the WTTB Print API is connected, then by API.

create table if not exists public.print_orders (
  id uuid primary key default gen_random_uuid(),
  zeffy_payment_id text not null unique,
  zeffy_event_id text,
  zeffy_campaign_id text,
  buyer_email text,
  buyer_name text,
  shipping_address jsonb,
  items jsonb not null default '[]'::jsonb,
  buyer_answers jsonb not null default '[]'::jsonb,
  amount_pence integer not null,
  currency text not null,
  status text not null default 'received'
    check (status in ('received', 'sent_to_wttb', 'dispatched', 'failed', 'refunded')),
  wttb_order_id text,
  tracking text,
  notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists print_orders_status_idx on public.print_orders (status, created_at);

-- Buyer names and addresses: no public access. The service role bypasses RLS.
alter table public.print_orders enable row level security;
