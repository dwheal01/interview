import { useState } from 'react'
import { useSession } from '../context/SessionContext'

type ExperienceInputProps = {
  onExperienceSubmitted?: () => void
}

export function ExperienceInput({ onExperienceSubmitted }: ExperienceInputProps) {
  const { setExperience, resetSession } = useSession()
  const [draftExperience, setDraftExperience] = useState('')

  const handleSubmit = () => {
    const value = draftExperience.trim()
    
    if (value) {
      // Reset session before setting new experience
      resetSession()
      // Update global experience
      setExperience(value)
      // Clear draft
      setDraftExperience('')
      // Optionally switch to Tab 1
      onExperienceSubmitted?.()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-2">
        I'm exploring the experience of…
      </label>
      <div className="flex items-center gap-2">
        <input
          id="experience"
          type="text"
          value={draftExperience}
          onChange={(e) => setDraftExperience(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., 'finding peace', 'feeling accomplished', 'connecting with nature'"
          className="flex-1 rounded-md border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
        />
        <button
          onClick={handleSubmit}
          disabled={!draftExperience.trim()}
          className="rounded-full p-2 hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-gray-100"
          aria-label="Submit experience"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
