/* Serie "Nunca te lo explicaron": 3D low-poly con luz de atardecer (Three.js).
   Celular genérico despiezado, calle costera (La Paz, B.C.S., inspirada; sin marcas), personas sin rostro,
   módems con ondas WiFi y planeta con puntos de luz.  Uso: const N = window.N; */
(function () {
  const THREE = window.THREE;
  if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
  function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, prog = (t, a, b) => clamp((t - a) / (b - a));
  const ease = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), easeOut = k => 1 - Math.pow(1 - clamp(k), 3);
  const std = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .75, metalness: 0, flatShading: true }, o));
  const glowM = (color, op = 1) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, toneMapped: false, depthWrite: false });
  const M = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
  const box = (w, h, d, m, x, y, z) => M(new THREE.BoxGeometry(w, h, d), typeof m === 'string' ? std(m) : m, x, y, z);
  const cyl = (rt, rb, h, m, seg, x, y, z) => M(new THREE.CylinderGeometry(rt, rb, h, seg || 12), typeof m === 'string' ? std(m) : m, x, y, z);
  function canvasTex(w, h, draw, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
  const glowTex = canvasTex(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }, false);
  function glow(color, s = 1, op = 1) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); sp.scale.setScalar(s); return sp; }

  // ---------- luz de atardecer ----------
  function atardecer(s, o = {}) {
    s.add(new THREE.HemisphereLight('#FFC9A0', '#3A2A48', .55));
    const sun = new THREE.DirectionalLight('#FFB070', 2.4); sun.position.set(-40, 22, -30); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera; sc.left = sc.bottom = -(o.sh || 40); sc.right = sc.top = (o.sh || 40); sc.far = 200; sun.shadow.bias = -.0005; sun.shadow.normalBias = .04; s.add(sun, sun.target);
    const fill = new THREE.DirectionalLight('#8A9AFF', .45); fill.position.set(30, 20, 30); s.add(fill);
    s.fog = new THREE.Fog('#E9A27E', o.near || 40, o.far || 160);
    const sky = canvasTex(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3A2A6A'); g.addColorStop(.45, '#B8507A'); g.addColorStop(.75, '#F28A5A'); g.addColorStop(1, '#FFD08A'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    s.background = sky; return sun;
  }

  // ---------- celular genérico despiezable ----------
  function celular() {
    const g = new THREE.Group(), P = {};
    const L = (name, mesh, z) => { const l = new THREE.Group(); l.add(mesh); l.userData.z = z; g.add(l); P[name] = l; return l; };
    const rr = (w, h, r, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: .02, bevelThickness: .02, bevelSegments: 3 }); geo.translate(0, 0, -d / 2); return geo; };
    const back = M(rr(1, 2.05, .16, .06), std('#2A2E3A', { metalness: .6, roughness: .35, flatShading: false })); L('tapa', back, -.18);
    const cam = new THREE.Group(); cam.position.set(-.28, .78, -.05); P.tapa.add(cam); cam.add(box(.32, .32, .04, std('#1A1C22', { metalness: .5, roughness: .3, flatShading: false }))); for (const [x, y] of [[-.07, .07], [.07, -.07]]) { const lens = cyl(.055, .055, .05, std('#0A0C10', { metalness: .9, roughness: .1, flatShading: false }), 20, x, y, -.03); lens.rotation.x = Math.PI / 2; cam.add(lens); }
    const bat = box(.82, 1.25, .06, std('#3A4252', { roughness: .5, flatShading: false }), 0, -.2, 0); L('bateria', bat, -.06);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(.6, .3), new THREE.MeshBasicMaterial({ map: canvasTex(256, 128, (x) => { x.fillStyle = '#3A4252'; x.fillRect(0, 0, 256, 128); x.fillStyle = '#9AA6BA'; x.font = '900 40px Nunito, sans-serif'; x.textAlign = 'center'; x.fillText('Li-ion', 128, 76); }) })); label.position.set(0, -.2, .031); P.bateria.add(label);
    // placa con chips
    const board = new THREE.Group(); L('placa', board, .06);
    board.add(box(.86, .62, .03, std('#1E5A42', { roughness: .6, flatShading: false }), 0, .62, 0));
    const chips = [[-.22, .7, .22, .16, '#2A2A30'], [.18, .72, .16, .16, '#2A2A30'], [.02, .5, .26, .1, '#3A3A44']];
    chips.forEach(([x, y, w, h, c]) => board.add(box(w, h, .04, std(c, { roughness: .4, metalness: .3, flatShading: false }), x, y, .03)));
    const gps = box(.14, .14, .045, std('#C8A040', { metalness: .7, roughness: .3, flatShading: false }), .3, .5, .035); board.add(gps); P.gps = gps;
    for (let i = 0; i < 10; i++) board.add(box(.005, .12, .005, std('#C8A040', { metalness: .8 }), -.4 + i * .02, .38, .02));
    // marco y pantalla
    const frame = M(rr(1.02, 2.07, .17, .04), std('#B8BEC8', { metalness: .85, roughness: .25, flatShading: false })); L('marco', frame, .14);
    const scrT = canvasTex(512, 1040, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#2A1A5A'); g.addColorStop(1, '#0E2A4A'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(.94, 1.98), new THREE.MeshBasicMaterial({ map: scrT, toneMapped: false })); L('pantalla', screen, .26);
    const glass = M(rr(.98, 2.03, .16, .01), new THREE.MeshPhysicalMaterial({ color: '#AFC8FF', roughness: .05, metalness: 0, transparent: true, opacity: .18, clearcoat: 1 })); glass.position.z = .005; P.pantalla.add(glass);
    // anillo punteado rojo del GPS
    const ringC = canvasTex(256, 256, (x) => { x.strokeStyle = '#FF2E3A'; x.lineWidth = 12; x.setLineDash([22, 16]); x.beginPath(); x.arc(128, 128, 110, 0, 7); x.stroke(); }, false);
    const ring = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshBasicMaterial({ map: ringC, transparent: true, toneMapped: false, depthWrite: false, depthTest: false })); ring.renderOrder = 20; ring.position.set(.3, .5, .08); board.add(ring); P.ring = ring;
    const gpsGlow = glow('#FF3A3A', .45, 0); gpsGlow.position.set(.3, .5, .07); board.add(gpsGlow); P.gpsGlow = gpsGlow;
    P.despiece = (k) => ['tapa', 'bateria', 'placa', 'marco', 'pantalla'].forEach(n => P[n].position.z = P[n].userData.z * (1 + 4.5 * k) - (k ? 0 : 0) + (k ? 0 : -P[n].userData.z) + (k ? 0 : P[n].userData.z * 0));
    P.armar = (k) => ['tapa', 'bateria', 'placa', 'marco', 'pantalla'].forEach(n => P[n].position.z = lerp({ tapa: -.03, bateria: -.015, placa: 0, marco: .005, pantalla: .03 }[n], P[n].userData.z * 3.6, k));
    P.armar(0); P.screenTex = scrT;
    g.userData = P; return g;
  }

  // ---------- persona simple sin rostro ----------
  function persona(color = '#7A4FC0', o = {}) {
    const g = new THREE.Group(), P = {}, skin = std(o.piel || '#C68D68'), pants = std(o.pantalon || '#2E3448'), shirt = std(color);
    for (const s of [-1, 1]) { const hip = new THREE.Group(); hip.position.set(s * .1, .8, 0); g.add(hip); hip.add(box(.14, .78, .16, pants, 0, -.39, 0)); hip.add(box(.15, .08, .24, '#2A2A30', 0, -.78, .04)); P[s < 0 ? 'legL' : 'legR'] = hip; }
    g.add(box(.42, .58, .26, shirt, 0, 1.1, 0));
    if (o.capucha) g.add(box(.32, .12, .2, shirt, 0, 1.43, -.06));
    for (const s of [-1, 1]) { const sh = new THREE.Group(); sh.position.set(s * .27, 1.36, 0); g.add(sh); sh.add(box(.11, .56, .13, shirt, 0, -.28, 0)); sh.add(box(.09, .1, .1, skin, 0, -.6, 0)); P[s < 0 ? 'armL' : 'armR'] = sh; }
    const head = new THREE.Group(); head.position.y = 1.62; g.add(head); P.head = head;
    head.add(M(new THREE.SphereGeometry(.17, 16, 12), std(o.piel || '#C68D68', { flatShading: false })));
    head.add(M(new THREE.SphereGeometry(.18, 16, 10, 0, Math.PI * 2, 0, Math.PI * .55), std(o.pelo || '#1E1A18', { flatShading: false }), 0, .02, -.01));
    if (o.coleta) head.add(box(.1, .28, .1, o.pelo || '#1E1A18', 0, -.08, -.18));
    // celular en la mano
    const ph = new THREE.Group(); ph.position.set(0, -.62, .1); P.armR.add(ph); ph.add(box(.09, .17, .015, '#1A1C22', 0, 0, 0));
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(.075, .15), glowM('#7FE8FF', .9)); scr.position.z = .009; ph.add(scr); P.phone = ph; P.screen = scr;
    P.camina = (ph_, k = 1) => { const a = Math.sin(ph_) * .5 * k; P.legL.rotation.x = a; P.legR.rotation.x = -a; P.armL.rotation.x = -a * .6; P.armR.rotation.x = -.9; };
    g.userData = P; return g;
  }

  // ---------- módem con antenas y lucecitas ----------
  function modem() { const g = new THREE.Group(); g.add(box(.5, .12, .32, std('#1C1E24', { roughness: .4, flatShading: false }), 0, .06, 0));
    for (const s of [-1, 1]) { const a = cyl(.015, .02, .38, '#1C1E24', 8, s * .2, .3, -.12); a.rotation.z = s * .2; g.add(a); }
    const leds = []; for (let i = 0; i < 4; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 6), glowM(i === 0 ? '#5CFF9A' : '#7FE8FF')); l.position.set(-.15 + i * .1, .1, .165); g.add(l); leds.push(l); }
    g.userData.leds = leds; return g; }

  // ---------- ondas WiFi: arcos cian que se expanden ----------
  const arcTex = canvasTex(256, 256, (x) => { x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineWidth = 24; x.beginPath(); x.arc(128, 220, 170, Math.PI * 1.22, Math.PI * 1.78); x.stroke(); }, false);
  function ondas(n = 3, color = '#5CE8FF') { const g = new THREE.Group(), arcs = []; for (let i = 0; i < n; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: arcTex, color, transparent: true, depthWrite: false, toneMapped: false })); g.add(sp); arcs.push(sp); }
    g.userData.update = (t, k = 1, size = 3) => arcs.forEach((a, i) => { const u = ((t * .7 + i / n) % 1); a.scale.setScalar(.6 + u * size); a.position.y = u * size * .25; a.material.opacity = Math.min(1, (1 - u) * 2.2) * k; });
    return g; }

  // ---------- etiqueta 3D (canvas) ----------
  function etiqueta(text, o = {}) { const w = o.w || 512, h = o.h || 128; const tex = canvasTex(w, h, (x) => { x.fillStyle = o.bg || 'rgba(10,14,30,.82)'; x.beginPath(); x.roundRect(4, 4, w - 8, h - 8, 28); x.fill(); x.strokeStyle = o.border || 'rgba(92,232,255,.85)'; x.lineWidth = 5; x.stroke(); x.fillStyle = o.color || '#E8FBFF'; x.font = `900 ${o.fs || 58}px Nunito, monospace`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 3); }, true);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false })); sp.scale.set((o.s || 1) * w / h, o.s || 1, 1); sp.renderOrder = 10; return sp; }

  // ---------- calle costera al atardecer ----------
  function calle(o = {}) {
    const g = new THREE.Group(), r = rng(o.seed || 7);
    g.add(box(400, .2, 400, '#5A4A44', 0, -.1, 0));
    g.add(box(400, .02, 9, '#3E3A40', 0, .01, 0));                // calle
    for (let i = -40; i < 40; i++) g.add(box(2, .03, .18, '#E8D8A0', i * 5, .02, 0));
    for (const s of [-1, 1]) g.add(box(400, .25, 3, '#B8A898', 0, .12, s * 6));   // banquetas
    const cols = ['#C8603E', '#E8B84A', '#6CC0B0', '#F2EEE6', '#D88A6A', '#7AB0D0', '#E8D07A'];
    const casas = [], modems = [];
    for (const side of [-1, 1]) { let x = -70;
      while (x < 70) { const w = 6 + r() * 4, h = [3.4, 6.6, 9.8][Math.floor(r() * 3)], d = 8, col = cols[Math.floor(r() * cols.length)];
        const b = new THREE.Group(); b.position.set(x + w / 2, 0, side * (7.5 + d / 2)); g.add(b);
        b.add(box(w, h, d, col, 0, h / 2, 0)); b.add(box(w + .2, .3, d + .2, '#F4EEE4', 0, h + .15, 0));
        const floors = Math.round(h / 3.2);
        for (let f = 0; f < floors; f++) for (let k = 0; k < Math.floor(w / 2); k++) { const wx = -w / 2 + 1.2 + k * 2 + (w - Math.floor(w / 2) * 2) / 2, wy = 1.6 + f * 3.2;
          const lit = r() < .55; const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), lit ? glowM('#FFD08A', .95) : std('#2A3040')); win.position.set(wx, wy, -side * (d / 2 + .02)); if (side > 0) win.rotation.y = Math.PI; b.add(win);
          b.add(box(1.2, .12, .25, '#F4EEE4', wx, wy - .75, -side * (d / 2 + .1))); }
        if (r() < .35) { const aw = box(w * .7, .1, 1.4, ['#C8403A', '#3A7AE0', '#3AA06A'][Math.floor(r() * 3)], 0, 2.9, -side * (d / 2 + .7)); aw.rotation.x = side * .25; b.add(aw); }
        const m = modem(); m.position.set(r() * w * .6 - w * .3, 1.2 + Math.floor(r() * floors) * 3.2, -side * (d / 2 + .3)); m.scale.setScalar(1.6); b.add(m);
        casas.push(b); modems.push(m); x += w + .1; } }
    // palmeras y malecón al fondo
    const palm = (x, z, h = 6) => { const p = new THREE.Group(); p.position.set(x, 0, z); g.add(p); let px = 0; for (let i = 0; i < 8; i++) { const seg = cyl(.18, .22, h / 8, '#8A6A4A', 6, px, (i + .5) * h / 8, 0); seg.rotation.z = .04 * i; p.add(seg); px += .05 * i * .3; }
      for (let i = 0; i < 7; i++) { const leaf = box(2.6, .06, .5, std('#3A8A4A'), 0, 0, 0); const lp = new THREE.Group(); lp.position.set(px, h, 0); lp.rotation.y = i * Math.PI * 2 / 7; leaf.position.x = 1.2; leaf.rotation.z = -.4; lp.add(leaf); p.add(lp); } return p; };
    for (let i = -6; i < 7; i++) palm(i * 12 + 4, -32 + (i % 2) * 2, 6 + (i % 3));
    g.add(box(400, .6, 6, '#D8C8B0', 0, .3, -32));   // malecón
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 300), new THREE.MeshStandardMaterial({ color: '#3A6AA0', roughness: .15, metalness: .4 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, .05, -185); g.add(sea);
    for (const [x, z] of [[-60, -140], [40, -170], [120, -150]]) { const cerro = M(new THREE.ConeGeometry(30, 18, 7), std('#8A5A6A')); cerro.position.set(x, 8, z); g.add(cerro); }
    // faroles
    const lamps = []; for (let i = -8; i < 9; i++) for (const s of [-1, 1]) { const x = i * 9 + s * 2; g.add(cyl(.08, .1, 4.2, '#2A2A30', 6, x, 2.1, s * 5)); const bulb = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), glowM('#FFD9A0')); bulb.position.set(x, 4.3, s * 4.7); g.add(bulb); lamps.push(bulb);
      if (i % 3 === 0) { const L = new THREE.PointLight('#FFB060', 2.5, 12, 2); L.position.set(x, 4.1, s * 4.5); g.add(L); } }
    g.userData = { casas, modems }; return g;
  }

  // ---------- centro comercial (corte) ----------
  function centroComercial() {
    const g = new THREE.Group(); const floors = 3, H = 4;
    for (let f = 0; f < floors; f++) { g.add(box(24, .4, 14, '#E8E2D8', 0, f * H, 0));
      for (let k = 0; k < 4; k++) { const tienda = box(5, 3.2, .2, ['#E8B84A', '#6CC0B0', '#C8603E', '#7AB0D0'][(k + f) % 4], -9 + k * 6, f * H + 1.8, -6.6); g.add(tienda);
        const vit = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.2), glowM('#FFF2D6', .55)); vit.position.set(-9 + k * 6, f * H + 1.7, -6.45); g.add(vit); } }
    g.add(box(24, .4, 14, '#D8D2C8', 0, floors * H, 0));
    for (const x of [-12, 12]) g.add(box(.4, floors * H, 14, '#C8C2B8', x, floors * H / 2, 0));
    for (let f = 0; f < floors; f++) { const L = new THREE.PointLight('#FFE8C8', 2, 16, 2); L.position.set(0, f * H + 3.4, -2); g.add(L); }
    return g;
  }

  // ---------- planeta con puntos de luz cian ----------
  function planeta(n = 6000) {
    const g = new THREE.Group();
    // continentes con "ruido" de senos (genérico, no un mapa real)
    const land = (lon, lat) => { const v = Math.sin(lon * 1.7 + 1.2) * Math.cos(lat * 2.1) + .6 * Math.sin(lon * 3.3 - lat * 2.7 + .5) + .35 * Math.cos(lon * 6.1 + lat * 5.3) + .2 * Math.sin(lat * 8 + lon * 2); return v - .35 * Math.abs(lat) > .35; };
    const tex = canvasTex(1024, 512, (x, w, h) => { const img = x.createImageData(w, h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const lon = (i / w - .5) * Math.PI * 2, lat = (.5 - j / h) * Math.PI, L = land(lon, lat), k = (j * w + i) * 4;
        img.data[k] = L ? 52 : 16; img.data[k + 1] = L ? 92 : 46; img.data[k + 2] = L ? 70 : 96; img.data[k + 3] = 255; } x.putImageData(img, 0, 0); });
    const earth = M(new THREE.SphereGeometry(5, 64, 48), new THREE.MeshStandardMaterial({ map: tex, roughness: .8 })); g.add(earth);
    const atm = new THREE.Mesh(new THREE.SphereGeometry(5.25, 48, 32), new THREE.MeshBasicMaterial({ color: '#5CB8FF', transparent: true, opacity: .12, side: THREE.BackSide, toneMapped: false })); g.add(atm);
    const r = rng(9), pos = new Float32Array(n * 3); let c = 0;
    while (c < n) { const lon = (r() - .5) * Math.PI * 2, lat = Math.asin(r() * 2 - 1); if (!land(lon, lat)) continue; const R = 5.03; pos.set([R * Math.cos(lat) * Math.cos(lon), R * Math.sin(lat), -R * Math.cos(lat) * Math.sin(lon)], c * 3); c++; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#7FF0FF', size: .16, map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); g.add(pts);
    g.userData = { earth, pts }; return g;
  }

  // ---------- render ----------
  function crearRender(canvas, W, H) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; return renderer;
  }
  window.N = { THREE, rng, clamp, lerp, prog, ease, easeOut, std, glowM, M, box, cyl, canvasTex, glow, atardecer, celular, persona, modem, ondas, etiqueta, calle, centroComercial, planeta, crearRender };
})();
