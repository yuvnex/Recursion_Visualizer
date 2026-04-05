import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Code, Play, AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const JAVA_TEMPLATE = `public int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

// Call the function with input
factorial(5);`

export default function CustomCodePanel({ onAnalyze, isAnalyzing, error }) {
  const [code, setCode] = useState('')
  const [showHelp, setShowHelp] = useState(true)

  return (
    <Card className="app-panel overflow-hidden">
      <div className="app-panel-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-tokyo-blue" />
          <span className="text-sm font-semibold text-tokyo-fg">Custom Java code</span>
        </div>
        <Badge variant="outline" className="border-tokyo-border bg-tokyo-deep text-xs font-medium text-tokyo-comment">
          Local only
        </Badge>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-tokyo-fg">Java recursive method</Label>
            <Button variant="outline" onClick={() => setCode(JAVA_TEMPLATE)} className="app-btn-secondary">
              Load template
            </Button>
          </div>
        </div>

        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-md border border-tokyo-border bg-tokyo-deep p-3"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-tokyo-blue" />
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold text-tokyo-magenta">Requirements</p>
                <ul className="list-inside list-disc space-y-0.5 text-xs text-tokyo-muted">
                  <li>Define your recursive method with valid Java syntax.</li>
                  <li>
                    End with a call, e.g.{' '}
                    <code className="rounded bg-tokyo-night px-1 font-mono text-tokyo-green">factorial(5);</code>
                  </li>
                </ul>
                <p className="mb-1 mt-2 text-xs font-medium text-tokyo-fg">Avoid</p>
                <ul className="list-inside list-disc space-y-0.5 text-xs text-tokyo-comment">
                  <li>Heavy class boilerplate when possible—method + call is easiest.</li>
                  <li>
                    Scanner, file I/O, or <code className="font-mono text-tokyo-teal">main</code> dependencies.
                  </li>
                </ul>
                <p className="mt-2 text-xs text-tokyo-comment">
                  <span className="text-tokyo-fg">Tip:</span> use Load template for a starter. Runs in the browser; code is transpiled for tracing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-tokyo-comment hover:text-tokyo-fg"
                aria-label="Close help"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          <Label className="text-tokyo-fg">
            Java recursive method code
            <span className="ml-2 text-xs text-tokyo-comment">(include a method call at the end)</span>
          </Label>
          <Textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={`Paste your Java recursive method here...\n\nExample:\npublic int factorial(int n) {\n    if (n <= 1) {\n        return 1;\n    }\n    return n * factorial(n - 1);\n}\n\nfactorial(5);`}
            className="min-h-[300px] resize-y border-tokyo-border bg-tokyo-night font-mono text-sm text-tokyo-fg placeholder:text-tokyo-comment focus-visible:ring-tokyo-blue"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-md border border-tokyo-red/50 bg-tokyo-deep p-3"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-tokyo-red" />
            <div>
              <p className="text-sm font-medium text-tokyo-red">Analysis error</p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-tokyo-muted">{error}</p>
            </div>
          </motion.div>
        )}

        <Button
          onClick={() => onAnalyze({ language: 'java', code })}
          disabled={!code.trim() || isAnalyzing}
          className="w-full app-btn-primary border-transparent"
        >
          {isAnalyzing ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing…</>
          ) : (
            <><Play className="mr-2 h-4 w-4" />Analyze &amp; Visualize</>
          )}
        </Button>
      </div>
    </Card>
  )
}
