import { useState } from 'react'
import { SessionProvider, useSession } from './context/SessionContext'
import { ExperienceInput } from './components/ExperienceInput'
import { Tab1DefineExperience } from './components/Tabs/Tab1DefineExperience'
import { Tab2GenerateIdeas } from './components/Tabs/Tab2GenerateIdeas'
import { Tab3ChallengeBiases } from './components/Tabs/Tab3ChallengeBiases'

function AppContent() {
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2' | 'tab3'>('tab1')
  const { tab1Summary, allSuggestedIdeas } = useSession()

  const isTab2Enabled = tab1Summary !== null
  const isTab3Enabled = tab1Summary !== null && allSuggestedIdeas.length > 0

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-100 mb-4">
            Aristotilean<span className="text-blue-400">Chat</span>
          </h1>
          <ExperienceInput />
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('tab1')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'tab1'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Tab 1: Define Experience
            </button>
            <button
              onClick={() => setActiveTab('tab2')}
              disabled={!isTab2Enabled}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'tab2'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : isTab2Enabled
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              Tab 2: Generate Ideas
            </button>
            <button
              onClick={() => setActiveTab('tab3')}
              disabled={!isTab3Enabled}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'tab3'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : isTab3Enabled
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              Tab 3: Challenge Biases
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'tab1' && <Tab1DefineExperience />}
        {activeTab === 'tab2' && <Tab2GenerateIdeas />}
        {activeTab === 'tab3' && <Tab3ChallengeBiases />}
      </main>
    </div>
  )
}

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  )
}

export default App
