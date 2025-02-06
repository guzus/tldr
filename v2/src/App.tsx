import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [elevenLabsKey, setElevenLabsKey] = useState('')
  const [summary, setSummary] = useState('')
  const [language, setLanguage] = useState('English')
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if running in Chrome extension environment
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      // Load saved settings
      chrome.storage.local.get(['openaiApiKey', 'elevenLabsApiKey', 'selectedLanguage', 'summary'], (result) => {
        if (result.openaiApiKey) setApiKey(result.openaiApiKey)
        if (result.elevenLabsApiKey) setElevenLabsKey(result.elevenLabsApiKey)
        if (result.selectedLanguage) setLanguage(result.selectedLanguage)
        if (result.summary) setSummary(result.summary)
      })
    }
  }, [])

  const saveSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({
        openaiApiKey: apiKey,
        elevenLabsApiKey: elevenLabsKey,
        selectedLanguage: language
      }, () => {
        alert('Settings saved successfully!')
      })
    } else {
      alert('Settings can only be saved when running as a Chrome extension')
    }
  }

  const summarizeText = async (text: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-mini',
          messages: [{ role: 'user', content: `Summarize this in ${language}: ${text}` }]
        })
      })

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      throw new Error(`Failed to summarize: ${error}`)
    }
  }

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
          const summary = await summarizeText(results[0].result)
          setSummary(summary)
          chrome.storage.local.set({ summary })
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

      <button 
        onClick={handleSummarize}
        disabled={isLoading}
      >
        <span>{isLoading ? 'Summarizing...' : 'Summarize Page'}</span>
      </button>

      <textarea
        value={summary}
        readOnly
        placeholder="Summary will appear here..."
      />

      <button onClick={() => setShowSettings(!showSettings)}>
        👷 Settings
      </button>

      {showSettings && (
        <div className="settings-section">
          <label>
            OpenAI API Key:
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </label>

          <label>
            ElevenLabs API Key:
            <input
              type="text"
              value={elevenLabsKey}
              onChange={(e) => setElevenLabsKey(e.target.value)}
              placeholder="sk_..."
            />
          </label>

          <label>
            Language:
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">🇬🇧 English</option>
              <option value="Spanish">🇪🇸 Spanish</option>
              <option value="French">🇫🇷 French</option>
              <option value="German">🇩🇪 German</option>
              <option value="Chinese">🇨🇳 Chinese</option>
              <option value="Japanese">🇯🇵 Japanese</option>
              <option value="Korean">🇰🇷 Korean</option>
              <option value="Italian">🇮🇹 Italian</option>
              <option value="Portuguese">🇵🇹 Portuguese</option>
              <option value="Russian">🇷🇺 Russian</option>
            </select>
          </label>

          <button onClick={saveSettings}>Save Settings</button>
        </div>
      )}
    </div>
  )
}

export default App
