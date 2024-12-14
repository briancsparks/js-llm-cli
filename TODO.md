# JS-LLM To Do

## Now

- Clean up logging
- MCP tool calling works for filesystem
  - ~~Launch server, get tools list, remember them.~~
  - Detect tool use
    - Call tool
    - Tell response to LLM
    - Re-invoke LLM
- ~~tool calling~~
  - ~~call tool, report back to LLM~~
- create C++ project prompt

## Z Plan

The main loop:
- At the top of the loop is where the user enters their prompt(s).
  - They can enter several - mixed text and image, could be multiple texts inside one object.
  - A loop at the top of the main loop to get the user's input.
- When the user is done entering their prompt, send request to the LLM
  - And get the response from the LLM
    - Streaming, eventually.
  - Parse the response:
    - Assistant's text-based response (chat)
      - Might contain any manner of markdown
        - Code blocks are the notable things you might want to parse out.
      - Done with the main, outer loop - back to the top for the user's next entry in the chat.
    - Might contain tool use request(s)
      - `{type: "tool_use", name: "fnName", input: {}, id: "toolu_abc"}`
      - Run the tool, get its response
      - Parse the tool's result and add it to messages
        - `{type: "tool_result", tool_use_id: "toolu_abc", content: "<the tool's result>"}`
        - `role: "user"`
      - Potentially parse and run more tools
      - When all tool calls have run (and all their results are put into messages)...
        - Go back to the top of the loop, but skip asking the user for input
        - Send messages (which have the tool call responses at the end) to LLM
  - When ending:
    - `{stop_reason: "end_turn", type: "message", usage: {input_tokens: 999, output_tokens: 42}}`
- Don't re-add the system prompt; the tools, etc. on subsequent iterations

## Misc

- Convert js-mcp-client to Deno, or cvt when porting here
  - Finish link to server
    - have done tools/list
    - must do tools/get for them
    - must build tools part of request
    - set the 'force this tool' entry on request, maybe
- Use this repo to call tool.
  - parse and realize tool-call is needed.
  - call through mcp
  - send result back to LLM
- Use cpp-project-creator
  - actually build it
  - send any problems back to the LLM
    - build errors
    - (lint errors?)
    - test run errors
  - commit into git

- Make mo-betta
  - why do i have to tell you what your JSON schema is?
  - Make a way to do docstrings
  - Auto JSON schema from examples
    - Auto adding to examples on validation failure

- MD/front-matter reader
  - Convert to Deno.
  - Remove pretty rendering MD to terminal - causes Deno not to work - Can send to external exe to pprint


- ids on user messages
