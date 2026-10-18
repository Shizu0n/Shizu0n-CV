import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '../contexts/TranslationContext'
import { getShowcaseProjects } from '../components/chatProjectCatalog'
import { setOpenCase } from '../components/botContext'
import { clamp, easeOut, finePointer, reduceMotion } from '../scrolly/motion'
import { PROJECT_PRESENTATION } from './projectsPresentation'
import ArchitectureDiagram from './ArchitectureDiagram'
import CardGlyph from './CardGlyph'
import ProjectCase from './ProjectCase'
import { CASE_PREFIX, caseHash, parseCaseHash } from './caseRoute'

const GITHUB_PROFILE_URL = 'https://github.com/Shizu0n'
const projects = getShowcaseProjects()
const featured = projects.filter(project => PROJECT_PRESENTATION[project.id].tier === 'featured')
const more = projects.filter(project => PROJECT_PRESENTATION[project.id].tier === 'more')
const featuredIds = featured.map(project => project.id)

type Entry = { el: HTMLElement; slot: HTMLElement; k: number; shown: number; tx: number; ty: number; tilt: { x: number; y: number } }

/** Cards fly in from offset, tilted positions as they enter, then settle; a settled card leans toward the pointer. */
function useCardEntrance(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const reduce = reduceMotion()
    const entries: Entry[] = Array.from(root.querySelectorAll<HTMLElement>('.card-slot, .mini')).map((slot, k) => ({
      el: slot.classList.contains('mini') ? slot : (slot.firstElementChild as HTMLElement), slot, k, shown: reduce ? 1 : 0, tx: 0, ty: 0, tilt: { x: 0, y: 0 },
    }))
    const cleanups: (() => void)[] = []
    if (finePointer() && !reduce) {
      for (const c of entries) {
        if (!c.el.classList.contains('card')) continue
        const move = (e: PointerEvent) => {
          if (c.shown < 0.98) return
          const r = c.el.getBoundingClientRect()
          c.tilt = { x: ((e.clientY - r.top) / r.height - 0.5) * -6, y: ((e.clientX - r.left) / r.width - 0.5) * 7 }
        }
        const leave = () => { c.tilt = { x: 0, y: 0 } }
        c.el.addEventListener('pointermove', move)
        c.el.addEventListener('pointerleave', leave)
        cleanups.push(() => { c.el.removeEventListener('pointermove', move); c.el.removeEventListener('pointerleave', leave) })
      }
    }
    let raf = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (document.body.classList.contains('is-locked')) return
      const vh = innerHeight
      for (const c of entries) {
        const r = c.slot.getBoundingClientRect()
        if (r.top > vh + 200 || r.bottom < -200) continue
        const target = reduce ? 1 : clamp((vh - r.top) / (vh * 0.5) - (c.k % 2) * 0.12)
        c.shown += (target - c.shown) * 0.1
        if (Math.abs(target - c.shown) < 0.001) c.shown = target
        const e = easeOut(c.shown), side = c.k % 2 ? 1 : -1
        const s = c.el.style
        s.setProperty('--x', `${((1 - e) * side * 80).toFixed(1)}px`)
        s.setProperty('--y', `${((1 - e) * 120).toFixed(1)}px`)
        s.setProperty('--r', `${((1 - e) * side * 5).toFixed(2)}deg`)
        s.setProperty('--sc', (0.9 + 0.1 * e).toFixed(3))
        s.setProperty('--op', clamp(c.shown * 1.6).toFixed(2))
        c.tx += (c.tilt.x - c.tx) * 0.15
        c.ty += (c.tilt.y - c.ty) * 0.15
        s.setProperty('--tx', `${c.tx.toFixed(2)}deg`)
        s.setProperty('--ty', `${c.ty.toFixed(2)}deg`)
      }
    }
    if (!reduce) raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); cleanups.forEach(f => f()) }
  }, [rootRef])
}

export default function ProjectsSection() {
  const { t, language } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const caseRef = useRef<HTMLDivElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const pushed = useRef(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const openRef = useRef<string | null>(null)
  useCardEntrance(sectionRef)

  // The panel's clip-path inset, in px from each edge; null fills the screen.
  const clipTo = (rect: DOMRect | null) => {
    const s = caseRef.current!.style
    const v = rect
      ? { ct: rect.top, cr: innerWidth - rect.right, cb: innerHeight - rect.bottom, cl: rect.left }
      : { ct: 0, cr: 0, cb: 0, cl: 0 }
    for (const [k, n] of Object.entries(v)) s.setProperty(`--${k}`, `${Math.max(0, n)}px`)
  }

  const focusTitle = (delay: number) => window.setTimeout(() => {
    caseRef.current?.querySelector<HTMLElement>('#case-title')?.focus({ preventScroll: true })
  }, delay)

  const open = useCallback((id: string, { from = null, push = true }: { from?: HTMLElement | null; push?: boolean } = {}) => {
    const panel = caseRef.current
    if (!panel || !featuredIds.includes(id)) return
    setOpenCase(id)
    if (openRef.current) {
      // Moving between cases: swap the content in place.
      openRef.current = id
      setOpenId(id)
      history.replaceState(null, '', caseHash(id))
      panel.scrollTop = 0
      focusTitle(0)
      return
    }
    openRef.current = id
    returnTo.current = from ?? document.getElementById(`card-${id}`)
    setOpenId(id)
    panel.scrollTop = 0
    document.body.classList.add('is-locked')
    for (const e of document.querySelectorAll<HTMLElement>('#main-content, .nav')) e.inert = true
    panel.classList.add('is-open')
    if (push) { history.pushState({ case: id }, '', caseHash(id)); pushed.current = true }
    // The panel grows out of the card it came from (or the link that asked for it).
    const r = returnTo.current?.getBoundingClientRect()
    const reduce = reduceMotion()
    if (reduce || !r || r.bottom < 0 || r.top > innerHeight) { clipTo(null); panel.classList.add('is-shown') }
    else {
      clipTo(r)
      void panel.offsetWidth
      panel.classList.add('is-animating')
      clipTo(null)
      requestAnimationFrame(() => panel.classList.add('is-shown'))
      window.setTimeout(() => panel.classList.remove('is-animating'), 600)
    }
    focusTitle(reduce ? 0 : 260)
  }, [])

  const close = useCallback(({ fromHistory = false } = {}) => {
    const panel = caseRef.current, id = openRef.current
    if (!panel || !id) return
    openRef.current = null
    setOpenCase(null)
    const card = document.getElementById(`card-${id}`)
    const r = card?.getBoundingClientRect()
    const finish = () => {
      panel.classList.remove('is-open', 'is-shown', 'is-animating')
      setOpenId(null)
      document.body.classList.remove('is-locked')
      for (const e of document.querySelectorAll<HTMLElement>('#main-content, .nav')) e.inert = false
      const back = returnTo.current && document.contains(returnTo.current) ? returnTo.current : card
      back?.focus({ preventScroll: true })
    }
    if (reduceMotion() || !r || r.bottom < 0 || r.top > innerHeight) finish()
    else {
      panel.classList.remove('is-shown')
      panel.classList.add('is-animating')
      clipTo(r)
      window.setTimeout(finish, 560)
    }
    if (!fromHistory) {
      if (pushed.current) { pushed.current = false; history.back() }
      else history.replaceState(null, '', '#projects')
    }
  }, [])

  useEffect(() => {
    // Any link to a case (the hero's results, the cards) opens it in place instead of jumping.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.(`a[href^="${CASE_PREFIX}"]`)
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return
      const id = parseCaseHash(a.getAttribute('href') ?? '', featuredIds)
      if (!id) return
      e.preventDefault()
      open(id, { from: a as HTMLElement })
    }
    const onPop = () => {
      const id = parseCaseHash(location.hash, featuredIds)
      if (id) open(id, { push: false })
      else if (openRef.current) { pushed.current = false; close({ fromHistory: true }) }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openRef.current && !document.querySelector('.bot-panel.is-open')) close()
    }
    document.addEventListener('click', onClick)
    addEventListener('popstate', onPop)
    addEventListener('keydown', onKey)
    const initial = parseCaseHash(location.hash, featuredIds)
    if (initial) open(initial, { push: false })
    return () => {
      document.removeEventListener('click', onClick)
      removeEventListener('popstate', onPop)
      removeEventListener('keydown', onKey)
    }
  }, [open, close])

  const k = openId ? featured.findIndex(project => project.id === openId) : -1

  return (
    <section id="projects" ref={sectionRef} className="section projects" aria-labelledby="projects-title">
      <div className="column">
        <h2 id="projects-title" className="section-title" data-reveal>{t('projects.title')}</h2>
        <p className="section-body" data-reveal>{t('projects.body')}</p>
      </div>

      <div className="cards wide">
        {featured.map((project, index) => {
          const p = PROJECT_PRESENTATION[project.id]
          return (
            <div key={project.id} className="card-slot">
              <a className="card" id={`card-${project.id}`} href={caseHash(project.id)}>
                <div>
                  <div className="card-head t-label"><span>0{index + 1}</span><span>{p.year}</span></div>
                  <h3 className="card-name">{project.name}</h3>
                  <p className="card-kind">{p.kind[language]}</p>
                </div>
                <div />
                <div className="card-foot">
                  <div>
                    {p.headline && (
                      <p className="card-result"><strong>{p.headline.value[language]}</strong><span>{p.headline.label[language]}</span></p>
                    )}
                    <span className="card-open t-label">{t('projects.open')} <span aria-hidden="true">↗</span></span>
                  </div>
                  {p.glyph && <CardGlyph glyph={p.glyph} />}
                </div>
              </a>
            </div>
          )
        })}
      </div>

      <div className="column">
        <h3 className="more-title">{t('projects.more.title')}</h3>
        <p className="more-body muted">{t('projects.more.body')}</p>
      </div>
      <div className="minis wide">
        {more.map(project => {
          const p = PROJECT_PRESENTATION[project.id]
          return (
            <article key={project.id} className="mini">
              <div className="mini-head"><h4 className="mini-name">{project.name}</h4><span className="mini-year">{p.year}</span></div>
              <p className="mini-kind">{p.kind[language]}</p>
              <p className="mini-desc">{p.description[language]}</p>
              {p.diagram && (
                <details className="mini-arch">
                  <summary>{t('projects.architecture')}</summary>
                  <ArchitectureDiagram diagram={p.diagram} label={t('projects.diagram', { name: project.name })} />
                </details>
              )}
              <p className="mini-links"><a className="text-link" href={project.github} target="_blank" rel="noopener noreferrer">{t('projects.code')}</a></p>
            </article>
          )
        })}
      </div>
      <p className="column projects-archive">
        <a className="text-link" href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer">{t('projects.archive.link')}</a>
      </p>

      {createPortal(
        <div ref={caseRef} className="case" role="dialog" aria-modal="true" aria-labelledby="case-title">
          {openId && k >= 0 && (
            <ProjectCase key={openId} project={featured[k]} presentation={PROJECT_PRESENTATION[openId]} index={k}
              prev={featured[(k + featured.length - 1) % featured.length]} next={featured[(k + 1) % featured.length]}
              scroller={caseRef} onClose={() => close()} onGo={id => open(id)} />
          )}
        </div>,
        document.body,
      )}
    </section>
  )
}
