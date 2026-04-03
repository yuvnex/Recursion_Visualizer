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
  // Remove closing brace of class at the very end
  r = r.replace(/^}\s*$/m, '')

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
  // Type[] varName; → var varName;
  r = r.replace(
    /\b(int|long|double|float|boolean|bool|char|void|auto|size_t|unsigned|String|string)\s*\[\s*\]\s+([A-Za-z_]\w*)\s*;/g,
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

function detectFuncName(jsCode) {
  const patterns = [
    /\bfunction\s+([A-Za-z_]\w*)\s*\(/g,
    /\b(?:const|let|var)\s+([A-Za-z_]\w*)\s*=\s*(?:async\s*)?\(/g,
    /\b(?:const|let|var)\s+([A-Za-z_]\w*)\s*=\s*(?:async\s*)?function/g,
  ]
  const candidates = []
  for (const pat of patterns) {
    const re = new RegExp(pat.source, 'g')
    let m
    while ((m = re.exec(jsCode)) !== null) {
      const n = m[1]
      if (n && !IGNORED.has(n) && n.length > 1 && !candidates.includes(n)) candidates.push(n)
    }
  }
  // Pick the candidate that appears most (definition + recursive calls)
  let best = null, bestCount = 0
  for (const name of candidates) {
    const count = (jsCode.match(new RegExp(`\\b${name}\\s*\\(`, 'g')) || []).length
    if (count >= 2 && count > bestCount) { best = name; bestCount = count }
  }
  return best ?? candidates[0] ?? null
}

// ─── Detect invocation (the "test call" line, e.g. factorial(5)) ─────────────

function detectInvocation(jsCode, funcName) {
  const lines = jsCode.split('\n')
  const defRe = /\b(function|def)\b|\b(public|private|static|inline)\b|\b(int|double|void|float|bool)\s+\w+\s*\(/
  
  // Helper: find ACTUAL call (with literals/complex args, not just identifiers)
  const findActualCall = (text) => {
    const reg = new RegExp(`\\b${funcName}\\s*\\(([^)]*)\\)`, 'g')  // Changed: [^)]* to match until first )
    let allMatches = []
    let match
    while ((match = reg.exec(text)) !== null) {
      const args = match[1]
      allMatches.push({ args: args.trim(), hasLiteral: /["'\[\(]/.test(args) })
    }
    // Prefer LAST match with literals (actual test call, not recursive calls)
    let lastWithLiteral = null
    for (let i = allMatches.length - 1; i >= 0; i--) {
      if (allMatches[i].hasLiteral) {
        lastWithLiteral = allMatches[i]
        break
      }
    }
    if (lastWithLiteral) return `${funcName}(${lastWithLiteral.args})`
    // Fallback to last match overall (usually the actual call, not definition)
    if (allMatches.length > 0) return `${funcName}(${allMatches[allMatches.length - 1].args})`
    return null
  }

  // First pass: non-return, non-definition-only lines
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('//') || t.startsWith('#') || t.startsWith('*')) continue
    if (/\breturn\b/.test(t)) continue
    // For lines that mix definition and calls, prefer calls with actual arguments
    const result = findActualCall(t)
    if (result) return result
  }

  // Second pass: lines with assignment
  for (const line of lines) {
    const t = line.trim()
    if (!t || /\breturn\b/.test(t)) continue
    if (/=\s*/.test(t)) {
      const result = findActualCall(t)
      if (result) return result
    }
  }

  // Third pass: search entire code
  const result = findActualCall(jsCode)
  if (result) return result

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

function executeWithTracing(jsCode, funcName, invocation) {
  const steps = []
  let nodeId = 0
  const stack = []
  const paramNames = getParamNames(jsCode, funcName)

  // Normalise const/let → var so we can reassign after definition
  let normalized = jsCode
    .replace(/\bconst\s+([A-Za-z_]\w*)\s*=/g, 'var $1 =')
    .replace(/\blet\s+([A-Za-z_]\w*)\s*=/g, 'var $1 =')

  function makeTraced(fn) {
    return function (...args) {
      const id = nodeId++
      const parentId = stack.length ? stack[stack.length - 1] : null
      const label = `${funcName}(${args.map(a => {
        if (Array.isArray(a)) return '[' + a.join(',') + ']'
        return JSON.stringify(a)
      }).join(', ')})`

      const params = {}
      paramNames.forEach((name, i) => { if (args[i] !== undefined) params[name] = args[i] })
      if (paramNames.length === 0) args.forEach((a, i) => { params[`arg${i}`] = a })

      stack.push(id)
      const callIdx = steps.length
      steps.push({ type: 'call', nodeId: id, parentId, label, params, isBaseCase: false })

      const result = fn.apply(this, args)

      stack.pop()

      // Base case = no child calls were pushed while this frame was active
      const hasChildren = steps.slice(callIdx + 1).some(s => s.type === 'call')
      if (!hasChildren) {
        steps[callIdx].isBaseCase = true
        steps.push({ type: 'return', nodeId: id, value: result, isBaseCase: true })
      } else {
        steps.push({ type: 'return', nodeId: id, value: result })
      }

      return result
    }
  }

  // Guard against infinite recursion
  const MAX_CALLS = 500
  const guardedTrace = (fn) => {
    const traced = makeTraced(fn)
    return function (...args) {
      if (nodeId > MAX_CALLS) throw new Error(`Recursion exceeded ${MAX_CALLS} calls. Try a smaller input value.`)
      return traced.apply(this, args)
    }
  }

  try {
    // Build the sandboxed executor
    // The trick: define the user function, then immediately reassign it to the traced version.
    // Because JS function bodies look up names at call-time (not definition-time),
    // recursive calls inside the function will resolve to the traced version. ✓
    const sandboxCode = `
      ${normalized}
      ${funcName} = __trace(${funcName});
      return ${invocation};
    `

    // We pass __trace (our factory) and console.log into the sandbox
    // eslint-disable-next-line no-new-func
    new Function('__trace', 'console', sandboxCode)(guardedTrace, {
      log: () => {},
      warn: () => {},
      error: () => {},
    })

    if (steps.length === 0) {
      throw new Error(`Function "${funcName}" was defined but never called recursively. Make sure the input triggers recursion.`)
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
        `Could not execute function "${funcName}".\n\n` +
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

  // 2. Detect function name
  const funcName = detectFuncName(jsCode)
  if (!funcName) {
    throw new Error(
      'Could not detect the recursive function name.\n' +
      'Make sure your code contains a function definition and a call to it, e.g.:\n\n' +
      '  function factorial(n) { ... }\n  factorial(5);'
    )
  }

  // 3. Detect the invocation call
  const invocation = detectInvocation(jsCode, funcName)
  if (!invocation) {
    throw new Error(
      `Function "${funcName}" was found, but no top-level call was detected.\n` +
      `Add a line at the end calling the function with input, e.g.:\n\n  ${funcName}(5);`
    )
  }

  // 4. Execute with tracing
  const steps = executeWithTracing(jsCode, funcName, invocation)

  return { steps, funcName, invocation }
}
