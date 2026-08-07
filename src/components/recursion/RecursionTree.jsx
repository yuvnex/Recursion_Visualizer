import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Maximize2, Minimize2, Play, Pause, SkipBack, SkipForward, Gauge } from 'lucide-react'

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

// ── SVG-based vertical tree renderer with pan & zoom ─────────────────────────

const NODE_H = 44           // height of a node pill
const NODE_PAD_X = 20       // horizontal padding inside the pill
const LEVEL_GAP_Y = 72      // vertical gap between tree levels
const SIBLING_GAP = 24      // minimum horizontal gap between siblings
const RETURN_TAG_H = 18     // height of the return value tag

function measureTextWidth(text) {
  // Approximate monospace char width for 13px font
  return text.length * 8.2 + NODE_PAD_X * 2
}

function layoutTree(root) {
  if (!root) return { positioned: [], edges: [], width: 0, height: 0 }

  // 1. Build a map of subtree widths (bottom-up)
  const subtreeWidth = {}
  const computeWidth = (node) => {
    const label = getNodeLabel(node)
    const nodeW = Math.max(80, measureTextWidth(label))
    const children = node.children ?? []
    if (children.length === 0) {
      subtreeWidth[node.id] = nodeW
      return nodeW
    }
    const childWidths = children.map(computeWidth)
    const totalChildSpan = childWidths.reduce((a, b) => a + b, 0) + SIBLING_GAP * (children.length - 1)
    subtreeWidth[node.id] = Math.max(nodeW, totalChildSpan)
    return subtreeWidth[node.id]
  }
  computeWidth(root)

  // 2. Assign (x, y) positions top-down
  const positioned = []
  const edges = []

  const assign = (node, cx, depth) => {
    const label = getNodeLabel(node)
    const nodeW = Math.max(80, measureTextWidth(label))
    const y = depth * (NODE_H + RETURN_TAG_H + LEVEL_GAP_Y)

    positioned.push({ ...node, x: cx, y, w: nodeW, label })

    const children = node.children ?? []
    if (children.length === 0) return

    const childWidths = children.map(c => subtreeWidth[c.id])
    const totalChildSpan = childWidths.reduce((a, b) => a + b, 0) + SIBLING_GAP * (children.length - 1)

    let startX = cx - totalChildSpan / 2
    children.forEach((child, i) => {
      const childCx = startX + childWidths[i] / 2
      const childY = (depth + 1) * (NODE_H + RETURN_TAG_H + LEVEL_GAP_Y)
      edges.push({ parentId: node.id, childId: child.id, x1: cx, y1: y + NODE_H, x2: childCx, y2: childY })
      assign(child, childCx, depth + 1)
      startX += childWidths[i] + SIBLING_GAP
    })
  }

  assign(root, subtreeWidth[root.id] / 2, 0)

  // 3. Compute bounding box
  let minX = Infinity, maxX = -Infinity, maxY = 0
  positioned.forEach(n => {
    const halfW = n.w / 2
    if (n.x - halfW < minX) minX = n.x - halfW
    if (n.x + halfW > maxX) maxX = n.x + halfW
    if (n.y + NODE_H + RETURN_TAG_H > maxY) maxY = n.y + NODE_H + RETURN_TAG_H
  })

  // Normalize so top-left is at (padding, padding)
  const PAD = 40
  positioned.forEach(n => { n.x -= minX - PAD; n.y += PAD })
  edges.forEach(e => { e.x1 -= minX - PAD; e.x2 -= minX - PAD; e.y1 += PAD; e.y2 += PAD })

  return {
    positioned,
    edges,
    width: maxX - minX + PAD * 2,
    height: maxY + PAD * 2,
  }
}

export default function RecursionTree({ 
  nodes, currentNodeId, executionPhase, isExpanded = false, onToggleExpand,
  isRunning, isPaused, speed, onStart, onPause, onResume, onStep, onPrev, onSpeedChange, isComplete
}) {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ scale: 1, translateX: 0, translateY: 0 })

  const { treeData, labelFrequencies, maxFreq } = useMemo(() => {
    if (!nodes || nodes.length === 0) return { treeData: null, labelFrequencies: {}, maxFreq: 1 }

    const nodeMap = {}
    const freqs = {}
    let max = 1

    nodes.forEach(node => {
      nodeMap[node.id] = { ...node, children: [] }
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

  const { positioned, edges, width: treeW, height: treeH } = useMemo(() => {
    return layoutTree(treeData)
  }, [treeData])

  // Auto-fit scale and centering when the tree changes
  useEffect(() => {
    if (!containerRef.current || !treeData || treeW === 0) return
    
    const updateDimensions = () => {
      const el = containerRef.current
      const availW = el.clientWidth
      const availH = el.clientHeight
      const padding = 16
      const scaleX = (availW - padding) / (treeW || 1)
      const scaleY = (availH - padding) / (treeH || 1)
      const autoScale = Math.min(1, scaleX, scaleY)
      const scale = autoScale > 0.1 ? autoScale : 0.5
      
      const scaledWidth = treeW * scale
      const translateX = Math.max((availW - scaledWidth) / 2, padding / 2)
      
      setDimensions({ scale, translateX, translateY: padding / 2 })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [treeData, treeW, treeH, isExpanded])

  const getNodeFill = (node) => {
    const isActive = node.id === currentNodeId
    const label = getNodeLabel(node)
    const freq = labelFrequencies[label] || 1

    // Heat-map palette
    const heatColors = [
      { fill: '#3b82f6', stroke: '#2563eb' },  // blue
      { fill: '#6366f1', stroke: '#4f46e5' },  // indigo
      { fill: '#8b5cf6', stroke: '#7c3aed' },  // violet
      { fill: '#a855f7', stroke: '#9333ea' },  // purple
      { fill: '#d946ef', stroke: '#c026d3' },  // fuchsia
      { fill: '#f43f5e', stroke: '#e11d48' },  // rose
      { fill: '#ef4444', stroke: '#dc2626' },  // red
    ]

    let fill, strokeColor
    if (freq <= 1) {
      fill = heatColors[0].fill
      strokeColor = heatColors[0].stroke
    } else {
      const effectiveMax = Math.max(maxFreq, 4)
      const ratio = Math.min((freq - 1) / (effectiveMax - 1), 1)
      const idx = Math.min(Math.round(ratio * (heatColors.length - 1)), heatColors.length - 1)
      fill = heatColors[idx].fill
      strokeColor = heatColors[idx].stroke
    }

    if (isActive && executionPhase === 'calling') {
      return { fill, strokeColor: '#fbbf24', strokeWidth: 4, shadow: 'drop-shadow(0 0 12px rgba(245,158,11,0.6))' }
    }
    if (isActive && executionPhase === 'returning') {
      return { fill, strokeColor: '#34d399', strokeWidth: 4, shadow: 'drop-shadow(0 0 12px rgba(52,211,153,0.6))' }
    }
    return { fill, strokeColor, strokeWidth: 2.5, shadow: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }
  }

  return (
    <Card className="app-panel flex h-full flex-col overflow-hidden">
      <div className="bg-[#059669] text-white py-2 px-2 sm:px-4 z-10 shadow-sm flex items-center justify-between gap-2 overflow-hidden">
        {onStart && isExpanded ? (
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {!isRunning || isPaused ? (
              <button
                onClick={isRunning ? onResume : onStart}
                disabled={isComplete}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-md p-1.5 transition-colors flex items-center justify-center"
                title={isRunning ? 'Resume' : 'Run'}
              >
                <Play className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={onPause}
                className="bg-white/10 hover:bg-white/20 rounded-md p-1.5 transition-colors flex items-center justify-center"
                title="Pause"
              >
                <Pause className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={onPrev}
              disabled={(!isRunning && (nodes?.length || 0) === 0) || (isRunning && !isPaused)}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-md p-1.5 transition-colors flex items-center justify-center"
              title="Previous Step"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              onClick={onStep}
              disabled={isComplete || (isRunning && !isPaused)}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-md p-1.5 transition-colors flex items-center justify-center"
              title="Next Step"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 ml-1 bg-white/10 px-2 py-1 rounded-md">
              <Gauge className="h-3.5 w-3.5 opacity-80" />
              <input
                type="range"
                min={0.25} max={2} step={0.25}
                value={speed || 1}
                onChange={(e) => onSpeedChange && onSpeedChange(parseFloat(e.target.value))}
                className="w-12 sm:w-16 accent-white h-1 cursor-pointer"
              />
              <span className="text-xs font-mono font-medium min-w-[24px] opacity-90">{speed}x</span>
            </div>
          </div>
        ) : (
          <div className="w-8 shrink-0" />
        )}
        
        <span className="text-[16px] sm:text-[22px] tracking-wide font-sans text-center truncate min-w-0 flex-1">
          Recursion Tree
        </span>
        
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-end">
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

      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-transparent relative"
      >
        <AnimatePresence>
          {treeData && positioned.length > 0 ? (
            <svg
              width="100%"
              height="100%"
              className="block"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
                </filter>
                <filter id="node-glow-amber" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.5" />
                </filter>
                <filter id="node-glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#34d399" floodOpacity="0.5" />
                </filter>
                <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                </marker>
                <marker id="arrowhead-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                </marker>
                <marker id="arrowhead-emerald" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
                </marker>
              </defs>

              <g transform={`translate(${dimensions.translateX}, ${dimensions.translateY}) scale(${dimensions.scale})`} style={{ transformOrigin: 'top left' }}>
                {/* Edges */}
                {edges.map((e, i) => {
                  const childActive = e.childId === currentNodeId
                  const isCalling = childActive && executionPhase === 'calling'
                  const isReturning = childActive && executionPhase === 'returning'

                  const midY = (e.y1 + e.y2) / 2
                  const path = isReturning
                    ? `M ${e.x2} ${e.y2} C ${e.x2} ${midY}, ${e.x1} ${midY}, ${e.x1} ${e.y1}`
                    : `M ${e.x1} ${e.y1} C ${e.x1} ${midY}, ${e.x2} ${midY}, ${e.x2} ${e.y2}`

                  return (
                    <motion.path
                      key={`edge-${e.childId}`}
                      initial={{ d: path, opacity: 0, pathLength: 0 }}
                      animate={{ d: path, opacity: 1, pathLength: 1 }}
                      transition={{ duration: 0.5, type: 'spring', bounce: 0 }}
                      fill="none"
                      stroke={isCalling ? '#f59e0b' : isReturning ? '#34d399' : '#94a3b8'}
                      strokeWidth={childActive ? 3 : 1.8}
                      strokeOpacity={childActive ? 1 : 0.6}
                      markerEnd={isCalling ? 'url(#arrowhead-amber)' : isReturning ? 'url(#arrowhead-emerald)' : 'url(#arrowhead)'}
                      style={{
                        filter: childActive ? `drop-shadow(0 0 6px ${isCalling ? 'rgba(245,158,11,0.4)' : 'rgba(52,211,153,0.4)'})` : 'none',
                        transition: 'stroke 0.3s, stroke-width 0.3s',
                      }}
                    />
                  )
                })}

                {/* Nodes */}
                {positioned.map((node) => {
                  const style = getNodeFill(node)
                  const isActive = node.id === currentNodeId
                  const filterAttr = isActive
                    ? (executionPhase === 'calling' ? 'url(#node-glow-amber)' : 'url(#node-glow-emerald)')
                    : 'url(#node-shadow)'

                  return (
                    <motion.g 
                      key={`node-${node.id}`}
                      initial={{ opacity: 0, scale: 0.8, x: node.x, y: node.y - 20 }}
                      animate={{ opacity: 1, scale: 1, x: node.x, y: node.y }}
                      transition={{ duration: 0.5, type: 'spring', bounce: 0.1 }}
                    >
                      {/* Node pill */}
                      <motion.rect
                        initial={{ width: node.w }}
                        animate={{ width: node.w }}
                        transition={{ duration: 0.5, type: 'spring', bounce: 0.1 }}
                        x={-node.w / 2}
                        y={0}
                        height={NODE_H}
                        rx={NODE_H / 2}
                        ry={NODE_H / 2}
                        fill={style.fill}
                        stroke={style.strokeColor}
                        strokeWidth={style.strokeWidth}
                        filter={filterAttr}
                        style={{ transition: 'fill 0.3s, stroke 0.3s' }}
                      />
                      {/* Node label */}
                      <text
                        x={0}
                        y={NODE_H / 2 + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontFamily="'Inter', system-ui, sans-serif"
                        fontSize="13"
                        fontWeight="600"
                        letterSpacing="0.3px"
                      >
                        {node.label}
                      </text>

                      {/* Return value tag */}
                      {node.returned && node.returnValue !== undefined && (() => {
                        const returnStr = typeof node.returnValue === 'object' ? JSON.stringify(node.returnValue) : String(node.returnValue);
                        const displayStr = `→ ${returnStr}`;
                        const tagW = Math.max(60, displayStr.length * 7.5 + 24);
                        const tagH = 22;
                        return (
                          <motion.g
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <rect
                              x={-tagW / 2}
                              y={NODE_H + 4}
                              width={tagW}
                              height={tagH}
                              rx={tagH / 2}
                              fill="#f1f5f9"
                              stroke="#cbd5e1"
                              strokeWidth="1.5"
                              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                            />
                            <text
                              x={0}
                              y={NODE_H + 4 + tagH / 2 + 1}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#0f172a"
                              fontFamily="'Inter', system-ui, sans-serif"
                              fontSize="12"
                              fontWeight="600"
                              letterSpacing="0.2px"
                            >
                              {displayStr}
                            </text>
                          </motion.g>
                        );
                      })()}
                    </motion.g>
                  )
                })}
              </g>
            </svg>
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
