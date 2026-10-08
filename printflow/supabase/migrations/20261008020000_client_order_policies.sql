-- Allow the unauthenticated MVP client to list shops and submit orders.
-- Orders remain unreadable to clients; the app displays the response from local state.

alter table public.orders
  add constraint orders_pickup_code_key unique (pickup_code);

grant select on public.shops to anon, authenticated;
grant insert on public.orders to anon, authenticated;

create policy shops_read_for_ordering
  on public.shops
  for select
  to anon, authenticated
  using (true);

create policy orders_create_from_ordering_flow
  on public.orders
  for insert
  to anon, authenticated
  with check (true);
