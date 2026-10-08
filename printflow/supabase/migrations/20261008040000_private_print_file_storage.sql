-- Create the private document bucket used by the customer ordering flow.
insert into storage.buckets (id, name, public, allowed_mime_types)
values (
  'print-files',
  'print-files',
  false,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/tiff',
    'image/x-tiff',
    'application/x-tiff',
    'image/bmp',
    'image/x-ms-bmp'
  ]::text[]
)
on conflict (id) do update
set public = false,
    allowed_mime_types = excluded.allowed_mime_types;

-- The unauthenticated MVP may upload a new file but cannot read, list, update,
-- or delete objects from the private bucket.
create policy print_files_allow_anon_upload
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'print-files');

alter table public.orders
  add column file_path text
  check (file_path is null or length(trim(file_path)) > 0);
