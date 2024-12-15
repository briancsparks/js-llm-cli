import { ANTHROPIC_VERSION, ANTHROPIC_API_KEY, model } from './consts.js';
import { getLogger } from "./logger.js";

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
    // TODO: Determine the error. may be retryable. prompt user to try again or abort.
    logger.error('Error Response', {response, responseData});
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  logger.debug('callClaude() <- response', {response: responseData});
  return responseData;
}

/*
 Errors i have seen from Claude:

  responseData: {
    error: { message: "Overloaded", type: "overloaded_error" },
    type: "error"
  },
  response: {
    ok: false,
    status: 529,
    statusText: a-stack-trace
  }

 */
