/* Motor de las historias (1080x1920): tomas 3D en Three.js + subtítulos estilo TikTok + marca.
   Cada video define window.TOMAS = [fn, ...] (una por línea del guion). fn(K) devuelve
   { scene, cam: [[pos],[mira],fov], cam2?: [[pos],[mira],fov], anima?(t, tg), post?: {focus, ap, bloom, verde, oscuro}, sacudida? }.
   K = utilidades (window.PUEBLO_E + PUEBLO_P + kit propio). Tiempos en window.T (tiempos.js). */
(function () {
  const W = 1080, H = 1920, THREE = window.THREE, T = window.T;
  const gl = document.createElement('canvas'); gl.width = W; gl.height = H;
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: false, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(W, H, false);
  R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.LinearToneMapping; R.toneMappingExposure = .9; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  const PP = window.POST(R, W, H);
  const out = document.getElementById('c'); out.width = W; out.height = H; const x = out.getContext('2d');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = (k) => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const FUENTE = 'Fredoka', MARCA = 'El Pancho Huss';
  // ---------- tomas ----------
  const L = T.lineas, FIN = T.fin, MARCA_INI = Math.min(FIN - 1.6, T.voz_fin + .55);
  const tomas = L.map((l, i) => ({ ini: l.corte, fin: i + 1 < L.length ? L[i + 1].corte : MARCA_INI }));
  let actual = null;
  function liberar(e) { if (!e) return; e.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  function armar(i) { if (actual && actual.i === i) return actual; if (actual) liberar(actual.e); const e = window.TOMAS[i](window.K); const cam = new THREE.PerspectiveCamera(50, W / H, .05, 1500); actual = { i, e, cam }; return actual; }
  const v3 = (a) => new THREE.Vector3(...a);
  function ponerCam(cam, A, B, k) { const p = v3(A[0]).lerp(v3(B[0]), k), m = v3(A[1]).lerp(v3(B[1]), k); cam.position.copy(p); cam.fov = A[2] + (B[2] - A[2]) * k; cam.updateProjectionMatrix(); cam.lookAt(m); return p.distanceTo(m); }
  // ---------- subtítulos: grupos de 2–3 palabras, palabra activa en amarillo ----------
  const PAL = []; L.forEach((l, li) => l.palabras.forEach(p => PAL.push({ a: p[0], b: p[1], w: p[2], hl: p[3], li })));
  const GRUPOS = []; let g = [];
  PAL.forEach((p, k) => { g.push(p); const sig = PAL[k + 1]; const corta = /[.,;:!?…"]$/.test(p.w) || g.length >= 3 || !sig || sig.li !== p.li || (g.length >= 2 && sig.w.length > 9);
    if (corta) { GRUPOS.push(g); g = []; } });
  GRUPOS.forEach((G, k) => { G.ini = G[0].a; const sig = GRUPOS[k + 1]; G.fin = sig && sig[0].a - G[G.length - 1].b < .5 ? sig[0].a : G[G.length - 1].b + .3; });
  function subtitulos(t) {
    const G = GRUPOS.find(G => t >= G.ini && t < G.fin); if (!G) return;
    const pop = clamp((t - G.ini) / .12), s = .82 + .18 * (1 - Math.pow(1 - pop, 3)) + .04 * Math.sin(pop * Math.PI);
    let size = 104; x.font = `700 ${size}px ${FUENTE}`; const txt = G.map(p => p.w); let anchos = txt.map(w => x.measureText(w).width), esp = size * .36, tot = anchos.reduce((a, b) => a + b, 0) + esp * (txt.length - 1);
    if (tot > 940) { size = Math.floor(size * 940 / tot); x.font = `700 ${size}px ${FUENTE}`; anchos = txt.map(w => x.measureText(w).width); esp = size * .36; tot = anchos.reduce((a, b) => a + b, 0) + esp * (txt.length - 1); }
    const Y = 1190; x.save(); x.translate(W / 2, Y); x.scale(s, s); x.textBaseline = 'middle'; x.lineJoin = 'round';
    let px = -tot / 2; let act = -1; G.forEach((p, k) => { if (t >= p.a - .02) act = k; });
    G.forEach((p, k) => { const w = anchos[k]; x.save(); x.translate(px + w / 2, 0); if (k === act) x.scale(1.08, 1.08);
      x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 18; x.shadowOffsetY = 6; x.lineWidth = size * .2; x.strokeStyle = '#000'; x.strokeText(p.w, -w / 2, 0); x.shadowColor = 'transparent';
      x.fillStyle = k === act ? '#FFE135' : '#FFFFFF'; x.fillText(p.w, -w / 2, 0); x.restore(); px += w + esp; });
    x.restore(); }
  // ---------- marca ----------
  const img = new Image(); img.src = window.MARCA_IMG;
  function marcaChica() { x.save(); x.globalAlpha = .82; x.font = `700 34px ${FUENTE}`; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 8; x.strokeStyle = 'rgba(0,0,0,.6)';
    const tx = '@' + MARCA.replace(/ /g, ''); x.strokeText(tx, 44, 200); x.fillStyle = '#FFFFFF'; x.fillText(tx, 44, 200); x.restore(); }
  function cierre(t) { const k = clamp((t - MARCA_INI) / .45); x.fillStyle = `rgba(8,10,22,${.94 * k})`; x.fillRect(0, 0, W, H); if (k <= 0) return;
    const e = 1 - Math.pow(1 - k, 3), r = 250 * (.7 + .3 * e); x.save(); x.globalAlpha = k; x.translate(W / 2, 820);
    x.beginPath(); x.arc(0, 0, r + 14, 0, 7); x.fillStyle = '#FFE135'; x.fill(); x.save(); x.beginPath(); x.arc(0, 0, r, 0, 7); x.clip(); if (img.complete) x.drawImage(img, -r * 1.08, -r * 1.08, r * 2.16, r * 2.16); x.restore();
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.font = `700 96px ${FUENTE}`; x.lineWidth = 18; x.strokeStyle = '#000'; x.strokeText(MARCA, 0, 380); x.fillStyle = '#FFE135'; x.fillText(MARCA, 0, 380);
    x.font = `700 58px ${FUENTE}`; x.lineWidth = 12; x.strokeText('Síguenos para más historias', 0, 490); x.fillStyle = '#FFFFFF'; x.fillText('Síguenos para más historias', 0, 490); x.restore(); }
  // ---------- cuadro ----------
  function dibujar(tg) {
    let i = tomas.findIndex(q => tg >= q.ini && tg < q.fin); if (i < 0) i = tg < MARCA_INI ? 0 : tomas.length - 1;
    const q = tomas[i], A = armar(i), e = A.e, tl = tg - q.ini, k = ease(tl / (q.fin - q.ini));
    if (e.anima) e.anima(tl, tg, k);
    const C1 = typeof e.cam === 'function' ? e.cam(tl, k) : e.cam, C2 = e.cam2 ? (typeof e.cam2 === 'function' ? e.cam2(tl, k) : e.cam2) : null;
    const dist = C2 ? ponerCam(A.cam, C1, C2, k) : ponerCam(A.cam, C1, C1, 0);
    if (e.sacudida) { const s = typeof e.sacudida === 'function' ? e.sacudida(tl) : e.sacudida; A.cam.position.x += Math.sin(tg * 37) * s * .03; A.cam.position.y += Math.cos(tg * 29) * s * .025; }
    const po = Object.assign({ focus: dist, ap: .1, bloom: .7, grano: tg }, e.post || {});
    PP.render(e.scene, A.cam, po);
    x.drawImage(gl, 0, 0);
    // viñeta y cortes con flash negro muy corto
    const v = x.createRadialGradient(W / 2, H * .48, H * .3, W / 2, H * .48, H * .78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
    if (i > 0 && tl < .16) { x.fillStyle = `rgba(0,0,0,${.85 * (1 - tl / .16)})`; x.fillRect(0, 0, W, H); }
    if (tg < .35) { x.fillStyle = `rgba(0,0,0,${1 - tg / .35})`; x.fillRect(0, 0, W, H); }
    if (e.encima) e.encima(x, tl, tg, k);
    if (tg < MARCA_INI) { marcaChica(); subtitulos(tg); } else cierre(tg);
  }
  window.DURATION = FIN;
  window.frameJPEG = (t, q) => { dibujar(t); return out.toDataURL('image/jpeg', q || .92); };
  (async () => { await document.fonts.load(`700 100px ${FUENTE}`); await new Promise(r => { if (img.complete) r(); else { img.onload = r; img.onerror = r; } }); window.__listo = true;
    if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { dibujar(((performance.now() - t0) / 1000) % FIN); requestAnimationFrame(loop); })(); } })();
})();
