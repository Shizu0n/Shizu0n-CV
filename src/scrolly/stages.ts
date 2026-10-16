// The three case-study stages, drawn in pixels to fit their cell. Every name and number comes
// from the project repositories:
// - Loop: one run of the live ReAct agent on 14 Oct 2026 ("Calculate sqrt(1764) and explain the
//   steps"), as its trace store shows it in public/projects/react-agent.png and
//   react-agent-history.png: calculator with math.sqrt(1764) → 42.0, 3 steps, 2 model calls,
//   2,656 tokens, 3,876 ms, Gemini. Step fields from ReAct-Agent backend/agent/traces.py.
// - Queue: CampusCycle web/src/lib/offlineQueue.ts (IndexedDB queue, online listener, same UUID
//   on retries, 5 retries on 5xx) and server/src/routes/listings.ts (same-owner duplicate UUID
//   → 200). The three listing cards are illustrative, not a recorded count.
// - RAG: the Advanced-RAG pipeline, the same tiers as its diagram in projectsPresentation.ts.
// Layout rule: every box keeps a minimum gap plus room for its pop (scale 1.045), and a layout
// switches orientation instead of squeezing.
import { clamp, easeBack, easeOut } from './motion'
import {
  basePath, curve, el, flow, litPath, node, packets, placeToken, pointAt, setLit, setNode, setVal, token,
  type Box, type LitPath, type Point, type StageNode,
} from './svg'

export type Localized = { en: string; pt: string }
export type Stop = { name: Localized; text: Localized }
export type Frame = { i: number; travel: number; t: number }
export type Built = { look: Element | null; draw: (f: Frame) => void }
export type StageDef = { stops: Stop[]; build: (svg: SVGSVGElement, W: number, H: number) => Built }
export type StageKind = 'loop' | 'queue' | 'rag'

const same = (s: string): Localized => ({ en: s, pt: s })

// ---------- The ReAct loop: one run of the live agent, 14 Oct 2026 ----------
const LOOP: (Stop & { node: number })[] = [
  { node: 0, name: same('Thought'), text: {
    en: 'The question reaches the LangGraph state graph. The first of two model calls, to Gemini 2.5 Flash, decides that this needs a tool.',
    pt: 'A pergunta chega ao grafo de estados do LangGraph. A primeira de duas chamadas ao modelo, o Gemini 2.5 Flash, decide que precisa de uma ferramenta.' } },
  { node: 1, name: same('Action'), text: {
    en: 'One tool call: calculator, with the input math.sqrt(1764). The tool parses the expression into a syntax tree, rejects anything outside plain math, then evaluates it with no builtins.',
    pt: 'Uma chamada de ferramenta: calculator, com a entrada math.sqrt(1764). A ferramenta transforma a expressão em árvore sintática, rejeita tudo que não seja matemática simples e avalia sem builtins.' } },
  { node: 2, name: same('Observation'), text: {
    en: 'The tool returns 42.0, and the trace stores it as the observation of cycle 01.',
    pt: 'A ferramenta devolve 42.0, e o trace guarda isso como a observação do ciclo 01.' } },
  { node: 0, name: same('Thought'), text: {
    en: 'The second model call reads the observation and decides it can answer. No further tool is called.',
    pt: 'A segunda chamada ao modelo lê a observação e decide que já pode responder. Nenhuma outra ferramenta é chamada.' } },
  { node: 3, name: same('Answer'), text: {
    en: '“The square root of 1764 is 42.” Three recorded steps, 2,656 tokens, 3,876 ms, stored as a run that can be reopened.',
    pt: '“The square root of 1764 is 42.” Três etapas registradas, 2.656 tokens, 3.876 ms, guardadas como uma execução que pode ser reaberta.' } },
]

const loopStage: StageDef = {
  stops: LOOP,
  build(svg, W, H) {
    // 108px still fits OBSERVATION; phones get a tighter pad so the loop fits 256px.
    const narrow = W < 400, pad = narrow ? 4 : 10, G = narrow ? 30 : 34, bh = 64
    const bw = clamp(W * 0.19, 108, 176), aw = clamp(W * 0.17, 108, 170)
    const Rx0 = (bw + G) / 1.732, Ry0 = (bh + G) / 1.5
    type Mode = 'right' | 'below'
    const dims = (s: number, mode: Mode) => {
      const Rx = Rx0 * s, Ry = Ry0 * s, below = Math.max(Ry, Ry / 2 + bh / 2), loopH = Ry + bh / 2 + below
      const loopW = 1.732 * Rx + bw
      return mode === 'right'
        ? { Rx, Ry, below, w: Math.max(loopW, 0.866 * Rx + bw + 2 * G + aw) + 2 * pad, h: loopH + 2 * pad }
        : { Rx, Ry, below, w: Math.max(loopW, aw) + 2 * pad, h: loopH + G + bh + 2 * pad }
    }
    const fits = (d: { w: number; h: number }) => d.w <= W && d.h <= H
    const mode: Mode = fits(dims(1, 'right')) ? 'right' : 'below'
    let s = 1
    while (s < 2 && fits(dims(s + 0.05, mode))) s += 0.05
    const d = dims(s, mode)
    const cx = pad + 0.866 * d.Rx + bw / 2
    const cy = (H - d.h) / 2 + pad + d.Ry + bh / 2
    const at = (a: number): Point => ({ x: cx + d.Rx * Math.cos((a * Math.PI) / 180), y: cy + d.Ry * Math.sin((a * Math.PI) / 180) })
    const arcD = (a: number, b: number) => {
      let s0 = a, p = at(a), out = `M${p.x} ${p.y}`
      while (b - s0 > 1e-6) { s0 = Math.min(b, s0 + 179); p = at(s0); out += ` A${d.Rx} ${d.Ry} 0 0 1 ${p.x} ${p.y}` }
      return out
    }
    const top = at(-90)
    const ans = mode === 'right' ? { x: cx + bw / 2 + 2 * G + aw / 2, y: top.y } : { x: cx, y: cy + d.below + G + bh / 2 }
    const layer = { base: el('g', {}, svg), lit: el('g', {}, svg), fx: el('g', {}, svg), nodes: el('g', {}, svg) }
    basePath(layer.base, arcD(-90, 270))
    basePath(layer.base, `M0 ${top.y} L${top.x} ${top.y}`)
    basePath(layer.base, `M${top.x} ${top.y} L${ans.x} ${ans.y}`)
    const entry = litPath(layer.lit, `M0 ${top.y} L${top.x} ${top.y}`)
    const arc = el('path', { class: 'path-lit', d: '' }, layer.lit)
    const exit = litPath(layer.lit, mode === 'right' ? `M${top.x + bw / 2} ${top.y} L${ans.x} ${ans.y}` : `M${top.x} ${top.y} L${ans.x} ${ans.y}`)
    const pk = packets(layer.fx), pkExit = packets(layer.fx, 2)
    const tk = token(layer.fx)
    const box = (c: Point, w: number, label: string, val: string) => node(layer.nodes, { x: c.x - w / 2, y: c.y - bh / 2, w, h: bh, label, val })
    const nodes = [box(top, bw, 'Thought', 'call 1 of 2'), box(at(30), bw, 'Action', 'calculator'), box(at(150), bw, 'Observation', '42.0'), box(ans, aw, 'Answer', '3,876 ms')]
    const SPAN = [[-90, 30], [30, 150], [150, 270]]

    return {
      look: tk.dot,
      draw({ i, travel, t }) {
        let pos: Point, arcTo = -90
        setLit(entry, i === 0 ? travel : 1)
        if (i === 0) pos = pointAt(entry, travel)
        else if (i <= 3) { const [a0, a1] = SPAN[i - 1]; arcTo = a0 + (a1 - a0) * travel; pos = at(arcTo) }
        else { arcTo = 270; pos = pointAt(exit, travel) }
        arc.setAttribute('d', arcTo > -90 ? arcD(-90, arcTo) : '')
        setLit(exit, i === 4 ? travel : 0)
        placeToken(tk, pos, t)
        flow(pk, entry, i === 0 ? travel : 1, t)
        flow(pkExit, exit, i === 4 ? travel : 0, t, 1300)
        const reached = new Set(LOOP.filter((_, k) => k < i || (k === i && travel >= 1)).map(s => s.node))
        const cur = travel >= 1 ? LOOP[i].node : -1
        setVal(nodes[0], i > 3 || (i === 3 && travel >= 1) ? 'call 2 of 2' : 'call 1 of 2', t)
        nodes.forEach((nd, k) => setNode(nd, reached.has(k), k === cur, t))
      },
    }
  },
}

// ---------- The CampusCycle offline queue ----------
const QUEUE: Stop[] = [
  { name: same('Offline'), text: {
    en: 'Airplane mode. Reading still works: the service worker serves the feed and the leaderboard from a NetworkFirst cache.',
    pt: 'Modo avião. A leitura continua funcionando: o service worker serve o feed e o ranking a partir de um cache NetworkFirst.' } },
  { name: { en: 'Queued', pt: 'Na fila' }, text: {
    en: 'A listing created now cannot reach the API, so it waits in IndexedDB, marked pending, under the UUID the form generated.',
    pt: 'Um anúncio criado agora não alcança a API, então espera no IndexedDB, marcado como pending, com o UUID que o formulário gerou.' } },
  { name: same('Online'), text: {
    en: 'The connection returns. An online listener starts the sync (more browsers support it than Background Sync), and the queue is also retried on every load.',
    pt: 'A conexão volta. Um listener do evento online dispara a sincronização (mais navegadores o suportam que o Background Sync), e a fila também é reprocessada a cada carregamento.' } },
  { name: { en: 'Drained', pt: 'Sincronizada' }, text: {
    en: 'Each pending listing is posted to /api/listings in turn, always with the same UUID, and turns synced. Server errors count toward five retries.',
    pt: 'Cada anúncio pendente vai para /api/listings, um por vez, sempre com o mesmo UUID, e passa a synced. Erros do servidor contam para um limite de cinco tentativas.' } },
  { name: { en: 'Idempotent', pt: 'Idempotente' }, text: {
    en: 'A retry with a UUID the server already stored for the same owner gets a 200, not a duplicate. Validated on an installed PWA on a physical Android phone.',
    pt: 'Uma nova tentativa com um UUID que o servidor já guardou para o mesmo dono recebe 200, não uma duplicata. Validado num PWA instalado em Android físico.' } },
]

const queueStage: StageDef = {
  stops: QUEUE,
  build(svg, W, H) {
    // Stacked only when tall enough; otherwise side by side, which fits from about 300px wide.
    const horiz = W >= 470 || (W >= 296 && H < 2 * 150 + 64)
    const pw = horiz ? (W >= 470 ? clamp((W - 130) / 2.4, 170, 220) : Math.min(220, (W - 56) / 2)) : clamp(W * 0.66, 180, 260)
    const ph = horiz ? Math.min(H - 8, 236) : clamp((H - 64) / 2, 136, 236)
    const ch = clamp((ph - 58 - 10) / 3 - 8, 20, 34)
    const px = 0, py = horiz ? (H - ph) / 2 : (H - (2 * ph + 64)) / 2
    const sx = horiz ? (W >= 470 ? Math.min(W - pw, pw + 400) : W - pw) : 0, sy = horiz ? py : py + ph + 64
    const layer = { base: el('g', {}, svg), lit: el('g', {}, svg), fx: el('g', {}, svg), top: el('g', {}, svg) }
    el('rect', { class: 'device', x: px + 0.75, y: py, width: pw - 1.5, height: ph, rx: 18 }, layer.base)
    el('line', { class: 'device', x1: px + pw / 2 - 16, y1: py + 11, x2: px + pw / 2 + 16, y2: py + 11 }, layer.base)
    el('rect', { class: 'device', x: sx + 0.75, y: sy, width: pw - 1.5, height: ph, rx: 6 }, layer.base)
    const head = (x: number, y: number, a: string, b: string) => {
      el('text', { class: 'device-label', x: x + 14, y: y + 34 }, layer.base).textContent = a
      el('text', { class: 'device-val', x: x + 14, y: y + 50 }, layer.base).textContent = b
    }
    head(px, py, 'OUTBOX', 'IndexedDB')
    head(sx, sy, 'API', '/api/listings')
    const a = horiz ? { x: px + pw, y: py + ph / 2 } : { x: px + pw / 2, y: py + ph }
    const b = horiz ? { x: sx, y: sy + ph / 2 } : { x: sx + pw / 2, y: sy }
    const netD = `M${a.x} ${a.y} L${b.x} ${b.y}`
    basePath(layer.base, netD)
    const net = litPath(layer.lit, netD)
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    const netLabel = el('text', horiz ? { class: 'net-label', x: mid.x, y: mid.y - 14, 'text-anchor': 'middle' } : { class: 'net-label', x: mid.x + 16, y: mid.y + 4 }, layer.top)
    const cut = el('text', { class: 'net-label', x: mid.x, y: mid.y + 4, 'text-anchor': 'middle' }, layer.top)
    cut.textContent = '×'
    const pk = packets(layer.fx, 4)
    const slot = (x: number, y: number, j: number) => ({ x: x + 12, y: y + 58 + j * (ch + 8) })
    const cw = pw - 24
    const chip = (text: string) => {
      const g = el('g', { class: 'chip' }, layer.top)
      el('rect', { x: 0, y: 0, width: cw, height: ch, rx: 4 }, g)
      const tx = el('text', { x: 10, y: ch / 2 + 4 }, g)
      tx.textContent = text
      return { g, tx }
    }
    const chips = [0, 1, 2].map(j => chip(`#${j + 1} pending`))
    const ghost = chip('#1 retry')
    const tag = el('text', { class: 'tag', x: sx + pw, y: sy - 10, 'text-anchor': 'end' }, layer.top)
    tag.textContent = '200 · same UUID'
    const from = (j: number) => slot(px, py, j), to = (j: number) => slot(sx, sy, j)
    const ctrl = (p: Point, q: Point) => horiz ? { x: (p.x + q.x) / 2, y: Math.min(p.y, q.y) - 70 } : { x: Math.max(p.x, q.x) + cw * 0.8, y: (p.y + q.y) / 2 }
    const bez = (p: Point, q: Point, f: number) => { const c = ctrl(p, q), u = 1 - f; return { x: u * u * p.x + 2 * u * f * c.x + f * f * q.x, y: u * u * p.y + 2 * u * f * c.y + f * f * q.y } }
    const look = el('circle', { r: 1, opacity: 0 }, layer.top)
    const place = (c: { g: SVGGElement }, p: Point, o: number) => { c.g.setAttribute('transform', `translate(${p.x} ${p.y})`); c.g.style.opacity = String(o) }

    return {
      look,
      draw({ i, travel, t }) {
        setLit(net, i < 2 ? 0 : i === 2 ? travel : 1)
        flow(pk, net, i >= 3 ? 1 : 0, t, 1200)
        const online = i > 2 || (i === 2 && travel > 0.5)
        netLabel.textContent = online ? 'online' : 'offline'
        netLabel.classList.toggle('is-on', online)
        cut.style.opacity = online ? '0' : '1'
        let focus: Point | null = null
        chips.forEach((c, j) => {
          let p = from(j), o = 1, synced = false
          if (i === 0) o = 0
          else if (i === 1) {
            const cj = clamp(travel * 1.7 - j * 0.35)
            p = { x: p.x, y: p.y - (1 - easeBack(cj)) * 46 }
            o = cj
            if (cj > 0 && cj < 1) focus = p
          } else if (i === 3) {
            const mj = easeOut(clamp(travel * 1.6 - j * 0.3))
            p = bez(from(j), to(j), mj)
            synced = mj >= 1
            if (mj > 0 && mj < 1) focus = p
          } else if (i === 4) { p = to(j); synced = true }
          place(c, p, o)
          c.g.classList.toggle('is-synced', synced)
          c.g.classList.toggle('is-pending', !synced && o > 0 && i < 3)
          const label = `#${j + 1} ${synced ? 'synced' : 'pending'}`
          if (c.tx.textContent !== label) c.tx.textContent = label
        })
        // The duplicate retry flies to the server and folds into the stored listing.
        const gf = i === 4 ? easeOut(travel) : 0
        place(ghost, bez(from(0), to(0), gf), i === 4 && travel < 1 ? 1 : 0)
        if (i === 4 && travel < 1) focus = bez(from(0), to(0), gf)
        tag.style.opacity = i === 4 && travel >= 1 ? '1' : '0'
        const f: Point = focus || (online ? pointAt(net, 0.5) : from(0))
        look.setAttribute('cx', String(f.x))
        look.setAttribute('cy', String(f.y))
      },
    }
  },
}

// ---------- Advanced RAG retrieval ----------
const RAG: Stop[] = [
  { name: { en: 'Index', pt: 'Indexar' }, text: {
    en: 'Sources (files, a GitHub repository, Hugging Face) are chunked; each chunk is embedded with bge-small into ChromaDB and also indexed for BM25.',
    pt: 'As fontes (arquivos, um repositório do GitHub, Hugging Face) viram chunks; cada um ganha embedding com bge-small no ChromaDB e também entra no índice BM25.' } },
  { name: { en: 'Retrieve', pt: 'Recuperar' }, text: {
    en: 'A question goes down both paths at once: BM25 matches its words, dense search matches its meaning.',
    pt: 'A pergunta desce pelos dois caminhos ao mesmo tempo: o BM25 casa as palavras, a busca densa casa o significado.' } },
  { name: { en: 'Fuse', pt: 'Fundir' }, text: {
    en: 'Reciprocal-rank fusion merges the two rankings into one list.',
    pt: 'O reciprocal-rank fusion junta os dois rankings numa lista só.' } },
  { name: { en: 'Rerank', pt: 'Reordenar' }, text: {
    en: 'A cross-encoder rereads the fused candidates against the question and reorders them.',
    pt: 'Um cross-encoder relê os candidatos fundidos contra a pergunta e os reordena.' } },
  { name: { en: 'Answer', pt: 'Responder' }, text: {
    en: 'An LLM on a free tier writes the answer from the top chunks. If the providers fail, an extractive fallback answers with the passages themselves.',
    pt: 'Um LLM em camada gratuita escreve a resposta a partir dos melhores chunks. Se os provedores falham, um fallback extrativo responde com os próprios trechos.' } },
]

type RagKey = 'index' | 'bm25' | 'dense' | 'rrf' | 'rerank' | 'answer' | 'fallback'
type RagPath = 'src' | 'toBm25' | 'toDense' | 'bmRrf' | 'deRrf' | 'rrfRr' | 'rrAns' | 'rrFb'

const ragStage: StageDef = {
  stops: RAG,
  build(svg, W, H) {
    // m: room for a lit box to pop (scale 1.045) without leaving the cell or eating a gap.
    const G = 56, m = 4, Wi = W - 2 * m
    const wide = Wi >= 5 * 124 + 4 * G
    const layer = { base: el('g', {}, svg), lit: el('g', {}, svg), fx: el('g', {}, svg), nodes: el('g', {}, svg) }
    const box = {} as Record<RagKey, Box>
    let bh: number
    if (wide) {
      const bw = Math.min(168, (Wi - 4 * G) / 5)
      bh = 62
      const gy = 40, cy = H / 2, col = (k: number) => m + k * (bw + G), up = cy - (bh + gy) / 2, down = cy + (bh + gy) / 2
      const at: Record<RagKey, [number, number]> = { index: [col(0), cy], bm25: [col(1), up], dense: [col(1), down], rrf: [col(2), cy], rerank: [col(3), cy], answer: [col(4), up], fallback: [col(4), down] }
      for (const k of Object.keys(at) as RagKey[]) box[k] = { x: at[k][0], y: at[k][1] - bh / 2, w: bw, h: bh }
    } else {
      // Four rows: index; BM25 | dense; RRF → rerank; answer | fallback. Wide boxes pop by
      // about 4px a side, so the gap between a pair is 44px where the width allows.
      const gx = Wi < 300 ? 36 : 44
      bh = clamp((H - 2 * m - 3 * 36) / 4, 44, 58)
      const gy = clamp((H - 2 * m - 4 * bh) / 3, 36, 52), half = Math.min(190, (Wi - gx) / 2), one = Math.min(240, Wi)
      const row = (k: number) => (H - (4 * bh + 3 * gy)) / 2 + k * (bh + gy)
      const pair = (a: RagKey, b: RagKey, y: number) => { box[a] = { x: m, y, w: half, h: bh }; box[b] = { x: m + half + gx, y, w: half, h: bh } }
      const solo = (a: RagKey, y: number) => { box[a] = { x: m + (half * 2 + gx - one) / 2, y, w: one, h: bh } }
      solo('index', row(0)); pair('bm25', 'dense', row(1)); pair('rrf', 'rerank', row(2)); pair('answer', 'fallback', row(3))
    }
    const out = (b: Box) => wide ? { x: b.x + b.w, y: b.y + b.h / 2 } : { x: b.x + b.w / 2, y: b.y + b.h }
    const inn = (b: Box) => wide ? { x: b.x, y: b.y + b.h / 2 } : { x: b.x + b.w / 2, y: b.y }
    const link = (a: RagKey, b: RagKey) => curve(out(box[a]), inn(box[b]), !wide)
    const srcD = wide ? `M0 ${H / 2} L${box.index.x} ${H / 2}` : `M${inn(box.index).x} 0 L${inn(box.index).x} ${box.index.y}`
    // In the four-row layout RRF and rerank share a row, so that link runs sideways.
    const side = (a: RagKey, b: RagKey) => curve({ x: box[a].x + box[a].w, y: box[a].y + bh / 2 }, { x: box[b].x, y: box[b].y + bh / 2 }, false)
    const D: Record<RagPath, string> = { src: srcD, toBm25: link('index', 'bm25'), toDense: link('index', 'dense'), bmRrf: link('bm25', 'rrf'), deRrf: link('dense', 'rrf'), rrfRr: wide ? link('rrf', 'rerank') : side('rrf', 'rerank'), rrAns: link('rerank', 'answer'), rrFb: link('rerank', 'fallback') }
    const P = {} as Record<RagPath, LitPath>
    for (const k of Object.keys(D) as RagPath[]) { basePath(layer.base, D[k]); P[k] = litPath(layer.lit, D[k], k === 'rrFb' ? 'path-lit path-alt' : 'path-lit') }
    const pk: Partial<Record<RagPath, SVGCircleElement[]>> = { src: packets(layer.fx, 2), toBm25: packets(layer.fx, 2), toDense: packets(layer.fx, 2), bmRrf: packets(layer.fx, 2), deRrf: packets(layer.fx, 2) }
    const chunks = Array.from({ length: 6 }, () => el('rect', { class: 'packet', width: 7, height: 7, rx: 1.5, opacity: 0 }, layer.fx))
    const tk = [token(layer.fx), token(layer.fx)]
    const N: Record<RagKey, [string, string]> = { index: ['Index', 'ChromaDB + BM25'], bm25: ['BM25', 'words'], dense: ['Dense', 'bge-small'], rrf: ['RRF', 'rank fusion'], rerank: ['Rerank', 'cross-encoder'], answer: ['Answer', 'LLM, free tier'], fallback: ['Fallback', 'extractive'] }
    const nodes = {} as Record<RagKey, StageNode>
    for (const k of Object.keys(N) as RagKey[]) nodes[k] = node(layer.nodes, { ...box[k], label: N[k][0], val: N[k][1] })
    const routes: RagPath[][] = [['src'], ['toBm25', 'toDense'], ['bmRrf', 'deRrf'], ['rrfRr'], ['rrAns']]
    const reachedAt: RagKey[][] = [['index'], ['bm25', 'dense'], ['rrf'], ['rerank'], ['answer', 'fallback']]

    return {
      look: tk[0].dot,
      draw({ i, travel, t }) {
        const f = (stopIndex: number) => (i > stopIndex ? 1 : i === stopIndex ? travel : 0)
        const lit: Record<RagPath, number> = { src: f(0), toBm25: f(1), toDense: f(1), bmRrf: f(2), deRrf: f(2), rrfRr: f(3), rrAns: f(4), rrFb: f(4) }
        for (const k of Object.keys(lit) as RagPath[]) setLit(P[k], lit[k])
        for (const k of Object.keys(pk) as RagPath[]) flow(pk[k]!, P[k], lit[k], t)
        // Chunks fly into the index on the first stop.
        chunks.forEach((c, j) => {
          const cj = i === 0 ? clamp(travel * 1.5 - j * 0.1) : 0
          const p = pointAt(P.src, cj)
          c.setAttribute('x', String(p.x - 3.5))
          c.setAttribute('y', String(p.y - 3.5 + (j - 2.5) * 5 * (1 - cj)))
          c.setAttribute('opacity', cj > 0 && cj < 1 ? '0.8' : '0')
        })
        tk.forEach((tok, k) => {
          const r = routes[i][k]
          placeToken(tok, r ? pointAt(P[r], travel) : null, t, Boolean(r))
        })
        const on = new Set(reachedAt.flatMap((ks, k) => (k < i || (k === i && travel >= 1) ? ks : [])))
        const cur = new Set(travel >= 1 ? reachedAt[i] : [])
        for (const k of Object.keys(nodes) as RagKey[]) setNode(nodes[k], on.has(k), cur.has(k), t)
      },
    }
  },
}

export const STAGES: Record<StageKind, StageDef> = { loop: loopStage, queue: queueStage, rag: ragStage }
