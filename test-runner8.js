import { runCodeLocally } from './codeRunner-patched2.js';
const code = `class Solution {
    public int findMaximum(int day,int last,int arr[][]){
        if(day==0){ return 1; }
        return 2;
    }
    public int maximumPoints(int mat[][]) {
        return findMaximum(mat.length-1,3,mat);
    }
}
Solution sol = new Solution();
sol.maximumPoints(new int[][]{{1,2,3},{4,5,6},{7,8,9}});
`;
try {
  runCodeLocally(code, 'java');
} catch (e) {
  console.error("Error:", e);
}
