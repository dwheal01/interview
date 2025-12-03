import { useState, useEffect, useCallback } from 'react'
import { useSession } from '../../context/SessionContext'
import { parseModelOutput, extractBiases, extractChallengingIdeas } from '../../utils/parseModelOutput'

export function Tab3ChallengeBiases() {
  const {
    experience,
    tab1Summary,
    myIdeas,
    allSuggestedIdeas,
  } = useSession()

  const [biases, setBiases] = useState<string[]>([])
  const [challengingIdeas, setChallengingIdeas] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = useCallback(async () => {
    if (!tab1Summary) {
      alert('Please complete Tab 1 first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'challenge-biases',
          experience,
          myIdeas,
          allSuggestedIdeas,
        }),
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
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to analyze biases. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [tab1Summary, experience, myIdeas, allSuggestedIdeas])

  // Auto-analyze when tab is accessed if we have data
  useEffect(() => {
    if (tab1Summary && (myIdeas.length > 0 || allSuggestedIdeas.length > 0) && biases.length === 0 && !isLoading) {
      handleAnalyze()
    }
  }, [tab1Summary, myIdeas.length, allSuggestedIdeas.length, biases.length, isLoading, handleAnalyze])

  return (
    <div className="flex flex-col h-full bg-gray-800 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-200">Challenge Your Biases</h2>
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !tab1Summary}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Biases'}
          </button>
        </div>

        {/* Biases Panel */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Your Biases</h3>
          {biases.length === 0 ? (
            <p className="text-gray-400">
              {isLoading
                ? 'Analyzing your ideas for potential biases...'
                : 'Click "Analyze Biases" to identify potential biases in your thinking.'}
            </p>
          ) : (
            <ul className="space-y-2">
              {biases.map((bias) => (
                <li
                  key={bias}
                  className="px-4 py-3 bg-gray-600 rounded-lg text-gray-100"
                >
                  {bias}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Challenging Ideas Panel */}
        <div className="bg-gray-700 rounded-lg p-6">
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
          )}
        </div>
      </div>
    </div>
  )
}

