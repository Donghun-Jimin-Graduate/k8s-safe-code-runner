import { Language, defaultTemplates } from '@/types'
import { useState, useCallback, useRef, useEffect } from 'react'

interface UseCodeEditorReturn {
  code: string
  setCode: (code: string) => void
  getCode: () => string
  language: Language
  setLanguage: (language: Language) => void
  saveToLocalStorage: () => void
  loadFromLocalStorage: (language: Language) => string | null
  clear: () => void
}

export const useCodeEditor = (): UseCodeEditorReturn => {
  const [code, setCodeState] = useState<string>('')
  const [language, setLanguageState] = useState<Language>(Language.PYTHON)
  const codeRef = useRef<string>('')

  // Keep ref in sync with state
  const setCode = useCallback((newCode: string) => {
    setCodeState(newCode)
    codeRef.current = newCode
  }, [])

  const getCode = useCallback(() => {
    return codeRef.current
  }, [])

  const saveToLocalStorage = useCallback(() => {
    const key = `code_${language}`
    const currentCode = getCode()

    try {
      localStorage.setItem(key, currentCode)
    } catch (error) {
      console.error('Failed to save code to localStorage:', error)
      throw new Error('Failed to save code')
    }
  }, [language, getCode])

  const loadFromLocalStorage = useCallback((lang: Language): string | null => {
    const key = `code_${lang}`
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Failed to load code from localStorage:', error)
      return null
    }
  }, [])

  const setLanguage = useCallback(
    (newLanguage: Language) => {
      setLanguageState(newLanguage)

      // Load saved code or template for the new language
      const savedCode = loadFromLocalStorage(newLanguage)
      const template = defaultTemplates[newLanguage] || ''

      setCode(savedCode || template)
    },
    [loadFromLocalStorage, setCode]
  )

  const clear = useCallback(() => {
    const template = defaultTemplates[language] || ''
    setCode(template)
  }, [setCode, language])

  // Initialize with default template
  useEffect(() => {
    const savedCode = loadFromLocalStorage(language)
    const template = defaultTemplates[language] || ''
    setCode(savedCode || template)
  }, [loadFromLocalStorage, setCode, language]) // Run when language changes

  return {
    code,
    setCode,
    getCode,
    language,
    setLanguage,
    saveToLocalStorage,
    loadFromLocalStorage,
    clear
  }
}
