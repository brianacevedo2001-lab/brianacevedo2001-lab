// Captura header.html fotograma a fotograma y arma assets/header.gif con ffmpeg.
// Uso: node header/render.js   (requiere playwright-core, Edge/Chrome y ffmpeg en el PATH)
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

let chromium;
try { ({ chromium } = require('playwright-core')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core')); }

const FPS = 15;
const root = path.resolve(__dirname, '..');
const framesDir = path.join(__dirname, '.frames');
const out = path.join(root, 'assets', 'header.gif');

(async () => {
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 320 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'header.html').replace(/\\/g, '/') + '?static');
  await page.evaluate(() => window.ready);
  const period = await page.evaluate(() => window.PERIOD);
  const canvas = await page.$('canvas');

  const total = Math.round(period * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate(t => window.render(t), i / FPS);
    await canvas.screenshot({ path: path.join(framesDir, `f${String(i).padStart(4, '0')}.png`) });
  }
  await browser.close();

  const input = path.join(framesDir, 'f%04d.png');
  const palette = path.join(framesDir, 'palette.png');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', input,
    '-vf', 'palettegen=max_colors=192:stats_mode=full', palette]);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', input, '-i', palette,
    '-lavfi', 'paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle', '-loop', '0', out]);

  fs.rmSync(framesDir, { recursive: true, force: true });
  console.log(`${total} fotogramas → ${out} (${(fs.statSync(out).size / 1048576).toFixed(2)} MB)`);
})();
