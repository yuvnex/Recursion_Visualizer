/**
 * algorithmData.js
 * 
 * Centralized registry for all recursion algorithms in Recursify.
 * Provides metadata, code templates, explanations, complexities, and step simulators.
 */

export const ALGORITHMS = [
  {
    id: 'fibonacci',
    slug: 'fibonacci',
    name: 'Fibonacci',
    difficulty: 'Beginner',
    tag: 'Classic',
    visualizePath: '/visualize/fibonacci',
    seoPath: '/fibonacci-recursion',
    seoTitle: 'Fibonacci Recursion Visualizer | Recursify',
    seoDescription: 'Visualize Fibonacci recursion step by step with Recursify. Explore recursion trees, function calls, and understand how Fibonacci recursion works.',
    keywords: 'fibonacci recursion visualizer, fibonacci recursion tree, fibonacci call stack, recursive fibonacci',
    description: 'Calculate the nth Fibonacci number where F(n) = F(n-1) + F(n-2)',
    shortDescription: 'Explore how multiple recursive branches create an exponential call tree with overlapping subproblems.',
    timeComplexity: 'O(2ⁿ)',
    spaceComplexity: 'O(n)',
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
    explanation: 'The Fibonacci sequence is defined such that each number is the sum of the two preceding ones, starting from 0 and 1. The recursive formulation directly mirrors this mathematical definition by computing fibonacci(n - 1) and fibonacci(n - 2) and adding their results together.',
    howRecursionWorks: 'When fibonacci(n) is invoked, it branches into two separate recursive calls: one for (n - 1) and one for (n - 2). Each branch evaluates down to the base cases (n <= 0 returning 0, and n = 1 returning 1). As the recursive calls return, intermediate values are added together and propagated back up the tree. Because the same subproblems are solved repeatedly, this demonstrates the classic exponential recursion tree.',
    simulator: (n) => {
      const steps = []
      let counter = 0
      const simulate = (val, parentId = null) => {
        const id = counter++
        const isBase = val <= 1
        steps.push({ type: 'call', nodeId: id, parentId, label: `fib(${val})`, params: { n: val }, isBaseCase: isBase })
        if (val <= 0) { steps.push({ type: 'return', nodeId: id, value: 0, isBaseCase: true }); return { id, result: 0 } }
        if (val === 1) { steps.push({ type: 'return', nodeId: id, value: 1, isBaseCase: true }); return { id, result: 1 } }
        const l = simulate(val - 1, id)
        const r = simulate(val - 2, id)
        const result = l.result + r.result
        steps.push({ type: 'return', nodeId: id, value: result })
        return { id, result }
      }
      simulate(typeof n === 'number' ? n : 5)
      return steps
    }
  },
  {
    id: 'factorial',
    slug: 'factorial',
    name: 'Factorial',
    difficulty: 'Beginner',
    tag: 'Classic',
    visualizePath: '/visualize/factorial',
    seoPath: '/factorial-recursion',
    seoTitle: 'Factorial Recursion Visualizer | Recursify',
    seoDescription: 'Visualize Factorial recursion step by step with Recursify. Explore linear recursion trees, call stacks, and base cases interactively.',
    keywords: 'factorial recursion visualizer, factorial call stack, linear recursion tree, recursive factorial',
    description: 'Calculate n! = n × (n-1) × ... × 1 recursively',
    shortDescription: 'Trace a linear call stack growing downwards and unwinding results with multiplication.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    input: 5,
    code: `public static int factorial(int n) {
  // Base case: factorial of 0 or 1 is 1
  if (n <= 1) {
    return 1;
  }
  // Recursive case: n! = n * (n-1)!
  return n * factorial(n - 1);
}`,
    explanation: 'Factorial of a non-negative integer n is the product of all positive integers less than or equal to n. The recursive approach expresses n! as n multiplied by the factorial of (n - 1), terminating when n is 0 or 1.',
    howRecursionWorks: 'Each recursive call pauses its execution while waiting for the result of factorial(n - 1). Stack frames continue to accumulate on the call stack until the base case n <= 1 is reached. Once the base case returns 1, the stack unwinds in reverse order (LIFO), multiplying each pending n by the returned value until the final product reaches the top-level caller.',
    simulator: (n) => {
      const steps = []
      const simulate = (val, nodeId, parentId) => {
        steps.push({ type: 'call', nodeId, parentId, label: `factorial(${val})`, params: { n: val }, isBaseCase: val <= 1 })
        if (val <= 1) { steps.push({ type: 'return', nodeId, value: 1, isBaseCase: true }); return 1 }
        const childId = steps.length
        const r = simulate(val - 1, childId, nodeId)
        const result = val * r
        steps.push({ type: 'return', nodeId, value: result })
        return result
      }
      simulate(typeof n === 'number' ? n : 5, 0, null)
      return steps
    }
  },
  {
    id: 'binarySearch',
    slug: 'binary-search',
    name: 'Binary Search',
    difficulty: 'Intermediate',
    tag: 'Divide & Conquer',
    visualizePath: '/visualize/binary-search',
    seoPath: '/binary-search-recursion',
    seoTitle: 'Binary Search Recursion Visualizer | Recursify',
    seoDescription: 'Visualize binary search algorithm step by step. See logarithmic search space reduction and recursive stack frames in action.',
    keywords: 'binary search recursion, binary search visualizer, divide and conquer recursion',
    description: 'Find target element in a sorted array by halving the search space',
    shortDescription: 'Witness logarithmic O(log n) efficiency as the search range cuts in half at every recursive step.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(log n)',
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
    explanation: 'Binary Search is an efficient algorithm for searching a target value in a sorted array. It compares the target with the middle element: if equal, it returns the index; otherwise, it recursively narrows the search range to the left or right sub-array.',
    howRecursionWorks: 'With each recursive step, the search window (defined by low and high indices) is cut in half. Only one recursive branch is taken per level. If low exceeds high, the search terminates with -1 (not found). When the middle element equals the target, the index is returned immediately, unwinding the call stack back up.',
    simulator: ({ arr, target, low, high }) => {
      const steps = []
      let counter = 0
      const currentArr = Array.isArray(arr) ? arr : [1, 3, 5, 7, 9, 11]
      const simulate = (lo, hi, parentId = null) => {
        const id = counter++
        const isBase = lo > hi
        steps.push({ type: 'call', nodeId: id, parentId, label: `search(${lo},${hi})`, params: { low: lo, high: hi }, isBaseCase: isBase })
        if (lo > hi) { steps.push({ type: 'return', nodeId: id, value: -1, isBaseCase: true }); return { id, result: -1 } }
        const mid = Math.floor((lo + hi) / 2)
        if (currentArr[mid] === target) { steps.push({ type: 'return', nodeId: id, value: mid, isBaseCase: true }); return { id, result: mid } }
        const child = currentArr[mid] > target ? simulate(lo, mid - 1, id) : simulate(mid + 1, hi, id)
        steps.push({ type: 'return', nodeId: id, value: child.result })
        return { id, result: child.result }
      }
      simulate(low !== undefined ? low : 0, high !== undefined ? high : currentArr.length - 1)
      return steps
    }
  },
  {
    id: 'mergeSort',
    slug: 'merge-sort',
    name: 'Merge Sort',
    difficulty: 'Advanced',
    tag: 'Divide & Conquer',
    visualizePath: '/visualize/merge-sort',
    seoPath: '/merge-sort-visualizer',
    seoTitle: 'Merge Sort Visualizer - Divide & Conquer Recursion | Recursify',
    seoDescription: 'Interactive merge sort recursion visualizer. Step through divide-and-conquer recursion trees, array splitting, and merge operations.',
    keywords: 'merge sort visualizer, divide and conquer recursion, merge sort recursion tree, sort visualizer',
    description: 'Sort an array using recursive divide-and-conquer and linear merging',
    shortDescription: 'Watch the array recursively split down to single elements and merge back together in sorted order.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
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
    explanation: 'Merge Sort follows the divide-and-conquer paradigm: it divides the input array into two halves, recursively sorts both halves using mergeSort, and then merges the two sorted halves into a single sorted array.',
    howRecursionWorks: 'The array is repeatedly halved until subarrays of length 1 (the base case) are reached. At each return step, the two sorted sub-lists are merged together in sorted order. This creates a balanced recursion tree of height log(n), guaranteeing O(n log n) performance across all inputs.',
    simulator: ({ arr }) => {
      const steps = []
      let counter = 0
      const currentArr = Array.isArray(arr) ? arr : [4, 1, 3, 9, 7]
      const simulate = (subArr, parentId = null) => {
        const id = counter++
        const isBase = subArr.length <= 1
        steps.push({
          type: 'call',
          nodeId: id,
          parentId,
          label: `mergeSort([${subArr.join(',')}])`,
          params: { arr: [...subArr] },
          isBaseCase: isBase,
        })
        if (isBase) {
          steps.push({ type: 'return', nodeId: id, value: [...subArr], isBaseCase: true })
          return { id, result: [...subArr] }
        }
        const mid = Math.floor(subArr.length / 2)
        const leftChild = simulate(subArr.slice(0, mid), id)
        const rightChild = simulate(subArr.slice(mid), id)
        const merged = []
        let i = 0, j = 0
        const l = leftChild.result, r = rightChild.result
        while (i < l.length && j < r.length) {
          if (l[i] <= r[j]) merged.push(l[i++])
          else merged.push(r[j++])
        }
        while (i < l.length) merged.push(l[i++])
        while (j < r.length) merged.push(r[j++])
        steps.push({ type: 'return', nodeId: id, value: merged })
        return { id, result: merged }
      }
      simulate(currentArr)
      return steps
    }
  },
  {
    id: 'quickSort',
    slug: 'quick-sort',
    name: 'Quick Sort',
    difficulty: 'Advanced',
    tag: 'Divide & Conquer',
    visualizePath: '/visualize/quick-sort',
    seoPath: '/quick-sort-visualizer',
    seoTitle: 'Quick Sort Visualizer - Step-by-Step Recursion | Recursify',
    seoDescription: 'Visualize Quick Sort algorithm with interactive recursion trees, partition steps, and pivot element tracking.',
    keywords: 'quick sort visualizer, quicksort recursion tree, partition recursion, dsa sorting visualizer',
    description: 'Sort an array using in-place partitioning and recursive sorting around a pivot',
    shortDescription: 'Trace pivot selection, partitioning elements into smaller and larger subsets, and recursive conquering.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
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
  for (let j = low; j < high; j++) {
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
    explanation: 'Quick Sort selects a pivot element and partitions the array around it, placing smaller elements to the left and larger elements to the right. It then recursively applies the same logic to both sub-arrays.',
    howRecursionWorks: 'Partitioning places the pivot in its permanent sorted index. The function then makes two recursive calls: one for the sub-array before the pivot, and one for the sub-array after. Base cases occur when sub-arrays have 0 or 1 elements (low >= high).',
    simulator: ({ arr, low, high }) => {
      const steps = []
      let counter = 0
      const currentArr = Array.isArray(arr) ? [...arr] : [4, 1, 3, 9, 7]
      const simulate = (lo, hi, parentId = null) => {
        const id = counter++
        const isBase = lo >= hi
        steps.push({
          type: 'call',
          nodeId: id,
          parentId,
          label: `quickSort(${lo},${hi})`,
          params: { low: lo, high: hi, arr: [...currentArr] },
          isBaseCase: isBase,
        })
        if (isBase) {
          steps.push({ type: 'return', nodeId: id, value: undefined, isBaseCase: true })
          return { id }
        }
        let pivot = currentArr[hi]
        let i = lo - 1
        for (let j = lo; j < hi; j++) {
          if (currentArr[j] <= pivot) {
            i++
            let temp = currentArr[i]
            currentArr[i] = currentArr[j]
            currentArr[j] = temp
          }
        }
        let temp = currentArr[i + 1]
        currentArr[i + 1] = currentArr[hi]
        currentArr[hi] = temp
        const pivotIndex = i + 1

        simulate(lo, pivotIndex - 1, id)
        simulate(pivotIndex + 1, hi, id)
        steps.push({ type: 'return', nodeId: id, value: undefined })
        return { id }
      }
      simulate(low !== undefined ? low : 0, high !== undefined ? high : currentArr.length - 1)
      return steps
    }
  },
  {
    id: 'nQueens',
    slug: 'n-queens',
    name: 'N-Queens',
    difficulty: 'Advanced',
    tag: 'Backtracking',
    visualizePath: '/visualize/n-queens',
    seoPath: '/n-queens-visualizer',
    seoTitle: 'N-Queens Visualizer - Backtracking Recursion | Recursify',
    seoDescription: 'Visualize the classic N-Queens backtracking puzzle. Step through board placements, conflict detection, and recursive backtracking.',
    keywords: 'n queens visualizer, n queens backtracking recursion, n queens tree, recursion backtracking',
    description: 'Place N non-attacking queens on an N×N chessboard using backtracking',
    shortDescription: 'Explore backtracking search where dead ends trigger state unwinding to find valid queen placements.',
    timeComplexity: 'O(N!)',
    spaceComplexity: 'O(N)',
    input: 4,
    code: `public static boolean solveNQueens(int row, int n, int[] board) {
  // Base case: all N queens have been placed successfully
  if (row == n) {
    return true;
  }
  // Try placing a queen in each column of the current row
  for (let col = 0; col < n; col++) {
    if (isSafe(row, col, board)) {
      board[row] = col; // Place queen
      
      // Recursive step: place queen in next row
      if (solveNQueens(row + 1, n, board)) {
        return true;
      }
      
      // Backtrack: remove queen and try next column
      board[row] = -1;
    }
  }
  return false;
}

public static boolean isSafe(int row, int col, int[] board) {
  for (int r = 0; r < row; r++) {
    int c = board[r];
    if (c == col || Math.abs(c - col) == Math.abs(r - row)) {
      return false; // Same column or diagonal conflict
    }
  }
  return true;
}`,
    explanation: 'The N-Queens puzzle requires placing N chess queens on an N×N chessboard so that no two queens threaten each other. The backtracking algorithm places queens row by row, checking for column and diagonal attacks, and backtracking whenever no safe column exists.',
    howRecursionWorks: 'The function starts at row 0. It iterates over columns 0 to N-1; if placing a queen in (row, col) is safe, it recurses to row + 1. If row reaches N, all queens are placed (success base case). If no column in a row is safe, the function returns false, triggering backtracking in the parent call to try the next column.',
    simulator: (n) => {
      const size = typeof n === 'number' ? Math.min(Math.max(n, 2), 6) : 4
      const steps = []
      let counter = 0
      const isSafe = (row, col, queens) => {
        for (let r = 0; r < row; r++) {
          const c = queens[r]
          if (c === col || Math.abs(c - col) === Math.abs(r - row)) {
            return false
          }
        }
        return true
      }

      const simulate = (row, queens, parentId = null) => {
        const id = counter++
        const isBase = row === size
        steps.push({
          type: 'call',
          nodeId: id,
          parentId,
          label: `queens(row=${row})`,
          params: { row, placedCols: [...queens] },
          isBaseCase: isBase
        })

        if (isBase) {
          steps.push({ type: 'return', nodeId: id, value: true, isBaseCase: true })
          return { id, result: true }
        }

        for (let col = 0; col < size; col++) {
          if (isSafe(row, col, queens)) {
            queens[row] = col
            const child = simulate(row + 1, queens, id)
            if (child.result) {
              steps.push({ type: 'return', nodeId: id, value: true })
              return { id, result: true }
            }
            queens[row] = -1 // backtrack
          }
        }

        steps.push({ type: 'return', nodeId: id, value: false, isBaseCase: false })
        return { id, result: false }
      }

      simulate(0, new Array(size).fill(-1))
      return steps
    }
  },
  {
    id: 'backtracking',
    slug: 'backtracking',
    name: 'Backtracking',
    difficulty: 'Intermediate',
    tag: 'Backtracking',
    visualizePath: '/visualize/backtracking',
    seoPath: '/backtracking-visualizer',
    seoTitle: 'Backtracking Visualizer - Generate Subsets & State Trees | Recursify',
    seoDescription: 'Master backtracking with interactive state-space recursion trees. Step through include/exclude decision branches.',
    keywords: 'backtracking visualizer, subset recursion tree, generate subsets recursion, backtracking dsa',
    description: 'Generate all subsets (power set) of an array using recursive include/exclude decisions',
    shortDescription: 'Visualize binary decision trees exploring candidate solutions and backtracking at leaf nodes.',
    timeComplexity: 'O(2ⁿ)',
    spaceComplexity: 'O(n)',
    input: { arr: [1, 2, 3], index: 0 },
    code: `public static void generateSubsets(int[] arr, int index, List<Integer> current, List<List<Integer>> result) {
  // Base case: reached end of array, record current subset
  if (index == arr.length) {
    result.add(new ArrayList<>(current));
    return;
  }
  
  // Decision 1: Include current element arr[index]
  current.add(arr[index]);
  generateSubsets(arr, index + 1, current, result);
  
  // Backtrack: Remove arr[index] before exploring Decision 2
  current.remove(current.size() - 1);
  
  // Decision 2: Exclude current element arr[index]
  generateSubsets(arr, index + 1, current, result);
}`,
    explanation: 'Backtracking builds solutions incrementally and abandons (backtracks) candidates as soon as they are determined to be complete or invalid. For generating subsets, every element presents a 2-way binary choice: include the element, or exclude the element.',
    howRecursionWorks: 'At each level index, the function pushes arr[index] to the current subset and recursively explores all subsequent choices. Upon returning, it removes arr[index] (backtracks) and makes a second recursive call without it. Reaching index == arr.length constitutes a leaf base case where the accumulated subset is captured.',
    simulator: ({ arr, index }) => {
      const currentArr = Array.isArray(arr) ? arr.slice(0, 3) : [1, 2, 3]
      const steps = []
      let counter = 0

      const simulate = (idx, current, parentId = null) => {
        const id = counter++
        const isBase = idx >= currentArr.length
        steps.push({
          type: 'call',
          nodeId: id,
          parentId,
          label: `subsets(i=${idx}, [${current.join(',')}])`,
          params: { index: idx, subset: [...current] },
          isBaseCase: isBase
        })

        if (isBase) {
          steps.push({ type: 'return', nodeId: id, value: `[${current.join(',')}]`, isBaseCase: true })
          return { id }
        }

        // Include choice
        current.push(currentArr[idx])
        simulate(idx + 1, current, id)
        
        // Backtrack
        current.pop()
        
        // Exclude choice
        simulate(idx + 1, current, id)

        steps.push({ type: 'return', nodeId: id, value: `done(i=${idx})` })
        return { id }
      }

      simulate(index !== undefined ? index : 0, [])
      return steps
    }
  },
  {
    id: 'sumArray',
    slug: 'sum-array',
    name: 'Sum Array',
    difficulty: 'Beginner',
    tag: 'Classic',
    visualizePath: '/visualize/sum-array',
    seoPath: '/recursion-examples',
    seoTitle: 'Sum Array Recursion Visualizer | Recursify',
    seoDescription: 'Calculate sum of array elements recursively. See step by step accumulation.',
    keywords: 'sum array recursion, recursive sum visualizer',
    description: 'Calculate sum of array elements recursively',
    shortDescription: 'Add array elements one by one with recursive index advancing.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    input: { arr: [1, 2, 3, 4, 5], index: 0 },
    code: `public static int sumArray(int[] arr, int index) {
  // Base case: reached end of array
  if (index >= arr.length) {
    return 0;
  }
  // Recursive case: current + sum of rest
  return arr[index] + sumArray(arr, index + 1);
}`,
    explanation: 'Summing an array recursively adds the current element arr[index] to the sum of the remaining array elements starting at index + 1.',
    howRecursionWorks: 'The index advances by 1 in each recursive call until index >= arr.length, which returns 0. The stack then unwinds, adding each element on the way back up.',
    simulator: ({ arr, index }) => {
      const currentArr = Array.isArray(arr) ? arr : [1, 2, 3, 4, 5]
      const steps = []
      let counter = 0
      const simulate = (idx, parentId = null) => {
        const id = counter++
        const isBase = idx >= currentArr.length
        steps.push({ type: 'call', nodeId: id, parentId, label: `sum(${idx})`, params: { index: idx, value: currentArr[idx] }, isBaseCase: isBase })
        if (isBase) { steps.push({ type: 'return', nodeId: id, value: 0, isBaseCase: true }); return { id, result: 0 } }
        const child = simulate(idx + 1, id)
        const result = currentArr[idx] + child.result
        steps.push({ type: 'return', nodeId: id, value: result })
        return { id, result }
      }
      simulate(index !== undefined ? index : 0)
      return steps
    }
  },
  {
    id: 'power',
    slug: 'power',
    name: 'Power (xⁿ)',
    difficulty: 'Beginner',
    tag: 'Classic',
    visualizePath: '/visualize/power',
    seoPath: '/recursion-examples',
    seoTitle: 'Power Recursion Visualizer | Recursify',
    seoDescription: 'Calculate power base^exp recursively and trace function calls.',
    keywords: 'power recursion visualizer, exponent recursion',
    description: 'Calculate base^exponent recursively',
    shortDescription: 'Compute exponential powers through repeated recursive multiplication.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    input: { base: 2, exp: 4 },
    code: `public static int power(int base, int exp) {
  // Base case: anything to power 0 is 1
  if (exp == 0) {
    return 1;
  }
  // Recursive case: base^exp = base * base^(exp-1)
  return base * power(base, exp - 1);
}`,
    explanation: 'Power computation raises a base to an integer exponent by repeatedly multiplying base by base^(exp - 1).',
    howRecursionWorks: 'The exponent exp decrements by 1 until the base case exp == 0 returns 1. The returning calls multiply the accumulated base values.',
    simulator: ({ base, exp }) => {
      const b = base !== undefined ? base : 2
      const e = exp !== undefined ? exp : 4
      const steps = []
      let counter = 0
      const simulate = (val, parentId = null) => {
        const id = counter++
        const isBase = val === 0
        steps.push({ type: 'call', nodeId: id, parentId, label: `power(${b},${val})`, params: { base: b, exp: val }, isBaseCase: isBase })
        if (isBase) { steps.push({ type: 'return', nodeId: id, value: 1, isBaseCase: true }); return { id, result: 1 } }
        const child = simulate(val - 1, id)
        const result = b * child.result
        steps.push({ type: 'return', nodeId: id, value: result })
        return { id, result }
      }
      simulate(e)
      return steps
    }
  }
]

/**
 * Lookup helper: finds algorithm by ID or slug
 */
export function getAlgorithmByIdOrSlug(query) {
  if (!query) return ALGORITHMS[0]
  const normalized = String(query).toLowerCase().replace(/[-_]/g, '')
  return ALGORITHMS.find(a => 
    a.id.toLowerCase() === normalized || 
    a.slug.toLowerCase().replace(/[-_]/g, '') === normalized ||
    a.slug.toLowerCase() === query.toLowerCase()
  ) || ALGORITHMS[0]
}

/**
 * Built-in simulators map
 */
export const algorithmSimulators = ALGORITHMS.reduce((acc, algo) => {
  acc[algo.id] = algo.simulator
  acc[algo.slug] = algo.simulator
  return acc
}, {})

/**
 * Complexity map
 */
export const ALGORITHM_COMPLEXITY = ALGORITHMS.reduce((acc, algo) => {
  acc[algo.id] = { time: algo.timeComplexity, space: algo.spaceComplexity }
  acc[algo.slug] = { time: algo.timeComplexity, space: algo.spaceComplexity }
  return acc
}, {})
