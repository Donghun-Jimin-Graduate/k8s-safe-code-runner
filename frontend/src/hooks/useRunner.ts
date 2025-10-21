import {
  Language,
  RunnerMessageType,
  config,
  createCompileMessage,
  createInputMessage,
  createExitMessage,
  type RunnerMessage
} from '@/types'
import type { FitAddon } from '@xterm/addon-fit'
import type { Terminal } from '@xterm/xterm'
import { useState, useEffect, useCallback } from 'react'

interface UseRunnerReturn {
  startRunner: (code: string, language: Language) => Promise<void>
}

export const useRunner = (): UseRunnerReturn => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [terminalInstance, setTerminalInstance] = useState<Terminal | null>(
    null
  )
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(
    null
  )
  const [fitTerminalFn, setFitTerminalFn] = useState<(() => void) | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    // Close WebSocket
    if (ws) {
      ws.close()
      setWs(null)
    }

    // Clear timer
    if (timer) {
      clearInterval(timer)
      setTimer(null)
    }

    // Dispose terminal
    if (terminalInstance) {
      terminalInstance.dispose()
      setTerminalInstance(null)
    }

    // Disconnect resize observer
    if (resizeObserver) {
      resizeObserver.disconnect()
      setResizeObserver(null)
    }

    // Remove resize listener
    if (fitTerminalFn) {
      window.removeEventListener('resize', fitTerminalFn)
      setFitTerminalFn(null)
    }
  }, [ws, timer, terminalInstance, resizeObserver, fitTerminalFn])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  const startRunner = useCallback(
    async (code: string, language: Language) => {
      // Clean up existing resources
      cleanup()

      const element = document.getElementById('runner-container')
      if (!element) {
        console.error('Runner container not found')
        return
      }

      // Clear container
      element.innerHTML = ''

      try {
        // Dynamic import to avoid SSR issues
        const { Terminal } = await import('@xterm/xterm')
        const { FitAddon } = await import('@xterm/addon-fit')

        // Initialize XTerm.js terminal
        const terminal = new Terminal({
          convertEol: true,
          disableStdin: false,
          cursorBlink: true,
          theme: {
            background: '#121728',
            foreground: '#ffffff'
          }
        })

        // Add fit addon
        const fitAddon = new FitAddon()
        terminal.loadAddon(fitAddon)

        // Open terminal in container
        terminal.open(element)

        // Fit terminal to container
        const fitTerminal = () => {
          try {
            fitAddon.fit()
          } catch (error) {
            console.error('Error fitting terminal:', error)
          }
        }

        fitTerminal()
        terminal.focus()

        setTerminalInstance(terminal)
        setFitTerminalFn(() => fitTerminal)

        // Setup resize handling
        const observer = new ResizeObserver(() => {
          fitTerminal()
        })
        observer.observe(element)
        setResizeObserver(observer)

        window.addEventListener('resize', fitTerminal)

        // Setup WebSocket connection
        const newWs = setupWebSocket(terminal, code, language)
        setWs(newWs)

        // Setup connection timeout
        let timeLeft = config.CONNECTION_TIME_LIMIT
        const timerId = setInterval(() => {
          timeLeft--
          if (timeLeft <= 0) {
            clearInterval(timerId)
            if (newWs && newWs.readyState === WebSocket.OPEN) {
              const exitMsg = createExitMessage()
              newWs.send(JSON.stringify(exitMsg))
              terminal.writeln(
                '\n\n[SYS] Time limit exceeded, process terminated (Max 180 seconds)'
              )
            }
            newWs.close()
          }
        }, 1000)
        setTimer(timerId)
      } catch (error) {
        console.error('Error starting runner:', error)
        throw error
      }
    },
    [cleanup]
  )

  return { startRunner }
}

// WebSocket setup function
function setupWebSocket(
  terminal: Terminal,
  code: string,
  language: Language
): WebSocket {
  let currentInputBuffer = ''
  let cursorPosition = 0
  let isWaitingForServerResponse = false
  let isConnected = false
  const inputQueue: string[] = []
  let isComposing = false
  let lastComposedText = ''
  let outputLength = 0

  terminal.writeln('[SYS] Connecting to the runner...')

  const ws = new WebSocket(config.RUNNER_BASE_URL)

  const sendExitMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const exitMsg = createExitMessage()
      ws.send(JSON.stringify(exitMsg))
      terminal.writeln('\n\n[SYS] Sent exit message to the server')
    }
  }

  const isFullWidthCharacter = (char: string): boolean => {
    if (!char) return false
    const code = char.charCodeAt(0)
    return (
      (code >= 0x1100 && code <= 0x11ff) || // Hangul Jamo
      (code >= 0x3130 && code <= 0x318f) || // Hangul Compatibility Jamo
      (code >= 0xac00 && code <= 0xd7a3) || // Hangul Syllables
      (code >= 0xff01 && code <= 0xff60) || // Fullwidth punctuation
      (code >= 0xffe0 && code <= 0xffe6) // Fullwidth symbols
    )
  }

  const processLine = (line: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      isWaitingForServerResponse = true
      const inputMsg = createInputMessage(`${line}\n`)
      ws.send(JSON.stringify(inputMsg))
      currentInputBuffer = ''
      cursorPosition = 0
      lastComposedText = ''
    }
  }

  const handleTextInput = (text: string) => {
    if (cursorPosition === currentInputBuffer.length) {
      // Cursor at end - simple append
      terminal.write(text)
      currentInputBuffer += text
      cursorPosition += text.length
    } else {
      // Cursor in middle - insert mode
      terminal.write('\x1b[4h') // Enable insert mode
      terminal.write(text)
      terminal.write('\x1b[4l') // Disable insert mode

      currentInputBuffer =
        currentInputBuffer.substring(0, cursorPosition) +
        text +
        currentInputBuffer.substring(cursorPosition)
      cursorPosition += text.length
    }
  }

  const handleBackspaceInput = () => {
    if (cursorPosition === 0) return

    const charToDelete = currentInputBuffer[cursorPosition - 1]
    const isFullWidth = isFullWidthCharacter(charToDelete)

    if (cursorPosition === currentInputBuffer.length) {
      // Cursor at end
      if (isFullWidth) {
        terminal.write('\b \b\b \b') // Delete full-width character
      } else {
        terminal.write('\b \b') // Delete regular character
      }
    } else {
      terminal.write('\b') // Move left
      const deleteCount = isFullWidth ? 2 : 1
      terminal.write(`\x1b[${deleteCount}P`) // Delete character
    }

    // Update buffer
    currentInputBuffer =
      currentInputBuffer.substring(0, cursorPosition - 1) +
      currentInputBuffer.substring(cursorPosition)
    cursorPosition--
  }

  const handlePasteWithLineBreaks = (data: string) => {
    const lines = data.split(/\r\n|\r|\n/)

    // Process first line
    if (lines[0]) {
      handleTextInput(lines[0])
    }
    terminal.writeln('')
    processLine(currentInputBuffer)

    // Queue remaining lines
    if (lines.length > 1) {
      inputQueue.push(...lines.slice(1).filter((line) => line.length > 0))
    }
  }

  const processNextQueuedInput = () => {
    if (inputQueue.length > 0 && !isWaitingForServerResponse) {
      const nextLine = inputQueue.shift()
      if (nextLine !== undefined) {
        terminal.writeln(nextLine)
        processLine(nextLine)
      }
    }
  }

  // Setup WebSocket handlers
  ws.onopen = () => {
    terminal.writeln(
      '[SYS] Successfully connected to the runner. Type Ctrl + C to exit.\n'
    )
    terminal.focus()
    isConnected = true
    outputLength = 0

    // Send code to compile/run
    const compileMsg = createCompileMessage(code, language)
    ws.send(JSON.stringify(compileMsg))
  }

  ws.onclose = () => {
    terminal.writeln('\n[SYS] Connection to the runner closed')
    isWaitingForServerResponse = false
    isConnected = false
  }

  ws.onerror = (error) => {
    terminal.writeln('[SYS] Error occurred, connection closed')
    console.error('WebSocket error:', error)
    isWaitingForServerResponse = false
    isConnected = false
  }

  ws.onmessage = (event) => {
    try {
      const data: RunnerMessage = JSON.parse(event.data)
      const msgType = data.type

      switch (msgType) {
        case RunnerMessageType.COMPILE_ERR:
          terminal.writeln(data.stderr || 'Compilation error')
          break

        case RunnerMessageType.ECHO:
          return

        case RunnerMessageType.STDOUT:
        case RunnerMessageType.STDERR:
          outputLength += (data.data || '').length
          terminal.write(data.data || '')

          // Check output length limit
          if (outputLength > config.MAX_OUTPUT_LENGTH) {
            terminal.writeln(
              '\n\n[SYS] Output is too long, process terminated (Max 100000 characters)'
            )
            sendExitMessage()
          }
          break

        case RunnerMessageType.EXIT:
          terminal.writeln(
            `\n\n[SYS] Process ended with exit code: ${data.return_code || 0}`
          )
          break

        default:
          return
      }

      // Process next queued input after server response
      if (
        msgType === RunnerMessageType.STDOUT ||
        msgType === RunnerMessageType.STDERR ||
        msgType === RunnerMessageType.ECHO
      ) {
        isWaitingForServerResponse = false
        processNextQueuedInput()
      }
    } catch (error) {
      terminal.writeln(`[Error] ${error}`)
      isWaitingForServerResponse = false
    }
  }

  // Setup input handling
  terminal.onData((data) => {
    if (!isConnected) return

    // Ctrl+C to exit
    if (data === '\x03') {
      sendExitMessage()
      return
    }

    // Queue input if waiting for server response
    if (isWaitingForServerResponse) {
      if (data.includes('\r') || data.includes('\n')) {
        const lines = data.split(/\r\n|\r|\n/)
        inputQueue.push(...lines.filter((line) => line.length > 0))
      }
      return
    }

    // Handle IME composition
    if (isComposing || lastComposedText === data) {
      lastComposedText = ''
      return
    }

    // Handle paste with line breaks
    if (data.includes('\r') || data.includes('\n')) {
      handlePasteWithLineBreaks(data)
      return
    }

    // Handle backspace
    if (data === '\b' || data === '\x7f') {
      handleBackspaceInput()
      return
    }

    // Handle arrow keys
    if (data === '\x1b[D') {
      // Left arrow
      if (cursorPosition > 0) {
        const prevChar = currentInputBuffer[cursorPosition - 1]
        const isFullWidth = isFullWidthCharacter(prevChar)
        cursorPosition--

        terminal.write('\x1b[D') // Move cursor left
        if (isFullWidth) {
          terminal.write('\x1b[D') // Move again for full-width
        }
      }
      return
    }

    if (data === '\x1b[C') {
      // Right arrow
      if (cursorPosition < currentInputBuffer.length) {
        const currChar = currentInputBuffer[cursorPosition]
        const isFullWidth = isFullWidthCharacter(currChar)
        cursorPosition++

        terminal.write('\x1b[C') // Move cursor right
        if (isFullWidth) {
          terminal.write('\x1b[C') // Move again for full-width
        }
      }
      return
    }

    // Handle regular text input
    if (data.length === 1 && !data.startsWith('\x1b')) {
      handleTextInput(data)
    }
  })

  // Setup IME handling
  if (terminal.textarea) {
    terminal.textarea.addEventListener(
      'compositionstart',
      (e: CompositionEvent) => {
        if (!isConnected) {
          e.preventDefault()
          return
        }
        isComposing = true
      }
    )

    terminal.textarea.addEventListener(
      'compositionend',
      (e: CompositionEvent) => {
        if (!isConnected || isWaitingForServerResponse) {
          e.preventDefault()
          return
        }

        const composedText = e.data
        lastComposedText = composedText
        handleTextInput(composedText)
        isComposing = false
      }
    )
  }

  return ws
}
