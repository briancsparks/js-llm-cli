// import tools from "./index.js";
import {loadTools as loadToolsFromTools} from './index.js';

let tools = null;

export async function loadTools() {
  return tools || (tools = await loadToolsFromTools());
}

export async function handleToolUses(response) {
  tools || (tools = await loadToolsFromTools());

  if (response.stop_reason !== 'tool_use') {
    return null;
  }

  const content = response.content;
  const toolResults = []

  for (const item of content) {
    if (item.type === 'tool_use') {
      const tool = tools[item.name]
      if (!tool) {
        throw new Error(`Unknown tool: ${item.name}`)
      }

      const toolResult = await tool.run(item.input);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: item.id,
        content: toolResult.content
      })
    }
  }

  if (toolResults.length > 0) {
    return {
      role: 'user',
      content: toolResults
    }
  }

  return null;
}
