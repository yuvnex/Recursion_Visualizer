import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookOpen, Code2 } from 'lucide-react'

export default function ModeToggle({ mode, onModeChange }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-border/60 bg-muted/30 p-1 shadow-sm">
      <button
        onClick={() => onModeChange('examples')}
        className={`flex items-center justify-center rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 ${
          mode === 'examples'
            ? 'bg-card text-foreground shadow-sm ring-1 ring-border/50'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <BookOpen className="mr-2 h-4 w-4" />
        Examples
      </button>

      <button
        onClick={() => onModeChange('custom')}
        className={`flex items-center justify-center rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 ${
          mode === 'custom'
            ? 'bg-card text-foreground shadow-sm ring-1 ring-border/50'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        }`}
      >
        <Code2 className="mr-2 h-4 w-4" />
        Custom code
      </button>
    </div>
  )
}
