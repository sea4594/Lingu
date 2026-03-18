import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');
const distIndexPath = resolve(distDir, 'index.html');
const distAppJsPath = resolve(distDir, 'assets', 'app.js');
const distAppCssPath = resolve(distDir, 'assets', 'app.css');

if (!existsSync(distIndexPath)) {
  throw new Error('dist/index.html does not exist. Run the build before verification.');
}

const html = readFileSync(distIndexPath, 'utf8');

if (html.includes('/src/main.tsx')) {
  throw new Error('dist/index.html still references /src/main.tsx, which will fail on GitHub Pages.');
}

const referenceRegex = /(?:src|href)="([^"]+)"/g;
const assetPaths = new Set();
let match;

while ((match = referenceRegex.exec(html)) !== null) {
  const rawPath = match[1];

  if (!rawPath.includes('/assets/')) {
    continue;
  }

  const withoutQuery = rawPath.split('?')[0];
  const relativePath = withoutQuery
    .replace(/^\//, '')
    .replace(/^Lingu\//, '');

  assetPaths.add(relativePath);
}

if (assetPaths.size === 0) {
  throw new Error('No /assets/ references found in dist/index.html.');
}

if (!existsSync(distAppJsPath) || !existsSync(distAppCssPath)) {
  throw new Error('Stable Pages aliases dist/assets/app.js and dist/assets/app.css are missing.');
}

const missing = [...assetPaths].filter((assetPath) => !existsSync(resolve(distDir, assetPath)));

if (missing.length > 0) {
  throw new Error(`Missing built assets referenced by dist/index.html: ${missing.join(', ')}`);
}

console.log('Pages build verification passed.');
