import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Sparkles, Clock, Layers, GitBranch, ArrowRight, Code2, BookOpen, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SeoArticleContent({
  h1Title,
  subtitle,
  algorithm,
  keyHighlights = [],
  customSections = null,
}) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-12 text-foreground font-sans">
      
      {/* ── Header Intro ── */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Recursion Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          {h1Title}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
          {subtitle || algorithm?.description}
        </p>
      </section>

      {/* ── Quick Complexity & Metadata Grid ── */}
      {algorithm && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Time Complexity</span>
            </div>
            <p className="text-lg font-bold font-mono text-primary">{algorithm.timeComplexity}</p>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span>Space Complexity</span>
            </div>
            <p className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">{algorithm.spaceComplexity}</p>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <GitBranch className="h-3.5 w-3.5 text-emerald-500" />
              <span>Difficulty</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{algorithm.difficulty}</p>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <BookOpen className="h-3.5 w-3.5 text-amber-500" />
              <span>Paradigm</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{algorithm.tag || 'Recursion'}</p>
          </div>
        </section>
      )}

      {/* ── Primary CTA Banner ── */}
      <section className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Try It Yourself in the Visualizer
          </h3>
          <p className="text-sm text-muted-foreground">
            Watch the function calls, recursion tree, and call stack animate step by step in real time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button onClick={scrollToTop} className="app-btn-primary px-5 py-2.5 flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span>Visualize Now</span>
          </Button>
          <Button asChild variant="outline" className="app-btn-secondary">
            <Link to="/" className="flex items-center gap-2">
              <span>Main Visualizer</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Algorithm Explanation ── */}
      {algorithm && (
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Algorithm Explanation</span>
          </h2>
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm text-muted-foreground leading-relaxed space-y-4 text-base sm:text-lg">
            <p>{algorithm.explanation}</p>
            {keyHighlights.length > 0 && (
              <div className="pt-2 space-y-2">
                <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Key Takeaways:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {keyHighlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Code Implementation Showcase ── */}
      {algorithm?.code && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Code2 className="h-6 w-6 text-indigo-500" />
              <span>Recursive Code Implementation</span>
            </h2>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-muted text-muted-foreground">Java / TypeScript / JS</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-border/70 bg-[#0d1117] text-slate-100 shadow-md">
            <div className="border-b border-border/20 bg-[#161b22] px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{algorithm.name}.java</span>
              <button 
                onClick={() => navigator.clipboard.writeText(algorithm.code)}
                className="hover:text-white transition-colors"
                title="Copy code"
              >
                Copy
              </button>
            </div>
            <pre className="p-5 font-mono text-sm leading-relaxed overflow-x-auto text-emerald-400 dark:text-emerald-300">
              <code>{algorithm.code}</code>
            </pre>
          </div>
        </section>
      )}

      {/* ── How Recursion Works Step-by-Step ── */}
      {algorithm?.howRecursionWorks && (
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <GitBranch className="h-6 w-6 text-emerald-500" />
            <span>How Recursion Works Step-by-Step</span>
          </h2>
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm text-muted-foreground leading-relaxed text-base sm:text-lg space-y-4">
            <p>{algorithm.howRecursionWorks}</p>
            <div className="rounded-lg bg-muted/40 p-4 border border-border/40 text-sm text-foreground space-y-1">
              <span className="font-semibold text-primary">💡 Visual Tip:</span>
              <p className="text-muted-foreground">
                In the visualizer above, green nodes represent base cases that have completed their evaluation. As results return, you will see child values bubble back up into their parent nodes on the call stack!
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Custom/Additional Sections (if provided) ── */}
      {customSections}

      {/* ── Explore More Algorithms ── */}
      <section className="pt-6 border-t border-border/50 space-y-4">
        <h3 className="text-xl font-bold text-foreground">Explore Other Recursion Visualizers</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { name: 'Fibonacci', path: '/fibonacci-recursion' },
            { name: 'Factorial', path: '/factorial-recursion' },
            { name: 'Binary Search', path: '/binary-search-recursion' },
            { name: 'Merge Sort', path: '/merge-sort-visualizer' },
            { name: 'Quick Sort', path: '/quick-sort-visualizer' },
            { name: 'N-Queens', path: '/n-queens-visualizer' },
            { name: 'Backtracking', path: '/backtracking-visualizer' },
            { name: 'All Examples', path: '/recursion-examples' },
          ].map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="p-3 rounded-xl border border-border/50 bg-card/40 hover:bg-card hover:border-primary/40 transition-all text-sm font-medium text-foreground flex items-center justify-between group"
            >
              <span>{item.name}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
