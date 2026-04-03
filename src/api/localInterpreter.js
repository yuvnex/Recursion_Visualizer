/**
 * localInterpreter.js
 *
 * Runs recursive code ENTIRELY IN THE BROWSER — no API key needed.
 *
 * Strategy:
 *  1. Detect the language, function name, and input call from pasted code.
 *  2. Convert non-JS languages to equivalent JavaScript using regex transpilation.
 *  3. Wrap the function with call/return tracking instrumentation.
 *  4. Execute via new Function() in a sandboxed scope.
 *  5. Return the steps array in the same format RecursionVisualizer expects.
 *
 * Supports: JavaScript, Java, Python, C, C++
 * Works for any recursive function — not just built-in examples.
 */

// ─── Safety limits ────────────────────────────────────────────────────────────
const MAX_CALLS = 500   // prevent infinite recursion
const MAX_DEPTH = 50    // prevent stack overflow

// ─── Step tracker (shared mutable state during one execution run) ──────────
let _steps = []
let _nodeCounter = 0
let _callCount = 0
const _stackIds = []   // maps depth → current nodeId

const resetTracker = () => {
  _steps = []
  _nodeCounter = 0
  _callCount = 0
  _stackIds.length = 0
}

// ─── 1. Detect recursive function name ───────────────────────────────────────

const IGNORED = new Set([
  'println','print','printf','fprintf','sprintf','scanf','System','out','err',
  'console','log','warn','error','main','Main','setup','init','run','start',
  'Math','parseInt','parseFloat','Number','String','Boolean','Array','Object',
  'JSON','Date','Promise','Map','Set','setTimeout','setInterval','fetch',
  'toString','valueOf','keys','values','entries','push','pop','shift',
  'unshift','splice','slice','map','filter','reduce','forEach','find',
  'includes','len','range','list','dict','tuple','abs','sum','sorted',
  'max','min','type','isinstance','open','read','write','close','append',
  'malloc','calloc','free','sizeof','memcpy','strlen','strcmp','strcpy',
  'floor','ceil','round','pow','sqrt','assert','expect',
])

const findFunctionName = (code) => {
  const patterns = [
    /\bfunction\s+(\w+)\s*\(/g,
    /\bdef\s+(\w+)\s*\(/g,
    /(?:public|private|protected|static)\s+(?:static\s+)?(?:\w+\s+)(\w+)\s*\(/g,
    /\b(?:int|long|double|float|void|boolean|char|auto|String)\s+(\w+)\s*\(/g,
    /\b(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
  ]

  const candidates = []
  for (const pat of patterns) {
    const re = new RegExp(pat.source, 'g')
    let m
    while ((m = re.exec(code)) !== null) {
      const name = m[1]
      if (name && !IGNORED.has(name) && name.length > 1 && !candidates.includes(name)) {
        candidates.push(name)
      }
    }
  }

  // Pick the first candidate that calls itself (recursive)
  for (const name of candidates) {
    const count = (code.match(new RegExp(`\\b${name}\\s*\\(`, 'g')) || []).length
    if (count >= 2) return name
  }

  return candidates[0] ?? null
}

// ─── 2. Find the input call ───────────────────────────────────────────────────

const findInputCall = (code, funcName) => {
  if (!funcName) return null

  const lines = code.split('\n')
  const isDefinition = (l) =>
    /\b(function|def)\b/.test(l) ||
    /\b(public|private|protected|static|inline|final)\b/.test(l) ||
    /\b(int|long|double|float|void|boolean|char|auto|String)\s+\w+\s*\(/.test(l)
  const isReturn = (l) => /\breturn\b/.test(l)
  const isComment = (l) => { const t = l.trim(); return t.startsWith('//') || t.startsWith('#') || t.startsWith('*') || t.startsWith('/*') }

  const re = new RegExp(`\\b${funcName}\\s*\\(([^)]{0,200})\\)`)

  for (const line of lines) {
    if (isComment(line) || isDefinition(line) || isReturn(line)) continue
    const m = line.match(re)
    if (m) return `${funcName}(${m[1].trim()})`
  }
  return null
}

// ─── 3. Extract function parameters ──────────────────────────────────────────

const extractParams = (code, funcName, language) => {
  const patterns = [
    // Java/C/C++:  int factorial(int n, int m)
    new RegExp(`\\b\\w+\\s+${funcName}\\s*\\(([^)]{0,300})\\)`),
    // JS:          function factorial(n, m)
    new RegExp(`function\\s+${funcName}\\s*\\(([^)]{0,300})\\)`),
    // Python:      def factorial(n, m):
    new RegExp(`def\\s+${funcName}\\s*\\(([^)]{0,300})\\)`),
    // arrow:       const factorial = (n, m) =>
    new RegExp(`(?:const|let|var)\\s+${funcName}\\s*=\\s*(?:async\\s*)?\\(([^)]{0,300})\\)`),
  ]

  for (const pat of patterns) {
    const m = code.match(pat)
    if (m) {
      const raw = m[1]
      // strip Java/C type annotations: "int n, int[] arr, boolean flag" → "n, arr, flag"
      const params = raw
        .split(',')
        .map(p => p.trim().split(/\s+/).pop().replace(/[[\]]/g, '').trim())
        .filter(p => p && /^[a-zA-Z_$]/.test(p))
      return params
    }
  }

  return []
}

// ─── 4. Language → JavaScript transpilation ──────────────────────────────────

const transpileToJS = (code, funcName, language) => {
  let js = code

  if (language === 'python') {
    js = transpilePython(js, funcName)
  } else if (['java', 'c', 'cpp'].includes(language)) {
    js = transpileJavaC(js, funcName)
  }

  // Strip anything that is not the function body
  js = isolateFunction(js, funcName, language)
  return js
}

const transpilePython = (code, funcName) => {
  return code
    .split('\n')
    .map(line => {
      const indent = line.match(/^(\s*)/)[1]
      let l = line.trimStart()

      // def funcName(params):  →  function funcName(params) {
      if (new RegExp(`^def\\s+${funcName}\\s*\\(`).test(l)) {
        l = l.replace(/^def\s+/, 'function ').replace(/:$/, ' {')
        return indent + l
      }
      // return expr
      if (/^return\s/.test(l) || l === 'return') return indent + l + ''
      // elif → else if
      l = l.replace(/^elif\s+(.+):$/, 'else if ($1) {')
      // if cond:  →  if (cond) {
      l = l.replace(/^if\s+(.+):$/, 'if ($1) {')
      // else:  →  } else {
      l = l.replace(/^else\s*:$/, '} else {')
      // Python "and"/"or"/"not" → JS
      l = l.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!')
      return indent + l
    })
    .join('\n')
}

const transpileJavaC = (code, funcName) => {
  return code
    .split('\n')
    .map(line => {
      let l = line
      // remove Java/C type declarations in signatures  e.g.  int factorial(int n)
      // → keep only the call pattern: factorial(n)
      l = l.replace(/\b(?:public|private|protected|static|final|inline|virtual|override)\s+/g, '')
      // remove return-type annotation before the function name
      // "int factorial(" → "function factorial("  — only for the definition line
      if (new RegExp(`\\b\\w+(?:\\[\\])*\\s+${funcName}\\s*\\(`).test(l)) {
        l = l.replace(new RegExp(`\\b\\w+(?:\\[\\])*\\s+(${funcName}\\s*\\()`), 'function $1')
      }
      // strip typed parameter annotations: "int n, int[] arr" → "n, arr"
      // inside function definition parentheses only
      l = l.replace(
        new RegExp(`(function\\s+${funcName}\\s*\\()([^)]*)(\\))`),
        (_, open, params, close) => {
          const cleaned = params
            .split(',')
            .map(p => p.trim().split(/\s+/).pop().replace(/[[\]]/g, '').trim())
            .join(', ')
          return open + cleaned + close
        }
      )
      // Java: System.out.println → console.log
      l = l.replace(/System\.out\.println/g, 'console.log')
      l = l.replace(/System\.out\.print\b/g, 'console.log')
      // Java boolean literals
      l = l.replace(/\btrue\b/g, 'true').replace(/\bfalse\b/g, 'false')
      // Java/C variable declarations inside body: "int mid = ..."  → "let mid = ..."
      l = l.replace(/\b(?:int|long|double|float|boolean|char|auto|String|size_t)\s+(\w+)\s*=/g, 'let $1 =')
      // Math.floor() already JS compatible
      return l
    })
    .join('\n')
}

/**
 * Isolate just the function body from the full code snippet.
 * Finds the function definition by brace counting (JS/Java/C/C++)
 * or indentation (Python).
 */
const isolateFunction = (code, funcName, language) => {
  const lines = code.split('\n')

  if (language === 'python') {
    // Python: keep lines from `function funcName(` until indent drops back to 0
    let start = -1
    let baseIndent = -1
    const out = []
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i]
      if (start === -1 && new RegExp(`function\\s+${funcName}\\s*\\(`).test(l)) {
        start = i
        baseIndent = l.match(/^(\s*)/)[1].length
        out.push(l)
        continue
      }
      if (start !== -1) {
        const indent = l.match(/^(\s*)/)[1].length
        if (l.trim() === '') { out.push(l); continue }
        if (indent > baseIndent) { out.push(l) }
        else {
          // close all open blocks with }
          out.push('}')
          break
        }
      }
    }
    // make sure last } is there
    if (out.length && !out[out.length - 1].trim().endsWith('}')) out.push('}')
    return out.join('\n')
  }

  // Brace-counting for JS / Java / C / C++
  let start = -1
  let depth = 0
  const out = []

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (start === -1 && new RegExp(`function\\s+${funcName}\\s*\\(`).test(l)) {
      start = i
    }
    if (start !== -1) {
      out.push(l)
      for (const ch of l) {
        if (ch === '{') depth++
        if (ch === '}') depth--
      }
      if (depth === 0 && out.length > 1) break  // function body complete
    }
  }

  return out.join('\n')
}

// ─── 5. Instrumentation wrapper ───────────────────────────────────────────────

/**
 * Wraps the transpiled JS function so every call/return is recorded.
 * Returns the modified source code as a string.
 */
const instrumentFunction = (jsCode, funcName, paramNames) => {
  const params = paramNames.join(', ')
  const paramsObj = paramNames.length
    ? `{ ${paramNames.map(p => `${p}: ${p}`).join(', ')} }`
    : '{}'

  return `
${jsCode}

const __orig = ${funcName};

function ${funcName}__instrumented(${params}) {
  if (typeof __orig !== 'function') throw new Error('Function ${funcName} not found after transpilation.');
  if (__callCount++ > ${MAX_CALLS}) throw new Error('Too many recursive calls (limit: ${MAX_CALLS}). Check for infinite recursion.');

  const __nodeId   = __nodeCounter++
  const __parentId = __stackIds.length > 0 ? __stackIds[__stackIds.length - 1] : null
  const __depth    = __stackIds.length

  if (__depth >= ${MAX_DEPTH}) throw new Error('Max recursion depth (${MAX_DEPTH}) exceeded.')

  const __label   = '${funcName}(' + [${paramNames.map(p => `String(${p})`).join(', ')}].join(', ') + ')'
  const __isBase  = false  // will be overridden for base-case returns below

  __steps.push({ type: 'call', nodeId: __nodeId, parentId: __parentId, label: __label, params: ${paramsObj}, isBaseCase: false })
  __stackIds.push(__nodeId)

  const __result = __orig.call(this, ${params})

  __stackIds.pop()

  // Mark as base case if it returned without making recursive calls
  const __childrenExist = __steps.some(s => s.type === 'call' && s.parentId === __nodeId)
  if (!__childrenExist) {
    const __callStep = __steps.find(s => s.nodeId === __nodeId && s.type === 'call')
    if (__callStep) __callStep.isBaseCase = true
  }

  __steps.push({ type: 'return', nodeId: __nodeId, value: __result, isBaseCase: !__childrenExist })

  return __result
}
`
}

// ─── 6. Parse the input arguments ────────────────────────────────────────────

/**
 * Parses the invocation string "factorial(5)" → [5]
 * Handles numbers, strings, booleans, arrays like {1,2,3} (Java) or [1,2,3] (JS/Python)
 */
const parseArguments = (inputCall) => {
  const m = inputCall.match(/\w+\s*\((.+)\)\s*;?$/)
  if (!m) return []

  const raw = m[1].trim()
  if (!raw) return []

  // Convert Java/C array literals {1,2,3} → [1,2,3]
  const normalized = raw.replace(/\{([^}]*)\}/g, '[$1]')

  // Safely evaluate the argument list
  try {
    const result = new Function(`return [${normalized}]`)()
    return result
  } catch {
    // Fall back: split by comma and parse each
    return normalized.split(',').map(a => {
      const t = a.trim()
      if (t === 'true') return true
      if (t === 'false') return false
      const n = Number(t)
      if (!isNaN(n)) return n
      return t.replace(/^["']|["']$/g, '')  // strip quotes
    })
  }
}

// ─── 7. Main public API ───────────────────────────────────────────────────────

/**
 * Analyse and execute a pasted recursive function entirely in the browser.
 *
 * @param {string} code      - The pasted source code
 * @param {string} language  - 'javascript' | 'java' | 'python' | 'cpp' | 'c'
 * @returns {{ functionName, inputCall, steps }}
 */
export const interpretLocally = (code, language) => {
  // 1. Detect function name + input call
  const funcName = findFunctionName(code)
  if (!funcName) throw new Error('Could not find a recursive function definition. Make sure your code includes a function definition and a call like factorial(5).')

  const inputCall = findInputCall(code, funcName)
  if (!inputCall) throw new Error(`Found function "${funcName}" but could not find a call to it (e.g. ${funcName}(5)). Add a call at the bottom of your code.`)

  // 2. Transpile to JS
  const jsCode = transpileToJS(code, funcName, language)

  // 3. Extract param names
  const paramNames = extractParams(code, funcName, language)

  // 4. Instrument
  const instrumented = instrumentFunction(jsCode, funcName, paramNames)

  // 5. Parse input arguments
  const args = parseArguments(inputCall)

  // 6. Execute
  resetTracker()

  try {
    const fn = new Function(
      '__steps', '__nodeCounter', '__stackIds', '__callCount',
      // expose setters so the instrumented code can mutate our module-level vars
      '__setNodeCounter', '__setCallCount',
      instrumented + `\nreturn ${funcName}__instrumented;`
    )

    // We need to pass mutable references — use a context object instead
    const ctx = {
      steps: [],
      nodeCounter: 0,
      stackIds: [],
      callCount: 0,
    }

    const wrappedCode = `
${jsCode}

const __orig = ${funcName};

function ${funcName}__tracked(${paramNames.join(', ')}) {
  if (ctx.callCount++ > ${MAX_CALLS}) throw new Error('Too many calls — possible infinite recursion (limit: ${MAX_CALLS}).');

  const nodeId   = ctx.nodeCounter++
  const parentId = ctx.stackIds.length > 0 ? ctx.stackIds[ctx.stackIds.length - 1] : null
  const depth    = ctx.stackIds.length

  if (depth >= ${MAX_DEPTH}) throw new Error('Max recursion depth exceeded (${MAX_DEPTH}).');

  const label = '${funcName}(' + [${paramNames.map(p => `JSON.stringify(${p})`).join(', ')}].join(', ') + ')'

  ctx.steps.push({ type: 'call', nodeId, parentId, label, params: { ${paramNames.map(p => `${p}`).join(', ')} }, isBaseCase: false })
  ctx.stackIds.push(nodeId)

  // Redirect recursive calls to tracked version
  ${funcName} = ${funcName}__tracked;

  const result = __orig(${paramNames.join(', ')})

  ctx.stackIds.pop()

  const hasChildren = ctx.steps.some(s => s.type === 'call' && s.parentId === nodeId)
  const callStep = ctx.steps.find(s => s.nodeId === nodeId && s.type === 'call')
  if (callStep && !hasChildren) callStep.isBaseCase = true

  ctx.steps.push({ type: 'return', nodeId, value: result, isBaseCase: !hasChildren })

  return result
}

return ${funcName}__tracked;
`

    // Build and run
    const trackedFn = new Function('ctx', '__orig_backup', wrappedCode)(ctx, null)

    // Restore the original before running
    const restoreCode = `
${jsCode}
return ${funcName};
`
    const origFn = new Function(restoreCode)()

    // Run again cleanly
    ctx.steps = []
    ctx.nodeCounter = 0
    ctx.stackIds = []
    ctx.callCount = 0

    const finalCode = `
${jsCode}

const __origFunc = ${funcName};

function ${funcName}__run(${paramNames.join(', ')}) {
  if (ctx.callCount++ > ${MAX_CALLS}) throw new Error('Too many calls (limit: ${MAX_CALLS}). Check for infinite recursion.');

  const nodeId   = ctx.nodeCounter++
  const parentId = ctx.stackIds.length > 0 ? ctx.stackIds[ctx.stackIds.length - 1] : null

  if (ctx.stackIds.length >= ${MAX_DEPTH}) throw new Error('Max depth ${MAX_DEPTH} exceeded.');

  const labelArgs = [${paramNames.map(p => `JSON.stringify(${p})`).join(', ')}].join(', ')
  const label = '${funcName}(' + labelArgs + ')'

  ctx.steps.push({ type: 'call', nodeId, parentId, label, params: { ${paramNames.map(p => `"${p}": ${p}`).join(', ')} }, isBaseCase: false })
  ctx.stackIds.push(nodeId)

  ${funcName} = ${funcName}__run;

  const result = __origFunc(${paramNames.join(', ')})

  ctx.stackIds.pop()

  const hasChildren = ctx.steps.some(s => s.type === 'call' && s.parentId === nodeId)
  const callStep = ctx.steps.find(s => s.nodeId === nodeId && s.type === 'call')
  if (callStep && !hasChildren) callStep.isBaseCase = true

  ctx.steps.push({ type: 'return', nodeId, value: result, isBaseCase: !hasChildren })

  return result
}

return function(...args) { return ${funcName}__run(...args); };
`

    const runFn = new Function('ctx', finalCode)(ctx)
    runFn(...args)

    if (ctx.steps.length === 0) throw new Error('Execution produced no steps. Check that your code is syntactically correct.')

    return {
      functionName: funcName,
      inputCall,
      steps: ctx.steps,
    }

  } catch (err) {
    if (err.message.includes('Too many') || err.message.includes('Max depth') || err.message.includes('no steps')) {
      throw err
    }
    throw new Error(
      `Failed to execute "${funcName}": ${err.message}\n\n` +
      `This usually means the code could not be converted to JavaScript automatically.\n` +
      `Try using the JavaScript template or simplify your function.`
    )
  }
}
