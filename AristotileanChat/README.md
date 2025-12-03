# AristotileanChat

A guided human experience brainstorming chatbot built with Vite + React + TypeScript + TailwindCSS and Vercel Serverless Functions.

## Features

- **Tab 1: Define Experience** - Multi-turn Q&A to understand what a human experience means to the user
- **Tab 2: Generate Ideas** - Expand user-provided ideas with AI suggestions using a chip system
- **Tab 3: Challenge Biases** - Identify biases in thinking and generate ideas that challenge them

## Tech Stack

- **Frontend**: Vite + React 19 + TypeScript + TailwindCSS
- **Backend**: Vercel Serverless Functions
- **AI**: OpenAI GPT-4o API

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- OpenAI API key
- Vercel account (for deployment)

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run Vercel dev server** (for API functions):
   ```bash
   npx vercel dev
   ```
   
   This will start both the Vite dev server and the serverless functions locally.

4. **Or run Vite dev server only** (for frontend-only development):
   ```bash
   npm run dev
   ```
   
   Note: API calls will fail in this mode unless you have a separate backend running.

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Deployment to Vercel

1. **Push your code to GitHub**

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the Vite configuration

3. **Add Environment Variable**:
   - In your Vercel project settings, add:
     - `OPENAI_API_KEY` = your OpenAI API key

4. **Deploy**:
   - Vercel will automatically deploy on every push to main
   - The `/api/chat.ts` file will be automatically deployed as a serverless function

## Project Structure

```
AristotileanChat/
├── api/
│   └── chat.ts              # Vercel serverless function
├── src/
│   ├── App.tsx              # Main app component with tab navigation
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles with TailwindCSS
│   ├── context/
│   │   └── SessionContext.tsx  # Global state management
│   ├── components/
│   │   ├── ExperienceInput.tsx
│   │   ├── Tabs/
│   │   │   ├── Tab1DefineExperience.tsx
│   │   │   ├── Tab2GenerateIdeas.tsx
│   │   │   └── Tab3ChallengeBiases.tsx
│   │   └── chat/
│   │       ├── ChatMessageList.tsx
│   │       └── MessageBubble.tsx
│   └── utils/
│       └── parseModelOutput.ts   # JSON marker extraction helpers
└── vercel.json              # Vercel configuration
```

## How It Works

1. **Tab 1**: User enters an experience (e.g., "finding peace"). The AI asks questions one at a time to understand what this means to them. When ready, it produces a summary.

2. **Tab 2**: User can add their own ideas and click "Generate More Ideas" to get AI suggestions. Ideas are displayed as chips that can be clicked to add to the user's list.

3. **Tab 3**: After generating ideas, the AI analyzes potential biases in the user's thinking and suggests ideas that challenge those biases.

All AI responses use hybrid JSON markers embedded in markdown code blocks for structured data extraction while maintaining natural language flow.

## License

MIT
