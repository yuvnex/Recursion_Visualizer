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
    const patterns = ['return 1', 'return 0', 'return n', 'if (n <= 1)', 'if (n == 0)', 'if (low > high)', 'if (n < 2)']
    return patterns.some(p => line.toLowerCase().includes(p.toLowerCase()))
  }

  const isRecursiveCallLine = (line) => {
    const funcNames = ['factorial', 'fibonacci', 'fib', 'binarySearch', 'search', 'sumArray', 'sum', 'power']
    return funcNames.some(name => {
      const regex = new RegExp(`${name}\\s*\\(`)
      return regex.test(line) && !line.includes('function') && !line.includes('int ') && !line.includes('def ')
    })
  }

  // Line height in px (matches leading-6 = 1.5rem = 24px)
  const LINE_HEIGHT = 24
  // py-4 top padding = 16px
  const TOP_PADDING = 16

  return (
    <Card className="app-panel flex h-full flex-col overflow-hidden">
      <div className="app-panel-head flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Code2 className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-wide uppercase text-foreground">Source</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
            Base case
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium">
            Recursive call
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-background scrollbar-hide relative">
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

      <div className="border-t border-border/60 bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-amber-500">➜</span>
            <span>Current line</span>
          </div>
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          <span>
            <span className="text-green-600 dark:text-green-400 font-medium">Green</span>: base case ·{' '}
            <span className="text-blue-600 dark:text-blue-400 font-medium">Blue</span>: recursive call
          </span>
        </div>
      </div>
    </Card>
  )
}
