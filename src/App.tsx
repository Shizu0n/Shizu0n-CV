import { useEffect } from 'react'
import { TranslationProvider } from './contexts/TranslationContext'
import HeroSection from './sections/HeroSection'
import ProjectsSection from './sections/ProjectsSection'
import AboutSection from './sections/AboutSection'
import ContactSection from './sections/ContactSection'
import Nav from './components/Nav'
import Footer from './components/Footer'
import FloatingChat from './components/FloatingChat'
import { useReveal } from './hooks/useReveal'

export default function App() {
  useReveal()

  // Inject JSON-LD structured data for SEO
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Paulo Shizuo',
      url: 'https://shizu0n.vercel.app/',
      jobTitle: 'Computer Science Student',
      affiliation: { '@type': 'CollegeOrUniversity', name: 'Universidade de Fortaleza (UNIFOR)' },
      knowsAbout: [
        'LLM Agents',
        'Retrieval-Augmented Generation',
        'LLM Fine-Tuning',
        'LLM Evaluation',
        'Full-Stack Development',
      ],
      sameAs: [
        'https://github.com/Shizu0n',
        'https://www.linkedin.com/in/paulo-shizuo/',
        'https://huggingface.co/Shizu0n',
      ],
    })
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  return (
    <TranslationProvider>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main-content">
        <HeroSection />
        <ProjectsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingChat />
    </TranslationProvider>
  )
}
