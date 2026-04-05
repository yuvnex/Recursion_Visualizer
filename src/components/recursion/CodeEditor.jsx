import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code2, Lightbulb } from 'lucide-react'

export default function CodeEditor({ code, onChange, currentLine, isRunning }) {
  const lines = code.split('\n')

  const getLineHighlight = (lineIndex) => {
    if (currentLine === lineIndex && isRunning) {
      return 'border-l-[3px] border-tokyo-magenta bg-tokyo-highlight/80'
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
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-tokyo-blue" />
          <span className="text-sm font-semibold text-tokyo-fg">Source</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="border-tokyo-border bg-tokyo-deep text-xs text-tokyo-green">
            Base case
          </Badge>
          <Badge variant="outline" className="border-tokyo-border bg-tokyo-deep text-xs text-tokyo-blue">
            Recursive call
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-tokyo-night">
        <div className="flex">
          <div className="flex-shrink-0 select-none border-r border-tokyo-border bg-tokyo-deep py-4 pl-2 pr-3">
            {lines.map((_, i) => (
              <div key={i} className="min-w-[2rem] text-right font-mono text-xs leading-6 text-tokyo-comment">
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-x-auto py-4">
            {lines.map((line, i) => {
              const isBaseCase = isBaseCaseLine(line)
              const isRecursive = isRecursiveCallLine(line)
              return (
                <div key={i} className={`px-3 leading-6 transition-colors ${getLineHighlight(i)}`}>
                  <code
                    className={`whitespace-pre font-mono text-sm ${
                      isBaseCase ? 'text-tokyo-green' : isRecursive ? 'text-tokyo-blue' : 'text-tokyo-fg'
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

      <div className="border-t border-tokyo-border bg-tokyo-deep px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-tokyo-comment">
          <Lightbulb className="h-3.5 w-3.5 text-tokyo-yellow" />
          <span>
            <span className="text-tokyo-green">Green</span>: likely base case ·{' '}
            <span className="text-tokyo-blue">Blue</span>: likely recursive call
          </span>
        </div>
      </div>
    </Card>
  )
}
