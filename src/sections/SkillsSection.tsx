import { motion, type Variants } from 'framer-motion'

// Capability copy is i18n-driven (keys in TranslationContext). AI/LLM leads, then
// full-stack engineering, then production delivery — matching the AI-first positioning.
const CAPABILITY_KEYS = ['skills.cap.1', 'skills.cap.2', 'skills.cap.3'] as const

const STACK_LOOP = [
  'Python',
  'PyTorch',
  'Transformers',
  'LangGraph',
  'RAG',
  'QLoRA',
  'RAGAS',
  'FastAPI',
  'React 19',
  'TypeScript',
  'NestJS',
  'Tailwind 4',
]

const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

import { useTranslation } from '../contexts/TranslationContext'

export default function SkillsSection() {
  const { t } = useTranslation()
  return (
    <section id="skills" className="skills-section">
      <div className="skills-shell">
        <motion.div
          className="skills-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={reveal}
        >
          <p className="section-kicker">{t('skills.kicker')}</p>
          <h2 className="section-title">
            {t('skills.title')}
          </h2>
          <p className="section-body">
            {t('skills.body')}
          </p>
        </motion.div>

        <div className="skills-columns">
          {CAPABILITY_KEYS.map((capabilityKey, index) => (
            <motion.article
              key={capabilityKey}
              className="skills-column"
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="skills-column-index">0{index + 1}</span>
              <h3 className="skills-column-title">{t(`${capabilityKey}.title`)}</h3>
              <p className="skills-column-summary">{t(`${capabilityKey}.summary`)}</p>
            </motion.article>
          ))}
        </div>

        <div className="skills-ticker" aria-label="Selected tools">
          <div className="skills-ticker-track">
            {[...STACK_LOOP, ...STACK_LOOP].map((item, index) => (
              <span key={`${item}-${index}`} className="skills-ticker-item">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
