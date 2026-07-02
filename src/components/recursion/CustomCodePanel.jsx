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
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Code className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-wide uppercase text-foreground">Custom Java code</span>
        </div>
        <Badge variant="secondary" className="text-xs font-medium">
          Local only
        </Badge>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-semibold">Java recursive method</Label>
            <Button variant="outline" size="sm" onClick={() => setCode(JAVA_TEMPLATE)} className="app-btn-secondary h-8 text-xs">
              Load template
            </Button>
          </div>
        </div>

        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="flex-1 space-y-2">
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">Requirements</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Write a valid Java recursive method.</li>
                  <li>
                    End with a call, e.g.{' '}
                    <code className="rounded bg-background border border-border/50 px-1.5 py-0.5 font-mono text-primary font-medium shadow-sm">factorial(5);</code>
                  </li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Tip:</span> Use Load template to get started.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close help"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          <Textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={`Paste your Java recursive method here...\n\nExample:\npublic int factorial(int n) {\n    if (n <= 1) {\n        return 1;\n    }\n    return n * factorial(n - 1);\n}\n\nfactorial(5);`}
            className="min-h-[300px] resize-y border-border/50 bg-muted/20 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary shadow-inner"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 shadow-sm"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">Analysis error</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{error}</p>
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
