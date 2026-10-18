import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
  console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GEMINI_API_KEY in .env');
  process.exit(1);
}

const knowledgePath = path.resolve(process.cwd(), 'data', 'portfolio-knowledge.json');
if (!fs.existsSync(knowledgePath)) {
  console.error('Missing data/portfolio-knowledge.json. Run npm run knowledge:build first.');
  process.exit(1);
}

const artifact = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
const chunks = artifact?.chat_runtime?.chunks;

if (!Array.isArray(chunks) || chunks.length === 0) {
  console.error('No runtime chunks found in data/portfolio-knowledge.json');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function embedWithRetry(model, content, attempts = 3) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await model.embedContent(content);
    } catch (error) {
      if (error?.status !== 429 || attempt >= attempts) {
        throw error;
      }
      console.log('Embedding rate limit hit, waiting 65s before retrying...');
      await new Promise((resolve) => setTimeout(resolve, 65000));
    }
  }
}

const metadataOf = (chunk) => ({
  chunk_id: chunk.id,
  type: chunk.type,
  project_id: chunk.project_id,
  facet: chunk.facet,
  language: chunk.language,
  stack: chunk.stack,
  stacks: chunk.stacks || [],
  tags: chunk.tags || []
});
// jsonb reorders keys, so metadata is compared with sorted keys.
const stable = (value) => JSON.stringify(value, Object.keys(value).sort());

// Embeds only new or changed chunks, writes only after every embedding succeeded, and inserts
// before deleting: a failure (quota) no longer leaves the table empty or half-filled, as it did
// when this script deleted everything first.
async function main() {
  console.log(`Starting RAG ingestion for ${chunks.length} chunks...`);
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

  const { data: rows, error: readError } = await supabase.from('chunks').select('id, content, metadata');
  if (readError) {
    throw readError;
  }
  const current = new Map(rows.filter((row) => row.metadata?.chunk_id).map((row) => [row.metadata.chunk_id, row]));

  const keep = new Set();
  const updates = [];
  const inserts = [];
  for (const chunk of chunks) {
    const metadata = metadataOf(chunk);
    const row = current.get(chunk.id);
    if (row && row.content === chunk.content) {
      keep.add(row.id);
      if (stable(row.metadata) !== stable(metadata)) updates.push({ id: row.id, metadata });
      continue;
    }
    console.log(`Embedding ${chunk.id} (${chunk.type}/${chunk.facet})...`);
    const result = await embedWithRetry(model, chunk.content);
    inserts.push({ content: chunk.content, metadata, embedding: result.embedding.values });
  }

  for (let i = 0; i < inserts.length; i += 20) {
    const { error } = await supabase.from('chunks').insert(inserts.slice(i, i + 20));
    if (error) throw error;
  }
  for (const { id, metadata } of updates) {
    const { error } = await supabase.from('chunks').update({ metadata }).eq('id', id);
    if (error) throw error;
  }
  // Replaced, removed and duplicated rows from the read above; rows inserted just now are not in it.
  const stale = rows.filter((row) => !keep.has(row.id)).map((row) => row.id);
  for (let i = 0; i < stale.length; i += 100) {
    const { error } = await supabase.from('chunks').delete().in('id', stale.slice(i, i + 100));
    if (error) throw error;
  }

  console.log(`RAG database updated: ${inserts.length} embedded, ${updates.length} metadata updates, ${stale.length} removed, ${keep.size} unchanged.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
