import React from 'react'
import SeoArticleContent from '@/components/seo/SeoArticleContent'
import { getAlgorithmByIdOrSlug } from './algorithmData'
import { Link } from 'react-router-dom'
import { CheckCircle, Zap, Shield, GitBranch, Cpu, Code2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const fibAlgo = getAlgorithmByIdOrSlug('fibonacci')
const factAlgo = getAlgorithmByIdOrSlug('factorial')
const binSearchAlgo = getAlgorithmByIdOrSlug('binarySearch')
const mergeSortAlgo = getAlgorithmByIdOrSlug('mergeSort')
const quickSortAlgo = getAlgorithmByIdOrSlug('quickSort')
const nQueensAlgo = getAlgorithmByIdOrSlug('nQueens')
const backtrackingAlgo = getAlgorithmByIdOrSlug('backtracking')

export const seoRoutes = [
  {
    path: '/',
    title: 'Recursion Visualizer – Visualize Recursion Trees Online | Recursify',
    description: 'Visualize recursion step by step with Recursify. Explore recursion trees, function calls, backtracking and DSA algorithms interactively.',
    keywords: 'recursion visualizer, recursion tree, call stack, DSA, algorithm visualizer, recursify',
    initialExampleId: 'factorial',
    content: (
      <div className="space-y-12 text-foreground font-sans">
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            <span>The #1 Interactive Recursion Visualizer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Visualize Recursion Step-by-Step Online
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Watch recursion trees build dynamically, trace stack frames on the call stack in real-time, and master complex algorithms with Recursify.
          </p>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <GitBranch className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Dynamic Recursion Tree</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every recursive invocation spawns a visual node in real time. Base cases glow green upon evaluation, propagating return values directly up the tree.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Live Call Stack</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Inspect active stack frames, argument states, and return unwinding in strict LIFO order, mirroring exact compiler and JVM execution context.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">100% Offline & Fast</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Zero server latency, zero API keys required for pre-built algorithms. Step forwards, backwards, adjust speeds, or test your custom recursive logic.
            </p>
          </div>
        </section>

        {/* Popular Algorithm Hub */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Popular Recursion Algorithms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Fibonacci Sequence', path: '/fibonacci-recursion', desc: 'Exponential recursion tree with overlapping branches', time: 'O(2ⁿ)' },
              { title: 'Factorial', path: '/factorial-recursion', desc: 'Linear recursion stack and mathematical unwinding', time: 'O(n)' },
              { title: 'Binary Search', path: '/binary-search-recursion', desc: 'Divide and conquer logarithmic search space reduction', time: 'O(log n)' },
              { title: 'Merge Sort', path: '/merge-sort-visualizer', desc: 'Recursive divide-and-conquer array partitioning & merging', time: 'O(n log n)' },
              { title: 'Quick Sort', path: '/quick-sort-visualizer', desc: 'Pivot partitioning and recursive sub-array sorting', time: 'O(n log n)' },
              { title: 'N-Queens Backtracking', path: '/n-queens-visualizer', desc: 'Constraint satisfaction and recursive backtracking', time: 'O(N!)' },
            ].map(algo => (
              <Link 
                key={algo.path} 
                to={algo.path}
                className="p-5 rounded-xl border border-border/50 bg-card/40 hover:bg-card hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{algo.title}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-primary font-semibold">{algo.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{algo.desc}</p>
                </div>
                <div className="pt-3 flex items-center text-xs font-semibold text-primary gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Visualize algorithm</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    )
  },
  {
    path: '/recursion-visualizer',
    title: 'Recursion Visualizer – Visualize Recursion Trees Online | Recursify',
    description: 'Visualize recursion step by step with Recursify. Explore recursion trees, function calls, backtracking and DSA algorithms interactively.',
    keywords: 'recursion visualizer, visualize recursion code, recursion tree online, call stack animation',
    initialExampleId: 'factorial',
    content: (
      <div className="space-y-12 text-foreground font-sans">
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            <span>Online Interactive Visualizer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Interactive Recursion Visualizer
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Understand how recursive functions call themselves, explore call stack frames, and watch the recursion tree grow and collapse in real time.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            How to Use the Recursion Visualizer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-border/60 bg-card/40 space-y-2">
              <span className="text-xs font-bold text-primary">STEP 1</span>
              <h3 className="font-bold text-foreground">Select an Algorithm or Write Custom Code</h3>
              <p className="text-sm text-muted-foreground">Choose from classic examples (Fibonacci, Merge Sort, N-Queens) or switch to Custom Code mode to analyze your own code.</p>
            </div>
            <div className="p-5 rounded-xl border border-border/60 bg-card/40 space-y-2">
              <span className="text-xs font-bold text-primary">STEP 2</span>
              <h3 className="font-bold text-foreground">Adjust Parameters & Speed</h3>
              <p className="text-sm text-muted-foreground">Modify input arguments directly in the Inputs panel. Set playback speed from 0.25x up to 2x for fast or granular inspection.</p>
            </div>
            <div className="p-5 rounded-xl border border-border/60 bg-card/40 space-y-2">
              <span className="text-xs font-bold text-primary">STEP 3</span>
              <h3 className="font-bold text-foreground">Run & Step Through Execution</h3>
              <p className="text-sm text-muted-foreground">Click 'Run' to start automatic animation, or use 'Step' and 'Prev' buttons to inspect single call stack and tree mutations.</p>
            </div>
            <div className="p-5 rounded-xl border border-border/60 bg-card/40 space-y-2">
              <span className="text-xs font-bold text-primary">STEP 4</span>
              <h3 className="font-bold text-foreground">Share Your Visualization</h3>
              <p className="text-sm text-muted-foreground">Click the 'Share' button at the top to copy a direct link to the active algorithm example and share it with peers.</p>
            </div>
          </div>
        </section>
      </div>
    )
  },
  {
    path: '/fibonacci-recursion',
    title: 'Fibonacci Recursion Visualizer | Recursify',
    description: 'Visualize Fibonacci recursion step by step with Recursify. Explore recursion trees, function calls, and understand how Fibonacci recursion works.',
    keywords: 'fibonacci recursion visualizer, fibonacci recursion tree, fibonacci call stack, recursive fibonacci, overlapping subproblems',
    initialExampleId: 'fibonacci',
    content: (
      <SeoArticleContent
        h1Title="Fibonacci Recursion Visualizer"
        subtitle="Step through the Fibonacci sequence recursively and watch the exponential recursion tree unfold."
        algorithm={fibAlgo}
        keyHighlights={[
          'Binary branching generates 2 recursive calls per non-base node: fib(n-1) and fib(n-2)',
          'Demonstrates O(2ⁿ) exponential time complexity due to redundant subproblem recalculation',
          'Call stack depth is bounded at O(n) maximum simultaneous frames',
          'Visually illustrates why Dynamic Programming / Memoization is essential for optimization'
        ]}
      />
    )
  },
  {
    path: '/factorial-recursion',
    title: 'Factorial Recursion Visualizer | Recursify',
    description: 'Visualize Factorial recursion step by step with Recursify. Explore linear recursion trees, call stacks, and base cases interactively.',
    keywords: 'factorial recursion visualizer, factorial call stack, linear recursion tree, recursive factorial',
    initialExampleId: 'factorial',
    content: (
      <SeoArticleContent
        h1Title="Factorial Recursion Visualizer"
        subtitle="Trace linear recursive function calls and call stack multiplication unwinding step by step."
        algorithm={factAlgo}
        keyHighlights={[
          'Linear recursion tree where each call has exactly one direct child node',
          'Base case n <= 1 halts recursion and initiates stack unwinding',
          'Time Complexity is O(n) because exactly n function calls are made',
          'Space Complexity is O(n) proportional to the call stack depth'
        ]}
      />
    )
  },
  {
    path: '/binary-search-recursion',
    title: 'Binary Search Recursion Visualizer | Recursify',
    description: 'Visualize Binary Search recursion step by step. See logarithmic search space reduction and divide-and-conquer call stacks.',
    keywords: 'binary search recursion, binary search visualizer, divide and conquer recursion, binary search tree',
    initialExampleId: 'binarySearch',
    content: (
      <SeoArticleContent
        h1Title="Binary Search Recursion Visualizer"
        subtitle="Visualize logarithmic divide-and-conquer search space halving in real-time."
        algorithm={binSearchAlgo}
        keyHighlights={[
          'Halves the active search space at each recursive invocation by comparing target against mid element',
          'Logarithmic time complexity O(log n) ensures lightning-fast searches in sorted arrays',
          'Single recursive path avoids exponential tree branching',
          'Base cases: element found (arr[mid] == target) or not found (low > high)'
        ]}
      />
    )
  },
  {
    path: '/merge-sort-visualizer',
    title: 'Merge Sort Visualizer - Divide & Conquer Recursion | Recursify',
    description: 'Interactive Merge Sort recursion visualizer. Step through divide-and-conquer recursion trees, array splitting, and merge operations.',
    keywords: 'merge sort visualizer, divide and conquer recursion, merge sort recursion tree, sort visualizer',
    initialExampleId: 'mergeSort',
    content: (
      <SeoArticleContent
        h1Title="Merge Sort Recursion Visualizer"
        subtitle="Experience divide-and-conquer recursion as arrays split down to base units and merge into sorted order."
        algorithm={mergeSortAlgo}
        keyHighlights={[
          'Divide Phase: recursively splits array in halves until subarrays of size 1 are reached',
          'Conquer Phase: merges sorted sub-arrays back together in linear O(n) time per level',
          'Guaranteed O(n log n) time complexity across best, average, and worst cases',
          'Stable sorting algorithm requiring O(n) auxiliary space'
        ]}
      />
    )
  },
  {
    path: '/quick-sort-visualizer',
    title: 'Quick Sort Visualizer - Step-by-Step Recursion | Recursify',
    description: 'Visualize Quick Sort algorithm with interactive recursion trees, partition steps, and pivot element tracking.',
    keywords: 'quick sort visualizer, quicksort recursion tree, partition recursion, dsa sorting visualizer',
    initialExampleId: 'quickSort',
    content: (
      <SeoArticleContent
        h1Title="Quick Sort Recursion Visualizer"
        subtitle="Explore in-place array partitioning and recursive sub-array sorting around a pivot element."
        algorithm={quickSortAlgo}
        keyHighlights={[
          'Partitions array around a pivot such that elements smaller than pivot go left and larger go right',
          'Recursively applies quickSort to left and right partitions independently',
          'Average time complexity of O(n log n) with minimal O(log n) stack memory overhead',
          'Base case: subarray has 1 or 0 elements (low >= high)'
        ]}
      />
    )
  },
  {
    path: '/n-queens-visualizer',
    title: 'N-Queens Visualizer - Backtracking Recursion | Recursify',
    description: 'Visualize the classic N-Queens backtracking puzzle. Step through board placements, conflict detection, and recursive backtracking.',
    keywords: 'n queens visualizer, n queens backtracking recursion, n queens tree, recursion backtracking',
    initialExampleId: 'nQueens',
    content: (
      <SeoArticleContent
        h1Title="N-Queens Backtracking Visualizer"
        subtitle="Watch state-space exploration, column conflict pruning, and recursive backtracking on a chessboard."
        algorithm={nQueensAlgo}
        keyHighlights={[
          'Places queens row by row while enforcing row, column, and diagonal non-attack rules',
          'Backtracks immediately when no safe column exists in the current row',
          'Demonstrates state-space search pruning to avoid exhaustive O(N^N) brute force',
          'Base case: row == N indicates a complete valid chessboard solution'
        ]}
      />
    )
  },
  {
    path: '/backtracking-visualizer',
    title: 'Backtracking Visualizer - State Space Trees & Subsets | Recursify',
    description: 'Master backtracking with interactive state-space recursion trees. Step through include/exclude decision branches and search pruning.',
    keywords: 'backtracking visualizer, subset recursion tree, generate subsets recursion, backtracking dsa',
    initialExampleId: 'backtracking',
    content: (
      <SeoArticleContent
        h1Title="Backtracking Recursion Visualizer"
        subtitle="Understand recursive decision trees, candidate exploration, and state unwinding."
        algorithm={backtrackingAlgo}
        keyHighlights={[
          'Decision Tree Paradigm: explores candidate paths by making choices and undoing them upon return',
          'Binary inclusion/exclusion branches generate all 2ⁿ subsets of an array',
          'Depth-first exploration minimizes memory usage to O(n) depth',
          'Leaf base cases capture accumulated solution states before unwinding'
        ]}
      />
    )
  },
  {
    path: '/recursion-tree-visualizer',
    title: 'Recursion Tree Visualizer - Build and Trace Trees | Recursify',
    description: 'Generate recursion trees for any algorithm. Trace function calls visually with our recursion tree visualizer to master dynamic programming and DSA.',
    keywords: 'recursion tree visualizer, recursion tree generator, visual recursion tree',
    initialExampleId: 'fibonacci',
    content: (
      <div className="space-y-8 text-foreground font-sans">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Understanding the Recursion Tree</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          A recursion tree is a pictorial representation of an iteration of a recursive relation. Each node represents the cost or state of a single subproblem. By viewing the tree in Recursify, you can visually determine the exact branching factor and time complexity of any algorithm.
        </p>
      </div>
    )
  },
  {
    path: '/recursion-call-stack-visualizer',
    title: 'Call Stack Visualizer - Trace Recursive Functions | Recursify',
    description: 'Watch the execution context and call stack grow and shrink as recursive functions execute. Perfect for debugging and learning computer science.',
    keywords: 'recursion call stack visualizer, visualize call stack, execution context',
    initialExampleId: 'factorial',
    content: (
      <div className="space-y-8 text-foreground font-sans">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">The Call Stack in Recursion</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          The call stack is a LIFO (Last-In, First-Out) data structure that tracks active subroutines. Every recursive invocation pushes a frame with local variables and parameter states. When a base case triggers, return values pop frames off one by one.
        </p>
      </div>
    )
  },
  {
    path: '/visualize-recursion',
    title: 'Visualize Recursion Step by Step | Recursify',
    description: 'Learn how to visualize recursion in algorithms. Trace variables, understand the flow of control, and debug recursive code easily.',
    keywords: 'visualize recursion, learn recursion visually',
    initialExampleId: 'factorial',
    content: (
      <div className="space-y-8 text-foreground font-sans">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Why Visualizing Recursion Matters</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Human cognition is naturally sequential and iterative. Visualizing call trees and stack unwinding reduces cognitive overload and helps bridge the gap between abstract mathematical recurrence and computer hardware execution.
        </p>
      </div>
    )
  },
  {
    path: '/recursion-in-java',
    title: 'Recursion in Java - Visualized Examples | Recursify',
    description: 'Understand how recursion works in Java. Trace method calls on the JVM stack with our visualizer tool.',
    keywords: 'recursion in Java, java recursive method, java call stack',
    initialExampleId: 'binarySearch',
    content: (
      <div className="space-y-8 text-foreground font-sans">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Recursion on the Java Virtual Machine</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          In Java, method invocations push activation records onto thread stacks. If recursion exceeds stack limits, a <code>StackOverflowError</code> occurs. Understanding base cases and recursion trees prevents stack overflows and optimizes algorithm design.
        </p>
      </div>
    )
  },
  {
    path: '/recursion-examples',
    title: 'Common Recursion Examples & Algorithms | Recursify',
    description: 'Explore common recursion examples like Fibonacci, Factorial, Merge Sort, Quick Sort, and Binary Search with interactive visualizations.',
    keywords: 'recursion examples, common recursive algorithms',
    initialExampleId: 'mergeSort',
    content: (
      <div className="space-y-8 text-foreground font-sans">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Top Recursive Algorithms & Data Structures</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Explore essential recursive algorithms from beginner math problems (Factorial, Fibonacci) to advanced divide-and-conquer sorting (Merge Sort, Quick Sort) and backtracking (N-Queens).
        </p>
      </div>
    )
  },
  {
    path: '/factorial-recursion-visualization',
    title: 'Factorial Recursion Visualization | Recursify',
    description: 'Step through the factorial algorithm recursively. Watch how the base case triggers the unwinding of the call stack.',
    keywords: 'factorial recursion visualization, visualize factorial, factorial algorithm',
    initialExampleId: 'factorial',
    content: (
      <SeoArticleContent
        h1Title="Factorial Recursion Visualization"
        subtitle="Step through the factorial algorithm recursively."
        algorithm={factAlgo}
      />
    )
  },
  {
    path: '/fibonacci-recursion-visualization',
    title: 'Fibonacci Recursion Visualization | Recursify',
    description: 'Visualize the exponential time complexity of the naive recursive Fibonacci algorithm. See the overlapping subproblems dynamically.',
    keywords: 'fibonacci recursion visualization, fibonacci recursion tree',
    initialExampleId: 'fibonacci',
    content: (
      <SeoArticleContent
        h1Title="Fibonacci Recursion Visualization"
        subtitle="Visualize overlapping subproblems in naive Fibonacci recursion."
        algorithm={fibAlgo}
      />
    )
  }
]
