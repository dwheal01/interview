import { createContext, useContext, useState } from 'react'
import type { ReactNode, Dispatch, SetStateAction } from 'react'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type SessionContextType = {
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

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [experience, setExperience] = useState<string>('')
  const [tab1History, setTab1History] = useState<ChatMessage[]>([])
  const [tab1Summary, setTab1Summary] = useState<string | null>(null)
  const [isFinishedTab1, setIsFinishedTab1] = useState<boolean>(false)
  const [myIdeas, setMyIdeas] = useState<string[]>([])
  const [allSuggestedIdeas, setAllSuggestedIdeas] = useState<string[]>([])

  const resetSession = () => {
    setTab1History([])
    setTab1Summary(null)
    setIsFinishedTab1(false)
    setMyIdeas([])
    setAllSuggestedIdeas([])
  }

  return (
    <SessionContext.Provider
      value={{
        experience,
        setExperience,
        tab1History,
        setTab1History,
        tab1Summary,
        setTab1Summary,
        isFinishedTab1,
        setIsFinishedTab1,
        myIdeas,
        setMyIdeas,
        allSuggestedIdeas,
        setAllSuggestedIdeas,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

