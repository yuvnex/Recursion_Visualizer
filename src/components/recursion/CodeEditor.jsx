import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code2, Lightbulb } from 'lucide-react'

export default function CodeEditor({ code, onChange, currentLine, isRunning }) {
  const lines = code.split('\n')

  const getLineHighlight = (lineIndex) => {
    if (currentLine === lineIndex && isRunning) {
      return 'border-l-[3px] border-primary bg-primary/10'
    }
    return 'border-l-[3px] border-transparent'
  }

  const isBaseCaseLine = (line) => {
    const patterns = ['return 1', 'return 0', 'return n', 'if (n <= 1)', 'if (n == 0)', 'if (low > high)', 'if (n < 2)']
    return patterns.some(p => line.toLowerCase().includes(p.toLowerCase()))
  }

  const isRecursiveCallLine = (line) => {
    const funcNames = ['factorial', 'fibonacci', 'fib', 'binarySearch', 'search', 'sumArray', 'sum', 'power']
    return funcNames.some(name => {
      const regex = new RegExp(`${name}\\s*\\(`)
      return regex.test(line) && !line.includes('function') && !line.includes('int ') && !line.includes('def ')
    })
  }

  return (
    <Card className="app-panel flex h-full flex-col overflow-hidden">
      <div className="app-panel-head flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Code2 className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-wide uppercase text-foreground">Source</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
            Base case
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium">
            Recursive call
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-background">
        <div className="flex">
          <div className="flex-shrink-0 select-none border-r border-border/50 bg-muted/20 py-4 pl-3 pr-4">
            {lines.map((_, i) => (
              <div key={i} className="min-w-[1.5rem] text-right font-mono text-xs leading-6 text-muted-foreground/60">
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-x-auto py-4">
            {lines.map((line, i) => {
              const isBaseCase = isBaseCaseLine(line)
              const isRecursive = isRecursiveCallLine(line)
              return (
                <div key={i} className={`px-4 leading-6 transition-colors ${getLineHighlight(i)}`}>
                  <code
                    className={`whitespace-pre font-mono text-sm ${
                      isBaseCase ? 'text-green-600 dark:text-green-400 font-medium' : isRecursive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-foreground'
                    }`}
                  >
                    {line || ' '}
                  </code>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          <span>
            <span className="text-green-600 dark:text-green-400 font-medium">Green</span>: likely base case ·{' '}
            <span className="text-blue-600 dark:text-blue-400 font-medium">Blue</span>: likely recursive call
          </span>
        </div>
      </div>
    </Card>
  )
}
