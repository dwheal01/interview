import { useEffect, useRef } from 'react'
import { useSession } from '../context/SessionContext'

export function ExperienceInput() {
  const { experience, setExperience, resetSession } = useSession()
  const prevExperienceRef = useRef<string>('')

  useEffect(() => {
    // Reset session when experience changes (but not on initial mount)
    if (prevExperienceRef.current !== '' && prevExperienceRef.current !== experience) {
      resetSession()
    }
    prevExperienceRef.current = experience
  }, [experience, resetSession])

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-2">
        What human experience would you like to explore?
      </label>
      <input
        id="experience"
        type="text"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        placeholder="e.g., 'finding peace', 'feeling accomplished', 'connecting with nature'"
        className="w-full px-4 py-3 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
      />
    </div>
  )
}

