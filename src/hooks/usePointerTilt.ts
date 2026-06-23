import { useEffect, useRef } from 'react'

/**
 * Pointer-driven ±7° tilt for the project tiles (design set-piece C — "flat until you
 * mean it"). The tilt is lerped toward the cursor offset each frame and settles back to
 * flat on leave. It is disabled entirely for reduced-motion and coarse-pointer (touch)
 * devices, where the tiles stay flat and rely on the CSS hover/focus brighten instead —
 * so the effect is never load-bearing and the tile is always a plain focusable link.
 *
 * The rAF here only runs while a tile is actively being tilted (between pointer enter
 * and the settle-back to flat); it is unrelated to the Lenis/WebGL scroll loop.
 */

const MAX_DEG = 7
const LERP = 0.12
const SETTLE = 0.01

export function usePointerTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const frame = useRef(0)
  const running = useRef(false)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    if (reduceMotion || coarsePointer) return // tiles stay flat; CSS hover/focus handles feedback

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * LERP
      current.current.y += (target.current.y - current.current.y) * LERP

      const settledToFlat =
        target.current.x === 0 &&
        target.current.y === 0 &&
        Math.abs(current.current.x) < SETTLE &&
        Math.abs(current.current.y) < SETTLE

      if (settledToFlat) {
        el.style.transform = ''
        running.current = false
        return
      }

      el.style.transform = `perspective(900px) rotateX(${current.current.x.toFixed(3)}deg) rotateY(${current.current.y.toFixed(3)}deg)`
      frame.current = requestAnimationFrame(tick)
    }

    const ensureRunning = () => {
      if (running.current) return
      running.current = true
      frame.current = requestAnimationFrame(tick)
    }

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5
      target.current.y = px * (MAX_DEG * 2) // rotateY tracks horizontal offset
      target.current.x = -py * (MAX_DEG * 2) // rotateX tracks vertical offset (inverted)
      el.dataset.tilting = 'true'
      ensureRunning()
    }

    const onLeave = () => {
      target.current.x = 0
      target.current.y = 0
      delete el.dataset.tilting
      ensureRunning()
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  return ref
}
