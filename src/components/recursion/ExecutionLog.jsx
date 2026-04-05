import React, { useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { ListOrdered, ArrowRight, ArrowLeft } from 'lucide-react'

export default function ExecutionLog({ logs }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <Card className="app-panel flex h-full flex-col overflow-hidden">
      <div className="app-panel-head flex items-center gap-2">
        <ListOrdered className="h-4 w-4 text-tokyo-blue" />
        <span className="text-sm font-semibold text-tokyo-fg">Execution log</span>
        <span className="ml-auto text-xs text-tokyo-comment">{logs.length} events</span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-1 overflow-auto bg-tokyo-night p-2 font-mono text-xs">
        <AnimatePresence>
          {logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-start gap-2 rounded border p-2 ${
                log.type === 'call' ? 'border-tokyo-blue/40 bg-tokyo-storm' :
                log.type === 'return' ? 'border-tokyo-green/40 bg-tokyo-storm' :
                log.type === 'base' ? 'border-tokyo-orange/40 bg-tokyo-deep' : 'border-tokyo-border bg-tokyo-deep'
              }`}
            >
              <span className="w-6 shrink-0 text-tokyo-comment">{index + 1}.</span>
              {log.type === 'call' || log.type === 'base'
                ? <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-tokyo-blue" />
                : <ArrowLeft className="mt-0.5 h-3 w-3 shrink-0 text-tokyo-green" />
              }
              <span className={
                log.type === 'call' ? 'text-tokyo-blue' :
                log.type === 'return' ? 'text-tokyo-green' :
                log.type === 'base' ? 'text-tokyo-orange' : 'text-tokyo-muted'
              }>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="flex h-full items-center justify-center text-tokyo-comment">
            <p className="text-xs">Run or step to see events</p>
          </div>
        )}
      </div>
    </Card>
  )
}
