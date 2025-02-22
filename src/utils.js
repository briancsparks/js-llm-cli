
export function logJson(label, obj) {
  console.log('\n' + label + ':')
  console.log(Deno.inspect(obj, {
    depth: Infinity,
    colors: true,
    compact: false,
    indent: 2
  }))
  console.log()
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
