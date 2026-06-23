/**
 * Presentation chrome for the project grid, keyed by the canonical catalog id from
 * chatProjectCatalog. The project DATA (names, summaries, github, stacks) lives in the
 * catalog as the single source of truth; this map only describes how each tile is laid
 * out and decorated. Keeping it keyed by catalog id — and guarded by a test that its
 * keys match the catalog exactly — stops the grid from drifting out of sync again.
 *
 * All projects render in one unified grid; the 8 tiles fill four 12-column rows
 * (7+5, 5+7, 7+5, 5+7). `group` no longer splits the section — it only marks the AI/ML
 * builds so their tiles lead with the live demo link.
 */

export type ProjectVariant = 'feature' | 'tall' | 'standard' | 'wide'
export type ProjectVisual = 'network' | 'route' | 'ledger' | 'sequence'
export type ProjectGroup = 'application' | 'ai'

export interface ProjectPresentation {
  group: ProjectGroup
  variant: ProjectVariant
  visual: ProjectVisual
  accent: string
  category: { en: string; pt: string }
}

export const PROJECT_PRESENTATION: Record<string, ProjectPresentation> = {
  // Row 1: 7 + 5
  'academic-system': {
    group: 'application',
    variant: 'feature',
    visual: 'ledger',
    accent: 'Structure',
    category: { en: 'Structured backend logic', pt: 'Lógica de backend estruturada' },
  },
  'delivery-system': {
    group: 'application',
    variant: 'tall',
    visual: 'route',
    accent: 'Flow',
    category: { en: 'Operations interface', pt: 'Interface operacional' },
  },
  // Row 2: 5 + 7
  'gym-management': {
    group: 'application',
    variant: 'standard',
    visual: 'ledger',
    accent: 'System',
    category: { en: 'Management platform', pt: 'Plataforma de gestão' },
  },
  'referral-system': {
    group: 'application',
    variant: 'wide',
    visual: 'network',
    accent: 'Signal',
    category: { en: 'Full-stack product flow', pt: 'Fluxo de produto full-stack' },
  },
  // Row 3: 7 + 5
  'shizu0n-cv': {
    group: 'application',
    variant: 'feature',
    visual: 'sequence',
    accent: 'Presence',
    category: { en: 'Editorial front-end direction', pt: 'Direção de front-end editorial' },
  },
  'react-agent': {
    group: 'ai',
    variant: 'tall',
    visual: 'network',
    accent: 'Reason',
    category: { en: 'Observable agent system', pt: 'Sistema de agente observável' },
  },
  // Row 4: 5 + 7
  'advanced-rag': {
    group: 'ai',
    variant: 'standard',
    visual: 'sequence',
    accent: 'Retrieve',
    category: { en: 'RAG engineering & eval', pt: 'Engenharia e avaliação de RAG' },
  },
  'phi3-mini-sql': {
    group: 'ai',
    variant: 'wide',
    visual: 'ledger',
    accent: 'Fine-tune',
    category: { en: 'LLM fine-tuning', pt: 'Fine-tuning de LLM' },
  },
}
