import { runCodeLocally, debugTranspileToJS } from './src/lib/codeRunner.js';
import fs from 'fs';

let runnerCode = fs.readFileSync('./src/lib/codeRunner.js', 'utf8');

// I will patch the runnerCode string manually and eval it to test
runnerCode = runnerCode.replace(
  /\/\/ STEP 12b: Convert array literal initializers/,
  `// STEP 12.1: Constants
  r = r.replace(/\\bInteger\\.MAX_VALUE\\b/g, '2147483647');
  r = r.replace(/\\bInteger\\.MIN_VALUE\\b/g, '-2147483648');
  r = r.replace(/\\bLong\\.MAX_VALUE\\b/g, '9223372036854775807');
  r = r.replace(/\\bLong\\.MIN_VALUE\\b/g, '-9223372036854775808');
  r = r.replace(/\\bDouble\\.POSITIVE_INFINITY\\b/g, 'Infinity');
  r = r.replace(/\\bDouble\\.NEGATIVE_INFINITY\\b/g, '-Infinity');

  // STEP 12.2: Class Instantiations like Solution sol = new Solution();
  r = r.replace(/\\b[A-Z]\\w*\\s+[A-Za-z_]\\w*\\s*=\\s*new\\s+[A-Z]\\w*\\s*\\([^)]*\\)\\s*;/g, '');

  // STEP 12.3: Multidimensional and typed array literals: new int[][]{{1,2},{3,4}} -> [[1,2],[3,4]]
  const replaceJavaArrayLiterals = (code) => {
    let result = code;
    const regex = /\\bnew\\s+(?:int|long|double|float|boolean|bool|char|String|string|auto)\\s*(?:\\[\\s*\\])+\\s*\\{/g;
    let match;
    while ((match = regex.exec(result)) !== null) {
      const startIdx = match.index;
      const braceStartIdx = startIdx + match[0].length - 1;
      let depth = 0;
      let endIdx = -1;
      for (let i = braceStartIdx; i < result.length; i++) {
        if (result[i] === '{') depth++;
        else if (result[i] === '}') depth--;
        
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
      
      if (endIdx !== -1) {
        const before = result.substring(0, startIdx);
        const arrayStr = result.substring(braceStartIdx, endIdx + 1);
        const after = result.substring(endIdx + 1);
        
        const converted = arrayStr.replace(/\\{/g, '[').replace(/\\}/g, ']');
        result = before + converted + after;
        regex.lastIndex = 0; 
      } else {
         break;
      }
    }
    return result;
  };
  r = replaceJavaArrayLiterals(r);

  // STEP 12b: Convert array literal initializers`
);

fs.writeFileSync('./codeRunner-patched.js', runnerCode);
