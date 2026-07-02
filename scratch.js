import { runCodeLocally } from './src/lib/codeRunner.js';

const code = `
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
 int nums[]={1,2,3};
List<List<Integer>> ans=new ArrayList<>();
List<Integer> ds=new ArrayList<>();
boolean freq[]=new boolean[nums.length];
Permute(nums,ds,ans,freq);
`;

const result = runCodeLocally(code, 'java');
const calls = result.steps.filter(s => s.type === 'call').map(s => s.params.ds);
console.log(JSON.stringify(calls));
