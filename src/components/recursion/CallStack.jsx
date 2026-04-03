import React from 'react'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ArrowUp, ArrowDown } from 'lucide-react'

export default function CallStack({ stack, currentNodeId, executionPhase }) {
  return (
    <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <Layers className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-slate-200">Call Stack</span>
        <span className="ml-auto text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
          Depth: {stack.length}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col-reverse gap-2">
          <AnimatePresence mode="popLayout">
            {stack.map((frame, index) => {
              const isTop = index === stack.length - 1
              const isActive = frame.id === currentNodeId
              return (
                <motion.div
                  key={frame.id}
                  initial={{ opacity: 0, x: -50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } }}
                  exit={{ opacity: 0, x: 50, scale: 0.8, transition: { duration: 0.2 } }}
                  layout
                  className={`relative p-3 rounded-lg border transition-all duration-300 ${
                    isActive && executionPhase === 'calling'
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : isActive && executionPhase === 'returning'
                      ? 'bg-violet-500/10 border-violet-500/50 shadow-lg shadow-violet-500/10'
                      : isTop
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-slate-800/50 border-slate-700/50'
                  }`}
                >
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-600" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isTop && (
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                          {executionPhase === 'returning'
                            ? <ArrowUp className="w-4 h-4 text-violet-400" />
                            : <ArrowDown className="w-4 h-4 text-amber-400" />}
                        </motion.div>
                      )}
                      <code className={`font-mono text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {frame.label}
                      </code>
                    </div>
                    {frame.returnValue !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full"
                      >
                        → {frame.returnValue}
                      </motion.div>
                    )}
                  </div>
                  {frame.params && (
                    <div className="mt-2 text-xs text-slate-400 font-mono pl-6">
                      {Object.entries(frame.params).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          <span className="text-slate-500">{key}:</span>{' '}
                          <span className="text-indigo-300">{JSON.stringify(value)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {stack.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Layers className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Stack is empty</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700/50">
        <div className="flex items-center justify-center">
          <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent rounded-full" />
          <span className="px-3 text-xs text-slate-500 font-medium">STACK BASE</span>
          <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent rounded-full" />
        </div>
      </div>
    </Card>
  )
}
