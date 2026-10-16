import { useTranslation } from '../contexts/TranslationContext'
import { caseHash } from './caseRoute'

export const CONTACT_EMAIL = 'paulosvtatibana@gmail.com'

// Each measured result opens the case of the project that produced it.
const RESULTS = [
  { key: 'hero.results.1', target: caseHash('phi3-mini-sql') },
  { key: 'hero.results.2', target: caseHash('react-agent') },
  { key: 'hero.results.3', target: caseHash('campus-cycle') },
] as const

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section id="top" className="hero">
      <div className="column">
        <h1 className="hero-name" data-reveal>Paulo Shizuo</h1>
        <p className="hero-lede" data-reveal>{t('hero.lede')}</p>
        <div className="hero-actions" data-reveal>
          <a className="button" href={`mailto:${CONTACT_EMAIL}`}>{t('hero.cta.email')} <span className="button-mark" aria-hidden="true">↗</span></a>
          <a className="text-link" href="#projects">{t('hero.cta.work')}</a>
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
