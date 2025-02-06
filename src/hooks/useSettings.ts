import { useState, useEffect } from 'react'

export interface Settings {
  apiKey: string
  elevenLabsKey: string
  language: string
  summary: string
}

export function useSettings() {
  const [apiKey, setApiKey] = useState('')
  const [elevenLabsKey, setElevenLabsKey] = useState('')
  const [language, setLanguage] = useState('English')
  const [summary, setSummary] = useState('')

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(
        ['openaiApiKey', 'elevenLabsApiKey', 'selectedLanguage', 'summary'],
        (result) => {
          if (result.openaiApiKey) setApiKey(result.openaiApiKey)
          if (result.elevenLabsApiKey) setElevenLabsKey(result.elevenLabsApiKey)
          if (result.selectedLanguage) setLanguage(result.selectedLanguage)
          if (result.summary) setSummary(result.summary)
        }
      )
    }
  }, [])

  const saveSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set(
        {
          openaiApiKey: apiKey,
          elevenLabsApiKey: elevenLabsKey,
          selectedLanguage: language,
        },
        () => {
          alert('Settings saved successfully!')
        }
      )
    } else {
      alert('Settings can only be saved when running as a Chrome extension')
    }
  }

  return {
    apiKey,
    setApiKey,
    elevenLabsKey,
    setElevenLabsKey,
    language,
    setLanguage,
    summary,
    setSummary,
    saveSettings,
  }
}