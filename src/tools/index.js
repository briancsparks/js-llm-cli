// src/tools/index.js
import {loadMcpServers} from '../mcp/index.js';

const getCurrentTime = {
  name: 'getCurrentTime',
  description: 'Get the current server time',
  input_schema: {
    type: 'object',
    properties: {},
    required: []
  },
  run: async () => {return new Date().toISOString()}
}

export default {
  getCurrentTime
}

export async function loadTools() {
  return {
    getCurrentTime,
    ...await loadMcpServers()
  };
}
