// Renders public/og.png, the 1200x630 link preview (LinkedIn, Slack, WhatsApp): node scripts/og-image.mjs
// The numbers mirror the hero's measured results (hero.results.* in TranslationContext); re-run after changing them.
import { fileURLToPath } from 'url'
import { chromium } from '@playwright/test'

const RESULTS = [
  ['Phi-3 Mini text-to-SQL, exact match on 200 held-out questions', '2% → 73.5%'],
  ['ReAct agent: backend tests, plus 22 labeled regression cases', '154 tests'],
  ['CampusCycle offline-first PWA, sync validated on Android', '64 tests'],
]

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Source+Serif+4:opsz,wght@8..60,400&family=IBM+Plex+Mono:wght@500&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; padding: 64px 80px; background: #0e0d0c; color: #e6e1d8; font-family: 'Source Serif 4', serif; display: flex; flex-direction: column; }
  h1 { font-family: 'Young Serif', serif; font-weight: 400; font-size: 104px; line-height: 0.95; letter-spacing: -0.03em; }
  p.lede { margin-top: 24px; font-size: 32px; line-height: 1.3; max-width: 960px; }
  ul { list-style: none; padding: 0; margin-top: auto; }
  li { display: flex; justify-content: space-between; align-items: baseline; gap: 24px; padding: 12px 0; border-top: 1px solid rgba(230, 225, 216, 0.16); font-size: 24px; }
  li b { font-family: 'Young Serif', serif; font-weight: 400; font-size: 32px; color: #cbc6dc; white-space: nowrap; }
  .url { margin-top: 18px; font-family: 'IBM Plex Mono', monospace; font-size: 18px; letter-spacing: 0.08em; color: #a995f0; }
</style></head><body>
  <h1>Paulo Shizuo</h1>
  <p class="lede">Computer Science student at UNIFOR. Builds AI systems and the <span style="white-space: nowrap">full-stack</span> applications around them.</p>
  <ul>${RESULTS.map(([what, value]) => `<li><span>${what}</span><b>${value}</b></li>`).join('')}</ul>
  <p class="url">shizu0n.vercel.app</p>
</body></html>`

// The project's Playwright may expect a browser build that is not downloaded; installed Chrome works too.
const browser = await chromium.launch().catch(() => chromium.launch({ channel: 'chrome' }))
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: fileURLToPath(new URL('../public/og.png', import.meta.url)) })
await browser.close()
console.log('wrote public/og.png')
