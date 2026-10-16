import type { ProjectDiagram } from './projectsPresentation'

interface ArchitectureDiagramProps {
  diagram: ProjectDiagram
  label: string
}

export default function ArchitectureDiagram({ diagram, label }: ArchitectureDiagramProps) {
  const tiers = diagram.side ? [...diagram.tiers, diagram.side] : diagram.tiers

  return (
    <figure className="diagram" aria-label={label}>
      {tiers.map((tier, index) => (
        <div key={tier.name}
          className={`diagram-tier${diagram.side && index === tiers.length - 1 ? ' diagram-tier--side' : ''}`}>
          <p className="diagram-name">{tier.name}</p>
          <ul className="diagram-nodes">
            {tier.nodes.map(node => <li key={node} className="diagram-node">{node}</li>)}
          </ul>
        </div>
      ))}
    </figure>
  )
}
