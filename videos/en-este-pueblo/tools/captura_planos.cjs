// node tools/captura_esc.cjs pueblo fiesta ...  → escenarios/<nombre>.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const k of process.argv.slice(2)) { const p = await b.newPage(); const t0 = Date.now();
    p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CON', m.text()); });
    await p.goto('file://' + path.resolve(__dirname, 'planos.html') + '#' + k); await p.waitForFunction('window.__listo === true', null, { timeout: 600000 });
    const d = await p.evaluate(() => window.__png); if (d) fs.writeFileSync(path.resolve(__dirname, '../planos', 'plano_' + k + '.png'), Buffer.from(d.split(',')[1], 'base64'));
    console.log(k, d ? 'ok' : 'FALLÓ', ((Date.now() - t0) / 1000).toFixed(1) + ' s'); await p.close(); }
  await b.close(); })();
