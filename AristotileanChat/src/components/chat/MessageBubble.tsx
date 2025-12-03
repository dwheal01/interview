import { useEffect, useState } from 'react'
import type { ChatMessage } from '../../context/SessionContext'

type MessageBubbleProps = {
  message: ChatMessage
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])

  useEffect(() => {
    if (message.role === 'assistant' && message.content) {
      const lines = message.content.split('\n').filter((line) => line.trim() !== '')
      
      if (lines.length === 0) {
        setDisplayedLines([message.content])
        return
      }

      setDisplayedLines([])
      let currentIdx = 0

      const revealNextLine = () => {
        if (currentIdx < lines.length) {
          setDisplayedLines((prev) => {
            const next = [...prev, lines[currentIdx]]
            currentIdx++
            return next
          })
        }
      }

      // Initial delay
      const timer = setTimeout(() => {
        revealNextLine()
      }, 50)

      const interval = setInterval(() => {
        if (currentIdx < lines.length) {
          revealNextLine()
        } else {
          clearInterval(interval)
        }
      }, 80)

      return () => {
        clearTimeout(timer)
        clearInterval(interval)
      }
    } else {
      // User messages show immediately
      setDisplayedLines([message.content])
    }
  }, [message.content, message.role])

  const isUser = message.role === 'user'
  const isComplete = !isStreaming && displayedLines.length > 0

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}
    >
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-100'
        }`}
      >
        {message.role === 'assistant' ? (
          <div className="space-y-1">
            {displayedLines.map((line, idx) => (
              <p
                key={`${line}-${idx}`}
                className={`transition-opacity duration-300 ${
                  idx === displayedLines.length - 1 && !isComplete
                    ? 'opacity-70'
                    : 'opacity-100'
                }`}
              >
                {line}
              </p>
            ))}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1" />
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  )
}

