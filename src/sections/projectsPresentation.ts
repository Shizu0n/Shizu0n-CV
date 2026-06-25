/**
 * Presentation chrome for the project grid, keyed by the canonical catalog id from
 * chatProjectCatalog. The project DATA (names, summaries, github, stacks) lives in the
 * catalog as the single source of truth; this map only describes how each tile is laid
 * out and decorated. Keeping it keyed by catalog id — and guarded by a test that its
 * keys match the catalog exactly — stops the grid from drifting out of sync again.
 *
 * All projects render in one unified grid. The catalog is AI-first, so the three applied-AI
 * builds lead, then the portfolio, then the full-stack application systems. The 8 tiles fill
 * four 12-column rows (7+5, 5+7, 7+5, 5+7). `group` no longer splits the section — it only
 * marks the AI/ML builds so their tiles lead with the live demo link. `metric` is a short
 * outcome/evidence line surfaced on the tile (the result, not just the stack).
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
  metric: { en: string; pt: string }
}

export const PROJECT_PRESENTATION: Record<string, ProjectPresentation> = {
  // Row 1: 7 + 5 — applied-AI builds lead
  'react-agent': {
    group: 'ai',
    variant: 'feature',
    visual: 'network',
    accent: 'Reason',
    category: { en: 'Observable agent system', pt: 'Sistema de agente observável' },
    metric: {
      en: 'Live · streamed reasoning traces + evaluation harness',
      pt: 'No ar · traços de raciocínio em streaming + harness de avaliação',
    },
  },
  'advanced-rag': {
    group: 'ai',
    variant: 'tall',
    visual: 'sequence',
    accent: 'Retrieve',
    category: { en: 'RAG engineering & eval', pt: 'Engenharia e avaliação de RAG' },
    metric: {
      en: 'Hybrid retrieval (BM25 + dense + RRF) · RAGAS evaluation',
      pt: 'Retrieval híbrido (BM25 + denso + RRF) · avaliação RAGAS',
    },
  },
  // Row 2: 5 + 7
  'phi3-mini-sql': {
    group: 'ai',
    variant: 'standard',
    visual: 'ledger',
    accent: 'Fine-tune',
    category: { en: 'LLM fine-tuning', pt: 'Fine-tuning de LLM' },
    metric: {
      en: '73.5% exact-match SQL (from 2% base) · QLoRA on a single T4',
      pt: '73,5% de exact-match em SQL (de 2% base) · QLoRA numa única T4',
    },
  },
  'shizu0n-cv': {
    group: 'application',
    variant: 'wide',
    visual: 'sequence',
    accent: 'Presence',
    category: { en: 'AI portfolio + RAG chat', pt: 'Portfólio com IA + RAG' },
    metric: {
      en: 'RAG over Supabase pgvector · multi-provider SSE chat',
      pt: 'RAG sobre Supabase pgvector · chat SSE multi-provedor',
    },
  },
  // Row 3: 7 + 5 — full-stack application systems
  'referral-system': {
    group: 'application',
    variant: 'feature',
    visual: 'network',
    accent: 'Signal',
    category: { en: 'Full-stack product flow', pt: 'Fluxo de produto full-stack' },
    metric: {
      en: 'JWT auth · recursive referral modeling · NestJS + TypeScript',
      pt: 'Auth JWT · modelagem recursiva de indicação · NestJS + TypeScript',
    },
  },
  'delivery-system': {
    group: 'application',
    variant: 'tall',
    visual: 'route',
    accent: 'Flow',
    category: { en: 'Operations interface', pt: 'Interface operacional' },
    metric: {
      en: '8-entity domain · 7 endpoint groups · JWT + Helmet',
      pt: 'Domínio de 8 entidades · 7 grupos de endpoints · JWT + Helmet',
    },
  },
  // Row 4: 5 + 7
  'academic-system': {
    group: 'application',
    variant: 'standard',
    visual: 'ledger',
    accent: 'Structure',
    category: { en: 'Structured backend logic', pt: 'Lógica de backend estruturada' },
    metric: {
      en: 'Layered architecture · 3 external APIs · Java 21 + MySQL',
      pt: 'Arquitetura em camadas · 3 APIs externas · Java 21 + MySQL',
    },
  },
  'gym-management': {
    group: 'application',
    variant: 'wide',
    visual: 'ledger',
    accent: 'System',
    category: { en: 'Management platform', pt: 'Plataforma de gestão' },
    metric: {
      en: 'Domain modeling · Spring Boot backend + Swing desktop',
      pt: 'Modelagem de domínio · backend Spring Boot + desktop Swing',
    },
  },
}
