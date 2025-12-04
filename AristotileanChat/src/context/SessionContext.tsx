import { useState } from 'react'
import type { ReactNode } from 'react'
import { SessionContext, type ChatMessage, type Bias } from './SessionContextDef'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [experience, setExperience] = useState<string>('')
  const [tab1History, setTab1History] = useState<ChatMessage[]>([])
  const [tab1Summary, setTab1Summary] = useState<string | null>(null)
  const [isFinishedTab1, setIsFinishedTab1] = useState<boolean>(false)
  const [myIdeas, setMyIdeas] = useState<string[]>([])
  const [allSuggestedIdeas, setAllSuggestedIdeas] = useState<string[]>([])
  const [biases, setBiases] = useState<Bias[] | null>(null)
  const [biasDecisions, setBiasDecisions] = useState<Record<string, 'accepted' | 'rejected' | undefined>>({})

  const resetSession = () => {
    setTab1History([])
    setTab1Summary(null)
    setIsFinishedTab1(false)
    setMyIdeas([])
    setAllSuggestedIdeas([])
    setBiases(null)
    setBiasDecisions({})
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
        biases,
        setBiases,
        biasDecisions,
        setBiasDecisions,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}
