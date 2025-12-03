import { useEffect, useState, useRef } from 'react'
import type { ChatMessage } from '../../context/SessionContext'

type MessageBubbleProps = {
  message: ChatMessage
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const currentIdxRef = useRef(0)

  useEffect(() => {
    console.log('MessageBubble received message:', message)
    if (message.role === 'assistant' && message.content) {
      const content = message.content.trim()
      
      // If content is empty, show a placeholder
      if (!content) {
        console.warn('Empty message content received:', message)
        setDisplayedLines(['(Empty message)'])
        return
      }
      
      console.log('MessageBubble processing content:', content)
      
      const lines = content.split('\n').filter((line) => line.trim() !== '')
      
      // If all lines were filtered out (only whitespace), show the original content
      if (lines.length === 0) {
        setDisplayedLines([content])
        return
      }

      // For single-line messages, show immediately
      if (lines.length === 1) {
        setDisplayedLines([lines[0]])
        return
      }

      // For multi-line messages, animate line by line
      setDisplayedLines([])
      currentIdxRef.current = 0

      const revealNextLine = () => {
        if (currentIdxRef.current < lines.length) {
          setDisplayedLines((prev) => {
            const next = [...prev, lines[currentIdxRef.current]]
            currentIdxRef.current++
            return next
          })
        }
      }

      // Initial delay
      const timer = setTimeout(() => {
        revealNextLine()
      }, 50)

      const interval = setInterval(() => {
        if (currentIdxRef.current < lines.length) {
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

