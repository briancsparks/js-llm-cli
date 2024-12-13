// src/tools/index.js

const getCurrentTime = {
  name: 'getCurrentTime',
  description: 'Get the current server time',
  input_schema: {
    type: 'object',
    properties: {},
    required: []
  },
  run: () => {return new Date().toISOString()}
}

export default {
  getCurrentTime
}
