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
      <div className="bg-[#7c3aed] text-white text-center py-2 text-[22px] tracking-wide font-sans z-10 shadow-sm relative flex items-center justify-center">
        <span>Execution Log</span>
        <span className="absolute right-4 text-sm font-medium bg-white/20 px-2.5 py-0.5 rounded-full">{logs.length} events</span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-auto bg-transparent p-3 font-mono text-xs scrollbar-hide">
        <AnimatePresence>
          {logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-start gap-2.5 rounded-lg border p-2.5 shadow-sm transition-colors ${
                log.type === 'call' ? 'border-primary/20 bg-primary/5' :
                log.type === 'return' ? 'border-violet-500/20 bg-violet-50 dark:bg-violet-500/5' :
                log.type === 'base' ? 'border-amber-500/20 bg-amber-50 dark:bg-amber-500/5' : 'border-border/50 bg-muted/20'
              }`}
            >
              {log.type === 'call' || log.type === 'base'
                ? <ArrowRight className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${log.type === 'base' ? 'text-amber-500' : 'text-primary'}`} />
                : <ArrowLeft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400" />
              }
              <span className={`font-medium ${
                log.type === 'call' ? 'text-primary' :
                log.type === 'return' ? 'text-violet-700 dark:text-violet-400' :
                log.type === 'base' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
              }`}>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ListOrdered className="h-8 w-8 text-border" />
            <p className="text-xs">Run or step to see events</p>
          </div>
        )}
      </div>
    </Card>
  )
}
