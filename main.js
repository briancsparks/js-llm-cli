
import { systemPrompt } from './src/prompts/system.js'
import { callClaude } from './src/claudeClient.js'
import { handleToolUses } from './src/tools/call.js';
import myTools from './src/tools/index.js';
import { loadMcpServers, closeClient } from './src/mcp/index.js';
import { initLogger, bark } from "./src/logger.js";

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
    }];

    bark({systemPrompt});
    for (const message of messages) {
      bark(message);
    }

    const response = await callClaude(systemPrompt, messages, tools);

    if (response.stop_reason === 'tool_use') {
      const toolResponse = handleToolUses(response.content)
      logger.debug('Tool response', toolResponse)

      const finalResponse = await callClaude(systemPrompt,
        [
         ...messages,
         {
           role: 'assistant',
           content: response.content  // Include the complete content array
         },
         toolResponse
        ],
        tools
      )
      logger.debug('Final response', finalResponse);
    }
  } catch (error) {
    logger.error('Error:', error)
  }

  logger.info('Done!');
  await closeClient();
}

main()

