-- Ativando extensão pgvector
create extension if not exists vector;

-- Tabela de fragmentos textuais (chunks) para armazenar contexto do portfólio
create table chunks (
  id bigserial primary key,
  content text,           -- O texto real do chunk
  metadata jsonb,         -- Metadados úteis para filtro ou contexto
  embedding vector(768)   -- Usaremos o text-embedding-004 do Gemini (768 dimensões)
);

-- Função de busca semântica (Dot / Cosine distance)
create or replace function match_chunks (
  query_embedding vector(768),
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

-- Melhores Práticas: Habilitar Row Level Security (RLS)
alter table chunks enable row level security;

-- Como só o nosso backend (que usa o service_role) vai acessar os chunks, garantimos a segurança padrão
create policy "Service role full access"
on chunks
to service_role
using (true)
with check (true);
