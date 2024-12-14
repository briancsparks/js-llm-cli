import { ANTHROPIC_VERSION, ANTHROPIC_API_KEY, model } from './consts.js';
import { getLogger } from "./logger.js";
import {systemPrompt} from "./prompts/system.js";

let logger = null;

export async function callClaude(systemPrompt, messages, tools = [] ) {
  logger = getLogger();
  logger.debug('callClaude() -> request', {systemPrompt, tools, messages});

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
    logger.error('Error Response', responseData)
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }

  logger.debug('callClaude() <- response', {response: responseData});
  return responseData
}
