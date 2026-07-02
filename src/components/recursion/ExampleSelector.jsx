import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

const formatInput = (input) => {
  if (typeof input === 'number') return `n = ${input}`
  return Object.entries(input)
    .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
    .join('   ')
}

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

export default function ExampleSelector({ selectedExample, onSelect }) {
  return (
    <Card className="app-panel overflow-hidden">
      <div className="app-panel-head flex items-center gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <BookOpen className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-semibold text-foreground tracking-wide uppercase">Example problems</span>
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
                selectedExample?.id === example.id
                  ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {example.name}
            </button>
          </motion.div>
        ))}
      </div>

      {selectedExample && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-border/50 bg-muted/20 p-4 shadow-sm"
        >
          <p className="font-mono text-sm text-muted-foreground">
            {formatInput(selectedExample.input)}
          </p>
        </motion.div>
      )}
      </div>
    </Card>
  )
}
