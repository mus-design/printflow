-- Public MVP dashboard access. Limit anonymous updates to the order status column.
grant select on public.orders to anon, authenticated;
grant update (status) on public.orders to anon, authenticated;

create policy orders_read_for_shop_dashboard
  on public.orders
  for select
  to anon, authenticated
  using (true);

create policy orders_update_status_for_shop_dashboard
  on public.orders
  for update
  to anon, authenticated
  using (true)
  with check (status in ('Received', 'Printing', 'Ready', 'Collected'));

alter table public.orders
  add constraint orders_status_allowed_values
  check (status in ('Received', 'Printing', 'Ready', 'Collected'));
