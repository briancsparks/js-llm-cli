import {loadMcpServers} from '../mcp/index.js';
import { ensureDirSync } from "https://deno.land/std@0.218.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.218.0/path/mod.ts";

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

const write_file = {
  name: 'write_file',
  description: 'Write content into a file, auto mkdir -p',
  input_schema: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      content: { type: 'string' }
    },
    required: ['path', 'content']
  },
  run: async ({ path, content }) => {
    ensureDirSync(dirname(path));
    await Deno.writeTextFile(path, content);
    return `File written to ${path}`;
  }
}

const append_to_file = {
  name: 'append_to_file',
  description: 'Append content to the end of a file, auto mkdir -p',
  input_schema: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      content: { type: 'string' }
    },
    required: ['path', 'content']
  },
  run: async ({ path, content }) => {
    ensureDirSync(dirname(path));
    await Deno.writeTextFile(path, content, { append: true });
    return `Content appended to ${path}`;
  }
}

const insert_into_class = {
  name: 'insert_into_class',
  description: 'Insert content into a class definition in a header file',
  input_schema: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      content: { type: 'string' },
      class_name: { type: 'string' }
    },
    required: ['path', 'content']
  },
  run: async ({ path, content, class_name }) => {
    const fileContent = await Deno.readTextFile(path);
    const insertPosition = fileContent.indexOf('// INSERT HERE');
    if (insertPosition === -1) {
      throw new Error('Insert position not found in the file');
    }
    const newContent = fileContent.slice(0, insertPosition) + content + fileContent.slice(insertPosition);
    await Deno.writeTextFile(path, newContent);
    return `Content inserted into ${path}`;
  }
}

export default {
  getCurrentTime,
  write_file,
  append_to_file,
  insert_into_class
}

export async function loadTools() {
  return {
    getCurrentTime,
    write_file,
    append_to_file,
    insert_into_class,
    ...await loadMcpServers()
  };
}
