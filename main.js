import { load } from 'https://deno.land/std/dotenv/mod.ts'
import { systemPrompt, tools } from './prompts/system.js'
import { callClaude } from './claudeClient.js'
import { logJson } from './utils.js'

// Load and merge environment variables
const envFromFile = await load()
const env = {
  ...envFromFile,
  ...Deno.env.toObject()  // system env takes precedence
}

const ANTHROPIC_API_KEY = env['ANTHROPIC_API_KEY']
if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required - set in environment or .env file')
}

// Tool implementations
const toolFunctions = {
  getCurrentTime: () => new Date().toISOString()
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

    const response = await callClaude(ANTHROPIC_API_KEY, messages, tools, systemPrompt)
    logJson('Claude response', response)

    if (response.tool_calls?.length) {
      const toolResults = await handleToolCalls(response.tool_calls)
      logJson('Tool results', toolResults)
      
      const finalResponse = await callClaude(ANTHROPIC_API_KEY, [...messages, ...toolResults], tools, systemPrompt)
      logJson('Final response', finalResponse)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

main()