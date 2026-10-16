// Shared motion rules for the scroll stages, the card entrances and the wheel glide.
// Read once per page load and cached: stages ask every frame.
const cached = (query: string) => {
  let value: boolean | undefined
  return () => (value ??= typeof matchMedia !== 'undefined' && matchMedia(query).matches)
}
export const reduceMotion = cached('(prefers-reduced-motion: reduce)')
export const finePointer = cached('(pointer: fine)')

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeBack = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2)

// Scroll pace of the case stages: screens of scroll per stop (and for the whole eval), and
// how fast the drawing catches up with the scroll each frame (lower is softer and slower).
export const SCREENS_PER_STOP = 0.9
export const EVAL_SCREENS = 3.2
export const LERP = 0.075
// Mouse wheel (page and cases): share of each wheel step that is scrolled, and how fast it glides there.
export const WHEEL_SPEED = 0.7
export const WHEEL_LERP = 0.09

/** What the chat bot's eyes follow while a stage runs: the token in flight, the count… */
let lookEl: Element | null = null
export function setLook(e: Element | null) {
  if (lookEl === e) return
  lookEl?.removeAttribute('data-bot-look')
  lookEl = e
  e?.setAttribute('data-bot-look', '')
}
