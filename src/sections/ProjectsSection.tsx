import { motion, type Variants } from 'framer-motion'
import { useGitHub } from '../contexts/GitHubContext'

const PROJECTS = [
  {
    id: 'referral-system',
    title: 'Referral System',
    label: 'Case study 01',
    category: 'Full-stack product flow',
    summary:
      'A referral workflow shaped around authentication, point logic, and a cleaner dashboard rhythm from first action to reward tracking.',
    technologies: ['TypeScript', 'NestJS', 'React', 'SQLite'],
    href: 'https://github.com/Shizu0n/ReferralSystem',
    accent: 'Signal',
    variant: 'feature',
    visual: 'network',
  },
  {
    id: 'delivery-system',
    title: 'Delivery System',
    label: 'Case study 02',
    category: 'Operations interface',
    summary:
      'Order management, product flow, and delivery handling structured for clarity instead of dashboard clutter.',
    technologies: ['JavaScript', 'React', 'Node.js', 'MySQL'],
    href: 'https://github.com/Shizu0n/DeliverySystem',
    accent: 'Flow',
    variant: 'tall',
    visual: 'route',
  },
  {
    id: 'academic-system',
    title: 'Academic System',
    label: 'Case study 03',
    category: 'Structured backend logic',
    summary:
      'A Java-based academic management system centered on dependable rules, relational data, and maintainable domain logic.',
    technologies: ['Java', 'MySQL', 'JDBC'],
    href: 'https://github.com/Shizu0n/AcademicSystem',
    accent: 'Structure',
    variant: 'standard',
    visual: 'ledger',
  },
  {
    id: 'portfolio-sequence',
    title: 'Portfolio Sequence',
    label: 'Case study 04',
    category: 'Editorial front-end direction',
    summary:
      'This portfolio rebuilt as a single-page story with motion-led pacing, black-and-white restraint, and sharper presentation hierarchy.',
    technologies: ['React', 'TypeScript', 'Framer Motion'],
    href: 'https://github.com/Shizu0n/Shizu0n.github.io',
    accent: 'Presence',
    variant: 'wide',
    visual: 'sequence',
  },
] as const

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function ProjectsSection() {
  const { user } = useGitHub()
  const githubProfileUrl = user?.html_url ?? 'https://github.com/Shizu0n'

  return (
    <section id="projects" className="projects-section">
      <div className="projects-shell">
        <motion.div
          className="projects-header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={headerVariants}
        >
          <p className="section-kicker">Act 04 / Selected work</p>
          <h2 className="section-title">
            A curated showcase designed to read like a portfolio, not a repository dump.
          </h2>
          <p className="section-body">
            Four projects, each presented for its product thinking, technical structure, and the visual clarity behind how it is experienced.
          </p>
        </motion.div>

        <div className="projects-showcase-grid">
          {PROJECTS.map((project, index) => (
            <motion.a
              key={project.id}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`project-showcase project-showcase--${project.variant} project-showcase--${project.visual}`}
              initial={{ opacity: 0, y: index === 0 ? 18 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.58, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={`project-showcase-visual project-showcase-visual--${project.visual}`} aria-hidden="true">
                <span className="project-showcase-word">{project.accent}</span>
                <span className="project-showcase-gridline project-showcase-gridline--top" />
                <span className="project-showcase-gridline project-showcase-gridline--bottom" />
                <span className="project-showcase-frame" />
                <span className="project-showcase-frame-break" />
                <span className="project-showcase-panel project-showcase-panel--primary" />
                <span className="project-showcase-panel project-showcase-panel--secondary" />
                <span className="project-showcase-vector project-showcase-vector--one" />
                <span className="project-showcase-vector project-showcase-vector--two" />
                <span className="project-showcase-vector project-showcase-vector--three" />
                <span className="project-showcase-dot project-showcase-dot--one" />
                <span className="project-showcase-dot project-showcase-dot--two" />
                <span className="project-showcase-marker project-showcase-marker--one" />
                <span className="project-showcase-marker project-showcase-marker--two" />
                <span className="project-showcase-marker project-showcase-marker--three" />
                <span className="project-showcase-code">{project.label}</span>
              </div>

              <div className="project-showcase-copy">
                <div className="project-showcase-meta">
                  <span>{project.label}</span>
                  <span>{project.category}</span>
                </div>
                <h3 className="project-showcase-title">{project.title}</h3>
                <p className="project-showcase-summary">{project.summary}</p>
                <div className="project-showcase-stack">
                  {project.technologies.map(technology => (
                    <span key={technology}>{technology}</span>
                  ))}
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          className="projects-archive-link"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={headerVariants}
        >
          <p>For the live repository archive and ongoing experiments, visit GitHub.</p>
          <a href={githubProfileUrl} target="_blank" rel="noopener noreferrer">
            Open full GitHub archive &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  )
}
