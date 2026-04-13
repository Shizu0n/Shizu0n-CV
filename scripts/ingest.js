import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Utilizando as variáveis de ambiente carregadas pelo runtime do Node (--env-file=.env)
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
  console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GEMINI_API_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const knowledgePath = path.resolve(process.cwd(), 'data', 'portfolio-knowledge.json');
const rawData = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));

// Semarquear os chunks baseados no JSON real
const chunks = [];

// 1. Personal Identity & Bio
const p = rawData.personal;
chunks.push({
   metadata: { type: 'identity' },
   content: `Name: ${p.name}\nRole: ${p.title}\nLocation: ${p.location}\nBio (EN): ${p.bio.en}\nBio (PT): ${p.bio.pt}\nGitHub: ${p.github}\nLinkedIn: ${p.linkedin}\nEmail: ${p.email}`
});

// 2. Education
rawData.education.forEach(ed => {
   chunks.push({
     metadata: { type: 'education' },
     content: `Education: ${ed.degree} at ${ed.institution} (${ed.period}).\nDescription (EN): ${ed.description.en}\nDescription (PT): ${ed.description.pt}`
   });
});

// 3. Projects
rawData.projects.forEach(proj => {
   chunks.push({
      metadata: { type: 'project', title: proj.name },
      content: `Project: ${proj.name}\nCategory: ${proj.category}\nStack: ${proj.stack.join(', ')}\nGitHub: ${proj.github_url}\nDescription (EN): ${proj.description.en}\nDescription (PT): ${proj.description.pt}`
   });
});

// 4. Skills & Capabilities
rawData.skills.capabilities.forEach(cap => {
   chunks.push({
      metadata: { type: 'capability', title: cap.title },
      content: `Capability: ${cap.title}\nSummary (EN): ${cap.summary.en}\nSummary (PT): ${cap.summary.pt}`
   });
});

chunks.push({
   metadata: { type: 'skills_list' },
   content: `Languages: ${rawData.skills.languages.join(', ')}\nFrameworks: ${rawData.skills.frameworks.join(', ')}\nTools: ${rawData.skills.tools.join(', ')}\nConcepts: ${rawData.skills.concepts.join(', ')}`
});

// 5. Tone & Style
const pers = rawData.personality;
chunks.push({
   metadata: { type: 'personality' },
   content: `Tone: ${pers.tone}\nValues: ${pers.values.join(', ')}\nWorking style: ${pers.working_style}`
});

async function main() {
    console.log(`🚀 Starting RAG ingestion for ${chunks.length} segments...`);
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    // Scrubbing (Delete all existing to avoid duplicates on re-run)
    console.log("Cleaning up previous data...");
    await supabase.from('chunks').delete().neq('id', -1);
    
    for (const chunk of chunks) {
       console.log(`Processing [${chunk.metadata.type}]${chunk.metadata.title ? `: ${chunk.metadata.title}` : ''}...`);
       
       const result = await model.embedContent(chunk.content);
       const embedding = result.embedding.values;

       const { error } = await supabase.from('chunks').insert({
          content: chunk.content,
          metadata: chunk.metadata,
          embedding
       });

       if (error) {
          console.error("❌ Supabase insert error:", error);
       }
    }
    console.log("\n✅ RAG Database updated successfully!");
}

main().catch(console.error);
