import React, { useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, ArrowRight, ArrowLeft } from 'lucide-react'

export default function ExecutionLog({ logs }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <Terminal className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-slate-200">Execution Log</span>
        <span className="ml-auto text-xs text-slate-500">{logs.length} events</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-3 space-y-1 font-mono text-xs">
        <AnimatePresence>
          {logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-start gap-2 p-2 rounded ${
                log.type === 'call' ? 'bg-indigo-500/10' :
                log.type === 'return' ? 'bg-emerald-500/10' :
                log.type === 'base' ? 'bg-amber-500/10' : 'bg-slate-800/50'
              }`}
            >
              <span className="text-slate-500 w-6">{index + 1}.</span>
              {log.type === 'call' || log.type === 'base'
                ? <ArrowRight className="w-3 h-3 mt-0.5 text-indigo-400 flex-shrink-0" />
                : <ArrowLeft className="w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0" />
              }
              <span className={
                log.type === 'call' ? 'text-indigo-300' :
                log.type === 'return' ? 'text-emerald-300' :
                log.type === 'base' ? 'text-amber-300' : 'text-slate-400'
              }>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Run visualization to see execution log</p>
          </div>
        )}
      </div>
    </Card>
  )
}
