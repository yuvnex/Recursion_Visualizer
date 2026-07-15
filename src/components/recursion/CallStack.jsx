import React, { useEffect, useRef } from 'react'

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
        {stack.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
            Stack is empty
          </div>
        )}
        
        {stack.map((frame) => (
          <div key={frame.id} className="w-full bg-[#3c76d2] text-white text-center py-3 font-mono text-[17px] tracking-wide shadow-sm rounded-md">
            {frame.label}
          </div>
        ))}
        
        {/* Anchor for auto-scrolling to the visual top of the flex-col-reverse container */}
        <div ref={topRef} />
      </div>

    </div>
  )
}
