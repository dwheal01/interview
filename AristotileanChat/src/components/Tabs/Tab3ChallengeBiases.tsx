import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from '../../context/useSession'
import { parseModelOutput, extractBiases, extractChallengingIdeas } from '../../utils/parseModelOutput'
import { useAbortController } from '../../hooks/useAbortController'

export function Tab3ChallengeBiases() {
  const {
    experience,
    tab1Summary,
    tab1History,
    myIdeas,
    allSuggestedIdeas,
    biases,
    setBiases,
    challengingIdeas,
    setChallengingIdeas,
  } = useSession()

  const [isLoading, setIsLoading] = useState(false)
  const hasRunInitialAnalysis = useRef(false)
  const { createAbortSignal, isAborted } = useAbortController()

  const handleAnalyze = useCallback(async () => {
    if (!tab1Summary) {
      alert('Please complete Tab 1 first')
      return
    }

    const signal = createAbortSignal()
    setIsLoading(true)
    try {
      // Convert tab1History to API format (remove id field)
      const historyForAPI = tab1History.map(({ id, ...msg }) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'challenge-biases',
          experience: tab1Summary || experience,
          history: historyForAPI,
          myIdeas,
          allSuggestedIdeas,
        }),
        signal,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze biases')
      }

      const data = await response.json()
      const { parsed } = parseModelOutput(data.rawText)

      const extractedBiases = extractBiases(parsed)
      const extractedChallengingIdeas = extractChallengingIdeas(parsed)

      if (extractedBiases.length > 0) {
        setBiases(extractedBiases)
      }
      if (extractedChallengingIdeas.length > 0) {
        setChallengingIdeas(extractedChallengingIdeas)
      }
      
      // Mark that we've run the initial analysis
      hasRunInitialAnalysis.current = true
    } catch (error) {
      // Don't show error for aborted requests
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error('Error:', error)
      alert('Failed to analyze biases. Please try again.')
    } finally {
      // Only reset loading if this request wasn't aborted
      if (!isAborted(signal)) {
        setIsLoading(false)
      }
    }
  }, [tab1Summary, experience, tab1History, myIdeas, allSuggestedIdeas, createAbortSignal, isAborted])

  // Run analysis once when tab first opens (if conditions are met and we don't have results)
  useEffect(() => {
    // Only run if we don't have any results yet and haven't run before
    const hasResults = biases.length > 0 || challengingIdeas.length > 0
    if (
      !hasRunInitialAnalysis.current &&
      !hasResults &&
      tab1Summary &&
      (myIdeas.length > 0 || allSuggestedIdeas.length > 0) &&
      !isLoading
    ) {
      handleAnalyze()
    }
  }, [tab1Summary, myIdeas.length, allSuggestedIdeas.length, biases.length, challengingIdeas.length, isLoading, handleAnalyze])

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-200">Challenge Your Biases</h2>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !tab1Summary}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Analyzing...' : biases.length > 0 || challengingIdeas.length > 0 ? 'Refresh Analysis' : 'Analyze Biases'}
            </button>
          </div>

          {/* Biases Panel */}
          <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Your Biases</h3>
            {biases.length === 0 ? (
              <p className="text-gray-400">
                {isLoading
                  ? 'Analyzing your ideas for potential biases...'
                  : 'Click "Analyze Biases" to identify potential biases in your thinking.'}
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <ul className="space-y-2">
                  {biases.map((bias) => (
                    <li
                      key={bias}
                      className="px-4 py-3 bg-gray-600/50 rounded-lg text-gray-100 border border-gray-500"
                    >
                      {bias}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Challenging Ideas Panel */}
          <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">
              Ideas That Challenge Your Biases
            </h3>
            {challengingIdeas.length === 0 ? (
              <p className="text-gray-400">
                {isLoading
                  ? 'Generating challenging ideas...'
                  : 'Challenging ideas will appear here after analysis.'}
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {challengingIdeas.map((idea) => (
                    <div
                      key={idea}
                      className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm"
                    >
                      {idea}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

