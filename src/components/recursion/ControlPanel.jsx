import React from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Play, Pause, SkipForward, RotateCcw, Gauge, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ControlPanel({
  isRunning, isPaused, speed,
  onStart, onPause, onResume, onStep, onReset, onSpeedChange,
  currentStep, totalSteps, isComplete,
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
                className="app-btn-primary border-transparent"
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
                className="border-tokyo-orange/40 bg-tokyo-deep text-tokyo-orange hover:bg-tokyo-highlight"
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

        <div className="hidden h-8 w-px bg-tokyo-border sm:block" />

        <div className="flex min-w-[200px] flex-1 items-center gap-3 sm:flex-initial">
          <Gauge className="h-4 w-4 text-tokyo-comment" />
          <span className="w-12 text-sm text-tokyo-muted">Speed</span>
          <Slider
            value={[speed]}
            onValueChange={(value) => onSpeedChange(value[0])}
            min={0.25} max={2} step={0.25}
            className="flex-1"
          />
          <span className="w-12 font-mono text-sm text-tokyo-cyan">{speed}x</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-full border border-tokyo-green/40 bg-tokyo-deep px-3 py-1.5 text-sm text-tokyo-green"
            >
              <Check className="h-4 w-4" />
              Complete
            </motion.div>
          )}
          {totalSteps > 0 && (
            <div className="flex items-center gap-2 text-sm text-tokyo-muted">
              <span>Step</span>
              <span className="font-mono font-medium text-tokyo-magenta">{currentStep}</span>
              <span>/</span>
              <span className="font-mono text-tokyo-fg">{totalSteps}</span>
            </div>
          )}
        </div>
      </div>

      {totalSteps > 0 && (
        <div className="h-1 bg-tokyo-deep">
          <motion.div
            className="h-full bg-tokyo-magenta"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </Card>
  )
}
