export async function summarizeText(apiKey: string, text: string, language: string) {
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