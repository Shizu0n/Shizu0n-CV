import { useEffect, useRef, type RefObject } from 'react'
import { useTranslation } from '../contexts/TranslationContext'
import { LERP, SCREENS_PER_STOP, clamp, ease, reduceMotion, setLook } from '../scrolly/motion'
import { STAGES, type StageKind } from '../scrolly/stages'

/** Restarts a CSS entrance on an element whose text just changed. */
export function swapIn(e: Element) {
  e.classList.remove('swap')
  void (e as HTMLElement).offsetWidth
  e.classList.add('swap')
}

/**
 * A sticky stage driven by the scroll of `scroller` (the open case panel). The drawing
 * follows the scroll with light inertia; each stop spends 70% of its scroll travelling and
 * the rest dwelling, so the token never sits still while the reader scrolls.
 */
export default function ScrollStage({ kind, scroller }: { kind: StageKind; scroller: RefObject<HTMLElement | null> }) {
  const { t, language } = useTranslation()
  const def = STAGES[kind]
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cellRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const captionRef = useRef<HTMLParagraphElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const barRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current!, stage = stageRef.current!, cell = cellRef.current!, svg = svgRef.current!
    const caption = captionRef.current!, label = labelRef.current!, bar = barRef.current!
    const n = def.stops.length
    const reduce = reduceMotion()
    let built: ReturnType<typeof def.build> | null = null
    let size = '', width = -1, shown = 0, stop = -1, pinOffset = 0, raf = 0

    // Give the caption the height of its longest stop, so the cell never resizes mid-stage.
    const reserve = () => {
      const m = caption.cloneNode() as HTMLElement
      m.removeAttribute('aria-live')
      Object.assign(m.style, { position: 'absolute', visibility: 'hidden', width: `${caption.offsetWidth}px`, minHeight: '0' })
      caption.parentNode!.appendChild(m)
      caption.style.minHeight = `${Math.max(...def.stops.map(s => ((m.textContent = s.text[language]), m.offsetHeight)))}px`
      m.remove()
      pinOffset = parseFloat(getComputedStyle(stage).top) || 0
    }

    const update = (now: number) => {
      const sc = scroller.current
      if (!sc) return
      const r = root.getBoundingClientRect(), top = sc.getBoundingClientRect().top
      if (!(r.top < top + sc.clientHeight && r.bottom > top)) return
      if (stage.clientWidth !== width) { width = stage.clientWidth; reserve() }
      const key = `${cell.clientWidth}x${cell.clientHeight}`
      if (key !== size) {
        size = key
        svg.replaceChildren()
        svg.setAttribute('viewBox', `0 0 ${cell.clientWidth} ${cell.clientHeight}`)
        built = def.build(svg, cell.clientWidth, cell.clientHeight)
        stop = -1
      }
      const p = clamp((top + pinOffset - r.top) / (r.height - stage.offsetHeight))
      shown = reduce ? p : shown + (p - shown) * LERP
      if (Math.abs(p - shown) < 0.0004) shown = p
      const i = Math.min(n - 1, Math.floor(shown * n))
      const local = shown * n - i
      // 70% of each stop is movement, the rest a short dwell that still has motion in it.
      const travel = reduce ? 1 : ease(clamp(local / 0.7))
      built!.draw({ i, travel, t: now })
      bar.style.transform = `scaleX(${shown})`
      if (i !== stop) {
        stop = i
        caption.textContent = def.stops[i].text[language]
        label.textContent = `0${i + 1} / 0${n} · ${def.stops[i].name[language]}`
        swapIn(caption)
        swapIn(label)
      }
      return built!.look
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      setLook(update(now) ?? null)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); setLook(null) }
  }, [def, language, scroller])

  return (
    <section ref={rootRef} className="scrolly" aria-label={t('case.stage')}
      style={{ height: `calc((100svh - var(--bar)) * ${1 + def.stops.length * SCREENS_PER_STOP})` }}>
      <div ref={stageRef} className="stage">
        <p ref={labelRef} className="t-label stop-label" />
        <div ref={cellRef} className="cell"><svg ref={svgRef} aria-hidden="true" /></div>
        <p ref={captionRef} className="caption" aria-live="polite" />
        <div className="progress t-label" aria-hidden="true"><span>{t('case.scroll')}</span><i><b ref={barRef} /></i></div>
      </div>
    </section>
  )
}
