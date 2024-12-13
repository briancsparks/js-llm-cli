// logger.js
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
      // Fallback to Node's util.inspect if available
      if (typeof require !== "undefined") {
        try {
          const util = require("util");
          return "\n" + util.inspect(data, {
            colors: this.enableColors,
            depth: null,
            sorted: true
          });
        } catch {
          // Fallback to basic JSON formatting if neither is available
          return "\n" + JSON.stringify(data, null, 2);
        }
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

export { Logger, LEVELS };
