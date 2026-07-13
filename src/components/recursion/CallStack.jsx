import React from 'react'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ArrowUp, ArrowDown } from 'lucide-react'

// Premium Gradient Theme — Rich, highly attractive saturated gradients
const DEPTH_STYLES = [
  { card: 'bg-gradient-to-r from-violet-600 to-indigo-600 border-indigo-500/40 shadow-lg shadow-indigo-500/20 text-white', label: 'text-white', sub: 'text-indigo-100', badge: 'bg-white/20 border-white/10 text-white font-mono', dot: 'bg-white' },
  { card: 'bg-gradient-to-r from-rose-500 to-orange-500 border-orange-400/40 shadow-lg shadow-orange-500/20 text-white', label: 'text-white', sub: 'text-orange-100', badge: 'bg-white/20 border-white/10 text-white font-mono', dot: 'bg-white' },
  { card: 'bg-gradient-to-r from-cyan-500 to-blue-600 border-blue-500/40 shadow-lg shadow-blue-500/20 text-white', label: 'text-white', sub: 'text-blue-100', badge: 'bg-white/20 border-white/10 text-white font-mono', dot: 'bg-white' },
  { card: 'bg-gradient-to-r from-emerald-400 to-teal-600 border-teal-500/40 shadow-lg shadow-teal-500/20 text-white', label: 'text-white', sub: 'text-teal-50', badge: 'bg-white/20 border-white/10 text-white font-mono', dot: 'bg-white' },
  { card: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 border-purple-500/40 shadow-lg shadow-purple-500/20 text-white', label: 'text-white', sub: 'text-purple-100', badge: 'bg-white/20 border-white/10 text-white font-mono', dot: 'bg-white' },
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
        <div className="flex flex-col-reverse gap-2.5">
          <AnimatePresence mode="popLayout">
            {stack.map((frame, index) => {
              const isTop    = index === stack.length - 1
              const isActive = frame.id === currentNodeId
              const s        = DEPTH_STYLES[index % DEPTH_STYLES.length]

              const ringClass = isActive && executionPhase === 'calling'
                ? 'ring-[2.5px] ring-white shadow-[0_0_20px_rgba(255,255,255,0.6)] scale-[1.03] z-10'
                : isActive && executionPhase === 'returning'
                ? 'ring-[2.5px] ring-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.6)] scale-[1.03] z-10'
                : isTop
                ? 'ring-1 ring-black/10 shadow-md scale-[1.01] z-10'
                : 'opacity-90 scale-100 hover:opacity-100'

              return (
                <motion.div
                  key={frame.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 420, damping: 28 } }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                  layout
                  className={`relative rounded-xl border p-3.5 transition-all duration-200 ${s.card} ${ringClass}`}
                >
                  <div className={`absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-[2.5px] border-background ${isActive ? (executionPhase === 'calling' ? 'bg-white' : 'bg-amber-300') : s.dot}`} />

                  <div className="flex items-center justify-between ml-1">
                    <div className="flex items-center gap-2.5">
                      {isTop && (
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                          {executionPhase === 'returning'
                            ? <ArrowUp   className={`h-4 w-4 ${s.label}`} />
                            : <ArrowDown className={`h-4 w-4 ${s.label}`} />}
                        </motion.div>
                      )}
                      <span className={`text-[15.5px] font-sans font-extrabold tracking-wide ${s.label}`}>
                        {frame.label}
                      </span>
                    </div>

                    {frame.returnValue !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-md border px-2 py-0.5 text-xs font-semibold shadow-sm ${s.badge}`}
                      >
                        → {String(frame.returnValue)}
                      </motion.div>
                    )}
                  </div>

                  {frame.params && (
                    <div className={`mt-1.5 pl-7 text-[13px] flex flex-wrap gap-x-4 gap-y-1 ${s.sub}`}>
                      {Object.entries(frame.params).map(([key, value]) => (
                        <span key={key} className="flex items-center gap-1.5">
                          <span className="opacity-70">{key}:</span>
                          <span className={`font-medium ${s.label}`}>{JSON.stringify(value)}</span>
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
