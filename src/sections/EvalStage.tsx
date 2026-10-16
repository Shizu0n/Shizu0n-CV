import { useEffect, useRef, type RefObject } from 'react'
import { useTranslation } from '../contexts/TranslationContext'
import { EVAL_SCREENS, LERP, clamp, easeOut, reduceMotion, setLook } from '../scrolly/motion'
import { swapIn } from './ScrollStage'

// From phi3-mini-sql-generator/results/eval_summary.json: exact string match on the
// 200-question held-out split of b-mc2/sql-create-context.
const TOTAL = 200, BASE = 4, TUNED = 147
// Each cell's place in the diagonal wave the grid assembles in (20 columns, 10 rows).
const WAVE = Array.from({ length: TOTAL }, (_, k) => ((k % 20) + Math.floor(k / 20)) / 28)

/**
 * The Phi-3 result as a scroll stage: 0 to 0.2 the grid assembles in a diagonal wave, the
 * base model's 4 hits hold until 0.36, and from 0.36 to 0.86 the tuned hits fill in with the
 * count running alongside.
 */
export default function EvalStage({ scroller }: { scroller: RefObject<HTMLElement | null> }) {
  const { t } = useTranslation()
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const barRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const labels = [t('eval.stage.base'), t('eval.stage.filling'), t('eval.stage.done')]
    const root = rootRef.current!, stage = stageRef.current!, count = countRef.current!
    const label = labelRef.current!, bar = barRef.current!
    const cells = Array.from(gridRef.current!.children) as HTMLElement[]
    const reduce = reduceMotion()
    const cache: string[] = []
    let shown = 0, text = '', raf = 0

    const draw = (front: number, appear: number) => cells.forEach((c, k) => {
      const a = reduce ? 1 : clamp(appear * 1.6 - WAVE[k] * 0.6)
      const fill = clamp((front - k) / 4)
      const isBase = front <= 0 && k < BASE
      const v = `${a.toFixed(2)}|${fill.toFixed(2)}|${isBase}`
      if (cache[k] === v) return
      cache[k] = v
      c.style.setProperty('--s', (0.4 + 0.6 * easeOut(a)).toFixed(3))
      c.style.setProperty('--o', a.toFixed(2))
      c.style.setProperty('--f', fill.toFixed(2))
      c.classList.toggle('is-base', isBase)
    })

    const update = () => {
      const sc = scroller.current
      if (!sc) return null
      const r = root.getBoundingClientRect(), top = sc.getBoundingClientRect().top
      if (r.bottom < top || r.top > top + sc.clientHeight) return null
      const pin = parseFloat(getComputedStyle(stage).top) || 0
      const p = clamp((top + pin - r.top) / (r.height - stage.offsetHeight))
      shown = reduce ? p : shown + (p - shown) * LERP
      const front = clamp((shown - 0.36) / 0.5) * TUNED
      draw(front, clamp(shown / 0.2))
      count.textContent = String(front < 1 ? BASE : Math.round(front))
      bar.style.transform = `scaleX(${shown})`
      const next = labels[front < 1 ? 0 : front >= TUNED - 0.5 ? 2 : 1]
      if (next !== text) { text = next; label.textContent = next; swapIn(label) }
      return count
    }

    const frame = () => { raf = requestAnimationFrame(frame); setLook(update()) }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); setLook(null) }
  }, [t, scroller])

  return (
    <section ref={rootRef} className="scrolly" aria-label={t('eval.stage.aria')}
      style={{ height: `calc((100svh - var(--bar)) * ${EVAL_SCREENS})` }}>
      <div ref={stageRef} className="stage">
        <p ref={labelRef} className="t-label stop-label">{t('eval.stage.base')}</p>
        <div className="eval-body">
          <div ref={gridRef} className="eval-grid" aria-hidden="true">
            {WAVE.map((_, k) => <span key={k} className="eval-cell"><b /></span>)}
          </div>
          <div>
            <p className="eval-count" aria-live="polite"><span ref={countRef}>{BASE}</span><small> / {TOTAL}</small></p>
            <div className="legend">
              <span><i className="is-base" />{t('eval.legend.base')}</span>
              <span><i style={{ background: 'var(--measure)' }} />{t('eval.legend.tuned')}</span>
              <span><i style={{ background: 'var(--field)' }} />{t('eval.legend.miss')}</span>
            </div>
          </div>
        </div>
        <p className="caption muted">{t('eval.caption')}</p>
        <div className="progress t-label" aria-hidden="true"><span>{t('eval.stage.scroll')}</span><i><b ref={barRef} /></i></div>
      </div>
    </section>
  )
}
