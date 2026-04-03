import React from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Play, Pause, SkipForward, RotateCcw, Gauge, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ControlPanel({
  isRunning, isPaused, speed,
  onStart, onPause, onResume, onStep, onReset, onSpeedChange,
  currentStep, totalSteps, isComplete,
}) {
  return (
    <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          {!isRunning || isPaused ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={isRunning ? onResume : onStart}
                disabled={isComplete}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? 'Resume' : 'Run'}
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={onPause} variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onStep}
              disabled={isComplete || (isRunning && !isPaused)}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Step
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={onReset} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </motion.div>
        </div>

        <div className="w-px h-8 bg-slate-700" />

        <div className="flex items-center gap-3 min-w-[200px]">
          <Gauge className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400 w-12">Speed</span>
          <Slider
            value={[speed]}
            onValueChange={(value) => onSpeedChange(value[0])}
            min={0.25} max={2} step={0.25}
            className="flex-1"
          />
          <span className="text-sm text-indigo-400 font-mono w-12">{speed}x</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-sm"
            >
              <Zap className="w-4 h-4" />
              Complete!
            </motion.div>
          )}
          {totalSteps > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Step</span>
              <span className="font-mono text-indigo-400">{currentStep}</span>
              <span>/</span>
              <span className="font-mono">{totalSteps}</span>
            </div>
          )}
        </div>
      </div>

      {totalSteps > 0 && (
        <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </Card>
  )
}
