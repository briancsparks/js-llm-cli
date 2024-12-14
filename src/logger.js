// logger.js
// import { colors } from "https://deno.land/x/cliffy/ansi/colors.ts";
import * as colors from "https://deno.land/std@0.218.0/fmt/colors.ts";

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

let userColor = 'yellow';
let assistantColor = 'green';
let systemPromptColor = assistantColor;
let toolColor = 'blue';

const speakers = {
  user: colors[userColor],
  assistant: colors[assistantColor],
  systemPrompt: colors[systemPromptColor],
  toolPrompt: colors[toolColor]
};

export function bark(arg0) {
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

export { Logger, LEVELS };
