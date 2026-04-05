import React from 'react'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ArrowUp, ArrowDown } from 'lucide-react'

export default function CallStack({ stack, currentNodeId, executionPhase }) {
  return (
    <Card className="app-panel flex h-full flex-col overflow-hidden">
      <div className="app-panel-head flex items-center gap-2">
        <Layers className="h-4 w-4 text-tokyo-blue" />
        <span className="text-sm font-semibold text-tokyo-fg">Call stack</span>
        <span className="ml-auto rounded-full border border-tokyo-border bg-tokyo-deep px-2 py-0.5 text-xs text-tokyo-muted">
          Depth: {stack.length}
        </span>
      </div>

      <div className="flex-1 overflow-auto bg-tokyo-night p-3">
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
                  className={`relative rounded-md border p-3 transition-colors ${
                    isActive && executionPhase === 'calling'
                      ? 'border-tokyo-orange bg-tokyo-deep'
                      : isActive && executionPhase === 'returning'
                      ? 'border-tokyo-magenta bg-tokyo-deep'
                      : isTop
                      ? 'border-tokyo-blue/50 bg-tokyo-storm'
                      : 'border-tokyo-border bg-tokyo-deep'
                  }`}
                >
                  <div className="absolute -left-0.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-tokyo-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isTop && (
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                          {executionPhase === 'returning'
                            ? <ArrowUp className="h-4 w-4 text-tokyo-magenta" />
                            : <ArrowDown className="h-4 w-4 text-tokyo-orange" />}
                        </motion.div>
                      )}
                      <code className={`font-mono text-sm ${isActive ? 'font-medium text-tokyo-fg' : 'text-tokyo-muted'}`}>
                        {frame.label}
                      </code>
                    </div>
                    {frame.returnValue !== undefined && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-full border border-tokyo-green/50 bg-tokyo-storm px-2 py-0.5 text-xs text-tokyo-green"
                      >
                        → {String(frame.returnValue)}
                      </motion.div>
                    )}
                  </div>
                  {frame.params && (
                    <div className="mt-2 pl-6 font-mono text-xs text-tokyo-muted">
                      {Object.entries(frame.params).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          <span className="text-tokyo-comment">{key}:</span>{' '}
                          <span className="text-tokyo-fg">{JSON.stringify(value)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {stack.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-tokyo-comment">
              <Layers className="mb-2 h-8 w-8 text-tokyo-border" />
              <p className="text-sm text-tokyo-muted">Stack is empty</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-tokyo-border bg-tokyo-deep px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-tokyo-border" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-tokyo-comment">Stack base</span>
          <div className="h-px flex-1 bg-tokyo-border" />
        </div>
      </div>
    </Card>
  )
}
