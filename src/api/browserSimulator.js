/**
 * Browser-side Recursion Simulator
 *
 * Converts pasted code (Java, Python, C++, C, JavaScript) into runnable
 * JavaScript, instruments it to track every call and return, then produces
 * the exact `steps[]` array the visualizer needs — with NO API key required.
 *
 * Strategy
 * ────────
 * 1. Detect language from the prompt.
 * 2. Extract the function body + invocation call from the pasted code.
 * 3. Transpile to JavaScript using lightweight regex-based rules.
 * 4. Inject call/return instrumentation around the recursive calls.
 * 5. Run via `new Function(...)` in a sandboxed scope.
 * 6. Return steps[] in the same format as the Anthropic path.
 */

// ─── helpers ──────────────────────────────────────────────────────────────────

const IGNORED = new Set([
  'println','print','printf','fprintf','sprintf','console','log','warn',
  'System','out','err','Scanner','main','setup','init','run','start',
  'Math','parseInt','parseFloat','Number','String','Boolean','Array',
  'Object','JSON','setTimeout','setInterval','require','resolve','reject',
  'toString','push','pop','map','filter','reduce','forEach','len','range',
  'list','dict','int','str','float','bool','abs','sum','sorted','max','min',
  'malloc','free','sizeof','memcpy','strlen','floor','ceil','round','pow',
  'sqrt','assert','expect','test','describe',
])

// ─── Step 1: find recursive function name ─────────────────────────────────────

const findFuncName = (code) => {
  const patterns = [
    /\bfunction\s+(\w+)\s*\(/g,
    /\bdef\s+(\w+)\s*\(/g,
    /(?:public|private|protected|static)\s+(?:static\s+)?(?:\w+(?:\[\])*)\s+(\w+)\s*\(/g,
    /\b(?:int|long|double|float|boolean|char|void|auto|String)\s+(\w+)\s*\(/g,
    /\b(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
  ]
  const found = []
  for (const pat of patterns) {
    let m
    const re = new RegExp(pat.source, pat.flags)
    while ((m = re.exec(code)) !== null) {
      if (m[1] && !IGNORED.has(m[1]) && m[1].length > 1 && !found.includes(m[1]))
        found.push(m[1])
    }
  }
  // prefer the one that appears ≥2 times (definition + recursive call)
  for (const name of found) {
    const count = (code.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length
    if (count >= 2) return name
  }
  return found[0] ?? null
}

// ─── Step 2: find the top-level invocation ───────────────────────────────────

const findInvocation = (code, funcName) => {
  if (!funcName) return null
  const re = new RegExp(`\\b${funcName}\\s*\\(([^)]{0,200})\\)`)
  const lines = code.split('\n')
  const skip = (line) =>
    /\b(function|def)\b/.test(line) ||
    /\b(public|private|protected|static)\b/.test(line) ||
    /\b(int|long|double|float|void|boolean|char|auto|String)\s+\w+\s*\(/.test(line) ||
    line.trim().startsWith('//') || line.trim().startsWith('#') ||
    line.trim().startsWith('*')

  for (const line of lines) {
    if (skip(line)) continue
    if (/\breturn\b/.test(line)) continue
    const m = line.match(re)
    if (m) return `${funcName}(${m[1].trim()})`
  }
  // relaxed: allow assignment lines
  for (const line of lines) {
    if (skip(line)) continue
    const m = line.match(re)
    if (m) return `${funcName}(${m[1].trim()})`
  }
  return null
}

// ─── Step 3: language → JavaScript transpiler ────────────────────────────────

const transpileToJS = (code, lang) => {
  let js = code

  if (lang === 'python') {
    js = js
      .replace(/def\s+(\w+)\s*\(([^)]*)\)\s*:/g, 'function $1($2) {')
      .replace(/elif\s+(.+):/g, '} else if ($1) {')
      .replace(/if\s+(.+):/g, 'if ($1) {')
      .replace(/else\s*:/g, '} else {')
      .replace(/for\s+(\w+)\s+in\s+range\(([^)]+)\)\s*:/g, 'for (let $1 = 0; $1 < $2; $1++) {')
      .replace(/True/g, 'true').replace(/False/g, 'false').replace(/None/g, 'null')
      .replace(/and\b/g, '&&').replace(/or\b/g, '||').replace(/not\s+/g, '!')
      .replace(/print\s*\(([^)]*)\)/g, '// print($1)')
      .replace(/\blen\s*\(([^)]+)\)/g, '$1.length')
      // close Python blocks by indentation heuristic
      .split('\n').reduce((acc, line) => {
        const trimmed = line.trimStart()
        const prev = acc[acc.length - 1] ?? ''
        // very simple: if current line dedents and prev is content, insert }
        const curIndent = line.length - trimmed.length
        const prevIndent = prev.length - prev.trimStart().length
        if (curIndent < prevIndent && trimmed && !trimmed.startsWith('}')) {
          acc.push('}')
        }
        acc.push(line)
        return acc
      }, [])
      .join('\n')
    // ensure enough closing braces
    const opens = (js.match(/\{/g) || []).length
    const closes = (js.match(/\}/g) || []).length
    if (opens > closes) js += '\n}'.repeat(opens - closes)
  }

  if (lang === 'java' || lang === 'c' || lang === 'cpp') {
    js = js
      // remove access modifiers + return type from function definitions
      .replace(/(?:public|private|protected|static|inline|final|virtual)\s+/g, '')
      .replace(/(?:int|long|long long|short|double|float|boolean|bool|char|void|auto|String|size_t|unsigned int|unsigned)\s+(\w+)\s*\(/g, 'function $1(')
      // remove type declarations in bodies: "int x = …" → "let x = …"
      .replace(/\b(?:int|long|double|float|boolean|bool|char|String)\s+(\w+)\s*=/g, 'let $1 =')
      // Java arrays: "int[] arr" → "let arr"
      .replace(/\b(?:int|long|double|float)\s*\[\s*\]\s*(\w+)/g, 'let $1')
      // C++ cout / Java System.out.println → comment
      .replace(/System\.out\.print(?:ln)?\s*\([^)]*\)\s*;?/g, '')
      .replace(/cout\s*<<[^;]+;/g, '')
      // Math.floor, Math.abs etc. stay as-is (JS has them too)
      // remove #include / import lines
      .replace(/#include\s*[<"][^>"]*[>"]/g, '')
      .replace(/import\s+[\w.]+\s*;/g, '')
      // remove class wrapper if present (find main body)
      .replace(/class\s+\w+\s*\{/, '')
      // semicolons are fine in JS too
  }

  return js
}

// ─── Step 4: instrument + run ─────────────────────────────────────────────────

const MAX_STEPS = 500  // guard against infinite recursion

export const simulateInBrowser = (code, lang, funcName, invocation) => {
  const jsCode = transpileToJS(code, lang)

  const steps = []
  let nodeCounter = 0
  const callStack = []  // stack of nodeIds

  // We inject __call__ and __return__ helpers into the function scope
  const instrumentedCode = `
    ${jsCode}

    // wrap the recursive function
    const __orig__ = ${funcName}
    ${funcName} = function(...args) {
      if (__steps__.length >= ${MAX_STEPS}) throw new Error('MAX_STEPS exceeded')
      const nodeId = __counter__++
      const parentId = __stack__.length > 0 ? __stack__[__stack__.length - 1] : null
      __stack__.push(nodeId)
      __steps__.push({
        type: 'call',
        nodeId,
        parentId,
        label: \`${funcName}(\${args.join(', ')})\`,
        params: Object.fromEntries(args.map((v,i) => ['arg'+i, v])),
        isBaseCase: false,
      })
      let result
      try {
        result = __orig__.apply(this, args)
      } catch(e) {
        __stack__.pop()
        throw e
      }
      __stack__.pop()
      // patch the last call step to mark base case if no children were added
      const callStep = __steps__.slice().reverse().find(s => s.type==='call' && s.nodeId===nodeId)
      const hasChildren = __steps__.some(s => s.type==='call' && s.parentId===nodeId)
      if (callStep && !hasChildren) callStep.isBaseCase = true
      __steps__.push({ type: 'return', nodeId, value: result })
      return result
    }

    // run the entry call
    try { ${invocation} } catch(e) { if (!e.message.includes('MAX_STEPS')) throw e }
  `

  // provide the shared state as upvalues via new Function scope
  const run = new Function(
    '__steps__', '__counter_obj__', '__stack__',
    instrumentedCode.replace('let __counter__ =', '').replace(
      '__counter__++',
      '__counter_obj__[0]++'
    )
  )

  const stepsArr = []
  const counterObj = [0]
  const stackArr = []

  // simpler: build a self-contained runner
  const safeRun = () => {
    const steps = []
    const counterRef = { v: 0 }
    const stackRef = []

    const fullCode = `
      "use strict";
      const __steps__ = []
      let __ctr__ = 0
      const __stk__ = []

      ${jsCode}

      const __orig__ = typeof ${funcName} === 'function' ? ${funcName} : null
      if (!__orig__) throw new Error('Function ${funcName} not found')

      ${funcName} = function(...args) {
        if (__steps__.length >= ${MAX_STEPS}) return undefined
        const nodeId = __ctr__++
        const parentId = __stk__.length > 0 ? __stk__[__stk__.length - 1] : null
        __stk__.push(nodeId)
        const paramObj = {}
        args.forEach((v,i) => { paramObj['arg'+i] = v })
        __steps__.push({ type:'call', nodeId, parentId,
          label: '${funcName}(' + args.join(', ') + ')',
          params: paramObj, isBaseCase: false })

        let result
        result = __orig__.apply(this, args)

        __stk__.pop()
        const hasChildren = __steps__.some(s => s.type==='call' && s.parentId===nodeId)
        const callStep = [...__steps__].reverse().find(s => s.type==='call' && s.nodeId===nodeId)
        if (callStep && !hasChildren) callStep.isBaseCase = true

        __steps__.push({ type:'return', nodeId, value: result })
        return result
      }

      try { ${invocation} } catch(e) {}
      __steps__
    `

    // eslint-disable-next-line no-new-func
    const fn = new Function(fullCode)
    return fn()
  }

  return safeRun()
}

// ─── Step 5: fix up param names using actual function signature ───────────────

export const fixParamNames = (steps, code, funcName) => {
  // extract param names from definition  e.g. "function factorial(n)" → ['n']
  const re = new RegExp(`(?:function\\s+${funcName}|def\\s+${funcName})\\s*\\(([^)]*)\\)`)
  const m = code.match(re)
  if (!m) {
    // try Java/C style
    const re2 = new RegExp(`${funcName}\\s*\\(([^)]*)\\)`)
    const m2 = code.match(re2)
    if (!m2) return steps
    const rawParams = m2[1]
    return applyParams(steps, rawParams)
  }
  return applyParams(steps, m[1])
}

const applyParams = (steps, rawParams) => {
  if (!rawParams.trim()) return steps
  // strip type annotations: "int n, int[] arr" → ['n','arr']
  const names = rawParams.split(',').map(p => {
    const parts = p.trim().split(/\s+/)
    return parts[parts.length - 1].replace(/[[\]]/g, '').trim()
  }).filter(Boolean)

  if (names.length === 0) return steps

  return steps.map(step => {
    if (step.type !== 'call' || !step.params) return step
    const entries = Object.values(step.params)
    const namedParams = {}
    names.forEach((name, i) => {
      if (i < entries.length) namedParams[name] = entries[i]
    })
    return { ...step, params: namedParams }
  })
}
