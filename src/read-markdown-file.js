// main.js
import { parse as parseYaml } from "https://deno.land/std@0.217.0/yaml/mod.ts";
import { marked } from "npm:marked@12.0.1";

function logJson(label, obj) {
  console.log('\n' + label + ':')
  console.log(Deno.inspect(obj, {
    depth: null,
    colors: true,
    maxArrayLength: null
  }))
  console.log()
}

function parseMarkdownStructure(markdown) {
  const tokens = marked.lexer(markdown)

  const headings = tokens.filter(token => token.type === 'heading').map(heading => ({
    level: heading.depth,
    text: heading.text
  }))

  const codeBlocks = tokens.filter(token => token.type === 'code').map(code => ({
    language: code.lang || 'text',
    code: code.text
  }))

  const lists = tokens.filter(token => token.type === 'list').map(list => ({
    ordered: list.ordered,
    items: list.items.map(item => ({
      text: item.text,
      task: item.task,
      checked: item.checked
    }))
  }))

  const tables = tokens.filter(token => token.type === 'table').map(table => ({
    header: table.header,
    align: table.align,
    rows: table.rows
  }))

  const images = []
  const links = []

  function extractInlineElements(tokens) {
    if (!tokens) return
    tokens.forEach(token => {
      if (token.type === 'link') {
        links.push({
          text: token.text,
          url: token.href
        })
      }
      if (token.type === 'image') {
        images.push({
          alt: token.text,
          url: token.href,
          title: token.title
        })
      }
      if (token.tokens) {
        extractInlineElements(token.tokens)
      }
    })
  }

  tokens.forEach(token => {
    if (token.tokens) {
      extractInlineElements(token.tokens)
    }
    if (token.type === 'list') {
      token.items.forEach(item => {
        if (item.tokens) {
          extractInlineElements(item.tokens)
        }
      })
    }
    if (token.type === 'table') {
      token.rows.forEach(row => {
        row.forEach(cell => {
          if (cell.tokens) {
            extractInlineElements(cell.tokens)
          }
        })
      })
    }
  })

  return {
    headings,
    codeBlocks,
    lists,
    tables,
    images,
    links,
    fullStructure: tokens
  }
}

async function parseMarkdownFile(filePath) {
  const content = await Deno.readTextFile(filePath)

  const matches = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

  if (!matches) {
    return {
      // frontMatter: {},
      content: content,
      structure: parseMarkdownStructure(content),
      rendered: marked.parse(content)
    }
  }

  const [_, frontMatterStr, markdownContent] = matches
  const frontMatter = parseYaml(frontMatterStr)

  return {
    ...frontMatter,
    content: markdownContent.trim(),
    structure: parseMarkdownStructure(markdownContent.trim()),
    rendered: marked.parse(markdownContent.trim())
  }
}

// Example usage
const filePath = Deno.args[0]

if (!filePath) {
  console.error("Please provide a markdown file path")
  Deno.exit(1)
}

try {
  const result0 = await parseMarkdownFile(filePath)
  const {rendered, content, ...result1} = result0
  const result = {...result1, content: content.length}

  console.log("\nRendered Markdown:")
  console.log("=================")
  console.log(rendered)
  console.log("\nContent:")
  console.log("================")
  console.log(content)
  console.log("\nParsed Structure:")
  console.log("================")
  logJson("Markdown Data", result)
} catch (error) {
  console.error("Error:", error.message)
  Deno.exit(1)
}
