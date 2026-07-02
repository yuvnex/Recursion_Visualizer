import React from 'react'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ArrowUp, ArrowDown } from 'lucide-react'

export default function CallStack({ stack, currentNodeId, executionPhase }) {
  return (
    <Card className="app-panel flex h-full flex-col overflow-hidden">
      <div className="app-panel-head flex items-center gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Layers className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-semibold tracking-wide uppercase text-foreground">Call stack</span>
        <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          Depth: {stack.length}
        </span>
      </div>

      <div className="flex-1 overflow-auto bg-background p-4">
        <div className="flex flex-col-reverse gap-2">
          <AnimatePresence mode="popLayout">
            {stack.map((frame, index) => {
              const isTop = index === stack.length - 1
              const isActive = frame.id === currentNodeId
              return (
                <motion.div
                  key={frame.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 420, damping: 28 } }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                  layout
                  className={`relative rounded-xl border p-3.5 shadow-sm transition-colors ${
                    isActive && executionPhase === 'calling'
                      ? 'border-amber-500/30 bg-amber-50 dark:bg-amber-500/10'
                      : isActive && executionPhase === 'returning'
                      ? 'border-primary/30 bg-primary/5'
                      : isTop
                      ? 'border-blue-500/30 bg-blue-50 dark:bg-blue-500/10'
                      : 'border-border/50 bg-muted/20'
                  }`}
                >
                  <div className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-background bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isTop && (
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                          {executionPhase === 'returning'
                            ? <ArrowUp className="h-4 w-4 text-primary" />
                            : <ArrowDown className="h-4 w-4 text-amber-500" />}
                        </motion.div>
                      )}
                      <code className={`font-mono text-sm ${isActive ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                        {frame.label}
                      </code>
                    </div>
                    {frame.returnValue !== undefined && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-full border border-green-500/30 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400 shadow-sm"
                      >
                        → {String(frame.returnValue)}
                      </motion.div>
                    )}
                  </div>
                  {frame.params && (
                    <div className="mt-2.5 pl-6 font-mono text-xs text-muted-foreground">
                      {Object.entries(frame.params).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          <span className="text-muted-foreground/70 font-medium">{key}:</span>{' '}
                          <span className="text-foreground">{JSON.stringify(value)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {stack.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Layers className="mb-3 h-10 w-10 text-border" />
              <p className="text-sm font-medium">Stack is empty</p>
            </div>
          )}
        </div>
      </div>

    </Card>
  )
}
