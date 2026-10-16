import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Language = 'en' | 'pt'

type TranslationFunction = (
  key: string,
  params?: Record<string, string | number>,
) => string

interface TranslationContextType {
  t: TranslationFunction
  language: Language
  toggleLanguage: () => void
}

const translations = {
  en: {
    // Nav
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'nav.theme.light': 'Light mode',
    'nav.theme.dark': 'Dark mode',

    // Chat Widget
    'chat.title': 'Ask about my work',
    'chat.send': 'Send',
    'chat.suggestions': 'Suggested questions',
    'chat.suggestions.hint': 'Pick one to ask',
    'chat.expand': 'Expand the chat',
    'chat.collapse': 'Shrink the chat',
    'chat.inputLabel': 'Your question',
    'chat.assistant': 'AI assistant',
    'chat.emptyMsg': 'Ask me anything about my work, projects, or background.',
    'chat.placeholder': 'Ask about a project…',
    'chat.error': 'Failed to send message. Try again later.',
    'chat.error.network': 'Connection issue: the chat API is unreachable right now.',
    'chat.error.overloaded': 'The AI providers are busy right now. Your question was kept. Try again in a few seconds.',
    'chat.error.rateLimited': 'Rate limit reached. Your question was kept.',
    'chat.retry': 'Try again',
    'chat.quotaExceeded': 'API rate limit reached. Try again in {seconds}s.',
    'chat.prompt.stacks': 'List all stacks',
    'chat.prompt.complete': 'Most complete project',
    'chat.prompt.backend': 'Best backend project',
    'chat.prompt.react': 'Best React project',
    'chat.prelude.intro': 'I am the AI assistant for Paulo’s portfolio. Ask about his personal and academic projects, skills, or contact information.',
    'chat.bot.open': 'Open the chat',
    'chat.bot.close': 'Close the chat',
    'chat.bot.reading': 'Reading: {name}',

    // Hero
    'hero.lede': 'Computer Science student at UNIFOR, graduating in December 2027. I build AI systems and the full-stack applications around them: agents with tool use, RAG, fine-tuning and evaluation, with attention to answer quality, reliability and tests.',
    'hero.cta.email': 'Email me',
    'hero.cta.work': 'See the projects',
    'hero.status': 'Open to internships, part-time, remote or on-site. Based in Fortaleza, Brazil.',
    'hero.results.caption': 'Measured results',
    'hero.results.1.what': 'Phi-3 Mini text-to-SQL, exact match on 200 held-out questions',
    'hero.results.1.value': '2% → 73.5%',
    'hero.results.2.what': 'ReAct agent: backend tests, plus 22 labeled cases as a regression harness',
    'hero.results.2.value': '154 tests',
    'hero.results.3.what': 'CampusCycle offline-first PWA, sync validated on a physical Android phone',
    'hero.results.3.value': '64 tests',

    // About
    'about.title': 'About',
    'about.body.1': 'I study Computer Science at the University of Fortaleza and learn mostly by building. My personal and academic projects cover AI agents, tool use, retrieval, fine-tuning and evaluation, and the full-stack work that turns them into something people can use: APIs, relational data, React front ends and deploys on free tiers.',
    'about.body.2': 'I use AI-assisted engineering tools such as Claude Code and Codex inside a structured workflow: a written spec first, then review and validation of every change. In CampusCycle I kept a log of the AI advice I accepted and rejected, and turned each incident into a test. I am looking for an internship where I can contribute to real projects and grow with a team.',
    'about.fact.base.label': 'Based in',
    'about.fact.base.value': 'Fortaleza, Brazil',
    'about.fact.study.label': 'Studying',
    'about.fact.study.value': 'Computer Science, UNIFOR, 2024 to 2027',
    'about.fact.lang.label': 'Languages',
    'about.fact.lang.value': 'Portuguese (native), English (intermediate, technical reading)',
    'about.skills': 'Skills',
    'skills.ai': 'AI systems',
    'skills.software': 'Software',
    'skills.caption': 'Each skill is listed with the project where it is used.',

    // Projects
    'projects.title': 'Projects',
    'projects.body': 'Four projects I would walk an interviewer through, in this order. All are personal or academic work. Each card opens the case: what moves through the system, what was measured, and where its limits are.',
    'projects.open': 'Open the case',
    'projects.demo': 'Open the demo',
    'projects.code': 'Read the code',
    'projects.model': 'Model on Hugging Face',
    'projects.stack': 'Stack',
    'projects.recording.alt': 'Recorded walkthrough of {name}',
    'projects.screenshot.alt': 'Screenshot of {name}',
    'projects.diagram': 'Architecture of {name}',
    'projects.more.title': 'Smaller projects',
    'projects.more.body': 'Earlier full-stack and backend work, without a hosted demo: how each one is built.',
    'projects.archive.link': 'All repositories on GitHub',

    // Case panel
    'case.back': 'All projects',
    'case.next': 'Next: {name}',
    'case.stage': 'How it works, step by step',
    'case.scroll': 'Scroll to follow',

    // Eval stage (Phi-3)
    'eval.stage.base': 'Base · Phi-3 Mini',
    'eval.stage.filling': 'QLoRA · fine-tuned',
    'eval.stage.done': 'QLoRA · 73.5% exact match',
    'eval.stage.aria': 'Exact match on 200 held-out questions',
    'eval.stage.scroll': 'Scroll to fine-tune',
    'eval.legend.base': 'Exact match, base model',
    'eval.legend.tuned': 'Exact match, after QLoRA',
    'eval.legend.miss': 'Miss',
    'eval.caption': 'Each square is one of the 200 held-out questions from b-mc2/sql-create-context. Filled squares count exact string matches; they show the total, not which questions.',
    'eval.sample': 'A real answer from the hosted demo, 14 October 2026',
    'eval.sample.q': 'Question, with the employees table selected',
    'eval.sample.a': 'Generated SQL',
    'eval.limit': 'Its limit: asked for Engineering employees earning over 90,000, it dropped both conditions.',

    // Contact
    'contact.title.1': 'Hiring an intern?',
    'contact.title.2': 'Write to me.',
    'contact.email.copy': 'Copy the email address',
    'contact.email.copyShort': 'Copy',
    'contact.email.copied': 'Copied',
    'contact.next': 'Email is the fastest way to reach me. LinkedIn works too.',

    // Footer
    'footer.what': 'Paulo Shizuo, Fortaleza',
    'footer.source': 'Source code',
  },
  pt: {
    // Nav
    'nav.about': 'Sobre',
    'nav.projects': 'Projetos',
    'nav.contact': 'Contato',
    'nav.theme.light': 'Modo claro',
    'nav.theme.dark': 'Modo escuro',

    // Chat Widget
    'chat.title': 'Pergunte sobre meu trabalho',
    'chat.send': 'Enviar',
    'chat.suggestions': 'Perguntas sugeridas',
    'chat.suggestions.hint': 'Escolha uma para perguntar',
    'chat.expand': 'Expandir o chat',
    'chat.collapse': 'Reduzir o chat',
    'chat.inputLabel': 'Sua pergunta',
    'chat.assistant': 'Assistente de IA',
    'chat.emptyMsg': 'Pergunte qualquer coisa sobre meu trabalho, projetos ou trajetória.',
    'chat.placeholder': 'Pergunte sobre um projeto…',
    'chat.error': 'Falha ao enviar mensagem. Tente novamente mais tarde.',
    'chat.error.network': 'Problema de conexão: a API do chat está inacessível no momento.',
    'chat.error.overloaded': 'Os provedores de IA estão ocupados agora. Sua pergunta foi guardada. Tente de novo em alguns segundos.',
    'chat.error.rateLimited': 'Limite de requisições atingido. Sua pergunta foi guardada.',
    'chat.retry': 'Tentar novamente',
    'chat.quotaExceeded': 'Limite da API atingido. Tente em {seconds}s.',
    'chat.prompt.stacks': 'Liste todas as stacks',
    'chat.prompt.complete': 'Projeto mais completo',
    'chat.prompt.backend': 'Melhor projeto de backend',
    'chat.prompt.react': 'Melhor projeto de React',
    'chat.prelude.intro': 'Sou o assistente de IA do portfólio de Paulo. Pergunte sobre seus projetos pessoais e acadêmicos, habilidades ou contato.',
    'chat.bot.open': 'Abrir o chat',
    'chat.bot.close': 'Fechar o chat',
    'chat.bot.reading': 'Lendo: {name}',

    // Hero
    'hero.lede': 'Estudante de Ciência da Computação na UNIFOR, com conclusão prevista para dezembro de 2027. Construo sistemas de IA e as aplicações full-stack em volta deles: agentes com uso de ferramentas, RAG, fine-tuning e avaliação, com atenção à qualidade das respostas, confiabilidade e testes.',
    'hero.cta.email': 'Mandar email',
    'hero.cta.work': 'Ver os projetos',
    'hero.status': 'Aberto a estágio, meio período, remoto ou presencial. Moro em Fortaleza.',
    'hero.results.caption': 'Resultados medidos',
    'hero.results.1.what': 'Phi-3 Mini texto para SQL, exact match em 200 perguntas de validação',
    'hero.results.1.value': '2% → 73,5%',
    'hero.results.2.what': 'Agente ReAct: testes de backend, mais 22 casos rotulados como regressão',
    'hero.results.2.value': '154 testes',
    'hero.results.3.what': 'CampusCycle, PWA offline-first, sincronização validada em Android físico',
    'hero.results.3.value': '64 testes',

    // About
    'about.title': 'Sobre',
    'about.body.1': 'Estudo Ciência da Computação na Universidade de Fortaleza e aprendo principalmente construindo. Meus projetos pessoais e acadêmicos envolvem agentes de IA, uso de ferramentas, recuperação, fine-tuning e avaliação, e o trabalho full-stack que transforma isso em algo que as pessoas usam: APIs, dados relacionais, front-end em React e deploy em camadas gratuitas.',
    'about.body.2': 'Uso ferramentas de engenharia assistida por IA, como Claude Code e Codex, em um fluxo estruturado: primeiro a especificação escrita, depois revisão e validação de cada mudança. No CampusCycle mantive um registro dos conselhos da IA que aceitei e rejeitei, e transformei cada incidente em teste. Busco um estágio para contribuir com projetos reais e evoluir em equipe.',
    'about.fact.base.label': 'Moro em',
    'about.fact.base.value': 'Fortaleza, CE',
    'about.fact.study.label': 'Curso',
    'about.fact.study.value': 'Ciência da Computação, UNIFOR, 2024 a 2027',
    'about.fact.lang.label': 'Idiomas',
    'about.fact.lang.value': 'Português (nativo), inglês (intermediário, leitura técnica)',
    'about.skills': 'Habilidades',
    'skills.ai': 'Sistemas de IA',
    'skills.software': 'Software',
    'skills.caption': 'Cada habilidade aparece com o projeto em que é usada.',

    // Projects
    'projects.title': 'Projetos',
    'projects.body': 'Quatro projetos que eu apresentaria numa entrevista, nesta ordem. Todos são pessoais ou acadêmicos. Cada card abre o caso: o que passa pelo sistema, o que foi medido e onde estão os limites.',
    'projects.open': 'Abrir o caso',
    'projects.demo': 'Abrir a demo',
    'projects.code': 'Ler o código',
    'projects.model': 'Modelo no Hugging Face',
    'projects.stack': 'Stack',
    'projects.recording.alt': 'Demonstração gravada de {name}',
    'projects.screenshot.alt': 'Captura de tela de {name}',
    'projects.diagram': 'Arquitetura de {name}',
    'projects.more.title': 'Projetos menores',
    'projects.more.body': 'Trabalhos anteriores de full-stack e backend, sem demo hospedada: como cada um é construído.',
    'projects.archive.link': 'Todos os repositórios no GitHub',

    // Case panel
    'case.back': 'Todos os projetos',
    'case.next': 'Próximo: {name}',
    'case.stage': 'Como funciona, passo a passo',
    'case.scroll': 'Role para acompanhar',

    // Eval stage (Phi-3)
    'eval.stage.base': 'Base · Phi-3 Mini',
    'eval.stage.filling': 'QLoRA · fine-tuned',
    'eval.stage.done': 'QLoRA · 73,5% de exact match',
    'eval.stage.aria': 'Exact match em 200 perguntas de validação',
    'eval.stage.scroll': 'Role para o fine-tune',
    'eval.legend.base': 'Exact match, modelo base',
    'eval.legend.tuned': 'Exact match, depois do QLoRA',
    'eval.legend.miss': 'Erro',
    'eval.caption': 'Cada quadrado é uma das 200 perguntas de validação do b-mc2/sql-create-context. Os preenchidos contam os acertos exatos; mostram o total, não quais perguntas.',
    'eval.sample': 'Uma resposta real da demo hospedada, 14 de outubro de 2026',
    'eval.sample.q': 'Pergunta, com a tabela employees selecionada',
    'eval.sample.a': 'SQL gerado',
    'eval.limit': 'O limite: pedindo funcionários de Engineering com salário acima de 90.000, ele ignorou as duas condições.',

    // Contact
    'contact.title.1': 'Procurando estagiário?',
    'contact.title.2': 'Me escreva.',
    'contact.email.copy': 'Copiar o endereço de email',
    'contact.email.copyShort': 'Copiar',
    'contact.email.copied': 'Copiado',
    'contact.next': 'Email é o jeito mais rápido de falar comigo. Pelo LinkedIn também funciona.',

    // Footer
    'footer.what': 'Paulo Shizuo, Fortaleza',
    'footer.source': 'Código-fonte',
  }
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

interface TranslationProviderProps {
  children: ReactNode
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en')

  // Load persisted language on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('shizu0n_lang') as Language
      if (savedLang && (savedLang === 'en' || savedLang === 'pt')) {
        setLanguage(savedLang)
      } else {
        // Auto-detect based on navigator
        const browserLang = navigator.language.toLowerCase()
        if (browserLang.startsWith('pt')) {
          setLanguage('pt')
        }
      }
    } catch (e) {
      // Ignorar erros do localStorage
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en'
  }, [language])

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'en' ? 'pt' : 'en'
      try {
        localStorage.setItem('shizu0n_lang', newLang)
      } catch (e) {
        // Ignorar
      }
      return newLang
    })
  }

  const t: TranslationFunction = (key, params) => {
    const dict = translations[language] || translations['en']
    const text = dict[key as keyof typeof dict] || key

    if (!params) {
      return text
    }

    return Object.entries(params).reduce(
      (result, [paramKey, value]) => result.replace(`{${paramKey}}`, String(value)),
      text,
    )
  }

  return (
    <TranslationContext.Provider value={{ t, language, toggleLanguage }}>
      {children}
    </TranslationContext.Provider>
  )
}

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext)

  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }

  return context
}
