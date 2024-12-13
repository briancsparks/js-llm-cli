
import { systemPrompt } from './src/prompts/system.js'
import { callClaude } from './src/claudeClient.js'
import { logJson } from './src/utils.js'
import { handleToolUses } from './src/tools/call.js';
import myTools from './src/tools/index.js';
import { loadMcpServers, closeClient } from './src/mcp/index.js';
import { initLogger } from "./src/logger.js";

import { ANTHROPIC_API_KEY } from './src/consts.js';

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required - set in environment or .env file')
}

const logger = initLogger({
  minLevel: "DEBUG",
  prettyPrint: true
});

const tools = {
  ...myTools,
  ...await loadMcpServers()
};

// main!
async function main() {

  try {
    const messages = [{
      role: 'user',
      content: 'What time is it on the server?'
    }]

    logger.debug('Chat', {system:systemPrompt, messages, tools});
    const response = await callClaude(messages, tools, systemPrompt)
    logger.debug('Claude response', response.content);

    if (response.stop_reason === 'tool_use') {
      const toolResponse = handleToolUses(response.content)
      logger.debug('Tool response', toolResponse)

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
      logger.debug('Final response', finalResponse.content);
    }
  } catch (error) {
    logger.error('Error:', error)
  }

  logger.info('Done!');
  await closeClient();
}

main()

