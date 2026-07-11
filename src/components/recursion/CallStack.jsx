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

      <div className="flex-1 overflow-auto bg-background p-4 scrollbar-hide">
        <div className="flex flex-col-reverse gap-2">
          <AnimatePresence mode="popLayout">
            {stack.map((frame, index) => {
              const isTop = index === stack.length - 1
              const isActive = frame.id === currentNodeId
              const depth = index

              const indigoBgs = [
                'bg-indigo-600 border-indigo-700 text-white',
                'bg-indigo-500 border-indigo-600 text-white',
                'bg-indigo-400 border-indigo-500 text-indigo-950',
                'bg-indigo-300 border-indigo-400 text-indigo-950',
                'bg-indigo-200 border-indigo-300 text-indigo-950',
              ]
              const bgClass = indigoBgs[Math.min(depth, indigoBgs.length - 1)]

              const activeClasses = isActive && executionPhase === 'calling'
                ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/30 scale-[1.02] z-10'
                : isActive && executionPhase === 'returning'
                ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/30 scale-[1.02] z-10'
                : isTop
                ? 'ring-2 ring-indigo-300 shadow-md scale-[1.01] z-10'
                : 'opacity-90'

              return (
                <motion.div
                  key={frame.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 420, damping: 28 } }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                  layout
                  className={`relative rounded-xl border p-3.5 transition-all duration-200 ${bgClass} ${activeClasses}`}
                >
                  <div className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-background bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isTop && (
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                          {executionPhase === 'returning'
                            ? <ArrowUp className={`h-4 w-4 ${isActive || isTop ? 'text-current' : 'text-primary'}`} />
                            : <ArrowDown className={`h-4 w-4 ${isActive || isTop ? 'text-current' : 'text-amber-500'}`} />}
                        </motion.div>
                      )}
                      <code className={`font-mono text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                        {frame.label}
                      </code>
                    </div>
                    {frame.returnValue !== undefined && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium shadow-sm ${
                          isActive || isTop 
                            ? 'border-white/40 bg-white/20 text-current' 
                            : 'border-white/40 bg-white/20 text-current'
                        }`}
                      >
                        → {String(frame.returnValue)}
                      </motion.div>
                    )}
                  </div>
                  {frame.params && (
                    <div className="mt-2.5 pl-6 font-mono text-xs opacity-90">
                      {Object.entries(frame.params).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          <span className="opacity-75 font-medium">{key}:</span>{' '}
                          <span className="font-semibold">{JSON.stringify(value)}</span>
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
