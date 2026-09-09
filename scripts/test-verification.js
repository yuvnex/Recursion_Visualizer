import { ALGORITHMS, getAlgorithmByIdOrSlug, algorithmSimulators, ALGORITHM_COMPLEXITY } from '../src/lib/algorithmData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('--- 1. Testing Algorithm Registry & Simulators ---');
let algoErrors = 0;
ALGORITHMS.forEach(algo => {
  console.log(`Testing algorithm: ${algo.name} (${algo.id} / ${algo.slug})`);
  if (!algo.slug || !algo.name || !algo.code || !algo.timeComplexity || !algo.spaceComplexity) {
    console.error(`  [FAIL] Missing required metadata fields in ${algo.id}`);
    algoErrors++;
  }
  
  // Test simulator
  try {
    const steps = algo.simulator(algo.input);
    if (!Array.isArray(steps) || steps.length === 0) {
      console.error(`  [FAIL] Simulator for ${algo.id} returned empty or invalid steps`);
      algoErrors++;
    } else {
      console.log(`  [PASS] Simulator generated ${steps.length} execution steps.`);
    }
  } catch (err) {
    console.error(`  [FAIL] Simulator error for ${algo.id}:`, err);
    algoErrors++;
  }
});

console.log('\n--- 2. Testing Local Dev Server Routes via HTTP ---');
const testUrls = [
  'http://localhost:5173/',
  'http://localhost:5173/visualize/fibonacci',
  'http://localhost:5173/visualize/factorial',
  'http://localhost:5173/visualize/merge-sort',
  'http://localhost:5173/visualize/quick-sort',
  'http://localhost:5173/visualize/binary-search',
  'http://localhost:5173/visualize/n-queens',
  'http://localhost:5173/visualize/backtracking',
  'http://localhost:5173/fibonacci-recursion',
  'http://localhost:5173/factorial-recursion',
  'http://localhost:5173/binary-search-recursion',
  'http://localhost:5173/merge-sort-visualizer',
  'http://localhost:5173/quick-sort-visualizer',
  'http://localhost:5173/n-queens-visualizer',
  'http://localhost:5173/backtracking-visualizer',
  'http://localhost:5173/recursion-visualizer'
];

async function testHttpRoutes() {
  let httpErrors = 0;
  for (const url of testUrls) {
    try {
      const res = await fetch(url);
      if (res.status === 200) {
        console.log(`  [PASS] ${url} returned 200 OK`);
      } else {
        console.error(`  [FAIL] ${url} returned status ${res.status}`);
        httpErrors++;
      }
    } catch (e) {
      console.error(`  [FAIL] Fetch error for ${url}:`, e.message);
      httpErrors++;
    }
  }

  console.log('\n--- 3. Checking Static Build Artifacts ---');
  const distDir = path.resolve(__dirname, '../dist');
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    console.log(`  [PASS] sitemap.xml exists with length ${sitemapContent.length} bytes.`);
    
    // Check key URLs inside sitemap
    const requiredSitemapPaths = [
      '/visualize/fibonacci',
      '/visualize/n-queens',
      '/visualize/backtracking',
      '/fibonacci-recursion',
      '/factorial-recursion',
      '/binary-search-recursion',
      '/merge-sort-visualizer',
      '/quick-sort-visualizer',
      '/n-queens-visualizer',
      '/backtracking-visualizer',
      '/recursion-visualizer'
    ];
    requiredSitemapPaths.forEach(p => {
      if (sitemapContent.includes(p)) {
        console.log(`  [PASS] Sitemap contains ${p}`);
      } else {
        console.error(`  [FAIL] Sitemap missing ${p}`);
        httpErrors++;
      }
    });
  } else {
    console.error('  [FAIL] dist/sitemap.xml not found.');
  }

  console.log('\n==============================');
  if (algoErrors === 0 && httpErrors === 0) {
    console.log('🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error(`❌ VERIFICATION COMPLETED WITH ERRORS (Algo: ${algoErrors}, HTTP: ${httpErrors})`);
    process.exit(1);
  }
}

testHttpRoutes();
