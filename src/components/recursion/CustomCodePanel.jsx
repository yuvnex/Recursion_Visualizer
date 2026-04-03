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
    <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-slate-200">Custom Code Input</span>
        </div>
        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
          Paste Your Code
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        {/* Template */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-slate-300">☕ Java Recursive Function</Label>
            <Button
              variant="outline"
              onClick={() => setCode(JAVA_TEMPLATE)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Load Template
            </Button>
          </div>
        </div>

        {/* Help */}
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-xs text-indigo-300 font-bold">Java Code Requirements:</p>
                <ul className="text-xs text-indigo-300/80 space-y-0.5 list-disc list-inside">
                  <li><strong>✓ Method definition</strong> - Define your recursive method with proper Java syntax</li>
                  <li><strong>✓ Method call</strong> - Call the method at the end with arguments, e.g.: <code className="text-indigo-200 bg-indigo-950/50 px-1 rounded">factorial(5);</code></li>
                </ul>
                
                <p className="text-xs text-indigo-300/60 mt-2 mb-1">Things to avoid:</p>
                <ul className="text-xs text-indigo-300/60 space-y-0.5 list-disc list-inside">
                  <li>Access modifiers - Keep methods public</li>
                  <li>Class/interface wrappers - Only include the recursive method</li>
                  <li>Multiple unrelated methods - Focus on one recursive method</li>
                </ul>
                
                <p className="text-xs text-indigo-300/60 mt-2">
                  💡 <strong>Tip:</strong> Click "Load Template" to see a working example
                </p>
                <p className="text-xs text-indigo-300/60">
                  100% offline. No API keys required. Code is auto-transpiled for visualization.
                </p>
              </div>
              <button onClick={() => setShowHelp(false)} className="text-indigo-400/60 hover:text-indigo-400">✕</button>
            </div>
          </motion.div>
        )}

        {/* Code Input */}
        <div className="space-y-2">
          <Label className="text-slate-300">
            Java Recursive Method Code
            <span className="text-slate-500 text-xs ml-2">(include a method call at the end)</span>
          </Label>
          <Textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={`Paste your Java recursive method here...\n\nExample (avoid access modifiers):\npublic int factorial(int n) {\n    if (n <= 1) {\n        return 1;\n    }\n    return n * factorial(n - 1);\n}\n\nfactorial(5);`}
            className="bg-slate-800 border-slate-700 text-slate-200 font-mono text-sm min-h-[300px] resize-y"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400 font-medium">Analysis Error</p>
              <p className="text-xs text-red-300/80 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Submit */}
        <Button
          onClick={() => onAnalyze({ language: 'java', code })}
          disabled={!code.trim() || isAnalyzing}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
        >
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing Code...</>
          ) : (
            <><Play className="w-4 h-4 mr-2" />Analyze & Visualize</>
          )}
        </Button>
      </div>
    </Card>
  )
}
