import { useTranslation } from '../contexts/TranslationContext'

type Skill = { name: string | { en: string; pt: string }; usedIn: string }

// Every skill names a project where it is actually used (mirrors the résumé in My-CV).
const AI_SKILLS: Skill[] = [
  { name: { en: 'Agents with LangGraph', pt: 'Agentes com LangGraph' }, usedIn: 'ReAct Agent' },
  { name: { en: 'Tool discovery over MCP', pt: 'Ferramentas via MCP' }, usedIn: 'ReAct Agent' },
  { name: { en: 'Observability and traces', pt: 'Observabilidade e traces' }, usedIn: 'ReAct Agent' },
  { name: { en: 'Fine-tuning with PEFT, QLoRA', pt: 'Fine-tuning com PEFT, QLoRA' }, usedIn: 'Phi-3 Mini' },
  { name: { en: 'Hybrid retrieval, reranking', pt: 'Recuperação híbrida, reranking' }, usedIn: 'Advanced RAG' },
  { name: { en: 'Evaluation with RAGAS', pt: 'Avaliação com RAGAS' }, usedIn: 'Advanced RAG' },
]

const SOFTWARE_SKILLS: Skill[] = [
  { name: 'Python, FastAPI', usedIn: 'ReAct Agent' },
  { name: 'PostgreSQL, pgvector', usedIn: 'ReAct Agent' },
  { name: 'TypeScript, React, PWA', usedIn: 'CampusCycle' },
  { name: 'Express, Prisma, Docker', usedIn: 'CampusCycle' },
  { name: 'NestJS, JWT', usedIn: 'Referral System' },
  { name: 'Java, Spring Boot', usedIn: 'Gym Management' },
  { name: 'MySQL, SQL', usedIn: 'Delivery System' },
]

const FACTS = ['base', 'study', 'lang'] as const

export default function AboutSection() {
  const { t, language } = useTranslation()
  const label = (skill: Skill) => (typeof skill.name === 'string' ? skill.name : skill.name[language])

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="about-grid">
        <dl className="about-facts" data-reveal>
          {FACTS.map(fact => (
            <div key={fact}>
              <dt>{t(`about.fact.${fact}.label`)}</dt>
              <dd>{t(`about.fact.${fact}.value`)}</dd>
            </div>
          ))}
        </dl>
        <div className="about-copy">
          <h2 id="about-title" className="visually-hidden">{t('about.title')}</h2>
          <p data-reveal>{t('about.body.1')}</p>
          <p data-reveal>{t('about.body.2')}</p>
        </div>

        <p className="skills-label" data-reveal>{t('about.skills')}</p>
        <div className="skills" data-reveal>
          {[
            { title: t('skills.ai'), skills: AI_SKILLS },
            { title: t('skills.software'), skills: SOFTWARE_SKILLS },
          ].map(group => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.skills.map(skill => (
                  <li key={label(skill)}><span>{label(skill)}</span><span>{skill.usedIn}</span></li>
                ))}
              </ul>
            </div>
          ))}
          <p className="skills-caption">{t('skills.caption')}</p>
        </div>
      </div>
    </section>
  )
}
