import React from 'react';

export const seoRoutes = [
  {
    path: '/',
    title: 'Recursion Visualizer – Visualize Recursion Step by Step',
    description: 'The best online recursion visualizer. Generate recursion trees, trace the call stack, and understand data structures and algorithms (DSA) visually.',
    keywords: 'recursion visualizer, recursion tree, call stack, DSA, algorithm visualizer',
    initialExampleId: null, // default
    content: (
      <div className="flex flex-col items-center md:items-start">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-6">What is Recursion?</h2>
        <div className="space-y-5 text-[17px] leading-relaxed text-muted-foreground/90 max-w-3xl text-center md:text-left">
          <p>
            Recursion is a method in computer science where the solution to a problem depends on solutions to smaller instances of the same problem. 
            A recursive function calls itself to solve smaller subproblems until it reaches a <strong>base case</strong>, which stops the recursion.
          </p>
          <p>
            Our <strong>Recursion Visualizer</strong> helps you understand this complex concept by automatically generating a dynamic 
            <strong> recursion tree</strong> and tracing the <strong>call stack</strong> as the algorithm executes step-by-step.
          </p>
        </div>
      </div>
    )
  },
  {
    path: '/recursion-visualizer',
    title: 'Interactive Recursion Visualizer',
    description: 'Visualize recursive functions, understand the call stack, and step through code execution dynamically without API keys.',
    keywords: 'recursion visualizer, visualize recursion code',
    initialExampleId: null,
    content: (
      <div className="prose prose-zinc dark:prose-invert max-w-4xl mx-auto py-8">
        <h2>How to use the Recursion Visualizer</h2>
        <p>
          Simply write your code or select from our pre-built examples (like Fibonacci, Factorial, Merge Sort, and more).
          Hit 'Start' to see the visualization unfold. You can control the speed, pause, step forward, and step backward to truly grasp how the program flows.
        </p>
      </div>
    )
  },
  {
    path: '/recursion-tree-visualizer',
    title: 'Recursion Tree Visualizer - Build and Trace Trees',
    description: 'Generate recursion trees for any algorithm. Trace function calls visually with our recursion tree visualizer to master dynamic programming and DSA.',
    keywords: 'recursion tree visualizer, recursion tree generator, visual recursion tree',
    initialExampleId: 'fibonacci',
    content: (
      <div className="prose prose-zinc dark:prose-invert max-w-4xl mx-auto py-8">
        <h2>Understanding the Recursion Tree</h2>
        <p>
          A recursion tree is a powerful visual aid used to determine the time complexity of a recursive algorithm. 
          Each node in the tree represents a single function call. The children of a node represent the recursive calls made by that function.
        </p>
        <p>
          Using our <strong>Recursion Tree Visualizer</strong>, you can watch the tree grow dynamically. Nodes turn green when they hit a base case and return a value, propagating the results back up the tree.
        </p>
      </div>
    )
  },
  {
    path: '/recursion-call-stack-visualizer',
    title: 'Call Stack Visualizer - Trace Recursive Functions',
    description: 'Watch the execution context and call stack grow and shrink as recursive functions execute. Perfect for debugging and learning computer science.',
    keywords: 'recursion call stack visualizer, visualize call stack, execution context',
    initialExampleId: 'factorial',
    content: (
      <div className="prose prose-zinc dark:prose-invert max-w-4xl mx-auto py-8">
        <h2>The Call Stack in Recursion</h2>
        <p>
          The call stack is a stack data structure that stores information about the active subroutines of a computer program. 
          In recursion, every time a function calls itself, a new <em>stack frame</em> is pushed onto the stack. 
          When the function returns, its frame is popped off.
        </p>
        <p>
          Stack overflows occur when the recursion goes too deep without hitting a base case. This visualizer helps you trace the exact variables and state at every level of the stack.
        </p>
      </div>
    )
  },
  {
    path: '/visualize-recursion',
    title: 'Visualize Recursion Step by Step',
    description: 'Learn how to visualize recursion in algorithms. Trace variables, understand the flow of control, and debug recursive code easily.',
    keywords: 'visualize recursion, learn recursion visually',
    initialExampleId: null,
    content: (
      <div className="prose prose-zinc dark:prose-invert max-w-4xl mx-auto py-8">
        <h2>Why is it so hard to Visualize Recursion?</h2>
        <p>
          Human brains are wired to think iteratively (loops), not recursively. Keeping track of multiple nested function calls and their respective return values in your head is incredibly difficult.
        </p>
        <p>
          By using a tool to <strong>visualize recursion</strong>, you offload the cognitive burden to the computer. You can literally see the state of the program at any given microsecond.
        </p>
      </div>
    )
  },
  {
    path: '/recursion-in-java',
    title: 'Recursion in Java - Visualized Examples',
    description: 'Understand how recursion works in Java. Trace method calls on the JVM stack with our visualizer tool.',
    keywords: 'recursion in Java, java recursive method, java call stack',
    initialExampleId: 'binarySearch',
    content: (
      <div className="prose prose-zinc dark:prose-invert max-w-4xl mx-auto py-8">
        <h2>Recursion in Java</h2>
        <p>
          In Java, recursion happens when a method calls itself. Under the hood, the Java Virtual Machine (JVM) allocates a new frame on the thread's stack for every method invocation.
        </p>
        <p>
          Although our visualizer uses JavaScript for the browser, the underlying computer science principles—the call stack, base cases, and recursion trees—are exactly identical to how Java processes recursive methods.
        </p>
      </div>
    )
  },
  {
    path: '/recursion-examples',
    title: 'Common Recursion Examples & Algorithms',
    description: 'Explore common recursion examples like Fibonacci, Factorial, Merge Sort, Quick Sort, and Binary Search with interactive visualizations.',
    keywords: 'recursion examples, common recursive algorithms',
    initialExampleId: 'mergeSort',
    content: (
      <div className="prose prose-zinc dark:prose-invert max-w-4xl mx-auto py-8">
        <h2>Top Recursion Examples</h2>
        <ul>
          <li><strong>Factorial:</strong> The classic introductory example. Computes the product of an integer and all the integers below it.</li>
          <li><strong>Fibonacci Sequence:</strong> Demonstrates multiple recursive branches (a node calling two children).</li>
          <li><strong>Binary Search:</strong> A highly efficient algorithm (O(log n)) for finding an item in a sorted array by repeatedly dividing the search space in half.</li>
          <li><strong>Merge Sort & Quick Sort:</strong> Divide and conquer sorting algorithms that rely heavily on recursion.</li>
        </ul>
      </div>
    )
  },
  {
    path: '/factorial-recursion-visualization',
    title: 'Factorial Recursion Visualization',
    description: 'Step through the factorial algorithm recursively. Watch how the base case triggers the unwinding of the call stack.',
    keywords: 'factorial recursion visualization, visualize factorial, factorial algorithm',
    initialExampleId: 'factorial',
    content: (
      <div className="prose prose-zinc dark:prose-invert max-w-4xl mx-auto py-8">
        <h2>Visualizing Factorial Recursion</h2>
        <p>
          The factorial function (denoted as <code>n!</code>) is defined as <code>n * (n-1)!</code> with the base case of <code>1! = 1</code> and <code>0! = 1</code>.
        </p>
        <p>
          When you visualize this, you will see a linear recursion tree. The call stack grows until <code>n</code> reaches 1, at which point the calls start returning, multiplying the values as they pop off the stack.
        </p>
      </div>
    )
  },
  {
    path: '/fibonacci-recursion-visualization',
    title: 'Fibonacci Recursion Visualization',
    description: 'Visualize the exponential time complexity of the naive recursive Fibonacci algorithm. See the overlapping subproblems dynamically.',
    keywords: 'fibonacci recursion visualization, fibonacci recursion tree',
    initialExampleId: 'fibonacci',
    content: (
      <div className="prose prose-zinc dark:prose-invert max-w-4xl mx-auto py-8">
        <h2>Visualizing the Fibonacci Sequence</h2>
        <p>
          The naive recursive implementation of the Fibonacci sequence is <code>fib(n) = fib(n-1) + fib(n-2)</code>. 
        </p>
        <p>
          As you visualize this execution, notice how the recursion tree branches out immensely. You will clearly see <em>overlapping subproblems</em> (the same function arguments evaluated multiple times). This visual proof is exactly why we need Dynamic Programming (memoization) to optimize it!
        </p>
      </div>
    )
  }
];
