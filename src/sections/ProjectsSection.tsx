import { useState } from 'react'
import { useGitHub } from '../contexts/GitHubContext'
import { useTranslation } from '../contexts/TranslationContext'
import { getShowcaseProjects, type ChatProjectAction } from '../components/chatProjectCatalog'
import { usePointerTilt } from '../hooks/usePointerTilt'
import { PROJECT_PRESENTATION, type ProjectPresentation } from './projectsPresentation'

interface ProjectShowcaseTileProps {
  project: ChatProjectAction
  presentation: ProjectPresentation
  index: number
}

function ProjectShowcaseTile({ project, presentation, index }: ProjectShowcaseTileProps) {
  const { t, language } = useTranslation()
  const tiltRef = usePointerTilt<HTMLElement>()
  const [mediaVisible, setMediaVisible] = useState(false)
  const animated = presentation.screenshot?.endsWith('.gif')
  const showImage = Boolean(presentation.screenshot && mediaVisible)
  const mediaLabelKey = animated
    ? (mediaVisible ? 'projects.recording.stop' : 'projects.recording.play')
    : (mediaVisible ? 'projects.screenshot.hide' : 'projects.screenshot.show')
  const titleId = `project-${project.id}`

  return (
    <article ref={tiltRef} aria-labelledby={titleId}
      className={`project-showcase project-showcase--${presentation.variant} project-showcase--${presentation.visual}`}>
      <div className={`project-showcase-visual project-showcase-visual--${presentation.visual}`}>
        {showImage ? (
          <img className="project-showcase-shot" src={presentation.screenshot}
            alt={t(animated ? 'projects.recording.alt' : 'projects.screenshot.alt', { name: project.name })}
            loading="lazy" decoding="async" />
        ) : (
          <div aria-hidden="true">
            <span className="project-showcase-word">{presentation.accent}</span>
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
            <span className="project-showcase-code">{t('projects.item')} {String(index + 1).padStart(2, '0')}</span>
          </div>
        )}
        {presentation.screenshot && (
          <button type="button" className="project-preview-toggle"
            aria-label={`${t(mediaLabelKey)}: ${project.name}`}
            onClick={() => setMediaVisible(value => !value)}>
            {t(mediaLabelKey)}
          </button>
        )}
      </div>
      <div className="project-showcase-copy">
        <div className="project-showcase-meta"><span>{presentation.category[language]}</span></div>
        <h3 id={titleId} className="project-showcase-title">{project.name}</h3>
        <p className="project-showcase-summary">{project.summary[language]}</p>
        <p className="project-showcase-metric">{presentation.metric[language]}</p>
        <div className="project-showcase-stack">
          {project.stacks.slice(0, 4).map(technology => <span key={technology}>{technology}</span>)}
        </div>
        <div className="project-actions">
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer"
              aria-label={`${t('projects.demo')}: ${project.name}`}>
              {t('projects.demo')} <span aria-hidden="true">↗</span>
            </a>
          )}
          <a href={project.github} target="_blank" rel="noopener noreferrer"
            aria-label={`${t('projects.code')}: ${project.name}`}>
            {t('projects.code')} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  )
}

export default function ProjectsSection() {
  const { t } = useTranslation()
  const { user } = useGitHub()
  const githubProfileUrl = user?.html_url ?? 'https://github.com/Shizu0n'
  const projects = getShowcaseProjects()

  return (
    <section id="projects" className="projects-section" tabIndex={-1}>
      <div className="projects-shell">
        <div className="projects-header">
          <p className="section-kicker">{t('projects.kicker')}</p>
          <h2 className="section-title">{t('projects.title')}</h2>
          <p className="section-body">{t('projects.body', { count: projects.length })}</p>
        </div>
        <div className="projects-showcase-grid">
          {projects.map((project, index) => (
            <ProjectShowcaseTile key={project.id} project={project}
              presentation={PROJECT_PRESENTATION[project.id]} index={index} />
          ))}
        </div>
        <div className="projects-archive-link">
          <p>{t('projects.archive.msg')}</p>
          <a href={githubProfileUrl} target="_blank" rel="noopener noreferrer">{t('projects.archive.link')}</a>
        </div>
      </div>
    </section>
  )
}
