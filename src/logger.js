// logger.js
// import { colors } from "https://deno.land/x/cliffy/ansi/colors.ts";
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
      // // Fallback to Node's util.inspect if available
      // if (typeof require !== "undefined") {
      //   try {
      //     const util = require("util");
      //     return "\n" + util.inspect(data, {
      //       colors: this.enableColors,
      //       depth: null,
      //       sorted: true
      //     });
      //   } catch {
      //     // Fallback to basic JSON formatting if neither is available
      //     return "\n" + JSON.stringify(data, null, 2);
      //   }
      // }
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


// async function logUnknownJson(json, context = '') {
//   const tmpDir = await Deno.makeTempDir();
//   const logPath = `${tmpDir}/misunderstood.jsonl`;
//
//   // Get call stack to determine where this was called from
//   const stack = new Error().stack;
//   const callerLine = stack.split('\n')[2]; // Skip Error and current function
//
//   const logEntry = {
//     timestamp: new Date().toISOString(),
//     json,
//     caller: callerLine.trim(),
//     context
//   };
//
//   const jsonString = JSON.stringify(logEntry, null, 0) + '\n';
//
//   await Deno.writeFile(
//     logPath,
//     new TextEncoder().encode(jsonString),
//     { append: true, create: true }
//   );
//
//   console.warn(`Unknown JSON case logged to: ${logPath}`);
// }



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

export function bark0(arg0) {
  const key0  = (Object.keys(arg0) || [])[0];

  // TODO: Implement these
  if (key0 === 'toolResponse') {
    const speak = speakers['toolPrompt'] || colors.white;
    console.log('\n------------------------------');
    console.log(speak(`tool:`));
    console.log(speak(`${arg0.toolResponse.content[0].content}`));

    if (globalLogger) {
      globalLogger.debug('Tool response', arg0)
    }
    return;
  }

  let content   = arg0.content          || (arg0[key0] || {}).content;
  let role      = arg0.role             || (arg0[key0] || {}).role;
  let colorizer = speakers[role];

  // let colorizer = colors.white;
  // if (arg0.role) {
  //   colorizer = speakers[arg0.role];
  // }

  if (key0 === 'systemPrompt') {
    colorizer = speakers.systemPrompt;
    content = arg0.systemPrompt;
    role = 'system';
  }

  if (Array.isArray(content)) {
    for (const item of content) {
      bark({role, content: item.text || item.name});
    }
    return;
  }

  const canBark = (!!content) && (typeof content === 'string' || content instanceof String);

  role      = role      || 'NOBODY';
  content   = content   || 'NOCONTENT';
  colorizer = colorizer || colors.white;

  if (!canBark) {
    globalLogger.info('\n------------------------------ MEOW!\n', arg0)
    return;
  }

  console.log('\n------------------------------');
  console.log(colorizer(`${role}:`));
  console.log(colorizer(`${content}`));
  globalLogger.debug('meow', {role, content});
}

export { Logger, LEVELS, logUnknownJson };
