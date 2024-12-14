import tools from "./index.js";


export function handleToolUses(response) {
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

      // TODO: `item` is one of the invocation requests. It must have the args. Compare them against `tool.input_schema`
      // TODO: Pass the item's args to `tool.run()`
      const toolResult = tool.run()
      toolResults.push({
        type: 'tool_result',
        tool_use_id: item.id,
        content: toolResult
      })
    }
  }

  if (toolResults.length > 0) {
    return {
      role: 'user',
      content: toolResults
    }
  }

  return null
}
