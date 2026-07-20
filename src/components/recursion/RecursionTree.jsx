import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, ArrowDown, ArrowUp, Maximize2, Minimize2 } from 'lucide-react'

const getNodeLabel = (node) => {
  if (!node.params) return node.label
  const formatVal = (v) => {
    if (Array.isArray(v)) return v.length > 4 ? `[${v.slice(0,3).join(',')},..]` : `[${v.join(',')}]`
    if (typeof v === 'boolean') return v ? 'T' : 'F'
    return String(v)
  }
  const fnName = node.label ? node.label.split('(')[0] : ''
  const keys = Object.keys(node.params)
  const interestingKeys = keys.filter(k => !['ans', 'res', 'result', 'nums', 'arr', 'freq', 'visited'].includes(k))
  const vals = (interestingKeys.length > 0 ? interestingKeys : keys).map(k => formatVal(node.params[k]))
  const str = vals.join(', ')
  const paramsStr = str.length > 18 ? str.substring(0, 16) + '..' : str
  return `${fnName}(${paramsStr})`
}

export default function RecursionTree({ nodes, currentNodeId, executionPhase, isExpanded = false, onToggleExpand }) {
  const viewportRef = useRef(null)
  const contentRef = useRef(null)
  const [fitScale, setFitScale] = useState(1)

  const { treeData, labelFrequencies, maxFreq } = useMemo(() => {
    if (!nodes || nodes.length === 0) return { treeData: null, labelFrequencies: {}, maxFreq: 1 }

    const nodeMap = {}
    const freqs = {}
    let max = 1

    nodes.forEach(node => {
      nodeMap[node.id] = {
        ...node,
        children: [],
      }
      
      const label = getNodeLabel(node)
      freqs[label] = (freqs[label] || 0) + 1
      if (freqs[label] > max) max = freqs[label]
    })

    let root = null
    nodes.forEach(node => {
      if (node.parentId === null) {
        root = nodeMap[node.id]
      } else if (nodeMap[node.parentId]) {
        nodeMap[node.parentId].children.push(nodeMap[node.id])
      }
    })

    return { treeData: root, labelFrequencies: freqs, maxFreq: max }
  }, [nodes])

  const layout = useMemo(() => {
    if (!treeData) return null

    const GAP = 16

    const widthById = {}
    const childSpanById = {}

    const measure = (node) => {
      if (!node) return 90
      
      const labelStr = getNodeLabel(node)
      // Approximate width based on character count for font-mono text-lg + padding
      const nodeNeededWidth = Math.max(90, labelStr.length * 11 + 40)

      const children = node.children ?? []
      if (children.length === 0) {
        widthById[node.id] = nodeNeededWidth
        childSpanById[node.id] = 0
        return nodeNeededWidth
      }

      const childWidths = children.map(measure)
      const span = childWidths.reduce((a, b) => a + b, 0) + GAP * Math.max(children.length - 1, 0)
      const w = Math.max(nodeNeededWidth, span)
      widthById[node.id] = w
      childSpanById[node.id] = span
      return w
    }

    const rootWidth = measure(treeData)
    return { rootWidth, widthById, childSpanById, gap: GAP }
  }, [treeData])

  useEffect(() => {
    const viewportEl = viewportRef.current
    const contentEl = contentRef.current
    if (!viewportEl || !contentEl || !treeData) {
      setFitScale(1)
      return undefined
    }

    const computeScale = () => {
      const availableWidth = Math.max(viewportEl.clientWidth - 24, 1)
      const availableHeight = Math.max(viewportEl.clientHeight - 24, 1)
      const contentWidth = Math.max(contentEl.scrollWidth, 1)
      const contentHeight = Math.max(contentEl.scrollHeight, 1)
      const scaleX = availableWidth / contentWidth
      const scaleY = availableHeight / contentHeight
      const nextScale = Math.min(1, scaleX, scaleY)
      setFitScale(nextScale > 0 ? nextScale : 1)
    }

    const rafId = requestAnimationFrame(computeScale)
    const observer = new ResizeObserver(computeScale)
    observer.observe(viewportEl)
    observer.observe(contentEl)
    window.addEventListener('resize', computeScale)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
      window.removeEventListener('resize', computeScale)
    }
  }, [treeData, layout?.rootWidth, nodes?.length])

  const getNodeStyle = (node, depth = 0) => {
    const isActive = node.id === currentNodeId
    const label = getNodeLabel(node)
    const freq = labelFrequencies[label] || 1

    let defaultBg, defaultText

    if (freq <= 1) {
      defaultBg = 'bg-blue-500 border-blue-600'
      defaultText = 'text-white'
    } else {
      const effectiveMax = Math.max(maxFreq, 4)
      const ratio = Math.min((freq - 1) / (effectiveMax - 1), 1)
      
      const heatColors = [
        { bg: 'bg-blue-500 border-blue-600', text: 'text-white' },
        { bg: 'bg-indigo-500 border-indigo-600', text: 'text-white' },
        { bg: 'bg-violet-500 border-violet-600', text: 'text-white' },
        { bg: 'bg-purple-500 border-purple-600', text: 'text-white' },
        { bg: 'bg-fuchsia-500 border-fuchsia-600', text: 'text-white' },
        { bg: 'bg-rose-500 border-rose-600', text: 'text-white' },
        { bg: 'bg-red-500 border-red-600', text: 'text-white' },
      ]
      
      const index = Math.min(Math.round(ratio * (heatColors.length - 1)), heatColors.length - 1)
      defaultBg = heatColors[index].bg
      defaultText = heatColors[index].text
    }

    if (isActive && executionPhase === 'calling') {
      return {
        container: `scale-[1.15] border-[3px] border-amber-400 ${defaultBg} shadow-lg shadow-amber-500/40 z-10`,
        text: `${defaultText} text-lg`,
      }
    }

    if (isActive && executionPhase === 'returning') {
      return {
        container: `scale-[1.1] border-[3px] border-emerald-400 ${defaultBg} shadow-lg shadow-emerald-500/40 z-10`,
        text: `${defaultText} text-lg`,
      }
    }

    return {
      container: `border-[2px] ${defaultBg} shadow-md`,
      text: `${defaultText} text-lg`,
    }
  }

  const renderNode = (node, depth = 0) => {
    if (!node) return null

    const nodeWidth = layout?.widthById?.[node.id] ?? 180
    const childSpan = layout?.childSpanById?.[node.id] ?? 0

    const style = getNodeStyle(node, depth)
    const hasChildren = node.children && node.children.length > 0

    return (
      <motion.div
        key={node.id}
        className="flex flex-col items-center"
        style={{ width: `${nodeWidth}px` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: depth * 0.08, duration: 0.4, ease: 'easeOut' }}
      >
        <motion.div
          className={`relative rounded-full flex h-12 min-w-[3rem] items-center justify-center px-3 font-mono transition-colors shadow-lg ${style.container}`}
          whileHover={{ scale: 1.02 }}
          layout
        >
          <div className={`font-bold ${style.text}`}>
            {getNodeLabel(node)}
          </div>
        </motion.div>

        {node.returned && node.returnValue !== undefined && (
          <motion.div
            className={`text-[11px] font-bold mt-1 text-muted-foreground`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            ret: {JSON.stringify(node.returnValue)}
          </motion.div>
        )}

        {hasChildren && (
          <>
            <div className="w-full flex justify-center z-0 relative py-2">
              <svg width={nodeWidth} height={40} className="overflow-visible">
                <defs>
                  <marker id={`arrow-${node.id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-border opacity-70" />
                  </marker>
                  <marker id={`arrow-active-calling-${node.id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-amber-500" />
                  </marker>
                  <marker id={`arrow-active-returning-${node.id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" className="fill-blue-500" />
                  </marker>
                </defs>

                {node.children.map((c, i) => {
                  let currentX = 0;
                  for (let j = 0; j < i; j++) {
                    currentX += (layout?.widthById?.[node.children[j].id] ?? 180) + (layout?.gap ?? 32);
                  }
                  const cWidth = layout?.widthById?.[c.id] ?? 180;
                  const childCenterInGrid = currentX + cWidth / 2;
                  const gridLeftOffset = (nodeWidth - childSpan) / 2;
                  const targetX = gridLeftOffset + childCenterInGrid;

                  const isChildActive = c.id === currentNodeId;
                  const isCalling = isChildActive && executionPhase === 'calling';
                  const isReturning = isChildActive && executionPhase === 'returning';
                  
                  const strokeClass = isCalling ? 'stroke-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                                   : isReturning ? 'stroke-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' 
                                   : 'stroke-border opacity-70';
                  
                  const strokeWidth = isChildActive ? 3 : 2;

                  const parentX = nodeWidth / 2;
                  
                  const x1 = isReturning ? targetX : parentX;
                  const y1 = isReturning ? 40 : 0;
                  const x2 = isReturning ? parentX : targetX;
                  const y2 = isReturning ? 0 : 40;
                  
                  const markerId = isCalling ? `url(#arrow-active-calling-${node.id})` 
                                 : isReturning ? `url(#arrow-active-returning-${node.id})` 
                                 : `url(#arrow-${node.id})`;

                  return (
                    <motion.line
                      key={c.id}
                      x1={x1} y1={y1}
                      x2={x2} y2={y2}
                      className={strokeClass}
                      strokeWidth={strokeWidth}
                      markerEnd={markerId}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: depth * 0.08 + 0.2 }}
                    />
                  )
                })}
              </svg>
            </div>

            <div className="mt-0 z-10 relative">
              <AnimatePresence mode="popLayout">
                <div
                  className="grid items-start justify-center"
                  style={{
                    gridTemplateColumns: node.children.map((c) => `${layout?.widthById?.[c.id] ?? 180}px`).join(' '),
                    columnGap: `${layout?.gap ?? 32}px`,
                  }}
                >
                  {node.children.map((child) => (
                    <div key={child.id} className="flex flex-col items-center">
                      {renderNode(child, depth + 1)}
                    </div>
                  ))}
                </div>
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    )
  }

  return (
    <Card className="app-panel flex h-full flex-col overflow-hidden">
      <div className="bg-[#059669] text-white text-center py-2 text-[22px] tracking-wide font-sans z-10 shadow-sm relative flex items-center justify-center">
        <span>Recursion Tree</span>
        <div className="absolute right-4 flex items-center gap-3">
          {treeData && (
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-mono text-xs font-medium">
              {nodes?.length} calls
            </span>
          )}
          <button
            type="button"
            onClick={onToggleExpand}
            className="bg-white/10 hover:bg-white/20 rounded-md p-1.5 transition-colors"
            aria-label={isExpanded ? 'Minimize recursion tree' : 'Maximize recursion tree'}
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div ref={viewportRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent p-6">
        <AnimatePresence>
          {treeData ? (
            <div className="flex min-h-full items-start justify-center">
              <div
                ref={contentRef}
                style={{
                  width: layout?.rootWidth ? `${layout.rootWidth}px` : 'max-content',
                  transform: `scale(${fitScale})`,
                  transformOrigin: 'top center',
                }}
              >
                {renderNode(treeData, 0)}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <GitBranch className="h-10 w-10 text-border" />
              <p className="font-sans text-sm text-muted-foreground">Press Run or Step to build the tree</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
