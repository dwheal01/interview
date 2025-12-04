import { useSession } from '../../context/useSession'
import type { Bias } from '../../context/SessionContextDef'

type BiasCardProps = {
  bias: Bias
}

export function BiasCard({ bias }: BiasCardProps) {
  const {
    biasDecisions,
    setBiasDecisions,
    myIdeas,
    setMyIdeas,
    allSuggestedIdeas,
    setAllSuggestedIdeas,
    tab3ChallengingIdeas,
    setTab3ChallengingIdeas,
  } = useSession()

  const decision = biasDecisions[bias.id]

  const handleReject = () => {
    setBiasDecisions((prev) => ({ ...prev, [bias.id]: 'rejected' }))
  }

  const handleAccept = () => {
    setBiasDecisions((prev) => ({ ...prev, [bias.id]: 'accepted' }))
  }

  const handleToggleIdea = (idea: string) => {
    const isAlreadyAdded = myIdeas.includes(idea)
    
    if (isAlreadyAdded) {
      // Remove from Tab 2 ideas
      setMyIdeas((prev) => prev.filter((i) => i !== idea))
    } else {
      // Add to Tab 2 state
      setMyIdeas((prev) => [...prev, idea])
      if (!allSuggestedIdeas.includes(idea)) {
        setAllSuggestedIdeas((prev) => [...prev, idea])
      }
      // Mark as Tab 3 challenging idea for purple color
      if (!tab3ChallengingIdeas.includes(idea)) {
        setTab3ChallengingIdeas((prev) => [...prev, idea])
      }
    }
  }

  const isRejected = decision === 'rejected'
  const isAccepted = decision === 'accepted'

  return (
    <div
      className={`
        flex w-full max-w-2xl flex-col rounded-xl border border-gray-600 bg-gray-700/50 p-6 shadow-sm
        transition
        ${isRejected ? 'opacity-50 grayscale' : ''}
      `}
    >
      <h3 className="mb-2 text-base font-semibold text-gray-200">{bias.title}</h3>
      <p className="mb-4 text-sm text-gray-300 whitespace-pre-line">
        {bias.explanation}
      </p>

      <div className="mb-3 flex gap-2">
        <button
          onClick={handleReject}
          className={`rounded-full border px-3 py-1 text-sm transition ${
            isRejected
              ? 'bg-gray-600 border-gray-500 text-gray-300'
              : 'border-gray-500 text-gray-300 hover:bg-gray-600'
          }`}
        >
          ✕ This doesn&apos;t fit me
        </button>
        <button
          onClick={handleAccept}
          className={`rounded-full border px-3 py-1 text-sm transition ${
            isAccepted
              ? 'bg-purple-600 text-white border-purple-500'
              : 'border-purple-500 text-purple-300 hover:bg-purple-600/20'
          }`}
        >
          ✔ This resonates
        </button>
      </div>

      {isAccepted && (
        <div className="mt-2 border-t border-gray-600 pt-2">
          <p className="mb-2 text-xs font-semibold uppercase text-purple-400">
            Ideas that challenge this bias
          </p>
          <div className="flex flex-wrap gap-2">
            {bias.challengingIdeas.map((idea) => {
              const isAdded = myIdeas.includes(idea)
              return (
                <button
                  key={idea}
                  onClick={() => handleToggleIdea(idea)}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    isAdded
                      ? 'bg-gray-600 text-gray-400 border border-gray-500'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {idea}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

