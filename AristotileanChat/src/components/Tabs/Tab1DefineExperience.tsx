import { useState, useEffect, useRef } from 'react'
import { useSession } from '../../context/SessionContext'
import type { ChatMessage } from '../../context/SessionContext'
import { ChatMessageList } from '../chat/ChatMessageList'
import { parseModelOutput, extractSummary } from '../../utils/parseModelOutput'

export function Tab1DefineExperience() {
  const {
    experience,
    tab1History,
    setTab1History,
    tab1Summary,
    setTab1Summary,
    isFinishedTab1,
    setIsFinishedTab1,
  } = useSession()

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const hasInitializedRef = useRef<string>('')

  const sendMessage = async (userMessage: string, forceSummary = false) => {
    if (!experience.trim()) {
      alert('Please enter an experience first')
      return
    }

    setIsLoading(true)
    const newUserMessage: ChatMessage = { role: 'user', content: userMessage }
    const updatedHistory = [...tab1History, newUserMessage]
    setTab1History(updatedHistory)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'define-experience',
          experience,
          history: updatedHistory,
          forceSummary,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const { parsed, cleanText } = parseModelOutput(data.rawText)

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: cleanText || data.rawText,
      }

      setTab1History([...updatedHistory, assistantMessage])

      // Check for summary
      const summary = extractSummary(parsed)
      if (summary) {
        setTab1Summary(summary)
        setIsFinishedTab1(true)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
      setInput('')
    }
  }

  // Auto-start conversation when experience is submitted
  useEffect(() => {
    const currentExperience = experience.trim()
    
    // Reset initialization flag if experience changed
    if (hasInitializedRef.current !== currentExperience && currentExperience) {
      hasInitializedRef.current = ''
    }
    
    if (
      currentExperience &&
      tab1History.length === 0 &&
      tab1Summary === null &&
      !isLoading &&
      hasInitializedRef.current !== currentExperience
    ) {
      hasInitializedRef.current = currentExperience
      // Send initial request to get first question
      const startConversation = async () => {
        setIsLoading(true)
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'define-experience',
              experience,
              history: [],
              forceSummary: false,
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to get response')
          }

          const data = await response.json()
          const { parsed, cleanText } = parseModelOutput(data.rawText)

          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: cleanText || data.rawText,
          }

          setTab1History([assistantMessage])

          // Check for summary (unlikely on first message, but handle it)
          const summary = extractSummary(parsed)
          if (summary) {
            setTab1Summary(summary)
            setIsFinishedTab1(true)
          }
        } catch (error) {
          console.error('Error starting conversation:', error)
          alert('Failed to start conversation. Please try again.')
        } finally {
          setIsLoading(false)
        }
      }

      startConversation()
    }
  }, [experience, tab1History.length, tab1Summary, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading && experience.trim()) {
      sendMessage(input.trim())
    }
  }

  const handleSummarize = () => {
    if (!isLoading && experience.trim()) {
      sendMessage('', true)
    }
  }

  const hasExperience = experience.trim() !== ''
  const showPlaceholder = !hasExperience && tab1History.length === 0

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 overflow-hidden">
        {showPlaceholder ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">Enter a human experience above to begin.</p>
          </div>
        ) : (
          <ChatMessageList messages={tab1History} isStreaming={isLoading} />
        )}
      </div>

      {tab1Summary && (
        <div className="border-t border-gray-700 p-4 bg-gray-750">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Summary</h3>
            <div className="bg-gray-700 rounded-lg p-4 text-gray-100">
              <p className="whitespace-pre-wrap">{tab1Summary}</p>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Answer the question..."
            disabled={isLoading || isFinishedTab1 || !hasExperience}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isFinishedTab1 || !hasExperience}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
          {!isFinishedTab1 && hasExperience && tab1History.length > 0 && (
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isLoading}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Summarize Now
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
