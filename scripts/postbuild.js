import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seoPaths = [
  '/',
  '/recursion-visualizer',
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

// 1. Create subdirectories and copy index.html for GH Pages 200 OK trick
seoPaths.forEach(routePath => {
  if (routePath === '/') return; // root is already handled by dist/index.html
  
  const routeDir = path.join(distDir, routePath);
  
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  
  // copy dist/index.html into the new folder
  fs.copyFileSync(indexHtmlPath, path.join(routeDir, 'index.html'));
  console.log(`Created: ${routePath}/index.html`);
});

// 2. Generate sitemap.xml
const baseUrl = 'https://yuvanesh.github.io/Recuriv';
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${seoPaths.map(p => `  <url>
    <loc>${baseUrl}${p === '/' ? '' : p}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent);
console.log('Generated: dist/sitemap.xml');
