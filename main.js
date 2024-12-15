
import { systemPrompt } from './src/prompts/system.js'
import { callClaude } from './src/claudeClient.js'
import {handleToolUses, loadTools} from './src/tools/call.js';
import { closeClient } from './src/mcp/index.js';
import { initLogger, bark } from "./src/logger.js";

import { ANTHROPIC_API_KEY } from './src/consts.js';

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required - set in environment or .env file')
}

const logger = initLogger({
  minLevel: "INFO",
  prettyPrint: true
});

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

    await bark({systemPrompt});

    let more = true;
    for (let i = 0; more && i < 1; i++) {
      // TODO: Prompt the user

      for (const message of messages) {
        await bark({message});
      }

      for (let j = 0; j < 50; j++) {
        // TODO: Handle error - they may be retryable, like server overload.
        const llmResponse = await callClaude(systemPrompt, messages, tools);
        messages = [...messages, {role: 'assistant', content: llmResponse.content}];
        await bark({llmResponse});

        // Let the tools manager look at the response and handle tool requests. handleToolUses() will determine if tool calls are needed.
        const toolResponse = await handleToolUses(llmResponse);
        if (toolResponse) {
          // Yes, tool calls were made. Stuff the responses into the message list to tell the LLM what happened.
          await bark({toolResponse});
          messages = [...messages, toolResponse];
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

