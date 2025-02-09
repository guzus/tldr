interface SettingsProps {
    apiKey: string
    setApiKey: (key: string) => void
    elevenLabsKey: string
    setElevenLabsKey: (key: string) => void
    language: string
    setLanguage: (lang: string) => void
    saveSettings: () => void
  }
  
  export function Settings({
    apiKey,
    setApiKey,
    elevenLabsKey,
    setElevenLabsKey,
    language,
    setLanguage,
    saveSettings,
  }: SettingsProps) {
    return (
      <div className="settings-section">
        <label>
          OpenAI API Key:
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={{ width: '100%', maxWidth: '300px', boxSizing: 'border-box' }}
          />
        </label>
  
        <label>
          ElevenLabs API Key:
          <input
            type="text"
            value={elevenLabsKey}
            onChange={(e) => setElevenLabsKey(e.target.value)}
            placeholder="sk_..."
            style={{ width: '100%', maxWidth: '300px', boxSizing: 'border-box' }}
          />
        </label>
  
        <label>
          Language:
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
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
  
        <button onClick={saveSettings} style={{ backgroundColor: 'black', color: 'white' }}>
          Save Settings
        </button>
      </div>
    )
  }