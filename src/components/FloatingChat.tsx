import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../hooks/useChat';
import { useTranslation } from '../contexts/TranslationContext';

const SUGGESTED_PROMPTS = [
  "What do you build?",
  "Top projects",
  "Tech stack",
  "Contact info",
];

export default function FloatingChat() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, isLoading, error, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto-focus input when opened
      textareaRef.current?.focus();
    }
  }, [messages, isOpen, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="chat-toggle-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            aria-label={t('chat.askMe')}
          >
            {t('chat.askMe')}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="chat-header">
              <div className="chat-header-info">
                <span className="chat-title">Paulo Shizuo</span>
                <span className="chat-subtitle">{t('chat.subtitle')}</span>
              </div>
              <button 
                className="chat-close-btn" 
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                &times;
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-empty-state">
                  <span className="chat-empty-icon">⌘</span>
                  <p>{t('chat.emptyMsg')}</p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
                  <span className="chat-message-role">
                    {msg.role === 'user' ? 'You' : 'Paulo'}
                  </span>
                  <p className="chat-message-content">{msg.content}</p>
                </div>
              ))}

              {isLoading && (
                <div className="chat-message chat-message--assistant">
                  <span className="chat-message-role">Paulo</span>
                  <div className="chat-typing-indicator">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="chat-error">
                  <p>{error}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 0 && (
              <div className="chat-suggestions">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    className="chat-suggestion-chip"
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <form className="chat-input-area" onSubmit={handleSubmit}>
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder={t('chat.placeholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button 
                type="submit" 
                className="chat-send-btn"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
              >
                &rarr;
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
