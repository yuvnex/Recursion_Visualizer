import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brackets } from 'lucide-react'
import { llmClient } from '@/api/llmClient'

import CodeEditor from '@/components/recursion/CodeEditor'
import RecursionTree from '@/components/recursion/RecursionTree'
import CallStack from '@/components/recursion/CallStack'
import ControlPanel from '@/components/recursion/ControlPanel'
import ExampleSelector, { EXAMPLES } from '@/components/recursion/ExampleSelector'
import ModeToggle from '@/components/recursion/ModeToggle'
import CustomCodePanel from '@/components/recursion/CustomCodePanel'

const simulators = {
  factorial: (n) => {
    const steps = []
    const simulate = (n, nodeId, parentId) => {
      steps.push({ type: 'call', nodeId, parentId, label: `factorial(${n})`, params: { n }, isBaseCase: n <= 1 })
      if (n <= 1) { steps.push({ type: 'return', nodeId, value: 1, isBaseCase: true }); return 1 }
      const childId = steps.length
      const r = simulate(n - 1, childId, nodeId)
      const result = n * r
      steps.push({ type: 'return', nodeId, value: result })
      return result
    }
    simulate(n, 0, null)
    return steps
  },

  fibonacci: (n) => {
    const steps = []
    let counter = 0
    const simulate = (n, parentId = null) => {
      const id = counter++
      const isBase = n <= 1
      steps.push({ type: 'call', nodeId: id, parentId, label: `fib(${n})`, params: { n }, isBaseCase: isBase })
      if (n <= 0) { steps.push({ type: 'return', nodeId: id, value: 0, isBaseCase: true }); return { id, result: 0 } }
      if (n === 1) { steps.push({ type: 'return', nodeId: id, value: 1, isBaseCase: true }); return { id, result: 1 } }
      const l = simulate(n - 1, id)
      const r = simulate(n - 2, id)
      const result = l.result + r.result
      steps.push({ type: 'return', nodeId: id, value: result })
      return { id, result }
    }
    simulate(n)
    return steps
  },

  binarySearch: ({ arr, target, low, high }) => {
    const steps = []
    let counter = 0
    const simulate = (lo, hi, parentId = null) => {
      const id = counter++
      const isBase = lo > hi
      steps.push({ type: 'call', nodeId: id, parentId, label: `search(${lo},${hi})`, params: { low: lo, high: hi }, isBaseCase: isBase })
      if (lo > hi) { steps.push({ type: 'return', nodeId: id, value: -1, isBaseCase: true }); return { id, result: -1 } }
      const mid = Math.floor((lo + hi) / 2)
      if (arr[mid] === target) { steps.push({ type: 'return', nodeId: id, value: mid, isBaseCase: true }); return { id, result: mid } }
      const child = arr[mid] > target ? simulate(lo, mid - 1, id) : simulate(mid + 1, hi, id)
      steps.push({ type: 'return', nodeId: id, value: child.result })
      return { id, result: child.result }
    }
    simulate(low, high)
    return steps
  },

  sumArray: ({ arr, index }) => {
    const steps = []
    let counter = 0
    const simulate = (idx, parentId = null) => {
      const id = counter++
      const isBase = idx >= arr.length
      steps.push({ type: 'call', nodeId: id, parentId, label: `sum(${idx})`, params: { index: idx, value: arr[idx] }, isBaseCase: isBase })
      if (isBase) { steps.push({ type: 'return', nodeId: id, value: 0, isBaseCase: true }); return { id, result: 0 } }
      const child = simulate(idx + 1, id)
      const result = arr[idx] + child.result
      steps.push({ type: 'return', nodeId: id, value: result })
      return { id, result }
    }
    simulate(index)
    return steps
  },

  power: ({ base, exp }) => {
    const steps = []
    let counter = 0
    const simulate = (e, parentId = null) => {
      const id = counter++
      const isBase = e === 0
      steps.push({ type: 'call', nodeId: id, parentId, label: `power(${base},${e})`, params: { base, exp: e }, isBaseCase: isBase })
      if (isBase) { steps.push({ type: 'return', nodeId: id, value: 1, isBaseCase: true }); return { id, result: 1 } }
      const child = simulate(e - 1, id)
      const result = base * child.result
      steps.push({ type: 'return', nodeId: id, value: result })
      return { id, result }
    }
    simulate(exp)
    return steps
  },

  mergeSort: ({ arr }) => {
    const steps = []
    let counter = 0
    const simulate = (subArr, parentId = null) => {
      const id = counter++
      const isBase = subArr.length <= 1
      steps.push({
        type: 'call',
        nodeId: id,
        parentId,
        label: `mergeSort([${subArr.join(',')}])`,
        params: { arr: [...subArr] },
        isBaseCase: isBase,
      })
      if (isBase) {
        steps.push({ type: 'return', nodeId: id, value: [...subArr], isBaseCase: true })
        return { id, result: [...subArr] }
      }
      const mid = Math.floor(subArr.length / 2)
      const leftChild = simulate(subArr.slice(0, mid), id)
      const rightChild = simulate(subArr.slice(mid), id)
      // merge
      const merged = []
      let i = 0, j = 0
      const l = leftChild.result, r = rightChild.result
      while (i < l.length && j < r.length) {
        if (l[i] <= r[j]) merged.push(l[i++])
        else merged.push(r[j++])
      }
      while (i < l.length) merged.push(l[i++])
      while (j < r.length) merged.push(r[j++])
      steps.push({ type: 'return', nodeId: id, value: merged })
      return { id, result: merged }
    }
    simulate(arr)
    return steps
  },

  quickSort: ({ arr, low, high }) => {
    const steps = []
    let counter = 0
    const currentArr = [...arr]

    const simulate = (lo, hi, parentId = null) => {
      const id = counter++
      const isBase = lo >= hi
      
      steps.push({
        type: 'call',
        nodeId: id,
        parentId,
        label: `quickSort(${lo},${hi})`,
        params: { low: lo, high: hi, arr: [...currentArr] },
        isBaseCase: isBase,
      })

      if (isBase) {
        steps.push({ type: 'return', nodeId: id, value: undefined, isBaseCase: true })
        return { id }
      }

      // Partition
      let pivot = currentArr[hi]
      let i = lo - 1
      for (let j = lo; j < hi; j++) {
        if (currentArr[j] <= pivot) {
          i++
          let temp = currentArr[i]
          currentArr[i] = currentArr[j]
          currentArr[j] = temp
        }
      }
      let temp = currentArr[i + 1]
      currentArr[i + 1] = currentArr[hi]
      currentArr[hi] = temp
      const pivotIndex = i + 1

      simulate(lo, pivotIndex - 1, id)
      simulate(pivotIndex + 1, hi, id)

      steps.push({ type: 'return', nodeId: id, value: undefined })
      return { id }
    }
    
    simulate(low, high)
    return steps
  },
}

const COMPLEXITY = {
  factorial:    { time: 'O(n)',        space: 'O(n)' },
  fibonacci:    { time: 'O(2ⁿ)',       space: 'O(n)' },
  binarySearch: { time: 'O(log₂ n)',   space: 'O(log₂ n)' },
  sumArray:     { time: 'O(n)',        space: 'O(n)' },
  power:        { time: 'O(n)',        space: 'O(n)' },
  mergeSort:    { time: 'O(n log n)',  space: 'O(n)' },
  quickSort:    { time: 'O(n log n)',  space: 'O(log n)' },
}

export default function RecursionVisualizer() {
  const [mode, setMode] = useState('examples')
  const [selectedExample, setSelectedExample] = useState(EXAMPLES[0])
  const [code, setCode] = useState(EXAMPLES[0].code)
  const [nodes, setNodes] = useState([])
  const [stack, setStack] = useState([])
  const [currentNodeId, setCurrentNodeId] = useState(null)
  const [executionPhase, setExecutionPhase] = useState(null)
  const [currentLine, setCurrentLine] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [customCodeData, setCustomCodeData] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  const [isTreeExpanded, setIsTreeExpanded] = useState(false)

  const stepsRef = useRef([])
  const stepIndexRef = useRef(0)
  const animationRef = useRef(null)
  const isPausedRef = useRef(false)
  const codeRef = useRef(EXAMPLES[0].code)
  // Keep a ref in sync so executeStep can always read the latest code without a stale closure
  const setCodeAndRef = (c) => { codeRef.current = c; setCode(c) }

  useEffect(() => { isPausedRef.current = isPaused }, [isPaused])
  useEffect(() => {
    if (!isTreeExpanded) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [isTreeExpanded])

  const handleReset = useCallback(() => {
    clearTimeout(animationRef.current)
    setNodes([]); setStack([])
    setCurrentNodeId(null); setExecutionPhase(null); setCurrentLine(null)
    setIsRunning(false); setIsPaused(false); setIsComplete(false)
    setCurrentStep(0); setTotalSteps(0)
    setIsTreeExpanded(false)
    stepsRef.current = []; stepIndexRef.current = 0
  }, [])

  // Scan the current code for the best matching line index (0-based)
  const findLine = (patterns) => {
    const lines = codeRef.current.split('\n')
    for (const pattern of patterns) {
      const cleanPattern = pattern.toLowerCase().replace(/\s+/g, '')
      const idx = lines.findIndex(l => l.toLowerCase().replace(/\s+/g, '').includes(cleanPattern))
      if (idx !== -1) return idx
    }
    return null
  }

  const executeStep = useCallback((step) => {
    if (step.type === 'call') {
      setExecutionPhase('calling')
      setCurrentNodeId(step.nodeId)
      setNodes(prev => [...prev, { id: step.nodeId, parentId: step.parentId, label: step.label, params: step.params, isBaseCase: step.isBaseCase, returned: false }])
      setStack(prev => [...prev, { id: step.nodeId, label: step.label, params: step.params }])
      // Point to the base-case condition line, or the recursive call line
      if (step.isBaseCase) {
        setCurrentLine(findLine(['if (n <= 1)', 'if (n <= 0)', 'if (n == 0)', 'if (n === 0)', 'if (n === 1)', 'if (n == 1)', 'if (low > high)', 'if (index >=', 'if (exp === 0)', 'if (exp == 0)', 'if (arr.length <= 1)', 'if (low >= high)']))
      } else {
        setCurrentLine(findLine(['return n *', 'return fibonacci', 'return fib(', 'return binarySearch', 'return arr[index]', 'return base *', 'int[] left = mergeSort', 'let left = mergeSort', 'left = mergeSort', 'int pivotIndex = partition']))
      }
    } else {
      setExecutionPhase('returning')
      setCurrentNodeId(step.nodeId)
      setNodes(prev => prev.map(n => n.id === step.nodeId ? { ...n, returned: true, returnValue: step.value } : n))
      setStack(prev => prev.map(s => s.id === step.nodeId ? { ...s, returnValue: step.value } : s).filter(s => s.id !== step.nodeId))
      // Point to the actual return statement
      if (step.isBaseCase) {
        setCurrentLine(findLine(['return 1;', 'return 0;', 'return -1;', 'return arr;', 'return n;', 'return mid;', 'return;']))
      } else {
        setCurrentLine(findLine(['return n *', 'return fibonacci', 'return fib(', 'return binarySearch', 'return arr[index]', 'return base *', 'return merge(', 'quickSort(']))
      }
    }
  }, [])

  const runAnimation = useCallback(() => {
    if (stepIndexRef.current >= stepsRef.current.length) {
      setIsComplete(true); setIsRunning(false); setExecutionPhase(null); setCurrentNodeId(null)
      return
    }
    if (isPausedRef.current) return
    executeStep(stepsRef.current[stepIndexRef.current])
    stepIndexRef.current++
    setCurrentStep(stepIndexRef.current)
    animationRef.current = setTimeout(runAnimation, 1000 / speed)
  }, [speed, executeStep])

  const getSteps = useCallback(() => {
    if (mode === 'custom' && customCodeData) return customCodeData.steps
    const sim = simulators[selectedExample.id]
    return sim ? sim(selectedExample.input) : []
  }, [mode, selectedExample, customCodeData])

  const handleStart = useCallback(() => {
    handleReset()
    const steps = getSteps()
    stepsRef.current = steps; stepIndexRef.current = 0
    isPausedRef.current = false
    setTotalSteps(steps.length); setIsRunning(true); setIsPaused(false)
    setTimeout(runAnimation, 100)
  }, [handleReset, getSteps, runAnimation])

  const handlePause = useCallback(() => {
    isPausedRef.current = true
    setIsPaused(true); clearTimeout(animationRef.current)
  }, [])

  const handleResume = useCallback(() => {
    if (!isRunning || isComplete) return
    isPausedRef.current = false
    setIsPaused(false)
    clearTimeout(animationRef.current)
    animationRef.current = setTimeout(runAnimation, 0)
  }, [isRunning, isComplete, runAnimation])

  const jumpToStep = useCallback((targetStep) => {
    if (targetStep < 0) targetStep = 0
    const steps = stepsRef.current
    if (targetStep > steps.length) targetStep = steps.length

    let nextNodes = []
    let nextStack = []
    let phase = null
    let currNodeId = null
    let currLine = null

    for (let i = 0; i < targetStep; i++) {
      const step = steps[i]
      if (step.type === 'call') {
        phase = 'calling'
        currNodeId = step.nodeId
        nextNodes.push({ id: step.nodeId, parentId: step.parentId, label: step.label, params: step.params, isBaseCase: step.isBaseCase, returned: false })
        nextStack.push({ id: step.nodeId, label: step.label, params: step.params })
        if (step.isBaseCase) {
          currLine = findLine(['if (n <= 1)', 'if (n <= 0)', 'if (n == 0)', 'if (n === 0)', 'if (n === 1)', 'if (n == 1)', 'if (low > high)', 'if (index >=', 'if (exp === 0)', 'if (exp == 0)', 'if (arr.length <= 1)', 'if (low >= high)'])
        } else {
          currLine = findLine(['return n *', 'return fibonacci', 'return fib(', 'return binarySearch', 'return arr[index]', 'return base *', 'int[] left = mergeSort', 'let left = mergeSort', 'left = mergeSort', 'int pivotIndex = partition'])
        }
      } else {
        phase = 'returning'
        currNodeId = step.nodeId
        nextNodes = nextNodes.map(n => n.id === step.nodeId ? { ...n, returned: true, returnValue: step.value } : n)
        nextStack = nextStack.map(s => s.id === step.nodeId ? { ...s, returnValue: step.value } : s).filter(s => s.id !== step.nodeId)
        if (step.isBaseCase) {
          currLine = findLine(['return 1;', 'return 0;', 'return -1;', 'return arr;', 'return n;', 'return mid;', 'return;'])
        } else {
          currLine = findLine(['return n *', 'return fibonacci', 'return fib(', 'return binarySearch', 'return arr[index]', 'return base *', 'return merge(', 'quickSort('])
        }
      }
    }

    setNodes(nextNodes)
    setStack(nextStack)
    setExecutionPhase(phase)
    setCurrentNodeId(currNodeId)
    setCurrentLine(currLine)
    
    stepIndexRef.current = targetStep
    setCurrentStep(targetStep)

    if (targetStep >= steps.length) {
      setIsComplete(true)
      setIsRunning(false)
      setExecutionPhase(null)
      setCurrentNodeId(null)
    } else {
      setIsComplete(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStep = useCallback(() => {
    if (!isRunning) {
      const steps = getSteps()
      stepsRef.current = steps; stepIndexRef.current = 0
      setTotalSteps(steps.length); setIsRunning(true); setIsPaused(true)
    }
    if (stepIndexRef.current >= stepsRef.current.length) {
      setIsComplete(true); setIsRunning(false); return
    }
    executeStep(stepsRef.current[stepIndexRef.current])
    stepIndexRef.current++
    setCurrentStep(stepIndexRef.current)
  }, [isRunning, getSteps, executeStep])

  const handlePrev = useCallback(() => {
    if (!isRunning && currentStep === 0) return
    setIsPaused(true)
    isPausedRef.current = true
    clearTimeout(animationRef.current)
    const nextTarget = Math.max(0, stepIndexRef.current - 1)
    jumpToStep(nextTarget)
  }, [isRunning, currentStep, jumpToStep])

  const analyzeCustomCode = useCallback(async ({ language, code }) => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    try {
      const result = await llmClient.analyzeCode(code, language)

      if (!result.steps || result.steps.length === 0) {
        throw new Error('Failed to analyze recursion pattern. Please ensure your code has a clear recursive function and a function call.')
      }

      setCustomCodeData({
        steps: result.steps,
        functionName: result.functionName,
        invocation: result.invocation,
        code,
        language,
      })
      setCodeAndRef(code)
      setIsAnalyzing(false)
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisError(error.message || 'Failed to analyze code.')
      setIsAnalyzing(false)
    }
  }, [])

  const handleSelectExample = useCallback((example) => {
    setSelectedExample(example); setCodeAndRef(example.code)
    setCustomCodeData(null); setAnalysisError(null); handleReset()
  }, [handleReset])

  const handleInputChange = useCallback((newInput) => {
    setSelectedExample(prev => ({ ...prev, input: newInput }))
    handleReset()
  }, [handleReset])

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode); handleReset(); setAnalysisError(null)
    if (newMode === 'examples') {
      setCodeAndRef(EXAMPLES[0].code); setSelectedExample(EXAMPLES[0]); setCustomCodeData(null)
    }
  }, [handleReset])

  const showVisualizer = mode === 'examples' || !!customCodeData
  const toggleTreeExpand = useCallback(() => setIsTreeExpanded(prev => !prev), [])

  return (
    <div className="app-shell font-sans selection:bg-primary/25 selection:text-foreground">

      <div className="relative z-10 mx-auto max-w-[1840px] px-4 py-6 md:px-8 md:py-8">

        <motion.div className="mb-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ModeToggle mode={mode} onModeChange={handleModeChange} />
        </motion.div>

        <motion.div className="mb-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <AnimatePresence mode="wait">
            {mode === 'examples' ? (
              <motion.div key="examples" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <ExampleSelector selectedExample={selectedExample} onSelect={handleSelectExample} onInputChange={handleInputChange} />
              </motion.div>
            ) : (
              <motion.div key="custom" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CustomCodePanel onAnalyze={analyzeCustomCode} isAnalyzing={isAnalyzing} error={analysisError} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {showVisualizer && (
          <motion.div className="mb-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <ControlPanel
              isRunning={isRunning} isPaused={isPaused} speed={speed}
              onStart={handleStart} onPause={handlePause} onResume={handleResume}
              onStep={handleStep} onPrev={handlePrev} onReset={handleReset} onSpeedChange={setSpeed}
              currentStep={currentStep} totalSteps={totalSteps} isComplete={isComplete}
              complexity={mode === 'examples' ? COMPLEXITY[selectedExample?.id] : null}
            />
          </motion.div>
        )}

        {/* ── Visualizer Layout: 3-column row ── */}
        {showVisualizer && (
          <motion.div
            className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <div className="min-h-[380px] h-[min(48vh,500px)] lg:h-[500px]">
              <CodeEditor code={code} onChange={setCode} currentLine={currentLine} isRunning={isRunning} />
            </div>
            <div className="min-h-[380px] h-[min(48vh,500px)] lg:h-[500px]">
              <RecursionTree
                nodes={nodes}
                currentNodeId={currentNodeId}
                executionPhase={executionPhase}
                isExpanded={false}
                onToggleExpand={toggleTreeExpand}
                isRunning={isRunning}
                isPaused={isPaused}
                speed={speed}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onStep={handleStep}
                onPrev={handlePrev}
                onSpeedChange={setSpeed}
                isComplete={isComplete}
              />
            </div>
            <div className="min-h-[380px] h-[min(48vh,500px)] lg:h-[500px]">
              <CallStack stack={stack} currentNodeId={currentNodeId} executionPhase={executionPhase} />
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showVisualizer && isTreeExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed inset-0 z-50 bg-background/95 p-4 md:p-6 backdrop-blur-sm"
            >
              <div className="h-full w-full">
                <RecursionTree
                  nodes={nodes}
                  currentNodeId={currentNodeId}
                  executionPhase={executionPhase}
                  isExpanded={true}
                  onToggleExpand={toggleTreeExpand}
                  isRunning={isRunning}
                  isPaused={isPaused}
                  speed={speed}
                  onStart={handleStart}
                  onPause={handlePause}
                  onResume={handleResume}
                  onStep={handleStep}
                  onPrev={handlePrev}
                  onSpeedChange={setSpeed}
                  isComplete={isComplete}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
