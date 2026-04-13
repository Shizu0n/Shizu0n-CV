import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { GitHubProvider } from './contexts/GitHubContext'
import { TranslationProvider } from './contexts/TranslationContext'
import HeroSection from './sections/HeroSection'
import AboutSection from './sections/AboutSection'
import SkillsSection from './sections/SkillsSection'
import ProjectsSection from './sections/ProjectsSection'
import ContactSection from './sections/ContactSection'
import Nav from './components/Nav'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'
import FloatingChat from './components/FloatingChat'

export default function App() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  // Inject JSON-LD structured data for SEO
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Paulo Shizuo',
      url: 'https://shizu0n.vercel.app/',
      jobTitle: 'Computer Scientist & Full Stack Developer',
      sameAs: [
        'https://github.com/Shizu0n',
        'https://www.linkedin.com/in/paulo-shizuo/',
      ],
    })
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  return (
    <TranslationProvider>
      <GitHubProvider>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ScrollProgress />
        <Nav />
        <main id="main-content" className="app-shell">
          <HeroSection />
          <AboutSection />
          <SkillsSection />
          <ProjectsSection />
          <ContactSection />
        </main>
        <Footer />
        <FloatingChat />
      </GitHubProvider>
    </TranslationProvider>
  )
}
