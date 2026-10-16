import { useEffect, useRef, type RefObject } from 'react'
import { useTranslation } from '../contexts/TranslationContext'
import type { ChatProjectAction } from '../components/chatProjectCatalog'
import { reduceMotion } from '../scrolly/motion'
import type { ProjectPresentation } from './projectsPresentation'
import ArchitectureDiagram from './ArchitectureDiagram'
import ScrollStage from './ScrollStage'
import EvalStage from './EvalStage'

interface ProjectCaseProps {
  project: ChatProjectAction
  presentation: ProjectPresentation
  index: number
  prev: ChatProjectAction
  next: ChatProjectAction
  scroller: RefObject<HTMLDivElement | null>
  onClose: () => void
  onGo: (id: string) => void
}

/** The inside of the case panel: what moves through the system, what was measured, the limits. */
export default function ProjectCase({ project, presentation: p, index, prev, next, scroller, onClose, onGo }: ProjectCaseProps) {
  const { t, language } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Recordings play only while on screen.
  useEffect(() => {
    const video = videoRef.current, root = scroller.current
    if (!video || !root || reduceMotion()) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {})
      else video.pause()
    }, { root, threshold: 0.4 })
    observer.observe(video)
    return () => observer.disconnect()
  }, [project.id, scroller])

  const media = p.media

  return (
    <>
      <div className="case-bar">
        <button type="button" className="case-back" onClick={onClose}>
          <span aria-hidden="true">←</span><span>{t('case.back')}</span>
        </button>
        <div className="case-nav">
          <button type="button" onClick={() => onGo(prev.id)}>← {prev.name}</button>
          <button type="button" onClick={() => onGo(next.id)}>{next.name} →</button>
        </div>
      </div>

      <div className="case-inner">
        <header className="case-head column">
          <p className="chapter-index t-label">0{index + 1} · {p.kind[language]} · {p.year}</p>
          <h2 className="chapter-title" id="case-title" tabIndex={-1}>{project.name}</h2>
          {p.headline && (
            <p className="case-result">{p.headline.value[language]} <span className="muted">{p.headline.label[language]}</span></p>
          )}
          <div className="case-links">
            {project.live && (
              <a className="button" href={project.live} target="_blank" rel="noopener noreferrer">
                {t('projects.demo')} <span className="button-mark" aria-hidden="true">↗</span>
              </a>
            )}
            <a className="text-link" href={project.github} target="_blank" rel="noopener noreferrer">{t('projects.code')}</a>
            {p.modelUrl && <a className="text-link" href={p.modelUrl} target="_blank" rel="noopener noreferrer">{t('projects.model')}</a>}
          </div>
          {p.demoNote && <p className="case-note">{p.demoNote[language]}</p>}
        </header>

        {p.stage === 'eval' ? <EvalStage scroller={scroller} /> : p.stage && <ScrollStage kind={p.stage} scroller={scroller} />}

        <div className="case-body">
          {p.sample && (
            <div className="column">
              <p className="muted case-small">{t('eval.sample')}</p>
              <dl className="sample">
                <dt>{t('eval.sample.q')}</dt>
                <dd><pre><code>{p.sample.question}</code></pre></dd>
                <dt>{t('eval.sample.a')}</dt>
                <dd><pre><code>{p.sample.sql}</code></pre></dd>
              </dl>
              <p className="case-limit">{t('eval.limit')}</p>
            </div>
          )}
          <div className="column">
            <p>{p.description[language]}</p>
            {p.result && <p className="muted case-result-text">{p.result[language]}</p>}
          </div>
          {media && (
            <figure className="case-figure">
              <div className="frame">
                {media.recording ? (
                  <video ref={videoRef} muted loop playsInline controls preload="none" poster={media.poster}
                    width={media.width} height={media.height} aria-label={t('projects.recording.alt', { name: project.name })}>
                    <source src={media.recording.webm} type="video/webm" />
                    <source src={media.recording.mp4} type="video/mp4" />
                  </video>
                ) : (
                  <img src={media.poster} alt={t('projects.screenshot.alt', { name: project.name })}
                    width={media.width} height={media.height} loading="lazy" decoding="async" />
                )}
              </div>
              <figcaption>{media.caption[language]}</figcaption>
            </figure>
          )}
          {media?.secondary && (
            <figure className="case-figure">
              <div className="frame">
                <img src={media.secondary.src} alt="" width={media.secondary.width} height={media.secondary.height} loading="lazy" decoding="async" />
              </div>
              <figcaption>{media.secondary.caption[language]}</figcaption>
            </figure>
          )}
          {p.diagram && (
            <div className="case-figure">
              <ArchitectureDiagram diagram={p.diagram} label={t('projects.diagram', { name: project.name })} />
            </div>
          )}
          <div className="column">
            <p className="t-label muted case-stack-label">{t('projects.stack')}</p>
            <ul className="stack">{project.stacks.map(s => <li key={s}>{s}</li>)}</ul>
          </div>
          <div className="column">
            <button type="button" className="text-link case-next" onClick={() => onGo(next.id)}>{t('case.next', { name: next.name })} →</button>
          </div>
        </div>
      </div>
    </>
  )
}
