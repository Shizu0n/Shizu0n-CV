import { useTranslation } from '../contexts/TranslationContext'
import { caseHash } from './caseRoute'

export const CONTACT_EMAIL = 'paulosvtatibana@gmail.com'

// Each measured result opens the case of the project that produced it.
const RESULTS = [
  { key: 'hero.results.1', target: caseHash('phi3-mini-sql') },
  { key: 'hero.results.2', target: caseHash('react-agent') },
  { key: 'hero.results.3', target: caseHash('campus-cycle') },
] as const

// Built from My-CV/cv-*.tex without the phone line (see CLAUDE.md).
const CV_PDF = { en: '/Paulo_Shizuo_Resume.pdf', pt: '/Paulo_Shizuo_CV.pdf' } as const

export default function HeroSection() {
  const { t, language } = useTranslation()

  return (
    <section id="top" className="hero">
      <div className="column">
        <h1 className="hero-name" data-reveal>Paulo Shizuo</h1>
        <p className="hero-lede" data-reveal>{t('hero.lede')}</p>
        <div className="hero-actions" data-reveal>
          <a className="button" href={`mailto:${CONTACT_EMAIL}`}>{t('hero.cta.email')} <span className="button-mark" aria-hidden="true">↗</span></a>
          <a className="text-link" href={CV_PDF[language]} target="_blank" rel="noopener noreferrer">{t('hero.cta.cv')}</a>
          <a className="text-link" href="https://www.linkedin.com/in/paulo-shizuo/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="text-link" href="https://github.com/Shizu0n" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <p className="hero-status" data-reveal>{t('hero.status')}</p>

        <table className="results" data-reveal>
          <caption className="visually-hidden">{t('hero.results.caption')}</caption>
          <tbody>
            {RESULTS.map(({ key, target }) => (
              <tr key={key}>
                <td><a href={target}>{t(`${key}.what`)}</a></td>
                <td>{t(`${key}.value`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
