import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../contexts/TranslationContext'
import { useBotChapter } from './ChatBot'

const LINKS = [
  { href: '#projects', key: 'nav.projects' },
  { href: '#about', key: 'nav.about' },
  { href: '#contact', key: 'nav.contact' },
] as const

type Theme = 'dark' | 'light'
// Dark is the primary face; index.html applies a stored choice before the first paint.
const THEME_COLOR: Record<Theme, string> = { dark: '#0e0d0c', light: '#e6e1d8' }

export default function Nav() {
  const { t, language, toggleLanguage } = useTranslation()
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'))
  const headerRef = useRef<HTMLElement>(null)
  const indexRef = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)
  const [open, setOpen] = useState(false)
  const chapter = useBotChapter()
  const current = LINKS.find(link => link.href === `#${chapter}`)

  // The index takes over only once the top nav has scrolled away.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setShown(!entry.isIntersecting)
      if (entry.isIntersecting) setOpen(false)
    })
    if (headerRef.current) observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onPointer = (e: PointerEvent) => { if (!indexRef.current?.contains(e.target as Node)) setOpen(false) }
    addEventListener('keydown', onKey)
    addEventListener('pointerdown', onPointer)
    return () => { removeEventListener('keydown', onKey); removeEventListener('pointerdown', onPointer) }
  }, [open])

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next])
    try { localStorage.setItem('theme', next) } catch { /* private mode: the choice lasts this visit */ }
    setTheme(next)
  }

  const toggles = (
    <>
      <button type="button" className="nav-toggle" onClick={toggleTheme}>
        {t(theme === 'dark' ? 'nav.theme.light' : 'nav.theme.dark')}
      </button>
      <button type="button" className="nav-toggle" onClick={toggleLanguage}
        lang={language === 'en' ? 'pt' : 'en'}
        aria-label={language === 'en' ? 'Ler em português' : 'Read in English'}>
        {language === 'en' ? 'PT' : 'EN'}
      </button>
    </>
  )

  return (
    <header className="nav" ref={headerRef}>
      <a className="nav-wordmark" href="#top">Paulo Shizuo</a>
      <nav className="nav-links" aria-label="Primary">
        {LINKS.map(link => <a key={link.href} href={link.href}>{t(link.key)}</a>)}
        {toggles}
      </nav>
      {/* The running head: the section being read, in the wordmark's corner, opening into the same links. */}
      <nav ref={indexRef} className={`index${shown ? ' is-shown' : ''}${open ? ' is-open' : ''}`} aria-label={t('nav.sections')}>
        <button type="button" className="index-current" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          <span className="visually-hidden">{t('nav.sections')}: </span>
          {current ? t(current.key) : 'Paulo Shizuo'}
        </button>
        <div className="index-body">
          <a className="nav-wordmark" href="#top" onClick={() => setOpen(false)}>Paulo Shizuo</a>
          <ul>
            {LINKS.map(link => (
              <li key={link.href}>
                <a href={link.href} aria-current={link === current ? 'location' : undefined} onClick={() => setOpen(false)}>{t(link.key)}</a>
              </li>
            ))}
          </ul>
          <div className="index-toggles">{toggles}</div>
        </div>
      </nav>
    </header>
  )
}
