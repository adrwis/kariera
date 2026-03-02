// NextMove — Build script (minification)
// Uses esbuild from parent project (adriana-gusciora-pl)

const esbuild = require('C:/Users/adria/OneDrive/Dokumenty/GitHub/adriana-gusciora-pl/node_modules/.pnpm/esbuild@0.25.12/node_modules/esbuild');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

async function build() {
  const jsFiles = ['app.js', 'search.js', 'animations.js'];
  let totalSaved = 0;

  // Minify JS files
  for (const file of jsFiles) {
    const src = path.join(ROOT, 'js', file);
    const out = path.join(ROOT, 'js', file.replace('.js', '.min.js'));
    const code = fs.readFileSync(src, 'utf-8');
    const result = await esbuild.transform(code, {
      minify: true,
      target: 'es2020',
    });
    fs.writeFileSync(out, result.code);
    const srcSize = fs.statSync(src).size;
    const outSize = fs.statSync(out).size;
    const pct = Math.round((1 - outSize / srcSize) * 100);
    totalSaved += srcSize - outSize;
    console.log(`  js/${file} → ${file.replace('.js', '.min.js')}  (${srcSize} → ${outSize} bytes, -${pct}%)`);
  }

  // Minify CSS
  const cssSrc = path.join(ROOT, 'css', 'style.css');
  const cssOut = path.join(ROOT, 'css', 'style.min.css');
  const cssCode = fs.readFileSync(cssSrc, 'utf-8');
  const cssResult = await esbuild.transform(cssCode, {
    minify: true,
    loader: 'css',
  });
  fs.writeFileSync(cssOut, cssResult.code);
  const cssSrcSize = fs.statSync(cssSrc).size;
  const cssOutSize = fs.statSync(cssOut).size;
  const cssPct = Math.round((1 - cssOutSize / cssSrcSize) * 100);
  totalSaved += cssSrcSize - cssOutSize;
  console.log(`  css/style.css → style.min.css  (${cssSrcSize} → ${cssOutSize} bytes, -${cssPct}%)`);

  console.log(`\n  Total saved: ${(totalSaved / 1024).toFixed(1)} KB`);
}

build().catch(e => { console.error('Build failed:', e); process.exit(1); });
