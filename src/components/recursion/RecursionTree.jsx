import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, ArrowDown, Maximize2, Minimize2 } from 'lucide-react'

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

  const treeData = useMemo(() => {
    if (!nodes || nodes.length === 0) return null

    const nodeMap = {}
    nodes.forEach(node => {
      nodeMap[node.id] = {
        ...node,
        children: [],
      }
    })

    let root = null
    nodes.forEach(node => {
      if (node.parentId === null) {
        root = nodeMap[node.id]
      } else if (nodeMap[node.parentId]) {
        nodeMap[node.parentId].children.push(nodeMap[node.id])
      }
    })

    return root
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

  const getNodeStyle = (node) => {
    const isActive = node.id === currentNodeId

    if (isActive && executionPhase === 'calling') {
      return {
        container: 'scale-[1.05] border-[2px] border-amber-500 bg-amber-50 dark:bg-amber-500/10 shadow-md shadow-amber-500/20 z-10',
        text: 'text-amber-700 dark:text-amber-400 text-lg',
      }
    }

    if (isActive && executionPhase === 'returning') {
      return {
        container: 'scale-[1.05] border-[2px] border-primary bg-primary/10 shadow-md shadow-primary/20 z-10',
        text: 'text-primary text-lg',
      }
    }

    if (node.isBaseCase && node.returned) {
      return {
        container: 'border-[2px] border-green-500/40 bg-green-50 dark:bg-green-500/10 opacity-90',
        text: 'text-green-700 dark:text-green-400 text-lg',
      }
    }

    if (node.returned) {
      return {
        container: 'border-[2px] border-green-500/40 bg-green-50 dark:bg-green-500/10 opacity-90',
        text: 'text-green-700 dark:text-green-400 text-lg',
      }
    }

    if (node.isBaseCase) {
      return {
        container: 'border-[2px] border-blue-500/30 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10',
        text: 'text-blue-700 dark:text-blue-400 text-lg',
      }
    }

    return {
      container: 'border-[2px] border-blue-500/30 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400 text-lg',
    }
  }

  const renderNode = (node, depth = 0) => {
    if (!node) return null

    const nodeWidth = layout?.widthById?.[node.id] ?? 180
    const childSpan = layout?.childSpanById?.[node.id] ?? 0

    const style = getNodeStyle(node)
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
            <motion.div
              className="h-6 w-[2px] bg-border"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: depth * 0.08 + 0.2 }}
              origin="top"
            />

            {node.children.length > 1 && childSpan > 0 && (
              <motion.div
                className="h-[2px] bg-border"
                style={{ width: `${childSpan}px` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: depth * 0.08 + 0.3 }}
                origin="center"
              />
            )}

            <div className="mt-0">
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
                      {node.children.length > 1 && (
                        <motion.div
                          className="h-6 w-[2px] bg-border"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: depth * 0.08 + 0.4 }}
                          origin="top"
                        />
                      )}
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
      <div className="app-panel-head flex items-center gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <GitBranch className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-semibold tracking-wide uppercase text-foreground">Recursion tree</span>
        {treeData && (
          <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs font-medium text-muted-foreground">
            {nodes?.length} calls
          </span>
        )}
        <button
          type="button"
          onClick={onToggleExpand}
          className={`${treeData ? '' : 'ml-auto '}app-btn-secondary rounded-md p-1.5`}
          aria-label={isExpanded ? 'Minimize recursion tree' : 'Maximize recursion tree'}
          title={isExpanded ? 'Minimize' : 'Maximize'}
        >
          {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      <div ref={viewportRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-6">
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
              <p className="text-sm font-medium">Press Run or Step to build the tree</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
