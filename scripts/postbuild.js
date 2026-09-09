import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const allRoutes = [
  '/',
  '/recursion-visualizer',
  '/fibonacci-recursion',
  '/factorial-recursion',
  '/binary-search-recursion',
  '/merge-sort-visualizer',
  '/quick-sort-visualizer',
  '/n-queens-visualizer',
  '/backtracking-visualizer',
  '/visualize/fibonacci',
  '/visualize/factorial',
  '/visualize/merge-sort',
  '/visualize/quick-sort',
  '/visualize/binary-search',
  '/visualize/n-queens',
  '/visualize/backtracking',
  '/visualize/sum-array',
  '/visualize/power',
  '/recursion-tree-visualizer',
  '/recursion-call-stack-visualizer',
  '/visualize-recursion',
  '/recursion-in-java',
  '/recursion-examples',
  '/factorial-recursion-visualization',
  '/fibonacci-recursion-visualization'
];

const distDir = path.resolve(__dirname, '../dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error("Error: dist/index.html does not exist. Did the build fail?");
  process.exit(1);
}

// 1. Create subdirectories and copy index.html for static server / GH Pages direct navigation & refresh
allRoutes.forEach(routePath => {
  if (routePath === '/') return;
  
  const routeDir = path.join(distDir, routePath);
  
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  
  fs.copyFileSync(indexHtmlPath, path.join(routeDir, 'index.html'));
  console.log(`Created: ${routePath}/index.html`);
});

// Also create 404.html fallback in dist root for SPA hostings
fs.copyFileSync(indexHtmlPath, path.join(distDir, '404.html'));
console.log('Created: dist/404.html');

// 2. Generate sitemap.xml
const baseUrl = 'https://yuvanesh.github.io/Recuriv';
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(p => `  <url>
    <loc>${baseUrl}${p === '/' ? '' : p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === '/' ? '1.0' : p.startsWith('/visualize/') ? '0.7' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent);
console.log('Generated: dist/sitemap.xml');
