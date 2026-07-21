import { debugTranspileToJS } from './codeRunner-patched.js';

const javaCode = `
int findMaximum(int day, int last, int[][] arr) {
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

findMaximum(2, 3, new int[][]{{1,2,5},{3,1,1},{3,3,3}});
`;

try {
    const jsCode = debugTranspileToJS(javaCode, 'java');
    console.log("Transpiled Code:\n", jsCode);
} catch (e) {
    console.error("Error:", e);
}
