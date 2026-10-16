import type { ProjectPresentation } from './projectsPresentation'

// Each card's small mark echoes its case stage; it idles and wakes up on hover (see CSS).
export default function CardGlyph({ glyph }: { glyph: NonNullable<ProjectPresentation['glyph']> }) {
  return (
    <svg className="glyph" viewBox="0 0 120 72" aria-hidden="true">
      {glyph === 'loop' && (
        <>
          <circle className="g-line" cx="40" cy="36" r="24" />
          <line className="g-line" x1="40" y1="12" x2="104" y2="12" />
          <rect className="g-box" x="96" y="6" width="18" height="12" rx="2" />
          <rect className="g-box" x="31" y="6" width="18" height="12" rx="2" />
          <rect className="g-box" x="52" y="42" width="18" height="12" rx="2" />
          <rect className="g-box" x="10" y="42" width="18" height="12" rx="2" />
          <g className="spin"><circle className="g-dot" cx="40" cy="12" r="3.5" /></g>
        </>
      )}
      {glyph === 'grid' && Array.from({ length: 50 }, (_, k) => (
        <rect key={k} className={k < 37 ? 'g-hit pulse' : 'g-cell'}
          style={{ animationDelay: `${((k % 10) + Math.floor(k / 10)) * 60}ms` }}
          x={6 + (k % 10) * 11} y={8 + Math.floor(k / 10) * 11} width="9" height="9" rx="1" />
      ))}
      {glyph === 'queue' && (
        <>
          <rect className="g-line" x="4" y="8" width="34" height="56" rx="7" />
          <rect className="g-line" x="82" y="8" width="34" height="56" rx="3" />
          <line className="g-lit" x1="38" y1="36" x2="82" y2="36" />
          <g className="shuttle"><rect className="g-box" x="10" y="30" width="22" height="12" rx="2" /></g>
        </>
      )}
      {glyph === 'lanes' && (
        <>
          <path className="g-line" d="M4 36 C24 36 24 16 44 16 L76 16 C96 16 96 36 116 36" />
          <path className="g-line" d="M4 36 C24 36 24 56 44 56 L76 56 C96 56 96 36 116 36" />
          <circle className="g-dot lane-a" cx="34" cy="16" r="3.5" />
          <circle className="g-dot lane-b" cx="34" cy="56" r="3.5" />
        </>
      )}
    </svg>
  )
}
