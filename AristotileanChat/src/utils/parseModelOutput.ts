/**
 * Parses OpenAI response text to extract JSON markers from markdown code blocks
 */

export type ParsedSummary = {
  type: 'summary'
  complete: boolean
  content: string
}

export type ParsedSuggestedIdeas = {
  type: 'suggested_ideas'
  items: string[]
}

export type ParsedBiases = {
  type: 'biases'
  items: string[]
}

export type ParsedChallengingIdeas = {
  type: 'challenging_ideas'
  items: string[]
}

export type ParsedOutput =
  | ParsedSummary
  | ParsedSuggestedIdeas
  | ParsedBiases
  | ParsedChallengingIdeas

/**
 * Extracts JSON markers from markdown code blocks in the response text
 */
export function parseModelOutput(rawText: string): {
  parsed: ParsedOutput[]
  cleanText: string
} {
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g
  const parsed: ParsedOutput[] = []
  let cleanText = rawText

  let match
  while ((match = jsonBlockRegex.exec(rawText)) !== null) {
    try {
      const jsonContent = match[1].trim()
      const parsedJson = JSON.parse(jsonContent) as ParsedOutput
      parsed.push(parsedJson)
      // Remove the JSON block from clean text
      cleanText = cleanText.replace(match[0], '').trim()
    } catch (e) {
      console.error('Failed to parse JSON marker:', e)
    }
  }

  return { parsed, cleanText }
}

/**
 * Extracts summary from parsed output
 */
export function extractSummary(parsed: ParsedOutput[]): string | null {
  const summary = parsed.find((p) => p.type === 'summary' && p.complete)
  return summary ? (summary as ParsedSummary).content : null
}

/**
 * Extracts suggested ideas from parsed output
 */
export function extractSuggestedIdeas(parsed: ParsedOutput[]): string[] {
  const ideas = parsed.find((p) => p.type === 'suggested_ideas')
  return ideas ? (ideas as ParsedSuggestedIdeas).items : []
}

/**
 * Extracts biases from parsed output
 */
export function extractBiases(parsed: ParsedOutput[]): string[] {
  const biases = parsed.find((p) => p.type === 'biases')
  return biases ? (biases as ParsedBiases).items : []
}

/**
 * Extracts challenging ideas from parsed output
 */
export function extractChallengingIdeas(parsed: ParsedOutput[]): string[] {
  const ideas = parsed.find((p) => p.type === 'challenging_ideas')
  return ideas ? (ideas as ParsedChallengingIdeas).items : []
}

