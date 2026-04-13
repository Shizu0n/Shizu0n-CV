import { motion, type Variants } from 'framer-motion'

const CAPABILITIES = [
  {
    title: 'Front-end systems',
    summary: 'React 19, TypeScript, Vite, Tailwind 4, and Framer Motion shaped into interfaces that feel calm but intentional.',
  },
  {
    title: 'Back-end thinking',
    summary: 'NestJS, Java, Spring Boot, relational data, and REST APIs built with clear rules and maintainable structure.',
  },
  {
    title: 'Product delivery',
    summary: 'Responsive layout systems, GitHub workflows, documentation, and implementation detail that holds up in production.',
  },
]

const STACK_LOOP = [
  'React 19',
  'TypeScript',
  'Framer Motion',
  'Editorial UI',
  'API Architecture',
  'Tailwind 4',
  'Responsive Systems',
  'GitHub',
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
          {CAPABILITIES.map((capability, index) => (
            <motion.article
              key={capability.title}
              className="skills-column"
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="skills-column-index">0{index + 1}</span>
              <h3 className="skills-column-title">{capability.title}</h3>
              <p className="skills-column-summary">{capability.summary}</p>
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
