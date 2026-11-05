// Render: node render.js [salida.mp4] [audio.wav]
// Dibuja cada fotograma en Chromium (Playwright) y lo envía a ffmpeg.
// Modo prueba: node render.js --stills 1,6,13 carpeta/
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const FPS = 30;

(async () => {
  const args = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
  page.on('pageerror', e => { console.error('Error en página:', e.message); process.exit(1); });
  await page.goto('file://' + path.join(__dirname, 'animacion.html') + '?render');
  await page.evaluate(() => document.fonts.ready);
  if (args[0] === '--stills') {
    const times = args[1].split(',').map(Number), dir = args[2];
    fs.mkdirSync(dir, { recursive: true });
    for (const t of times) {
      const d = await page.evaluate(t => window.frameJPEG(t, 0.9), t);
      fs.writeFileSync(path.join(dir, `t${String(t).padStart(5, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
    }
    await browser.close(); return;
  }
  const out = args[0] || path.join(__dirname, 'pachinko.mp4');
  const audio = args[1];
  const dur = await page.evaluate(() => window.DURATION);
  const frames = Math.round(dur * FPS);
  const ff = ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-'];
  if (audio) ff.push('-i', audio);
  ff.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart');
  if (audio) ff.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  ff.push(out);
  const p = spawn('ffmpeg', ff, { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let f = 0; f < frames; f++) {
    const d = await page.evaluate(t => window.frameJPEG(t, 0.95), f / FPS);
    const buf = Buffer.from(d.split(',')[1], 'base64');
    if (!p.stdin.write(buf)) await new Promise(r => p.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`fotograma ${f}/${frames}`);
  }
  p.stdin.end();
  await new Promise(r => p.on('close', r));
  await browser.close();
  console.log('Listo:', out);
})();
