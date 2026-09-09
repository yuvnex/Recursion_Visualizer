import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Check, Copy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { llmClient } from '@/api/llmClient'

import CodeEditor from '@/components/recursion/CodeEditor'
import RecursionTree from '@/components/recursion/RecursionTree'
import CallStack from '@/components/recursion/CallStack'
import ControlPanel from '@/components/recursion/ControlPanel'
import ExampleSelector, { EXAMPLES } from '@/components/recursion/ExampleSelector'
import ModeToggle from '@/components/recursion/ModeToggle'
import CustomCodePanel from '@/components/recursion/CustomCodePanel'
import { 
  getAlgorithmByIdOrSlug, 
  algorithmSimulators, 
  ALGORITHM_COMPLEXITY 
} from '@/lib/algorithmData'

export default function RecursionVisualizer({ initialExampleId, children }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  // Determine initial algorithm from route param :slug, or prop initialExampleId, or default
  const targetIdOrSlug = slug || initialExampleId
  const initialExample = getAlgorithmByIdOrSlug(targetIdOrSlug)

  const [mode, setMode] = useState('examples')
  const [selectedExample, setSelectedExample] = useState(initialExample)
  const [code, setCode] = useState(initialExample.code)
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
  const [copied, setCopied] = useState(false)

  const stepsRef = useRef([])
  const stepIndexRef = useRef(0)
  const animationRef = useRef(null)
  const isPausedRef = useRef(false)
  const codeRef = useRef(initialExample.code)

  // Keep a ref in sync so executeStep can always read the latest code without a stale closure
  const setCodeAndRef = (c) => { 
    codeRef.current = c
    setCode(c) 
  }

  // Update example if route slug or initialExampleId changes
  useEffect(() => {
    if (targetIdOrSlug) {
      const match = getAlgorithmByIdOrSlug(targetIdOrSlug)
      if (match && match.id !== selectedExample?.id) {
        setSelectedExample(match)
        setCodeAndRef(match.code)
        setCustomCodeData(null)
        setAnalysisError(null)
        handleReset()
      }
    }
  }, [targetIdOrSlug]) // eslint-disable-line react-hooks/exhaustive-deps

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
        setCurrentLine(findLine([
          'if (n <= 1)', 'if (n <= 0)', 'if (n == 0)', 'if (n === 0)', 
          'if (n === 1)', 'if (n == 1)', 'if (low > high)', 'if (index >=', 
          'if (exp === 0)', 'if (exp == 0)', 'if (arr.length <= 1)', 
          'if (low >= high)', 'if (row == n)', 'if (row === n)', 'if (index == arr.length)'
        ]))
      } else {
        setCurrentLine(findLine([
          'return n *', 'return fibonacci', 'return fib(', 'return binarySearch', 
          'return arr[index]', 'return base *', 'int[] left = mergeSort', 
          'let left = mergeSort', 'left = mergeSort', 'int pivotIndex = partition',
          'if (solveNQueens', 'solveNQueens(', 'generateSubsets('
        ]))
      }
    } else {
      setExecutionPhase('returning')
      setCurrentNodeId(step.nodeId)
      setNodes(prev => prev.map(n => n.id === step.nodeId ? { ...n, returned: true, returnValue: step.value } : n))
      setStack(prev => prev.map(s => s.id === step.nodeId ? { ...s, returnValue: step.value } : s).filter(s => s.id !== step.nodeId))
      // Point to the actual return statement
      if (step.isBaseCase) {
        setCurrentLine(findLine([
          'return 1;', 'return 0;', 'return -1;', 'return arr;', 'return n;', 
          'return mid;', 'return true;', 'return false;', 'return;'
        ]))
      } else {
        setCurrentLine(findLine([
          'return n *', 'return fibonacci', 'return fib(', 'return binarySearch', 
          'return arr[index]', 'return base *', 'return merge(', 'quickSort(',
          'return true;', 'return false;', 'return;'
        ]))
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
    const sim = algorithmSimulators[selectedExample?.id] || algorithmSimulators[selectedExample?.slug]
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
          currLine = findLine([
            'if (n <= 1)', 'if (n <= 0)', 'if (n == 0)', 'if (n === 0)', 
            'if (n === 1)', 'if (n == 1)', 'if (low > high)', 'if (index >=', 
            'if (exp === 0)', 'if (exp == 0)', 'if (arr.length <= 1)', 
            'if (low >= high)', 'if (row == n)', 'if (row === n)', 'if (index == arr.length)'
          ])
        } else {
          currLine = findLine([
            'return n *', 'return fibonacci', 'return fib(', 'return binarySearch', 
            'return arr[index]', 'return base *', 'int[] left = mergeSort', 
            'let left = mergeSort', 'left = mergeSort', 'int pivotIndex = partition',
            'if (solveNQueens', 'solveNQueens(', 'generateSubsets('
          ])
        }
      } else {
        phase = 'returning'
        currNodeId = step.nodeId
        nextNodes = nextNodes.map(n => n.id === step.nodeId ? { ...n, returned: true, returnValue: step.value } : n)
        nextStack = nextStack.map(s => s.id === step.nodeId ? { ...s, returnValue: step.value } : s).filter(s => s.id !== step.nodeId)
        if (step.isBaseCase) {
          currLine = findLine([
            'return 1;', 'return 0;', 'return -1;', 'return arr;', 'return n;', 
            'return mid;', 'return true;', 'return false;', 'return;'
          ])
        } else {
          currLine = findLine([
            'return n *', 'return fibonacci', 'return fib(', 'return binarySearch', 
            'return arr[index]', 'return base *', 'return merge(', 'quickSort(',
            'return true;', 'return false;', 'return;'
          ])
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
    setSelectedExample(example)
    setCodeAndRef(example.code)
    setCustomCodeData(null)
    setAnalysisError(null)
    handleReset()

    // Automatically sync browser URL to the clicked example's dedicated SEO or visualization route
    if (location.pathname.startsWith('/visualize/')) {
      navigate(`/visualize/${example.slug}`)
    } else {
      const targetPath = example.seoPath || `/visualize/${example.slug}`
      if (location.pathname !== targetPath) {
        navigate(targetPath)
      }
    }
  }, [handleReset, location.pathname, navigate])

  const handleInputChange = useCallback((newInput) => {
    setSelectedExample(prev => ({ ...prev, input: newInput }))
    handleReset()
  }, [handleReset])

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode)
    handleReset()
    setAnalysisError(null)
    if (newMode === 'examples') {
      setCodeAndRef(initialExample.code)
      setSelectedExample(initialExample)
      setCustomCodeData(null)
    }
  }, [handleReset, initialExample])

  // Share Link handler
  const handleCopyShareLink = useCallback(() => {
    const slugToShare = selectedExample?.slug || 'fibonacci'
    const shareUrl = `${window.location.origin}/visualize/${slugToShare}`
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      toast({
        title: "Link copied!",
        description: `Direct visualization URL copied: ${shareUrl}`,
        duration: 3000,
      })
      setTimeout(() => setCopied(false), 2500)
    }).catch(err => {
      console.error("Clipboard copy error:", err)
    })
  }, [selectedExample, toast])

  const showVisualizer = mode === 'examples' || !!customCodeData
  const toggleTreeExpand = useCallback(() => setIsTreeExpanded(prev => !prev), [])

  return (
    <div className="app-shell font-sans selection:bg-primary/25 selection:text-foreground">

      <div className="relative z-10 mx-auto max-w-[1840px] px-4 py-6 md:px-8 md:py-8">

        {/* Top Control Bar with ModeToggle and Share Button */}
        <motion.div 
          className="mb-5 flex flex-wrap items-center justify-between gap-3" 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
        >
          <ModeToggle mode={mode} onModeChange={handleModeChange} />

          <div className="flex items-center gap-2">
            <Button
              id="share-button"
              onClick={handleCopyShareLink}
              variant="outline"
              className="app-btn-secondary relative flex items-center gap-2 px-4 py-2 font-medium shadow-sm transition-all duration-200 hover:border-primary/50"
              title="Copy shareable link for this visualization"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Link copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 text-primary" />
                  <span>Share</span>
                </>
              )}
            </Button>
          </div>
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
              complexity={mode === 'examples' ? (ALGORITHM_COMPLEXITY[selectedExample?.id] || ALGORITHM_COMPLEXITY[selectedExample?.slug]) : null}
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
      
      {/* Footer with license details */}
      <footer className="w-full text-center py-6 border-t border-border/40 text-sm text-muted-foreground/60 bg-background">
        <p>&copy; {new Date().getFullYear()} Recursify. MIT License.</p>
      </footer>
    </div>
  )
}
