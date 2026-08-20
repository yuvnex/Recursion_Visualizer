import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

const NumberInput = ({ value, onChange }) => {
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleCommit = () => {
    const num = Number(val);
    onChange(isNaN(num) ? 0 : num);
  };

  return (
    <input 
      type="number" 
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={handleCommit}
      onKeyDown={e => { if (e.key === 'Enter') handleCommit(); }}
      className="w-16 rounded-md bg-background px-2 py-1 text-sm outline-none border border-input focus:border-primary focus:ring-1 focus:ring-primary font-mono text-foreground"
    />
  )
}

const ArrayInput = ({ value, onChange }) => {
  const [text, setText] = useState(value.join(', '));
  
  useEffect(() => {
    setText(value.join(', '));
  }, [value]);

  const handleCommit = () => {
    const arr = text.split(',').filter(s => s.trim() !== '').map(s => {
      const n = Number(s.trim());
      return isNaN(n) ? 0 : n;
    });
    onChange(arr);
    setText(arr.join(', '));
  };

  return (
    <div className="flex items-center">
      <span className="font-mono text-sm text-muted-foreground mr-1">[</span>
      <input 
        type="text" 
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={e => { if (e.key === 'Enter') handleCommit(); }}
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

export const EXAMPLES = [
  {
    id: 'factorial',
    name: 'Factorial',
    difficulty: 'Beginner',
    description: 'Calculate n! = n × (n-1) × ... × 1',
    input: 5,
    code: `public static int factorial(int n) {
  // Base case: factorial of 0 or 1 is 1
  if (n <= 1) {
    return 1;
  }
  // Recursive case: n! = n * (n-1)!
  return n * factorial(n - 1);
}`,
  },
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    difficulty: 'Beginner',
    description: 'Find the nth Fibonacci number',
    input: 5,
    code: `public static int fibonacci(int n) {
  // Base cases: F(0) = 0, F(1) = 1
  if (n <= 0) {
    return 0;
  }
  if (n == 1) {
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
    code: `public static int binarySearch(int[] arr, int target, int low, int high) {
  // Base case: element not found
  if (low > high) {
    return -1;
  }
  int mid = (low + high) / 2;
  // Base case: element found
  if (arr[mid] == target) {
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
    code: `public static int sumArray(int[] arr, int index) {
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
    code: `public static int power(int base, int exp) {
  // Base case: anything to power 0 is 1
  if (exp == 0) {
    return 1;
  }
  // Recursive case: base^exp = base * base^(exp-1)
  return base * power(base, exp - 1);
}`,
  },
  {
    id: 'mergeSort',
    name: 'Merge Sort',
    difficulty: 'Advanced',
    description: 'Sort an array using divide-and-conquer recursion',
    input: { arr: [4, 1, 3, 9, 7] },
    code: `public static int[] mergeSort(int[] arr) {
  // Base case: arrays of length 0 or 1 are already sorted
  if (arr.length <= 1) {
    return arr;
  }
  // Divide: split array in half
  int mid = arr.length / 2;
  int[] left = mergeSort(Arrays.copyOfRange(arr, 0, mid));
  int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));
  // Conquer: merge sorted halves
  return merge(left, right);
}

public static int[] merge(int[] left, int[] right) {
  int[] result = new int[left.length + right.length];
  int i = 0, j = 0, k = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result[k++] = left[i++];
    } else {
      result[k++] = right[j++];
    }
  }
  while (i < left.length) result[k++] = left[i++];
  while (j < right.length) result[k++] = right[j++];
  return result;
}`,
  },
  {
    id: 'quickSort',
    name: 'Quick Sort',
    difficulty: 'Advanced',
    description: 'Sort an array using divide-and-conquer with a pivot',
    input: { arr: [4, 1, 3, 9, 7], low: 0, high: 4 },
    code: `public static void quickSort(int[] arr, int low, int high) {
  // Base case: if low index is greater than or equal to high, it's already sorted
  if (low >= high) {
    return;
  }
  // Partition the array and get the pivot index
  int pivotIndex = partition(arr, low, high);
  // Recursively sort the sub-arrays
  quickSort(arr, low, pivotIndex - 1);
  quickSort(arr, pivotIndex + 1, high);
}

public static int partition(int[] arr, int low, int high) {
  int pivot = arr[high];
  int i = low - 1;
  for (int j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      int temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  int temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;
  return i + 1;
}`,
  },
]

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
                className={`relative flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${selectedExample?.id === example.id
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
