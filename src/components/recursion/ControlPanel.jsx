import React from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Play, Pause, SkipForward, RotateCcw, Gauge, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ControlPanel({
  isRunning, isPaused, speed,
  onStart, onPause, onResume, onStep, onReset, onSpeedChange,
  currentStep, totalSteps, isComplete, complexity
}) {
  return (
    <Card className="app-panel overflow-hidden">
      <div className="app-panel-head flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {!isRunning || isPaused ? (
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={isRunning ? onResume : onStart}
                disabled={isComplete}
                className="app-btn-primary"
              >
                <Play className="mr-2 h-4 w-4" />
                {isRunning ? 'Resume' : 'Run'}
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={onPause}
                variant="outline"
                className="border-amber-500/30 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              onClick={onStep}
              disabled={isComplete || (isRunning && !isPaused)}
              variant="outline"
              className="app-btn-secondary"
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Step
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button onClick={onReset} variant="outline" className="app-btn-secondary">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </motion.div>
        </div>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div className="flex min-w-[200px] flex-1 items-center gap-3 sm:flex-initial">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <span className="w-12 text-sm text-muted-foreground font-medium">Speed</span>
          <Slider
            value={[speed]}
            onValueChange={(value) => onSpeedChange(value[0])}
            min={0.25} max={2} step={0.25}
            className="flex-1"
          />
          <span className="w-12 font-mono text-sm text-primary font-bold">{speed}x</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 font-medium px-3 py-1.5 text-sm"
            >
              <Check className="h-4 w-4" />
              Complete
            </motion.div>
          )}
          {totalSteps > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <span>Step</span>
              <span className="font-mono text-primary font-bold">{currentStep}</span>
              <span>/</span>
              <span className="font-mono text-foreground font-bold">{totalSteps}</span>
            </div>
          )}
        </div>
      </div>

      {totalSteps > 0 && (
        <div className="h-1 bg-muted/50 rounded-b-xl overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {complexity && (isRunning || isComplete) && (
        <div className="border-t border-border/60 bg-muted/30 px-5 py-3 flex items-center gap-6 font-mono text-xs text-muted-foreground">
          <span>
            Time: <span className="text-primary font-semibold">{complexity.time}</span>
          </span>
          <span>
            Space: <span className="text-primary font-semibold">{complexity.space}</span>
          </span>
        </div>
      )}
    </Card>
  )
}
