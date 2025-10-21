import { CodeEditor } from '@/components/CodeEditor'
import { EditorHeader } from '@/components/EditorHeader'
import { Terminal } from '@/components/Terminal'
import { useToast } from '@/hooks/useToast'
import '@xterm/xterm/css/xterm.css'
import React, { useEffect } from 'react'
import './App.css'

function App() {
  const { showToast } = useToast()

  useEffect(() => {
    // Show welcome message
    const timer = setTimeout(() => {
      showToast(
        'Code Runner MVP loaded successfully! Write some code and click Run.',
        'success'
      )
    }, 500)

    return () => clearTimeout(timer)
  }, [showToast])

  return (
    <div className="app">
      <EditorHeader />

      <div className="editor-container">
        <div className="code-editor-panel">
          <CodeEditor />
        </div>

        <div className="terminal-panel">
          <Terminal />
        </div>
      </div>
    </div>
  )
}

export default App
