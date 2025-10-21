import { useCodeEditor } from '@/hooks/useCodeEditor'
import { useRunner } from '@/hooks/useRunner'
import { useToast } from '@/hooks/useToast'
import { Language } from '@/types'
import { Play, Save, Trash2 } from 'lucide-react'
import React, { useState, useCallback } from 'react'

interface EditorHeaderProps {
  className?: string
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  className = ''
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    Language.PYTHON
  )
  const [isRunning, setIsRunning] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  const { getCode, setLanguage, saveToLocalStorage, clear } = useCodeEditor()
  const { startRunner } = useRunner()
  const { showToast } = useToast()

  const handleRun = useCallback(async () => {
    if (isRunning) {
      showToast('Code is already running', 'info')
      return
    }

    const code = getCode()
    if (!code.trim()) {
      showToast('Please write code before running', 'error')
      return
    }

    setIsRunning(true)

    // Save code to localStorage
    saveToLocalStorage()

    try {
      await startRunner(code, currentLanguage)
      showToast('Code execution started', 'success')
    } catch (error) {
      console.error('Failed to start runner:', error)
      showToast('Failed to start code execution', 'error')
    } finally {
      // Reset running state after a delay
      setTimeout(() => {
        setIsRunning(false)
      }, 2000)
    }
  }, [
    isRunning,
    getCode,
    currentLanguage,
    saveToLocalStorage,
    startRunner,
    showToast
  ])

  const handleLanguageChange = useCallback(
    (newLanguage: Language) => {
      if (isRunning) {
        showToast('Cannot change language while code is running', 'error')
        return
      }

      if (newLanguage === currentLanguage) {
        return
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Change language to ${newLanguage}?\n\nThis will load the template for the new language. Your current code will be saved.`
      )

      if (confirmed) {
        // Save current code before switching
        saveToLocalStorage()

        setCurrentLanguage(newLanguage)
        setLanguage(newLanguage)

        showToast(`Language changed to ${newLanguage}`, 'success')
      }
    },
    [isRunning, currentLanguage, saveToLocalStorage, setLanguage, showToast]
  )

  const handleSave = useCallback(() => {
    saveToLocalStorage()
    showToast('Code saved successfully!', 'success')
  }, [saveToLocalStorage, showToast])

  const handleReset = useCallback(() => {
    clear()
    showToast('Code reset successfully!', 'success')
    setIsResetModalOpen(false)
  }, [clear, showToast])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter for run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }

      // Ctrl/Cmd + S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleRun, handleSave])

  return (
    <div
      className={`flex shrink-0 items-center justify-between border-b border-b-slate-700 bg-[#222939] px-6 ${className}`}
    >
      <div>
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value as Language)}
          disabled={isRunning}
          className="focus:outline-hidden h-8 min-w-[86px] max-w-fit shrink-0 rounded-[4px] border-none bg-slate-600 px-2 font-mono text-white hover:bg-slate-700 focus:ring-0 focus:ring-offset-0 disabled:opacity-60"
        >
          {Object.values(Language).map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsResetModalOpen(true)}
          disabled={isRunning}
          className="flex size-7 h-8 w-[77px] shrink-0 items-center justify-center gap-[5px] rounded-[4px] bg-slate-600 font-normal text-red-500 hover:bg-slate-700 disabled:opacity-60"
          title="Reset code to template"
        >
          <Trash2 size={17} />
          Reset
        </button>

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex h-8 shrink-0 items-center gap-1 rounded-[4px] border-none bg-[#D7E5FE] px-2 font-normal text-[#484C4D] hover:bg-[#c6d3ea] disabled:opacity-60"
          title="Ctrl/Cmd + Enter | Run your code in interactive terminal"
        >
          <Play size={22} />
          Run
        </button>

        <button
          onClick={handleSave}
          disabled={isRunning}
          className="flex size-7 h-8 w-[77px] shrink-0 items-center justify-center gap-[5px] rounded-[4px] bg-[#fafafa] font-medium text-[#484C4D] hover:bg-[#e1e1e1] disabled:opacity-60"
          title="Ctrl/Cmd + S | Save your code in your browser"
        >
          <Save className="stroke-[1.3]" size={22} />
          Save
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Reset code
            </h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to reset to the default code?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
