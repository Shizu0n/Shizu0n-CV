/**
 * Presentation for the project section, keyed by the canonical catalog id from
 * chatProjectCatalog. The catalog holds the shared data (name, links, stacks, the chat
 * summary); this map holds what only the page shows. A test guards that its keys match
 * the catalog exactly and that every referenced media file exists.
 *
 * `featured` projects are cards that open into a case study with a scroll stage and a
 * capture; `more` projects are smaller cards showing their architecture diagram. Media is
 * always a real capture of the product; a project without one shows its architecture
 * instead of stand-in art.
 */
import type { StageKind } from '../scrolly/stages'

export type ProjectTier = 'featured' | 'more'

type Localized = { en: string; pt: string }

export interface ProjectMedia {
  /** Still capture of the product, shown by default. */
  poster: string
  /** Optional recorded walkthrough, played on demand as a muted looping video. */
  recording?: { mp4: string; webm: string }
  width: number
  height: number
  caption: Localized
  /** A second capture that backs a specific claim, shown below with its caption. */
  secondary?: { src: string; width: number; height: number; caption: Localized }
}

/** A layered architecture, read top to bottom: each tier calls the one below it. */
export interface ProjectDiagram {
  tiers: { name: string; nodes: string[] }[]
  /** A dependency outside the layers, such as external APIs. */
  side?: { name: string; nodes: string[] }
}

export interface ProjectPresentation {
  tier: ProjectTier
  year: string
  kind: Localized
  description: Localized
  result?: Localized
  /** The one number (or claim) on the card, with what it measures. */
  headline?: { value: Localized; label: Localized }
  /** Small animated mark on the card, echoing the case's stage. */
  glyph?: 'loop' | 'grid' | 'queue' | 'lanes'
  /** The scroll stage at the top of the case: a system diagram, or the eval grid. */
  stage?: StageKind | 'eval'
  /** A real answer captured from the hosted demo. */
  sample?: { question: string; sql: string }
  /** What the visitor should expect before opening the hosted demo. */
  demoNote?: Localized
  modelUrl?: string
  media?: ProjectMedia
  diagram?: ProjectDiagram
}

export const PROJECT_PRESENTATION: Record<string, ProjectPresentation> = {
  'react-agent': {
    tier: 'featured',
    year: '2026',
    kind: { en: 'AI agent', pt: 'Agente de IA' },
    headline: {
      value: { en: '154 tests', pt: '154 testes' },
      label: { en: 'plus 22 labeled cases as a regression harness', pt: 'mais 22 casos rotulados como regressão' },
    },
    glyph: 'loop',
    stage: 'loop',
    description: {
      en: 'A ReAct agent modeled as a LangGraph state graph. It keeps memory across conversations, answers from uploaded documents with the source cited and refuses when there is no evidence, discovers tools over MCP, and stores every run as a replayable trace with time per step, tokens and provider fallback.',
      pt: 'Um agente ReAct modelado como grafo de estados no LangGraph. Tem memória entre conversas, responde sobre documentos enviados citando a fonte e recusa quando não há evidência, descobre ferramentas via MCP e guarda cada execução como trace reproduzível, com tempo por etapa, tokens e fallback entre provedores.',
    },
    result: {
      en: '154 backend tests and 22 labeled cases run as a regression harness. Code execution is isolated in a subprocess with AST validation. Everything runs on free tiers.',
      pt: '154 testes de backend e 22 casos rotulados rodando como regressão. Execução de código isolada em subprocesso com validação de AST. Tudo em camadas gratuitas.',
    },
    demoNote: {
      en: 'Live on Vercel, opens in a few seconds.',
      pt: 'No ar na Vercel, abre em poucos segundos.',
    },
    media: {
      poster: '/projects/react-agent.png',
      recording: { mp4: '/projects/react-agent.mp4', webm: '/projects/react-agent.webm' },
      width: 760,
      height: 613,
      caption: {
        en: 'The live agent answering, with its trace streamed beside the answer.',
        pt: 'O agente no ar respondendo, com o trace transmitido ao lado da resposta.',
      },
      secondary: {
        src: '/projects/react-agent-history.png',
        width: 760,
        height: 389,
        caption: {
          en: 'Run history: every run is stored with its steps, tokens, cost and provider, and can be reopened.',
          pt: 'Histórico de execuções: cada execução fica guardada com etapas, tokens, custo e provedor, e pode ser reaberta.',
        },
      },
    },
  },
  'phi3-mini-sql': {
    tier: 'featured',
    year: '2026',
    kind: { en: 'LLM fine-tuning', pt: 'Fine-tuning de LLM' },
    headline: {
      value: { en: '2% → 73.5%', pt: '2% → 73,5%' },
      label: { en: 'exact match on 200 held-out questions', pt: 'exact match em 200 perguntas de validação' },
    },
    glyph: 'grid',
    stage: 'eval',
    description: {
      en: 'A QLoRA fine-tune of Phi-3 Mini (3.8B) for text-to-SQL, trained on 1,000 examples in about 21 minutes on a free T4 GPU. The adapter and the merged model are published on Hugging Face, with a demo and documented limitations.',
      pt: 'Fine-tuning QLoRA do Phi-3 Mini (3,8B) para texto em SQL, treinado com 1.000 exemplos em cerca de 21 minutos numa GPU T4 gratuita. O adapter e o modelo mesclado estão publicados no Hugging Face, com demo e limitações documentadas.',
    },
    result: {
      en: 'Exact match on 200 held-out questions went from 2% (4) to 73.5% (147).',
      pt: 'O exact match em 200 perguntas de validação foi de 2% (4) para 73,5% (147).',
    },
    demoNote: {
      en: 'The demo runs on a free CPU, so loading the model and answering one question take about 5 minutes. The screenshot and the real answer below show what to expect.',
      pt: 'A demo roda numa CPU gratuita: carregar o modelo e responder uma pergunta leva cerca de 5 minutos. A captura e a resposta real abaixo mostram o que esperar.',
    },
    modelUrl: 'https://huggingface.co/Shizu0n/phi3-mini-sql-generator',
    media: {
      poster: '/projects/phi3-demo.png',
      width: 760,
      height: 490,
      caption: {
        en: 'The hosted Space, with the employees preset selected.',
        pt: 'O Space hospedado, com o preset employees selecionado.',
      },
    },
    // Captured from the hosted Space on 2026-10-14 with the employees preset selected.
    sample: {
      question: 'show employees in Engineering ordered by salary',
      sql: 'SELECT * FROM employees WHERE department = "Engineering" ORDER BY salary',
    },
  },
  'campus-cycle': {
    tier: 'featured',
    year: '2026',
    kind: { en: 'Offline-first PWA', pt: 'PWA offline-first' },
    headline: {
      value: { en: '64 tests', pt: '64 testes' },
      label: { en: 'offline sync validated on a physical Android phone', pt: 'sincronização offline validada em Android físico' },
    },
    glyph: 'queue',
    stage: 'queue',
    description: {
      en: 'An installable marketplace where university students sell or donate used items. Reads keep working offline through a service worker; listings created offline wait in an IndexedDB queue with a client-generated UUID and sync idempotently when the connection returns. The flow was validated on a physical Android phone.',
      pt: 'Um marketplace instalável onde estudantes vendem ou doam itens usados. A leitura continua funcionando offline pelo service worker; anúncios criados offline esperam numa fila no IndexedDB com UUID gerado no cliente e sincronizam de forma idempotente quando a conexão volta. O fluxo foi validado em um Android físico.',
    },
    result: {
      en: '64 tests. The API has zod contracts, JWT, owner checks, rate limiting and a guard that stops destructive tests from running on a remote database. Deployed on Vercel, Render and Neon.',
      pt: '64 testes. A API tem contratos zod, JWT, checagem de dono, rate limit e uma trava que impede testes destrutivos em banco remoto. Deploy em Vercel, Render e Neon.',
    },
    demoNote: {
      en: 'The API runs on a free Render instance and can take up to a minute to wake.',
      pt: 'A API roda numa instância gratuita do Render e pode levar até um minuto para acordar.',
    },
    media: {
      poster: '/projects/campus-cycle.png',
      recording: { mp4: '/projects/campus-cycle.mp4', webm: '/projects/campus-cycle.webm' },
      width: 760,
      height: 525,
      caption: { en: 'Creating a listing in the installed PWA.', pt: 'Criando um anúncio no PWA instalado.' },
    },
  },
  'advanced-rag': {
    tier: 'featured',
    year: '2026',
    kind: { en: 'Retrieval and evaluation', pt: 'Recuperação e avaliação' },
    headline: {
      value: { en: 'Hybrid retrieval', pt: 'Recuperação híbrida' },
      label: { en: 'BM25 and dense search, fused, then reranked', pt: 'BM25 e busca densa, fundidas e reordenadas' },
    },
    glyph: 'lanes',
    stage: 'rag',
    description: {
      en: 'A RAG pipeline with ingestion, chunking, hybrid retrieval (BM25 plus dense search, fused with reciprocal-rank fusion) and reranking, with an ablation between strategies. Offline evaluation and opt-in cloud RAGAS are kept apart so their metrics never mix, and an extractive fallback answers when the providers fail.',
      pt: 'Um pipeline de RAG com ingestão, chunking, recuperação híbrida (BM25 mais busca densa, combinadas por reciprocal-rank fusion) e reranking, com ablação entre estratégias. A avaliação offline e o RAGAS em nuvem opt-in ficam separados para as métricas nunca se misturarem, e um fallback extrativo responde quando os provedores falham.',
    },
    result: {
      en: 'No headline score is published for this one: the repository keeps an ablation between retrieval strategies and two separate evaluations instead.',
      pt: 'Este não tem um número de destaque publicado: o repositório guarda uma ablação entre estratégias de recuperação e duas avaliações separadas.',
    },
    demoNote: {
      en: 'Hosted on Streamlit Community Cloud, which can take a minute to wake. Index a source in the left panel before asking.',
      pt: 'Hospedado no Streamlit Community Cloud, que pode levar um minuto para acordar. Indexe uma fonte no painel da esquerda antes de perguntar.',
    },
    media: {
      poster: '/projects/advanced-rag.png',
      width: 760,
      height: 481,
      caption: { en: 'The Streamlit app after indexing a source.', pt: 'O app no Streamlit depois de indexar uma fonte.' },
    },
    diagram: {
      tiers: [
        { name: 'Sources', nodes: ['Files and folders', 'GitHub repository', 'Hugging Face'] },
        { name: 'Indexing', nodes: ['Chunking', 'bge-small embeddings → ChromaDB', 'BM25 index'] },
        { name: 'Retrieval', nodes: ['BM25 + dense', 'Reciprocal-rank fusion', 'Cross-encoder rerank'] },
        { name: 'Answer', nodes: ['LLM synthesis (free tier, gated)', 'Extractive fallback'] },
        { name: 'Evaluation', nodes: ['Offline heuristics', 'RAGAS in the cloud (opt-in)'] },
      ],
    },
  },
  'shizu0n-cv': {
    tier: 'more',
    year: '2025',
    kind: { en: 'This site', pt: 'Este site' },
    description: {
      en: 'This portfolio. Its chat answers from my own project history: an intent classifier picks bundled context, Supabase pgvector adds retrieved chunks when available, and Gemini streams the answer over SSE, moving to the next free model (Flash-Lite, then Groq) when one fails.',
      pt: 'Este portfólio. O chat responde a partir do meu próprio histórico de projetos: um classificador de intenção escolhe o contexto embutido, o Supabase pgvector acrescenta trechos recuperados quando disponível, e o Gemini transmite a resposta via SSE, passando para o próximo modelo gratuito (Flash-Lite, depois Groq) quando um falha.',
    },
    diagram: {
      tiers: [
        { name: 'Browser', nodes: ['React 19 + Vite', 'Chat widget (SSE)'] },
        { name: 'Vercel Function', nodes: ['Rate limit and payload guards', 'Intent classifier', 'Prompt-injection canary'] },
        { name: 'Context', nodes: ['Bundled knowledge JSON', 'Supabase pgvector (optional)'] },
        { name: 'Providers', nodes: ['Gemini Flash', 'Flash-Lite, then Groq on failure'] },
      ],
    },
  },
  'referral-system': {
    tier: 'more',
    year: '2025',
    kind: { en: 'Full-stack', pt: 'Full-stack' },
    description: {
      en: 'Sign-up with a referral code: when the code is valid, the referrer’s score goes up. NestJS modules for auth and users, stateless JWT with custom guards, and a React front end with global state in the Context API.',
      pt: 'Cadastro com código de indicação: quando o código é válido, a pontuação de quem indicou sobe. Módulos NestJS de autenticação e usuários, JWT stateless com guards próprios e front-end React com estado global via Context API.',
    },
    diagram: {
      tiers: [
        { name: 'React 19 + TypeScript', nodes: ['Pages', 'Auth context'] },
        { name: 'NestJS 11 API', nodes: ['AuthModule: register, login, JWT', 'UsersModule: profile, referral link', 'JWT guards'] },
        { name: 'Data', nodes: ['TypeORM + SQLite'] },
      ],
    },
  },
  'delivery-system': {
    tier: 'more',
    year: '2025',
    kind: { en: 'Full-stack', pt: 'Full-stack' },
    description: {
      en: 'A delivery platform with separate flows for customers, restaurants and couriers. The Express API is layered into routes, validators, controllers, services and repositories over a relational MySQL model of orders, items, status and reviews.',
      pt: 'Uma plataforma de delivery com fluxos separados para cliente, restaurante e entregador. A API Express é dividida em rotas, validadores, controllers, services e repositories sobre um modelo relacional em MySQL de pedidos, itens, status e avaliações.',
    },
    diagram: {
      tiers: [
        { name: 'React 19 SPA', nodes: ['Customer', 'Restaurant', 'Courier'] },
        { name: 'Express API', nodes: ['Routes + express-validator', 'Controllers → services → repositories', 'JWT, bcrypt, Helmet, CORS'] },
        { name: 'MySQL 8', nodes: ['Orders, items, status, reviews'] },
      ],
    },
  },
  'academic-system': {
    tier: 'more',
    year: '2025',
    kind: { en: 'Backend', pt: 'Backend' },
    description: {
      en: 'A console application in Java 21 for enrollment and library rules. It integrates three external APIs, caches their data in memory for the session, and stores transactional operations in MySQL through JDBC, using factory, facade and repository patterns.',
      pt: 'Uma aplicação de console em Java 21 para regras de matrícula e biblioteca. Integra três APIs externas, guarda os dados delas em cache na memória durante a sessão e grava as operações transacionais em MySQL via JDBC, com os padrões factory, facade e repository.',
    },
    diagram: {
      tiers: [
        { name: 'Console view', nodes: ['Menus and input'] },
        { name: 'Controllers', nodes: ['ControllerFactory', 'FacadeService'] },
        { name: 'Services', nodes: ['Business rules', 'In-memory cache'] },
        { name: 'Persistence', nodes: ['Repositories (JDBC)', 'MySQL 8'] },
      ],
      side: { name: 'External APIs, called by the services', nodes: ['Students', 'Courses', 'Library'] },
    },
  },
  'gym-management': {
    tier: 'more',
    year: '2025',
    kind: { en: 'Backend + desktop', pt: 'Backend + desktop' },
    description: {
      en: 'Gym management with a Spring Boot REST API and a Java Swing desktop client that talks to it through its own HTTP client. Layered controllers, services and JPA repositories, with MySQL in use and H2 in the tests.',
      pt: 'Gestão de academia com API REST em Spring Boot e um cliente desktop em Java Swing que conversa com ela por um cliente HTTP próprio. Controllers, services e repositórios JPA em camadas, com MySQL em uso e H2 nos testes.',
    },
    diagram: {
      tiers: [
        { name: 'Java Swing client', nodes: ['Panels', 'ApiClient over HTTP'] },
        { name: 'Spring Boot 3.5 API', nodes: ['Controllers', 'Services + validation', 'Spring Data JPA'] },
        { name: 'Data', nodes: ['MySQL', 'H2 in tests'] },
      ],
    },
  },
}
