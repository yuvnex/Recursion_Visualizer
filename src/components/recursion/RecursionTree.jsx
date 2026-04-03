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

  const getNodeStyle = (node) => {
    const isActive = node.id === currentNodeId

    if (isActive && executionPhase === 'calling') {
      return {
        container: 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/40 ring-2 ring-amber-300 scale-110',
        text: 'text-gray-900 font-bold',
      }
    }

    if (isActive && executionPhase === 'returning') {
      return {
        container: 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/40 ring-2 ring-purple-300 scale-105',
        text: 'text-white font-bold',
      }
    }

    if (node.isBaseCase && node.returned) {
      return {
        container: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/30',
        text: 'text-white',
      }
    }

    if (node.returned) {
      return {
        container: 'bg-gradient-to-br from-slate-600 to-slate-700 opacity-75',
        text: 'text-slate-300',
      }
    }

    if (node.isBaseCase) {
      return {
        container: 'bg-gradient-to-br from-emerald-500/90 to-teal-600/90 shadow-md shadow-emerald-500/20',
        text: 'text-white',
      }
    }

    return {
      container: 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-500/20',
      text: 'text-white',
    }
  }

  const renderNode = (node, depth = 0) => {
    if (!node) return null

    const style = getNodeStyle(node)
    const hasChildren = node.children && node.children.length > 0

    return (
      <motion.div
        key={node.id}
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: depth * 0.08, duration: 0.4, ease: 'easeOut' }}
      >
        {/* Node Card */}
        <motion.div
          className={`relative px-4 py-2.5 rounded-lg font-mono text-sm transition-all duration-300 ${style.container}`}
          whileHover={{ scale: 1.06 }}
          layout
        >
          {/* Depth Badge */}
          <div className="absolute -right-2 -top-2 w-5 h-5 rounded-full bg-slate-900 text-xs flex items-center justify-center border border-slate-700 font-bold text-slate-300">
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
              className="w-0.5 h-6 bg-gradient-to-b from-slate-500 to-slate-600"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: depth * 0.08 + 0.2 }}
              origin="top"
            />

            {/* Horizontal Bar (for multiple children) */}
            {node.children.length > 1 && (
              <motion.div
                className="h-0.5 bg-gradient-to-r from-slate-500 to-slate-500"
                style={{
                  width: `${Math.max(node.children.length * 140, 120)}px`,
                  maxWidth: '100%',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: depth * 0.08 + 0.3 }}
                origin="center"
              />
            )}

            {/* Children Container */}
            <div className="flex gap-8 justify-center mt-2">
              <AnimatePresence mode="popLayout">
                {node.children.map((child) => (
                  <div key={child.id} className="flex flex-col items-center">
                    {/* Vertical Connector for each child */}
                    {node.children.length > 1 && (
                      <motion.div
                        className="w-0.5 h-4 bg-slate-600"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: depth * 0.08 + 0.4 }}
                        origin="top"
                      />
                    )}
                    {renderNode(child, depth + 1)}
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-slate-700/50 overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
        <GitBranch className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-slate-200">Recursion Tree</span>
        {treeData && (
          <span className="ml-auto text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full font-mono">
            {nodes?.length} calls
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence>
          {treeData ? (
            <div className="flex justify-center min-w-max mx-auto">
              {renderNode(treeData, 0)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <GitBranch className="w-12 h-12 mb-3 opacity-25" />
              <p className="text-sm font-medium">No recursion tree yet</p>
              <p className="text-xs mt-1 opacity-75">Click "Run" or "Step" to start</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
