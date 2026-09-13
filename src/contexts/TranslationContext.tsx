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
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    
    // Chat Widget
    'chat.title': 'Portfolio AI',
    'chat.assistant': 'AI assistant',
    'chat.askMe': 'Ask the AI assistant',
    'chat.subtitle': 'AI assistant for Paulo’s portfolio',
    'chat.emptyMsg': 'Ask me anything about my work, projects, or background.',
    'chat.placeholder': 'Message...',
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
    'chat.quick.experience.label': 'Projects and skills',
    'chat.quick.experience.prompt': 'Show me your work and skills, and the results.',
    'chat.quick.topProjects.label': 'Top projects',
    'chat.quick.topProjects.prompt': 'Show me your strongest projects and why they stand out.',
    'chat.quick.whyHire.label': 'Internship fit',
    'chat.quick.whyHire.prompt': 'Why should a team hire you for an internship? Give direct, practical reasons.',
    'chat.quick.contact.label': 'Contact',
    'chat.quick.contact.prompt': 'How can I contact you for internships, freelance work, or opportunities?',

    // Hero
    'hero.kicker': 'Paulo Shizuo',
    'hero.meta': 'Computer Science Student\nAI & Full‑Stack · Fortaleza, Brazil',
    'hero.caption': 'A short story about how I work.',
    'hero.title': 'Learn by building.',
    'hero.overlay.left': 'Why',
    'hero.overlay.left.desc': 'AI is where technology is heading. I want to engineer those systems, not just use them. Full-stack is the foundation that turns an idea into a product.',
    'hero.overlay.right': 'Lesson',
    'hero.overlay.right.desc': "The hard part of AI today isn't the model. It is cost, compute, and honest evaluation. I build assuming things fail, and design fallbacks for when they do.",
    'hero.outro': 'The proof is below',
    'hero.outro.desc': 'A model fine-tuned to 73.5% exact-match, a deployed agent, an evaluated RAG, plus full-stack systems. The evidence is just below.',
    'hero.hint': "Scroll. Here is how I think",
    'hero.cta.work': 'See projects',
    'hero.cta.contact': 'Get in touch',

    // About
    'about.kicker': 'Act 02 / Credentials',
    'about.title': 'A Computer Science student learning by building AI/ML systems and full-stack applications.',
    'about.body': 'I build projects to learn, caring about how they are structured, how they behave, and how they hold up in real use.',
    'about.stats.repos': 'Public repos',
    'about.stats.stars': 'Stars earned',
    'about.stats.demos': 'Live demos deployed',
    'about.stats.started': 'Started coding',
    'about.stats.followers': 'GitHub followers',
    'about.proof.base': 'Current base',
    'about.proof.base.val': 'Fortaleza, Brazil',
    'about.proof.stack': 'Most used stack',
    'about.proof.style': 'Working style',
    'about.proof.style.val': 'Specs, checkpoints, tests, and review, even when building with AI.',
    'about.proof.focus': 'Focus',
    'about.proof.focus.val': 'AI engineering and AI-systems work, on a full-stack base.',
    'about.proof.open': 'Open to',
    'about.proof.open.val': 'Internships now: part-time, remote or on-site.',
    'about.note.one': 'LangGraph agents, hybrid-retrieval RAG, and QLoRA fine-tuning.',
    'about.note.two': 'Full-stack foundation: NestJS, Java, Spring Boot, React, TypeScript.',

    // Skills
    'skills.kicker': 'Act 03 / Capabilities',
    'skills.title': 'Learning by building AI/ML systems and full-stack applications.',
    'skills.body': 'Each one is something I picked up by building, grouped here to show the range, not to rank it.',
    'skills.cap.1.title': 'AI & LLM systems',
    'skills.cap.1.summary': 'LangGraph agents, hybrid-retrieval RAG with RAGAS evaluation, and QLoRA fine-tuning, built with observability and honest fallbacks.',
    'skills.cap.2.title': 'Full-stack engineering',
    'skills.cap.2.summary': 'React 19, TypeScript, NestJS, Java, and Spring Boot, with REST APIs and relational data in layered, maintainable architecture.',
    'skills.cap.3.title': 'Production delivery',
    'skills.cap.3.summary': 'Streaming SSE, multi-provider fallback, security baselines, tests, and deploys on Vercel, Streamlit, and Hugging Face.',

    // Projects
    'projects.kicker': 'Act 04 / Selected work',
    'projects.item': 'Project',
    'projects.demo': 'Open demo',
    'projects.code': 'View code',
    'projects.recording.play': 'Play recording',
    'projects.recording.stop': 'Stop recording',
    'projects.recording.alt': 'Recorded walkthrough of {name}',
    'projects.screenshot.alt': 'Screenshot of {name}',
    'projects.screenshot.show': 'View screenshot',
    'projects.screenshot.hide': 'Hide screenshot',
    'projects.title': 'Projects to explore.',
    'projects.body': '{count} personal and academic projects in full-stack development and AI/ML. Explore the code, available demos, and recorded previews.',
    'projects.archive.msg': 'For the live repository archive and ongoing experiments, visit GitHub.',
    'projects.archive.link': 'Open full GitHub archive \u2192',

    // Contact
    'contact.kicker': 'Act 05 / Contact',
    'contact.title': "If the brief needs clarity, polish, and working code, let's talk.",
    'contact.body': 'Available for internships, freelance collaborations, and product-minded builds that need both design restraint and implementation depth.',
    'contact.form.name': 'Name',
    'contact.form.email': 'Email',
    'contact.form.subject': 'Subject',
    'contact.form.message': 'Message',
    'contact.form.send': 'Send message',
    'contact.form.sending': 'Sending...',
  },
  pt: {
    // Nav
    'nav.about': 'Sobre',
    'nav.skills': 'Habilidades',
    'nav.projects': 'Projetos',
    'nav.contact': 'Contato',

    // Chat Widget
    'chat.title': 'IA do portfólio',
    'chat.assistant': 'Assistente de IA',
    'chat.askMe': 'Perguntar ao assistente de IA',
    'chat.subtitle': 'Assistente de IA do portfólio de Paulo',
    'chat.emptyMsg': 'Pergunte qualquer coisa sobre meu trabalho, projetos ou trajetória.',
    'chat.placeholder': 'Mensagem...',
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
    'chat.quick.experience.label': 'Projetos e habilidades',
    'chat.quick.experience.prompt': 'Mostre seu trabalho e suas habilidades, e os resultados.',
    'chat.quick.topProjects.label': 'Top projetos',
    'chat.quick.topProjects.prompt': 'Mostre seus projetos mais fortes e por que se destacam.',
    'chat.quick.whyHire.label': 'Perfil para estágio',
    'chat.quick.whyHire.prompt': 'Por que um time deveria te contratar para um estágio? Dê razões diretas e práticas.',
    'chat.quick.contact.label': 'Contato',
    'chat.quick.contact.prompt': 'Como posso entrar em contato para estágio, freelance ou oportunidades?',

    // Hero
    'hero.kicker': 'Paulo Shizuo',
    'hero.meta': 'Estudante de Ciência da Computação\nIA & Full‑Stack · Fortaleza, Brasil',
    'hero.caption': 'Uma breve história de como eu trabalho.',
    'hero.title': 'Aprender construindo.',
    'hero.overlay.left': 'Porquê',
    'hero.overlay.left.desc': 'A IA é para onde a tecnologia caminha. Quero engenheirar esses sistemas, não só usá-los. Full-stack é a base que transforma a ideia em produto.',
    'hero.overlay.right': 'Lição',
    'hero.overlay.right.desc': 'O difícil na IA hoje não é o modelo. É custo, poder computacional e avaliação honesta. Construo assumindo que falham, e desenho fallbacks para quando falham.',
    'hero.outro': 'A prova vem abaixo',
    'hero.outro.desc': 'Um modelo afinado a 73,5% de exact-match, um agente no ar, um RAG avaliado, além de sistemas full-stack. A evidência está logo abaixo.',
    'hero.hint': 'Role. É assim que eu penso',
    'hero.cta.work': 'Ver projetos',
    'hero.cta.contact': 'Falar comigo',

    // About
    'about.kicker': 'Ato 02 / Credenciais',
    'about.title': 'Um estudante de Ciência da Computação aprendendo ao construir sistemas de IA/ML e aplicações full-stack.',
    'about.body': 'Construo projetos para aprender, me importando com como são estruturados, como se comportam e como aguentam o uso real.',
    'about.stats.repos': 'Repositórios públicos',
    'about.stats.stars': 'Estrelas recebidas',
    'about.stats.demos': 'Demos no ar',
    'about.stats.started': 'Começou a codar',
    'about.stats.followers': 'Seguidores no GitHub',
    'about.proof.base': 'Base atual',
    'about.proof.base.val': 'Fortaleza, Brasil',
    'about.proof.stack': 'Stack principal',
    'about.proof.style': 'Estilo de trabalho',
    'about.proof.style.val': 'Specs, checkpoints, testes e revisão, mesmo construindo com IA.',
    'about.proof.focus': 'Foco',
    'about.proof.focus.val': 'Engenharia de IA e sistemas com IA, sobre base full-stack.',
    'about.proof.open': 'Aberto a',
    'about.proof.open.val': 'Estágio agora: meio período, remoto ou presencial.',
    'about.note.one': 'Agentes em LangGraph, RAG com retrieval híbrido e fine-tuning QLoRA.',
    'about.note.two': 'Base full-stack: NestJS, Java, Spring Boot, React, TypeScript.',

    // Skills
    'skills.kicker': 'Ato 03 / Capacidades',
    'skills.title': 'Aprendendo ao construir sistemas de IA/ML e aplicações full-stack.',
    'skills.body': 'Cada uma é algo que aprendi construindo, reunidas aqui para mostrar o alcance, não para ranqueá-las.',
    'skills.cap.1.title': 'Sistemas de IA & LLM',
    'skills.cap.1.summary': 'Agentes em LangGraph, RAG com retrieval híbrido e avaliação RAGAS, e fine-tuning QLoRA, com observabilidade e fallbacks honestos.',
    'skills.cap.2.title': 'Engenharia full-stack',
    'skills.cap.2.summary': 'React 19, TypeScript, NestJS, Java e Spring Boot, com APIs REST e dados relacionais em arquitetura em camadas e manutenível.',
    'skills.cap.3.title': 'Entrega em produção',
    'skills.cap.3.summary': 'Streaming SSE, fallback multi-provedor, base de segurança, testes e deploys em Vercel, Streamlit e Hugging Face.',

    // Projects
    'projects.kicker': 'Ato 04 / Trabalhos selecionados',
    'projects.item': 'Projeto',
    'projects.demo': 'Abrir demo',
    'projects.code': 'Ver código',
    'projects.recording.play': 'Reproduzir gravação',
    'projects.recording.stop': 'Parar gravação',
    'projects.recording.alt': 'Demonstração gravada de {name}',
    'projects.screenshot.alt': 'Captura de tela de {name}',
    'projects.screenshot.show': 'Ver captura de tela',
    'projects.screenshot.hide': 'Ocultar captura de tela',
    'projects.title': 'Projetos para explorar.',
    'projects.body': '{count} projetos pessoais e acadêmicos de desenvolvimento full-stack e IA/ML. Explore o código, as demos disponíveis e as prévias gravadas.',
    'projects.archive.msg': 'Para o arquivo remoto de repositórios e projetos paralelos, acesse o GitHub.',
    'projects.archive.link': 'Abrir arquivo completo do GitHub \u2192',

    // Contact
    'contact.kicker': 'Ato 05 / Contato',
    'contact.title': 'Se o seu desafio exige clareza, polimento e código que funciona, vamos conversar.',
    'contact.body': 'Disponível para estágios, parcerias freelas e desenvolvimentos com foco em produto que necessitem restrição de design e profundidade.',
    'contact.form.name': 'Nome',
    'contact.form.email': 'Email',
    'contact.form.subject': 'Assunto',
    'contact.form.message': 'Mensagem',
    'contact.form.send': 'Enviar mensagem',
    'contact.form.sending': 'Enviando...',
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
