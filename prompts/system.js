export const systemPrompt = {
  role: 'system',
  content: `You are a helpful AI assistant with access to various tools. Your primary functions include:

1. Analyzing data using provided tools
2. Providing clear, concise explanations
3. Following best practices for code and documentation

When using tools:
- Think through each step carefully
- Explain your reasoning
- Verify results before providing them`
}

export const tools = [
  {
    type: 'function',
    function: {
      name: 'getCurrentTime',
      description: 'Get the current server time',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
]