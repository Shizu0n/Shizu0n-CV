import { useEffect } from 'react'

const STAGGER_MS = 70

/**
 * Raises each `[data-reveal]` element into place the first time it enters the viewport,
 * staggered within its section. Content is only hidden once this runs, so the page reads
 * fully without script, and reduced motion is handled in CSS.
 */
export function useReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const root = document.documentElement
    root.classList.add('reveal-ready')

    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const indexInSection = new Map<Element, number>()
    elements.forEach(element => {
      const section = element.closest('section, article') ?? document.body
      const index = indexInSection.get(section) ?? 0
      element.style.setProperty('--reveal-delay', `${Math.min(index, 6) * STAGGER_MS}ms`)
      indexInSection.set(section, index + 1)
    })

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    elements.forEach(element => observer.observe(element))

    return () => {
      observer.disconnect()
      root.classList.remove('reveal-ready')
    }
  }, [])
}
