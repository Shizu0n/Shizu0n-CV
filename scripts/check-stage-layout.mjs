// Layout check for the project case stages. With the dev server running (npm run dev):
//   node scripts/check-stage-layout.mjs [http://localhost:3000/]
// Opens every featured case in both languages at six sizes, scrolls each stage through its
// stops and fails on overlapping boxes, boxes outside the diagram cell, a stage whose content
// overflows, the chat bot over caption text, sideways page overflow or console errors.
import { chromium } from '@playwright/test'

const URL = process.argv[2] ?? 'http://localhost:3000/'
const SIZES = [[1280, 800], [845, 510], [711, 513], [375, 667], [375, 553], [320, 640]]
const CASES = ['react-agent', 'phi3-mini-sql', 'campus-cycle', 'advanced-rag']

// The project's Playwright may expect a browser build that is not downloaded; installed Chrome works too.
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }))
const page = await browser.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(String(e)))
let failed = false

for (const lang of ['pt', 'en']) {
  for (const [w, h] of SIZES) {
    await page.setViewportSize({ width: w, height: h })
    await page.goto(URL)
    await page.evaluate(l => { localStorage.setItem('shizu0n_lang', l); localStorage.setItem('bot-intro', 'seen') }, lang)
    await page.goto(URL)
    await page.waitForTimeout(600)
    const row = await page.evaluate(async ids => {
      const wait = ms => new Promise(r => setTimeout(r, ms))
      const hit = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5
      const gap = (a, b) => Math.max(b.left - a.right, a.left - b.right, b.top - a.bottom, a.top - b.bottom)
      scrollTo({ top: document.getElementById('projects').offsetTop, behavior: 'instant' })
      await wait(1500)
      const res = { pageOverflow: document.documentElement.scrollWidth > innerWidth, cases: {} }
      for (const id of ids) {
        document.getElementById(`card-${id}`).click()
        await wait(800)
        const c = document.querySelector('.case'), s = c.querySelector('.scrolly'), st = s.querySelector('.stage')
        const pin = parseFloat(getComputedStyle(st).top) || 0
        const r = { overlaps: 0, minGap: null, outside: 0, stageOverflow: false, botOnText: false }
        for (const f of [0.1, 0.3, 0.5, 0.7, 0.95]) {
          c.scrollTop = s.offsetTop - pin + (s.offsetHeight - st.offsetHeight) * f
          await wait(1400)
          const svg = s.querySelector('svg')
          if (svg) {
            const cell = svg.getBoundingClientRect()
            const boxes = [...svg.querySelectorAll('.node rect.box, rect.device')].map(e => e.getBoundingClientRect())
            for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
              if (hit(boxes[i], boxes[j])) r.overlaps++
              else r.minGap = Math.min(r.minGap ?? Infinity, Math.round(gap(boxes[i], boxes[j])))
            }
            r.outside += boxes.filter(b => b.top < cell.top - 1 || b.bottom > cell.bottom + 1 || b.left < cell.left - 1 || b.right > cell.right + 1).length
          }
          r.stageOverflow ||= st.scrollHeight > st.clientHeight + 1
          const range = document.createRange()
          range.selectNodeContents(s.querySelector('.caption'))
          const bot = document.querySelector('.bot').getBoundingClientRect()
          r.botOnText ||= [...range.getClientRects()].some(t => hit(t, bot))
        }
        res.cases[id] = r
        document.querySelector('.case-back').click()
        await wait(800)
      }
      return res
    }, CASES)
    const bad = Object.entries(row.cases).filter(([, r]) => r.overlaps || r.outside || r.stageOverflow || r.botOnText)
    const gaps = Object.entries(row.cases).map(([id, r]) => `${id} ${r.minGap ?? '-'}`).join(', ')
    console.log(`${lang} ${w}x${h}: ${bad.length || row.pageOverflow ? 'FAIL' : 'ok'} (min gap px: ${gaps})`)
    if (row.pageOverflow) console.log('  page scrolls sideways')
    for (const [id, r] of bad) console.log(`  ${id}: ${JSON.stringify(r)}`)
    failed ||= bad.length > 0 || row.pageOverflow
  }
}
await browser.close()
if (errors.length) { console.log('console errors:', errors); failed = true }
process.exit(failed ? 1 : 0)
