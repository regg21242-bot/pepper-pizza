/* Kit de escenas para las historias: reutiliza PUEBLO_E / PUEBLO_P y agrega piezas genéricas. window.K */
window.K = (function () {
  const THREE = window.THREE, E = window.PUEBLO_E, P = window.PUEBLO_P; E.texturas();
  const { caja, mat, luz, TEX } = E, { rbox, M, sm, tex } = P;
  const G = () => new THREE.Group();
  const cil = (rt, rb, h, m, x = 0, y = 0, z = 0, seg = 16) => M(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z);
  const esf = (r, m, x = 0, y = 0, z = 0, seg = 16) => M(new THREE.SphereGeometry(r, seg, Math.max(8, seg * .7 | 0)), m, x, y, z);
  const plano = (w, d, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); o.rotation.x = -Math.PI / 2; o.position.set(x, y, z); o.receiveShadow = true; return o; };
  let sem = 7; const rnd = () => { sem = (sem * 16807) % 2147483647; return (sem - 1) / 2147483646; }; const sembrar = (s) => { sem = s; };

  // ---------- escena y luces ----------
  function escena(fondo, niebla) { const s = new THREE.Scene(); s.background = new THREE.Color(fondo || '#05060C'); if (niebla) s.fog = new THREE.Fog(niebla[0], niebla[1], niebla[2]); return s; }
  function sol(s, o = {}) { const L = new THREE.DirectionalLight(o.col || '#FFF2DC', o.i != null ? o.i : 1.4); L.position.set(...(o.dir || [-20, 30, 15])); L.castShadow = true; L.shadow.mapSize.set(2048, 2048); L.shadow.bias = -.0005; L.shadow.normalBias = .03;
    const c = L.shadow.camera, r = o.r || 14; c.left = c.bottom = -r; c.right = c.top = r; c.near = 1; c.far = 200; L.target.position.set(...(o.centro || [0, 0, 0])); s.add(L, L.target); return L; }
  function hemi(s, cielo, suelo, i) { const h = new THREE.HemisphereLight(cielo, suelo, i); s.add(h); return h; }
  function foco(s, col, i, pos, dist = 8) { const l = new THREE.PointLight(col, i, dist, 1.6); l.position.set(...pos); s.add(l); return l; }
  function noche(s, o = {}) { E.relleno(o.relleno != null ? o.relleno : .3); s.add(E.cielo(o.arriba || '#141A38', o.horizonte || '#2A3664', 1.2)); const est = E.estrellas(); s.add(est); if (o.luna !== false) s.add(E.luna(o.luna || [-.4, .45, -.8]));
    hemi(s, '#5A6CB0', '#1C1C2C', o.hemi != null ? o.hemi : .55); sol(s, { col: '#AFC3FF', i: o.i != null ? o.i : 1.0, dir: o.dir || [-30, 40, 20], r: o.r || 20, centro: o.centro }); s.fog = new THREE.Fog(o.niebla || '#1E2648', o.n0 || 30, o.n1 || 200); return est; }
  function dia(s, o = {}) { E.relleno(o.relleno != null ? o.relleno : .1); s.add(E.cielo(o.arriba || '#5E9BE0', o.horizonte || '#CFE4F5', 1)); hemi(s, '#CFE2FF', '#6A5A48', o.hemi != null ? o.hemi : .75); sol(s, { i: o.i != null ? o.i : 1.6, dir: o.dir || [-20, 30, 18], r: o.r || 20, centro: o.centro });
    s.fog = new THREE.Fog(o.niebla || '#CFE0F0', o.n0 || 40, o.n1 || 260); }
  function piso(s, col, map, w = 200) { const m = mat(col || '#FFFFFF', map ? { map, roughness: .95 } : { roughness: .95 }); s.add(plano(w, w, m)); return m; }
  const rep = (t, a, b) => { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(a, b); c.needsUpdate = true; return c; };

  // ---------- personas ----------
  const PIELES = ['#F2C9A0', '#E0AC82', '#C98E62', '#A86E48', '#8A5A3C', '#F4D2B4'];
  const ROPA = ['#C84B4B', '#4B8AC8', '#5DB36A', '#E0A23A', '#8E5CC8', '#4A4E5A', '#D86A9A', '#3E9A9A', '#9A6A42', '#E8E8EA'];
  const PELOS = ['corto', 'picos', 'ondas', 'rizos', 'chongo', null];
  const COLPELO = ['#2A1E16', '#5A3A22', '#8B5A2B', '#1A1A1E', '#D6D6D9', '#C89A4A'];
  function persona(o = {}) { const i = o.i != null ? o.i : (rnd() * 1000) | 0;
    const a = P.avatar(Object.assign({ piel: PIELES[i % PIELES.length], torso: ROPA[(i * 3) % ROPA.length], pierna: ['#3A4256', '#5A4A3A', '#2A2E3A', '#6A7A8A'][i % 4], pelo: PELOS[(i * 5 + 1) % PELOS.length], colPelo: COLPELO[(i * 7) % COLPELO.length], expr: o.expr || 'lado' }, o.avatar || {}));
    if (o.expr) a.cara(o.expr); a.pose(0, o.pose || 'quieto'); E.prepara(a); return a; }
  function prota(expr = 'lado', pose = 'quieto') { const a = P.crear('prota'); a.cara(expr); a.pose(.3, pose); E.prepara(a); return a; }

  // ---------- cuarto (caja abierta hacia +z) ----------
  function cuarto(s, o = {}) { const g = G(), w = o.w || 6, d = o.d || 6, h = o.h || 3; const pm = mat(o.pared || '#3A3F6A', { roughness: .9 });
    g.add(plano(w, d, o.piso || mat('#FFFFFF', { map: rep(TEX.pisoMadera, 1, 1), roughness: .8 })));
    g.add(caja(w, h, .2, pm, 0, h / 2, -d / 2, .02)); for (const sx of [-1, 1]) g.add(caja(.2, h, d, pm, sx * w / 2, h / 2, 0, .02)); g.add(caja(w, .2, d, mat(o.techo || o.pared || '#3A3F6A'), 0, h + .1, 0, .02));
    g.add(caja(w, .12, .05, mat('#F4F2EE'), 0, .06, -d / 2 + .12, .01)); s.add(g); return g; }
  function cama(col = '#4A6AC8') { const g = G(); g.add(caja(1.3, .35, 2.1, mat('#FFFFFF', { map: TEX.madera }), 0, .18, 0, .04)); g.add(caja(1.26, .2, 2.0, mat('#F6F6F6'), 0, .45, 0, .06));
    const cobija = caja(1.32, .16, 1.35, mat(col, { roughness: .95 }), 0, .6, .33, .06); g.add(cobija); g.add(caja(.8, .18, .4, mat('#FFFFFF'), 0, .62, -.74, .08)); g.add(caja(1.3, .9, .1, mat('#FFFFFF', { map: TEX.madera }), 0, .5, -1.05, .03)); g.userData.cobija = cobija; return g; }
  function ventana(o = {}) { const g = G(), w = o.w || 1.4, h = o.h || 1.4; const marco = mat(o.marco || '#F4F2EE'); g.add(caja(w + .1, h + .1, .12, marco, 0, 0, 0, .02));
    const vid = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: o.vidrio || '#1A2550', emissive: o.vidrio || '#1A2550', emissiveIntensity: o.brillo != null ? o.brillo : .7, roughness: .15 })); vid.position.z = .065; g.add(vid);
    g.add(caja(.05, h, .16, marco, 0, 0, .02, .01)); g.add(caja(w, .05, .16, marco, 0, 0, .02, .01)); g.userData.vidrio = vid; return g; }
  function reloj(texto = '3:00', col = '#FF3B30') { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    const g = G(); g.add(caja(.42, .2, .16, mat('#141418', { roughness: .4 }), 0, .1, 0, .03)); const pan = new THREE.Mesh(new THREE.PlaneGeometry(.36, .15), new THREE.MeshBasicMaterial({ map: t })); pan.position.set(0, .1, .081); g.add(pan);
    const L = new THREE.PointLight(col, .6, 2, 2); L.position.set(0, .12, .3); g.add(L);
    g.poner = (tx) => { const x = c.getContext('2d'); x.fillStyle = '#100808'; x.fillRect(0, 0, 256, 128); x.fillStyle = col; x.shadowColor = col; x.shadowBlur = 18; x.font = '700 96px "DejaVu Sans Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(tx, 128, 68); t.needsUpdate = true; }; g.poner(texto); return g; }

  // ---------- fachada con ventanas (personas asomadas) ----------
  /* o = { w, pisos, col, cols (ventanas por piso), techo, gente: 0..1, semilla } → group con userData.asomados [{a, cab}] */
  function fachada(o = {}) { sembrar(o.semilla || 3); const g = G(), w = o.w || 6, ph = 2.8, np = o.pisos || 2, H = ph * np, d = o.d || 5, nc = o.cols || 2;
    const mp = mat(o.col || '#8A7A9A', { roughness: .9, map: o.map || null }), FZ = 1.1;   // muro de fachada con huecos; cuarto de FZ m detrás de cada ventana
    g.add(caja(w, H, d - FZ, mp, 0, H / 2, -FZ - (d - FZ) / 2, .03)); for (const sx of [-1, 1]) g.add(caja(.12, H, FZ, mp, sx * (w / 2 - .06), H / 2, -FZ / 2, .01));
    { const colsX = [...Array(nc)].map((_, c) => (c - (nc - 1) / 2) * (w / nc)), VW = 1.3, VH = 1.4, ZF = -.06;
      for (let p = 0; p < np; p++) { const y0 = ph * p, vy = y0 + 1.55; g.add(caja(w, vy - VH / 2 - y0, .12, mp, 0, y0 + (vy - VH / 2 - y0) / 2, ZF, .01)); const top = y0 + ph; g.add(caja(w, top - (vy + VH / 2), .12, mp, 0, (vy + VH / 2 + top) / 2, ZF, .01));
        let xa = -w / 2; for (const cx of colsX) { const xb = cx - VW / 2; g.add(caja(xb - xa, VH, .12, mp, (xa + xb) / 2, vy, ZF, .01)); xa = cx + VW / 2; } g.add(caja(w / 2 - xa, VH, .12, mp, (xa + w / 2) / 2, vy, ZF, .01));
        g.add(caja(w, .1, FZ, mat('#2A2420'), 0, y0 + .05, -FZ / 2, .01)); } }
    const tc = o.techo || '#3A2E3A'; const tr = M(new THREE.ConeGeometry(Math.hypot(w, d) * .55, 1.6, 4), mat(tc, { roughness: .8 }), 0, H + .8, -d / 2); tr.rotation.y = Math.PI / 4; tr.scale.set(1, 1, d / w); g.add(tr);
    g.userData.asomados = []; g.userData.ventanas = [];
    for (let p = 0; p < np; p++) for (let c = 0; c < nc; c++) { const vx = (c - (nc - 1) / 2) * (w / nc), vy = ph * p + 1.55; const enc = o.encendidas == null || rnd() < o.encendidas; const col = enc ? (o.luzCol || '#FFD98A') : '#141A30';
      // cuarto detrás de la ventana: fondo iluminado
      const fondo = new THREE.Mesh(new THREE.PlaneGeometry(w / nc - .1, 2.6), new THREE.MeshBasicMaterial({ color: enc ? new THREE.Color(col).multiplyScalar(.55) : '#0A0C16' })); fondo.position.set(vx, ph * p + 1.35, -1.08); g.add(fondo);
      const marco = mat('#F2EEE6'); g.add(caja(1.45, .1, .14, marco, vx, vy + .72, .04, .01)); g.add(caja(1.45, .1, .2, marco, vx, vy - .72, .06, .01)); for (const s of [-1, 1]) g.add(caja(.1, 1.5, .14, marco, vx + s * .68, vy, .04, .01));
      g.userData.ventanas.push([vx, vy]);
      if (enc && o.gente && rnd() < o.gente) { const a = persona({ i: (rnd() * 1000) | 0, expr: o.expr || 'vacio' }); a.position.set(vx, ph * p + .1, -.55); g.add(a); g.userData.asomados.push({ a, cab: a.userData.cabeza }); }
    }
    return g; }
  function calle(s, o = {}) { const asf = mat('#FFFFFF', { map: rep(TEX.asfalto, 2, 30), roughness: .95 }); s.add(plano(o.ancho || 8, 300, asf, 0, .002, -100));
    const ban = mat('#FFFFFF', { map: rep(TEX.concreto, 1, 40), roughness: .95 }); for (const sx of [-1, 1]) s.add(caja(2.4, .16, 300, ban, sx * ((o.ancho || 8) / 2 + 1.2), .08, -100, .02)); }

  // ---------- partículas (humo, ceniza, piedras, chispas) ----------
  const TBOLA = tex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
  /* nube de sprites: o = { n, col, tam, area:[x,y,z], vel:[x,y,z], vida, opac, aditivo, semilla, origen:[x,y,z], crece } ; .anima(t) */
  function nube(o = {}) { sembrar(o.semilla || 11); const g = G(), n = o.n || 40, items = [];
    for (let i = 0; i < n; i++) { const m = new THREE.SpriteMaterial({ map: TBOLA, color: o.col || '#888888', transparent: true, depthWrite: false, opacity: 0, blending: o.aditivo ? THREE.AdditiveBlending : THREE.NormalBlending, fog: true });
      const sp = new THREE.Sprite(m); const A = o.area || [1, 1, 1]; items.push({ sp, f: rnd(), dx: (rnd() - .5) * A[0], dy: (rnd() - .5) * A[1], dz: (rnd() - .5) * A[2], v: .7 + rnd() * .6 }); g.add(sp); }
    const V = o.vel || [0, 1, 0], vida = o.vida || 4, O = o.origen || [0, 0, 0];
    g.anima = (t) => { items.forEach(it => { const u = ((t / vida) * it.v + it.f) % 1; const k = o.crece != null ? o.crece : 2;
      it.sp.position.set(O[0] + it.dx + V[0] * u * vida, O[1] + it.dy + V[1] * u * vida, O[2] + it.dz + V[2] * u * vida); const s = (o.tam || 1) * (1 + k * u); it.sp.scale.set(s, s, s);
      it.sp.material.opacity = (o.opac || .6) * Math.min(1, u * 6) * Math.min(1, (1 - u) * 3); }); }; g.anima(0); return g; }
  /* lluvia de piezas (piedras, ceniza): instanced boxes que caen en un área */
  function lluvia(o = {}) { sembrar(o.semilla || 5); const n = o.n || 400, geo = o.geo || new THREE.IcosahedronGeometry(o.r || .03, 0), m = o.mat || mat(o.col || '#B8B0A0', { roughness: 1 });
    const im = new THREE.InstancedMesh(geo, m, n); im.castShadow = false; const A = o.area || [10, 8, 10], C = o.centro || [0, 0, 0], d = [], D = new THREE.Object3D();
    for (let i = 0; i < n; i++) d.push([rnd(), rnd(), rnd(), .7 + rnd() * .6, rnd() * 6]);
    im.anima = (t) => { d.forEach((q, i) => { const y = ((q[1] - t * (o.vel || 1.5) * q[3] / A[1]) % 1 + 1) % 1; D.position.set(C[0] + (q[0] - .5) * A[0] + Math.sin(t * .7 + q[4]) * (o.viento || 0), C[1] + y * A[1], C[2] + (q[2] - .5) * A[2]); D.rotation.set(t * q[3] * 3 + q[4], t * 2 + q[4], 0); D.updateMatrix(); im.setMatrixAt(i, D.matrix); }); im.instanceMatrix.needsUpdate = true; };
    im.anima(0); return im; }

  // ---------- burbuja de pensamiento (3D, mira a la cámara) ----------
  function burbuja(texto, o = {}) { const c = document.createElement('canvas'); c.width = 640; c.height = 300; const x = c.getContext('2d');
    x.fillStyle = '#FFFFFF'; x.strokeStyle = '#141414'; x.lineWidth = 10; x.beginPath(); x.roundRect(14, 14, 612, 210, 100); x.fill(); x.stroke();
    for (const [cx, cy, r] of [[150, 248, 26], [100, 282, 14]]) { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.stroke(); }
    x.fillStyle = '#141414'; x.textAlign = 'center'; x.textBaseline = 'middle'; let fs = 64; x.font = `700 ${fs}px Fredoka`; while (x.measureText(texto).width > 560 && fs > 30) { fs -= 4; x.font = `700 ${fs}px Fredoka`; } x.fillText(texto, 320, 120);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: o.encima ? false : true })); const s = o.tam || 1.2; sp.scale.set(s, s * 300 / 640, 1); sp.renderOrder = 10; return sp; }

  // ---------- agua ----------
  function agua(w, d, col = '#1A3A5A', o = {}) { const geo = new THREE.PlaneGeometry(w, d, o.seg || 60, o.seg || 60); geo.rotateX(-Math.PI / 2); const pos = geo.attributes.position, base = pos.array.slice();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, roughness: o.rough != null ? o.rough : .25, metalness: .1, transparent: o.opac != null, opacity: o.opac != null ? o.opac : 1 })); m.receiveShadow = true;
    m.anima = (t) => { for (let i = 0; i < pos.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; pos.array[i * 3 + 1] = (o.amp || .08) * (Math.sin(x * .6 + t * 1.3) + Math.sin(z * .9 - t * 1.1) * .7 + Math.sin((x + z) * 1.7 + t * 2.1) * .25); } pos.needsUpdate = true; geo.computeVertexNormals(); };
    m.anima(0); return m; }

  const cam = (pos, mira, fov = 50) => [pos, mira, fov];
  return Object.assign({}, E, { E, P, THREE, G, M, sm, rbox, tex, cil, esf, plano, rnd, sembrar, escena, sol, hemi, foco, noche, dia, piso, rep, persona, prota, cuarto, cama, ventana, reloj, fachada, calle, nube, lluvia, burbuja, agua, cam, caja, mat, luz });
})();
