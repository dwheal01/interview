import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type SessionContextType = {
  // Experience input
  experience: string
  setExperience: (v: string) => void

  // Tab 1: Define Experience
  tab1History: ChatMessage[]
  setTab1History: Dispatch<SetStateAction<ChatMessage[]>>
  tab1Summary: string | null
  setTab1Summary: Dispatch<SetStateAction<string | null>>
  isFinishedTab1: boolean
  setIsFinishedTab1: (b: boolean) => void

  // Tab 2: Generate Ideas
  myIdeas: string[]
  setMyIdeas: Dispatch<SetStateAction<string[]>>
  allSuggestedIdeas: string[]
  setAllSuggestedIdeas: Dispatch<SetStateAction<string[]>>

  // Reset function
  resetSession: () => void
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined)

