import { useState } from 'react'
import { useTranslation } from '../contexts/TranslationContext'
import { CONTACT_EMAIL } from './HeroSection'

const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/paulo-shizuo/', text: 'linkedin.com/in/paulo-shizuo' },
  { label: 'GitHub', href: 'https://github.com/Shizu0n', text: 'github.com/Shizu0n' },
  { label: 'Hugging Face', href: 'https://huggingface.co/Shizu0n', text: 'huggingface.co/Shizu0n' },
]

export default function ContactSection() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.location.href = `mailto:${CONTACT_EMAIL}`
    }
  }

  return (
    <section id="contact" className="contact">
      <div className="column">
        <h2 className="contact-prompt" data-reveal>
          <span>{t('contact.title.1')}</span>
          <span>{t('contact.title.2')}</span>
        </h2>
        <div className="email-field" data-reveal>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <button type="button" className="copy-button" onClick={copyEmail} aria-label={t('contact.email.copy')}>
            <span aria-live="polite">{copied ? t('contact.email.copied') : t('contact.email.copyShort')}</span>
          </button>
        </div>
        <p className="contact-next" data-reveal>{t('contact.next')}</p>

        <dl className="contact-rows" data-reveal>
          {LINKS.map(link => (
            <div key={link.label} style={{ display: 'contents' }}>
              <dt>{link.label}</dt>
              <dd><a className="text-link" href={link.href} target="_blank" rel="noopener noreferrer">{link.text}</a></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
