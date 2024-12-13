
import { Client } from 'npm:@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from 'npm:@modelcontextprotocol/sdk/client/stdio.js';
import { getLogger } from "../logger.js";

let client = null;    // Must close when done
let logger = null;

export async function closeClient() {
  logger = getLogger();
  if (client) {
    await client.close();
    client = null;
  }
}

export async function loadMcpServers() {
  logger = getLogger();

  let command = 'npx';
  let args = ["-y", "@modelcontextprotocol/server-filesystem", "/Users/brian/dev/claude-scratch"];

  console.log(`Launching server with: ${command} ${args.join(' ')}`);


  // Create transport
  const transport = new StdioClientTransport({
    command,
    args,
    env: Deno.env.toObject()
  });

  // Initialize client
  client = new Client(
    {
      name: 'js-llm',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Connect and initialize
  await client.connect(transport);
  console.log('Connected to server');

  const caps = client.getServerCapabilities();
  const version = client.getServerVersion();
  logger.info('caps and version:', { caps, version});

  const toolsResponse = await client.listTools()
  logger.info('Raw tools response:', toolsResponse);

  let tools = {};
  for (const tool of toolsResponse.tools) {
    const {inputSchema, ...rest} = tool;
    tools[tool.name] = {...rest, input_schema: inputSchema};
  }
  return tools;
}
