import { load } from 'https://deno.land/std/dotenv/mod.ts'
import { systemPrompt, tools } from './prompts/system.js'

// Load environment variables
const env = await load()
const ANTHROPIC_API_KEY = env['ANTHROPIC_API_KEY']

// Tool implementations
const toolFunctions = {
  getCurrentTime: () => new Date().toISOString()
}

async function callClaude(messages, tools = []) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      messages: [systemPrompt, ...messages],
      tools,
      max_tokens: 1024
    })
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

async function handleToolCalls(toolCalls) {
  return toolCalls.map(call => {
    const func = toolFunctions[call.function.name]
    if (!func) {
      throw new Error(`Unknown tool: ${call.function.name}`)
    }
    return {
      role: 'tool',
      content: JSON.stringify(func()),
      tool_call_id: call.id
    }
  })
}

// Example usage
async function main() {
  try {
    const messages = [{
      role: 'user',
      content: 'What time is it on the server?'
    }]

    const response = await callClaude(messages, tools)
    console.log('Claude response:', response)

    if (response.tool_calls?.length) {
      const toolResults = await handleToolCalls(response.tool_calls)
      const finalResponse = await callClaude([...messages, ...toolResults])
      console.log('Final response:', finalResponse)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

main()