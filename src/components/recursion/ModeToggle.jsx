import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookOpen, Code2, Sparkles } from 'lucide-react'

export default function ModeToggle({ mode, onModeChange }) {
  return (
    <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 p-2">
      <div className="flex gap-2">
        <Button
          variant={mode === 'examples' ? 'default' : 'outline'}
          onClick={() => onModeChange('examples')}
          className={`flex-1 transition-all duration-300 ${
            mode === 'examples'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg shadow-indigo-500/25'
              : 'border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:border-indigo-500/30'
          }`}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Learn with Examples
          {mode === 'examples' && <Sparkles className="w-3 h-3 ml-2" />}
        </Button>

        <Button
          variant={mode === 'custom' ? 'default' : 'outline'}
          onClick={() => onModeChange('custom')}
          className={`flex-1 transition-all duration-300 ${
            mode === 'custom'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-lg shadow-emerald-500/25'
              : 'border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:border-emerald-500/30'
          }`}
        >
          <Code2 className="w-4 h-4 mr-2" />
          Paste Your Code
          {mode === 'custom' && <Sparkles className="w-3 h-3 ml-2" />}
        </Button>
      </div>
    </Card>
  )
}
