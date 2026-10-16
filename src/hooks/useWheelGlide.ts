import { useEffect } from 'react'
import { WHEEL_LERP, WHEEL_SPEED, clamp, reduceMotion } from '../scrolly/motion'

type Glide = { el: Element; y: number; target: number }

/**
 * Slows the mouse wheel on the page and inside an open case: each step scrolls
 * WHEEL_SPEED of its distance and glides there. The page is short, so a hard flick used to
 * reach the end before the reader saw anything.
 * shortcut: only the wheel and trackpad are slowed; touch, keyboard and the scrollbar stay
 * native. Drop it if testers find the wheel laggy.
 */
export function useWheelGlide() {
  useEffect(() => {
    if (reduceMotion()) return undefined
    const scroller = () => document.querySelector('.case.is-open') ?? document.scrollingElement!
    let glide: Glide | null = null, raf = 0

    const step = () => {
      raf = 0
      if (!glide) return
      const { el } = glide
      // A case opened or closed, or the keyboard or scrollbar moved the page: let go.
      if (el !== scroller() || Math.abs(el.scrollTop - glide.y) > 2) { glide = null; return }
      glide.y += (glide.target - glide.y) * WHEEL_LERP
      if (Math.abs(glide.target - glide.y) < 0.5) glide.y = glide.target
      // 'instant' so the page's smooth scroll-behavior does not animate every frame.
      el.scrollTo({ top: glide.y, behavior: 'instant' })
      if (glide.y === glide.target) glide = null
      else raf = requestAnimationFrame(step)
    }

    const onWheel = (e: WheelEvent) => {
      const target = e.target as Element | null
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || target?.closest('.bot-panel')) return
      e.preventDefault()
      const el = scroller()
      const delta = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? el.clientHeight : 1)
      if (!glide || glide.el !== el) glide = { el, y: el.scrollTop, target: el.scrollTop }
      glide.target = clamp(glide.target + delta * WHEEL_SPEED, 0, el.scrollHeight - el.clientHeight)
      if (!raf) raf = requestAnimationFrame(step)
    }

    addEventListener('wheel', onWheel, { passive: false })
    return () => { removeEventListener('wheel', onWheel); cancelAnimationFrame(raf) }
  }, [])
}
