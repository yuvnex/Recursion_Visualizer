import { runCodeLocally, debugTranspileToJS } from './codeRunner-patched2.js';

const code = `class Solution {
    public int findMaximum(int day,int last,int arr[][]){
        if(day==0){
            int max=Integer.MIN_VALUE;
            for(int i=0;i<3;i++){
                if(i!=last){
                    max=Math.max(max,arr[0][i]);
                }
            }
            return max;
        }
        int max=0;
        for(int i=0;i<3;i++){
            int points=0;
            if(i!=last){
                points=arr[day][i]+findMaximum(day-1,i,arr);
                 max=Math.max(points,max);
            }
            
           
        }
        return max;
    }
    public int maximumPoints(int mat[][]) {
        return findMaximum(mat.length-1,3,mat);
    }
}

Solution sol = new Solution();
sol.maximumPoints(new int[][]{{1,2,3},{4,5,6},{7,8,9}});
`;

console.log("Transpiled:");
console.log(debugTranspileToJS(code, 'java'));

try {
  const result = runCodeLocally(code, 'java');
  console.log("Success! Steps:", result.steps.length);
} catch (e) {
  console.error("Error:", e);
}
