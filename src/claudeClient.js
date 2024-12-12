import { logJson } from './utils.js'

export async function callClaude(apiKey, messages, tools = [], system) {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  }

  const body = {
    model: 'claude-3-5-sonnet-20241022',
    system,
    tools,
    messages,
    max_tokens: 1024
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  const responseData = await response.json();

  if (!response.ok) {
    logJson('Error Response', responseData)
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }

  return responseData
}
