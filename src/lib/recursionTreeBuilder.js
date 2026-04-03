/**
 * recursionTreeBuilder.js
 *
 * Converts execution steps from codeRunner into a hierarchical tree structure
 * for visualization. Handles:
 *  - Building parent-child relationships
 *  - Computing tree depth and positioning
 *  - Tracking execution state (calling, returning, completed)
 *  - Calculating return values and base cases
 */

/**
 * Build a tree structure from execution steps.
 * @param {Array} steps - Execution steps from codeRunner
 * @returns {Array} Tree nodes with parent-child relationships
 */
export function buildRecursionTree(steps) {
  if (!steps || steps.length === 0) return []

  const nodes = new Map() // nodeId -> nodeData
  const callStack = [] // Track which nodes are currently in the call stack

  // First pass: create nodes and establish relationships
  for (const step of steps) {
    if (step.type === 'call') {
      const node = {
        id: step.nodeId,
        label: step.label,
        params: step.params,
        parentId: step.parentId,
        children: [],
        isBaseCase: step.isBaseCase,
        returnValue: null,
        returned: false,
        depth: 0,
      }

      nodes.set(node.id, node)

      // Establish parent-child relationship
      if (step.parentId !== null && nodes.has(step.parentId)) {
        nodes.get(step.parentId).children.push(node.id)
      }
    } else if (step.type === 'return') {
      if (nodes.has(step.nodeId)) {
        const node = nodes.get(step.nodeId)
        node.returnValue = step.value
        node.returned = true
        node.isBaseCase = step.isBaseCase || node.isBaseCase
      }
    }
  }

  // Second pass: compute depths
  const computeDepth = (nodeId, depth = 0) => {
    if (nodes.has(nodeId)) {
      const node = nodes.get(nodeId)
      node.depth = depth
      node.children.forEach(childId => computeDepth(childId, depth + 1))
    }
  }

  // Find root nodes (parentId === null)
  for (const [nodeId, node] of nodes) {
    if (node.parentId === null) {
      computeDepth(nodeId)
    }
  }

  return Array.from(nodes.values())
}

/**
 * Transform tree nodes into a format suitable for the visualization component.
 * @param {Array} nodes - Tree nodes from buildRecursionTree
 * @returns {Array} Transformed nodes with additional visualization metadata
 */
export function transformForVisualization(nodes) {
  return nodes.map(node => ({
    id: node.id,
    label: node.label,
    params: node.params,
    parentId: node.parentId,
    children: node.children,
    isBaseCase: node.isBaseCase,
    returnValue: node.returnValue,
    returned: node.returned,
    depth: node.depth,
    // Colorization hints
    isLeaf: node.children.length === 0,
    hasReturned: node.returned,
  }))
}

/**
 * Generate execution timeline from steps.
 * Useful for animations and step-by-step visualization.
 * @param {Array} steps - Raw execution steps
 * @returns {Array} Timeline events with timestamps
 */
export function generateExecutionTimeline(steps) {
  return steps.map((step, index) => ({
    stepIndex: index,
    type: step.type,
    nodeId: step.nodeId,
    parentId: step.parentId,
    label: step.label,
    returnValue: step.value,
    timestamp: index, // Can be used for animation delays
  }))
}

/**
 * Calculate tree statistics for display.
 * @param {Array} nodes - Tree nodes
 * @returns {Object} Statistics object
 */
export function calculateTreeStats(nodes) {
  if (!nodes || nodes.length === 0) {
    return {
      totalCalls: 0,
      maxDepth: 0,
      baseCases: 0,
      branchingFactor: 0,
    }
  }

  const maxDepth = Math.max(...nodes.map(n => n.depth), 0)
  const baseCases = nodes.filter(n => n.isBaseCase).length
  const rootNode = nodes.find(n => n.parentId === null)
  const avgChildren = rootNode
    ? nodes.reduce((sum, n) => sum + n.children.length, 0) / nodes.length
    : 0

  return {
    totalCalls: nodes.length,
    maxDepth,
    baseCases,
    branchingFactor: parseFloat(avgChildren.toFixed(2)),
  }
}

/**
 * Find the critical path (longest chain from root to leaf).
 * Useful for understanding the primary execution flow.
 * @param {Array} nodes - Tree nodes
 * @returns {Array} Array of nodeIds representing the critical path
 */
export function findCriticalPath(nodes) {
  if (!nodes || nodes.length === 0) return []

  const paths = []

  const traverse = (nodeId, path = []) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    path.push(nodeId)

    if (node.children.length === 0) {
      // Leaf node
      paths.push([...path])
    } else {
      // Continue down each branch
      node.children.forEach(childId => traverse(childId, [...path]))
    }
  }

  // Start from root
  const root = nodes.find(n => n.parentId === null)
  if (root) {
    traverse(root.id)
  }

  // Return longest path
  return paths.length > 0 ? paths.reduce((a, b) => a.length > b.length ? a : b) : []
}

/**
 * Check if recursion tree is healthy (no cycles, valid structure).
 * @param {Array} nodes - Tree nodes
 * @returns {Object} Validation result with isValid flag and messages
 */
export function validateTreeStructure(nodes) {
  const messages = []
  const visited = new Set()

  // Check for cycles
  const hasCycles = (nodeId, path = new Set()) => {
    if (path.has(nodeId)) return true
    path.add(nodeId)

    const node = nodes.find(n => n.id === nodeId)
    if (!node) return false

    for (const childId of node.children) {
      if (hasCycles(childId, new Set(path))) return true
    }
    return false
  }

  for (const node of nodes) {
    if (node.parentId === null && hasCycles(node.id)) {
      messages.push('Cycle detected in recursion tree')
      return { isValid: false, messages }
    }
  }

  // Check for orphaned nodes
  for (const node of nodes) {
    if (node.parentId !== null && !nodes.find(n => n.id === node.parentId)) {
      messages.push(`Node ${node.id} has missing parent ${node.parentId}`)
    }
  }

  // Check for unreferenced children
  for (const node of nodes) {
    for (const childId of node.children) {
      if (!nodes.find(n => n.id === childId)) {
        messages.push(`Node ${node.id} references missing child ${childId}`)
      }
    }
  }

  return {
    isValid: messages.length === 0,
    messages,
  }
}
