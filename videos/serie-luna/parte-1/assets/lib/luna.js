/* Serie "Luna" — piezas reutilizables (parte 1 y 2): altavoz con anillo de luz, ciudad nocturna tras el ventanal,
   ático (madera, lámpara de arco, sofá, cámaras domo, pantalla con el logo), objetos (tarjeta-llave, enchufe con etiqueta,
   cafetera, mesita con foto), móvil genérico y gráficos de interfaz dibujados en canvas.  Uso: const L = window.L; */
(function () {
  const THREE = window.THREE, N = window.N, { rng, clamp, lerp, prog, ease, easeOut } = N;
  const HDR = (r, g, b) => new THREE.Color(r, g, b);
  const CIAN = '#3FE6F2', ROJO = '#E8323A';
  const sm = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .6, metalness: 0 }, o));
  const M = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
  function rbox(w, h, d, r = .03, seg = 3) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4);
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const b = Math.min(r * .5, d * .3); const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: seg, curveSegments: 8 }); g.translate(0, 0, -(d - 2 * b) / 2); return g; }
  const cv = (w, h, draw, srgb = true) => N.canvasTex(w, h, draw, srgb);
  const glow = (c, s, op = 1) => { const g = N.glow(c, s, op); g.material.fog = false; return g; };
  const rr = (x, X, Y, W, H, R) => { x.beginPath(); x.roundRect(X, Y, W, H, R); };

  // ---------- logo de Luna (círculos concéntricos, anillos punteados, punto central) ----------
  function logo(x, cx, cy, R, alpha = 1, col = CIAN) {
    x.save(); x.globalAlpha = alpha; x.strokeStyle = col; x.fillStyle = col; x.shadowColor = col; x.shadowBlur = R * .25;
    x.lineWidth = R * .07; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke();
    x.lineWidth = R * .04; x.setLineDash([R * .06, R * .09]); x.beginPath(); x.arc(cx, cy, R * .76, 0, 7); x.stroke(); x.setLineDash([]);
    x.lineWidth = R * .05; x.beginPath(); x.arc(cx, cy, R * .52, 0, 7); x.stroke();
    x.setLineDash([R * .03, R * .07]); x.lineWidth = R * .03; x.beginPath(); x.arc(cx, cy, R * .32, 0, 7); x.stroke(); x.setLineDash([]);
    x.shadowBlur = R * .5; x.fillStyle = '#E8FFFF'; x.beginPath(); x.arc(cx, cy, R * .11, 0, 7); x.fill(); x.restore(); }

  // ---------- ciudad nocturna enorme (textura): llanura de luces, avenidas en X y un grupo de rascacielos finos ----------
  function texCiudad(seed = 4) {
    const W = 4096, H = 2048; return cv(W, H, (x) => { const r = rng(seed), hz = H * .34;
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#04060F'); g.addColorStop(.2, '#0A0E22'); g.addColorStop(.3, '#2A1E34'); g.addColorStop(.34, '#4A2E2E'); g.addColorStop(.345, '#140E14'); g.addColorStop(1, '#060508'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      // perfil bajo de la ciudad lejana en el horizonte
      for (let i = 0; i < 90; i++) { const w = 30 + r() * 90, h = 4 + Math.pow(r(), 3) * 30, X = r() * W; x.fillStyle = '#1A1218'; x.fillRect(X, hz - h, w, h + 2); }
      // grupo de 4 rascacielos finos a la derecha (ventanitas azules, remates rojo/verde agua)
      const tor = [[.507, 150, '#FF4A4A'], [.514, 135, '#E8F0FF'], [.521, 165, '#6AE8D8'], [.529, 120, '#E8F0FF']];
      tor.forEach(([fx, h, col], k) => { const X = W * fx, w = 20, Y = hz - h; x.fillStyle = '#0C1022'; if (k === 1) { x.beginPath(); x.moveTo(X, hz); x.lineTo(X, Y + 18); x.quadraticCurveTo(X + w / 2, Y - 6, X + w, Y + 18); x.lineTo(X + w, hz); x.fill(); } else x.fillRect(X, Y, w, h);
        for (let yy = Y + 16; yy < hz - 4; yy += 7) for (let xx = X + 6; xx < X + w - 6; xx += 6) if (r() < .55) { x.fillStyle = `rgba(150,190,255,${.35 + r() * .55})`; x.fillRect(xx, yy, 3, 3); }
        x.fillStyle = col; x.shadowColor = col; x.shadowBlur = 14; x.fillRect(X + (k === 2 ? 0 : w / 2 - 4), Y - (k === 2 ? 8 : 4), k === 2 ? w : 8, k === 2 ? 10 : 6); x.shadowBlur = 0; });
      // resplandor anaranjado sobre el horizonte
      const gl = x.createLinearGradient(0, hz - 160, 0, hz + 40); gl.addColorStop(0, 'rgba(255,140,80,0)'); gl.addColorStop(.75, 'rgba(255,150,90,.18)'); gl.addColorStop(1, 'rgba(255,150,90,0)'); x.fillStyle = gl; x.fillRect(0, hz - 160, W, 200);
      // llanura de luces: millones de puntitos cálidos, más pequeños hacia el horizonte
      for (let i = 0; i < 220000; i++) { const v = Math.pow(r(), 1.5), Y = hz + v * (H - hz), X = r() * W, sz = .5 + v * 3.4; const c = r(); x.fillStyle = c < .72 ? `rgba(255,${190 + r() * 50 | 0},${120 + r() * 60 | 0},${.3 + r() * .6})` : c < .93 ? `rgba(255,246,226,${.35 + r() * .55})` : `rgba(150,190,255,${.3 + r() * .5})`; x.fillRect(X, Y, sz, sz); }
      // avenidas que brillan: dos grandes diagonales en X y varias secundarias
      x.globalCompositeOperation = 'lighter';
      const av = (x0, y0, x1, y1, wd, a) => { x.strokeStyle = `rgba(255,200,110,${a})`; x.lineWidth = wd; x.shadowColor = '#FFB050'; x.shadowBlur = 18; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); x.shadowBlur = 0; x.strokeStyle = `rgba(255,240,200,${a})`; x.lineWidth = wd * .35; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); };
      const vx = W * .46; [[-.15, 7, .42], [1.1, 7, .4]].forEach(([fx, wd, al]) => av(W * fx, H * .95, vx + (W * fx - vx) * .03, hz + 3, wd, al)); av(0, hz + 160, W, hz + 120, 3, .22); av(W * .3, H, W * .52, hz + 3, 3, .2);
      x.globalCompositeOperation = 'source-over';
    }); }

  // ---------- altavoz: cilindro azul muy oscuro, con anillo de luz abierto arriba y haz tenue ----------
  function altavoz(esc = 1, hMul = 1) {
    const g = new THREE.Group(), h = .52 * esc * hMul, r = .085 * esc;
    const tela = cv(256, 512, (x, w, hh) => { const gg = x.createLinearGradient(0, 0, w, 0); gg.addColorStop(0, '#141A28'); gg.addColorStop(.45, '#36415A'); gg.addColorStop(1, '#141A28'); x.fillStyle = gg; x.fillRect(0, 0, w, hh); x.fillStyle = 'rgba(255,255,255,.035)'; for (let j = 0; j < hh; j += 5) for (let i = (j / 5 % 2) * 2.5; i < w; i += 5) x.fillRect(i, j, 1.5, 1.5); });
    const cuerpo = M(new THREE.CylinderGeometry(r, r, h, 72, 1, true), sm('#FFFFFF', { map: tela, roughness: .7, metalness: .2 }), 0, h / 2, 0); g.add(cuerpo);
    const hueco = M(new THREE.CylinderGeometry(r * .93, r * .93, .02 * esc, 64), sm('#05070C', { roughness: .9 }), 0, h - .012 * esc, 0); g.add(hueco);
    const borde = M(new THREE.TorusGeometry(r * .985, .006 * esc, 10, 96), sm('#2A3040', { metalness: .7, roughness: .3 }), 0, h, 0); borde.rotation.x = Math.PI / 2; g.add(borde);
    const anM = new THREE.MeshBasicMaterial({ color: HDR(.5, 2.6, 3.0), toneMapped: false });
    const anillo = M(new THREE.TorusGeometry(r * .86, .0075 * esc, 12, 96), anM, 0, h - .004 * esc, 0); anillo.rotation.x = Math.PI / 2; anillo.castShadow = false; g.add(anillo);
    const halo = glow(CIAN, .55 * esc, .45); halo.position.set(0, h + .01 * esc, 0); halo.scale.set(.3 * esc, .09 * esc, 1); g.add(halo);
    const hazT = cv(64, 256, (x, w, hh) => { const gg = x.createLinearGradient(0, hh, 0, 0); gg.addColorStop(0, 'rgba(255,255,255,.7)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(0, 0, w, hh); const gx = x.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = gx; x.fillRect(0, 0, w, hh); }, false);
    const haz = new THREE.Mesh(new THREE.PlaneGeometry(r * .9, h * 1.1), new THREE.MeshBasicMaterial({ map: hazT, color: HDR(.1, .35, .45), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); haz.position.set(0, h + h * .55, 0); haz.visible = false; g.add(haz);
    const luz = new THREE.PointLight(CIAN, 1.4, 2.5 * esc, 1.5); luz.position.set(0, h + .1 * esc, .05); g.add(luz);
    const C = new THREE.Color(), cC = new THREE.Color(CIAN), cB = new THREE.Color('#FFFFFF');
    g.setColor = (k, I = 1) => { C.copy(cC).lerp(cB, k); anM.color.setRGB(C.r * 2.6 * I, C.g * 2.6 * I, C.b * 2.6 * I); halo.material.color.copy(C); halo.material.opacity = .45 * I; haz.material.color.setRGB(C.r * .2 * I, C.g * .25 * I + .1 * (1 - k), C.b * .3 * I); luz.color.copy(C); luz.intensity = 1.4 * I; };
    g.userData = { h, r, anillo, halo, luz, haz }; return g;
  }

  // ---------- cámara domo del techo con lucecita roja ----------
  function domo() { const g = new THREE.Group(); g.add(M(new THREE.CylinderGeometry(.09, .09, .02, 40), sm('#3A3C44', { roughness: .5 }), 0, 0, 0));
    const cup = M(new THREE.SphereGeometry(.075, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), sm('#20232A', { roughness: .15, metalness: .4 }), 0, -.01, 0); g.add(cup);
    g.add(M(new THREE.SphereGeometry(.028, 20, 14), sm('#1A1C22', { roughness: .2, metalness: .5 }), 0, -.045, .02));
    const led = new THREE.Mesh(new THREE.SphereGeometry(.006, 10, 8), new THREE.MeshBasicMaterial({ color: HDR(3, .3, .3), toneMapped: false })); led.position.set(.02, -.06, .05); g.add(led);
    const lg = glow('#FF3030', .12, .8); lg.position.copy(led.position); g.add(lg);
    g.setLed = (k, s = 1) => { led.material.color.setRGB(3 * k + .05, .3 * k + .02, .3 * k + .02); lg.material.opacity = .9 * k; lg.scale.setScalar(.06 * s); }; return g; }

  // ---------- móvil genérico con pantalla en canvas (sin marca) ----------
  function movil() { const g = new THREE.Group(), w = .075, h = .162;
    g.add(M(rbox(w, h, .008, .011, 4), sm('#121318', { roughness: .3, metalness: .6 }))); g.add(M(rbox(w + .0012, h + .0012, .0062, .0115, 4), sm('#4A4E58', { roughness: .25, metalness: .9 })));
    const c = document.createElement('canvas'); c.width = 600; c.height = 1300; const x = c.getContext('2d'); const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(w - .004, h - .004), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.z = .0072; g.add(scr);
    const isla = M(rbox(.02, .006, .001, .003), sm('#000000'), 0, h / 2 - .008, .0076); g.add(isla);
    return { grp: g, x, tex, W: 600, H: 1300, upd: () => { tex.needsUpdate = true; } }; }

  // ---------- retrato en el mismo estilo (para la foto de la mesita) ----------
  function retrato(x, X, Y, S, o = {}) { const piel = o.piel || '#C89A72', pelo = o.pelo || '#3A2A20';
    x.save(); x.translate(X, Y); x.scale(S, S);
    x.fillStyle = o.ropa || '#3A4A5A'; x.beginPath(); x.ellipse(0, 150, 120, 80, 0, 0, 7); x.fill();
    x.fillStyle = piel; x.fillRect(-18, 40, 36, 40); x.beginPath(); x.arc(0, 0, 70, 0, 7); x.fill();
    for (const s of [-1, 1]) { x.fillStyle = '#F6F2EA'; x.beginPath(); x.ellipse(s * 24, 4, 15, 17, 0, 0, 7); x.fill(); x.fillStyle = '#4A2E1A'; x.beginPath(); x.arc(s * 24, 6, 9, 0, 7); x.fill(); x.fillStyle = '#141010'; x.beginPath(); x.arc(s * 24, 6, 4.5, 0, 7); x.fill(); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(s * 24 - 16, -16, 32, 4); }
    x.strokeStyle = '#8A3A30'; x.lineWidth = 4; x.beginPath(); x.moveTo(-16, 40); x.quadraticCurveTo(0, 46, 16, 40); x.stroke();
    if (o.bigote) { x.fillStyle = pelo; x.beginPath(); x.ellipse(0, 30, 22, 7, 0, 0, 7); x.fill(); }
    if (o.gorra) { x.fillStyle = o.gorra; x.beginPath(); x.arc(0, -14, 72, Math.PI * 1.02, Math.PI * 1.98); x.fill(); x.fillRect(-72, -20, 144, 12); x.beginPath(); x.ellipse(40, -12, 70, 14, -.08, 0, 7); x.fill(); }
    else { x.fillStyle = pelo; x.beginPath(); x.arc(0, -8, 72, Math.PI * 1.05, Math.PI * 1.95); x.fill(); }
    x.restore(); }

  window.L = { HDR, CIAN, ROJO, sm, M, rbox, cv, glow, rr, logo, texCiudad, altavoz, domo, movil, retrato };
})();
