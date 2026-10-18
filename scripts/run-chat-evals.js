// Runs data/chatbot/evals.json against the real chat handler with the local .env keys and writes
// data/chatbot-eval-results.json. Spends free-tier quota (one answer per case, 7 s apart).
//   npm run eval:chat                        all cases, writes the results file
//   npm run eval:chat -- en-nestjs pt-personal   only these, prints without writing
import fs from 'fs';
import { pathToFileURL } from 'url';

const RESULTS_PATH = 'data/chatbot-eval-results.json';
const SPACING_MS = 7000;

// The positioning rule (CLAUDE.md): no held job title, no years of experience, no inflated claims.
const FORBIDDEN = [
  /\b(ai|ml) engineer\b/i,
  /\bsoftware engineer\b/i,
  /\bfull[- ]stack (developer|engineer)\b/i,
  /\bengenheiro de (ia|software|machine learning)\b/i,
  /\bdesenvolvedor full[- ]stack\b/i,
  /\byears of experience\b/i,
  /\banos de experi[eê]ncia\b/i,
  /\brigorous(ly)?\b/i,
  /\brigorosamente\b/i
];

const fold = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// A case passes when the answer holds every must_include term, at least one must_include_any
// term (when given) and no forbidden phrase. Terms match case- and accent-insensitively, as substrings.
export function scoreAnswer(entry, answer) {
  const text = fold(answer);
  const missing = entry.must_include.filter((term) => !text.includes(fold(term)));
  const any = entry.must_include_any || [];
  if (any.length && !any.some((term) => text.includes(fold(term)))) missing.push(`one of: ${any.join(' | ')}`);
  const forbidden = FORBIDDEN.filter((pattern) => pattern.test(answer)).map(String);
  return { pass: Boolean(answer.trim()) && !missing.length && !forbidden.length, missing, forbidden };
}

let ip = 0;
function ask(handler, messages, language) {
  return new Promise((resolve) => {
    const out = { status: 200, headers: {}, raw: '' };
    const res = {
      headersSent: false,
      setHeader(key, value) { out.headers[key.toLowerCase()] = value; },
      status(code) { out.status = code; return this; },
      json(body) { resolve({ ...out, raw: JSON.stringify(body) }); },
      write(chunk) { this.headersSent = true; out.raw += chunk; },
      end() { resolve(out); }
    };
    // A fresh address per case keeps the 10-per-minute limiter out of the run.
    handler({ method: 'POST', headers: { origin: 'http://localhost:3000', 'x-real-ip': `10.77.0.${++ip}` }, body: { messages, language }, socket: {} }, res);
  });
}

const answerOf = (raw) => raw.split('\n')
  .filter((line) => line.startsWith('data: {'))
  .map((line) => JSON.parse(line.slice(6)).text || '')
  .join('');

async function main() {
  const { default: handler } = await import('../api/chat.js');
  const evals = JSON.parse(fs.readFileSync('data/chatbot/evals.json', 'utf8'));
  const only = process.argv.slice(2);
  const cases = only.length ? evals.filter((entry) => only.includes(entry.id)) : evals;
  const results = [];

  for (const [index, entry] of cases.entries()) {
    if (index) await new Promise((resolve) => setTimeout(resolve, SPACING_MS));
    const started = Date.now();
    const messages = [...(entry.history || []), { role: 'user', content: entry.question }];
    const out = await ask(handler, messages, entry.page_language || entry.language);
    const answer = out.status === 200 ? answerOf(out.raw) : '';
    const score = scoreAnswer(entry, answer);
    results.push({ id: entry.id, ...score, status: out.status, provider: out.headers['x-ai-provider'] || null, ms: Date.now() - started, answer });
    console.log(`${score.pass ? 'PASS' : 'FAIL'} ${entry.id} (${out.headers['x-ai-provider'] || out.status}, ${Date.now() - started} ms)` +
      (score.missing.length ? ` missing: ${score.missing.join(', ')}` : '') +
      (score.forbidden.length ? ` forbidden: ${score.forbidden.join(', ')}` : ''));
  }

  const passed = results.filter((result) => result.pass).length;
  console.log(`\n${passed} of ${results.length} passed`);
  if (!only.length) {
    const providers = {};
    for (const result of results) providers[result.provider] = (providers[result.provider] || 0) + 1;
    fs.writeFileSync(RESULTS_PATH, `${JSON.stringify({ run_at: new Date().toISOString(), passed, total: results.length, providers, cases: results }, null, 2)}\n`);
    console.log(`wrote ${RESULTS_PATH}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
