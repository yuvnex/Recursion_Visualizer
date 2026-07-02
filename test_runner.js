import { runCodeLocally, debugTranspileToJS } from './src/lib/codeRunner.js';

const code = `class Solution {
    public static void Permute(int nums[],List<Integer> ds,List<List<Integer>> ans, boolean freq[]){
        if(ds.size()==nums.length){
            ans.add(new ArrayList<>(ds));
            return;
        }
        for(int i=0;i<nums.length;i++){
            if(!freq[i]){
                freq[i]=true;
                ds.add(nums[i]);
                Permute(nums,ds,ans,freq);
                ds.remove(ds.size()-1);
                freq[i]=false;
            }
        }
    }
    public static List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> ans=new ArrayList<>();
        List<Integer> ds=new ArrayList<>();
        boolean freq[]=new boolean[nums.length];
        Permute(nums,ds,ans,freq);
        return ans; // Make sure to add this return!
    }
}

// Add the invocation at the end:
permute(new int[]{1, 2, 3});`;

const jsCode = debugTranspileToJS(code, 'java');
console.log("=== TRANSPILED JS ===");
console.log(jsCode);

try {
  const result = runCodeLocally(code, 'java');
  console.log("SUCCESS:", result.invocation);
} catch (e) {
  console.log("ERROR:", e.message);
}
