/* Motor de "Quédate a oscuras" (1080x1920, 30 fps). Una escena por entrada de window.ESCENAS (scenes/escenas.js).
   Cada escena(Q) devuelve { scene, cam: [[pos],[mira],fov] | fn(tl,k), cam2?, anima?(tl, tg, k, cam), post?, encima?(x, tl, tg, k), entrada? }.
   Tiempos en window.T (tiempos.js, generado por voz.py con Whisper). */
(function () {
  const W = 1080, H = 1920, THREE = window.THREE, T = window.T, FPS = 30;
  const BAJA = location.search.includes('baja'), GW = BAJA ? W / 2 : W, GH = BAJA ? H / 2 : H;
  const gl = document.createElement('canvas'); gl.width = GW; gl.height = GH;
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: false, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(GW, GH, false);
  R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = .9; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  const PP = window.POST(R, GW, GH);
  const out = document.getElementById('c'); out.width = W; out.height = H; const x = out.getContext('2d');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sine = (k) => -(Math.cos(Math.PI * clamp(k)) - 1) / 2;
  const E = T.escenas, FIN = T.fin;
  const tomas = E.map((e, i) => ({ ini: e.corte, fin: i + 1 < E.length ? E[i + 1].corte : FIN }));
  window.TOMAS_T = tomas;
  let actual = null;
  function armar(i) { if (actual && actual.i === i) return actual; if (actual) actual.e.scene.traverse(o => { if (o.geometry && !o.geometry.userData.keep) o.geometry.dispose(); });
    const e = window.ESCENAS[i](window.Q, tomas[i]); const cam = new THREE.PerspectiveCamera(45, W / H, .02, 400); actual = { i, e, cam }; return actual; }
  const v3 = (a) => new THREE.Vector3(...a);
  function ponerCam(cam, A, B, k, tg) { const p = v3(A[0]).lerp(v3(B[0]), k), m = v3(A[1]).lerp(v3(B[1]), k); cam.position.copy(p); cam.fov = A[2] + (B[2] - A[2]) * k; cam.updateProjectionMatrix(); cam.lookAt(m);
    // respiración de cámara: ±0.5° a 0.2 Hz
    cam.rotateY(Math.sin(tg * 2 * Math.PI * .2) * .5 * Math.PI / 180); cam.rotateX(Math.sin(tg * 2 * Math.PI * .17 + 1) * .35 * Math.PI / 180); return p.distanceTo(m); }

  // ---------- subtítulos karaoke con recuadro de selección ----------
  const PAL = T.palabras.map(([a, b, w, hl, esc]) => ({ a, b, w, hl, esc }));
  const GR = []; let g = [];
  const largo = (G) => G.map(p => p.w).join(' ').length;
  PAL.forEach((p, k) => { g.push(p); const sig = PAL[k + 1];
    const corta = !sig || sig.esc !== p.esc || /[.?!…»:]$/.test(p.w) || (/,$/.test(p.w) && g.length >= 2) || g.length >= 5 || largo(g.concat(sig)) > 40;
    if (corta) { GR.push(g); g = []; } });
  GR.forEach((G, k) => { G.ini = G[0].a - .02; const sig = GR[k + 1]; const fin = G[G.length - 1].b; G.fin = sig && sig[0].a - fin < .7 ? sig[0].a - .02 : fin + .4; });
  const FS = 64, MAXL = 22;
  function lineas(G) { const L = [[]]; let n = 0; G.forEach(p => { const add = (L[L.length - 1].length ? 1 : 0) + p.w.length; if (n + add > MAXL && L[L.length - 1].length) { L.push([]); n = 0; } L[L.length - 1].push(p); n += (L[L.length - 1].length > 1 ? 1 : 0) + p.w.length; }); return L; }
  function subtitulos(t) {
    const G = GR.find(G => t >= G.ini && t < G.fin); if (!G) return; const L = lineas(G);
    x.save(); x.textBaseline = 'alphabetic';
    L.forEach((ln, li) => {
      const fuente = (pw) => `${pw} ${FS}px Inter`; x.font = fuente(800); const esp = FS * .28; const an = ln.map(p => x.measureText(p.w).width); const tot = an.reduce((a, b) => a + b, 0) + esp * (ln.length - 1);
      let px = (W - 140) / 2 + 70 - tot / 2; const y = 205 + li * FS * 1.22;
      // el texto queda centrado pero sin entrar a los 140 px de la derecha
      px = Math.min(px, W - 140 - tot); px = Math.max(px, 60);
      ln.forEach((p, k) => { const w = an[k], dicho = t >= p.a - 1 / FPS, act = dicho && (t < p.b + .08 || p === G[G.length - 1] || !G[G.indexOf(p) + 1] || t < G[G.indexOf(p) + 1].a - 1 / FPS);
        if (!dicho) { px += w + esp; return; }
        if (p.hl) { const k2 = clamp((t - p.a) / (4 / FPS)), s = .9 + .1 * k2; x.save(); x.translate(px + w / 2, y - FS * .36); x.scale(s, s);
          const bx = -w / 2 - 10, by = -FS * .5 - 6, bw = w + 20, bh = FS + 12; x.fillStyle = 'rgba(74,125,255,.12)'; x.fillRect(bx, by, bw, bh); x.lineWidth = 3; x.strokeStyle = '#4A7DFF'; x.strokeRect(bx, by, bw, bh);
          x.fillStyle = '#4A7DFF'; x.beginPath(); x.arc(bx, by, 4, 0, 7); x.fill(); x.beginPath(); x.arc(bx + bw, by + bh, 4, 0, 7); x.fill(); x.restore(); }
        const viva = act; x.font = fuente(viva ? 800 : 600); x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 8; x.shadowOffsetY = 2;
        x.fillStyle = viva ? '#FFFFFF' : 'rgba(201,205,214,.7)'; x.fillText(p.w, px, y); x.shadowColor = 'transparent'; px += w + esp; });
    });
    x.restore();
  }
  // ---------- cuadro ----------
  function dibujar(tg) {
    let i = tomas.findIndex(q => tg >= q.ini && tg < q.fin); if (i < 0) i = tomas.length - 1;
    const q = tomas[i], A = armar(i), e = A.e, tl = tg - q.ini, dur = q.fin - q.ini, k = sine(tl / dur);
    if (e.anima) e.anima(tl, tg, k, A.cam);
    const C1 = typeof e.cam === 'function' ? e.cam(tl, k) : e.cam, C2 = e.cam2 ? (typeof e.cam2 === 'function' ? e.cam2(tl, k) : e.cam2) : C1;
    const dist = ponerCam(A.cam, C1, C2, k, tg);
    if (e.sacudida) { const s = e.sacudida(tl); A.cam.position.x += Math.sin(tg * 91) * s * .01; A.cam.position.y += Math.cos(tg * 73) * s * .008; }
    const po = Object.assign({ focus: dist, ap: .06, bloom: .9, umbral: .75, grano: tg }, typeof e.post === 'function' ? e.post(tl, k) : (e.post || {}));
    PP.render(e.scene, A.cam, po);
    x.drawImage(gl, 0, 0, W, H);
    if (e.ca) aberracion(typeof e.ca === 'function' ? e.ca(tl) : e.ca);
    const v = x.createRadialGradient(W / 2, H * .5, H * .26, W / 2, H * .5, H * .74); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.65)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
    grano(tg);
    if (e.encima) e.encima(x, tl, tg, k);
    if (e.entrada === 'fundido' && tl < 7 / FPS) { x.fillStyle = `rgba(0,0,0,${1 - tl / (7 / FPS)})`; x.fillRect(0, 0, W, H); }
    if (e.salida === 'fundido' && dur - tl < 7 / FPS) { x.fillStyle = `rgba(0,0,0,${1 - (dur - tl) / (7 / FPS)})`; x.fillRect(0, 0, W, H); }
    if (e.flash) e.flash(x, tl);
    subtitulos(tg);
  }
  // grano animado (sutil, 0.04)
  const gc = document.createElement('canvas'); gc.width = 270; gc.height = 480; const gx = gc.getContext('2d'); const gimg = gx.createImageData(270, 480);
  function grano(t) { let s = Math.floor(t * FPS) * 9301 + 49297; for (let i = 0; i < gimg.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = (s & 255); gimg.data[i] = gimg.data[i + 1] = gimg.data[i + 2] = v; gimg.data[i + 3] = 255; }
    gx.putImageData(gimg, 0, 0); x.save(); x.globalAlpha = .04; x.globalCompositeOperation = 'overlay'; x.imageSmoothingEnabled = false; x.drawImage(gc, 0, 0, W, H); x.restore(); }
  function aberracion(a) { if (!a) return; const d = Math.round(a * W); x.save(); x.globalCompositeOperation = 'screen'; x.globalAlpha = .35; x.filter = 'none';
    x.drawImage(out, d, 0); x.drawImage(out, -d, 0); x.restore(); }
  window.DURATION = FIN;
  window.frameJPEG = (t, q) => { dibujar(t); return out.toDataURL('image/jpeg', q || .93); };
  (async () => { await Promise.all([600, 800, 900].map(w => document.fonts.load(`${w} 64px Inter`))); await document.fonts.load('700 40px "JetBrains Mono"'); window.__listo = true;
    if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { dibujar(((performance.now() - t0) / 1000) % FIN); requestAnimationFrame(loop); })(); } })();
})();
