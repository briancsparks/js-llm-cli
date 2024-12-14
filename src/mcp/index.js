
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

// TODO: Each that is returned from this needs to have a run() function
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

  const caps = client.getServerCapabilities();
  const version = client.getServerVersion();
  logger.info(`Connected to server: ${version.name} ${version.version}`);
  // logger.info('caps and version:', { caps, version});

  const toolsResponse = await client.listTools();
  // logger.info('Raw tools response:', toolsResponse);

  let toolNames = [];
  let tools = {};
  for (const mcpTool of toolsResponse.tools) {
    // Rename schema
    const {inputSchema, ...rest} = mcpTool;
    let tool = {...rest, input_schema: inputSchema};    // TODO: || <some-default-schema?>

    // TODO: `tool` needs a `run()` function that takes args
    tool.run = async (args) => {
      // TODO: use `client` to invoke tool
      // const toolResponse = await client.
      // log it?
      // return toolResponse;
    }

    // Put the tool in the list
    toolNames.push(tool.name);
    tools[tool.name] = tool;
  }
  // logger.info('Loaded tools:', toolNames);
  logger.info(`Loaded tools: ${toolNames.join(', ')}`);
  return tools;
}
