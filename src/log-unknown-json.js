export async function logUnknownJson(json, context = '') {
  // Use Deno's cross-platform way to get the standard temp directory
  const tempDir = await Deno.realPath(Deno.env.get("TMPDIR") || Deno.env.get("TEMP") || Deno.env.get("TMP") || "/tmp");
  const logPath = `${tempDir}/misunderstood.jsonl`;

  // Get call stack to determine where this was called from
  const stack = new Error().stack;
  const callerLine = stack.split('\n')[2]; // Skip Error and current function

  const logEntry = {
    timestamp: new Date().toISOString(),
    json: json,
    caller: callerLine.trim(),
    context: context
  };

  const jsonString = JSON.stringify(logEntry, null, 0) + '\n';

  await Deno.writeFile(
    logPath,
    new TextEncoder().encode(jsonString),
    { append: true, create: true }
  );

  // Pretty print to console using Deno.inspect
  console.warn(
    `Unknown JSON case logged to: ${logPath}\n`,
    Deno.inspect(json, {
      depth: Infinity,
      colors: true,
      compact: false,
      indent: 2
    })
  );
}
