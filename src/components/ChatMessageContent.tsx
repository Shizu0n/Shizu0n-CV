import { Fragment, type ReactNode } from 'react'
import type { ChatProjectAction, Language } from './chatProjectCatalog'

const HEADING_RE = /^#{1,6}\s+/
const LIST_ITEM_RE = /^(?:[-*]|\d+[.)])\s+/

interface ChatMessageContentProps {
  content: string
  role: 'user' | 'assistant'
  language: Language
  projectActions?: ChatProjectAction[]
}

function getLinkAttributes(href: string) {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return {
      target: '_blank' as const,
      rel: 'noopener noreferrer',
    }
  }

  return {}
}

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /(\[([^\]]+)\]\s*\(((?:https?:\/\/|mailto:)[^\s)]+)\)|\*\*([^*]+)\*\*|((?:https?:\/\/|mailto:)[^\s)]+)|\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    const [fullMatch, markdownLink, linkLabel, linkUrl, boldText, plainUrl, emailAddress] = match
    const start = match.index

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start))
    }

    if (markdownLink && linkLabel && linkUrl) {
      nodes.push(
        <a
          key={`${keyPrefix}-link-${start}`}
          href={linkUrl}
          {...getLinkAttributes(linkUrl)}
          className="chat-inline-link"
        >
          {linkLabel}
        </a>,
      )
    } else if (boldText) {
      nodes.push(
        <strong key={`${keyPrefix}-strong-${start}`} className="chat-inline-strong">
          {boldText}
        </strong>,
      )
    } else if (plainUrl) {
      const href = plainUrl.replace(/[),.!?]+$/, '')
      nodes.push(
        <a
          key={`${keyPrefix}-url-${start}`}
          href={href}
          {...getLinkAttributes(href)}
          className="chat-inline-link"
        >
          {href}
        </a>,
      )
    } else if (emailAddress) {
      nodes.push(
        <a
          key={`${keyPrefix}-email-${start}`}
          href={`mailto:${emailAddress}`}
          className="chat-inline-link"
        >
          {emailAddress}
        </a>,
      )
    } else {
      nodes.push(fullMatch)
    }

    lastIndex = start + fullMatch.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

function renderBlocks(content: string) {
  const blocks = content
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  return blocks.map((block, blockIndex) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)

    // A heading-only block (e.g. "### Tools") renders as a styled sub-heading
    // instead of leaking the literal '#' markers into the text.
    if (lines.length === 1 && HEADING_RE.test(lines[0])) {
      return (
        <p key={`subhead-${blockIndex}`} className="chat-rich-subhead">
          <strong>{parseInline(lines[0].replace(HEADING_RE, ''), `subhead-${blockIndex}`)}</strong>
        </p>
      )
    }

    // Treat bullet ("- ", "* ") and numbered ("1. ", "2) ") items alike so dense
    // numbered answers no longer collapse into an unbroken paragraph.
    const isList = lines.length > 0 && lines.every((line) => LIST_ITEM_RE.test(line))
    if (isList) {
      return (
        <ul key={`list-${blockIndex}`} className="chat-rich-list">
          {lines.map((line, lineIndex) => (
            <li key={`list-${blockIndex}-${lineIndex}`}>
              {parseInline(line.replace(LIST_ITEM_RE, ''), `list-${blockIndex}-${lineIndex}`)}
            </li>
          ))}
        </ul>
      )
    }

    // Paragraph block: keep intentional single line breaks and strip any stray
    // heading markers per line.
    return (
      <p key={`paragraph-${blockIndex}`} className="chat-rich-paragraph">
        {lines.map((line, lineIndex) => (
          <Fragment key={`paragraph-${blockIndex}-${lineIndex}`}>
            {lineIndex > 0 && <br />}
            {parseInline(line.replace(HEADING_RE, ''), `paragraph-${blockIndex}-${lineIndex}`)}
          </Fragment>
        ))}
      </p>
    )
  })
}

export default function ChatMessageContent({
  content,
  role,
  language,
  projectActions = [],
}: ChatMessageContentProps) {
  const isPortuguese = language === 'pt'

  return (
    <div className="chat-message-body">
      <div className="chat-rich-text">{renderBlocks(content)}</div>

      {role === 'assistant' && projectActions.length > 0 && (
        <div className="chat-project-actions">
          {projectActions.map((project) => (
            <div key={project.id} className="chat-project-card">
              <div className="chat-project-copy">
                <span className="chat-project-title">{project.name}</span>
                <p className="chat-project-summary">
                  {isPortuguese ? project.summary.pt : project.summary.en}
                </p>
                <div className="chat-project-stack">
                  {project.stacks.map((stack) => (
                    <span key={stack}>{stack}</span>
                  ))}
                </div>
              </div>

              <div className="chat-project-links">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chat-project-link"
                >
                  GitHub
                </a>
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chat-project-link chat-project-link--ghost"
                  >
                    {isPortuguese ? 'Abrir site' : 'Open site'}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
