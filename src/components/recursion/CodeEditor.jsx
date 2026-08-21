import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code2, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CodeEditor({ code, onChange, currentLine, isRunning }) {
  const lines = code.split('\n')

  const getLineHighlight = (lineIndex) => {
    if (currentLine === lineIndex && isRunning) {
      return 'bg-amber-400/10 dark:bg-amber-400/15'
    }
    return ''
  }

  const isBaseCaseLine = (line) => {
    const patterns = ['return 1', 'return 0', 'return -1', 'return arr', 'return n', 'if (n <= 1)', 'if (n <= 0)', 'if (n == 0)', 'if (low > high)', 'if (n < 2)', 'if (exp == 0)', 'if (index >=', 'if (arr.length <= 1)']
    return patterns.some(p => line.toLowerCase().includes(p.toLowerCase()))
  }

  const isRecursiveCallLine = (line) => {
    const funcNames = ['factorial', 'fibonacci', 'fib', 'binarySearch', 'search', 'sumArray', 'sum', 'power', 'mergeSort']
    return funcNames.some(name => {
      const regex = new RegExp(`${name}\\s*\\(`)
      return regex.test(line) && !line.includes('function') && !line.includes('public') && !line.includes('def ')
    })
  }

  // Line height in px (matches leading-6 = 1.5rem = 24px)
  const LINE_HEIGHT = 24
  // py-4 top padding = 16px
  const TOP_PADDING = 16

  return (
    <Card className="app-panel flex h-full flex-col overflow-hidden">
      <div className="bg-[#0284c7] text-white text-center py-2 text-[22px] tracking-wide font-sans z-10 shadow-sm relative flex items-center justify-center">
        <span>Source Code</span>
      </div>

      <div className="flex-1 overflow-auto bg-transparent scrollbar-hide relative">
        <div className="flex relative">

          {/* Gutter: line numbers + execution arrow */}
          <div className="flex-shrink-0 select-none border-r border-border/50 bg-muted/20 py-4 pl-2 pr-3 relative">
            {/* Animated execution arrow in gutter */}
            <AnimatePresence>
              {isRunning && currentLine !== null && (
                <motion.div
                  key="exec-arrow"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: TOP_PADDING + currentLine * LINE_HEIGHT,
                  }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  className="absolute left-0 flex items-center"
                  style={{ top: 0, height: LINE_HEIGHT }}
                >
                  {/* Glow pulse behind arrow */}
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-r-md bg-amber-400/25"
                  />
                  <motion.span
                    animate={{ x: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                    className="relative z-10 pl-1 text-amber-500 dark:text-amber-400 font-bold text-sm leading-6 select-none"
                    style={{ lineHeight: `${LINE_HEIGHT}px` }}
                  >
                    ➜
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Line numbers */}
            {lines.map((_, i) => (
              <div
                key={i}
                className={`min-w-[1.5rem] text-right font-mono text-xs leading-6 transition-colors ${
                  currentLine === i && isRunning
                    ? 'text-amber-500 dark:text-amber-400 font-bold'
                    : 'text-muted-foreground/60'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code lines */}
          <div className="flex-1 overflow-x-auto py-4 scrollbar-hide relative">
            {lines.map((line, i) => {
              const isBaseCase = isBaseCaseLine(line)
              const isRecursive = isRecursiveCallLine(line)
              const isCurrentLine = currentLine === i && isRunning
              return (
                <div
                  key={i}
                  className={`px-4 leading-6 transition-colors duration-150 ${getLineHighlight(i)} ${
                    isCurrentLine ? 'border-l-[3px] border-amber-400' : 'border-l-[3px] border-transparent'
                  }`}
                >
                  <code
                    className={`whitespace-pre font-mono text-sm ${
                      isBaseCase
                        ? 'text-green-600 dark:text-green-400 font-medium'
                        : isRecursive
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-foreground'
                    }`}
                  >
                    {line || ' '}
                  </code>
                </div>
              )
            })}
          </div>
        </div>
      </div>


    </Card>
  )
}
