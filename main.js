
// import { systemPrompt } from './src/prompts/system.js'
import { callClaude } from './src/claudeClient.js'
import {handleToolUses, loadTools} from './src/tools/call.js';
import { closeClient } from './src/mcp/index.js';
import { initLogger, bark } from "./src/logger.js";
import { sleep } from "./src/utils.js";
import {Input} from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";

import { ANTHROPIC_API_KEY } from './src/consts.js';
import {parseMarkdownFile} from "./src/read-markdown-file.js";

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required - set in environment or .env file')
}

const logger = initLogger({
  minLevel: "INFO",
  prettyPrint: true
});

// main!
async function main() {

  // Get user prompt

  // TODO: Load system prompt
  const systemPromptPath = './src/prompts/create-cpp-project.md';
  const mdFileContent = await parseMarkdownFile(systemPromptPath);
  const systemPrompt = mdFileContent.content;
  console.log("System prompt:", systemPrompt);

  const userInput = await Input.prompt({
    message: "What would you like to do?",
    default: "Generate a C++ project skeleton for: vector-math",
    // content: 'What time is it on the server?'
    // content: 'Generate a C++ project skeleton for: vector-math'
    // content: 'Write a README.md file about Dracula meeting with the CEO of a startup.'
  });
  logger.info("User input:", {userInput});

  // For now, just hard-code one prompt from the user.
  let messages = [{
    role: 'user',
    content: userInput,
    // content: 'What time is it on the server?'
    // content: 'Generate a C++ project skeleton for: vector-math'
    // content: 'Write a README.md file about Dracula meeting with the CEO of a startup.'
  }];

  try {
    // Load tools
    const tools = await loadTools();

    await bark({systemPrompt});

    let more = true;
    for (let i = 0; more && i < 1; i++) {
      // TODO: Prompt the user

      for (const message of messages) {
        await bark({message});
      }

      for (let j = 0; j < 50; j++) {
        // TODO: Handle error - they may be retryable, like server overload.
        let sleepTime = 500;
        let llmResponse = null;
        while (true) {
          llmResponse = await callClaude(systemPrompt, messages, tools);
          await bark({llmResponse});
          if (llmResponse.type === 'error' && llmResponse.error) {
            if (llmResponse.error.type === 'rate_limit_error') {
              sleepTime *= 2;
              await sleep(sleepTime);
            }
            continue;
          }
          break;
        }

        messages = [...messages, {role: 'assistant', content: llmResponse.content}];

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

