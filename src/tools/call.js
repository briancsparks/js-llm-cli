import tools from "./index.js";


export function handleToolUses(content) {
  const toolResults = []

  for (const item of content) {
    if (item.type === 'tool_use') {
      const tool = tools[item.name]
      if (!tool) {
        throw new Error(`Unknown tool: ${item.name}`)
      }

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
