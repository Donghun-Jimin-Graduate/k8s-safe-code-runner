import { useCodeEditor } from '@/hooks/useCodeEditor'
import React, { useRef, useEffect, useCallback } from 'react'

interface CodeEditorProps {
  className?: string
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ className = '' }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { code, setCode, getCode } = useCodeEditor()

  // Handle tab key for indentation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()

        const textarea = e.currentTarget
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const value = textarea.value

        // Insert 4 spaces for tab
        const newValue =
          value.substring(0, start) + '    ' + value.substring(end)
        setCode(newValue)

        // Move cursor after the inserted spaces
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4
        }, 0)
      }
    },
    [setCode]
  )

  // Handle code changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCode(e.target.value)
    },
    [setCode]
  )

  // Focus the editor
  const focus = useCallback(() => {
    textareaRef.current?.focus()
  }, [])

  // Expose focus method globally for keyboard shortcuts
  useEffect(() => {
    const globalFocus = () => focus()
    window.addEventListener('focusCodeEditor', globalFocus)
    return () => window.removeEventListener('focusCodeEditor', globalFocus)
  }, [focus])

  return (
    <div className={`flex flex-1 flex-col ${className}`}>
      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Write your code here..."
        spellCheck={false}
        className="flex-1 resize-none border-none bg-[#1e293b] p-4 font-mono text-sm leading-relaxed text-[#e2e8f0] outline-none placeholder:text-[#64748b]"
        style={{
          tabSize: 4,
          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace"
        }}
      />
    </div>
  )
}
