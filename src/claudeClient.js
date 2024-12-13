import { logJson } from './utils.js'
import { ANTHROPIC_VERSION, ANTHROPIC_API_KEY, model } from './consts.js';

export async function callClaude(messages, tools = [], systemPrompt) {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': ANTHROPIC_VERSION
  }

  const body = {
    model,
    system: systemPrompt,
    tools: Object.values(tools),
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
