import { logJson } from './utils.js'

export async function callClaude(apiKey, messages, tools = [], systemPrompt) {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  }

  const body = {
    model: 'claude-3-sonnet-20240229',
    messages: messages,
    system: systemPrompt.content,
    tools,
    max_tokens: 1024
  }

  logJson('Request Headers', headers)
  logJson('Request Body', body)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  const responseData = await response.json()

  if (!response.ok) {
    logJson('Error Response', responseData)
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }

  return responseData
}