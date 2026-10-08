-- Initial PrintFlow schema for the MVP.
-- Sample shops and their listed prices are demo data, not real business listings.

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) > 0),
  location text,
  price_per_page numeric(10, 2) check (price_per_page is null or price_per_page >= 0),
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique check (length(trim(order_number)) > 0),
  pickup_code text not null check (length(trim(pickup_code)) > 0),
  shop_id uuid references public.shops (id) on delete restrict,
  file_name text not null check (length(trim(file_name)) > 0),
  copies integer check (copies is null or copies > 0),
  color_mode text check (color_mode is null or color_mode in ('colour', 'bw')),
  print_side text check (print_side is null or print_side in ('single', 'double')),
  paper_size text check (paper_size is null or paper_size in ('A4', 'A3')),
  estimated_price numeric(10, 2) check (estimated_price is null or estimated_price >= 0),
  status text not null default 'Received' check (length(trim(status)) > 0),
  created_at timestamptz not null default now()
);

create index orders_shop_id_idx on public.orders (shop_id);
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);
create index orders_pickup_code_idx on public.orders (pickup_code);

alter table public.shops enable row level security;
alter table public.orders enable row level security;

-- No client policies are created yet. With RLS enabled, client access remains
-- denied until the app's access model is defined.

insert into public.shops (name, location, price_per_page)
values
  ('Osu Print Studio', 'Oxford Street, Osu', 1.50),
  ('Legon Copy Hub', 'University of Ghana, Legon', 1.50),
  ('Madina Quick Prints', 'Atomic Junction, Madina', 1.50)
on conflict (name) do update
set location = excluded.location,
    price_per_page = excluded.price_per_page;
