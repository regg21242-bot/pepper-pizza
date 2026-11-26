// Vista previa rápida: node previa.cjs <t0> <t1> <fps> <salida.mp4> [audio.wav]   (GL a 540x960, salida 540x960)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path');
(async () => { const [t0, t1, fps, outF, aud] = [+process.argv[2], +process.argv[3], +process.argv[4], process.argv[5], process.argv[6]];
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 540, height: 960 } }); p.on('pageerror', e => { console.error('Error en página:', e.message); process.exit(1); });
  await p.goto('file://' + path.resolve('index.html') + '?render&baja'); await p.waitForFunction('window.__listo === true', null, { timeout: 300000 });
  const ff = ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-']; if (aud) ff.push('-ss', String(t0), '-t', String(t1 - t0), '-i', aud);
  ff.push('-vf', 'scale=540:960', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p'); if (aud) ff.push('-c:a', 'aac', '-b:a', '160k', '-shortest'); ff.push(outF);
  const f = spawn('ffmpeg', ff, { stdio: ['pipe', 'ignore', 'inherit'] }); const n = Math.round((t1 - t0) * fps), c0 = Date.now();
  for (let i = 0; i < n; i++) { const d = await p.evaluate(t => window.frameJPEG(t, .9), t0 + i / fps); const buf = Buffer.from(d.split(',')[1], 'base64'); if (!f.stdin.write(buf)) await new Promise(r => f.stdin.once('drain', r)); }
  f.stdin.end(); await new Promise(r => f.on('close', r)); await b.close(); console.log('Listo', outF, ((Date.now() - c0) / 1000).toFixed(0) + ' s'); })();
