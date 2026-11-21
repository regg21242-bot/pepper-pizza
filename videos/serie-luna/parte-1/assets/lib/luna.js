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

  // ---------- ciudad nocturna enorme (textura) ----------
  function texCiudad(seed = 4) {
    const W = 4096, H = 2048; return cv(W, H, (x) => { const r = rng(seed), hz = H * .34;
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#050816'); g.addColorStop(.25, '#0C1230'); g.addColorStop(.34, '#2A2048'); g.addColorStop(.36, '#140E22'); g.addColorStop(1, '#07060C'); x.fillStyle = g; x.fillRect(0, 0, W, H);
      // rascacielos lejanos con ventanitas azules
      for (let i = 0; i < 140; i++) { const w = 30 + r() * 90, h = 60 + Math.pow(r(), 2.2) * 420, X = r() * W, Y = hz - h + 10; x.fillStyle = '#0A0E1E'; x.fillRect(X, Y, w, h);
        for (let yy = Y + 8; yy < hz - 6; yy += 12) for (let xx = X + 6; xx < X + w - 6; xx += 10) if (r() < .45) { x.fillStyle = r() < .8 ? `rgba(110,170,255,${.35 + r() * .5})` : `rgba(255,210,140,${.4 + r() * .4})`; x.fillRect(xx, yy, 4, 5); }
        if (r() < .25) { x.fillStyle = '#FF3A3A'; x.fillRect(X + w / 2 - 3, Y - 6, 6, 6); } }
      // llanura de luces: millones de puntitos cálidos (más pequeños hacia el horizonte)
      for (let i = 0; i < 160000; i++) { const v = Math.pow(r(), 1.6), Y = hz + v * (H - hz), X = r() * W, s = .6 + v * 3.2; const c = r(); x.fillStyle = c < .7 ? `rgba(255,${180 + r() * 50 | 0},${100 + r() * 60 | 0},${.35 + r() * .55})` : c < .9 ? `rgba(255,240,210,${.4 + r() * .5})` : `rgba(140,190,255,${.3 + r() * .5})`; x.fillRect(X, Y, s, s); }
      // avenidas que brillan en diagonal hacia el punto de fuga
      x.globalCompositeOperation = 'lighter'; const vp = [W * .55, hz];
      for (let k = 0; k < 14; k++) { const bx = (k / 13) * W * 1.6 - W * .3; x.strokeStyle = k % 3 ? 'rgba(255,170,60,.55)' : 'rgba(255,215,120,.7)'; x.lineWidth = 3 + r() * 6; x.shadowColor = '#FFB040'; x.shadowBlur = 24; x.beginPath(); x.moveTo(bx, H); x.lineTo(vp[0] + (bx - vp[0]) * .02, vp[1] + 4); x.stroke(); }
      for (let k = 0; k < 10; k++) { const yy = hz + Math.pow((k + 1) / 10, 1.8) * (H - hz); x.strokeStyle = 'rgba(255,160,60,.35)'; x.lineWidth = 1 + k * .6; x.beginPath(); x.moveTo(0, yy + r() * 30); x.lineTo(W, yy - r() * 30); x.stroke(); }
      x.shadowBlur = 0; x.globalCompositeOperation = 'source-over';
      const nb = x.createLinearGradient(0, hz - 40, 0, hz + 80); nb.addColorStop(0, 'rgba(80,60,120,0)'); nb.addColorStop(.5, 'rgba(120,80,140,.25)'); nb.addColorStop(1, 'rgba(80,60,120,0)'); x.fillStyle = nb; x.fillRect(0, hz - 40, W, 120);
    }); }

  // ---------- altavoz: cilindro negro mate con anillo de luz arriba ----------
  function altavoz(esc = 1) {
    const g = new THREE.Group(), negro = sm('#0C0D10', { roughness: .85 }), h = .52 * esc, r = .085 * esc;
    const cuerpo = M(new THREE.CylinderGeometry(r, r, h, 64), negro, 0, h / 2, 0); g.add(cuerpo);
    const tela = cv(256, 512, (x, w, hh) => { x.fillStyle = '#0E0F12'; x.fillRect(0, 0, w, hh); x.fillStyle = 'rgba(255,255,255,.05)'; for (let j = 0; j < hh; j += 6) for (let i = (j / 6 % 2) * 3; i < w; i += 6) x.fillRect(i, j, 2, 2); });
    tela.wrapS = THREE.RepeatWrapping; tela.repeat.set(3, 1); cuerpo.material = sm('#FFFFFF', { map: tela, roughness: .9 });
    const tapa = M(new THREE.CylinderGeometry(r * .98, r * .98, .012 * esc, 64), sm('#141518', { roughness: .4, metalness: .3 }), 0, h + .006 * esc, 0); g.add(tapa);
    const anM = new THREE.MeshBasicMaterial({ color: HDR(.5, 2.6, 3.0), toneMapped: false });
    const anillo = M(new THREE.TorusGeometry(r * .86, .007 * esc, 12, 96), anM, 0, h + .013 * esc, 0); anillo.rotation.x = Math.PI / 2; anillo.castShadow = false; g.add(anillo);
    const halo = glow(CIAN, .55 * esc, .55); halo.position.set(0, h + .02 * esc, 0); halo.scale.set(.32 * esc, .12 * esc, 1); g.add(halo);
    const luz = new THREE.PointLight(CIAN, 1.4, 2.5 * esc, 1.5); luz.position.set(0, h + .1 * esc, .05); g.add(luz);
    for (let i = 0; i < 4; i++) { const b = M(new THREE.CylinderGeometry(.006 * esc, .006 * esc, .004, 12), sm('#2A2C30'), (i - 1.5) * .018 * esc, h + .013 * esc, .04 * esc); g.add(b); }
    const C = new THREE.Color(), cC = new THREE.Color(CIAN), cB = new THREE.Color('#FFFFFF');
    g.setColor = (k, I = 1) => { C.copy(cC).lerp(cB, k); anM.color.setRGB(C.r * 2.6 * I, C.g * 2.6 * I, C.b * 2.6 * I); halo.material.color.copy(C); halo.material.opacity = .55 * I; luz.color.copy(C); luz.intensity = 1.4 * I; };
    g.userData = { h, r, anillo, halo, luz }; return g;
  }

  // ---------- cámara domo del techo con lucecita roja ----------
  function domo() { const g = new THREE.Group(); g.add(M(new THREE.CylinderGeometry(.09, .09, .02, 40), sm('#3A3C44', { roughness: .5 }), 0, 0, 0));
    const cup = M(new THREE.SphereGeometry(.075, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), sm('#20232A', { roughness: .15, metalness: .4 }), 0, -.01, 0); g.add(cup);
    g.add(M(new THREE.SphereGeometry(.028, 20, 14), sm('#1A1C22', { roughness: .2, metalness: .5 }), 0, -.045, .02));
    const led = new THREE.Mesh(new THREE.SphereGeometry(.006, 10, 8), new THREE.MeshBasicMaterial({ color: HDR(3, .3, .3), toneMapped: false })); led.position.set(.02, -.06, .05); g.add(led);
    const lg = glow('#FF3030', .16, .9); lg.position.copy(led.position); g.add(lg);
    g.setLed = (k) => { led.material.color.setRGB(3 * k + .05, .3 * k + .02, .3 * k + .02); lg.material.opacity = .9 * k; }; return g; }

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
