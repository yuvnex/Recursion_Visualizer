import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brackets, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { llmClient } from '@/api/llmClient'

import CodeEditor from '@/components/recursion/CodeEditor'
import RecursionTree from '@/components/recursion/RecursionTree'
import CallStack from '@/components/recursion/CallStack'
import ControlPanel from '@/components/recursion/ControlPanel'
import ExampleSelector, { EXAMPLES } from '@/components/recursion/ExampleSelector'
import ExecutionLog from '@/components/recursion/ExecutionLog'
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
}

export default function RecursionVisualizer() {
  const [mode, setMode] = useState('examples')
  const [selectedExample, setSelectedExample] = useState(EXAMPLES[0])
  const [code, setCode] = useState(EXAMPLES[0].code)
  const [nodes, setNodes] = useState([])
  const [stack, setStack] = useState([])
  const [logs, setLogs] = useState([])
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

  const stepsRef = useRef([])
  const stepIndexRef = useRef(0)
  const animationRef = useRef(null)
  const isPausedRef = useRef(false)

  useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

  const handleReset = useCallback(() => {
    clearTimeout(animationRef.current)
    setNodes([]); setStack([]); setLogs([])
    setCurrentNodeId(null); setExecutionPhase(null); setCurrentLine(null)
    setIsRunning(false); setIsPaused(false); setIsComplete(false)
    setCurrentStep(0); setTotalSteps(0)
    stepsRef.current = []; stepIndexRef.current = 0
  }, [])

  const executeStep = useCallback((step) => {
    if (step.type === 'call') {
      setExecutionPhase('calling')
      setCurrentNodeId(step.nodeId)
      setNodes(prev => [...prev, { id: step.nodeId, parentId: step.parentId, label: step.label, params: step.params, isBaseCase: step.isBaseCase, returned: false }])
      setStack(prev => [...prev, { id: step.nodeId, label: step.label, params: step.params }])
      setLogs(prev => [...prev, { type: step.isBaseCase ? 'base' : 'call', message: `Calling ${step.label}${step.isBaseCase ? ' (BASE CASE)' : ''}` }])
      setCurrentLine(step.isBaseCase ? 2 : 6)
    } else {
      setExecutionPhase('returning')
      setCurrentNodeId(step.nodeId)
      setNodes(prev => prev.map(n => n.id === step.nodeId ? { ...n, returned: true, returnValue: step.value } : n))
      setStack(prev => prev.map(s => s.id === step.nodeId ? { ...s, returnValue: step.value } : s).filter(s => s.id !== step.nodeId))
      setLogs(prev => [...prev, { type: 'return', message: `Returning ${step.value} from node ${step.nodeId}` }])
      setCurrentLine(step.isBaseCase ? 3 : 7)
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
      setCode(code)
      setIsAnalyzing(false)
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisError(error.message || 'Failed to analyze code.')
      setIsAnalyzing(false)
    }
  }, [])

  const handleSelectExample = useCallback((example) => {
    setSelectedExample(example); setCode(example.code)
    setCustomCodeData(null); setAnalysisError(null); handleReset()
  }, [handleReset])

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode); handleReset(); setAnalysisError(null)
    if (newMode === 'examples') {
      setCode(EXAMPLES[0].code); setSelectedExample(EXAMPLES[0]); setCustomCodeData(null)
    }
  }, [handleReset])

  const showVisualizer = mode === 'examples' || !!customCodeData

  return (
    <div className="app-shell font-sans selection:bg-tokyo-magenta/25 selection:text-tokyo-fg">
      <div className="relative z-10 mx-auto max-w-[1840px] px-4 py-6 md:px-8 md:py-8">
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-tokyo-border bg-tokyo-storm">
                <Brackets className="h-5 w-5 text-tokyo-blue" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-tokyo-fg sm:text-[1.65rem]">
                    Recursion Visualizer
                  </h1>
                  <span className="app-pill">Runs offline</span>
                </div>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-tokyo-muted">
                  Step through call trees, the stack, and execution logs. No sign-in and no external APIs.
                </p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="app-btn-secondary self-start rounded-md p-2 text-tokyo-comment hover:text-tokyo-fg"
                  >
                    <Info className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs border border-tokyo-border bg-tokyo-storm text-tokyo-fg shadow-lg">
                  <p>Choose an example or paste Java, then use Run or Step to walk through calls and returns.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.header>

        <motion.div className="mb-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ModeToggle mode={mode} onModeChange={handleModeChange} />
        </motion.div>

        <motion.div className="mb-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <AnimatePresence mode="wait">
            {mode === 'examples' ? (
              <motion.div key="examples" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <ExampleSelector selectedExample={selectedExample} onSelect={handleSelectExample} />
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
              onStep={handleStep} onReset={handleReset} onSpeedChange={setSpeed}
              currentStep={currentStep} totalSteps={totalSteps} isComplete={isComplete}
            />
          </motion.div>
        )}

        {showVisualizer && (
          <motion.div
            className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="lg:col-span-4 min-h-[420px] h-[min(52vh,560px)] lg:h-[560px]">
              <CodeEditor code={code} onChange={setCode} currentLine={currentLine} isRunning={isRunning} />
            </div>
            <div className="lg:col-span-5 min-h-[420px] h-[min(52vh,560px)] lg:h-[560px]">
              <RecursionTree nodes={nodes} currentNodeId={currentNodeId} executionPhase={executionPhase} />
            </div>
            <div className="lg:col-span-3 flex flex-col gap-5 min-h-[420px] h-[min(52vh,560px)] lg:h-[560px]">
              <div className="flex-1 min-h-0">
                <CallStack stack={stack} currentNodeId={currentNodeId} executionPhase={executionPhase} />
              </div>
              <div className="h-44 min-h-[11rem] shrink-0">
                <ExecutionLog logs={logs} />
              </div>
            </div>
          </motion.div>
        )}

        <motion.footer
          className="mt-10 border-t border-tokyo-border pt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {mode === 'custom' && !customCodeData && !isAnalyzing && (
            <div className="app-panel mb-6 p-4 text-left sm:text-center">
              <p className="text-sm text-tokyo-muted">
                Paste your recursive Java above, then choose <span className="font-medium text-tokyo-fg">Analyze &amp; Visualize</span> to load the trace.
              </p>
            </div>
          )}
          <p className="text-xs text-tokyo-comment">
            Runs entirely in your browser. No API keys.
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
