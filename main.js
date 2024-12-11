import { load } from 'https://deno.land/std/dotenv/mod.ts'
import { systemPrompt, tools } from './src/prompts/system.js'
import { callClaude } from './src/claudeClient.js'
import { logJson } from './src/utils.js'

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

function handleToolUses(content) {
  const toolResults = []

  for (const item of content) {
    if (item.type === 'tool_use') {
      const func = toolFunctions[item.name]
      if (!func) {
        throw new Error(`Unknown tool: ${item.name}`)
      }

      const result = func()
      toolResults.push({
        type: 'tool_result',
        tool_use_id: item.id,
        content: result
      })
    }
  }

  if (toolResults.length > 0) {
    return {
      role: 'user',
      content: toolResults
    }
  }

  return null
}

// Example usage
async function main() {
  try {
    const messages = [{
      role: 'user',
      content: 'What time is it on the server?'
    }]

    logJson('Chat', {system:systemPrompt, messages});
    const response = await callClaude(ANTHROPIC_API_KEY, messages, tools, systemPrompt)
    logJson('Claude response', response.content);

    if (response.stop_reason === 'tool_use') {
      const toolResponse = handleToolUses(response.content)
      logJson('Tool response', toolResponse)

      const finalResponse = await callClaude(ANTHROPIC_API_KEY,
        [...messages,
         {
           role: 'assistant',
           content: response.content  // Include the complete content array
         },
         toolResponse
        ],
        tools,
        systemPrompt
      )
      logJson('Final response', finalResponse.content);
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
