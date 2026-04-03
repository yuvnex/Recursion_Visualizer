/**
 * localTracer.js
 *
 * Traces recursive functions LOCALLY in the browser — no API key needed.
 * Supports: JavaScript, Java, C, C++, Python
 *
 * How it works:
 *  1. Detect the recursive function name + entry call from the pasted code
 *  2. Transpile non-JS languages to JavaScript
 *  3. Extract the function body; replace every self-call with __trace__(...)
 *  4. Run it using new Function() — __trace__ is our spy that records every call/return
 *  5. Return the steps[] array that the visualizer understands
 */

// ── Names that are never the recursive function ──────────────────────────────
const IGNORED = new Set([
  'println','print','printf','fprintf','sprintf','scanf',
  'console','log','warn','error','System','out','err',
  'main','Main','setup','init','run','start','execute',
  'Math','parseInt','parseFloat','Number','String','Boolean',
  'Array','Object','JSON','Date','Promise','Map','Set',
  'setTimeout','setInterval','clearTimeout','fetch','require',
  'push','pop','shift','unshift','splice','slice',
  'map','filter','reduce','forEach','find','includes','some','every',
  'toString','valueOf','keys','values','entries',
  'len','range','list','dict','int','str','float','bool',
  'max','min','abs','sum','sorted','enumerate','zip','open',
  'malloc','calloc','free','sizeof','memcpy','memset','strcmp','strcpy','strlen',
  'floor','ceil','round','pow','sqrt','fabs',
  'Scanner','BufferedReader','ArrayList','HashMap','LinkedList',
  'nextInt','nextDouble','nextLine','next',
  'assert','expect','describe','it','test',
])

// ── 1. Find the recursive function name ──────────────────────────────────────
const findFuncName = (code) => {
  const patterns = [
    /\bfunction\s+(\w+)\s*\(/g,
    /\bdef\s+(\w+)\s*\(/g,
    /(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?(?:\w+(?:\[\])*\s+)(\w+)\s*\(/g,
    /\b(?:static\s+)?(?:int|long|double|float|boolean|char|void|auto|String|size_t|unsigned\s+int|unsigned\s+long)\s+(\w+)\s*\(/g,
    /\b(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
  ]

  const defined = []
  for (const pat of patterns) {
    const re = new RegExp(pat.source, pat.flags)
    let m
    while ((m = re.exec(code)) !== null) {
      const name = m[1]
      if (name && !IGNORED.has(name) && name.length > 1 && !defined.includes(name))
        defined.push(name)
    }
  }

  // Pick first name that appears ≥2 times (definition + at least one self-call)
  for (const name of defined) {
    const count = (code.match(new RegExp(`\\b${name}\\s*\\(`, 'g')) || []).length
    if (count >= 2) return name
  }
  return defined[0] ?? null
}

// ── 2. Find the entry call ────────────────────────────────────────────────────
const findEntryCall = (code, funcName) => {
  if (!funcName) return null
  const lines = code.split('\n')

  const isDef   = l => /\b(function|def)\b/.test(l) || /\b(public|private|protected|static|final)\b/.test(l) ||
                       /\b(int|long|double|float|void|boolean|char|auto|String)\s+\w+\s*\(/.test(l)
  const isRet   = l => /\breturn\b/.test(l)
  const isCmt   = l => { const t = l.trim(); return t.startsWith('//') || t.startsWith('#') || t.startsWith('*') || t.startsWith('/*') }

  const re = new RegExp(`\\b${funcName}\\s*\\(([^)]{0,300})\\)`)

  // Pass 1: non-return, non-def lines
  for (const line of lines) {
    if (isCmt(line) || isDef(line) || isRet(line)) continue
    const m = line.match(re)
    if (m) return `${funcName}(${m[1].trim()})`
  }
  // Pass 2: assignment lines like `int result = factorial(5);`
  for (const line of lines) {
    if (isCmt(line) || isDef(line)) continue
    const m = line.match(re)
    if (m) return `${funcName}(${m[1].trim()})`
  }
  return null
}

// ── 3a. Python → JS transpiler ───────────────────────────────────────────────
const pyExpr = (expr) =>
  expr
    .replace(/\bTrue\b/g,  'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g,  'null')
    .replace(/\band\b/g,   '&&')
    .replace(/\bor\b/g,    '||')
    .replace(/\bnot\s+/g,  '!')
    .replace(/\blen\(([^)]+)\)/g, '$1.length')
    .replace(/\bprint\s*\(/g,     'console.log(')

const transpilePython = (code) => {
  const lines = code.split('\n')
  const out = []
  // stack of indent levels; we push when we see increased indent after a block opener
  const stack = [0]

  const top   = () => stack[stack.length - 1]
  const depth = () => stack.length - 1

  let i = 0
  while (i < lines.length) {
    const raw     = lines[i]
    const trimmed = raw.trim()
    i++

    if (!trimmed || trimmed.startsWith('#')) continue

    const indent = raw.search(/\S/)

    // Close blocks for decreased indentation
    while (stack.length > 1 && indent < top()) {
      stack.pop()
      out.push('  '.repeat(depth()) + '}')
    }
    // Push indent if deeper (new block started by previous line)
    if (indent > top()) stack.push(indent)

    const d = depth()
    const pfx = '  '.repeat(d)

    // def funcName(params):
    const defM = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:$/)
    if (defM) { out.push(pfx + `function ${defM[1]}(${defM[2]}) {`); continue }

    // elif condition:
    const elifM = trimmed.match(/^elif\s+(.*?)\s*:$/)
    if (elifM) {
      // replace last lone "}" with "} else if (...) {"
      for (let k = out.length - 1; k >= 0; k--) {
        if (out[k].trim() === '}') { out[k] = '  '.repeat(d - 1) + `} else if (${pyExpr(elifM[1])}) {`; break }
      }
      continue
    }

    // else:
    if (/^else\s*:$/.test(trimmed)) {
      for (let k = out.length - 1; k >= 0; k--) {
        if (out[k].trim() === '}') { out[k] = '  '.repeat(d - 1) + '} else {'; break }
      }
      continue
    }

    // if condition:
    const ifM = trimmed.match(/^if\s+(.*?)\s*:$/)
    if (ifM) { out.push(pfx + `if (${pyExpr(ifM[1])}) {`); continue }

    // for x in range(n):
    const forM = trimmed.match(/^for\s+(\w+)\s+in\s+range\((\w+)\)\s*:$/)
    if (forM) { out.push(pfx + `for (let ${forM[1]} = 0; ${forM[1]} < ${forM[2]}; ${forM[1]}++) {`); continue }

    // while condition:
    const whileM = trimmed.match(/^while\s+(.*?)\s*:$/)
    if (whileM) { out.push(pfx + `while (${pyExpr(whileM[1])}) {`); continue }

    // return expr
    if (trimmed.startsWith('return')) {
      const expr = trimmed.slice(6).trim()
      out.push(pfx + `return ${pyExpr(expr)};`)
      continue
    }

    // pass
    if (trimmed === 'pass') { out.push(pfx + '// pass'); continue }

    // everything else
    let js = pyExpr(trimmed)
    if (!js.endsWith(';')) js += ';'
    out.push(pfx + js)
  }

  // Close remaining open blocks
  while (stack.length > 1) {
    stack.pop()
    out.push('  '.repeat(depth()) + '}')
  }

  return out.join('\n')
}

// ── 3b. Java / C / C++ → JS transpiler ──────────────────────────────────────
const transpileCStyle = (code) => {
  let js = code

  // Remove Java class wrappers
  js = js.replace(/\bpublic\s+class\s+\w+\s*\{/g, '')
  // Remove main method body (everything from "public static void main" to its closing brace)
  js = js.replace(/(?:public\s+)?static\s+void\s+main\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}/g, '')

  // Convert typed function declarations to JS function
  // e.g. "public static int factorial(int n)" → "function factorial(n)"
  js = js.replace(
    /(?:(?:public|private|protected)\s+)?(?:static\s+)?(?:final\s+)?(?:int|long|double|float|boolean|void|char|String|auto|size_t|unsigned\s+int|unsigned\s+long|Integer|Long|Double|Float)\s*(?:\[\])?\s+(\w+)\s*\(/g,
    'function $1('
  )

  // Strip types from parameters inside function signatures
  js = js.replace(/function\s+(\w+)\s*\(([^)]*)\)/g, (_m, name, params) => {
    const clean = params
      .split(',')
      .map(p => {
        const stripped = p
          .replace(/\b(?:final\s+)?(?:int|long|double|float|boolean|char|String|auto|size_t|unsigned\s+int|unsigned\s+long|Integer|Long|Double|Float)\s*(?:\[\])?\s*/g, '')
          .trim()
        return stripped || p.trim()
      })
      .filter(Boolean)
      .join(', ')
    return `function ${name}(${clean})`
  })

  // Remove type casts: (int), (long), (double), etc.
  js = js.replace(/\(\s*(?:int|long|double|float|char|unsigned)\s*\)\s*/g, '')

  // Java I/O → console.log (just so it doesn't error)
  js = js.replace(/System\.out\.println\s*\(/g, 'console.log(')
  js = js.replace(/System\.out\.print\s*\(/g,   'console.log(')

  // Remove import / package statements
  js = js.replace(/^(?:import|package)\s+.+;$/gm, '')

  // Remove C++ #include / using namespace
  js = js.replace(/^#include\s+.+$/gm,          '')
  js = js.replace(/^using\s+namespace\s+\w+;$/gm,'')

  // Remove C-style array types: int arr[] → arr  (inside param lists already handled above)
  // Remove local variable type declarations: int x = ...  →  let x = ...
  js = js.replace(/\b(?:int|long|double|float|boolean|char)\s+(\w+)\s*=/g, 'let $1 =')

  // Remove trailing `}` from class (may leave an extra } but JS is lenient)

  return js
}

// ── 3c. Dispatcher ───────────────────────────────────────────────────────────
const transpileToJS = (code, language) => {
  if (language === 'javascript') return code
  if (language === 'python')     return transpilePython(code)
  return transpileCStyle(code)   // java, cpp, c
}

// ── 4. Extract param names from JS signature ─────────────────────────────────
const extractParamNames = (jsCode, funcName) => {
  const m = jsCode.match(new RegExp(`function\\s+${funcName}\\s*\\(([^)]*)\\)`))
  if (!m || !m[1].trim()) return []
  return m[1].split(',').map(p => p.trim()).filter(Boolean)
}

// ── 5. Extract function body (handles nested braces) ─────────────────────────
const extractFunctionBody = (jsCode, funcName) => {
  const sigRe = new RegExp(`function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{`)
  const sigMatch = sigRe.exec(jsCode)
  if (!sigMatch) return null

  const openPos = sigMatch.index + sigMatch[0].length - 1
  let depth = 0, i = openPos
  for (; i < jsCode.length; i++) {
    if (jsCode[i] === '{') depth++
    else if (jsCode[i] === '}') { depth--; if (depth === 0) break }
  }
  return jsCode.slice(openPos + 1, i)  // body without outer { }
}

// ── 6. The core tracer ────────────────────────────────────────────────────────
export const traceLocally = (originalCode, language) => {
  const MAX_STEPS = 500

  // a) Find function name + entry call from original code
  const funcName = findFuncName(originalCode)
  if (!funcName) throw new Error(
    'Could not find a recursive function.\n' +
    'Make sure your code defines a function, e.g.:\n' +
    '  function factorial(n) { ... }\n' +
    '  def factorial(n):\n' +
    '  int factorial(int n) { ... }'
  )

  const rawEntryCall = findEntryCall(originalCode, funcName)
  if (!rawEntryCall) throw new Error(
    `Found function "${funcName}" but no call to it.\n` +
    `Add a line at the bottom calling it, e.g.:\n  ${funcName}(5);`
  )

  // b) Transpile to JS
  let jsCode
  try {
    jsCode = transpileToJS(originalCode, language)
  } catch (e) {
    throw new Error(`Transpile error: ${e.message}`)
  }

  // c) Get param names
  const paramNames = extractParamNames(jsCode, funcName)

  // d) Extract function body
  const body = extractFunctionBody(jsCode, funcName)
  if (!body) throw new Error(
    `Could not parse body of "${funcName}".\n` +
    'Make sure it uses curly braces { } (not Python indentation alone).'
  )

  // e) Replace recursive calls with __trace__
  const instrumentedBody = body.replace(
    new RegExp(`\\b${funcName}\\s*\\(`, 'g'),
    '__trace__('
  )

  // f) Create inner function
  let innerFn
  try {
    innerFn = new Function('__trace__', ...paramNames, instrumentedBody)
  } catch (e) {
    throw new Error(
      `Syntax error after transpiling to JS: ${e.message}\n\n` +
      `Transpiled code:\nfunction ${funcName}(${paramNames.join(', ')}) {\n${instrumentedBody}\n}\n\n` +
      'Tip: simplify your code or use JavaScript directly.'
    )
  }

  // g) Tracing state
  const steps = []
  let nodeCounter = 0
  const nodeStack = []

  const tracerFn = (...args) => {
    if (steps.length >= MAX_STEPS)
      throw new Error(`Hit ${MAX_STEPS}-step limit. Check your base case — it may never be reached.`)

    const nodeId     = nodeCounter++
    const parentId   = nodeStack.length > 0 ? nodeStack[nodeStack.length - 1] : null
    nodeStack.push(nodeId)

    // Build params object
    const params = {}
    if (paramNames.length > 0) {
      paramNames.forEach((name, idx) => { params[name] = args[idx] ?? null })
    } else {
      args.forEach((a, idx) => { params[`arg${idx}`] = a })
    }

    const label = `${funcName}(${args.map(a =>
      Array.isArray(a) ? `[${a.slice(0,4).join(',')}${a.length > 4 ? '…' : ''}]` : String(a)
    ).join(', ')})`

    const callIdx      = steps.length
    const counterBefore = nodeCounter

    steps.push({ type: 'call', nodeId, parentId, label, params, isBaseCase: false })

    let result
    try {
      result = innerFn(tracerFn, ...args)
    } catch (e) {
      nodeStack.pop()
      throw e
    }

    const isBase = (nodeCounter === counterBefore)   // no children → base case
    steps[callIdx].isBaseCase = isBase

    nodeStack.pop()
    steps.push({ type: 'return', nodeId, value: result, isBaseCase: isBase })

    return result
  }

  // h) Parse entry args and run
  const argsStr = rawEntryCall.slice(funcName.length + 1, -1).trim()
  let entryArgs
  try {
    entryArgs = argsStr ? new Function(`return [${argsStr}]`)() : []
  } catch {
    // fallback: split by comma and coerce to numbers
    entryArgs = argsStr.split(',').map(a => {
      const n = Number(a.trim())
      return isNaN(n) ? a.trim() : n
    })
  }

  try {
    tracerFn(...entryArgs)
  } catch (e) {
    if (e.message.includes('step limit')) throw e
    throw new Error(`Runtime error: ${e.message}\n\nThis usually means the transpiler produced invalid JS. Try pasting JavaScript directly.`)
  }

  return { functionName: funcName, inputCall: rawEntryCall, steps }
}

// Named exports so llmClient can use them for cache-key detection
export { findFuncName, findEntryCall }

