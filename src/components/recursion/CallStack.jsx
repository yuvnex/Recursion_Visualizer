import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CallStack({ stack, currentNodeId, executionPhase }) {
  const topFrame = stack.length > 0 ? stack[stack.length - 1] : null;
  const hasParams = topFrame && topFrame.params && Object.keys(topFrame.params).length > 0;
  const topRef = useRef(null);

  useEffect(() => {
    // Scroll the top reference into view whenever the stack changes
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [stack]);

  return (
    <div className="flex h-full flex-col bg-card relative w-full overflow-hidden shadow-sm border border-border/60 rounded-xl">
      <div className="bg-[#4a3bce] text-white text-center py-2 text-[22px] tracking-wide font-sans z-10 shadow-sm">
        Stack
      </div>

      <div className="flex-1 overflow-y-auto bg-transparent px-5 py-6 flex flex-col-reverse justify-start gap-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AnimatePresence mode="popLayout">
          {stack.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground"
            >
              <p className="font-sans text-sm text-muted-foreground">Stack is empty</p>
            </motion.div>
          )}
          
          {stack.map((frame) => (
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              layout
              className="w-full bg-[#3c76d2] text-white text-center py-3 font-mono text-[17px] tracking-wide shadow-sm rounded-md"
            >
              {frame.label}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Anchor for auto-scrolling to the visual top of the flex-col-reverse container */}
        <div ref={topRef} />
      </div>

    </div>
  )
}
