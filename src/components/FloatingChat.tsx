import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat, type ChatMessage } from '../hooks/useChat';
import { useTranslation } from '../contexts/TranslationContext';
import ChatMessageContent from './ChatMessageContent';
import { buildProjectCardVisibilityMap } from './chatProjectCardPolicy';
import ChatBot, { CHAPTERS, useBotChapter } from './ChatBot';
import { finePointer } from '../scrolly/motion';

type Language = 'en' | 'pt';
type ChatSuggestionTopic = 'projects' | 'stacks' | 'experience' | 'hiring' | 'contact';

const normalizeSuggestionText = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const includesAnyKeyword = (content: string, keywords: string[]) => {
  return keywords.some((keyword) => content.includes(keyword));
};

const inferSuggestionTopic = (messages: ChatMessage[]): ChatSuggestionTopic => {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user' && message.content.trim());
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant' && message.content.trim());

  const contextText = normalizeSuggestionText(
    `${lastUserMessage?.content ?? ''} ${lastAssistantMessage?.content ?? ''}`,
  );

  if (!contextText) {
    return 'projects';
  }

  if (
    includesAnyKeyword(contextText, [
      'contato',
      'contact',
      'email',
      'linkedin',
      'falar',
      'reach',
      'talk',
      'mensagem',
    ])
  ) {
    return 'contact';
  }

  if (
    includesAnyKeyword(contextText, [
      'contratar',
      'hire',
      'hiring',
      'recruiter',
      'recrutador',
      'vaga',
      'job',
    ])
  ) {
    return 'hiring';
  }

  if (
    includesAnyKeyword(contextText, [
      'stack',
      'stacks',
      'tecnolog',
      'backend',
      'frontend',
      'react',
      'nestjs',
      'java',
      'typescript',
      'framework',
    ])
  ) {
    return 'stacks';
  }

  if (
    includesAnyKeyword(contextText, ['experien', 'trajetoria', 'carreira', 'background', 'career'])
  ) {
    return 'experience';
  }

  if (
    includesAnyKeyword(contextText, [
      'projeto',
      'project',
      'projects',
      'referral',
      'delivery',
      'academic',
      'gym',
      'portfolio',
    ])
  ) {
    return 'projects';
  }

  const topicCycle: ChatSuggestionTopic[] = ['projects', 'stacks', 'experience', 'hiring', 'contact'];
  return topicCycle[messages.length % topicCycle.length];
};

const getContextualSuggestionPool = (language: Language, topic: ChatSuggestionTopic) => {
  const pools = {
    pt: {
      projects: [
        'Quais sao seus 3 projetos mais fortes hoje?',
        'Qual projeto mostra melhor sua arquitetura?',
        'Qual projeto devo ver primeiro em 5 minutos?',
        'Pode comparar Referral System e Delivery System?',
        'Que projeto destaca mais seu lado de produto?',
        'Qual projeto tem melhor equilibrio entre frontend e backend?',
      ],
      stacks: [
        'Quais stacks voce domina com mais confianca?',
        'Em quais projetos cada stack aparece?',
        'Qual stack voce usa para backend hoje?',
        'Qual stack melhor representa seu frontend?',
        'Como voce decide entre Java e TypeScript?',
        'Qual tecnologia voce quer aprofundar agora?',
      ],
      experience: [
        'Resume sua experiencia em 30 segundos.',
        'Que tipo de problema voce resolve melhor?',
        'Como e seu processo de desenvolvimento?',
        'Quais resultados praticos voce ja entregou?',
        'Como voce trabalha com prioridade e prazo?',
        'Qual foi seu desafio tecnico mais marcante?',
      ],
      hiring: [
        'Por que uma empresa deveria te contratar agora?',
        'Que valor voce gera nas primeiras semanas?',
        'Quais sao seus diferenciais tecnicos?',
        'Como voce colabora com time e produto?',
        'Quais evidencias do seu nivel aparecem nos projetos?',
        'Que perfil de vaga combina mais com voce?',
      ],
      contact: [
        'Qual o melhor canal para falar com voce?',
        'Voce esta disponivel para estagio ou freelance?',
        'Prefere contato por email ou LinkedIn?',
        'Como enviar uma proposta objetiva para voce?',
        'Qual disponibilidade voce tem hoje?',
        'Pode compartilhar seus links de contato principais?',
      ],
    },
    en: {
      projects: [
        'What are your top 3 strongest projects today?',
        'Which project best shows your architecture skills?',
        'If I have 5 minutes, which project should I open first?',
        'Can you compare Referral System and Delivery System?',
        'Which project highlights your product thinking the most?',
        'Which project has the best frontend/backend balance?',
      ],
      stacks: [
        'Which stacks are you most confident with?',
        'Where does each stack appear across your projects?',
        'Which stack do you currently prefer for backend?',
        'Which stack best represents your frontend work?',
        'How do you decide between Java and TypeScript?',
        'Which technology are you focusing on next?',
      ],
      experience: [
        'Can you summarize your experience in 30 seconds?',
        'What type of problems do you solve best?',
        'What does your development process look like?',
        'What practical outcomes have you delivered so far?',
        'How do you handle priorities and deadlines?',
        'What was your most challenging technical problem?',
      ],
      hiring: [
        'Why should a company hire you right now?',
        'What value do you deliver in the first weeks?',
        'What are your strongest technical differentiators?',
        'How do you collaborate with product and engineering teams?',
        'What evidence of your level appears in your projects?',
        'What role profile fits you best today?',
      ],
      contact: [
        'What is the best channel to reach you?',
        'Are you currently available for internships or freelance work?',
        'Do you prefer contact by email or LinkedIn?',
        'How should I send you a clear project proposal?',
        'What is your current availability?',
        'Can you share your main contact links?',
      ],
    },
  } as const;

  return pools[language][topic];
};

const getContextualSuggestions = (messages: ChatMessage[], language: Language) => {
  const topic = inferSuggestionTopic(messages);
  const pool = getContextualSuggestionPool(language, topic);

  if (!pool.length) {
    return [];
  }

  const seed = messages.reduce((acc, message) => acc + message.content.length, 0) + messages.length;
  const startIndex = seed % pool.length;
  const rotated = [...pool.slice(startIndex), ...pool.slice(0, startIndex)];

  return rotated.slice(0, 4);
};

/**
 * The chat: the eyes bot in the corner opens a panel that grows out of it. The panel knows
 * what is being read (a section or an open project case) and offers questions about it;
 * answers stream from /api/chat through useChat, with project cards where they apply.
 */
export default function FloatingChat() {
  const { t, language } = useTranslation();
  const lang = language as Language;
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { messages, isLoading, error, errorCode, canRetry, retry, quotaInfo, sendMessage } = useChat();
  const panelRef = useRef<HTMLElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const chapterId = useBotChapter();
  const chapter = CHAPTERS[chapterId] ?? CHAPTERS.top;
  const hasStartedConversation = messages.length > 0;
  const projectCardVisibilityByMessageId = useMemo(() => buildProjectCardVisibilityMap(messages), [messages]);

  // Suggestions follow the conversation: the model's follow-ups from the latest answer (the
  // static topic pool when it sent none: cache hits, errors, offline). Before the first
  // question there is nothing to follow, so they are the questions about what is being read.
  const suggestions = useMemo(() => {
    const asked = new Set(messages.filter((message) => message.role === 'user').map((message) => message.content));
    let pool: string[];
    if (hasStartedConversation) {
      const lastAssistant = [...messages]
        .reverse()
        .find((message) => message.role === 'assistant' && message.content.trim());
      pool = lastAssistant?.suggestions?.length ? lastAssistant.suggestions : getContextualSuggestions(messages, lang);
    } else {
      pool = chapter.prompts.map((prompt) => prompt[lang]);
    }
    return [...new Set(pool)].filter((q) => !asked.has(q)).slice(0, 4);
  }, [chapter, hasStartedConversation, lang, messages]);

  useEffect(() => {
    if (isLoading) {
      setLoadingStep(0);
      const timer1 = setTimeout(() => setLoadingStep(1), 1000);
      const timer2 = setTimeout(() => setLoadingStep(2), 2500);
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [isLoading]);

  const getLoadingText = () => {
    if (language === 'pt') {
      if (loadingStep === 0) return 'O assistente está processando sua pergunta...';
      if (loadingStep === 1) return 'O assistente está preparando a resposta...';
      return 'O assistente está finalizando a resposta...';
    }
    if (loadingStep === 0) return 'The assistant is processing your question...';
    if (loadingStep === 1) return 'The assistant is preparing a response...';
    return 'The assistant is finishing the response...';
  };

  useEffect(() => {
    if (quotaInfo?.isQuotaExceeded && quotaInfo.resetTimestamp) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.ceil((quotaInfo.resetTimestamp! - Date.now()) / 1000));
        setCountdown(remaining);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
    setCountdown(0);
  }, [quotaInfo]);

  // Keep the newest message in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, isLoading, error, isOpen]);

  const open = () => {
    setIsOpen(true);
    // On touch screens focusing the input would pull up the keyboard over the panel.
    window.setTimeout(() => (finePointer() ? inputRef.current : titleRef.current)?.focus({ preventScroll: true }), 200);
  };
  const close = () => {
    setIsOpen(false);
    document.querySelector<HTMLButtonElement>('.bot')?.focus({ preventScroll: true });
  };

  // Escape closes the top layer only: the suggestions, then the chat, never a case behind it
  // (that listener is on window). A press outside closes the suggestions, then the chat.
  useEffect(() => {
    if (!isOpen) {
      setIsSuggestOpen(false);
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      if (flyoutRef.current?.classList.contains('is-open')) setIsSuggestOpen(false);
      else close();
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Element;
      if (!flyoutRef.current?.contains(target)) setIsSuggestOpen(false);
      if (!panelRef.current?.contains(target) && !target.closest?.('.bot')) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [isOpen]);

  const ask = (question: string) => {
    if (!question.trim() || isLoading || countdown > 0) return;
    sendMessage(question);
    setInputValue('');
    setIsSuggestOpen(false);
    // The clicked suggestion is gone: keep focus inside the panel.
    (finePointer() ? inputRef.current : titleRef.current)?.focus({ preventScroll: true });
  };

  return (
    <>
      <ChatBot chapter={chapterId} isOpen={isOpen} thinking={isLoading} onToggle={() => (isOpen ? close() : open())} />

      <section ref={panelRef} id="chat-panel" className={`bot-panel${isOpen ? ' is-open' : ''}${isExpanded ? ' is-expanded' : ''}`} role="dialog" aria-labelledby="chat-title">
        <header>
          <div>
            <h2 id="chat-title" ref={titleRef} tabIndex={-1}>{t('chat.title')}</h2>
            <p>{t('chat.bot.reading', { name: chapter.name[lang] })}</p>
          </div>
          <div className="bot-head-actions">
            <button type="button" className="bot-close" onClick={() => setIsExpanded((value) => !value)}
              aria-label={t(isExpanded ? 'chat.collapse' : 'chat.expand')} aria-pressed={isExpanded}>
              <span aria-hidden="true">{isExpanded ? '↙' : '↗'}</span>
            </button>
            <button type="button" className="bot-close" onClick={close} aria-label={t('chat.bot.close')}>×</button>
          </div>
        </header>

        <div className="bot-log" ref={logRef} aria-live="polite">
          <p className="bot-msg">{t('chat.prelude.intro')}</p>

          {messages.map((msg, index) => {
            const isPendingAssistantMessage =
              isLoading && msg.role === 'assistant' && !msg.content.trim() && index === messages.length - 1;
            const cardState = projectCardVisibilityByMessageId.get(msg.id);

            if (msg.role === 'assistant' && !msg.content.trim() && !isPendingAssistantMessage) return null;
            if (msg.role === 'user') {
              return (
                <p key={msg.id} className="bot-msg is-user">
                  <span className="visually-hidden">{lang === 'pt' ? 'Você' : 'You'}: </span>{msg.content}
                </p>
              );
            }
            return (
              <div key={msg.id} className="bot-msg">
                <span className="visually-hidden">{t('chat.assistant')}: </span>
                {isPendingAssistantMessage ? (
                  <span className="bot-thinking">{getLoadingText()}</span>
                ) : (
                  <ChatMessageContent
                    content={msg.content}
                    role={msg.role}
                    language={language}
                    projectActions={cardState?.show ? cardState.projectActions : []}
                  />
                )}
              </div>
            );
          })}

          {error && (
            <div className="bot-msg is-note">
              {countdown > 0 ? (
                <p>{t('chat.quotaExceeded', { seconds: countdown })}</p>
              ) : (
                <>
                  <p>
                    {errorCode === 'network' && t('chat.error.network')}
                    {errorCode === 'overloaded' && t('chat.error.overloaded')}
                    {errorCode === 'rate_limited' && t('chat.error.rateLimited')}
                    {(errorCode === 'generic' || !errorCode) && t('chat.error')}
                  </p>
                  {canRetry && !isLoading && (
                    <button type="button" className="bot-retry" onClick={retry}>{t('chat.retry')} →</button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <form className="bot-form" onSubmit={(event) => { event.preventDefault(); ask(inputValue); }}>
          {suggestions.length > 0 && (
            // Opens on hover, focus or click, beside the panel; the ring spins while an answer loads.
            <div ref={flyoutRef} className={`bot-flyout${isSuggestOpen ? ' is-open' : ''}${isLoading ? ' is-loading' : ''}`}>
              <button type="button" className="bot-flyout-trigger" onClick={() => setIsSuggestOpen((value) => !value)}
                aria-expanded={isSuggestOpen} aria-controls="chat-suggestions" aria-label={t('chat.suggestions')}>
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <circle className="bot-flyout-ring" cx="10" cy="10" r="7" />
                  <circle className="bot-flyout-dot" cx="10" cy="10" r="2.2" />
                </svg>
              </button>
              <div id="chat-suggestions" className="bot-flyout-pop" role="group" aria-label={t('chat.suggestions')}>
                <p>{t('chat.suggestions.hint')}</p>
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => ask(suggestion)} disabled={isLoading || countdown > 0}>{suggestion}</button>
                ))}
              </div>
            </div>
          )}
          <label className="visually-hidden" htmlFor="chat-input">{t('chat.inputLabel')}</label>
          <input id="chat-input" ref={inputRef} autoComplete="off" placeholder={t('chat.placeholder')}
            value={inputValue} onChange={(event) => setInputValue(event.target.value)} disabled={countdown > 0} />
          <button type="submit" className="bot-send" disabled={!inputValue.trim() || isLoading || countdown > 0}>{t('chat.send')}</button>
        </form>
      </section>
    </>
  );
}
