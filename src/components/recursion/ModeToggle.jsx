import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookOpen, Code2 } from 'lucide-react'

export default function ModeToggle({ mode, onModeChange }) {
  return (
    <Card className="app-panel p-1.5">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2">
        <Button
          variant={mode === 'examples' ? 'default' : 'outline'}
          onClick={() => onModeChange('examples')}
          className={`flex-1 ${
            mode === 'examples'
              ? 'app-btn-primary border-transparent'
              : 'app-btn-secondary'
          }`}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Learn with examples
        </Button>

        <Button
          variant={mode === 'custom' ? 'default' : 'outline'}
          onClick={() => onModeChange('custom')}
          className={`flex-1 ${
            mode === 'custom'
              ? 'app-btn-primary border-transparent'
              : 'app-btn-secondary'
          }`}
        >
          <Code2 className="mr-2 h-4 w-4" />
          Paste your code
        </Button>
      </div>
    </Card>
  )
}
