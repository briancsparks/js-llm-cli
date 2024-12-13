# JS-LLM To Do

## Now

- MCP tool calling works for filesystem
- ~~tool calling~~
  - ~~call tool, report back to LLM~~
- create C++ project prompt

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
