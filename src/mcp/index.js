
import { Client } from 'npm:@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from 'npm:@modelcontextprotocol/sdk/client/stdio.js';
import {logJson} from "../utils.js";
// import { ListResourcesResultSchema, ListToolsResultSchema } from "npm:@modelcontextprotocol/sdk/types.js";

let client = null;    // Must close when done

export async function closeClient() {
  if (client) {
    await client.close();
    client = null;
  }
}

export async function loadMcpServers() {
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
      name: 'js-mcp-client',
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

  logJson('caps and version:', { caps, version});
  const toolsResponse = await client.listTools()

  logJson('Raw tools response:', toolsResponse);

  let tools = {};
  for (const tool of toolsResponse.tools) {
    const {inputSchema, ...rest} = tool;
    // tool.input_schema = tool.inputSchema;
    tools[tool.name] = {...rest, input_schema: inputSchema};
  }
  return tools;
}
