// logger.js
import * as colors from "https://deno.land/std@0.218.0/fmt/colors.ts";
import { logUnknownJson } from "./log-unknown-json.js";

const COLORS = {
  reset: "\x1b[0m",
  white: "\x1b[37m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m"
};

const LEVELS = {
  DEBUG: { priority: 0, color: COLORS.gray, prefix: "DEBUG " },   // Note the space padding
  INFO:  { priority: 1, color: COLORS.white, prefix: "INFO  " },  // Double space for alignment
  WARN:  { priority: 2, color: COLORS.yellow, prefix: "WARN  " }, // Double space for alignment
  ERROR: { priority: 3, color: COLORS.red, prefix: "ERROR " }     // Note the space padding
};

class Logger {
  constructor(options = {}) {
    this.minLevel = LEVELS[options.minLevel || "INFO"];
    this.quiet = options.quiet || false;
    this.enableColors = options.colors ?? true;
    this.prettyPrint = options.prettyPrint ?? true;
  }

  formatData(data) {
    if (data === null || data === undefined) return "";

    if (this.prettyPrint) {
      // Use Deno's inspect for pretty printing if available
      if (typeof Deno !== "undefined" && Deno.inspect) {
        return "\n" + Deno.inspect(data, {
          colors: this.enableColors,
          depth: null,
          sorted: true
        });
      }
    }
    return "\n" + JSON.stringify(data);
  }

  log(level, message, data = null) {
    if (this.quiet || LEVELS[level].priority < this.minLevel.priority) return;

    const timestamp = new Date().toISOString();
    const prefix = LEVELS[level].prefix;
    const color = this.enableColors ? LEVELS[level].color : "";
    const reset = this.enableColors ? COLORS.reset : "";

    let output = `${color}[${timestamp}] ${prefix}: ${message}${reset}`;

    if (data !== null) {
      output += this.formatData(data);
    }

    console.log(output);
  }

  debug(message, data = null) {
    this.log("DEBUG", message, data);
  }

  info(message, data = null) {
    this.log("INFO", message, data);
  }

  warn(message, data = null) {
    this.log("WARN", message, data);
  }

  error(message, data = null) {
    this.log("ERROR", message, data);
  }
}

let globalLogger = null;

export function initLogger(options = {}) {
  if (globalLogger) {
    throw new Error("Logger already initialized");
  }
  globalLogger = new Logger(options);
  return globalLogger;
}

export function getLogger() {
  if (!globalLogger) {
    throw new Error("Logger not initialized. Call initLogger() first");
  }
  return globalLogger;
}

export function closeLogger() {
  globalLogger = null;
}

// ==========================================================================

let userColor = 'yellow';
let assistantColor = 'green';
let systemPromptColor = assistantColor;
let toolResponse = 'blue';

const speakers = {
  user: colors[userColor],
  assistant: colors[assistantColor],
  systemPrompt: colors[systemPromptColor],
  toolPrompt: colors[toolResponse]
};

export async function bark(arg0) {
  const argk = Object.keys(arg0);
  const argc = argk.length;
  const key0 = argk[0];
  const val0 = arg0[key0];
  const role = arg0.role || val0.role;

  const barkIt = async function(args) {
    let argsK = Object.keys(args);
    let argsC = argsK.length;

    let handled = false;
    let errMessage = "";
    let subRole = null;

    if (argsC === 1) {
      errMessage = `While handling key: ${key0}`;     /* default */

      subRole = key0;
      if (key0 === 'toolResponse') {
        // errMessage = `While handling toolResponse`;
        return barkIt(val0);

      } else if (key0 === 'llmResponse') {
        // errMessage = `While handling llmResponse`;
        return barkIt(val0);

      } else if (key0 === 'message') {
        // errMessage = `While handling message`;
        return barkIt(val0);

      } else if (key0 === 'systemPrompt') {
        subRole = 'systemPrompt';
        return doTheBarking(arg0.systemPrompt);

      } else {
        errMessage = `While handling unknown key: ${key0}`;
      }
    } else {
      // argc > 1; key0 is still the cmd
      if (key0 === 'message') {
        if (args.role && args.content) {
          return doTheBarking(args.content);
        }

      } else if (key0 === 'llmResponse' || key0 === 'toolResponse') {
        if (args.role && Array.isArray(args.content)) {
          let success = true;
          let i = 0;
          for (const item of args.content) {
            success = await barkContent(item, i, args /*, args.role*/) && success;
            i += 1;
          }
          if (success) {
            return success;
          }
        }
        errMessage = `While handling key: ${key0}, no role`;
      } else {
        errMessage = `While handling unknown key: ${key0}`;
      }
    }


    if (!handled) {
      return await logUnknownJson(arg0, errMessage);
    }
    return null;

    async function barkContent(content, count, parent, theRole) {

      if (content.type === 'text' && content.text) {
        return doTheBarking(content.text, theRole, count);
      }
      if (content.type === 'tool_use' && content.name) {
        return doTheBarking(content.name, content.type, count);
      }
      if (content.type === 'tool_result' && Array.isArray(content.content)) {
        let success = true;
        let i = 0;
        for (const item of content.content) {
          success = await barkContent(item, i, args, content.type) && success;
          i += 1;
        }
        if (success) {
          return success;
        }
      }
      return false;
    }

    function getColorizer() {
      return speakers[subRole] || speakers[role] || colors.white;
    }

    function doTheBarking(text, role_ = null, count = 0) {
      const speak = getColorizer();
      console.log('\n------------------------------');
      console.log(speak(`role: ${role_ || subRole || role || 'NOBODY'} (${count})`));
      console.log(speak(text));
      return true;
    }
  }
  return await barkIt(arg0);
}

export { Logger, LEVELS, logUnknownJson };
