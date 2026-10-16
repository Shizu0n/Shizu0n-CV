import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../contexts/TranslationContext'
import { finePointer, reduceMotion } from '../scrolly/motion'
import { BOT_CONTEXT_EVENT, getOpenCase } from './botContext'

type Localized = { en: string; pt: string }
type Chapter = { name: Localized; tip: Localized; call: Localized; prompts: Localized[] }

// What the bot offers on each part of the page and inside each project case.
export const CHAPTERS: Record<string, Chapter> = {
  top: {
    name: { en: 'Paulo Shizuo', pt: 'Paulo Shizuo' },
    tip: { en: 'Ask about Paulo', pt: 'Pergunte sobre o Paulo' },
    call: { en: 'Questions about Paulo? Ask me.', pt: 'Dúvidas sobre o Paulo? Pode perguntar.' },
    prompts: [
      { en: 'What are you studying, and until when?', pt: 'O que você estuda, e até quando?' },
      { en: 'Which project should I look at first?', pt: 'Qual projeto devo olhar primeiro?' },
    ],
  },
  projects: {
    name: { en: 'Projects', pt: 'Projetos' },
    tip: { en: 'Ask about any project', pt: 'Pergunte sobre qualquer projeto' },
    call: { en: 'Not sure which project to open? Ask me.', pt: 'Em dúvida sobre qual projeto abrir? Pergunte.' },
    prompts: [
      { en: 'Which project should I open first?', pt: 'Qual projeto devo abrir primeiro?' },
      { en: 'Which projects are full-stack?', pt: 'Quais projetos são full-stack?' },
    ],
  },
  about: {
    name: { en: 'About', pt: 'Sobre' },
    tip: { en: 'Ask about the skills', pt: 'Pergunte sobre as habilidades' },
    call: { en: 'Curious where a skill was used? Ask me.', pt: 'Quer saber onde cada habilidade foi usada? Pergunte.' },
    prompts: [
      { en: 'Which skills does each project use?', pt: 'Quais habilidades cada projeto usa?' },
      { en: 'How do you use AI coding tools?', pt: 'Como você usa ferramentas de IA para programar?' },
    ],
  },
  contact: {
    name: { en: 'Contact', pt: 'Contato' },
    tip: { en: 'Ask about working together', pt: 'Pergunte sobre trabalhar juntos' },
    call: { en: 'Want to know what internship he is after? Ask me.', pt: 'Quer saber que estágio ele procura? Pergunte.' },
    prompts: [
      { en: 'What kind of internship are you looking for?', pt: 'Que tipo de estágio você procura?' },
      { en: 'Where are you based?', pt: 'Onde você mora?' },
    ],
  },
  'react-agent': {
    name: { en: 'ReAct Agent', pt: 'ReAct Agent' },
    tip: { en: 'Ask about the ReAct agent', pt: 'Pergunte sobre o agente ReAct' },
    call: { en: 'Questions about this agent? Ask me.', pt: 'Dúvidas sobre este agente? Pode perguntar.' },
    prompts: [
      { en: 'How does the agent choose a tool?', pt: 'Como o agente escolhe uma ferramenta?' },
      { en: 'How are its runs tested?', pt: 'Como as execuções dele são testadas?' },
    ],
  },
  'phi3-mini-sql': {
    name: { en: 'Phi-3 Mini SQL', pt: 'Phi-3 Mini SQL' },
    tip: { en: 'Ask about the fine-tune', pt: 'Pergunte sobre o fine-tuning' },
    call: { en: 'Questions about this fine-tune? Ask me.', pt: 'Dúvidas sobre este fine-tuning? Pode perguntar.' },
    prompts: [
      { en: 'Why QLoRA on a T4?', pt: 'Por que QLoRA numa T4?' },
      { en: 'What does the model still get wrong?', pt: 'O que o modelo ainda erra?' },
    ],
  },
  'campus-cycle': {
    name: { en: 'CampusCycle', pt: 'CampusCycle' },
    tip: { en: 'Ask about CampusCycle', pt: 'Pergunte sobre o CampusCycle' },
    call: { en: 'Questions about the offline sync? Ask me.', pt: 'Dúvidas sobre a sincronização offline? Pergunte.' },
    prompts: [
      { en: 'How do offline listings sync?', pt: 'Como os anúncios offline sincronizam?' },
      { en: 'What stops a listing from being saved twice?', pt: 'O que impede um anúncio de ser salvo duas vezes?' },
    ],
  },
  'advanced-rag': {
    name: { en: 'Advanced RAG', pt: 'Advanced RAG' },
    tip: { en: 'Ask about the RAG pipeline', pt: 'Pergunte sobre o pipeline de RAG' },
    call: { en: 'Questions about this pipeline? Ask me.', pt: 'Dúvidas sobre este pipeline? Pode perguntar.' },
    prompts: [
      { en: 'Why combine BM25 and dense search?', pt: 'Por que combinar BM25 e busca densa?' },
      { en: 'What happens when the providers fail?', pt: 'O que acontece quando os provedores falham?' },
    ],
  },
}
const PAGE_SECTIONS = ['top', 'projects', 'about', 'contact']

/** The part of the page being read: the open case, else the last section above 40% of the screen. */
export function useBotChapter() {
  const [chapter, setChapter] = useState('top')
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      let id = getOpenCase() ?? 'top'
      if (!getOpenCase()) {
        for (const s of PAGE_SECTIONS) {
          const e = document.getElementById(s)
          if (e && e.getBoundingClientRect().top <= innerHeight * 0.4) id = s
        }
      }
      setChapter(id)
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    addEventListener('scroll', schedule, { passive: true })
    addEventListener(BOT_CONTEXT_EVENT, schedule)
    return () => { removeEventListener('scroll', schedule); removeEventListener(BOT_CONTEXT_EVENT, schedule); cancelAnimationFrame(raf) }
  }, [])
  return chapter
}

const center = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 })

interface ChatBotProps {
  chapter: string
  isOpen: boolean
  thinking: boolean
  onToggle: () => void
}

/**
 * The chat launcher as a small character: a disc with two eyes that follows the reading
 * (the cursor, the token in flight in a case, a new section's heading) without ever moving
 * over the content. It says it is clickable through hover, an occasional quiet call after a
 * stretch of scrolling, and one nudge per page view.
 */
export default function ChatBot({ chapter, isOpen, thinking, onToggle }: ChatBotProps) {
  const { t, language } = useTranslation()
  const botRef = useRef<HTMLButtonElement>(null)
  const eyesRef = useRef<SVGGElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<'none' | 'hover' | 'call'>('none')
  const state = useRef({ hovering: false, thinking, open: isOpen, everOpened: false, glance: null as { x: number; y: number } | null, glanceUntil: 0 })
  state.current.thinking = thinking
  state.current.open = isOpen
  if (isOpen) state.current.everOpened = true

  const hop = () => {
    const bot = botRef.current
    if (!bot || reduceMotion()) return
    bot.classList.remove('is-hopping')
    void bot.offsetWidth
    bot.classList.add('is-hopping')
  }

  // Eyes, blinks and the idle nudge.
  useEffect(() => {
    const bot = botRef.current!, eyes = eyesRef.current!
    if (reduceMotion()) return undefined
    const fine = finePointer()
    const eye = { x: 0, y: 0 }
    let pointer: { x: number; y: number } | null = null, pointerAt = 0, scrollDir = 0, scrollAt = 0, lastY = scrollY
    let idleSince = performance.now(), nudged = false, raf = 0
    const timers: number[] = []

    const onPointer = (e: PointerEvent) => { if (e.pointerType === 'mouse') { pointer = { x: e.clientX, y: e.clientY }; pointerAt = performance.now() } }
    const onScroll = () => { scrollDir = Math.sign(scrollY - lastY); lastY = scrollY; scrollAt = performance.now(); idleSince = performance.now() }

    const target = (now: number) => {
      const s = state.current
      const b = center(bot.getBoundingClientRect())
      let p: { x: number; y: number } | null = null
      const panel = document.querySelector('.bot-panel.is-open')
      if (s.thinking) p = { x: b.x - 60 + Math.sin(now / 260) * 40, y: b.y - 120 } // looking up, side to side
      else if (s.open && panel) p = center(panel.getBoundingClientRect())
      else if (s.hovering) return { x: 0, y: 1.5 } // straight at the visitor
      else if (s.glance && now < s.glanceUntil) p = s.glance
      else if (fine && pointer && now - pointerAt < 3500) p = pointer
      else {
        const live = document.querySelector('[data-bot-look]')
        p = live ? center(live.getBoundingClientRect()) : now - scrollAt < 1200 ? { x: b.x, y: b.y + scrollDir * 200 } : null
      }
      if (!p) return { x: 0, y: 0 }
      const dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy) || 1
      const k = Math.min(1, Math.max(0.35, d / 260))
      return { x: (dx / d) * 7 * k, y: (dy / d) * 6 * k }
    }
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const tg = target(now)
      eye.x += (tg.x - eye.x) * 0.12
      eye.y += (tg.y - eye.y) * 0.12
      eyes.setAttribute('transform', `translate(${eye.x.toFixed(2)} ${eye.y.toFixed(2)})`)
    }
    const blink = () => {
      bot.classList.add('is-blinking')
      timers.push(window.setTimeout(() => bot.classList.remove('is-blinking'), 110))
    }
    const scheduleBlink = () => {
      timers.push(window.setTimeout(() => {
        blink()
        if (Math.random() < 0.2) timers.push(window.setTimeout(blink, 220))
        scheduleBlink()
      }, 2600 + Math.random() * 3800))
    }
    // One nudge per page view: a reader idle for 20 s who has not opened the chat.
    const nudge = window.setInterval(() => {
      if (nudged || state.current.open || performance.now() - idleSince < 20000) return
      nudged = true
      hop()
      bot.classList.add('is-nudging')
      timers.push(window.setTimeout(() => bot.classList.remove('is-nudging'), 1800))
    }, 1000)

    addEventListener('pointermove', onPointer, { passive: true })
    addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(frame)
    scheduleBlink()
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(nudge)
      timers.forEach(clearTimeout)
      removeEventListener('pointermove', onPointer)
      removeEventListener('scroll', onScroll)
    }
  }, [])

  // A new chapter: a glance at its heading and one small hop.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (state.current.open) return
    const scope = document.getElementById(chapter) ?? document.querySelector('.case.is-open')
    const heading = scope?.querySelector('h1, h2')
    if (heading) {
      state.current.glance = center(heading.getBoundingClientRect())
      state.current.glanceUntil = performance.now() + 1100
      hop()
    }
  }, [chapter])

  // An occasional quiet call: after a good stretch of scrolling (page or case), a short line
  // beside the bot says what it can answer there. At most three per page view, 45 s apart,
  // and never again once the chat has been opened.
  useEffect(() => {
    const last = new WeakMap<EventTarget, number>()
    const timers: number[] = []
    let travelled = 0, lastCall = -Infinity, calls = 0
    const onScroll = (e: Event) => {
      const el = e.target === document ? document.scrollingElement : e.target as Element
      if (!el || el.closest?.('.bot-panel')) return
      const y = el.scrollTop
      travelled += Math.abs(y - (last.get(el) ?? y))
      last.set(el, y)
      const now = performance.now()
      const s = state.current
      if (s.everOpened || s.open || s.hovering || calls >= 3 || now - lastCall < 45000 || travelled < innerHeight * 1.5) return
      calls++
      lastCall = now
      travelled = 0
      setTip('call')
      hop()
      timers.push(window.setTimeout(() => {
        const r = tipRef.current?.getBoundingClientRect()
        if (r) { s.glance = center(r); s.glanceUntil = performance.now() + 2200 }
      }, 50))
      timers.push(window.setTimeout(() => setTip(tp => (tp === 'call' ? 'none' : tp)), 6500))
    }
    addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => { timers.forEach(clearTimeout); removeEventListener('scroll', onScroll, { capture: true }) }
  }, [])

  useEffect(() => { if (isOpen) setTip('none') }, [isOpen])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setTip(tp => (tp === 'none' ? tp : 'none')) }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  const hover = (on: boolean) => {
    state.current.hovering = on
    if (on && !isOpen) setTip('hover')
    else if (!on) setTip(tp => (tp === 'call' ? tp : 'none'))
  }

  return (
    <>
      <button ref={botRef} type="button" className={`bot${tip === 'call' ? ' is-calling' : ''}`} onClick={onToggle}
        aria-label={t(isOpen ? 'chat.bot.close' : 'chat.bot.open')} aria-expanded={isOpen}
        onPointerEnter={() => hover(true)} onPointerLeave={() => hover(false)}
        onFocus={e => { if (e.currentTarget.matches(':focus-visible')) hover(true) }} onBlur={() => hover(false)}>
        <svg viewBox="-32 -32 64 64" aria-hidden="true">
          <circle className="bot-ring" r="31" />
          <circle className="bot-body" r="27" />
          <g ref={eyesRef} className="bot-eyes"><g className="bot-lid">
            <rect className="bot-eye" x="-8" y="-10" width="6" height="13" rx="3" transform="rotate(-12 -5 -3.5)" />
            <rect className="bot-eye" x="4" y="-10" width="6" height="13" rx="3" transform="rotate(-12 7 -3.5)" />
          </g></g>
        </svg>
      </button>
      <div ref={tipRef} role="status" className={`bot-tip${tip !== 'none' ? ' is-shown' : ''}${tip === 'call' ? ' is-call' : ''}`}>
        {tip === 'call' ? (
          <button type="button" className="bot-call" onClick={onToggle}>{(CHAPTERS[chapter] ?? CHAPTERS.top).call[language]}</button>
        ) : tip === 'hover' ? (CHAPTERS[chapter] ?? CHAPTERS.top).tip[language] : null}
      </div>
    </>
  )
}
