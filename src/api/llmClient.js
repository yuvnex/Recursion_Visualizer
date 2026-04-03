/**
 * llmClient.js — OFFLINE ONLY
 *
 * Analyzes and traces recursive code entirely locally in the browser.
 * NO external API keys or dependencies required.
 *
 * How it works:
 *  1. Detect the recursive function name and entry call from code
 *  2. Transpile non-JS languages (Python, Java, C, C++) to JavaScript
 *  3. Instrument the function to record every call/return
 *  4. Execute in sandboxed context and return execution trace
 */

import { runCodeLocally } from '@/lib/codeRunner'

/**
 * Analyzes recursive code and returns execution trace.
 * Works entirely offline without any external dependencies.
 *
 * @param {string} code - Source code (JavaScript, Python, Java, C, C++)
 * @param {string} language - Programming language
 * @returns {Promise<{steps, functionName, invocation}>} Execution trace
 */
export const llmClient = {
  async analyzeCode(code, language = 'javascript') {
    try {
      // Run entirely locally — no API calls, no external dependencies
      const result = runCodeLocally(code, language)
      console.log(`[localExecution] traced "${result.funcName}" — ${result.steps.length} steps`)
      return {
        steps: result.steps,
        functionName: result.funcName,
        invocation: result.invocation,
      }
    } catch (error) {
      console.error('[analyzeCode] error:', error.message)
      throw new Error(
        `${error.message}\n\n` +
        `Java Recursion Types Guide:\n\n` +
        `1. LINEAR - Single recursive call:\n` +
        `   public int factorial(int n) {\n` +
        `       if (n <= 1) return 1;\n` +
        `       return n * factorial(n - 1);\n` +
        `   }\n\n` +
        `2. BINARY - Two recursive calls:\n` +
        `   public int fibonacci(int n) {\n` +
        `       if (n <= 1) return n;\n` +
        `       return fibonacci(n-1) + fibonacci(n-2);\n` +
        `   }\n\n` +
        `3. DIVIDE & CONQUER - Split problem:\n` +
        `   public int search(int[] arr, int t, int l, int r) {\n` +
        `       if (l > r) return -1;\n` +
        `       int m = (l + r) / 2;\n` +
        `       if (arr[m] == t) return m;\n` +
        `       return arr[m] > t ? search(arr,t,l,m-1) : search(arr,t,m+1,r);\n` +
        `   }\n\n` +
        `4. MULTIPLE - Loop with recursion:\n` +
        `   public void permute(String s, int l, int r) {\n` +
        `       if (l == r) { System.out.println(s); }\n` +
        `       else { for (int i=l; i<=r; i++) { \n` +
        `           char[] a = s.toCharArray();\n` +
        `           char t = a[l]; a[l] = a[i]; a[i] = t;\n` +
        `           permute(new String(a), l+1, r);\n` +
        `       }}\n` +
        `   }\n\n` +
        `5. BACKTRACKING - Try & undo:\n` +
        `   public boolean solve(int[] b, int r, int n) {\n` +
        `       if (r == n) return true;\n` +
        `       for (int c=0; c<n; c++) {\n` +
        `           if (isSafe(b,r,c)) {\n` +
        `               b[r] = c;\n` +
        `               if (solve(b, r+1, n)) return true;\n` +
        `           }\n` +
        `       }\n` +
        `       return false;\n` +
        `   }\n\n` +
        `Remember: Add function call at end! E.g., factorial(5);`
      )
    }
  },
}
