import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export const EXAMPLES = [
  {
    id: 'factorial',
    name: 'Factorial',
    difficulty: 'Beginner',
    description: 'Calculate n! = n × (n-1) × ... × 1',
    input: 5,
    code: `function factorial(n) {
  // Base case: factorial of 0 or 1 is 1
  if (n <= 1) {
    return 1;
  }
  // Recursive case: n! = n × (n-1)!
  return n * factorial(n - 1);
}`,
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    difficulty: 'Beginner',
    description: 'Find the nth Fibonacci number',
    input: 5,
    code: `function fibonacci(n) {
  // Base cases: F(0) = 0, F(1) = 1
  if (n <= 0) {
    return 0;
  }
  if (n === 1) {
    return 1;
  }
  // Recursive case: F(n) = F(n-1) + F(n-2)
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
  },
  {
    id: 'binarySearch',
    name: 'Binary Search',
    difficulty: 'Intermediate',
    description: 'Find target in sorted array',
    input: { arr: [1, 3, 5, 7, 9, 11], target: 7, low: 0, high: 5 },
    code: `function binarySearch(arr, target, low, high) {
  // Base case: element not found
  if (low > high) {
    return -1;
  }
  let mid = Math.floor((low + high) / 2);
  // Base case: element found
  if (arr[mid] === target) {
    return mid;
  }
  // Recursive cases
  if (arr[mid] > target) {
    return binarySearch(arr, target, low, mid - 1);
  } else {
    return binarySearch(arr, target, mid + 1, high);
  }
}`,
  },
  {
    id: 'sumArray',
    name: 'Sum Array',
    difficulty: 'Beginner',
    description: 'Calculate sum of array elements recursively',
    input: { arr: [1, 2, 3, 4, 5], index: 0 },
    code: `function sumArray(arr, index) {
  // Base case: reached end of array
  if (index >= arr.length) {
    return 0;
  }
  // Recursive case: current + sum of rest
  return arr[index] + sumArray(arr, index + 1);
}`,
  },
  {
    id: 'power',
    name: 'Power',
    difficulty: 'Beginner',
    description: 'Calculate base^exponent recursively',
    input: { base: 2, exp: 4 },
    code: `function power(base, exp) {
  // Base case: anything to power 0 is 1
  if (exp === 0) {
    return 1;
  }
  // Recursive case: base^exp = base × base^(exp-1)
  return base * power(base, exp - 1);
}`,
  },
]

const difficultyColors = {
  Beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export default function ExampleSelector({ selectedExample, onSelect }) {
  return (
    <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-slate-200">Example Problems</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example, index) => (
          <motion.div
            key={example.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant={selectedExample?.id === example.id ? 'default' : 'outline'}
              onClick={() => onSelect(example)}
              className={`relative group transition-all duration-300 ${
                selectedExample?.id === example.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent'
                  : 'border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800/50'
              }`}
            >
              {selectedExample?.id === example.id && <Sparkles className="w-3 h-3 mr-2" />}
              {example.name}
              <Badge variant="outline" className={`ml-2 text-xs ${difficultyColors[example.difficulty]}`}>
                {example.difficulty}
              </Badge>
            </Button>
          </motion.div>
        ))}
      </div>

      {selectedExample && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-slate-800/50 rounded-lg"
        >
          <p className="text-sm text-slate-400">{selectedExample.description}</p>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Input: {JSON.stringify(selectedExample.input)}
          </p>
        </motion.div>
      )}
    </Card>
  )
}
