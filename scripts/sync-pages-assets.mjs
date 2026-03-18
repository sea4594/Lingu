import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');
const distAssetsDir = resolve(distDir, 'assets');
const rootAssetsDir = resolve(rootDir, 'assets');
const distIndexPath = resolve(distDir, 'index.html');

if (!existsSync(distAssetsDir) || !existsSync(distIndexPath)) {
  throw new Error('dist build output is missing. Run npm run build after vite build completes.');
}

mkdirSync(rootAssetsDir, { recursive: true });

const distIndexHtml = readFileSync(distIndexPath, 'utf8');
const distAssetFiles = readdirSync(distAssetsDir);
const jsFiles = distAssetFiles.filter((fileName) => fileName.endsWith('.js'));
const cssFiles = distAssetFiles.filter((fileName) => fileName.endsWith('.css'));

const runtimeEntryMatch = distIndexHtml.match(/src="[^"]*\/assets\/([^"/]+\.js)"/);
const runtimeEntryJs = runtimeEntryMatch?.[1];

const appJsCandidates = jsFiles.filter((fileName) => fileName !== runtimeEntryJs);
const entryJs = appJsCandidates.find((fileName) => fileName.startsWith('main-'))
  ?? appJsCandidates[0]
  ?? runtimeEntryJs;
const entryCss = cssFiles.find((fileName) => fileName.startsWith('main-')) ?? cssFiles[0];

if (!entryJs || !entryCss) {
  throw new Error('Could not determine app entry JS/CSS in dist/assets.');
}

const distEntryJsPath = resolve(distAssetsDir, entryJs);
const distEntryCssPath = resolve(distAssetsDir, entryCss);

if (!existsSync(distEntryJsPath) || !existsSync(distEntryCssPath)) {
  throw new Error(`Missing entry assets in dist/assets: ${entryJs}, ${entryCss}`);
}

copyFileSync(distEntryJsPath, resolve(distAssetsDir, 'app.js'));
copyFileSync(distEntryCssPath, resolve(distAssetsDir, 'app.css'));
copyFileSync(distEntryJsPath, resolve(rootAssetsDir, 'app.js'));
copyFileSync(distEntryCssPath, resolve(rootAssetsDir, 'app.css'));

const appBundleSource = readFileSync(distEntryJsPath, 'utf8');
const dependencyRegex = /import\((?:"|')\.\/([^"']+)(?:"|')\)|from\s+(?:"|')\.\/([^"']+)(?:"|')/g;
const dependencyFiles = new Set();
let depMatch;

while ((depMatch = dependencyRegex.exec(appBundleSource)) !== null) {
  const depFile = depMatch[1] ?? depMatch[2];
  if (depFile) {
    dependencyFiles.add(depFile);
  }
}

for (const depFile of dependencyFiles) {
  const distDepPath = resolve(distAssetsDir, depFile);
  if (!existsSync(distDepPath)) {
    throw new Error(`App bundle references missing dependency: ${depFile}`);
  }
  copyFileSync(distDepPath, resolve(rootAssetsDir, depFile));
}

console.log(`Synced Pages assets using ${basename(distEntryJsPath)} and ${basename(distEntryCssPath)}.`);
