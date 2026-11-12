/* Librería de la serie "Así funciona por dentro": 3D caricatura con cel-shading (3 tonos),
   contornos negros gruesos (post-proceso con normales y profundidad), rayos X y modelos
   originales: calle mexicana, chavo de gorra roja, carrito del súper, motor de podadora,
   cadena y engranes, clutch centrífugo, dirección, freno de disco y go-kart.
   Uso: const K = window.K;  (necesita three.min.js antes) */
(function () {
  const THREE = window.THREE;
  // ---------- utilidades ----------
  function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, prog = (t, a, b) => clamp((t - a) / (b - a));
  const ease = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), easeOut = k => 1 - Math.pow(1 - clamp(k), 3), easeIn = k => Math.pow(clamp(k), 3);
  const backOut = k => { k = clamp(k); const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

  // ---------- materiales caricatura ----------
  const grad = (() => { const d = new Uint8Array([70, 150, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; })();
  const cache = {};
  function toon(color, o = {}) { const k = color + JSON.stringify(o); if (!o.noCache && cache[k]) return cache[k]; const m = new THREE.MeshToonMaterial(Object.assign({ color, gradientMap: grad }, o)); delete m.noCache; if (!o.noCache) cache[k] = m; return m; }
  function flat(color, o = {}) { return new THREE.MeshBasicMaterial(Object.assign({ color, toneMapped: false }, o)); }
  function mesh(geo, m, x = 0, y = 0, z = 0) { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; return me; }
  const box = (w, h, d, m, x, y, z) => mesh(new THREE.BoxGeometry(w, h, d), typeof m === 'string' ? toon(m) : m, x, y, z);
  const cyl = (rt, rb, h, m, seg = 16, x, y, z) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof m === 'string' ? toon(m) : m, x, y, z);
  const ball = (r, m, x, y, z, seg = 14) => mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg * .7 | 0)), typeof m === 'string' ? toon(m) : m, x, y, z);
  const torus = (r, tube, m, seg = 24, arc = Math.PI * 2) => mesh(new THREE.TorusGeometry(r, tube, 8, seg, arc), typeof m === 'string' ? toon(m) : m);
  const repaints = [];
  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; repaints.push(() => { x.clearRect(0, 0, w, h); draw(x, w, h); t.needsUpdate = true; }); return t; }
  const repaint = () => repaints.forEach(f => f());

  // ---------- engrane (rueda dentada) ----------
  function gearGeo(teeth, rIn, rOut, thick) {
    const sh = new THREE.Shape(), n = teeth * 4;
    for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, r = (i % 4 < 2) ? rOut : rIn; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const hole = new THREE.Path(); hole.absarc(0, 0, rIn * .28, 0, Math.PI * 2, true); sh.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: false }); g.translate(0, 0, -thick / 2); return g;
  }
  function gear(teeth, r, color, thick = .03) { const g = new THREE.Group(); g.add(mesh(gearGeo(teeth, r * .86, r, thick), toon(color))); g.add(cyl(r * .22, r * .22, thick * 1.6, '#3A3A44', 12)); g.children[1].rotation.x = Math.PI / 2; return g; }

  // ---------- calle mexicana caricaturizada ----------
  function street(o = {}) {
    const g = new THREE.Group(), r = rng(o.seed || 7);
    g.add(box(400, .1, 14, '#4A4E58', 0, -.05, 0));                         // asfalto
    for (let i = -40; i < 40; i++) g.add(box(1.6, .012, .14, '#F2E6B0', i * 4, .006, 1.2));   // línea punteada
    g.add(box(400, .18, 3.2, '#C9C3B6', 0, .09, -4.6));                       // banqueta
    g.add(box(400, .2, .22, '#E8E2D4', 0, .1, -3.0));                         // guarnición
    const cols = ['#E8463A', '#3FB25A', '#F5C431', '#F58A2E', '#3E8FE0', '#E8628E', '#7AD0C8'];
    const bld = []; let x = -60;
    while (x < 120) {
      const w = 5 + r() * 4, h = 4.5 + r() * 5, col = cols[(bld.length + 2) % cols.length], b = new THREE.Group();
      b.add(box(w, h, 5, col, 0, h / 2, 0));
      b.add(box(w + .3, .35, 5.3, '#F4EFE6', 0, h + .17, 0));               // pretil
      for (let fy = 0; fy < Math.floor(h / 2.4); fy++) for (let fx = 0; fx < Math.floor(w / 1.8); fx++) {
        const wx = -w / 2 + .9 + fx * 1.8 + (w - Math.floor(w / 1.8) * 1.8) / 2, wy = 1.5 + fy * 2.4;
        if (fy === 0 && fx === 0) { b.add(box(1.0, 2.0, .12, '#7A4A2A', wx, 1.0, 2.52)); continue; }   // puerta
        b.add(box(.9, 1.1, .1, '#2A3A58', wx, wy, 2.52)); b.add(box(1.1, .12, .2, '#F4EFE6', wx, wy - .6, 2.56));
      }
      b.position.set(x + w / 2, 0, -8.7); g.add(b); bld.push(b); x += w + .05;
    }
    // tienda de abarrotes con toldo de rayas
    const shop = new THREE.Group(); shop.position.set(o.shopX ?? 6, 0, -8.6); g.add(shop);
    shop.add(box(8, 5.2, 5, '#F7E7C4', 0, 2.6, 0));
    const signT = canvasTex(1024, 192, (c, w, h) => { c.fillStyle = '#1F6FC8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#111'; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14); c.fillStyle = '#FFF4C0'; c.font = '900 130px Anton, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ABARROTES', w / 2, h / 2 + 6); });
    shop.add(mesh(new THREE.BoxGeometry(6.6, 1.25, .2), [toon('#1F6FC8'), toon('#1F6FC8'), toon('#1F6FC8'), toon('#1F6FC8'), new THREE.MeshToonMaterial({ map: signT, gradientMap: grad }), toon('#1F6FC8')], 0, 4.3, 2.6));
    const awT = canvasTex(512, 64, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#FFFFFF' : '#E53A3A'; c.fillRect(i * 32, 0, 32, h); } });
    awT.wrapS = THREE.RepeatWrapping;
    const aw = mesh(new THREE.BoxGeometry(7.4, .08, 1.8), [toon('#E53A3A'), toon('#E53A3A'), new THREE.MeshToonMaterial({ map: awT, gradientMap: grad }), toon('#E53A3A'), toon('#E53A3A'), toon('#E53A3A')], 0, 3.25, 3.4); aw.rotation.x = .32; shop.add(aw);
    const valT = canvasTex(512, 64, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#FFFFFF' : '#E53A3A'; c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32 + 32, 0); c.lineTo(i * 32 + 32, h * .55); c.arc(i * 32 + 16, h * .55, 16, 0, Math.PI); c.fill(); } });
    const val = mesh(new THREE.PlaneGeometry(7.4, .45), new THREE.MeshToonMaterial({ map: valT, gradientMap: grad, transparent: true, side: THREE.DoubleSide }), 0, 2.78, 4.25); shop.add(val);
    shop.add(box(2.4, 2.4, .12, '#2A3A58', -2.2, 1.6, 2.52)); shop.add(box(1.3, 2.4, .12, '#2A3A58', 2.4, 1.2, 2.52));
    // árboles low-poly
    const trees = [];
    for (const tx of (o.trees || [-14, -3, 15, 27, 40])) {
      const t = new THREE.Group(); t.add(cyl(.12, .16, 1.8, '#7A4E2A', 7, 0, .9, 0));
      const c1 = mesh(new THREE.IcosahedronGeometry(1.15, 0), toon('#3FA34A', { flatShading: true }), 0, 2.4, 0); t.add(c1);
      const c2 = mesh(new THREE.IcosahedronGeometry(.8, 0), toon('#58C25E', { flatShading: true }), .35, 3.05, .1); t.add(c2);
      t.position.set(tx, .18, -4.0); g.add(t); trees.push(t);
    }
    // semáforo
    const sem = new THREE.Group(); sem.position.set(o.semX ?? 22, .18, -3.4); g.add(sem);
    sem.add(cyl(.07, .09, 4.2, '#3A3D46', 10, 0, 2.1, 0)); sem.add(box(.12, .12, 1.4, '#3A3D46', 0, 4.1, .65));
    const head = box(.42, 1.2, .38, '#2A2C34', 0, 3.6, 1.35); sem.add(head);
    const lights = ['#FF3B30', '#FFC21A', '#36D46A'].map((c, i) => { const l = ball(.12, flat('#333'), 0, 3.95 - i * .36, 1.56, 12); sem.add(l); return { m: l, on: c, off: '#3A2E2E' }; });
    const setLight = (k) => lights.forEach((l, i) => l.m.material.color.set(i === k ? l.on : l.off));
    setLight(2);
    return { group: g, setLight, shop, trees, sem };
  }

  // ---------- el chavo: gorra roja, sudadera azul, jeans, cuerpo de bloques ----------
  function chavo(o = {}) {
    const g = new THREE.Group(), P = {};
    const hood = o.shirt || '#2F6FD6', jean = o.pants || '#2E4A7E', skin = o.skin || '#E2A77E', cap = o.cap || '#E33A2E';
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * .1, .82, 0); g.add(hip);
      hip.add(box(.15, .42, .17, jean, 0, -.21, 0));
      const knee = new THREE.Group(); knee.position.y = -.42; hip.add(knee);
      knee.add(box(.14, .38, .16, jean, 0, -.19, 0)); knee.add(box(.16, .1, .28, '#F2F2F2', 0, -.37, .05));
      P[s < 0 ? 'legL' : 'legR'] = hip; P[s < 0 ? 'kneeL' : 'kneeR'] = knee;
    }
    const torso = new THREE.Group(); torso.position.y = .82; g.add(torso); P.torso = torso;
    torso.add(box(.44, .55, .26, hood, 0, .3, 0)); torso.add(box(.46, .08, .28, o.shirtD || '#2558B0', 0, .03, 0));
    torso.add(box(.2, .12, .03, o.shirtD || '#2558B0', 0, .22, .14));     // bolsa canguro
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(s * .29, .54, 0); torso.add(sh);
      sh.add(box(.12, .3, .13, hood, 0, -.15, 0));
      const el = new THREE.Group(); el.position.y = -.3; sh.add(el);
      el.add(box(.11, .26, .12, hood, 0, -.13, 0)); el.add(box(.1, .1, .1, skin, 0, -.3, 0));
      P[s < 0 ? 'armL' : 'armR'] = sh; P[s < 0 ? 'elbowL' : 'elbowR'] = el;
    }
    const head = new THREE.Group(); head.position.y = .68; torso.add(head); P.head = head;
    head.add(box(.08, .08, .08, skin, 0, -.04, 0));
    head.add(box(.28, .3, .26, skin, 0, .14, 0));
    head.add(box(.3, .1, .28, cap, 0, .32, 0)); head.add(box(.29, .04, .16, cap, 0, .27, .2));    // gorra y visera
    if (o.capBack) head.children[head.children.length - 1].position.z = -.2;
    g.userData = P; return g;
  }
  function pose(P, k = {}) { ['legL', 'legR', 'kneeL', 'kneeR', 'armL', 'armR', 'elbowL', 'elbowR', 'head', 'torso'].forEach(n => P[n] && P[n].rotation.set(0, 0, 0)); Object.entries(k).forEach(([n, r]) => P[n] && P[n].rotation.set(r[0] || 0, r[1] || 0, r[2] || 0)); }

  // ---------- carrito del súper (eje x = hacia adelante) ----------
  function carrito() {
    const g = new THREE.Group(), parts = {}, metal = toon('#A9B0BA'), dark = toon('#5B616C');
    const body = new THREE.Group(); g.add(body); parts.body = body;
    const L = 1.0, W = .58, y0 = .42, H = .48;
    // canasta de rejilla
    const wires = []; const wire = (a, b, m = metal) => { const d = new THREE.Vector3().subVectors(b, a), len = d.length(); const c = mesh(new THREE.CylinderGeometry(.009, .009, len, 5), m); c.position.copy(a).addScaledVector(d, .5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); body.add(c); wires.push(c); return c; };
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const top = y0 + H, xb = -L / 2, xf = L / 2, xfTop = L / 2 + .08;
    for (let i = 0; i <= 10; i++) { const x = lerp(xb, xf, i / 10), xt = lerp(xb, xfTop, i / 10); for (const z of [-W / 2, W / 2]) wire(V(x, y0, z), V(xt, top, z)); }
    for (let j = 0; j <= 6; j++) { const y = lerp(y0, top, j / 6); for (const z of [-W / 2, W / 2]) wire(V(xb, y, z), V(lerp(xf, xfTop, j / 6), y, z)); wire(V(xb, y, -W / 2), V(xb, y, W / 2)); wire(V(lerp(xf, xfTop, j / 6), y, -W / 2), V(lerp(xf, xfTop, j / 6), y, W / 2)); }
    for (let i = 0; i <= 6; i++) { const z = lerp(-W / 2, W / 2, i / 6); wire(V(xb, y0, z), V(xb, top, z)); wire(V(xf, y0, z), V(xfTop, top, z)); }
    for (let i = 0; i <= 10; i++) wire(V(lerp(xb, xf, i / 10), y0, -W / 2), V(lerp(xb, xf, i / 10), y0, W / 2));
    for (const z of [-W / 2, W / 2]) wire(V(xb, top, z), V(xfTop, top, z));   // borde superior
    // manubrio con agarradera roja
    for (const z of [-W / 2, W / 2]) wire(V(xb, top, z), V(xb - .16, top + .14, z));
    const handle = cyl(.022, .022, W + .04, '#E33A2E', 10, xb - .16, top + .14, 0); handle.rotation.x = Math.PI / 2; body.add(handle); parts.handle = handle;
    // chasis bajo y llantitas
    for (const z of [-W / 2 + .03, W / 2 - .03]) { const r = box(L + .05, .035, .035, dark, 0, .2, z); body.add(r); }
    for (const x of [-L / 2 + .05, L / 2 - .05]) body.add(box(.035, .035, W, dark, x, .2, 0));
    for (const [x, z] of [[-L / 2 + .05, -W / 2 + .03], [-L / 2 + .05, W / 2 - .03], [L / 2 - .05, -W / 2 + .03], [L / 2 - .05, W / 2 - .03]]) wire(V(x, .2, z), V(x * .97, y0, z * .97), dark);
    const wheels = [];
    for (const [x, z, front] of [[-L / 2 + .05, -W / 2 + .03, 0], [-L / 2 + .05, W / 2 - .03, 0], [L / 2 - .05, -W / 2 + .03, 1], [L / 2 - .05, W / 2 - .03, 1]]) {
      const piv = new THREE.Group(); piv.position.set(x, .2, z); g.add(piv);
      piv.add(box(.03, .1, .06, dark, 0, -.05, 0));
      const w = new THREE.Group(); w.position.y = -.12; piv.add(w);
      const tire = cyl(.07, .07, .045, '#24262C', 16); tire.rotation.x = Math.PI / 2; w.add(tire);
      const hub = cyl(.035, .035, .05, '#D8DCE2', 10); hub.rotation.x = Math.PI / 2; w.add(hub);
      wheels.push({ piv, w, front });
    }
    parts.wheels = wheels; parts.metal = metal; parts.wires = wires.slice(0, wires.length - 6);   // la canasta (sin manubrio ni patas del chasis)
    g.userData = parts; return g;
  }

  // ---------- motor de podadora (rojo, genérico, sin marca) ----------
  function motor() {
    const g = new THREE.Group(), P = {};
    g.add(box(.3, .2, .28, '#D9332B', 0, .1, 0));                       // carter
    const cylr = cyl(.09, .09, .16, '#B9C0C8', 12, -.06, .25, 0); g.add(cylr);
    for (let i = 0; i < 5; i++) { const f = cyl(.12, .12, .012, '#9AA2AC', 14, -.06, .19 + i * .03, 0); g.add(f); }   // aletas
    const tank = box(.16, .1, .2, '#F2C230', .08, .28, 0); g.add(tank); g.add(cyl(.03, .03, .04, '#222', 8, .1, .35, .04));
    const filt = box(.08, .12, .14, '#2A2A30', -.2, .24, .05); g.add(filt);
    const ex = cyl(.035, .035, .14, '#55555E', 10, .17, .14, -.08); ex.rotation.z = Math.PI / 2; g.add(ex); P.exhaust = new THREE.Vector3(.26, .14, -.08);
    const shroud = cyl(.15, .15, .06, '#D9332B', 18, -.02, .32, 0); g.add(shroud);
    const cordH = box(.1, .025, .03, '#222', -.17, .37, -.12); g.add(cordH); P.cordHandle = cordH;
    const shaft = cyl(.02, .02, .14, '#888', 8, 0, .1, .2); shaft.rotation.x = Math.PI / 2; g.add(shaft); P.shaft = new THREE.Vector3(0, .1, .27);
    g.userData = P; return g;
  }
  function cinchos(target, xs, y, w) { const g = new THREE.Group(); xs.forEach(x => { const r = box(.012, .025, w, '#141414', x, y, 0); g.add(r); }); target.add(g); return g; }

  // ---------- transmisión: cadena + engranes ----------
  function cadena(r1, r2, dist, color = '#2A2A30') {   // cadena entre dos engranes (x: 0 → dist), se mueve con avance()
    const g = new THREE.Group(), links = [], n = 46;
    for (let i = 0; i < n; i++) { const l = box(.022, .014, .03, color); g.add(l); links.push(l); }
    const pathAt = (s) => {   // perímetro aproximado: arriba recto, arco grande, abajo recto, arco chico
      const top = dist, arcB = Math.PI * r2, bot = dist, arcS = Math.PI * r1, P = top + arcB + bot + arcS; s = ((s % P) + P) % P;
      if (s < top) return [lerp(0, dist, s / top), lerp(r1, r2, s / top)];
      s -= top; if (s < arcB) { const a = Math.PI / 2 - s / r2; return [dist + Math.cos(a) * r2, Math.sin(a) * r2]; }
      s -= arcB; if (s < bot) return [lerp(dist, 0, s / bot), lerp(-r2, -r1, s / bot)];
      s -= bot; const a = -Math.PI / 2 - s / r1; return [Math.cos(a) * r1, Math.sin(a) * r1];
    };
    const perim = 2 * dist + Math.PI * (r1 + r2);
    g.userData.avance = (s) => links.forEach((l, i) => { const p = pathAt(s + i * perim / n), q = pathAt(s + i * perim / n + .01); l.position.set(p[0], p[1], 0); l.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]); });
    g.userData.avance(0); return g;
  }

  // ---------- clutch centrífugo (despiece) ----------
  function clutch() {
    const g = new THREE.Group(), P = {};
    const drumG = new THREE.Group(); g.add(drumG); P.drum = drumG;     // tambor exterior (vaso abierto)
    const wall = mesh(new THREE.CylinderGeometry(.16, .16, .1, 32, 1, true), toon('#3E8FE0', { side: THREE.DoubleSide })); wall.rotation.x = Math.PI / 2; drumG.add(wall);
    const back = cyl(.16, .16, .015, '#2F6FB8', 32, 0, 0, -.05); back.rotation.x = Math.PI / 2; drumG.add(back);
    const sprocket = gear(10, .07, '#5A5F6A', .02); sprocket.position.z = -.085; drumG.add(sprocket); P.sprocket = sprocket;
    const shoesG = new THREE.Group(); g.add(shoesG); P.shoes = [];
    for (let i = 0; i < 3; i++) {
      const piv = new THREE.Group(); piv.rotation.z = i * Math.PI * 2 / 3; shoesG.add(piv);
      const sh = new THREE.Group(); piv.add(sh);
      const pad = mesh(new THREE.CylinderGeometry(.14, .14, .07, 16, 1, false, -.85, 1.7), toon('#F58A2E')); pad.rotation.x = Math.PI / 2; sh.add(pad);
      const inner = mesh(new THREE.CylinderGeometry(.11, .11, .07, 16, 1, false, -.85, 1.7), toon('#F58A2E')); inner.rotation.x = Math.PI / 2; sh.add(inner);
      const lin = mesh(new THREE.CylinderGeometry(.147, .147, .06, 16, 1, true, -.8, 1.6), toon('#4A2E1E', { side: THREE.DoubleSide })); lin.rotation.x = Math.PI / 2; sh.add(lin);
      P.shoes.push(sh);
    }
    const hub = gear(3, .06, '#B9C0C8', .07); g.add(hub); P.hub = hub;
    P.springs = [];
    for (let i = 0; i < 3; i++) {   // resortes entre zapatas (verde lima)
      const s = new THREE.Group(); s.rotation.z = i * Math.PI * 2 / 3 + Math.PI / 3; g.add(s);
      const curve = new THREE.CatmullRomCurve3(Array.from({ length: 40 }, (_, k) => new THREE.Vector3(Math.sin(k * 1.1) * .012, -.05 + k * .0025, Math.cos(k * 1.1) * .012)));
      const sp = mesh(new THREE.TubeGeometry(curve, 80, .004, 5, false), toon('#9BE53A')); sp.position.x = .118; s.add(sp); P.springs.push(sp);
    }
    // abre(k): 0 = zapatas adentro, 1 = pegadas al tambor.  despiece(k): separa las piezas en z
    P.abre = (k) => P.shoes.forEach(s => s.position.x = .0 + .012 * k);
    P.despiece = (k) => { drumG.position.z = .28 * k; shoesG.position.z = 0; hub.position.z = -.2 * k; P.springs.forEach(sp => sp.parent.position.z = .12 * k); };
    P.abre(0); g.userData = P; return g;
  }

  // ---------- go-kart (piezas que se agregan al carrito) ----------
  function kartKit() {
    const g = new THREE.Group(), P = {};
    const seat = new THREE.Group(); seat.add(box(.36, .06, .4, '#1F1F24', 0, 0, 0)); const sb = box(.06, .34, .4, '#1F1F24', -.17, .17, 0); sb.rotation.z = .25; seat.add(sb); seat.position.set(-.12, .3, 0); g.add(seat); P.seat = seat;
    const bumperF = new THREE.Group(); bumperF.add(box(.06, .1, .7, '#36D46A', 0, 0, 0)); for (const z of [-.25, .25]) bumperF.add(box(.2, .05, .05, '#36D46A', -.1, 0, z)); bumperF.position.set(.66, .2, 0); g.add(bumperF); P.bumperF = bumperF;
    const bumperR = bumperF.clone(); bumperR.rotation.y = Math.PI; bumperR.position.set(-.66, .2, 0); g.add(bumperR); P.bumperR = bumperR;
    const numT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill(); c.lineWidth = 14; c.strokeStyle = '#111'; c.stroke(); c.fillStyle = '#E33A2E'; c.font = '200px Anton, Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('7', 128, 140); });
    const plate = mesh(new THREE.PlaneGeometry(.26, .26), new THREE.MeshToonMaterial({ map: numT, gradientMap: grad, transparent: true }), .72, .42, 0); plate.rotation.y = Math.PI / 2; plate.rotation.x = 0; g.add(plate); P.plate = plate;
    const nose = box(.28, .14, .5, '#F5C431', .55, .34, 0); nose.rotation.z = -.35; g.add(nose); P.nose = nose;
    for (const z of [-.33, .33]) { const sp = box(.5, .06, .1, '#F5C431', 0, .18, z * 1.05); g.add(sp); }   // pontones
    g.userData = P; return g;
  }
  function volante() { const g = new THREE.Group(); const rim = torus(.11, .016, '#1F1F24', 24); g.add(rim); for (let i = 0; i < 3; i++) { const sp = box(.1, .016, .016, '#9AA2AC'); sp.rotation.z = i * Math.PI * 2 / 3; sp.position.set(Math.cos(i * 2.094) * .05, Math.sin(i * 2.094) * .05, 0); g.add(sp); } g.add(cyl(.025, .025, .03, '#E33A2E', 10)); g.children[g.children.length - 1].rotation.x = Math.PI / 2; return g; }
  function disco() { const g = new THREE.Group(), P = {}; const d = cyl(.11, .11, .016, toon('#C9CED6', { noCache: true }), 28); d.rotation.x = Math.PI / 2; g.add(d); P.disc = d; for (let i = 0; i < 8; i++) { const h = cyl(.008, .008, .02, '#555', 6, Math.cos(i * .785) * .07, Math.sin(i * .785) * .07, 0); h.rotation.x = Math.PI / 2; g.add(h); }
    const cal = new THREE.Group(); cal.position.set(0, .1, 0); g.add(cal); P.caliper = cal; cal.add(box(.09, .06, .07, '#3E8FE0', 0, 0, 0));
    P.pads = [-1, 1].map(s => { const p = box(.07, .035, .012, '#F58A2E', 0, -.02, s * .02); cal.add(p); return p; });
    P.aprieta = (k) => P.pads.forEach((p, i) => p.position.z = (i ? 1 : -1) * lerp(.026, .012, k));
    P.calor = (k) => P.disc.material.color.copy(new THREE.Color('#C9CED6').lerp(new THREE.Color('#FF4A1A'), k));
    P.aprieta(0); g.userData = P; return g; }

  // ---------- humo caricatura, chispas ----------
  function puffs(n, seed, color = '#F4F4F4') { const g = new THREE.Group(), r = rng(seed), list = []; for (let i = 0; i < n; i++) { const p = mesh(new THREE.IcosahedronGeometry(1, 1), toon(color)); p.castShadow = false; g.add(p); list.push({ p, ph: r(), dx: (r() - .5) * .4, dz: (r() - .5) * .4, s: .03 + r() * .03 }); }
    g.userData.update = (t, rate = 1, origin = new THREE.Vector3(), dir = new THREE.Vector3(-1, .6, 0)) => list.forEach(o => { const k = ((t * rate * .9 + o.ph) % 1); o.p.position.set(origin.x + dir.x * k * .8 + o.dx * k, origin.y + dir.y * k * .8 + k * .2, origin.z + dir.z * k * .8 + o.dz * k); o.p.scale.setScalar(o.s * (.4 + k * 1.6) * (rate > 0 ? 1 : 0)); });
    return g; }
  function sparks(n, seed) { const g = new THREE.Group(), r = rng(seed), list = []; for (let i = 0; i < n; i++) { const s = mesh(new THREE.BoxGeometry(.012, .012, .08), flat(i % 2 ? '#FFD23A' : '#FF8A1A')); s.castShadow = false; g.add(s); list.push({ s, ph: r(), vx: -.8 - r() * 1.2, vy: .6 + r() * .9, vz: (r() - .5) * .8 }); }
    g.userData.update = (t, on, origin) => list.forEach(o => { const k = ((t * 3 + o.ph) % 1); o.s.visible = on; o.s.position.set(origin.x + o.vx * k, origin.y + o.vy * k - 2.5 * k * k, origin.z + o.vz * k); o.s.lookAt(o.s.position.x + o.vx, o.s.position.y + o.vy - 5 * k, o.s.position.z + o.vz); });
    return g; }

  // ---------- render con contornos y rayos X ----------
  function crearRender(canvas, W, H) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    const rtC = new THREE.WebGLRenderTarget(W, H, { samples: 4 }); rtC.texture.encoding = THREE.sRGBEncoding;
    const rtN = new THREE.WebGLRenderTarget(W, H); rtN.depthTexture = new THREE.DepthTexture(W, H); rtN.depthTexture.type = THREE.UnsignedIntType;
    const normalMat = new THREE.MeshNormalMaterial();
    const post = new THREE.ShaderMaterial({
      uniforms: { tC: { value: rtC.texture }, tN: { value: rtN.texture }, tD: { value: rtN.depthTexture }, res: { value: new THREE.Vector2(W, H) }, near: { value: .05 }, far: { value: 400 }, thick: { value: 2.2 }, xray: { value: 0 }, flash: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: `uniform sampler2D tC, tN, tD; uniform vec2 res; uniform float near, far, thick, xray, flash; varying vec2 vUv;
        float lin(vec2 uv){ float z = texture2D(tD, uv).x; return (near * far) / ((far - near) * z - far) * -1.; }
        void main(){
          vec3 c = texture2D(tC, vUv).rgb;
          vec2 px = thick / res; float d0 = lin(vUv); vec3 n0 = texture2D(tN, vUv).rgb; float e = 0.;
          for (int i = 0; i < 4; i++) { vec2 o = i == 0 ? vec2(px.x, 0.) : i == 1 ? vec2(-px.x, 0.) : i == 2 ? vec2(0., px.y) : vec2(0., -px.y);
            float d1 = lin(vUv + o); vec3 n1 = texture2D(tN, vUv + o).rgb;
            e = max(e, step(.035 * min(d0, d1) + .002, abs(d0 - d1))); e = max(e, step(.32, length(n0 - n1))); }
          c = mix(c, vec3(.03, .03, .05), e);
          // rayos X: tinte azul y rejilla tenue
          vec3 xr = mix(vec3(.05, .12, .28), vec3(.35, .75, 1.0), smoothstep(.0, 1.2, dot(c, vec3(.33))));
          float grid = step(.985, fract(vUv.x * res.x / 36.)) + step(.985, fract(vUv.y * res.y / 36.));
          c = mix(c, xr + grid * .05, xray * .55);
          c = mix(c, vec3(1.), flash);
          gl_FragColor = vec4(c, 1.);
        }`, depthTest: false, depthWrite: false });
    const ps = new THREE.Scene(); ps.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post)); const pc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    function render(scene, camera, o = {}) {
      post.uniforms.near.value = camera.near; post.uniforms.far.value = camera.far; post.uniforms.xray.value = o.xray || 0; post.uniforms.flash.value = o.flash || 0;
      renderer.setRenderTarget(rtC); renderer.render(scene, camera);
      const hidden = []; scene.traverse(ob => { if (ob.userData.sinContorno && ob.visible) { ob.visible = false; hidden.push(ob); } });
      const bg = scene.background; scene.background = null; scene.overrideMaterial = normalMat; renderer.setClearColor(0x000000, 1);
      renderer.setRenderTarget(rtN); renderer.render(scene, camera);
      scene.overrideMaterial = null; scene.background = bg; hidden.forEach(ob => ob.visible = true);
      renderer.setRenderTarget(null); renderer.render(ps, pc);
    }
    return { renderer, render };
  }
  // rayos X: vuelve "fantasma" todo lo de la lista excepto las piezas sólidas
  function rayosX(objs, on, solidas = []) {
    const keep = new Set(); solidas.forEach(s => s.traverse(o => keep.add(o)));
    objs.forEach(root => root.traverse(o => { if (!o.isMesh || keep.has(o)) return;
      if (on) { if (!o.userData.matOrig) o.userData.matOrig = o.material; o.material = ghostMat; o.userData.sinContorno = true; o.castShadow = false; }
      else if (o.userData.matOrig) { o.material = o.userData.matOrig; o.userData.matOrig = null; o.userData.sinContorno = false; o.castShadow = true; } }));
  }
  const ghostMat = new THREE.MeshBasicMaterial({ color: '#8FE0FF', transparent: true, opacity: .16, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });

  window.K = { repaint, THREE, rng, clamp, lerp, prog, ease, easeOut, easeIn, backOut, toon, flat, mesh, box, cyl, ball, torus, canvasTex, gear, street, chavo, pose, carrito, motor, cinchos, cadena, clutch, kartKit, volante, disco, puffs, sparks, crearRender, rayosX };
})();
