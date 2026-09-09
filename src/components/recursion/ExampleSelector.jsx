import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { ALGORITHMS } from '@/lib/algorithmData'

export const EXAMPLES = ALGORITHMS

const NumberInput = ({ value, onChange }) => {
  const [val, setVal] = useState(value)

  useEffect(() => {
    setVal(value)
  }, [value])

  const handleCommit = () => {
    const num = Number(val)
    onChange(isNaN(num) ? 0 : num)
  }

  return (
    <input 
      type="number" 
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={handleCommit}
      onKeyDown={e => { if (e.key === 'Enter') handleCommit() }}
      className="w-16 rounded-md bg-background px-2 py-1 text-sm outline-none border border-input focus:border-primary focus:ring-1 focus:ring-primary font-mono text-foreground"
    />
  )
}

const ArrayInput = ({ value, onChange }) => {
  const [text, setText] = useState(Array.isArray(value) ? value.join(', ') : '')
  
  useEffect(() => {
    if (Array.isArray(value)) {
      setText(value.join(', '))
    }
  }, [value])

  const handleCommit = () => {
    const arr = text.split(',').filter(s => s.trim() !== '').map(s => {
      const n = Number(s.trim())
      return isNaN(n) ? 0 : n
    })
    onChange(arr)
    setText(arr.join(', '))
  }

  return (
    <div className="flex items-center">
      <span className="font-mono text-sm text-muted-foreground mr-1">[</span>
      <input 
        type="text" 
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={e => { if (e.key === 'Enter') handleCommit() }}
        className="w-48 rounded-md bg-background px-2 py-1 text-sm outline-none border border-input focus:border-primary focus:ring-1 focus:ring-primary font-mono text-foreground"
      />
      <span className="font-mono text-sm text-muted-foreground ml-1">]</span>
    </div>
  )
}

const InputEditor = ({ input, onChange }) => {
  if (typeof input === 'number') {
    return (
      <div className="flex items-center gap-2">
        <label className="font-mono text-sm font-medium text-muted-foreground">n =</label>
        <NumberInput value={input} onChange={(val) => onChange(val)} />
      </div>
    )
  }

  if (typeof input === 'object' && input !== null) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        {Object.entries(input).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <label className="font-mono text-sm font-medium text-muted-foreground">{k} =</label>
            {Array.isArray(v) ? (
              <ArrayInput value={v} onChange={(val) => onChange({ ...input, [k]: val })} />
            ) : (
              <NumberInput value={v} onChange={(val) => onChange({ ...input, [k]: val })} />
            )}
          </div>
        ))}
      </div>
    )
  }

  return null
}

export default function ExampleSelector({ selectedExample, onSelect, onInputChange }) {
  const handleInputUpdate = (newInput) => {
    if (onInputChange) {
      onInputChange(newInput)
    }
  }

  return (
    <Card className="app-panel overflow-hidden">
      <div className="bg-[#334155] text-white text-center py-2 text-[22px] tracking-wide font-sans z-10 shadow-sm relative flex items-center justify-center">
        <span>Example Problems</span>
      </div>
      <div className="p-5">

        <div className="flex flex-wrap gap-2.5">
          {EXAMPLES.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
            >
              <button
                onClick={() => onSelect(example)}
                className={`relative flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  selectedExample?.id === example.id || selectedExample?.slug === example.slug
                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {example.name}
              </button>
            </motion.div>
          ))}
        </div>

        {selectedExample && selectedExample.input !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl border border-border/50 bg-muted/20 p-4 shadow-sm flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded">
              <BookOpen className="w-4 h-4" />
              Inputs
            </div>
            <div className="hidden sm:block w-[1px] h-6 bg-border/50"></div>
            <InputEditor input={selectedExample.input} onChange={handleInputUpdate} />
          </motion.div>
        )}
      </div>
    </Card>
  )
}
