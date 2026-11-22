// node tools/captura.cjs tools/hoja.html salida.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage();
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CON', m.text()); });
  await p.goto('file://' + path.resolve(process.argv[2])); await p.waitForFunction('window.__listo === true', null, { timeout: 120000 });
  const d = await p.evaluate(() => window.__png); fs.writeFileSync(process.argv[3], Buffer.from(d.split(',')[1], 'base64')); await b.close(); console.log('ok'); })();
