// node ../lib/render.cjs salida.mp4 [audio.wav]   |   node ../lib/render.cjs --cuadros 1,5,9 carpeta
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path'), fs = require('fs');
(async () => { const a = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 540, height: 960 } }); p.on('pageerror', e => { console.error('Error en página:', e.message); process.exit(1); });
  p.on('console', m => { if (m.type() === 'error') console.error('CON', m.text()); });
  await p.goto('file://' + path.resolve('index.html') + '?render'); await p.waitForFunction('window.__listo === true', null, { timeout: 300000 });
  if (a[0] === '--cuadros') { fs.mkdirSync(a[2], { recursive: true }); for (const t of a[1].split(',').map(Number)) { const d = await p.evaluate(t => window.frameJPEG(t, .9), t); fs.writeFileSync(path.join(a[2], `t${t.toFixed(2).padStart(6, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64')); } await b.close(); return; }
  const FPS = 30, dur = await p.evaluate(() => window.DURATION), n = Math.round(dur * FPS);
  const ff = ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-']; if (a[1]) ff.push('-i', a[1]);
  ff.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart'); if (a[1]) ff.push('-c:a', 'aac', '-b:a', '192k', '-shortest'); ff.push(a[0]);
  const f = spawn('ffmpeg', ff, { stdio: ['pipe', 'ignore', 'inherit'] }); const t0 = Date.now();
  for (let i = 0; i < n; i++) { const d = await p.evaluate(t => window.frameJPEG(t, .94), i / FPS); const buf = Buffer.from(d.split(',')[1], 'base64'); if (!f.stdin.write(buf)) await new Promise(r => f.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`cuadro ${i}/${n} ${((Date.now() - t0) / 1000).toFixed(0)} s`); }
  f.stdin.end(); await new Promise(r => f.on('close', r)); await b.close(); console.log('Listo:', a[0]); })();
