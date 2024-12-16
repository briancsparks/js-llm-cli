import { ANTHROPIC_VERSION, ANTHROPIC_API_KEY, model } from './consts.js';
import { Input, Select, Confirm } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";
import { getLogger } from "./logger.js";

let logger = null;

// TODO: Switch to the SDK client: https://github.com/anthropics/anthropic-sdk-typescript
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

  // TODO: Report token usage

  console.log(`\n=====================================================================`);
  const requestBody = JSON.stringify(body);
  console.log(`Fetching: 'https://api.anthropic.com/v1/messages': Size: ${requestBody.length} bytes`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: requestBody
  });

  const responseData = await response.json();     /* TODO: Rename to llmResponse */

  logger.info('tokens', {usage: responseData.usage});
  console.log(reportLimits(response));

  if (!response.ok) {
    const [retryable, message, {retry_after, date, status}] = isRetryable({response, responseData})
    if (retryable) {
      logger.info(`Error: ${message}`, {retry_after, date, status});
      const retry = await Confirm.prompt("Retry?");
      if (retry) {
        return responseData;      /* TODO return {response, responseData} */
      }
    }

    // TODO: Determine the error. may be retryable. prompt user to try again or abort.
    logger.error('Error Response', {response, responseData});
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  logger.debug('callClaude() <- response', {response: responseData});
  return responseData;      /* TODO return {response, responseData} */
}

function reportLimits(response) {
  let results = "";
  const input_limit = response.headers.get("anthropic-ratelimit-input-tokens-limit");
  const input_remaining = response.headers.get("anthropic-ratelimit-input-tokens-remaining");
  const output_limit = response.headers.get("anthropic-ratelimit-output-tokens-limit");
  const output_remaining = response.headers.get("anthropic-ratelimit-output-tokens-remaining");
  const requests_limit = response.headers.get("anthropic-ratelimit-requests-limit");
  const requests_remaining = response.headers.get("anthropic-ratelimit-requests-remaining");
  const tokens_limit = response.headers.get("anthropic-ratelimit-tokens-limit");
  const tokens_remaining = response.headers.get("anthropic-ratelimit-tokens-remaining");

  results += `Input Tokens: ${input_limit}/${input_remaining} (${input_limit - input_remaining})\n`;
  results += `Output Tokens: ${output_limit}/${output_remaining} (${output_limit - output_remaining})\n`;
  results += `Requests: ${requests_limit}/${requests_remaining} (${requests_limit - requests_remaining})\n`;
  results += `Tokens: ${tokens_limit}/${tokens_remaining} (${tokens_limit - tokens_remaining})\n`;

  return results;
}

function isRetryable({response, responseData}) {
  let retryable = false;
  let message = "";

  const should_retry = response.headers.get("x-should-retry") === "true";
  const retry_after = response.headers.get("retry-after");
  const date = new Date(response.headers.get("date"));
  const status = response.status;

  if (should_retry) {
    retryable = true;
    // message = `Retry after ${retry_after} seconds`;
    // message = `Retry after ${date.getTime() + retry_after * 1000 - Date.now()} milliseconds`;
    message = response.statusText || responseData.error.message;
  }

  return [retryable, message, {retry_after, date, status}];
}

/*
  Errors i have seen from Claude:

  TODO: Bark this
  [2024-12-15T08:32:05.856Z] ERROR : Error Response
  {
    response: Response {
      body: ReadableStream { locked: true },
      bodyUsed: true,
      headers: Headers {
        "anthropic-ratelimit-input-tokens-limit": "40000",
        "anthropic-ratelimit-input-tokens-remaining": "0",
        "anthropic-ratelimit-input-tokens-reset": "2024-12-15T08:33:08Z",
        "anthropic-ratelimit-output-tokens-limit": "8000",
        "anthropic-ratelimit-output-tokens-remaining": "8000",
        "anthropic-ratelimit-output-tokens-reset": "2024-12-15T08:32:05Z",
        "anthropic-ratelimit-requests-limit": "50",
        "anthropic-ratelimit-requests-remaining": "50",
        "anthropic-ratelimit-requests-reset": "2024-12-15T08:32:05Z",
        "anthropic-ratelimit-tokens-limit": "48000",
        "anthropic-ratelimit-tokens-remaining": "8000",
        "anthropic-ratelimit-tokens-reset": "2024-12-15T08:32:05Z",
        "cf-cache-status": "DYNAMIC",
        "cf-ray": "8f2514c42e4c7bb0-LAX",
        "content-length": "478",
        "content-type": "application/json",
        "request-id": "req_01DUfVgUJft3msGJsLNnVb5p",
        "retry-after": "24",
        "x-robots-tag": "none",
        "x-should-retry": "true",
        date: "Sun, 15 Dec 2024 08:32:05 GMT",
        server: "cloudflare",
        via: "1.1 google"
      },
      ok: false,
      redirected: false,
      status: 429,
      statusText: "Too Many Requests",
      url: "https://api.anthropic.com/v1/messages"
    },
    responseData: {
      error: {
        message: "This request would exceed your organization’s rate limit of 40,000 input tokens per minute. For details, refer to: https://docs.anthropic.com/en/api/rate-limits; see the response headers for current usage. Please reduce the prompt length or the maximum tokens requested, or try again later. You may also contact sales at https://www.anthropic.com/contact-sales to discuss your options for a rate limit increase.",
        type: "rate_limit_error"
      },
      type: "error"
    }
  }

 --------

  [2024-12-15T09:21:42.855Z] ERROR : Error Response
  {
    response: Response {
      body: ReadableStream { locked: true },
      bodyUsed: true,
      headers: Headers {
        "cache-control": "no-store, no-cache",
        "cf-cache-status": "DYNAMIC",
        "cf-ray": "8f255d3138715220-LAX",
        "content-length": "75",
        "content-type": "application/json",
        "request-id": "req_01GEv5TeLC32iswMGkKPjk23",
        "x-robots-tag": "none",
        "x-should-retry": "true",
        date: "Sun, 15 Dec 2024 09:21:42 GMT",
        server: "cloudflare",
        via: "1.1 google"
      },
      ok: false,
      redirected: false,
      status: 529,
      statusText: "",
      url: "https://api.anthropic.com/v1/messages"
    },
    responseData: {
      error: { message: "Overloaded", type: "overloaded_error" },
      type: "error"
    }
  }

 */
