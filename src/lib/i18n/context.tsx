'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Locale, localeNames, localeFlags } from './translations'

type TranslationType = (typeof translations)[Locale]

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationType
  localeNames: typeof localeNames
  localeFlags: typeof localeFlags
  availableLocales: Locale[]
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const LOCALE_KEY = 'lms-locale'
const AVAILABLE_LOCALES: Locale[] = ['fr', 'en', 'de', 'nl']

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem(LOCALE_KEY) as Locale
    if (savedLocale && AVAILABLE_LOCALES.includes(savedLocale)) {
      setLocaleState(savedLocale)
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('en')) {
        setLocaleState('en')
      } else if (browserLang.startsWith('de')) {
        setLocaleState('de')
      } else if (browserLang.startsWith('nl')) {
        setLocaleState('nl')
      }
      // Default is 'fr' which is already set
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_KEY, newLocale)
    document.documentElement.lang = newLocale
  }

  const t = translations[locale]

  return (
    <I18nContext.Provider value={{
      locale,
      setLocale,
      t,
      localeNames,
      localeFlags,
      availableLocales: AVAILABLE_LOCALES
    }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function useTranslation() {
  const { t, locale } = useI18n()
  return { t, locale }
}
