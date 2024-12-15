
import { systemPrompt } from './src/prompts/system.js'
import { callClaude } from './src/claudeClient.js'
import {handleToolUses, loadTools} from './src/tools/call.js';
// import loadTools from './src/tools/index.js';
import { loadMcpServers, closeClient } from './src/mcp/index.js';
import { initLogger, bark } from "./src/logger.js";

import { ANTHROPIC_API_KEY } from './src/consts.js';

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required - set in environment or .env file')
}

const logger = initLogger({
  minLevel: "INFO",
  prettyPrint: true
});

// // TODO: MCP servers will be loaded with tools, and maanaged there
// const tools = {
//   ...myTools,
//   ...await loadMcpServers()
// };

// main!
async function main() {

  // TODO: Load system prompt

  // Load tools
  const tools = await loadTools();

  try {
    // For now, just hard-code one prompt from the user.
    let messages = [{
      role: 'user',
      // content: 'What time is it on the server?'
      content: 'Generate a C++ project skeleton for: vector-math'
    }];

    bark({systemPrompt});

    let more = true;
    for (let i = 0; more && i < 1; i++) {
      // TODO: Prompt the user

      for (const message of messages) {
        bark({message});
      }

      for (let j = 0; j < 5; j++) {
        const llmResponse = await callClaude(systemPrompt, messages, tools);
        messages = [...messages, {role: 'assistant', content: llmResponse.content}];
        bark({llmResponse});

        // TODO: Handle tools - call for each toolrequest, returns list of tool responses
        const toolResponse = await handleToolUses(llmResponse);
        if (toolResponse) {
          bark({toolResponse});
          messages = [...messages, toolResponse];   // TODO: should be ...toolResponse?
          continue;
        }

        // No need to go back around
        break;
      }
    }
  } catch (error) {
    logger.error('Error:', error)
  }

  logger.info('Done!');
  await closeClient();
}

main()

