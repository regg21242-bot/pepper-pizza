/* Librería de la serie "Cómo se arreglan las cosas".
   Dos looks:  A) vista general ilustrada 2D (canvas)  ·  B) acercamiento 3D semirrealista (Three.js)
   Modelos originales y genéricos (sin marcas): cable trenzado, torre de celosía, helicóptero con plataforma,
   liniero con traje conductor, pajarito, arco eléctrico, chispas, cielo con bokeh.
   Uso: const A = window.ARR;  (necesita three.min.js antes) */
(function () {
  const THREE = window.THREE;
  if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
  function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, prog = (t, a, b) => clamp((t - a) / (b - a));
  const ease = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), easeOut = k => 1 - Math.pow(1 - clamp(k), 3);
  const std = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .6, metalness: .05 }, o));
  const glowM = (color, op = 1) => new THREE.MeshBasicMaterial({ color, transparent: op < 1, opacity: op, toneMapped: false });
  const M = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
  const box = (w, h, d, m, x, y, z) => M(new THREE.BoxGeometry(w, h, d), m, x, y, z);
  const cyl = (rt, rb, h, m, seg, x, y, z) => M(new THREE.CylinderGeometry(rt, rb, h, seg || 16), m, x, y, z);
  const ball = (r, m, x, y, z, seg = 18) => M(new THREE.SphereGeometry(r, seg, seg * .7 | 0), m, x, y, z);
  function tubeBetween(a, b, r, m, seg = 8) { const d = new THREE.Vector3().subVectors(b, a), L = d.length(); const c = M(new THREE.CylinderGeometry(r, r, L, seg), m); c.position.copy(a).addScaledVector(d, .5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return c; }
  function canvasTex(w, h, draw, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }

  // ---------- brillo radial (sprite aditivo) ----------
  const glowTexCache = {};
  function glowTex(inner = 'rgba(255,255,255,1)', mid = 'rgba(140,200,255,.6)') { const k = inner + mid; if (glowTexCache[k]) return glowTexCache[k];
    return glowTexCache[k] = canvasTex(128, 128, (x, w) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 62); g.addColorStop(0, inner); g.addColorStop(.22, mid); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }, false); }
  function glow(scale = 1, inner, mid) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(inner, mid), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.scale.setScalar(scale); s.userData.sinSombra = true; return s; }
  // destello radial (rayos en estrella)
  const starTex = canvasTex(256, 256, (x) => { x.translate(128, 128); for (let i = 0; i < 12; i++) { x.rotate(Math.PI / 6); const g = x.createLinearGradient(0, 0, 0, -126); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(150,210,255,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(-(i % 2 ? 2 : 5), 0); x.lineTo(0, -126 * (i % 2 ? .6 : 1)); x.lineTo(i % 2 ? 2 : 5, 0); x.fill(); } }, false);
  function starburst(scale = 1) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.scale.setScalar(scale); return s; }

  // ---------- entorno de atardecer para reflejos y fondo con bokeh ----------
  function sunsetEnv(renderer) {
    const tex = canvasTex(512, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2A1446'); g.addColorStop(.35, '#7A2E6E'); g.addColorStop(.5, '#F26B3A'); g.addColorStop(.56, '#FFD36B'); g.addColorStop(.6, '#5A3A2E'); g.addColorStop(1, '#1E120E'); x.fillStyle = g; x.fillRect(0, 0, w, h); const s = x.createRadialGradient(w * .5, h * .55, 0, w * .5, h * .55, 90); s.addColorStop(0, 'rgba(255,240,200,1)'); s.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = s; x.fillRect(0, 0, w, h); });
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromEquirectangular(tex).texture; pm.dispose(); return env;
  }
  function bokehSky(seed = 3, count = 40) {   // plano lejano con degradado + círculos desenfocados
    const g = new THREE.Group();
    const bg = canvasTex(512, 1024, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2A1446'); gr.addColorStop(.45, '#8A3570'); gr.addColorStop(.75, '#F27A3E'); gr.addColorStop(1, '#FFC86A'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(60, 110), new THREE.MeshBasicMaterial({ map: bg, toneMapped: false, depthWrite: false })); plane.position.z = -30; plane.userData.sinSombra = true; g.add(plane);
    const r = rng(seed), cols = [['rgba(255,220,160,.55)', 'rgba(255,170,90,.18)'], ['rgba(255,170,200,.45)', 'rgba(240,120,170,.14)'], ['rgba(200,220,255,.4)', 'rgba(160,180,255,.12)']];
    const dots = []; for (let i = 0; i < count; i++) { const c = cols[i % 3]; const tex = canvasTex(128, 128, (x) => { const gg = x.createRadialGradient(64, 64, 30, 64, 64, 62); gg.addColorStop(0, c[0]); gg.addColorStop(.85, c[1]); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); }, false);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); const sc = 1 + r() * 3.5; s.scale.setScalar(sc); s.position.set((r() - .5) * 40, (r() - .5) * 60, -20 - r() * 8); g.add(s); dots.push({ s, ph: r() * 6, y0: s.position.y }); }
    g.userData.update = (t) => dots.forEach(d => d.s.position.y = d.y0 + Math.sin(t * .3 + d.ph) * .4);
    return g;
  }

  // ---------- cable de aluminio trenzado ----------
  function cable(len = 12, r = .12, o = {}) {
    const g = new THREE.Group(), alu = std('#C9CFD6', { metalness: .9, roughness: .32, envMapIntensity: 1.2 });
    const core = cyl(r * .78, r * .78, len, std('#8E959E', { metalness: .8, roughness: .45 }), 20); core.rotation.z = Math.PI / 2; g.add(core);
    const strands = [], n = 12, pitch = .55;
    for (let i = 0; i < n; i++) {
      const pts = []; const NS = Math.round(len * 45); for (let k = 0; k <= NS; k++) { const x = -len / 2 + len * k / NS, a = i / n * Math.PI * 2 + x / pitch * Math.PI * 2; pts.push(new THREE.Vector3(x, Math.cos(a) * r * .82, Math.sin(a) * r * .82)); }
      const s = M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.round(len * 90), r * .2, 6, false), alu); g.add(s); strands.push(s);
    }
    // hilo roto: un tramo de un hilo que se levanta (se usa en el gancho)
    const brokenPts = []; for (let k = 0; k <= 30; k++) { const x = .0 + .6 * k / 30, a = x / pitch * Math.PI * 2; brokenPts.push(new THREE.Vector3(x, Math.cos(a) * r * .82 + Math.pow(k / 30, 2) * .14, Math.sin(a) * r * .82 + Math.pow(k / 30, 2) * .08)); }
    const broken = M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(brokenPts), 60, r * .2, 8, false), alu); broken.visible = false; g.add(broken);
    // puntos de luz que viajan por el cable (la energía)
    const dots = []; const dr = rng(o.seed || 5); for (let i = 0; i < (o.dots ?? 14); i++) { const d = glow(r * 2.2, 'rgba(255,255,255,1)', 'rgba(120,190,255,.7)'); g.add(d); dots.push({ d, ph: dr(), sp: .25 + dr() * .2, a: dr() * 6 }); }
    // manguito de empalme
    const sleeve = cyl(r * 1.35, r * 1.35, .7, std('#D8DDE3', { metalness: .85, roughness: .25 }), 28); sleeve.rotation.z = Math.PI / 2; sleeve.visible = false; g.add(sleeve);
    for (const s of [-1, 1]) { const ring = cyl(r * 1.5, r * 1.5, .06, std('#B8BEC6', { metalness: .9, roughness: .3 }), 28, s * .32, 0, 0); ring.rotation.z = Math.PI / 2; sleeve.add(ring); ring.position.set(0, s * .32, 0); }
    g.userData = { strands, broken, sleeve, len, r,
      flow(t, k = 1, gap = null) { dots.forEach(o => { const u = ((o.ph + t * o.sp) % 1); const x = -len / 2 + u * len; o.d.position.set(x, Math.cos(o.a + x * 9) * r * .9, Math.sin(o.a + x * 9) * r * .9); let v = k * (.55 + .45 * Math.sin(t * 7 + o.a)); if (gap && x > gap[0] && x < gap[1]) v = 0; o.d.material.opacity = v; }); } };
    return g;
  }

  // ---------- torre de celosía (silueta oscura metálica) ----------
  function torre(h = 30, o = {}) {
    const g = new THREE.Group(), m = std(o.color || '#2A2630', { metalness: .6, roughness: .5 }), r = .05;
    const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [a, b]);
    const wAt = (y) => lerp(3.2, .9, Math.pow(y / h, .8));
    for (const [a, b] of legs) g.add(tubeBetween(new THREE.Vector3(a * wAt(0), 0, b * wAt(0)), new THREE.Vector3(a * wAt(h), h, b * wAt(h)), r * 3, m, 6));
    for (let k = 0; k < 10; k++) { const y0 = h * k / 10, y1 = h * (k + 1) / 10;
      for (let i = 0; i < 4; i++) { const [a0, b0] = legs[i], [a1, b1] = legs[(i + 1) % 4];
        g.add(tubeBetween(new THREE.Vector3(a0 * wAt(y0), y0, b0 * wAt(y0)), new THREE.Vector3(a1 * wAt(y1), y1, b1 * wAt(y1)), r, m, 4));
        g.add(tubeBetween(new THREE.Vector3(a1 * wAt(y0), y0, b1 * wAt(y0)), new THREE.Vector3(a0 * wAt(y1), y1, b0 * wAt(y1)), r, m, 4));
        g.add(tubeBetween(new THREE.Vector3(a0 * wAt(y1), y1, b0 * wAt(y1)), new THREE.Vector3(a1 * wAt(y1), y1, b1 * wAt(y1)), r, m, 4)); } }
    const arms = []; for (const y of [h * .78, h * .92]) { const arm = box(10, .25, .3, m, 0, y, 0); g.add(arm);
      for (const x of [-4.6, 4.6]) { const ins = new THREE.Group(); ins.position.set(x, y, 0); g.add(ins); for (let i = 0; i < 8; i++) ins.add(cyl(.18, .18, .07, std('#7FA6C8', { roughness: .2, metalness: .1, transparent: true, opacity: .9 }), 14, 0, -.25 - i * .17, 0)); arms.push(new THREE.Vector3(x, y - 1.7, 0)); } }
    g.userData = { attach: arms }; return g;
  }

  // ---------- helicóptero genérico con plataforma lateral ----------
  function helicoptero() {
    const g = new THREE.Group(), body = std('#E8E4DA', { roughness: .35, metalness: .15 }), stripe = std('#E2572A', { roughness: .4 }), dark = std('#2A2E36', { roughness: .4, metalness: .4 }), glass = std('#20324A', { roughness: .08, metalness: .6, envMapIntensity: 1.5 });
    const cab = ball(1, body, 0, 0, 0, 28); cab.scale.set(1.7, 1.05, 1.0); g.add(cab);
    const wind = ball(1, glass, .55, .12, 0, 28); wind.scale.set(1.25, .85, .92); g.add(wind);
    g.add(box(2.4, .12, 2.02, stripe, -.2, -.25, 0));
    const boom = cyl(.28, .1, 4.2, body, 16); boom.rotation.z = Math.PI / 2; boom.position.set(-3.6, .25, 0); g.add(boom);
    const fin = box(.7, 1.1, .08, stripe, -5.6, .75, 0); fin.rotation.z = -.35; g.add(fin);
    const tailR = new THREE.Group(); tailR.position.set(-5.7, .7, .12); g.add(tailR);
    for (let i = 0; i < 2; i++) { const b = box(.08, 1.1, .02, dark); b.rotation.z = i * Math.PI / 2; tailR.add(b); }
    const mast = cyl(.12, .12, .5, dark, 10, 0, 1.15, 0); g.add(mast); g.add(box(.9, .3, .6, body, -.1, 1.0, 0));
    const rotor = new THREE.Group(); rotor.position.set(0, 1.45, 0); g.add(rotor);
    for (let i = 0; i < 4; i++) { const b = box(5.6, .04, .3, dark, 2.8, 0, 0); const p = new THREE.Group(); p.rotation.y = i * Math.PI / 2; p.add(b); rotor.add(p); }
    const blur = new THREE.Mesh(new THREE.CircleGeometry(5.6, 48), new THREE.MeshBasicMaterial({ color: '#2A2E36', transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide })); blur.rotation.x = -Math.PI / 2; rotor.add(blur);
    for (const z of [-.9, .9]) { g.add(box(3.2, .08, .1, dark, 0, -1.25, z)); for (const x of [-.8, .8]) g.add(tubeBetween(new THREE.Vector3(x, -1.2, z), new THREE.Vector3(x * .7, -.7, z * .8), .05, dark, 6)); }
    // plataforma al costado (lado +z) donde va sentado el liniero
    const plat = new THREE.Group(); plat.position.set(.1, -.9, 1.25); g.add(plat);
    plat.add(box(1.4, .08, .9, std('#9AA2AC', { metalness: .7, roughness: .4 }), 0, 0, .25));
    for (const x of [-.65, .65]) plat.add(tubeBetween(new THREE.Vector3(x, 0, .7), new THREE.Vector3(x, .7, .7), .03, dark, 6));
    plat.add(tubeBetween(new THREE.Vector3(-.65, .7, .7), new THREE.Vector3(.65, .7, .7), .03, dark, 6));
    g.userData = { rotor, tailR, plat, spin(t) { rotor.rotation.y = t * 9; tailR.rotation.z = t * 30; } };
    return g;
  }

  // ---------- liniero: persona con overol conductor (tela azul grisácea tejida con hilos de metal) ----------
  function liniero() {
    const g = new THREE.Group(), P = {};
    // tela: azul grisáceo con hilos plateados finos (diagonal), los hilos se encienden con brilla(k)
    const fab = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#2E3A52'; x.fillRect(0, 0, w, h); const q = rng(4); for (let i = 0; i < 1800; i++) { x.fillStyle = q() < .5 ? 'rgba(30,38,52,.25)' : 'rgba(120,135,160,.2)'; x.fillRect(q() * w, q() * h, 2, 1); }
      x.strokeStyle = 'rgba(190,200,215,.28)'; x.lineWidth = 1; for (let i = -256; i < 512; i += 10) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 256, h); x.stroke(); x.beginPath(); x.moveTo(i + 256, 0); x.lineTo(i, h); x.stroke(); } });
    fab.wrapS = fab.wrapT = THREE.RepeatWrapping; fab.repeat.set(2, 2);
    const emi = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8CD2FF'; x.lineWidth = 1.6; for (let i = -256; i < 512; i += 10) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 256, h); x.stroke(); x.beginPath(); x.moveTo(i + 256, 0); x.lineTo(i, h); x.stroke(); } }, false);
    emi.wrapS = emi.wrapT = THREE.RepeatWrapping; emi.repeat.set(2, 2);
    const suit = new THREE.MeshStandardMaterial({ map: fab, roughness: .78, metalness: .25, emissive: '#7CC8FF', emissiveMap: emi, emissiveIntensity: 0 });
    const skin = std('#C68D68', { roughness: .55 }), glove = std('#2E333C', { roughness: .7 }), boot = std('#2A2420', { roughness: .6 }), belt = std('#1E2128', { roughness: .5, metalness: .3 });
    const cap = (r, h) => new THREE.CapsuleGeometry(r, h, 6, 16);
    // piernas
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * .1, .92, 0); g.add(hip); hip.add(M(cap(.085, .32), suit, 0, -.21, 0));
      const knee = new THREE.Group(); knee.position.y = -.44; hip.add(knee); knee.add(M(cap(.072, .3), suit, 0, -.2, 0));
      const b = box(.13, .11, .26, boot, 0, -.42, .04); knee.add(b);
      P[s < 0 ? 'legL' : 'legR'] = hip; P[s < 0 ? 'kneeL' : 'kneeR'] = knee;
    }
    // torso con forma (más ancho en el pecho)
    const torso = new THREE.Group(); torso.position.y = .92; g.add(torso); P.torso = torso;
    const prof = [[0, 0], [.17, .02], [.18, .12], [.17, .28], [.2, .42], [.22, .52], [.2, .58], [.1, .64], [0, .65]].map(([r, y]) => new THREE.Vector2(r, y));
    const chest = M(new THREE.LatheGeometry(prof, 24), suit); chest.scale.set(1, 1, .68); torso.add(chest);
    torso.add(box(.36, .06, .25, belt, 0, .06, 0)); torso.add(box(.06, .05, .03, std('#C8CDD4', { metalness: .9, roughness: .2 }), 0, .06, .125));
    torso.add(box(.012, .4, .012, std('#C8CDD4', { metalness: .9 }), 0, .32, .145));   // cierre
    for (const s of [-1, 1]) torso.add(box(.1, .08, .02, std('#26304A'), s * .09, .44, .14));   // bolsas del pecho
    const neck = cyl(.05, .055, .06, skin, 12, 0, .66, 0); torso.add(neck);
    // brazos
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(s * .23, .56, 0); torso.add(sh); sh.add(ball(.07, suit, 0, 0, 0, 14)); sh.add(M(cap(.06, .24), suit, 0, -.16, 0));
      const el = new THREE.Group(); el.position.y = -.31; sh.add(el); el.add(M(cap(.052, .22), suit, 0, -.14, 0));
      const hand = new THREE.Group(); hand.position.y = -.3; el.add(hand); const palm = box(.07, .09, .04, glove, 0, -.03, 0); hand.add(palm);
      for (let f = 0; f < 4; f++) hand.add(M(cap(.011, .04), glove, -.025 + f * .017, -.1, 0)); const th = M(cap(.012, .035), glove, s * -.045, -.05, .015); th.rotation.z = s * .6; hand.add(th);
      P[s < 0 ? 'armL' : 'armR'] = sh; P[s < 0 ? 'elbowL' : 'elbowR'] = el; P[s < 0 ? 'handL' : 'handR'] = hand;
    }
    // cabeza con rasgos
    const head = new THREE.Group(); head.position.y = .77; torso.add(head); P.head = head;
    const skull = ball(.105, skin, 0, 0, 0, 28); skull.scale.set(.9, 1.12, 1); head.add(skull);
    const jaw = ball(.085, skin, 0, -.05, .015, 22); jaw.scale.set(.95, .9, 1); head.add(jaw);
    for (const s of [-1, 1]) { const ear = ball(.024, skin, s * .095, 0, -.005, 10); ear.scale.set(.5, 1, .8); head.add(ear); }
    const nose = M(new THREE.ConeGeometry(.018, .05, 10), skin); nose.position.set(0, -.005, .1); nose.rotation.x = Math.PI / 2 - .25; head.add(nose);
    for (const s of [-1, 1]) {
      const w = ball(.016, std('#F4F0EA', { roughness: .3 }), s * .036, .028, .085, 12); w.scale.set(1.2, .8, .6); head.add(w);
      head.add(ball(.008, std('#2A1C14', { roughness: .2 }), s * .036, .027, .095, 8));
      const br = box(.038, .008, .01, std('#2A1C14'), s * .037, .055, .093); br.rotation.z = -s * .08; head.add(br);
    }
    head.add(box(.06, .012, .015, std('#2A1C14'), 0, -.042, .095));   // bigote
    head.add(box(.035, .007, .01, std('#8A4A3A'), 0, -.062, .092));   // boca
    // gafas de seguridad y casco
    const lens = new THREE.MeshStandardMaterial({ color: '#BFD8F0', metalness: .2, roughness: .05, transparent: true, opacity: .22, depthWrite: false });
    head.add(box(.15, .034, .01, lens, 0, .028, .112)); head.add(box(.16, .005, .005, belt, 0, .046, .112));
    const helmet = ball(.125, std('#F2C230', { roughness: .35 }), 0, .085, -.01, 26); helmet.scale.set(1.0, .72, 1.08); head.add(helmet);
    const brim = cyl(.14, .14, .012, std('#E8B828', { roughness: .4 }), 26, 0, .07, .005); brim.scale.set(.95, 1, 1.1); head.add(brim);
    g.userData = Object.assign(P, { suit, brilla(k) { suit.emissiveIntensity = k; } });
    return g;
  }
  // ---------- pajarito ----------
  function pajaro() {
    const g = new THREE.Group(), P = {}, plum = std('#6A4A36', { roughness: .8 }), belly = std('#E8C9A0', { roughness: .8 }), dark = std('#1E1A18');
    const body = ball(.12, plum, 0, .14, 0, 20); body.scale.set(1.3, 1, 1); g.add(body);
    const bel = ball(.1, belly, .03, .11, 0, 18); bel.scale.set(1.1, .9, .95); g.add(bel);
    const head = new THREE.Group(); head.position.set(.13, .25, 0); g.add(head); P.head = head; head.add(ball(.075, plum, 0, 0, 0, 18));
    const beak = M(new THREE.ConeGeometry(.022, .07, 10), std('#E8A030')); beak.rotation.z = -Math.PI / 2; beak.position.set(.09, -.005, 0); head.add(beak);
    for (const s of [-1, 1]) head.add(ball(.014, dark, .045, .02, s * .05, 10));
    const tail = box(.16, .03, .09, plum, -.2, .16, 0); tail.rotation.z = .35; g.add(tail);
    for (const s of [-1, 1]) { const w = ball(.09, std('#4E3626', { roughness: .8 }), -.02, .17, s * .09, 14); w.scale.set(1.3, .6, .3); g.add(w); }
    P.feet = [-1, 1].map(s => { const f = new THREE.Group(); f.position.set(0, 0, s * .04); g.add(f); f.add(cyl(.008, .008, .06, std('#C08040'), 6, 0, .03, 0)); for (const a of [-.5, 0, .5]) { const toe = cyl(.006, .006, .045, std('#C08040'), 6, Math.cos(a) * .02, 0, Math.sin(a) * .02); toe.rotation.z = Math.PI / 2; toe.rotation.y = a; f.add(toe); } return f; });
    g.userData = P; return g;
  }

  // ---------- arco eléctrico (zig-zag determinista) + chispas ----------
  function arco(color = '#CFE8FF') {
    const g = new THREE.Group(), N = 24;
    const geo = new THREE.BufferGeometry(); const pos = new Float32Array(N * 3); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const core = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#FFFFFF', transparent: true, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(core);
    const geo2 = geo.clone(); const pos2 = new Float32Array(N * 3); geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
    const side = new THREE.Line(geo2, new THREE.LineBasicMaterial({ color, transparent: true, opacity: .8, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(side);
    const tube = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: '#BFE2FF', transparent: true, opacity: .9, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(tube);
    const halo = glow(1, 'rgba(255,255,255,1)', 'rgba(110,180,255,.55)'); g.add(halo);
    const light = new THREE.PointLight('#9CD0FF', 0, 12, 2); g.add(light);
    g.userData.set = (a, b, t, k = 1) => {   // dibuja el arco de a a b; t controla el temblor
      const r = rng(1 + Math.floor(t * 30) * 7), d = new THREE.Vector3().subVectors(b, a), L = d.length();
      const n1 = new THREE.Vector3(-d.y, d.x, 0).normalize(), n2 = new THREE.Vector3().crossVectors(d, n1).normalize();
      const pts = [];
      for (let i = 0; i < N; i++) { const u = i / (N - 1), amp = Math.sin(u * Math.PI) * L * .18; const p = a.clone().addScaledVector(d, u).addScaledVector(n1, (r() - .5) * amp).addScaledVector(n2, (r() - .5) * amp); pos.set([p.x, p.y, p.z], i * 3); pts.push(p); const q = p.clone().addScaledVector(n1, (r() - .5) * amp * .6); pos2.set([q.x, q.y, q.z], i * 3); }
      geo.attributes.position.needsUpdate = true; geo2.attributes.position.needsUpdate = true;
      tube.geometry.dispose(); tube.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .012 + .01 * k, 5, false);
      halo.position.copy(a).addScaledVector(d, .5); halo.scale.setScalar(L * 1.4 * k + .2);
      light.position.copy(halo.position); light.intensity = 6 * k;
      [core, side, tube].forEach(o => o.material.opacity = (o === side ? .8 : 1) * k); halo.material.opacity = k; g.visible = k > .01;
    };
    return g;
  }
  function chispas(n = 40, seed = 7, size = 1) {
    const g = new THREE.Group(), r = rng(seed), list = [];
    for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(.008 * size, .008 * size, .09 * size), glowM(i % 3 ? '#CFE8FF' : '#FFFFFF')); g.add(s); list.push({ s, v: new THREE.Vector3((r() - .5) * 3, r() * 2.5 + .5, (r() - .5) * 3).multiplyScalar(size), d: r() * .15 }); }
    g.userData.update = (t0, t, origin) => list.forEach(o => { const a = t - t0 - o.d; o.s.visible = a > 0 && a < .9; if (!o.s.visible) return; const p = origin.clone().addScaledVector(o.v, a).add(new THREE.Vector3(0, -4.9 * a * a * size, 0)); o.s.position.copy(p); o.s.lookAt(p.clone().add(o.v.clone().add(new THREE.Vector3(0, -9.8 * a * size, 0)))); o.s.material.opacity = 1 - a / .9; o.s.material.transparent = true; });
    return g;
  }

  /* ================== LOOK A: vista general ilustrada 2D ================== */
  // pinta el atardecer con cerros, torres en silueta, cables con puntos de luz y ciudad.  o.heli = {x,y,s} para el helicóptero en silueta
  function vista(ctx, W, H, t, o = {}) {
    const hz = H * (o.horizon ?? .58);
    const sky = ctx.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#2B1652'); sky.addColorStop(.4, '#6E2B72'); sky.addColorStop(.72, '#E8603E'); sky.addColorStop(.92, '#FFB04A'); sky.addColorStop(1, '#FFE08A');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hz + 4);
    const sx = W * .5, sun = ctx.createRadialGradient(sx, hz + 20, 0, sx, hz + 20, W * .55); sun.addColorStop(0, 'rgba(255,245,200,.95)'); sun.addColorStop(.15, 'rgba(255,210,120,.55)'); sun.addColorStop(1, 'rgba(255,150,80,0)'); ctx.fillStyle = sun; ctx.fillRect(0, 0, W, hz + 4);
    ctx.fillStyle = '#FFF0C0'; ctx.beginPath(); ctx.arc(sx, hz + 34, 70, Math.PI, 0); ctx.fill();   // el sol asomando
    const r = rng(o.seed || 9);
    // estrellitas arriba
    ctx.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * hz * .35, s = r() * 2 + .5; ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(t * 1.3 + i)); ctx.fillRect(x, y, s, s); } ctx.globalAlpha = 1;
    // ciudad pequeña a lo lejos
    const cx0 = W * (o.cityX ?? .37); for (let i = 0; i < 26; i++) { const bw = 18 + r() * 26, bh = 20 + r() * 70, x = cx0 + i * 15 - 60 + r() * 8; ctx.fillStyle = '#3A2238'; ctx.fillRect(x, hz - bh, bw, bh + 6);
      for (let wy = hz - bh + 6; wy < hz - 4; wy += 9) for (let wx = x + 3; wx < x + bw - 4; wx += 7) if (r() < .55) { ctx.fillStyle = r() < .8 ? '#FFD27A' : '#FFF4D0'; ctx.fillRect(wx, wy, 3, 4); } }
    const city = ctx.createRadialGradient(cx0 + 120, hz, 0, cx0 + 120, hz, 260); city.addColorStop(0, 'rgba(255,200,120,.35)'); city.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = city; ctx.fillRect(0, hz - 260, W, 280);
    // cerros en capas cafés
    const hill = (y0, amp, f, ph, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.3 + ph * 1.7) * amp * .4); ctx.lineTo(W, H); ctx.fill(); };
    const layers = [[hz + 10, 14, .006, 1, '#8A5440'], [hz + 60, 26, .0045, 2.5, '#6A3C2C'], [hz + 150, 40, .0035, .3, '#4A2A1E'], [hz + 330, 60, .003, 4, '#2E1912']];
    layers.forEach(l => hill(...l));
    const hy = (li, x) => { const [y0, amp, f, ph] = layers[li]; return y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.3 + ph * 1.7) * amp * .4; };
    // torres en silueta sobre los cerros y cables con puntos de luz
    const towers = (o.towers || [[.1, 3, 1.05], [.37, 3, 1.05], [.63, 3, 1.05], [.9, 3, 1.05]]).map(([fx, li, s]) => { const x = W * fx, base = hy(li, x) + 6, h = 420 * s; return { x, base, h, s, li }; });
    const drawTower = (T) => { const { x, base, h, s } = T; ctx.strokeStyle = '#140A10'; ctx.fillStyle = '#140A10'; ctx.lineWidth = Math.max(1.2, 3 * s);
      const w0 = 70 * s, w1 = 16 * s, top = base - h; ctx.beginPath(); ctx.moveTo(x - w0, base); ctx.lineTo(x - w1, top); ctx.lineTo(x + w1, top); ctx.lineTo(x + w0, base); ctx.stroke();
      for (let k = 0; k < 9; k++) { const y0 = base - h * k / 9, y1 = base - h * (k + 1) / 9, a0 = lerp(w0, w1, k / 9), a1 = lerp(w0, w1, (k + 1) / 9); ctx.beginPath(); ctx.moveTo(x - a0, y0); ctx.lineTo(x + a1, y1); ctx.moveTo(x + a0, y0); ctx.lineTo(x - a1, y1); ctx.moveTo(x - a1, y1); ctx.lineTo(x + a1, y1); ctx.stroke(); }
      for (const [yy, aw] of [[.8, 110], [.93, 80]]) { const y = base - h * yy; ctx.fillRect(x - aw * s, y - 3 * s, aw * 2 * s, 6 * s); for (const sx2 of [-1, 1]) ctx.fillRect(x + sx2 * aw * s - 2 * s, y, 4 * s, 22 * s); }
      T.pts = [[x - 110 * s, base - h * .8 + 22 * s], [x + 110 * s, base - h * .8 + 22 * s], [x - 80 * s, base - h * .93 + 22 * s], [x + 80 * s, base - h * .93 + 22 * s]]; };
    const order = [...towers].sort((a, b) => a.s - b.s);
    const rows = {}; order.forEach(T => { drawTower(T); (rows[T.li] = rows[T.li] || []).push(T); });
    const cables = [];
    Object.values(rows).forEach(list => { list.sort((a, b) => a.x - b.x); const ext = [{ x: -400, ...list[0], pts: list[0].pts.map(p => [p[0] - W * .4, p[1] + 20]) }, ...list, { ...list[list.length - 1], pts: list[list.length - 1].pts.map(p => [p[0] + W * .4, p[1] + 20]) }];
      for (let i = 0; i < ext.length - 1; i++) for (let c = 0; c < 4; c++) { const a = ext[i].pts[c], b = ext[i + 1].pts[c], sag = 40 * list[0].s; cables.push({ a, b, sag, s: list[0].s }); } });
    ctx.lineCap = 'round';
    cables.forEach(cb => { ctx.strokeStyle = '#1A0E14'; ctx.lineWidth = Math.max(1, 2.4 * cb.s); ctx.beginPath(); for (let k = 0; k <= 30; k++) { const u = k / 30, x = lerp(cb.a[0], cb.b[0], u), y = lerp(cb.a[1], cb.b[1], u) + Math.sin(u * Math.PI) * cb.sag; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); });
    // puntos de luz azul-blancos que corren hacia la ciudad
    const glowK = o.glow ?? 1;
    cables.forEach((cb, i) => { for (let j = 0; j < 3; j++) { const u = ((t * .18 + j / 3 + i * .137) % 1), x = lerp(cb.a[0], cb.b[0], u), y = lerp(cb.a[1], cb.b[1], u) + Math.sin(u * Math.PI) * cb.sag; const rr = 10 * cb.s + 3;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr * 2.2); g.addColorStop(0, `rgba(255,255,255,${glowK})`); g.addColorStop(.3, `rgba(140,200,255,${.7 * glowK})`); g.addColorStop(1, 'rgba(120,180,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - rr * 2.2, y - rr * 2.2, rr * 4.4, rr * 4.4); } });
    // helicóptero en silueta con el liniero en la plataforma
    if (o.heli) { const { x, y, s = 1, tt = t } = o.heli; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#140A10'; ctx.strokeStyle = '#140A10';
      ctx.beginPath(); ctx.ellipse(0, 0, 70, 38, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-160, -10, 110, 14); ctx.beginPath(); ctx.moveTo(-160, -8); ctx.lineTo(-175, -40); ctx.lineTo(-150, -8); ctx.fill();
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-50, 50); ctx.lineTo(60, 50); ctx.moveTo(-30, 30); ctx.lineTo(-30, 50); ctx.moveTo(30, 30); ctx.lineTo(30, 50); ctx.stroke(); ctx.fillRect(-4, -52, 8, 16);
      const bl = 170 * Math.abs(Math.cos(tt * 23)); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-bl, -52); ctx.lineTo(bl, -52); ctx.stroke(); ctx.globalAlpha = .25; ctx.fillRect(-170, -55, 340, 6); ctx.globalAlpha = 1;
      ctx.fillRect(20, 28, 60, 6); ctx.beginPath(); ctx.arc(52, 2, 9, 0, 7); ctx.fill(); ctx.fillRect(46, 10, 12, 20); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(56, 18); ctx.lineTo(96, -4); ctx.stroke();
      ctx.restore(); }
    // viñeta suave
    const v = ctx.createRadialGradient(W / 2, H * .45, H * .25, W / 2, H * .5, H * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,6,20,.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    return { cables, towers };
  }

  window.ARR = { THREE, rng, clamp, lerp, prog, ease, easeOut, std, glowM, M, box, cyl, ball, tubeBetween, canvasTex, glow, starburst, sunsetEnv, bokehSky, cable, torre, helicoptero, liniero, pajaro, arco, chispas, vista };
})();
