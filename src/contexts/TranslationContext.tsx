import React, { createContext, useContext, type ReactNode } from 'react'

type TranslationFunction = (
  key: string,
  params?: Record<string, string | number>,
) => string

interface TranslationContextType {
  t: TranslationFunction
}

const translations: Record<string, string> = {
  'header.title': 'Paulo Shizuo Vasconcelos Tatibana',
  'header.subtitle': 'Computer Scientist - Developer',
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.skills': 'Skills',
  'nav.projects': 'Projects',
  'nav.contact': 'Contact',
  'hero.description':
    'Computer Science student building software through product thinking, interface restraint, and full-stack implementation.',
  'skills.title': 'Skills',
  'projects.title': 'Projects',
  'projects.viewAll': 'View all on GitHub',
  'contact.title': 'Contact',
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

interface TranslationProviderProps {
  children: ReactNode
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const t: TranslationFunction = (key, params) => {
    const text = translations[key] || key

    if (!params) {
      return text
    }

    return Object.entries(params).reduce(
      (result, [paramKey, value]) => result.replace(`{${paramKey}}`, String(value)),
      text,
    )
  }

  return (
    <TranslationContext.Provider value={{ t }}>
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
