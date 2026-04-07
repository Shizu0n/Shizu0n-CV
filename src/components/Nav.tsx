import { useEffect, useState } from 'react'
import { useTranslation } from '../contexts/TranslationContext'

const SECTIONS = ['hero', 'about', 'skills', 'projects', 'contact']
const NAV_KEYS = ['#about', '#skills', '#projects', '#contact'] as const

type NavKey = (typeof NAV_KEYS)[number]

export default function Nav() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.4 },
    )

    SECTIONS.forEach(id => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) {
      return undefined
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  const navLabels: Record<NavKey, string> = {
    '#about': t('nav.about'),
    '#skills': t('nav.skills'),
    '#projects': t('nav.projects'),
    '#contact': t('nav.contact'),
  }

  const navIds: Record<NavKey, string> = {
    '#about': 'about',
    '#skills': 'skills',
    '#projects': 'projects',
    '#contact': 'contact',
  }

  const handleNavClick = (href: NavKey | '#hero') => {
    setMobileOpen(false)
    const element = document.querySelector(href)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`} aria-label="Primary">
        <div className="nav-inner">
          <button
            type="button"
            className="nav-logo"
            onClick={() => handleNavClick('#hero')}
            aria-label="Back to top"
          >
            PS
          </button>

          <div className="nav-desktop">
            {NAV_KEYS.map(key => (
              <a
                key={key}
                href={key}
                className={`nav-link ${activeSection === navIds[key] ? 'active' : ''}`}
                aria-current={activeSection === navIds[key] ? 'page' : undefined}
                onClick={event => {
                  event.preventDefault()
                  handleNavClick(key)
                }}
              >
                {navLabels[key]}
              </a>
            ))}
          </div>

          <button
            type="button"
            className="nav-hamburger"
            onClick={() => setMobileOpen(value => !value)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <span className={mobileOpen ? 'open' : ''} />
            <span className={mobileOpen ? 'open' : ''} />
            <span className={mobileOpen ? 'open' : ''} />
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav"
        className={`mobile-overlay ${mobileOpen ? 'open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        <div className="mobile-inner">
          {NAV_KEYS.map(key => (
            <a
              key={key}
              href={key}
              className={`mobile-link ${activeSection === navIds[key] ? 'active' : ''}`}
              aria-current={activeSection === navIds[key] ? 'page' : undefined}
              onClick={event => {
                event.preventDefault()
                handleNavClick(key)
              }}
            >
              {navLabels[key]}
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
