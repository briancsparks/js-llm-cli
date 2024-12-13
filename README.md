# Claude Deno Project

A simple Deno project that interacts with Claude 3.5 Sonnet API, demonstrating system prompts and tool usage.

## Setup

1. Copy `.env.example` to `.env`
2. Add your Anthropic API key to `.env`
3. Run the project:
   ```bash
   deno run --allow-net --allow-env --allow-read --allow-run main.js
   ```

## Project Structure

- `main.js`: Main application file with API interaction
- `prompts/system.js`: System prompt definition
- `.env`: Configuration (not tracked in git)
