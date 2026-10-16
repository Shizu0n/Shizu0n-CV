import { useState } from 'react'
import { useTranslation } from '../contexts/TranslationContext'

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

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[next])
    try { localStorage.setItem('theme', next) } catch { /* private mode: the choice lasts this visit */ }
    setTheme(next)
  }

  return (
    <header className="nav">
      <a className="nav-wordmark" href="#top">Paulo Shizuo</a>
      <nav className="nav-links" aria-label="Primary">
        {LINKS.map(link => <a key={link.href} href={link.href}>{t(link.key)}</a>)}
        <button type="button" className="nav-toggle" onClick={toggleTheme}>
          {t(theme === 'dark' ? 'nav.theme.light' : 'nav.theme.dark')}
        </button>
        <button type="button" className="nav-toggle" onClick={toggleLanguage}
          lang={language === 'en' ? 'pt' : 'en'}
          aria-label={language === 'en' ? 'Ler em português' : 'Read in English'}>
          {language === 'en' ? 'PT' : 'EN'}
        </button>
      </nav>
    </header>
  )
}
