// Small SVG building blocks the stages are drawn with. Everything is created imperatively and
// updated every frame from the scroll, so React never re-renders while a stage runs.
import { clamp, reduceMotion } from './motion'

const NS = 'http://www.w3.org/2000/svg'
export type Point = { x: number; y: number }

export function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>, parent?: Element) {
  const n = document.createElementNS(NS, name)
  for (const k in attrs) n.setAttribute(k, String(attrs[k]))
  parent?.appendChild(n)
  return n
}

export const basePath = (parent: Element, d: string) => el('path', { class: 'path-base', d }, parent)

export type LitPath = { el: SVGPathElement; L: number }
export function litPath(parent: Element, d: string, cls = 'path-lit'): LitPath {
  const p = el('path', { class: cls, d }, parent)
  const L = p.getTotalLength() || 1
  p.style.strokeDasharray = `${L} ${L}`
  p.style.strokeDashoffset = String(L)
  return { el: p, L }
}
export const setLit = (lp: LitPath, f: number) => { lp.el.style.strokeDashoffset = String(lp.L * (1 - clamp(f))) }
export const pointAt = (lp: LitPath, f: number): Point => lp.el.getPointAtLength(lp.L * clamp(f))

export const curve = (a: Point, b: Point, vertical: boolean) => vertical
  ? `M${a.x} ${a.y} C${a.x} ${(a.y + b.y) / 2} ${b.x} ${(a.y + b.y) / 2} ${b.x} ${b.y}`
  : `M${a.x} ${a.y} C${(a.x + b.x) / 2} ${a.y} ${(a.x + b.x) / 2} ${b.y} ${b.x} ${b.y}`

export type Box = { x: number; y: number; w: number; h: number }
export type StageNode = Box & {
  g: SVGGElement; edge: SVGRectElement; per: number; tv: SVGTextElement
  val: string; typed: string; lit: boolean; litAt: number; cx: number; cy: number
}

/** A station: pops when reached, draws its border, types its value, ripples while current. */
export function node(parent: Element, { x, y, w, h, label, val }: Box & { label: string; val: string }): StageNode {
  const g = el('g', { class: 'node' }, parent)
  const pop = el('g', { class: 'pop' }, g)
  el('rect', { class: 'ripple', x, y, width: w, height: h, rx: 6 }, pop)
  el('rect', { class: 'box', x, y, width: w, height: h, rx: 6 }, pop)
  const per = 2 * (w + h)
  const edge = el('rect', { class: 'edge', x, y, width: w, height: h, rx: 6, 'stroke-dasharray': per, 'stroke-dashoffset': per }, pop)
  el('text', { x: x + 14, y: y + h * 0.42 + 2 }, pop).textContent = label.toUpperCase()
  const tv = el('text', { class: 'val', x: x + 14, y: y + h * 0.78 }, pop)
  tv.textContent = val
  return { g, edge, per, tv, val, typed: val, lit: false, litAt: 0, x, y, w, h, cx: x + w / 2, cy: y + h / 2 }
}
export function setNode(nd: StageNode, lit: boolean, current: boolean, t: number) {
  const reduce = reduceMotion()
  if (lit !== nd.lit) {
    nd.lit = lit
    nd.litAt = t
    nd.g.classList.toggle('is-lit', lit)
    nd.edge.style.strokeDashoffset = String(lit ? 0 : nd.per)
  }
  nd.g.classList.toggle('is-current', current && !reduce)
  const n = lit && !reduce ? Math.min(nd.val.length, Math.floor((t - nd.litAt) / 32)) : nd.val.length
  const text = nd.val.slice(0, n)
  if (text !== nd.typed) { nd.tv.textContent = text; nd.typed = text }
}
export function setVal(nd: StageNode, v: string, t: number) { if (nd.val !== v) { nd.val = v; nd.litAt = t } }

/** The thing in flight: a dot with a halo and two trailing ghosts. */
export type Token = { g: SVGGElement; g1: SVGCircleElement; g2: SVGCircleElement; halo: SVGCircleElement; dot: SVGCircleElement; hist: Point[] }
export function token(parent: Element): Token {
  const g = el('g', {}, parent)
  const g2 = el('circle', { class: 'token-ghost', r: 3, opacity: 0.16 }, g)
  const g1 = el('circle', { class: 'token-ghost', r: 4.5, opacity: 0.32 }, g)
  const halo = el('circle', { class: 'token-halo', r: 13, opacity: 0.45 }, g)
  const dot = el('circle', { class: 'token', r: 6 }, g)
  return { g, g1, g2, halo, dot, hist: [] }
}
export function placeToken(tk: Token, pos: Point | null, t: number, visible = true) {
  tk.g.style.opacity = visible ? '1' : '0'
  if (!pos) return
  tk.hist.unshift({ x: pos.x, y: pos.y })
  if (tk.hist.length > 10) tk.hist.pop()
  const a = tk.hist[3] || pos, b = tk.hist[8] || pos
  for (const [c, p] of [[tk.dot, pos], [tk.halo, pos], [tk.g1, a], [tk.g2, b]] as const) {
    c.setAttribute('cx', String(p.x))
    c.setAttribute('cy', String(p.y))
  }
  tk.halo.setAttribute('r', String(reduceMotion() ? 13 : 12 + Math.sin(t / 260) * 2.5))
}

/** Packets: small dots that keep running along a path once it is fully lit. */
export const packets = (parent: Element, n = 3) => Array.from({ length: n }, () => el('circle', { class: 'packet', r: 2.2, opacity: 0 }, parent))
export function flow(pk: SVGCircleElement[], lp: LitPath, f: number, t: number, speed = 1700) {
  const on = f >= 1 && !reduceMotion()
  pk.forEach((c, k) => {
    const ph = (t / speed + k / pk.length) % 1
    c.setAttribute('opacity', on ? (Math.sin(ph * Math.PI) * 0.85).toFixed(2) : '0')
    if (on) {
      const p = pointAt(lp, ph)
      c.setAttribute('cx', String(p.x))
      c.setAttribute('cy', String(p.y))
    }
  })
}
