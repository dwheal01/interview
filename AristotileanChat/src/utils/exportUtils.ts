import type { ChatMessage, Bias } from '../context/SessionContextDef'

export type ExportData = {
  version: string
  exportedAt: string
  experience: {
    name: string
    summary: string | null
    conversation: Array<{
      role: 'user' | 'assistant'
      content: string
      timestamp?: string
    }>
  }
  ideas: {
    myIdeas: string[]
    aiSuggested: string[]
    biasChallenging: string[]
  }
  biases: Array<{
    id: string
    title: string
    explanation: string
    decision: 'accepted' | 'rejected' | undefined
    aiChallengingIdeas: string[]
    userAddedIdeas: string[]
  }>
}

type SessionData = {
  experience: string
  tab1History: ChatMessage[]
  tab1Summary: string | null
  myIdeas: string[]
  allSuggestedIdeas: string[]
  tab3ChallengingIdeas: string[]
  biases: Bias[] | null
  biasDecisions: Record<string, 'accepted' | 'rejected' | undefined>
  biasUserIdeas: Record<string, string[]>
}

/**
 * Formats session data into export structure
 */
export function formatSessionForExport(data: SessionData): ExportData {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    experience: {
      name: data.experience,
      summary: data.tab1Summary,
      conversation: data.tab1History.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    },
    ideas: {
      myIdeas: data.myIdeas,
      aiSuggested: data.allSuggestedIdeas.filter(
        (idea) => !data.tab3ChallengingIdeas.includes(idea)
      ),
      biasChallenging: data.tab3ChallengingIdeas,
    },
    biases: (data.biases || []).map((bias) => ({
      id: bias.id,
      title: bias.title,
      explanation: bias.explanation,
      decision: data.biasDecisions[bias.id],
      aiChallengingIdeas: bias.challengingIdeas,
      userAddedIdeas: data.biasUserIdeas[bias.id] || [],
    })),
  }
}

/**
 * Downloads data as JSON file
 */
export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

/**
 * Generates a filename for the export
 */
export function generateExportFilename(experience: string): string {
  const sanitized = experience
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
  const timestamp = new Date().toISOString().split('T')[0]
  return `aristotelian-chat-${sanitized || 'session'}-${timestamp}.json`
}

