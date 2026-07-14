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
    <div className="flex h-full flex-col bg-white relative w-full overflow-hidden shadow-sm border border-gray-200 rounded-lg">
      <div className="bg-[#4a3bce] text-white text-center py-2 text-[22px] tracking-wide font-sans z-10 shadow-sm">
        Stack
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-5 py-6 flex flex-col-reverse justify-start gap-4 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

      {hasParams && (
        <div className="absolute bottom-0 left-0 bg-[#252526] text-white text-[15px] px-3 py-1.5 font-sans z-20 max-w-full truncate rounded-tr-sm">
          Variables {Object.entries(topFrame.params).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(' and ')}
        </div>
      )}
    </div>
  )
}
