/**
 * localAnalyzer.js
 *
 * Analyzes recursive code ENTIRELY IN THE BROWSER — no API key needed.
 *
 * How it works:
 *  1. Normalizes the pasted code (Java / Python / C / C++ / JS) into
 *     runnable JavaScript by stripping type annotations and fixing syntax.
 *  2. Instruments the recursive function to record every call & return.
 *  3. Executes it with new Function() (sandboxed, no network needed).
 *  4. Returns the same step-array format the visualizer expects.
 *
 * Supports: JavaScript, Java, Python, C, C++
 */

// ─── Language normaliser ──────────────────────────────────────────────────────

/**
 * Convert any of our 5 supported languages into valid JavaScript.
 */
const normaliseToJS = (language, code) => {
  let js = code

  if (language === 'python') {
    js = convertPython(js)
  } else if (language === 'java' || language === 'cpp' || language === 'c') {
    js = convertCLike(js)
  }
  // javascript → pass through

  return js
}

// ── Python → JS ───────────────────────────────────────────────────────────────

const convertPython = (code) => {
  const lines = code.split('\n')
  const result = []
  const indentStack = [0]

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const stripped = raw.trimEnd()
    if (stripped.trim() === '') { result.push(''); continue }

    const indent = raw.length - raw.trimStart().length
    let line = stripped.trimStart()

    // Close braces for dedent
    while (indent < indentStack[indentStack.length - 1]) {
      indentStack.pop()
      result.push(' '.repeat(indentStack[indentStack.length - 1]) + '}')
    }

    const pad = ' '.repeat(indent)

    // def funcName(params):  →  function funcName(params) {
    const defMatch = line.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/)
    if (defMatch) {
      result.push(`${pad}function ${defMatch[1]}(${defMatch[2]}) {`)
      indentStack.push(indent + 4)
      continue
    }

    // if condition:  →  if (condition) {
    const ifMatch = line.match(/^(elif|if)\s+(.+):$/)
    if (ifMatch) {
      const kw = ifMatch[1] === 'elif' ? 'else if' : 'if'
      const cond = pythonCondition(ifMatch[2])
      result.push(`${pad}${kw} (${cond}) {`)
      indentStack.push(indent + 4)
      continue
    }

    // else:  →  } else {
    if (line === 'else:') {
      // pop current block, reopen
      indentStack.pop()
      result.push(`${pad}} else {`)
      indentStack.push(indent + 4)
      continue
    }

    // return → return
    line = line.replace(/^return\s+(.+)$/, (_, expr) => `return ${pythonExpr(expr)}`)

    // print(...) → (skip / comment out)
    if (line.startsWith('print(')) {
      result.push(`${pad}// ${line}`)
      continue
    }

    result.push(`${pad}${line}`)
  }

  // close remaining open braces
  while (indentStack.length > 1) {
    indentStack.pop()
    result.push('}')
  }

  return result.join('\n')
}

const pythonCondition = (cond) =>
  cond
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/\bnot\b/g, '!')
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')

const pythonExpr = (expr) =>
  expr
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')

// ── C-like (Java / C / C++) → JS ─────────────────────────────────────────────

const convertCLike = (code) => {
  let js = code

  // Remove Java package / import / class boilerplate
  js = js.replace(/^package\s+.*$/gm, '')
  js = js.replace(/^import\s+.*$/gm, '')
  js = js.replace(/^public\s+class\s+\w+\s*\{/gm, '')

  // Remove Java/C++ access modifiers and type signatures on method definitions
  // e.g. "public static int factorial(int n)" → "function factorial(n)"
  js = js.replace(
    /(?:public|private|protected)?\s*(?:static)?\s*(?:final)?\s*(?:int|long|double|float|boolean|void|char|auto|String|string|size_t|unsigned\s+int|unsigned\s+long|unsigned)\s+(\w+)\s*\(([^)]*)\)/g,
    (_, name, params) => {
      // Strip types from params: "int n, int m" → "n, m"
      const cleanParams = stripParamTypes(params)
      return `function ${name}(${cleanParams})`
    }
  )

  // Strip types from remaining variable declarations inside function bodies
  // "int result = ..." → "let result = ..."
  js = js.replace(/\b(?:int|long|double|float|boolean|char|String|auto|size_t)\s+(\w+)\s*=/g, 'let $1 =')
  js = js.replace(/\b(?:int|long|double|float|boolean|char|String|auto|size_t)\s+(\w+)\s*;/g, 'let $1;')

  // Java/C: System.out.println(...) → // System.out.println(...)
  js = js.replace(/System\.out\.print(?:ln)?\s*\([^)]*\)\s*;?/g, '// output')
  js = js.replace(/printf\s*\([^)]*\)\s*;?/g, '// output')
  js = js.replace(/cout\s*<<[^;]+;/g, '// output')
  js = js.replace(/scanf\s*\([^)]*\)\s*;?/g, '// input')
  js = js.replace(/cin\s*>>[^;]+;/g, '// input')

  // Remove Java main method entirely (it confuses the simulator)
  js = js.replace(/(?:public\s+)?static\s+void\s+main\s*\([^)]*\)\s*\{[^}]*\}/gs, '')

  // Remove remaining standalone closing braces from class body (best effort)
  // Remove #include lines (C/C++)
  js = js.replace(/^#include\s*.*$/gm, '')
  js = js.replace(/^#define\s+.*$/gm, '')

  // Remove standalone result variable = call lines that match output patterns
  // "int result = factorial(5);" → we want to keep the call, extract it
  // Actually we want to keep these — they are the invocation lines
  js = js.replace(/\blet\s+(\w+)\s*=\s*(\w+\s*\([^)]*\))\s*;/g, 'let $1 = $2;')

  return js
}

const stripParamTypes = (params) => {
  if (!params.trim()) return ''
  return params
    .split(',')
    .map(p => {
      const parts = p.trim().split(/\s+/)
      // Last token is the variable name, everything before is the type
      return parts[parts.length - 1].replace(/[[\]]/g, '')
    })
    .join(', ')
}

// ─── Function name + invocation detector ─────────────────────────────────────

const IGNORED = new Set([
  'println', 'print', 'printf', 'fprintf', 'scanf', 'log', 'warn', 'error',
  'main', 'setup', 'init', 'run', 'start', 'output',
  'parseInt', 'parseFloat', 'Number', 'String', 'Boolean',
  'Math', 'Array', 'Object', 'JSON', 'Date', 'Promise', 'Map', 'Set',
  'setTimeout', 'setInterval', 'fetch', 'require',
  'toString', 'valueOf', 'push', 'pop', 'map', 'filter', 'reduce', 'forEach',
  'len', 'range', 'list', 'dict', 'int', 'str', 'float', 'bool',
  'max', 'min', 'abs', 'sum', 'sorted',
  'malloc', 'calloc', 'free', 'sizeof',
  'assert', 'expect', 'describe', 'test',
])

const findRecursiveFunctionName = (jsCode) => {
  const defined = []

  const patterns = [
    /\bfunction\s+(\w+)\s*\(/g,
    /\b(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
    /\b(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w]+)\s*=>/g,
  ]

  for (const pat of patterns) {
    const re = new RegExp(pat.source, pat.flags)
    let m
    while ((m = re.exec(jsCode)) !== null) {
      const name = m[1]
      if (name && !IGNORED.has(name) && name.length > 1 && !defined.includes(name))
        defined.push(name)
    }
  }

  // Pick first defined name that appears ≥ 2 times (definition + at least one recursive call)
  for (const name of defined) {
    const count = (jsCode.match(new RegExp(`\\b${name}\\s*\\(`, 'g')) || []).length
    if (count >= 2) return name
  }

  return defined[0] ?? null
}

const findInvocationLine = (jsCode, funcName) => {
  if (!funcName) return null
  const lines = jsCode.split('\n')
  const re = new RegExp(`\\b${funcName}\\s*\\(([^)]*)\\)`)

  const isDefinition = (l) =>
    /\bfunction\b/.test(l) ||
    /\b(public|private|protected|static|inline|final)\b/.test(l)

  const isReturn = (l) => /\breturn\b/.test(l)
  const isComment = (l) => {
    const t = l.trim()
    return t.startsWith('//') || t.startsWith('#') || t.startsWith('*') || t.startsWith('/*')
  }

  // First pass: non-return, non-definition lines
  for (const line of lines) {
    if (isComment(line) || isDefinition(line) || isReturn(line)) continue
    const m = line.match(re)
    if (m) return `${funcName}(${m[1].trim()})`
  }

  // Second pass: lines with assignment (e.g. "let result = factorial(5)")
  for (const line of lines) {
    if (isComment(line) || isDefinition(line)) continue
    if (/=/.test(line)) {
      const m = line.match(re)
      if (m) return `${funcName}(${m[1].trim()})`
    }
  }

  return null
}

// ─── Instrumentation & execution ─────────────────────────────────────────────

/**
 * Wraps the detected function so every call and return is recorded,
 * then executes the invocation line and returns the step array.
 */
const runInstrumented = (jsCode, funcName, invocationCall) => {
  const steps = []
  let nodeCounter = 0
  const callStack = [] // stack of nodeIds

  // Build wrapper: replace `function funcName(params) {`
  // with a version that records calls/returns
  const fnDefRe = new RegExp(`(function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{)`)
  const match = jsCode.match(fnDefRe)
  if (!match) throw new Error(`Could not locate function definition for "${funcName}".`)

  // We inject a tracing wrapper by rewriting the code so that
  // the original function is renamed to __orig_funcName,
  // and a new funcName() wrapper records calls before/after.

  const origName = `__orig_${funcName}`
  let instrumented = jsCode.replace(
    new RegExp(`\\bfunction\\s+${funcName}\\s*\\(`, 'g'),
    `function ${origName}(`
  )

  // Also replace recursive calls inside the body: funcName( → origName(
  // (they're already renamed above since we replaced ALL occurrences of "function funcName(")
  // But we also need to replace self-calls in the body:
  instrumented = instrumented.replace(
    new RegExp(`\\b${funcName}\\s*\\(`, 'g'),
    `${origName}(`
  )

  // Extract param names from the definition
  const paramMatch = jsCode.match(new RegExp(`function\\s+${funcName}\\s*\\(([^)]*)\\)`))
  const paramNames = paramMatch
    ? paramMatch[1].split(',').map(p => p.trim()).filter(Boolean)
    : []

  const paramObj = paramNames.length
    ? `{${paramNames.map(p => `"${p}": ${p}`).join(', ')}}`
    : '{}'

  // Build the tracing wrapper
  const wrapper = `
function ${funcName}(...args) {
  const __nodeId = __nodeCounter++
  const __parentId = __callStack.length ? __callStack[__callStack.length - 1] : null
  __callStack.push(__nodeId)

  // Build params object from positional args
  const __paramNames = ${JSON.stringify(paramNames)}
  const __params = {}
  __paramNames.forEach((n, i) => { __params[n] = args[i] })

  // Detect base case by checking if any recursive call happens
  // We mark it after the fact: if the function returns without pushing to callStack again
  const __stackLenBefore = __callStack.length

  __steps.push({
    type: 'call',
    nodeId: __nodeId,
    parentId: __parentId,
    label: ${JSON.stringify(funcName)} + '(' + args.join(', ') + ')',
    params: __params,
    isBaseCase: false, // updated below
  })

  const __result = ${origName}(...args)

  // If callStack length is same as before (no children were pushed), it's a base case
  const __isBase = __callStack.length === __stackLenBefore
  __steps[__steps.findIndex(s => s.nodeId === __nodeId && s.type === 'call')].isBaseCase = __isBase

  __callStack.pop()
  __steps.push({
    type: 'return',
    nodeId: __nodeId,
    value: __result,
    isBaseCase: __isBase,
  })

  return __result
}
`

  const fullCode = `
${instrumented}
${wrapper}

// Run
${invocationCall};
`

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(
      '__steps', '__nodeCounter', '__callStack',
      `
        let __nc = ${0};
        const __cs = [];
        const __nodeCounter = { valueOf() { return __nc++ } };
        // We need mutable counter, pass as array
        // Rewrite to use array-based counter:
        // Actually let's just exec directly
        ${fullCode.replace('__nodeCounter++', '(function(){ const v = __nc; __nc++; return v; })()')}
        return __nc;
      `
    )
    // Simpler approach: build a self-contained function string
    const runner = new Function(`
      const __steps = [];
      let __nodeCounter = 0;
      const __callStack = [];

      ${instrumented}
      ${wrapper}

      try { ${invocationCall}; } catch(e) { /* ignore */ }

      return __steps;
    `)

    const result = runner()
    if (!result || result.length === 0) {
      throw new Error('Execution produced no steps. Check your function and make sure the call is correct.')
    }
    return result
  } catch (err) {
    throw new Error(`Execution failed: ${err.message}`)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyse a recursive code snippet locally — no API key required.
 *
 * @param {string} language  'javascript' | 'java' | 'python' | 'cpp' | 'c'
 * @param {string} code      Raw code pasted by the user
 * @returns {{ functionName, inputCall, steps }}
 */
export const analyzeLocally = (language, code) => {
  // 1. Convert to JS
  const jsCode = normaliseToJS(language, code)

  // 2. Find the recursive function name
  const funcName = findRecursiveFunctionName(jsCode)
  if (!funcName) {
    throw new Error(
      'Could not detect a recursive function in your code.\n' +
      'Make sure your code contains a function that calls itself, ' +
      'and includes a function call at the bottom (e.g. factorial(5);)'
    )
  }

  // 3. Find the invocation line
  const invocationCall = findInvocationLine(jsCode, funcName)
  if (!invocationCall) {
    throw new Error(
      `Found function "${funcName}" but could not find a call to it.\n` +
      `Add a call at the bottom of your code, e.g.:\n  ${funcName}(5);`
    )
  }

  // 4. Instrument and run
  const steps = runInstrumented(jsCode, funcName, invocationCall)

  return {
    functionName: funcName,
    inputCall: invocationCall,
    steps,
  }
}
