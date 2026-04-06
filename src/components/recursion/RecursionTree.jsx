/**
 * RecursionTree.jsx
 *
 * Visualizes the recursion tree in an interactive, animated format.
 * Shows parent-child relationships, execution flow, and return values.
 * Fully structured and centered for optimal visibility.
 */

import React, { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, ArrowDown } from 'lucide-react'

export default function RecursionTree({ nodes, currentNodeId, executionPhase }) {
  const treeData = useMemo(() => {
    if (!nodes || nodes.length === 0) return null

    // Build tree structure from nodes
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

    // Deterministic tree layout: compute subtree widths so parent nodes
    // stay centered above their children across varying branching factors.
    const LEAF_W = 180
    const GAP = 32 // matches gap-8

    const widthById = {}
    const childSpanById = {}

    const measure = (node) => {
      if (!node) return LEAF_W
      const children = node.children ?? []
      if (children.length === 0) {
        widthById[node.id] = LEAF_W
        childSpanById[node.id] = 0
        return LEAF_W
      }

      const childWidths = children.map(measure)
      const span = childWidths.reduce((a, b) => a + b, 0) + GAP * Math.max(children.length - 1, 0)
      const w = Math.max(LEAF_W, span)
      widthById[node.id] = w
      childSpanById[node.id] = span
      return w
    }

    const rootWidth = measure(treeData)
    return { rootWidth, widthById, childSpanById, leafWidth: LEAF_W, gap: GAP }
  }, [treeData])

  const getNodeStyle = (node) => {
    const isActive = node.id === currentNodeId

    if (isActive && executionPhase === 'calling') {
      return {
        container: 'scale-[1.02] border-2 border-tokyo-orange bg-tokyo-deep',
        text: 'font-semibold text-tokyo-orange',
      }
    }

    if (isActive && executionPhase === 'returning') {
      return {
        container: 'scale-[1.02] border-2 border-tokyo-magenta bg-tokyo-deep',
        text: 'font-semibold text-tokyo-magenta',
      }
    }

    if (node.isBaseCase && node.returned) {
      return {
        container: 'border border-tokyo-green bg-tokyo-deep',
        text: 'text-tokyo-green',
      }
    }

    if (node.returned) {
      return {
        container: 'border border-tokyo-border bg-tokyo-deep opacity-90',
        text: 'text-tokyo-comment',
      }
    }

    if (node.isBaseCase) {
      return {
        container: 'border-2 border-tokyo-green bg-tokyo-deep',
        text: 'text-tokyo-green',
      }
    }

    return {
      container: 'border border-tokyo-blue/60 bg-tokyo-storm',
      text: 'text-tokyo-fg',
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
        {/* Node Card */}
        <motion.div
          className={`relative rounded-md px-3 py-2 font-mono text-sm transition-colors ${style.container}`}
          whileHover={{ scale: 1.02 }}
          layout
        >
          {/* Depth Badge */}
          <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-tokyo-border bg-tokyo-night text-[10px] font-bold text-tokyo-muted">
            {depth}
          </div>

          <div className={`font-semibold ${style.text}`}>{node.label}</div>

          {/* Return Value */}
          {node.returned && node.returnValue !== undefined && (
            <motion.div
              className={`text-xs mt-1 flex items-center justify-center gap-1 ${style.text}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <ArrowDown className="w-3 h-3" />
              <span>→ {JSON.stringify(node.returnValue)}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Children Connections */}
        {hasChildren && (
          <>
            {/* Vertical Stem */}
            <motion.div
              className="h-6 w-0.5 bg-tokyo-border"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: depth * 0.08 + 0.2 }}
              origin="top"
            />

            {/* Horizontal Bar (exactly spans the children group) */}
            {node.children.length > 1 && childSpan > 0 && (
              <motion.div
                className="h-px bg-tokyo-border"
                style={{ width: `${childSpan}px` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: depth * 0.08 + 0.3 }}
                origin="center"
              />
            )}

            {/* Children Container */}
            <div className="mt-2">
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
                      {/* Vertical Connector for each child */}
                      {node.children.length > 1 && (
                        <motion.div
                          className="h-4 w-0.5 bg-tokyo-border"
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
      <div className="app-panel-head flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-tokyo-blue" />
        <span className="text-sm font-semibold text-tokyo-fg">Recursion tree</span>
        {treeData && (
          <span className="ml-auto rounded-full border border-tokyo-border bg-tokyo-deep px-2.5 py-0.5 font-mono text-xs text-tokyo-muted">
            {nodes?.length} calls
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-tokyo-night p-6">
        <AnimatePresence>
          {treeData ? (
            <div
              className="mx-auto flex justify-center"
              style={{ minWidth: layout?.rootWidth ? `${layout.rootWidth}px` : 'max-content' }}
            >
              {renderNode(treeData, 0)}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-tokyo-comment">
              <GitBranch className="mb-3 h-10 w-10 text-tokyo-border" />
              <p className="text-sm font-medium text-tokyo-muted">No tree yet</p>
              <p className="mt-1 text-xs text-tokyo-comment">Press Run or Step to begin</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
