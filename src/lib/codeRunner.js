/**
 * codeRunner.js
 *
 * Runs recursive code LOCALLY in the browser — no API key needed.
 * Supports: JavaScript (full execution), Java / C / C++ / Python (transpile → JS → execute)
 *
 * How it works:
 *   1. Transpile non-JS languages to equivalent JavaScript
 *   2. Instrument the recursive function to record every call + return
 *   3. Execute in a sandboxed Function() context
 *   4. Return the steps[] array that RecursionVisualizer uses
 */

// ─── Language transpilers ─────────────────────────────────────────────────────

/**
 * Java / C / C++  →  JavaScript
 * Handles common recursive patterns.
 */
function transpileCStyle(code) {
  let r = code

  // STEP 1: Remove non-code elements
  r = r.replace(/#\s*include\s*[<"][^"'>\n]*[>"]\s*/g, '')
  r = r.replace(/#\s*define\s+[^\n]*/g, '')
  r = r.replace(/#\s*pragma\s+[^\n]*/g, '')
  r = r.replace(/\/\/.*$/gm, '')  // Remove single-line comments
  r = r.replace(/\/\*[\s\S]*?\*\//g, '')  // Remove multi-line comments

  // STEP 2: Remove class/interface wrappers
  r = r.replace(/(?:public\s+)?(?:class|interface|struct)\s+\w+(?:\s*implements\s+[^{]*)?(?:\s*extends\s+[^{]*)?\s*\{/g, '')
  // If we stripped an outer wrapper `{` (class/interface), we may now have extra
  // trailing `}`. Remove ONLY the number of trailing braces needed to balance.
  // IMPORTANT: never remove interior braces (they may close methods/ifs/loops).
  {
    const opens = (r.match(/\{/g) || []).length
    const closes = (r.match(/\}/g) || []).length
    let extraTrailing = Math.max(0, closes - opens)
    while (extraTrailing > 0 && /\}\s*$/.test(r)) {
      r = r.replace(/\}\s*$/, '')
      extraTrailing--
    }
  }

  // STEP 3: Remove access modifiers and qualifiers
  r = r.replace(/\b(public|private|protected)\s*:/g, '')  // C++ style
  r = r.replace(/\b(public|private|protected|static|final|synchronized|volatile|transient|inline|virtual|override|explicit|constexpr)\s+/g, ' ')

  // STEP 4: Handle method signatures - convert "Type funcName(" → "function funcName("
  // This is critical - must match various Java patterns
  r = r.replace(
    /\b(int|long\s+long|long|double|float|boolean|bool|char|void|auto|size_t|unsigned(?:\s+int)?|unsigned\s+long|String|string)\s+([A-Za-z_]\w*)\s*\(/g,
    'function $2('
  )

  // STEP 5: Clean up function parameters - remove types from inside parentheses
  r = r.replace(/function\s+(\w+)\s*\(([^)]*)\)/g, (match, funcName, params) => {
    const cleanedParams = params
      .split(',')
      .map(p => {
        // Remove all type annotations and keep just the param name
        let cleaned = p.trim()
        // Remove type keywords
        cleaned = cleaned.replace(/\b(int|long|double|float|boolean|bool|char|void|auto|size_t|unsigned|String|string)\s*(?:\[\]\s*)*\b/g, '').trim()
        // Remove array brackets
        cleaned = cleaned.replace(/\[\s*\]/g, '').trim()
        // Remove default values and just keep name
        cleaned = cleaned.split('=')[0].trim()
        return cleaned
      })
      .filter(p => p.length > 0 && p !== ',' && !/^\s*$/.test(p))
      .join(', ')
    return `function ${funcName}(${cleanedParams})`
  })

  // STEP 6: Handle variable declarations
  // Type[] varName = value; → var varName = value;  (MUST BE FIRST to avoid partial match)
  r = r.replace(
    /\b(int|long|double|float|boolean|bool|char|void|auto|size_t|unsigned|String|string)\s*\[\s*\]\s+([A-Za-z_]\w*)\s*=/g,
    'var $2 ='
  )
  // Type varName[] = value; → var varName = value;
  // (Java: int nums[] = {1,2,3};)
  r = r.replace(
    /\b(int|long|double|float|boolean|bool|char|String|string|auto|size_t|unsigned(?:\s+int)?|unsigned\s+long)\s+([A-Za-z_]\w*)\s*\[\s*\]\s*=/g,
    'var $2 ='
  )
  // Type[] varName; → var varName;
  r = r.replace(
    /\b(int|long|double|float|boolean|bool|char|void|auto|size_t|unsigned|String|string)\s*\[\s*\]\s+([A-Za-z_]\w*)\s*;/g,
    'var $2;'
  )
  // Type varName[]; → var varName;
  r = r.replace(
    /\b(int|long|double|float|boolean|bool|char|String|string|auto|size_t|unsigned(?:\s+int)?|unsigned\s+long)\s+([A-Za-z_]\w*)\s*\[\s*\]\s*;/g,
    'var $2;'
  )
  // Type varName = value; → var varName = value;
  r = r.replace(
    /\b(int|long|double|float|boolean|bool|char|void|auto|size_t|unsigned|String|string)\s+([A-Za-z_]\w*)\s*=/g,
    'var $2 ='
  )
  // Type varName; → var varName;
  r = r.replace(
    /\b(int|long|double|float|boolean|bool|char|void|auto|size_t|unsigned|String|string)\s+([A-Za-z_]\w*)\s*;/g,
    'var $2;'
  )

  // STEP 7: Handle for loops with type declarations
  r = r.replace(/\bfor\s*\(\s*(int|long|double|float|boolean|bool|char|auto|size_t|unsigned)\s+(\w+)\s*=/g, 'for (var $2 =')

  // STEP 8: Remove type casts: (int), (double), etc.
  r = r.replace(/\(\s*(int|long|double|float|char|unsigned)\s*\)\s*/g, '')

  // STEP 9: Handle new String() and other constructors
  r = r.replace(/\bnew\s+String\s*\(\s*([^)]+)\s*\)/g, (match, arg) => {
    return `(Array.isArray(${arg}) ? ${arg}.join("") : String(${arg}))`
  })
  r = r.replace(/\bnew\s+(int|double|float|long|bool)\b/g, '')

  // STEP 10: Java String methods → JS equivalents
  r = r.replace(/\.length\s*\(\s*\)/g, '.length')
  r = r.replace(/\.toCharArray\s*\(\s*\)/g, '.split("")')
  r = r.replace(/\.toUpperCase\s*\(\s*\)/g, '.toUpperCase()')
  r = r.replace(/\.toLowerCase\s*\(\s*\)/g, '.toLowerCase()')

  // STEP 11: Java I/O
  r = r.replace(/System\.out\.println\s*\(/g, 'console.log(')
  r = r.replace(/System\.out\.print\s*\(/g, 'console.log(')
  r = r.replace(/System\.in[^;]*;/g, '')
  r = r.replace(/Scanner\s+\w+\s*=.*?;/g, '')

  // STEP 12: Java keywords
  r = r.replace(/\btrue\b/g, 'true')
  r = r.replace(/\bfalse\b/g, 'false')
  r = r.replace(/\bnull\b/g, 'null')
  r = r.replace(/\bnullptr\b/g, 'null')

  // STEP 12b: Convert array literal initializers: = {1, 2, 3}  →  = [1, 2, 3]
  // This is common in Java recursion examples (permutations, subsets, etc.).
  r = r.replace(/=\s*\{([^}]*)\}\s*;/g, '= [$1];')

  // STEP 12b-2: Convert Java anonymous arrays: new int[]{1,2,3} → [1,2,3]
  // Also handles: new int[] { ... } (with optional spaces)
  r = r.replace(/new\s+\w+\s*\[\s*\]\s*\{\s*([^}]*)\s*\}/g, '[$1]')
  // If earlier passes stripped the element type (e.g. `new int[]` → `[]`), recover it:
  // `[]{1,2,3}` → `[1,2,3]`
  r = r.replace(/\[\s*\]\s*\{\s*([^}]*)\s*\}/g, '[$1]')

  // STEP 12c: Remove stray top-level closing braces that may remain after wrapper stripping.
  // We keep braces that close real blocks (depth > 0), but drop any `}` at depth==0.
  {
    let depth = 0
    let out = ''
    for (let i = 0; i < r.length; i++) {
      const ch = r[i]
      if (ch === '{') {
        depth++
        out += ch
      } else if (ch === '}') {
        if (depth === 0) continue
        depth--
        out += ch
      } else {
        out += ch
      }
    }
    r = out
  }

  // STEP 13: Final cleanup - aggressive semicolon and syntax fixing
  // Remove semicolons after closing braces
  r = r.replace(/}\s*;/g, '}')
  // Fix double semicolons
  r = r.replace(/;;+/g, ';')
  // Remove empty statements and lines with only ;
  r = r.replace(/^\s*;\s*$/gm, '')
  // Remove stray semicolons and clean up
  r = r.replace(/\s*;\s*;/g, ';')
  // Clean up multiple spaces
  r = r.replace(/\s{2,}/g, ' ')
  // Clean up newlines
  r = r.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n')

  return r
}

/**
 * Python  →  JavaScript
 * Converts indentation-based blocks to {} blocks.
 */
function transpilePython(code) {
  const rawLines = code.split('\n')
  const out = []
  // Stack of indentation levels that opened a block
  const indentStack = [-1]

  const toJS = (expr) =>
    expr
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\s+/g, '!')
      .replace(/\blen\s*\(/g, '__len(')   // handle later
      .replace(/\bprint\s*\(/g, 'console.log(')

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i]
    const trimmed = raw.trimStart()
    if (!trimmed || trimmed.startsWith('#')) continue

    const indent = raw.length - trimmed.length

    // Close blocks when we dedent
    while (indent <= indentStack[indentStack.length - 1]) {
      indentStack.pop()
      out.push(' '.repeat(indentStack[indentStack.length - 1] + 1) + '}')
    }

    const pad = ' '.repeat(indent)

    // def funcname(params):
    if (/^def\s/.test(trimmed)) {
      const m = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/)
      if (m) {
        out.push(`${pad}function ${m[1]}(${m[2]}) {`)
        indentStack.push(indent)
        continue
      }
    }

    // if / elif / else
    if (/^if\s/.test(trimmed)) {
      const cond = toJS(trimmed.replace(/^if\s+(.+)\s*:\s*$/, '$1'))
      out.push(`${pad}if (${cond}) {`)
      indentStack.push(indent)
      continue
    }
    if (/^elif\s/.test(trimmed)) {
      // close previous if/elif block first
      if (indent <= indentStack[indentStack.length - 1]) {
        indentStack.pop()
        out.push(' '.repeat(indent) + '} else if (' + toJS(trimmed.replace(/^elif\s+(.+)\s*:\s*$/, '$1')) + ') {')
      } else {
        out.push(`${pad}} else if (${toJS(trimmed.replace(/^elif\s+(.+)\s*:\s*$/, '$1'))}) {`)
      }
      indentStack.push(indent)
      continue
    }
    if (/^else\s*:/.test(trimmed)) {
      out.push(`${pad}} else {`)
      indentStack.push(indent)
      continue
    }

    // return
    if (/^return\b/.test(trimmed)) {
      const val = toJS(trimmed.replace(/^return\s*/, '').replace(/\s*$/, ''))
      out.push(`${pad}return ${val};`)
      continue
    }

    // plain statement
    let stmt = toJS(trimmed)
    if (!stmt.endsWith(';') && !stmt.endsWith('{') && !stmt.endsWith('}')) stmt += ';'
    out.push(pad + stmt)
  }

  // Close any remaining open blocks
  while (indentStack.length > 1) {
    indentStack.pop()
    out.push('}')
  }

  // Add a tiny helper for Python len()
  out.unshift('function __len(a) { return a === null ? 0 : (a.length !== undefined ? a.length : 0); }')

  return out.join('\n')
}

function transpileToJS(code, language) {
  switch (language) {
    case 'javascript': return code
    case 'python':     return transpilePython(code)
    case 'java':
    case 'cpp':
    case 'c':          return transpileCStyle(code)
    default:           return code
  }
}

// Debug helper (safe to keep): lets us inspect transpiled output during development.
export function debugTranspileToJS(code, language) {
  return transpileToJS(code, language)
}

// ─── Detect recursive function name ──────────────────────────────────────────

const IGNORED = new Set([
  'println','print','printf','fprintf','sprintf','scanf','log','warn','error',
  'console','System','out','err','main','Main','setup','init','run','start',
  'Math','parseInt','parseFloat','Number','String','Boolean','Array','Object',
  'JSON','Date','Promise','Map','Set','setTimeout','setInterval','fetch',
  'assert','expect','describe','it','test','len','range','list','dict','tuple',
  '__len','sorted','reversed','enumerate','zip',
  'malloc','calloc','free','sizeof','memcpy','memset','strcmp','strcpy',
  // Note: 'sum', 'max', 'min', 'abs' removed — these are legitimate user function names
])

function getDefinedFunctionNames(jsCode) {
  const names = []
  const patterns = [
    /\bfunction\s+([A-Za-z_]\w*)\s*\(/g,
    /\b(?:const|let|var)\s+([A-Za-z_]\w*)\s*=\s*(?:async\s*)?\(/g,
    /\b(?:const|let|var)\s+([A-Za-z_]\w*)\s*=\s*(?:async\s*)?function\b/g,
  ]

  for (const pat of patterns) {
    const re = new RegExp(pat.source, 'g')
    let m
    while ((m = re.exec(jsCode)) !== null) {
      const n = m[1]
      if (n && !IGNORED.has(n) && n.length > 1 && !names.includes(n)) names.push(n)
    }
  }

  return names
}

// ─── Detect invocation (the "test call" line, e.g. factorial(5)) ─────────────

function detectInvocation(jsCode, definedNames) {
  const lines = jsCode.split('\n')
  
  const isIgnorableLine = (t) => {
    if (!t) return true
    if (t.startsWith('//') || t.startsWith('#') || t.startsWith('*') || t.startsWith('/*')) return true
    if (/\breturn\b/.test(t)) return true
    // skip definition-ish lines
    if (/\bfunction\b/.test(t)) return true
    if (/\b(public|private|protected|static|inline|final)\b/.test(t) && /\w+\s*\(/.test(t)) return true
    return false
  }

  const findCallInText = (text) => {
    for (const name of definedNames) {
      const reg = new RegExp(`\\b${name}\\s*\\(([^)]*)\\)`)
      const m = text.match(reg)
      if (m) return { name, invocation: `${name}(${m[1].trim()})` }
    }
    return null
  }

  // Prefer the LAST top-level call-looking line to a defined function.
  for (let i = lines.length - 1; i >= 0; i--) {
    const t = lines[i].trim()
    if (isIgnorableLine(t)) continue
    const found = findCallInText(t)
    if (found) return found
  }

  // Fallback: search entire code and pick last match position
  let best = null
  for (const name of definedNames) {
    const reg = new RegExp(`\\b${name}\\s*\\(([^)]*)\\)`, 'g')
    let m
    while ((m = reg.exec(jsCode)) !== null) {
      best = { name, invocation: `${name}(${(m[1] ?? '').trim()})`, idx: m.index }
    }
  }
  if (best) return { name: best.name, invocation: best.invocation }
  return null
}

// ─── Get parameter names from function source ─────────────────────────────────

function getParamNames(jsCode, funcName) {
  const patterns = [
    new RegExp(`function\\s+${funcName}\\s*\\(([^)]*)\\)`),
    new RegExp(`(?:const|let|var)\\s+${funcName}\\s*=\\s*(?:async\\s*)?\\(([^)]*)\\)`),
    new RegExp(`(?:const|let|var)\\s+${funcName}\\s*=\\s*(?:async\\s*)?function\\s*\\(([^)]*)\\)`),
  ]
  for (const pat of patterns) {
    const m = jsCode.match(pat)
    if (m) return m[1].split(',').map(p => p.trim().replace(/\s*=.*/, '')).filter(Boolean)
  }
  return []
}

// ─── Core: instrument + execute ───────────────────────────────────────────────

function executeWithTracing(jsCode, definedNames, entry) {
  const steps = []
  let nodeId = 0
  const stack = []

  // Normalise const/let → var so we can reassign after definition
  let normalized = jsCode
    .replace(/\bconst\s+([A-Za-z_]\w*)\s*=/g, 'var $1 =')
    .replace(/\blet\s+([A-Za-z_]\w*)\s*=/g, 'var $1 =')

  // Remove top-level entry invocations that might reference removed wrappers
  // (e.g. `Solution.permute(nums, 0);` after transpiling `Solution { ... }` away).
  // We only remove calls when we're at brace-depth 0, so we don't touch recursive calls inside functions.
  const removeTopLevelFunctionCalls = (text) => {
    const namesAlt = definedNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
    const callLineRe = new RegExp(
      `^\\s*(?:[A-Za-z_]\\w*\\s*\\.\\s*)?(?:${namesAlt})\\s*\\([^;]*\\)\\s*;?\\s*$`
    )

    const lines = text.split('\n')
    let depth = 0
    const out = []
    for (const line of lines) {
      const trimmed = line.trim()

      // If at top-level and line is just a call expression to one of our functions, drop it.
      if (depth === 0 && callLineRe.test(trimmed)) {
        continue
      }

      out.push(line)

      // Update brace depth (best-effort; user snippets are simple).
      for (const ch of line) {
        if (ch === '{') depth++
        else if (ch === '}') depth = Math.max(0, depth - 1)
      }
    }
    return out.join('\n')
  }

  normalized = removeTopLevelFunctionCalls(normalized)

  const paramNamesByFunc = new Map()
  for (const n of definedNames) paramNamesByFunc.set(n, getParamNames(normalized, n))

  const makeTraced = (fnName, fn) => {
    const pnames = paramNamesByFunc.get(fnName) ?? []
    return function (...args) {
      const id = nodeId++
      const parentId = stack.length ? stack[stack.length - 1] : null
      const label = `${fnName}(${args.map(a => {
        if (Array.isArray(a)) return '[' + a.join(',') + ']'
        return JSON.stringify(a)
      }).join(', ')})`

      const params = {}
      pnames.forEach((name, i) => { if (args[i] !== undefined) params[name] = args[i] })
      if (pnames.length === 0) args.forEach((a, i) => { params[`arg${i}`] = a })

      stack.push(id)
      const callIdx = steps.length
      steps.push({ type: 'call', nodeId: id, parentId, label, params, isBaseCase: false })

      const result = fn.apply(this, args)

      stack.pop()

      // Base case = no direct child calls while this frame was active
      const hasDirectChild = steps.slice(callIdx + 1).some(s => s.type === 'call' && s.parentId === id)
      if (!hasDirectChild) steps[callIdx].isBaseCase = true

      steps.push({ type: 'return', nodeId: id, value: result, isBaseCase: !hasDirectChild })
      return result
    }
  }

  // Guard against infinite recursion
  const MAX_CALLS = 500
  const guardedTrace = (name, fn) => {
    const traced = makeTraced(name, fn)
    return function (...args) {
      if (nodeId > MAX_CALLS) throw new Error(`Recursion exceeded ${MAX_CALLS} calls. Try a smaller input value.`)
      return traced.apply(this, args)
    }
  }

  try {
    const tracedAssignments = definedNames
      .map((n) => `${n} = __trace(${JSON.stringify(n)}, ${n});`)
      .join('\n')

    const sandboxCode = `
      ${normalized}
      ${tracedAssignments}
      return (${entry.invocation});
    `

    // We pass __trace (our factory) and console.log into the sandbox
    // eslint-disable-next-line no-new-func
    new Function('__trace', 'console', sandboxCode)(guardedTrace, {
      log: () => {},
      warn: () => {},
      error: () => {},
    })

    if (steps.length === 0) {
      throw new Error(`No execution steps were recorded. Make sure your code ends with a function call (e.g. ${entry.name}(5);) and that it actually runs.`)
    }

    return steps
  } catch (e) {
    // Re-throw with cleaner message
    const msg = e.message || String(e)
    
    // Specific error detection with helpful hints
    if (msg.includes('Unexpected token') || msg.includes('SyntaxError')) {
      throw new Error(
        `Syntax Error in transpiled code: ${msg}\n\n` +
        `Make sure your Java code includes:\n` +
        `  ✓ Base case (if statement that stops recursion)\n` +
        `  ✓ Recursive call (function calling itself with modified parameters)\n` +
        `  ✓ Function call at the end (e.g., factorial(5);)\n\n` +
        `Avoid:\n` +
        `  ✗ Class wrappers\n` +
        `  ✗ Package/import statements\n` +
        `  ✗ Multiple independent helper functions\n` +
        `  ✗ Main method\n\n` +
        `Type annotations (int, String[], etc.) are automatically removed.`
      )
    }
    
    if (msg.includes('is not a function') || msg.includes('is not defined')) {
      throw new Error(
        `Could not execute function "${entry.name}".\n\n` +
        `The function may not be properly defined or called.\n\n` +
        `Check:\n` +
        `  ✓ Function name is spelled consistently\n` +
        `  ✓ Base case prevents infinite recursion\n` +
        `  ✓ Recursive call uses correct function name\n` +
        `  ✓ Function call at end uses correct syntax\n\n` +
        `Detail: ${msg}`
      )
    }
    throw new Error(msg)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run recursive code locally and return steps[].
 * No API key required.
 *
 * @param {string} code      - Source code pasted by the user
 * @param {string} language  - 'javascript' | 'java' | 'python' | 'cpp' | 'c'
 * @returns {{ steps, funcName, invocation }}
 */
export function runCodeLocally(code, language) {
  // 1. Transpile to JavaScript
  const jsCode = transpileToJS(code, language)

  // 2. Detect defined functions
  const definedNames = getDefinedFunctionNames(jsCode)
  if (!definedNames.length) {
    throw new Error(
      'Could not detect the recursive function name.\n' +
      'Make sure your code contains a function definition and a call to it, e.g.:\n\n' +
      '  function factorial(n) { ... }\n  factorial(5);'
    )
  }

  // 3. Detect the invocation call (entry point)
  const entry = detectInvocation(jsCode, definedNames)
  if (!entry?.invocation || !entry?.name) {
    throw new Error(
      `A function was found, but no top-level call was detected.\n` +
      `Add a line at the end calling your function with input, e.g.:\n\n  ${definedNames[0]}(5);`
    )
  }

  // 4. Execute with tracing
  const steps = executeWithTracing(jsCode, definedNames, entry)

  return { steps, funcName: entry.name, invocation: entry.invocation }
}
