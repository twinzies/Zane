-- Migration date: 2026-08-31

-- A Tabular Review is a durable record of work already performed. Deleting the
-- source file from the Library, or deleting a project that held it, used to
-- cascade into the generated results and destroy them. Retain the rows, the
-- cells and the row/document membership instead, and let the application render
-- the document as deleted.

-- Generated cells survive the loss of their document.
alter table public.tabular_cells
  drop constraint if exists tabular_cells_document_id_fkey;
alter table public.tabular_cells
  add constraint tabular_cells_document_id_fkey
  foreign key (document_id)
  references public.documents(id)
  on delete set null;

-- Row/document membership must outlive the document so a folder row can still
-- list a deleted child. Snapshot the filename at the same time: it is the only
-- copy of the name once the document and its versions are gone.
alter table public.tabular_review_row_sources
  add column if not exists document_filename text;

update public.tabular_review_row_sources as src
set document_filename = coalesce(nullif(trim(dv.filename), ''), 'Untitled document')
from public.documents d
  join public.document_versions dv
    on dv.id = d.current_version_id
   and dv.deleted_at is null
where src.document_id = d.id
  and src.document_filename is null;

-- document_id becomes nullable, so it can no longer carry the primary key.
alter table public.tabular_review_row_sources
  add column if not exists id uuid not null default gen_random_uuid();

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'tabular_review_row_sources_pkey'
      and conrelid = 'public.tabular_review_row_sources'::regclass
      and array_length(conkey, 1) = 2
  ) then
    alter table public.tabular_review_row_sources
      drop constraint tabular_review_row_sources_pkey;
    alter table public.tabular_review_row_sources
      add constraint tabular_review_row_sources_pkey primary key (id);
  end if;
end;
$$;

create unique index if not exists tabular_review_row_sources_row_document_idx
  on public.tabular_review_row_sources(row_id, document_id);

alter table public.tabular_review_row_sources
  alter column document_id drop not null;

alter table public.tabular_review_row_sources
  drop constraint if exists tabular_review_row_sources_document_id_fkey;
alter table public.tabular_review_row_sources
  add constraint tabular_review_row_sources_document_id_fkey
  foreign key (document_id)
  references public.documents(id)
  on delete set null;
