function replaceJavaArrayLiterals(code) {
    let result = code;
    const regex = /\bnew\s+(?:int|long|double|float|boolean|bool|char|String|string|auto)\s*(?:\[\s*\])+\s*\{/g;
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
        
        const converted = arrayStr.replace(/\{/g, '[').replace(/\}/g, ']');
        result = before + converted + after;
        regex.lastIndex = 0; 
      } else {
         break;
      }
    }
    return result;
}

let code = `
new int[][]{{1,2,3},{4,5,6},{7,8,9}}
new int[][] {{1, 2}, {3, 4}}
new int[] { 1, 2, 3 }
`;
console.log(replaceJavaArrayLiterals(code));
