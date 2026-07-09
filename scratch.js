import { runCodeLocally } from './src/lib/codeRunner.js';

const code = `
public void Permute(int[] nums, <Integer> ds, <Integer>> ans, boolean[] freq) {
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

// Call the function with input
Permute(new int[]{1, 2, 3}, new ArrayList<>(), new ArrayList<>(), new boolean[3])
`;

try {
  const result = runCodeLocally(code, 'java');
  console.log("Success! Extracted", result.steps.length, "steps");
} catch (e) {
  console.error("Error running code: ", e.message);
}
