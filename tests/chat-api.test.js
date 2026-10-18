// Chat API logic and handler. Lives outside api/ so Vercel does not deploy it as a function.
import fs from 'fs'
import { beforeAll, describe, expect, it, vi } from 'vitest'

// Gemini Flash fails with a non-quota error, Flash-Lite answers: exercises the provider chain without network.
const calls = vi.hoisted(() => [])
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel({ model, systemInstruction }) {
      return {
        startChat: ({ history }) => ({
          async sendMessageStream() {
            calls.push({ model, history, systemInstruction })
            if (model === 'gemini-2.5-flash') throw Object.assign(new Error('Internal error'), { status: 500 })
            return { stream: (async function* () { yield { text: () => 'Hello ' }; yield { text: () => 'there.' } })() }
          },
        }),
      }
    }
  },
}))

const { default: handler, buildLocalContext, buildSystemInstruction, classifyIntent, createCanaryGuard, detectLanguage, fitInstruction, GROQ_PROMPT_CHARS, trimHistory } = await import('../api/chat.js')
const knowledge = JSON.parse(fs.readFileSync(new URL('../data/portfolio-knowledge.json', import.meta.url), 'utf8'))

let ip = 0
function call(body) {
  return new Promise(resolve => {
    const out = { status: 200, headers: {}, text: '' }
    const res = {
      headersSent: false,
      setHeader(k, v) { out.headers[k.toLowerCase()] = v },
      status(code) { out.status = code; return this },
      json(payload) { resolve({ ...out, json: payload }) },
      write(chunk) { this.headersSent = true; out.text += chunk },
      end() { resolve(out) },
    }
    // A fresh IP per call keeps the 10-per-minute limiter out of the way.
    handler({ method: 'POST', headers: { origin: 'http://localhost:3000', 'x-real-ip': `10.0.0.${++ip}` }, body, socket: {} }, res)
  })
}
const answerOf = out => out.text.split('\n').filter(l => l.startsWith('data: {')).map(l => JSON.parse(l.slice(6)).text ?? '').join('')

describe('classifyIntent', () => {
  it('matches aliases as whole terms', () => {
    expect(classifyIntent('And what are its limits?', knowledge).stackMentions).toEqual([])
    expect(classifyIntent('Does he have a website?', knowledge).projectIds).toEqual([])
    expect(classifyIntent('How did he build it?', knowledge).criterion).toBeNull()
  })

  it('reads "Shizu0n CV" as the project and "his CV" as contact', () => {
    const project = classifyIntent('Tell me about Shizu0n CV', knowledge)
    expect(project.intent).toBe('project_lookup')
    expect(project.projectIds).toEqual(['shizu0n-cv'])
    expect(classifyIntent('Can I get his CV?', knowledge).intent).toBe('contact')
  })

  it('keeps keyword stems', () => {
    expect(classifyIntent('Quais os melhores projetos?', knowledge).intent).toBe('comparison')
  })

  it('carries the previous project into a follow-up, with its tradeoffs', () => {
    const analysis = classifyIntent('And what are its limits?', knowledge, { previous: ['What does the ReAct Agent do?'] })
    expect(analysis.projectIds).toEqual(['react-agent'])
    const facets = buildLocalContext(knowledge, analysis).filter(c => c.project_id === 'react-agent').map(c => c.facet)
    expect(facets).toContain('metrics-recommendation')
  })

  it("keeps the project's results and tradeoffs inside Groq's budget", () => {
    const prompt = fs.readFileSync(new URL('../data/chatbot-prompt.txt', import.meta.url), 'utf8')
    const analysis = classifyIntent('And what are its limits?', knowledge, { previous: ['What does the ReAct Agent do?'] })
    const build = (local, vector) => buildSystemInstruction(prompt, knowledge, analysis, local, vector, 'canary').instruction
    const fitted = fitInstruction(build, buildLocalContext(knowledge, analysis), [])
    expect(fitted.length).toBeLessThanOrEqual(GROQ_PROMPT_CHARS)
    expect(fitted).toContain('[recommendation/metrics-recommendation/react-agent]')
  })

  it('does not carry a project into a question with its own topic', () => {
    expect(classifyIntent('How can I contact him?', knowledge, { previous: ['What does the ReAct Agent do?'] }).projectIds).toEqual([])
  })

  it('loads the measured results for a project question about results', () => {
    const analysis = classifyIntent('Quais resultados medidos o Paulo tem nos projetos?', knowledge)
    expect(buildLocalContext(knowledge, analysis).map(c => c.id)).toContain('ranking:measured_results')
  })
})

describe('detectLanguage', () => {
  it('follows the message, and the page when the message is unclear', () => {
    expect(detectLanguage('Write me a Python function that reverses a linked list.', 'pt')).toBe('en')
    expect(detectLanguage('Quais resultados medidos o Paulo tem nos projetos?', 'en')).toBe('pt')
    expect(detectLanguage('e os testes?', 'en')).toBe('pt')
    expect(detectLanguage('ReAct Agent?', 'pt')).toBe('pt')
  })
})

describe('trimHistory', () => {
  it('keeps the newest messages within the limits, starting with a user turn', () => {
    const messages = Array.from({ length: 31 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `${i}`.padEnd(1400, '.') }))
    const kept = trimHistory(messages)
    expect(kept.at(-1)).toBe(messages.at(-1))
    expect(kept[0].role).toBe('user')
    expect(kept.length).toBeLessThanOrEqual(20)
    expect(kept.reduce((sum, m) => sum + m.content.length, 0)).toBeLessThanOrEqual(10000)
  })

  it('keeps a short conversation whole', () => {
    const messages = [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }, { role: 'user', content: 'c' }]
    expect(trimHistory(messages)).toEqual(messages)
  })
})

describe('createCanaryGuard', () => {
  const canary = '123e4567-e89b-12d3-a456-426614174000'

  it('catches a canary split across two chunks before any of it is sent', () => {
    const guard = createCanaryGuard(canary)
    const first = guard.push(`hello ${canary.slice(0, 10)}`)
    const second = guard.push(`${canary.slice(10)} bye`)
    expect(first.safe + second.safe).toBe('hello ')
    expect(second.leaked).toBe(true)
  })

  it('passes clean text through unchanged', () => {
    const guard = createCanaryGuard(canary)
    const text = ['Paulo built ', 'a ReAct agent ', 'with 154 backend tests.'].map(t => guard.push(t).safe).join('') + guard.flush()
    expect(text).toBe('Paulo built a ReAct agent with 154 backend tests.')
  })
})

describe('handler', () => {
  beforeAll(() => {
    process.env.GEMINI_API_KEY = 'test'
    delete process.env.GROQ_API_KEY
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  it('falls back to the next model on any provider error', async () => {
    const out = await call({ messages: [{ role: 'user', content: 'Who is Paulo?' }] })
    expect(out.headers['x-ai-provider']).toBe('gemini-2.5-flash-lite')
    expect(answerOf(out)).toBe('Hello there.')
  })

  it('answers a long conversation instead of rejecting it', async () => {
    const messages = Array.from({ length: 31 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `${i}`.padEnd(1400, '.') }))
    const out = await call({ messages })
    expect(out.status).toBe(200)
    const { history } = calls.at(-1)
    expect(history[0].role).toBe('user')
  })

  it('tells the model to reply in the language of the message', async () => {
    await call({ messages: [{ role: 'user', content: 'Quais projetos o Paulo tem?' }], language: 'en' })
    expect(calls.at(-1).systemInstruction).toContain('Reply in Brazilian Portuguese')
  })

  it('caches only opening questions', async () => {
    const opening = { messages: [{ role: 'user', content: 'What does the ReAct Agent do?' }] }
    await call(opening)
    const again = await call(opening)
    expect(again.headers['x-cache']).toBe('HIT')
    expect(again.headers['x-chat-intent']).toBe('project_lookup')

    const followUp = about => ({ messages: [{ role: 'user', content: `Tell me about the ${about}.` }, { role: 'assistant', content: 'Sure.' }, { role: 'user', content: 'And what are its limits?' }] })
    await call(followUp('ReAct Agent'))
    const other = await call(followUp('Phi-3 Mini SQL Generator'))
    expect(other.headers['x-cache']).toBeUndefined()
    expect(calls.at(-1).systemInstruction).toContain('projects=phi3-mini-sql')
  })
})
