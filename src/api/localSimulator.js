/**
 * localSimulator.js
 *
 * Runs ANY recursive function entirely in the browser — no API key needed.
 *
 * How it works:
 *  1. Strip comments and detect function name + parameters
 *  2. Translate Java / Python / C++ / C syntax → valid JavaScript
 *  3. Wrap the translated function with a tracing proxy
 *  4. new Function(...) to execute it safely
 *  5. Return the full steps array for the visualiser
 *
 * Supports: JavaScript, Java, Python, C, C++
 */

// ─── 1. Comment stripping ─────────────────────────────────────────────────────

const stripComments = (code) =>
  code
    .replace(/\/\/[^\n]*/g, '')          // //  line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')    // /* block comments */
    .replace(/#[^\n]*/g, '')             // #   Python comments
    .replace(/\n{3,}/g, '\n\n')
    .trim()

// ─── 2. Detect recursive function name + params ───────────────────────────────

const IGNORED = new Set([
  'main', 'println', 'print', 'printf', 'fprintf', 'scanf',
  'console', 'log', 'System', 'out', 'Math', 'parseInt', 'parseFloat',
  'setTimeout', 'setInterval', 'assert', 'test', 'describe',
  'len', 'range', 'int', 'str', 'float', 'bool', 'abs', 'max', 'min',
  'malloc', 'free', 'memcpy', 'memset', 'sizeof', 'floor', 'ceil', 'sqrt',
])

const detectFunction = (code) => {
  const patterns = [
    // Java/C++ with access modifiers
    /(?:public|private|protected|static|inline)(?:\s+static)?(?:\s+\w+(?:\[\])*)+\s+(\w+)\s*\(([^)]*)\)\s*\{/g,
    // plain typed: int factorial(int n)
    /\b(?:int|long|double|float|boolean|char|void|auto|String|size_t|unsigned\s+\w+|\w+\[\])\s+(\w+)\s*\(([^)]*)\)\s*\{/g,
    // JavaScript function declaration
    /\bfunction\s+(\w+)\s*\(([^)]*)\)/g,
    // Python def
    /\bdef\s+(\w+)\s*\(([^)]*)\)\s*:/g,
    // Arrow / const
    /\b(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g,
  ]

  const candidates = []
  for (const pat of patterns) {
    const re = new RegExp(pat.source, pat.flags)
    let m
    while ((m = re.exec(code)) !== null) {
      const name = m[1]
      if (!IGNORED.has(name) && name.length > 1) {
        const raw = (m[2] || '').split(',').map(p => p.trim()).filter(Boolean)
        // strip type annotations: "int n" → "n", "n: int" → "n"
        const params = raw.map(p =>
          p.replace(/^\w+\s+(\w+).*$/, '$1')   // "int n" → "n"
           .replace(/^(\w+)\s*:.*$/, '$1')      // "n: int" → "n"
           .replace(/\[\].*$/, '')               // "arr[]" → "arr"
           .trim()
        ).filter(p => /^[a-zA-Z_]\w*$/.test(p))
        candidates.push({ name, params })
      }
    }
  }

  // pick the first that appears ≥ 2 times (definition + recursive call)
  for (const c of candidates) {
    const count = (code.match(new RegExp(`\\b${c.name}\\s*\\(`, 'g')) || []).length
    if (count >= 2) return c
  }
  return candidates[0] ?? null
}

// ─── 3. Extract top-level invocation call ─────────────────────────────────────

const detectInvocation = (code, funcName) => {
  if (!funcName) return null
  const lines = code.split('\n')

  const skipLine = (l) => {
    const t = l.trim()
    if (!t || t.startsWith('//') || t.startsWith('#') || t.startsWith('*')) return true
    if (/\b(function|def)\b/.test(t)) return true
    if (/\b(public|private|protected|static|inline)\b/.test(t) && t.includes('(')) return true
    if (/\b(int|long|double|float|void|boolean|char|auto|String)\s+\w+\s*\(/.test(t)) return true
    if (/\breturn\b/.test(t)) return true
    return false
  }

  const re = new RegExp(`\\b${funcName}\\s*\\(([^;){]*)\\)`)
  for (const line of lines) {
    if (skipLine(line)) continue
    const m = line.match(re)
    if (m) return `${funcName}(${m[1].trim()})`
  }
  // looser pass — allow lines with = but not return
  for (const line of lines) {
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) continue
    if (/\breturn\b/.test(line)) continue
    if (/\b(function|def|public|private|static)\b/.test(line)) continue
    const m = line.match(re)
    if (m) return `${funcName}(${m[1].trim()})`
  }
  return null
}

// ─── 4. Parse args string into actual JS values ───────────────────────────────

const parseArgs = (argsStr) => {
  if (!argsStr || !argsStr.trim()) return []
  // handle: "arr, 5, 0"  or  "{1,2,3}, 5, 0"  or  "[1,2,3], 5"
  const normalised = argsStr
    .replace(/\{([^}]*)\}/g, '[$1]')   // {1,2,3} → [1,2,3]
    .trim()

  // safe eval of the args
  try {
    const result = Function(`"use strict"; return [${normalised}]`)()
    return result
  } catch {
    // fallback: split by top-level commas
    const parts = []
    let depth = 0, cur = ''
    for (const ch of normalised) {
      if (ch === '(' || ch === '[' || ch === '{') depth++
      else if (ch === ')' || ch === ']' || ch === '}') depth--
      if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = '' }
      else cur += ch
    }
    if (cur.trim()) parts.push(cur.trim())
    return parts.map(p => {
      try { return Function(`"use strict"; return ${p}`)() } catch { return p }
    })
  }
}

// ─── 5. Language → JavaScript translator ─────────────────────────────────────

const extractFunctionBody = (code, funcName) => {
  // Find the opening brace of the function
  const re = new RegExp(`\\b${funcName}\\s*\\([^)]*\\)\\s*(?:->\\s*\\w+\\s*)?\\{`)
  const match = code.match(re)
  if (!match) return null

  const start = code.indexOf('{', match.index + match[0].length - 1)
  let depth = 0, i = start, body = ''
  for (; i < code.length; i++) {
    if (code[i] === '{') depth++
    else if (code[i] === '}') { depth--; if (depth === 0) { body = code.slice(start + 1, i); break } }
  }
  return body
}

const extractPythonBody = (code, funcName) => {
  const lines = code.split('\n')
  const defIdx = lines.findIndex(l => new RegExp(`\\bdef\\s+${funcName}\\s*\\(`).test(l))
  if (defIdx === -1) return null

  const baseIndent = lines[defIdx].match(/^(\s*)/)[1].length
  const bodyLines = []
  for (let i = defIdx + 1; i < lines.length; i++) {
    const l = lines[i]
    if (!l.trim()) { bodyLines.push(''); continue }
    const indent = l.match(/^(\s*)/)[1].length
    if (indent <= baseIndent && l.trim()) break
    bodyLines.push(l)
  }
  return bodyLines.join('\n')
}

const translateToJS = (code, funcName, params, language) => {
  let body = ''

  if (language === 'python') {
    body = extractPythonBody(code, funcName) || ''
    body = body
      .replace(/\belif\b/g, 'else if')
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\b/g, '!')
      .replace(/\bprint\s*\(.*\)/g, '')
      // convert Python if/else without braces → add braces
      .replace(/^(\s*)(if|elif|else if|else|while|for)(.*):\s*$/gm, '$1$2$3 {')
    // simple dedent
    const lines = body.split('\n')
    const minIndent = lines
      .filter(l => l.trim())
      .reduce((min, l) => Math.min(min, l.match(/^(\s*)/)[1].length), Infinity)
    body = lines.map(l => l.slice(minIndent)).join('\n')
  } else {
    body = extractFunctionBody(code, funcName) || ''
    // Strip type declarations from local variables
    body = body
      .replace(/\b(?:int|long|double|float|boolean|char|String|auto|size_t|unsigned)\s+(\w+)\s*=/g, 'let $1 =')
      .replace(/\b(?:int|long|double|float|boolean|char)\s+(\w+)\s*;/g, 'let $1;')
      // Java System.out.println → no-op
      .replace(/System\.out\.print(?:ln)?\s*\([^)]*\)\s*;/g, '')
      // cout → no-op
      .replace(/(?:std::)?cout\s*<<[^;]*;/g, '')
      // printf / scanf → no-op
      .replace(/(?:printf|scanf)\s*\([^)]*\)\s*;/g, '')
      // true/false capitalisation
      .replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false')
      // C/Java Math.floor etc. are same in JS
  }

  return body
}

// ─── 6. Build instrumented function + run ────────────────────────────────────

const MAX_STEPS = 500   // guard against infinite recursion

const buildAndRun = (funcName, params, body, args) => {
  const steps = []
  let nodeCounter = 0
  const callStack = []   // stack of nodeIds

  // We expose __trace__ into the function scope
  const traceCall = (paramObj) => {
    const nodeId = nodeCounter++
    const parentId = callStack.length > 0 ? callStack[callStack.length - 1] : null
    const label = `${funcName}(${Object.values(paramObj).join(', ')})`
    callStack.push(nodeId)
    steps.push({ type: 'call', nodeId, parentId, label, params: paramObj, isBaseCase: false })
    if (steps.length > MAX_STEPS) throw new Error('MAX_STEPS exceeded')
    return nodeId
  }

  const traceReturn = (nodeId, value, isBase) => {
    callStack.pop()
    const s = steps.find(s => s.type === 'call' && s.nodeId === nodeId)
    if (s) s.isBaseCase = !!isBase
    steps.push({ type: 'return', nodeId, value, isBaseCase: !!isBase })
    return value
  }

  // Build the function source — wrap every entry and return with trace hooks
  // Strategy: inject __nodeId__ = traceCall({...params}) at start,
  //           and wrap every `return expr` with traceReturn(__nodeId__, expr)

  const paramList = params.join(', ')

  // Instrument return statements
  // We replace `return <expr>;` with `return __ret__(<expr>);`
  // and inject __ret__ = (v) => traceReturn(__nodeId__, v) into scope
  let instrumentedBody = body
    // Replace "return <expr>;" or "return <expr>" at end of line
    .replace(/\breturn\s+([\s\S]*?);/g, (_, expr) => {
      // Is this a base-case return? Heuristic: doesn't contain funcName
      const isBase = !new RegExp(`\\b${funcName}\\b`).test(expr)
      return `return __ret__(${expr.trim()}, ${isBase});`
    })

  const src = `
"use strict";
(function ${funcName}(${paramList}) {
  const __nodeId__ = __traceCall__({${params.map(p => `${p}`).join(', ')}});
  const __ret__ = (v, isBase) => __traceReturn__(__nodeId__, v, isBase);
  ${instrumentedBody}
})
`

  try {
    const fn = new Function(
      '__traceCall__', '__traceReturn__',
      `return ${src}`
    )(traceCall, traceReturn)

    fn(...args)
  } catch (e) {
    if (e.message === 'MAX_STEPS exceeded') {
      throw new Error(`Recursion exceeded ${MAX_STEPS} steps — input may be too large or function has no base case.`)
    }
    throw new Error(`Runtime error: ${e.message}`)
  }

  return steps
}

// ─── 7. Public API ────────────────────────────────────────────────────────────

/**
 * simulateLocally(code, language)
 * Returns { functionName, inputCall, steps } — same shape as customAnalysis.json
 */
export const simulateLocally = (code, language) => {
  const clean = stripComments(code)

  const funcInfo = detectFunction(clean)
  if (!funcInfo) throw new Error('Could not find a recursive function definition. Make sure your code includes a function with a name, parameters, and body.')

  const { name: funcName, params } = funcInfo

  const invocation = detectInvocation(clean, funcName)
  if (!invocation) throw new Error(`Found function "${funcName}" but could not find a call to it. Add a line like: ${funcName}(5);`)

  // extract args from invocation string e.g. "factorial(5)" → ["5"] → [5]
  const argsMatch = invocation.match(new RegExp(`\\b${funcName}\\s*\\(([\\s\\S]*)\\)$`))
  const argsStr = argsMatch ? argsMatch[1] : ''
  const args = parseArgs(argsStr)

  if (args.length !== params.length) {
    // might be ok for variadic; proceed anyway
  }

  const body = translateToJS(clean, funcName, params, language)
  if (!body || !body.trim()) throw new Error(`Could not extract the body of "${funcName}". Check that your function uses curly braces { } (or Python indentation).`)

  const steps = buildAndRun(funcName, params, body, args)

  return {
    functionName: funcName,
    inputCall: invocation,
    steps,
  }
}

/**
 * detectForCache(code, language) — lightweight helper used by llmClient
 * to get the inputCall string for JSON-cache lookup without running the simulation.
 */
export const detectForCache = (code, language) => {
  try {
    const clean = stripComments(code)
    const info  = detectFunction(clean)
    if (!info) return null
    return detectInvocation(clean, info.name)
  } catch { return null }
}
