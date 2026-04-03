import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code2, Lightbulb } from 'lucide-react'

export default function CodeEditor({ code, onChange, currentLine, isRunning }) {
  const lines = code.split('\n')

  const getLineHighlight = (lineIndex) => {
    if (currentLine === lineIndex && isRunning) {
      return 'bg-amber-500/20 border-l-4 border-amber-500'
    }
    return 'border-l-4 border-transparent'
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
    <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-slate-200">Code Editor</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
            Base Case
          </Badge>
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-xs">
            Recursive Call
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex">
          <div className="flex-shrink-0 py-4 px-2 bg-slate-800/30 select-none">
            {lines.map((_, i) => (
              <div key={i} className="text-xs text-slate-500 text-right pr-2 leading-6 font-mono" style={{ minWidth: '2rem' }}>
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 py-4 overflow-x-auto">
            {lines.map((line, i) => {
              const isBaseCase = isBaseCaseLine(line)
              const isRecursive = isRecursiveCallLine(line)
              return (
                <div key={i} className={`px-4 leading-6 transition-all duration-300 ${getLineHighlight(i)}`}>
                  <code className={`text-sm font-mono whitespace-pre ${
                    isBaseCase ? 'text-emerald-400' : isRecursive ? 'text-indigo-400' : 'text-slate-300'
                  }`}>
                    {line || ' '}
                  </code>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-slate-800/30 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Tip: Green lines show base cases, blue lines show recursive calls</span>
        </div>
      </div>
    </Card>
  )
}
