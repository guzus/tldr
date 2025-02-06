import { useState } from 'react'
import './App.css'
import { useSettings } from './hooks/useSettings'
import { Settings } from './components/Settings'
import { summarizeText } from './utils/openai'

function App() {
  const {
    apiKey,
    setApiKey,
    elevenLabsKey,
    setElevenLabsKey,
    language,
    setLanguage,
    summary,
    setSummary,
    saveSettings,
  } = useSettings()
  
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSummarize = () => {
    if (!apiKey) {
      alert('Please enter your OpenAI API key first!')
      return
    }

    setIsLoading(true)
    setSummary('Please wait...')

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id
      if (!tabId) return

      chrome.scripting.executeScript({
        target: { tabId },
        func: () => document.body.innerText
      }, async (results) => {
        if (!results?.[0]?.result) return
        
        try {
          const summaryText = await summarizeText(apiKey, results[0].result, language)
          console.log("summaryText:", summaryText)
          setSummary(summaryText)
          chrome.storage.local.set({ summary: summaryText })
        } catch (error) {
          setSummary(`Error: ${error}`)
        } finally {
          setIsLoading(false)
        }
      })
    })
  }

  return (
    <div className="container">
      <h1>TLDR</h1>

      <button onClick={handleSummarize} disabled={isLoading}>
        <span>{isLoading ? 'Summarizing...' : 'Summarize Page'}</span>
      </button>

      <textarea
        value={summary}
        readOnly
        placeholder="Summary will appear here..."
        style={{ color: '#000' }}
      />

      <button onClick={() => setShowSettings(!showSettings)}>
        👷 Settings
      </button>

      {showSettings && (
        <Settings
          apiKey={apiKey}
          setApiKey={setApiKey}
          elevenLabsKey={elevenLabsKey}
          setElevenLabsKey={setElevenLabsKey}
          language={language}
          setLanguage={setLanguage}
          saveSettings={saveSettings}
        />
      )}
    </div>
  )
}

export default App
