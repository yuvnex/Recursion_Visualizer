import React from 'react'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ArrowUp, ArrowDown } from 'lucide-react'

// Soft pastel rainbow — light, airy, perfect on white backgrounds
const DEPTH_STYLES = [
  { card: 'bg-violet-100 border-violet-200', label: 'text-violet-900', sub: 'text-violet-500', badge: 'bg-violet-500 border-violet-600 text-white', dot: 'bg-violet-400' },
  { card: 'bg-blue-100   border-blue-200',   label: 'text-blue-900',   sub: 'text-blue-500',   badge: 'bg-blue-500   border-blue-600   text-white', dot: 'bg-blue-400'   },
  { card: 'bg-cyan-100   border-cyan-200',   label: 'text-cyan-900',   sub: 'text-cyan-500',   badge: 'bg-cyan-500   border-cyan-600   text-white', dot: 'bg-cyan-400'   },
  { card: 'bg-emerald-100 border-emerald-200', label: 'text-emerald-900', sub: 'text-emerald-500', badge: 'bg-emerald-500 border-emerald-600 text-white', dot: 'bg-emerald-400' },
  { card: 'bg-pink-100   border-pink-200',   label: 'text-pink-900',   sub: 'text-pink-500',   badge: 'bg-pink-500   border-pink-600   text-white', dot: 'bg-pink-400'   },
  { card: 'bg-rose-100   border-rose-200',   label: 'text-rose-900',   sub: 'text-rose-500',   badge: 'bg-rose-500   border-rose-600   text-white', dot: 'bg-rose-400'   },
]

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
              const isTop    = index === stack.length - 1
              const isActive = frame.id === currentNodeId
              const s        = DEPTH_STYLES[index % DEPTH_STYLES.length]

              const ringClass = isActive && executionPhase === 'calling'
                ? 'ring-2 ring-indigo-400 shadow-md shadow-indigo-200/60 scale-[1.02] z-10'
                : isActive && executionPhase === 'returning'
                ? 'ring-2 ring-blue-400  shadow-md shadow-blue-200/60  scale-[1.02] z-10'
                : isTop
                ? 'ring-2 ring-gray-300  shadow-sm scale-[1.01] z-10'
                : 'opacity-90'

              return (
                <motion.div
                  key={frame.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 420, damping: 28 } }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                  layout
                  className={`relative rounded-xl border p-3.5 transition-all duration-200 ${s.card} ${ringClass}`}
                >
                  <div className={`absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-background ${s.dot}`} />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isTop && (
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                          {executionPhase === 'returning'
                            ? <ArrowUp   className={`h-4 w-4 ${s.label}`} />
                            : <ArrowDown className={`h-4 w-4 ${s.label}`} />}
                        </motion.div>
                      )}
                      <code className={`font-mono text-sm font-semibold ${s.label}`}>
                        {frame.label}
                      </code>
                    </div>

                    {frame.returnValue !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold shadow-sm ${s.badge}`}
                      >
                        → {String(frame.returnValue)}
                      </motion.div>
                    )}
                  </div>

                  {frame.params && (
                    <div className={`mt-2 pl-6 font-mono text-xs ${s.sub}`}>
                      {Object.entries(frame.params).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          <span className="font-medium opacity-80">{key}:</span>{' '}
                          <span className={`font-bold ${s.label}`}>{JSON.stringify(value)}</span>
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
