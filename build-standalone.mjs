import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'dist', 'Cyril_Pahimnayan_Portfolio.html');
const fontStylesheet = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Instrument+Serif:ital@0;1&display=swap';
const browserUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchBytes(url) {
  const response = await fetch(url, { headers: { 'User-Agent': browserUserAgent } });
  if (!response.ok) throw new Error(`Could not fetch ${url}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

const [htmlSource, css, jsSource, fontCssBytes] = await Promise.all([
  readFile(path.join(root, 'index.html'), 'utf8'),
  readFile(path.join(root, 'styles.css'), 'utf8'),
  readFile(path.join(root, 'script.js'), 'utf8'),
  fetchBytes(fontStylesheet)
]);

const fontFaces = [...fontCssBytes.toString('utf8').matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]*\})/g)].map((match) => match[1]);
if (!fontFaces.some((face) => face.includes("'DM Sans'")) || !fontFaces.some((face) => face.includes("'Instrument Serif'"))) {
  throw new Error('Expected Latin font files were not found.');
}

const fontUrls = [...new Set(fontFaces.flatMap((face) => [...face.matchAll(/url\((https:\/\/[^)]+)\)/g)].map((match) => match[1])))];
const fontData = new Map(await Promise.all(fontUrls.map(async (url) => [url, (await fetchBytes(url)).toString('base64')])));
const embeddedFonts = fontFaces.map((face) => face.replace(/url\((https:\/\/[^)]+)\)/g, (_, url) => `url(data:font/woff2;base64,${fontData.get(url)})`)).join('\n');

const imageNames = [...new Set([...jsSource.matchAll(/\['([^']+\.png)'/g)].map((match) => match[1]))];
const imageData = new Map(await Promise.all(imageNames.map(async (name) => [name, `data:image/png;base64,${(await readFile(path.join(root, name))).toString('base64')}`])));
let js = jsSource;
for (const [name, dataUrl] of imageData) {
  js = js.replaceAll(`'${name}'`, `'${dataUrl}'`);
}

// Blob URLs keep the full-size artwork links usable in Chrome's local-file viewer.
const imageLinkHelper = `
const standaloneImageUrls = new Map();
function imageOpenURL(dataUrl) {
  if (!dataUrl.startsWith('data:image/')) return dataUrl;
  if (!standaloneImageUrls.has(dataUrl)) {
    const comma = dataUrl.indexOf(',');
    const binary = atob(dataUrl.slice(comma + 1));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    const blob = new Blob([bytes], { type: dataUrl.slice(5, comma).split(';')[0] });
    standaloneImageUrls.set(dataUrl, URL.createObjectURL(blob));
  }
  return standaloneImageUrls.get(dataUrl);
}
`;
if (!js.includes('const projects = [') || !js.includes('link.href = file;')) throw new Error('Portfolio script structure changed.');
js = js.replace('const projects = [', `${imageLinkHelper}\nconst projects = [`).replace('link.href = file;', 'link.href = imageOpenURL(file);');

let html = htmlSource;
html = html.replace(/^\s*<link rel="preconnect" href="https:\/\/fonts\.(?:googleapis|gstatic)\.com"[^>]*>\r?\n/gm, '');
html = html.replace(/^\s*<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>\r?\n/gm, '');
if (!html.includes('<link rel="stylesheet" href="styles.css" />') || !html.includes('<script defer src="script.js"></script>')) {
  throw new Error('Portfolio HTML structure changed.');
}
html = html.replace('<link rel="stylesheet" href="styles.css" />', `<style>\n${embeddedFonts}\n${css}\n</style>`);
html = html.replace(/^\s*<script defer src="script.js"><\/script>\r?\n/m, '');
const portrait = `data:image/png;base64,${(await readFile(path.join(root, 'images/1754007133255.png'))).toString('base64')}`;
if (!html.includes('src="images/1754007133255.png"')) throw new Error('Portrait image reference changed.');
html = html.replace('src="images/1754007133255.png"', `src="${portrait}"`);
html = html.replace('</body>', `<script>\n${js}\n</script>\n  </body>`);

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, html, 'utf8');
console.log(`Created ${output} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB, ${imageNames.length + 1} images)`);
