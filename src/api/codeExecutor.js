/**
 * In-browser recursive code executor.
 * Converts Java / Python / C / C++ / JavaScript to runnable JS,
 * then instruments the recursive function to capture every call & return.
 * Works 100% offline — no API key needed.
 */

// ─── language → JavaScript converters ────────────────────────────────────────

/**
 * Convert Java / C / C++ code to JavaScript.
 * Handles the common patterns used in introductory recursion problems.
 */
const convertCStyleToJS = (code) => {
  let js = code

  // Remove import / package / include lines
  js = js.replace(/^\s*(import|package|#include|#define|using namespace).*$/gm, '')

  // Remove class / main wrapper  (keep the inner methods)
  js = js.replace(/\bclass\s+\w+\s*\{([\s\S]*)\}\s*$/m, '$1')
  js = js.replace(/\bpublic\s+static\s+void\s+main\s*\([^)]*\)\s*\{[\s\S]*?\n\}/m, '')

  // Access modifiers + static + final + synchronized
  js = js.replace(/\b(public|private|protected|static|final|inline|synchronized|const)\s+/g, '')

  // Convert typed function signatures  →  function name(
  //   int factorial(   →   function factorial(
  js = js.replace(
    /\b(int|long|double|float|boolean|char|void|String|auto|size_t|unsigned\s+int|long\s+long)\s+(\w+)\s*\(/g,
    'function $2('
  )

  // Remove remaining type annotations in parameter lists
  //   (int n, int m)  →  (n, m)
  js = js.replace(
    /\b(int|long|double|float|boolean|char|String|auto|size_t|unsigned)\s+(\w+)/g,
    '$2'
  )

  // Java arrays in params:  int[] arr  →  arr
  js = js.replace(/\b(?:int|long|double|float|char|String)\[\]\s+(\w+)/g, '$1')

  // System.out.println / System.out.print
  js = js.replace(/System\.out\.(println|print|printf)\s*\([^)]*\)\s*;?/g, '')

  // Scanner usage lines
  js = js.replace(/Scanner\s+\w+\s*=.*?;/g, '')
  js = js.replace(/\w+\.nextInt\(\)/g, '0')
  js = js.replace(/\w+\.nextDouble\(\)/g, '0')
  js = js.replace(/\w+\.nextLine\(\)/g, '""')

  // Boolean literals
  js = js.replace(/\btrue\b/g, 'true')
  js = js.replace(/\bfalse\b/g, 'false')
  js = js.replace(/\bnull\b/g, 'null')

  // Math.floor shorthand  (already valid JS)
  // Keep the rest as-is — Java / C logic is almost identical to JS

  return js.trim()
}

/**
 * Convert Python to JavaScript.
 * Handles: def, indentation blocks, elif, True/False/None, ** operator, print, comments.
 */
const convertPythonToJS = (code) => {
  const lines = code.split('\n')
  const out = []
  const indentStack = [0]

  const getIndent = (line) => {
    const m = line.match(/^(\s*)/)
    return m ? m[1].replace(/\t/g, '    ').length : 0
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const stripped = raw.trimEnd()

    // blank lines
    if (!stripped.trim()) { out.push(''); continue }

    // comment lines
    if (stripped.trim().startsWith('#')) {
      out.push(stripped.trim().replace(/^#/, '//'))
      continue
    }

    const indent = getIndent(stripped)
    const content = stripped.trim()

    // Close any blocks whose indent level we've left
    while (indent < indentStack[indentStack.length - 1]) {
      indentStack.pop()
      out.push(' '.repeat(indentStack[indentStack.length - 1]) + '}')
    }

    // Convert Python constructs to JS
    let jsLine = content

    // def func(params): → function func(params) {
    jsLine = jsLine.replace(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/, 'function $1($2) {')

    // if / elif / else / for / while  with trailing colon
    jsLine = jsLine.replace(/^elif\s+(.+):$/, 'else if ($1) {')
    jsLine = jsLine.replace(/^if\s+(.+):$/, 'if ($1) {')
    jsLine = jsLine.replace(/^else\s*:$/, 'else {')
    jsLine = jsLine.replace(/^while\s+(.+):$/, 'while ($1) {')
    jsLine = jsLine.replace(/^for\s+(\w+)\s+in\s+range\((\d+)\s*,\s*(\d+)\)\s*:/, 'for (let $1 = $2; $1 < $3; $1++) {')
    jsLine = jsLine.replace(/^for\s+(\w+)\s+in\s+range\((\d+)\)\s*:/, 'for (let $1 = 0; $1 < $2; $1++) {')

    // Boolean / null
    jsLine = jsLine.replace(/\bTrue\b/g, 'true')
    jsLine = jsLine.replace(/\bFalse\b/g, 'false')
    jsLine = jsLine.replace(/\bNone\b/g, 'null')

    // Logical operators
    jsLine = jsLine.replace(/\bnot\s+/g, '!')
    jsLine = jsLine.replace(/\band\b/g, '&&')
    jsLine = jsLine.replace(/\bor\b/g, '||')

    // Exponentiation  n**2 → Math.pow(n,2)  (simple cases)
    jsLine = jsLine.replace(/(\w+)\s*\*\*\s*(\w+)/g, 'Math.pow($1,$2)')

    // print(...)  →  (remove)
    jsLine = jsLine.replace(/^print\s*\(.*\)\s*$/, '')

    // len(x) → x.length
    jsLine = jsLine.replace(/\blen\((\w+)\)/g, '$1.length')

    // If this line opens a new block (ends with {), push indent level
    const nextLine = lines[i + 1]
    const nextIndent = nextLine !== undefined ? getIndent(nextLine) : 0

    out.push(' '.repeat(indent) + jsLine)

    if (jsLine.endsWith('{')) {
      indentStack.push(nextIndent)
    }
  }

  // Close any remaining open blocks
  while (indentStack.length > 1) {
    indentStack.pop()
    out.push(' '.repeat(indentStack[indentStack.length - 1]) + '}')
  }

  return out.join('\n').trim()
}

// ─── detect recursive function name ──────────────────────────────────────────

const IGNORED_NAMES = new Set([
  'println','print','printf','fprintf','sprintf','scanf','console','log','warn',
  'error','info','debug','main','Main','setup','init','run','start','execute',
  'Math','parseInt','parseFloat','Number','String','Boolean','Array','Object',
  'JSON','Date','Promise','setTimeout','setInterval','fetch','require',
  'toString','valueOf','push','pop','shift','unshift','splice','slice',
  'map','filter','reduce','forEach','find','some','every','includes',
  'len','range','list','dict','tuple','set','int','str','float','bool',
  'max','min','abs','sum','sorted','reversed','open','read','write',
  'malloc','calloc','free','sizeof','memcpy','memset','strcmp','strcpy',
  'assert','expect','describe','it','test',
])

const findRecursiveFunctionName = (code) => {
  const patterns = [
    /\bfunction\s+(\w+)\s*\(/g,
    /\bdef\s+(\w+)\s*\(/g,
    /(?:public|private|protected|static)\s+(?:static\s+)?(?:\w+\s+)(\w+)\s*\(/g,
    /\b(?:int|long|double|float|void|boolean|char|auto|String)\s+(\w+)\s*\(/g,
    /\b(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
  ]

  const defined = []
  for (const pat of patterns) {
    const re = new RegExp(pat.source, pat.flags)
    let m
    while ((m = re.exec(code)) !== null) {
      const name = m[1]
      if (name && !IGNORED_NAMES.has(name) && name.length > 1 && !defined.includes(name)) {
        defined.push(name)
      }
    }
  }

  // Pick first name that appears ≥2 times (definition + at least one call)
  for (const name of defined) {
    const count = (code.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length
    if (count >= 2) return name
  }

  return defined[0] ?? null
}

// ─── find entry-point invocation (not a definition, not a return) ─────────────

const findInvocationCall = (code, funcName) => {
  if (!funcName) return null
  const lines = code.split('\n')
  const re = new RegExp(`\\b${funcName}\\s*\\(([^)]*)\\)`)

  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('//') || t.startsWith('#') || t.startsWith('*')) continue
    if (/\b(function|def)\b/.test(t)) continue
    if (/\b(public|private|protected|static)\b/.test(t) && /\b(int|void|long|double|String|float|boolean)\b/.test(t)) continue
    if (/\breturn\b/.test(t)) continue
    const m = t.match(re)
    if (m) return `${funcName}(${m[1].trim()})`
  }

  // Looser pass — allow assignment lines but still skip return
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('//') || t.startsWith('#')) continue
    if (/\b(function|def)\b/.test(t)) continue
    if (/\breturn\b/.test(t)) continue
    const m = t.match(re)
    if (m) return `${funcName}(${m[1].trim()})`
  }

  return null
}

// ─── get parameter names from function definition ────────────────────────────

const getParamNames = (code, funcName) => {
  // match:  function factorial(n)  or  def factorial(n, m):  or  int factorial(int n)
  const re = new RegExp(
    `(?:function\\s+${funcName}|def\\s+${funcName}|\\b\\w+\\s+${funcName})\\s*\\(([^)]*)\\)`
  )
  const m = code.match(re)
  if (!m) return []
  return m[1]
    .split(',')
    .map(p => p.trim().replace(/^(?:int|long|double|float|boolean|char|String|auto|const)\s+/, '').replace(/\[\]/g, '').trim())
    .filter(Boolean)
}

// ─── instrument + execute ─────────────────────────────────────────────────────

/**
 * Takes already-converted JavaScript code, wraps the recursive function
 * with call/return tracking, executes the entry call, and returns steps[].
 */
const runInstrumented = (jsCode, funcName, invocationCall, paramNames) => {
  const steps = []
  let nodeCounter = 0
  const parentStack = []

  // We expose __steps, __nodeCounter, __parentStack, __funcName, __paramNames
  // into the executed function via closure through new Function scope variables.

  // Build a wrapped version of the code where funcName is replaced by an
  // instrumented proxy after the original definition.
  const preamble = `
    const __steps = [];
    let __nc = 0;
    const __ps = [];
    const __pnames = ${JSON.stringify(paramNames)};
    const __fname = ${JSON.stringify(funcName)};
  `

  // After the user's code runs, we shadow funcName with our instrumented version
  const instrumentation = `
    const __orig = typeof ${funcName} === 'function' ? ${funcName} : null;
    if (!__orig) throw new Error('Function "${funcName}" not found in code.');

    ${funcName} = function __instrumented(...args) {
      const myId = __nc++;
      const parentId = __ps.length > 0 ? __ps[__ps.length - 1] : null;
      const label = __fname + '(' + args.map(a => Array.isArray(a) ? '['+a.join(',')+']' : String(a)).join(', ') + ')';
      const params = {};
      __pnames.forEach((n, i) => { if (args[i] !== undefined) params[n] = args[i]; });

      const callIdx = __steps.length;
      __steps.push({ type: 'call', nodeId: myId, parentId, label, params, isBaseCase: true });

      __ps.push(myId);
      let result;
      try { result = __orig(...args); }
      finally { __ps.pop(); }

      // if any direct child calls were recorded, this wasn't a base case
      const hasChildren = __steps.slice(callIdx + 1).some(s => s.type === 'call' && s.parentId === myId);
      if (hasChildren) __steps[callIdx].isBaseCase = false;

      __steps.push({ type: 'return', nodeId: myId, value: result, isBaseCase: __steps[callIdx].isBaseCase });
      return result;
    };
  `

  const invocation = `
    ${invocationCall};
    return __steps;
  `

  const fullCode = preamble + '\n' + jsCode + '\n' + instrumentation + '\n' + invocation

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(fullCode)
    return fn()
  } catch (err) {
    throw new Error(`Execution failed: ${err.message}`)
  }
}

// ─── public API ───────────────────────────────────────────────────────────────

/**
 * Execute a recursive code snippet entirely in the browser.
 * Returns a steps array identical to what the AI would return.
 */
export const executeLocally = (language, code) => {
  // 1. Convert to JS
  let jsCode
  if (language === 'python') {
    jsCode = convertPythonToJS(code)
  } else if (['java', 'cpp', 'c'].includes(language)) {
    jsCode = convertCStyleToJS(code)
  } else {
    jsCode = code // already JS
  }

  // 2. Detect recursive function + invocation
  const funcName = findRecursiveFunctionName(jsCode) ?? findRecursiveFunctionName(code)
  if (!funcName) throw new Error('Could not detect a recursive function. Make sure your code defines a function and calls it at the bottom.')

  const invocationCall = findInvocationCall(jsCode, funcName) ?? findInvocationCall(code, funcName)
  if (!invocationCall) {
    throw new Error(
      `Found function "${funcName}" but no entry-point call.\n` +
      `Add a call at the bottom of your code, e.g.:\n  ${funcName}(5);`
    )
  }

  // 3. Get parameter names (from original code — before type stripping)
  const paramNames = getParamNames(code, funcName)

  // 4. Run with instrumentation
  const steps = runInstrumented(jsCode, funcName, invocationCall, paramNames)

  if (!steps || steps.length === 0) {
    throw new Error(`"${funcName}" was called but produced no steps. Check for infinite recursion or missing base case.`)
  }

  return {
    functionName: funcName,
    inputCall: invocationCall,
    steps,
  }
}
