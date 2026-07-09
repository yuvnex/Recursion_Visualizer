import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Code, Play, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CustomCodePanel({ onAnalyze, isAnalyzing, error }) {
  const [showHelp, setShowHelp] = useState(true)

  const [returnType, setReturnType] = useState('int')
  const [functionName, setFunctionName] = useState('factorial')
  const [parameters, setParameters] = useState([{ id: 1, type: 'int', name: 'n' }])
  const [codeBody, setCodeBody] = useState('    if (n <= 1) {\n        return 1;\n    }\n    return n * factorial(n - 1);')
  const [functionCall, setFunctionCall] = useState('factorial(5)')

  const addParameter = () => {
    setParameters([...parameters, { id: Date.now(), type: 'int', name: `param${parameters.length + 1}` }])
  }

  const removeParameter = (id) => {
    setParameters(parameters.filter(p => p.id !== id))
  }

  const updateParameter = (id, field, value) => {
    setParameters(parameters.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const generateCode = () => {
    const paramsString = parameters.map(p => `${p.type} ${p.name}`).join(', ')
    return `public ${returnType} ${functionName}(${paramsString}) {\n${codeBody}\n}\n\n// Call the function with input\n${functionCall}${functionCall.trim().endsWith(';') ? '' : ';'}`
  }

  const loadTemplate = () => {
    setReturnType('int')
    setFunctionName('factorial')
    setParameters([{ id: Date.now(), type: 'int', name: 'n' }])
    setCodeBody('    if (n <= 1) {\n        return 1;\n    }\n    return n * factorial(n - 1);')
    setFunctionCall('factorial(5)')
  }

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

      <div className="space-y-6 p-5 flex flex-col">
        <div className="flex items-center justify-between">
          <Label className="text-foreground font-semibold">Java recursive method builder</Label>
          <Button variant="outline" size="sm" onClick={loadTemplate} className="app-btn-secondary h-8 text-xs">
            Load template
          </Button>
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
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">Builder Mode</p>
                <p className="text-sm text-muted-foreground">
                  Define your method signature horizontally, write the recursive logic in the body, and provide an initial call.
                  The code will be automatically assembled for analysis.
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

        {/* Builder UI */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
          <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Method Signature</span>
          </div>
          <div className="p-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
            <div className="flex items-end gap-3 min-w-max">
              <div className="space-y-1.5 shrink-0 w-28">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Return Type</Label>
                <Input value={returnType} onChange={e => setReturnType(e.target.value)} className="font-mono text-sm h-9 bg-background" placeholder="e.g. int" />
              </div>
              <div className="space-y-1.5 shrink-0 w-40">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Function Name</Label>
                <Input value={functionName} onChange={e => setFunctionName(e.target.value)} className="font-mono text-sm h-9 bg-background" placeholder="e.g. factorial" />
              </div>

              <div className="w-px h-9 bg-border/50 shrink-0 mx-1 mb-0.5"></div>

              {parameters.map((param, idx) => (
                <div key={param.id} className="space-y-1.5 shrink-0 w-48 group">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground flex justify-between items-center h-4">
                    <span>Parameter {idx + 1}</span>
                    <button
                      onClick={() => removeParameter(param.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      aria-label="Remove parameter"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Label>
                  <div className="flex gap-1">
                    <Input value={param.type} onChange={e => updateParameter(param.id, 'type', e.target.value)} className="font-mono text-sm h-9 w-20 px-2 bg-background text-center" placeholder="Type" />
                    <Input value={param.name} onChange={e => updateParameter(param.id, 'name', e.target.value)} className="font-mono text-sm h-9 flex-1 px-2 bg-background" placeholder="Name" />
                  </div>
                </div>
              ))}

              <div className="space-y-1.5 shrink-0 ml-1">
                <Button variant="outline" onClick={addParameter} className="h-9 px-3 text-xs border-dashed bg-background/50 hover:bg-background">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Param
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm flex flex-col flex-1">
          <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Function Body (Code Here)</span>
          </div>
          <div className="p-2 bg-muted/10 flex-1 relative group">
            <Textarea
              value={codeBody}
              onChange={e => setCodeBody(e.target.value)}
              placeholder="    // recursive logic here"
              className="min-h-[200px] h-full resize-y border-0 bg-transparent font-mono text-sm text-foreground shadow-none focus-visible:ring-0 leading-relaxed"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
          <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Initial Function Call</span>
          </div>
          <div className="p-4 bg-muted/5 flex items-center">
            <Input
              value={functionCall}
              onChange={e => setFunctionCall(e.target.value)}
              className="font-mono text-sm h-10 bg-background"
              placeholder="e.g. factorial(5)"
            />
          </div>
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
          onClick={() => onAnalyze({ language: 'java', code: generateCode() })}
          disabled={!codeBody.trim() || !functionName.trim() || isAnalyzing}
          className="w-full app-btn-primary border-transparent h-11 text-base mt-2"
        >
          {isAnalyzing ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing…</>
          ) : (
            <><Play className="mr-2 h-5 w-5" />Analyze &amp; Visualize</>
          )}
        </Button>
      </div>
    </Card>
  )
}
