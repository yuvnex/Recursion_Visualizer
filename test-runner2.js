import { runCodeLocally, debugTranspileToJS } from './src/lib/codeRunner.js';

let code = `
Integer.MIN_VALUE
Integer.MAX_VALUE
new int[][]{{1,2,3},{4,5,6},{7,8,9}}
new int[][] {{1, 2}, {3, 4}}
`;

// Let's add regex to fix these
code = code.replace(/\bInteger\.MAX_VALUE\b/g, 'Number.MAX_SAFE_INTEGER');
code = code.replace(/\bInteger\.MIN_VALUE\b/g, 'Number.MIN_SAFE_INTEGER');
// For multidimensional array instantiation: new int[][]{...} -> [...]
// In Java, the curly braces for 2D arrays look like {{1,2}, {3,4}}.
// But JS needs [[1,2], [3,4]].
// We can handle replacing `{` with `[` and `}` with `]` inside array initializers.

console.log(code);
