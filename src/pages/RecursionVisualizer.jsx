import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Info } from 'lucide-react'
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

// ─── built-in simulators ──────────────────────────────────────────────────────

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

// ─── component ────────────────────────────────────────────────────────────────

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

  // ── reset ──────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    clearTimeout(animationRef.current)
    setNodes([]); setStack([]); setLogs([])
    setCurrentNodeId(null); setExecutionPhase(null); setCurrentLine(null)
    setIsRunning(false); setIsPaused(false); setIsComplete(false)
    setCurrentStep(0); setTotalSteps(0)
    stepsRef.current = []; stepIndexRef.current = 0
  }, [])

  // ── execute one step ───────────────────────────────────────────────────────

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

  // ── animation loop ─────────────────────────────────────────────────────────

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

  // ── start / pause / resume / step ─────────────────────────────────────────

  const getSteps = useCallback(() => {
    if (mode === 'custom' && customCodeData) return customCodeData.steps
    const sim = simulators[selectedExample.id]
    return sim ? sim(selectedExample.input) : []
  }, [mode, selectedExample, customCodeData])

  const handleStart = useCallback(() => {
    handleReset()
    const steps = getSteps()
    stepsRef.current = steps; stepIndexRef.current = 0
    setTotalSteps(steps.length); setIsRunning(true); setIsPaused(false)
    setTimeout(runAnimation, 100)
  }, [handleReset, getSteps, runAnimation])

  const handlePause = useCallback(() => {
    setIsPaused(true); clearTimeout(animationRef.current)
  }, [])

  const handleResume = useCallback(() => {
    setIsPaused(false); runAnimation()
  }, [runAnimation])

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

  // ── custom code analysis ───────────────────────────────────────────────────

  const analyzeCustomCode = useCallback(async ({ language, code }) => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    try {
      // Use the offline execution system (no API calls)
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

  // ── mode / example change ──────────────────────────────────────────────────

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

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <motion.header className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Recursion Visualizer</h1>
              <p className="text-sm text-slate-400">Understand recursion through interactive visualization</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-2 p-1.5 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <Info className="w-4 h-4 text-slate-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Select an example, then click Run or Step to visualize how recursive calls work.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.header>

        {/* Mode Toggle */}
        <motion.div className="mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ModeToggle mode={mode} onModeChange={handleModeChange} />
        </motion.div>

        {/* Example Selector or Custom Code Panel */}
        <motion.div className="mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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

        {/* Control Panel */}
        {showVisualizer && (
          <motion.div className="mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <ControlPanel
              isRunning={isRunning} isPaused={isPaused} speed={speed}
              onStart={handleStart} onPause={handlePause} onResume={handleResume}
              onStep={handleStep} onReset={handleReset} onSpeedChange={setSpeed}
              currentStep={currentStep} totalSteps={totalSteps} isComplete={isComplete}
            />
          </motion.div>
        )}

        {/* Main Visualizer Grid */}
        {showVisualizer && (
          <motion.div className="grid grid-cols-1 lg:grid-cols-12 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="lg:col-span-4 h-[500px]">
              <CodeEditor code={code} onChange={setCode} currentLine={currentLine} isRunning={isRunning} />
            </div>
            <div className="lg:col-span-5 h-[500px]">
              <RecursionTree nodes={nodes} currentNodeId={currentNodeId} executionPhase={executionPhase} />
            </div>
            <div className="lg:col-span-3 flex flex-col gap-4 h-[500px]">
              <div className="flex-1 min-h-0">
                <CallStack stack={stack} currentNodeId={currentNodeId} executionPhase={executionPhase} />
              </div>
              <div className="h-48">
                <ExecutionLog logs={logs} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.footer className="mt-6 text-center text-sm text-slate-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {mode === 'custom' && !customCodeData && !isAnalyzing && (
            <div className="bg-slate-800/30 rounded-lg p-4 mb-4">
              <p className="text-slate-400">👆 Paste your recursive code above and click "Analyze & Visualize" to get started</p>
            </div>
          )}
          <p>Built to help students understand recursion step by step</p>
        </motion.footer>
      </div>
    </div>
  )
}
