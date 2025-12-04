import { useState } from 'react'
import { useSession } from '../context/useSession'
import { formatSessionForExport, downloadJSON, copyToClipboard, generateExportFilename } from '../utils/exportUtils'

export function ExportButton() {
  const {
    experience,
    tab1History,
    tab1Summary,
    myIdeas,
    allSuggestedIdeas,
    tab3ChallengingIdeas,
    biases,
    biasDecisions,
    biasUserIdeas,
  } = useSession()

  const [isExporting, setIsExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const hasDataToExport =
    experience.trim() !== '' ||
    tab1History.length > 0 ||
    tab1Summary !== null ||
    myIdeas.length > 0 ||
    allSuggestedIdeas.length > 0 ||
    (biases && biases.length > 0)

  const handleExport = async (action: 'download' | 'copy') => {
    if (!hasDataToExport) {
      alert('No data to export')
      return
    }

    setIsExporting(true)
    try {
      const exportData = formatSessionForExport({
        experience,
        tab1History,
        tab1Summary,
        myIdeas,
        allSuggestedIdeas,
        tab3ChallengingIdeas,
        biases,
        biasDecisions,
        biasUserIdeas,
      })

      const jsonString = JSON.stringify(exportData, null, 2)

      if (action === 'download') {
        const filename = generateExportFilename(experience)
        downloadJSON(jsonString, filename)
      } else {
        await copyToClipboard(jsonString)
        alert('Copied to clipboard!')
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export. Please try again.')
    } finally {
      setIsExporting(false)
      setShowMenu(false)
    }
  }

  if (!hasDataToExport) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        aria-label="Export session"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="text-sm">Export</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
            <button
              onClick={() => handleExport('download')}
              disabled={isExporting}
              className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {isExporting ? 'Exporting...' : 'Download JSON'}
            </button>
            <button
              onClick={() => handleExport('copy')}
              disabled={isExporting}
              className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition flex items-center gap-2 disabled:opacity-50 border-t border-gray-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {isExporting ? 'Copying...' : 'Copy to Clipboard'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

