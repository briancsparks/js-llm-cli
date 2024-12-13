
import { systemPrompt } from './src/prompts/system.js'
import { callClaude } from './src/claudeClient.js'
import { logJson } from './src/utils.js'
import { handleToolUses } from './src/tools/call.js';
import tools from './src/tools/index.js';

import { ANTHROPIC_API_KEY } from './src/consts.js';

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required - set in environment or .env file')
}

// main!
async function main() {
  try {
    const messages = [{
      role: 'user',
      content: 'What time is it on the server?'
    }]

    logJson('Chat', {system:systemPrompt, messages, tools});
    const response = await callClaude(messages, tools, systemPrompt)
    logJson('Claude response', response.content);

    if (response.stop_reason === 'tool_use') {
      const toolResponse = handleToolUses(response.content)
      logJson('Tool response', toolResponse)

      const finalResponse = await callClaude([
         ...messages,
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
