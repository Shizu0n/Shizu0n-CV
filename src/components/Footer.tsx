import { useTranslation } from '../contexts/TranslationContext'

const SOURCE_URL = 'https://github.com/Shizu0n/Shizu0n-CV'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="footer">
      <span>{t('footer.what')}</span>
      <span className="footer-links">
        <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer">{t('footer.source')}</a>
        <a href="https://github.com/Shizu0n" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/paulo-shizuo/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </span>
      <span className="footer-year">{new Date().getFullYear()}</span>
    </footer>
  )
}
