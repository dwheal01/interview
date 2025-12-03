import { OpenAI } from 'openai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatRequest = {
  mode: 'define-experience' | 'generate-ideas' | 'challenge-biases'
  experience: string
  history?: ChatMessage[]
  forceSummary?: boolean
  myIdeas?: string[]
  allSuggestedIdeas?: string[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body: ChatRequest = req.body

  try {
    let systemPrompt = ''
    let messages: ChatMessage[] = []

    if (body.mode === 'define-experience') {
      systemPrompt = `You are helping the user define what the human experience of "${body.experience}" means to them.

Ask one question at a time. Do NOT ask more than one question in a single reply.

Continue asking questions until YOU believe you understand their interpretation well.

When you are ready to produce a summary, output a JSON marker block like this:

\`\`\`json
{"type":"summary","complete":true,"content":"...summary text..."}
\`\`\`

Before the JSON, feel free to include a short natural-language transition sentence (optional). After outputting the JSON marker, ask NO further questions.

If the request includes forceSummary=true, skip asking a question and immediately produce the summary + JSON marker.`

      messages = body.history || []
      if (body.forceSummary) {
        messages.push({
          role: 'user',
          content: 'Please provide the summary now.',
        })
      }
    } else if (body.mode === 'generate-ideas') {
      const allIdeas = [...(body.myIdeas || []), ...(body.allSuggestedIdeas || [])]
      const ideasList = allIdeas.length > 0 ? allIdeas.join('\n- ') : 'None yet'

      systemPrompt = `You are generating new ideas for activities/places related to the experience of "${body.experience}".

Here is the user's interpretation summary:

${body.experience}

Here are ALL prior ideas (user + AI):
- ${ideasList}

Generate fresh ideas that are not duplicates and return them in a JSON marker like:

\`\`\`json
{"type":"suggested_ideas","items":["idea1","idea2",...]}
\`\`\`

Generate 5-8 diverse, creative ideas.`

      messages = [
        {
          role: 'user',
          content: 'Generate new ideas for activities or places related to this experience.',
        },
      ]
    } else if (body.mode === 'challenge-biases') {
      const allIdeas = [...(body.myIdeas || []), ...(body.allSuggestedIdeas || [])]
      const ideasList = allIdeas.length > 0 ? allIdeas.join('\n- ') : 'None'

      systemPrompt = `You are analyzing the user's interpretation and prior ideas related to "${body.experience}".

Use:
- Summary of the experience: ${body.experience}
- User's ideas: ${body.myIdeas?.join(', ') || 'None'}
- All AI-suggested ideas: ${ideasList}

Infer potential BIASES from these inputs.

Generate ideas that CHALLENGE these biases.

Return TWO JSON marker blocks:

\`\`\`json
{"type":"biases","items":["bias1","bias2",...]}
\`\`\`

\`\`\`json
{"type":"challenging_ideas","items":["idea1","idea2",...]}
\`\`\`

Identify 3-5 biases and generate 5-8 challenging ideas.`

      messages = [
        {
          role: 'user',
          content: 'Analyze the biases in my thinking and provide ideas that challenge them.',
        },
      ]
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    })

    const rawText = completion.choices[0]?.message?.content || ''

    // Parse response based on mode
    if (body.mode === 'define-experience') {
      const hasSummary = rawText.includes('"type":"summary"')
      return res.status(200).json({
        mode: 'define-experience',
        assistantMessage: rawText,
        isSummaryComplete: hasSummary,
        rawText,
      })
    } else if (body.mode === 'generate-ideas') {
      return res.status(200).json({
        mode: 'generate-ideas',
        suggestedIdeas: [],
        rawText,
      })
    } else if (body.mode === 'challenge-biases') {
      return res.status(200).json({
        mode: 'challenge-biases',
        biases: [],
        challengingIdeas: [],
        rawText,
      })
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    return res.status(500).json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

