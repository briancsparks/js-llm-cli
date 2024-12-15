
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
  const config = JSON.parse(await Deno.readTextFile("./deno.json"));
  const { name, version /*, description*/ } = config;

  let command = 'npx';
  let args = ["-y", "@modelcontextprotocol/server-filesystem", "/Users/brian/dev/claude-scratch/tmp"];

  console.log(`Launching server with: ${command} ${args.join(' ')}`);


  // Create transport
  const transport = new StdioClientTransport({
    command,
    args,
    env: Deno.env.toObject()
  });

  // Initialize client
  client = new Client({name, version}, {capabilities: {tools: {}}});

  // Connect and initialize
  await client.connect(transport);

  const serverVersion = client.getServerVersion();
  logger.info(`Connected to server: ${serverVersion.name} ${serverVersion.version}`);
  // const serverCapabilities = client.getServerCapabilities();
  // logger.info('caps and version:', { serverCapabilities, serverVersion});

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

      const toolResponse = await client.callTool({name: tool.name, ...args}/*, args*/);
      // const toolResponse = {};
      // log it?
      return toolResponse;
    }

    // Put the tool in the list
    toolNames.push(tool.name);
    tools[tool.name] = tool;
  }

  logger.info(`Loaded tools: ${toolNames.join(', ')}`);
  // logger.info(`Loaded tools: ${toolNames.join(', ')}`, tools);
  return tools;
}
