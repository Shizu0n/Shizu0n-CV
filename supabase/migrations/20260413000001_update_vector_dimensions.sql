-- Remove a tabela antiga com 768 dimensões e suas policies/funções dependentes
drop function if exists match_chunks;
drop table if exists chunks cascade;

-- Recria a tabela com as 3072 dimensões que o gemini-embedding-001 exige
create table chunks (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(3072)
);

-- Recria a função de busca
create or replace function match_chunks (
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    chunks.id,
    chunks.content,
    chunks.metadata,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  where 1 - (chunks.embedding <=> query_embedding) > match_threshold
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- Aplica a segurança novamente
alter table chunks enable row level security;

create policy "Service role full access"
on chunks
to service_role
using (true)
with check (true);
