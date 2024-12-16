# JS-LLM To Do

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
      - ~~Run the tool, get its response~~
      - ~~Parse the tool's result and add it to messages~~
        - `{type: "tool_result", tool_use_id: "toolu_abc", content: "<the tool's result>"}`
        - `role: "user"`
      - ~~Potentially parse and run more tools~~
      - ~~When all tool calls have run (and all their results are put into messages)...~~
        - ~~Go back to the top of the loop, but skip asking the user for input~~
        - ~~Send messages (which have the tool call responses at the end) to LLM~~
  - When ending:
    - `{stop_reason: "end_turn", type: "message", usage: {input_tokens: 999, output_tokens: 42}}`
- Don't re-add the system prompt; the tools, etc. on subsequent iterations

## Misc

- Convert js-mcp-client to Deno, or cvt when porting here
  - Finish link to server
    - set the 'force this tool' entry on request, maybe
- Use cpp-project-creator
  - send any problems back to the LLM
    - build errors
    - (lint errors?)
    - test run errors
  - commit into git

- Make mo-betta
  - Auto JSON schema from examples
    - Auto adding to examples on validation failure

- MD/front-matter reader
  - Convert to Deno.
  - ~~Remove pretty rendering MD to terminal - causes Deno not to work - Can send to external exe to pprint~~


- ids on user messages

## Improvements

### My Own Filesystem Tool

- Use `mkdir -p`
  - Dont even require the mkdir, if supplying the file content.
- Allow to generate many files at once
- Allow search and replace within a file
  - so, could just clone a repo, and then rename files for that project
  - would require to rename classes and such

### Change Dir Layout

- Not Everything in Repo Root
- headers next to impl
- Kill `#pragma once`

### Other

- Point it to a dir of a real project
  -It will template-ify the repo, so it can be used as seed.

### Better Project

Need a project to be the hello, world program for this - the thing you always start with
to just get up and running. Simple, but not too simple - gets other stuff setup.

Built in deps:

- FetchContent-based
  - Catch2
  - CLI11
  - nlohmann/json
  - spdlog
  - fmt
  - cpp-httplib
  - trompeloeil
  - date (Howard Hinnant's date library)
  - stduuid
  - toml++
  - filesystem_hpp
  - string-view-lite
  - CTRE (Compile Time Regular Expressions)
  - memory_resource_module
  - indicators
  - range-v3
More seed-level items:

- Layer Cake
  - CMake
  - Automated testing (unit, integration, system)
    - ~~gtest~~
    - ~~Catch2~~
    - Jest
  - CI/CD pipeline
  - Dependency management
  - Auto-generated documentation with validation
  - Daily builds with monitoring (dont just build every day, report when things sour)
  - Monkey testing and fuzzing
  - Sanitizers (ASan, etc.)
  - Profiling
  - Comprehensive linting
  - Multiple build configurations (Debug, Release, RelWithDebug, RelMinSize)
- JSON
  - Need usage of JSON to be trivial

Eventually

- JS engine






