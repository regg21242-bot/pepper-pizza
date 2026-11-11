/* Modelos low-poly compartidos por todas las escenas (protagonista, vecino, edificio, utilería).
   Se cargan una vez como script global: window.M.  Todo es determinista (sin Math.random). */
(function () {
  const THREE = window.THREE;
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .82, metalness: 0 }, o));
  const glow = (color) => new THREE.MeshBasicMaterial({ color, toneMapped: false });
  function box(w, h, d, m, x = 0, y = 0, z = 0) { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); g.position.set(x, y, z); g.castShadow = g.receiveShadow = true; return g; }
  function ball(r, m, x = 0, y = 0, z = 0, seg = 18) { const g = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * .7)), m); g.position.set(x, y, z); g.castShadow = true; return g; }
  function cyl(rt, rb, h, m, seg = 16) { const g = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); g.castShadow = true; return g; }

  const SKIN = mat('#D9A27A'), EYE = mat('#151018', { roughness: .3 });

  /* persona: {hoodie, pants, coat, cap, beard, hair, flashlight} → grupo con partes animables */
  function person(o = {}) {
    const g = new THREE.Group(), parts = {};
    const top = mat(o.top || '#F0A030'), pants = mat(o.pants || '#3A5A8C'), shoe = mat('#2A2A30');
    const long = !!o.coat;
    // piernas
    for (const s of [-1, 1]) {
      const leg = new THREE.Group(); leg.position.set(s * .17, .86, 0);
      leg.add(box(.24, .8, .26, pants, 0, -.4, 0)); leg.add(box(.26, .14, .36, shoe, 0, -.8, .05));
      g.add(leg); parts[s < 0 ? 'legL' : 'legR'] = leg;
    }
    // torso (sudadera o abrigo)
    const torso = box(.72, long ? 1.0 : .78, .42, top, 0, long ? 1.22 : 1.26, 0); g.add(torso);
    if (!long) { g.add(box(.5, .2, .06, mat(o.top ? o.top : '#E08E22'), 0, 1.06, .22)); }   // bolsa canguro
    if (long) { g.add(box(.06, .9, .02, mat('#3E2818'), 0, 1.2, .22)); }                    // cierre del abrigo
    // capucha / cuello
    g.add(box(.5, .16, .34, mat(o.top ? o.top : '#E08E22'), 0, 1.68, -.08));
    // brazos con hombro como pivote
    for (const s of [-1, 1]) {
      const arm = new THREE.Group(); arm.position.set(s * .46, 1.6, 0);
      arm.add(box(.2, .74, .24, top, 0, -.36, 0)); arm.add(ball(.11, SKIN, 0, -.78, 0, 10));
      g.add(arm); parts[s < 0 ? 'armL' : 'armR'] = arm;
    }
    // cabeza
    const head = new THREE.Group(); head.position.set(0, 2.02, 0); g.add(head); parts.head = head;
    head.add(ball(.32, SKIN, 0, 0, 0, 20));
    const eyes = [];
    for (const s of [-1, 1]) { const e = ball(.045, EYE, s * .11, .03, .29, 8); head.add(e); eyes.push(e); }
    // ojos cerrados (dormido): rayitas
    const shut = []; for (const s of [-1, 1]) { const l = box(.1, .018, .02, EYE, s * .11, .02, .31); l.visible = false; head.add(l); shut.push(l); }
    parts.sleep = (on) => { eyes.forEach(e => e.visible = !on); shut.forEach(l => l.visible = on); };
    if (o.hair) { const h = new THREE.Mesh(new THREE.SphereGeometry(.345, 20, 12, 0, Math.PI * 2, 0, Math.PI * .5), mat(o.hair)); h.position.set(0, .02, -.02); h.rotation.x = -.25; h.castShadow = true; head.add(h); }
    if (o.beard) { const b = ball(.24, mat(o.beard), 0, -.17, .12, 14); b.scale.set(1.15, .85, .8); head.add(b); head.add(box(.22, .05, .05, mat(o.beard), 0, -.05, .3)); }
    if (o.cap) { const c = new THREE.Mesh(new THREE.SphereGeometry(.35, 20, 10, 0, Math.PI * 2, 0, Math.PI * .5), mat(o.cap)); c.position.y = .06; c.castShadow = true; head.add(c);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .035, 16, 1, false, -Math.PI / 2, Math.PI), mat(o.cap)); brim.position.set(0, .09, .26); brim.scale.set(1.1, 1, 1.3); head.add(brim); }
    if (o.flashlight) {
      const fl = new THREE.Group(); fl.position.set(0, -.8, .1); parts.armR.add(fl);
      const body = cyl(.06, .06, .34, mat('#2A2A2A', { roughness: .4 }), 10); body.rotation.x = Math.PI / 2; body.position.z = .12; fl.add(body);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(.06, 12), glow('#FFF2C0')); lens.position.z = .3; fl.add(lens);
      const spot = new THREE.SpotLight('#FFE7B0', 6, 14, .45, .6, 1.2); spot.position.set(0, 0, .3); spot.castShadow = true;
      const tgt = new THREE.Object3D(); tgt.position.set(0, 0, 5); fl.add(tgt); spot.target = tgt; fl.add(spot);
      const beam = new THREE.Mesh(new THREE.ConeGeometry(.9, 4, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#FFE8B0', transparent: true, opacity: .05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      beam.rotation.x = -Math.PI / 2; beam.position.z = 2.3; fl.add(beam);
      parts.flash = fl; parts.spot = spot; parts.beam = beam;
    }
    g.userData = parts; return g;
  }
  const hero = () => person({ top: '#F2A033', pants: '#3A5A8C', hair: '#2A1C14' });
  const vecino = () => person({ top: '#5A3B26', pants: '#3A3A42', coat: true, cap: '#C8302A', beard: '#B9B5AE', flashlight: true });

  /* edificio con ventanas instanciadas (cada ventana con su color) */
  function building(w, h, d, seed, o = {}) {
    const g = new THREE.Group(), r = rng(seed);
    g.add(box(w, h, d, mat(o.color || '#1E2440', { roughness: .9 }), 0, h / 2, 0));
    g.add(box(w + .1, .12, d + .1, mat('#151A30'), 0, h + .06, 0));
    const cols = Math.max(1, Math.floor((w - .3) / .5)), rows = Math.max(1, Math.floor((h - .6) / .62));
    const faces = [[0, d / 2 + .01, 0], [Math.PI / 2, w / 2 + .01, 1]];
    let n = 0; const list = [];
    for (const [rot, off, side] of faces) { const c = side ? Math.max(1, Math.floor((d - .3) / .5)) : cols; for (let i = 0; i < c; i++) for (let j = 0; j < rows; j++) list.push({ rot, off, side, i, j, c }); }
    const win = new THREE.InstancedMesh(new THREE.PlaneGeometry(.28, .36), new THREE.MeshBasicMaterial({ toneMapped: false }), list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
    const base = [];
    list.forEach((it, k) => {
      const span = it.side ? d : w, x = -span / 2 + (span / it.c) * (it.i + .5), y = .55 + it.j * .62;
      if (it.side) pos.set(it.off, y, x); else pos.set(x, y, it.off);
      q.setFromEuler(new THREE.Euler(0, it.rot, 0)); m4.compose(pos, q, one); win.setMatrixAt(k, m4);
      const lit = r() < (o.lit ?? .45); base.push({ lit, ord: r() });
      win.setColorAt(k, new THREE.Color(lit ? '#FFC65A' : '#262C48'));
    });
    g.add(win);
    g.userData = { win, base,
      /* red: 0..1 — fracción de ventanas que ya se pusieron en rojo (en orden aleatorio fijo) */
      paint(red = 0, flicker = 0) {
        base.forEach((b, k) => { const isRed = b.ord < red; const c = isRed ? new THREE.Color('#FF2A2A').multiplyScalar(1 - flicker * .4 + .4 * flicker * Math.sin(k)) : new THREE.Color(b.lit ? '#FFC65A' : '#262C48'); win.setColorAt(k, c); });
        win.instanceColor.needsUpdate = true;
      } };
    g.userData.paint(0);
    return g;
  }
  /* cielo con degradado (azul marino → morado) */
  function sky(top = '#0B1236', bottom = '#4A2A6A') {
    const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { a: { value: new THREE.Color(top) }, b: { value: new THREE.Color(bottom) }, red: { value: 0 } },
      vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: 'uniform vec3 a; uniform vec3 b; uniform float red; varying vec3 p; void main(){ float k = smoothstep(-.1,.6,p.y); vec3 c = mix(b,a,k); c = mix(c, vec3(.45,.04,.08)*(1.-k*.6), red); gl_FragColor = vec4(c,1.); }' });
    const s = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), m); s.userData.mat = m; return s;
  }
  function stars(n = 400, seed = 9) {
    const r = rng(seed), pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const th = r() * Math.PI * 2, ph = r() * .5 + .08, R = 350; pos[i * 3] = Math.cos(th) * Math.cos(ph) * R; pos[i * 3 + 1] = Math.sin(ph) * R; pos[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * R; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: '#E8E8FF', size: 1.6, sizeAttenuation: false, transparent: true, opacity: .8 }));
  }
  /* celular: cuerpo + pantalla (textura de canvas que se puede redibujar) */
  function phone() {
    const g = new THREE.Group();
    g.add(box(.5, 1.0, .06, mat('#101018', { roughness: .35 })));
    const cv = document.createElement('canvas'); cv.width = 360; cv.height = 720;
    const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(.44, .92), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.z = .032; g.add(scr);
    g.userData = { cv, tex, ctx: cv.getContext('2d'), scr };
    return g;
  }

  /* cejas (para el primer plano dudando) */
  function addBrows(p) {
    const head = p.userData.head, brows = [];
    for (const s of [-1, 1]) { const b = box(.13, .028, .03, mat('#2A1C14'), s * .11, .12, .3); head.add(b); brows.push(b); }
    p.userData.brows = (worry) => brows.forEach((b, i) => { const s = i ? 1 : -1; b.rotation.z = -s * .35 * worry; b.position.y = .12 + .02 * worry; });
  }
  /* camioneta pickup low-poly */
  function truck(color = '#2E5A4A') {
    const g = new THREE.Group(), body = mat(color, { roughness: .5, metalness: .2 }), dark = mat('#14161E', { roughness: .4 });
    g.add(box(4.2, .7, 1.9, body, 0, .85, 0));                 // chasis
    g.add(box(1.9, .8, 1.8, body, .7, 1.6, 0));                 // cabina
    g.add(box(1.92, .55, 1.82, mat('#1A2A3A', { roughness: .15, metalness: .4 }), .7, 1.62, 0)); // vidrios
    g.add(box(2.0, .5, .08, body, -1.1, 1.45, .91)); g.add(box(2.0, .5, .08, body, -1.1, 1.45, -.91)); g.add(box(.08, .5, 1.9, body, -2.1, 1.45, 0)); // caja
    const wheels = [];
    for (const [x, z] of [[1.3, .95], [1.3, -.95], [-1.3, .95], [-1.3, -.95]]) { const w = cyl(.42, .42, .3, dark, 14); w.rotation.x = Math.PI / 2; w.position.set(x, .45, z); g.add(w); wheels.push(w); }
    for (const z of [.6, -.6]) { const h = box(.06, .18, .32, glow('#FFF4D0'), 2.11, .95, z); g.add(h); }
    for (const z of [.7, -.7]) g.add(box(.06, .2, .2, glow('#FF2A1A'), -2.11, .95, z));
    // dos cabecitas dentro de la cabina
    g.add(ball(.2, mat('#D9A27A'), .5, 1.75, .45, 12)); g.add(ball(.2, mat('#D9A27A'), .5, 1.75, -.45, 12));
    const capB = new THREE.Mesh(new THREE.SphereGeometry(.21, 12, 6, 0, Math.PI * 2, 0, Math.PI * .5), mat('#C8302A')); capB.position.set(.5, 1.8, -.45); g.add(capB);
    const beams = new THREE.SpotLight('#FFF0C8', 3, 30, .5, .5, 1); beams.position.set(2.2, 1, 0); const bt = new THREE.Object3D(); bt.position.set(12, 0, 0); g.add(bt); beams.target = bt; g.add(beams);
    g.userData = { wheels }; return g;
  }
  /* garrafón de agua azul */
  function jug(s = 1) {
    const g = new THREE.Group(), m = mat('#4AA8FF', { roughness: .15, transparent: true, opacity: .75 });
    const b = cyl(.32, .32, .7, m, 16); b.position.y = .35; g.add(b);
    const n = cyl(.12, .3, .2, m, 14); n.position.y = .8; g.add(n);
    const c = cyl(.1, .1, .1, mat('#1E5AC8'), 10); c.position.y = .95; g.add(c);
    g.scale.setScalar(s); return g;
  }
  /* reloj de pared: cara de canvas, manecillas que giran */
  function wallClock() {
    const g = new THREE.Group();
    const rim = cyl(.62, .62, .12, mat('#2A2A30', { roughness: .4 }), 32); rim.rotation.x = Math.PI / 2; g.add(rim);
    const cv = document.createElement('canvas'); cv.width = cv.height = 512; const c = cv.getContext('2d');
    c.fillStyle = '#F4EEDC'; c.fillRect(0, 0, 512, 512); c.fillStyle = '#1A1A20'; c.font = '700 64px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; c.fillText(String(i), 256 + Math.sin(a) * 190, 256 - Math.cos(a) * 190); }
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, r1 = i % 5 ? 236 : 222; c.lineWidth = i % 5 ? 3 : 7; c.beginPath(); c.moveTo(256 + Math.sin(a) * r1, 256 - Math.cos(a) * r1); c.lineTo(256 + Math.sin(a) * 248, 256 - Math.cos(a) * 248); c.stroke(); }
    const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
    const face = new THREE.Mesh(new THREE.CircleGeometry(.56, 48), new THREE.MeshStandardMaterial({ map: tex, roughness: .6 })); face.position.z = .065; g.add(face);
    const hand = (len, w, col, z) => { const h = new THREE.Group(); const m = box(w, len, .02, mat(col), 0, len / 2 - .05, 0); m.castShadow = false; h.add(m); h.position.z = z; g.add(h); return h; };
    const hh = hand(.3, .05, '#1A1A20', .08), mh = hand(.44, .035, '#1A1A20', .09), sh = hand(.48, .014, '#D02020', .1);
    g.add(ball(.035, mat('#D02020'), 0, 0, .11, 8));
    g.userData.set = (h, m, sec) => { hh.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; mh.rotation.z = -(m + sec / 60) / 60 * Math.PI * 2; sh.rotation.z = -Math.floor(sec) / 60 * Math.PI * 2; };
    return g;
  }
  /* mano (sin dedos detallados) sosteniendo el celular, con manga de sudadera */
  function handPhone() {
    const g = new THREE.Group(), ph = phone(); g.add(ph);
    const skin = mat('#D9A27A');
    g.add(box(.62, .5, .16, skin, 0, -.42, -.1));                 // palma detrás
    const thumb = box(.14, .34, .14, skin, -.3, -.2, .03); thumb.rotation.z = -.5; g.add(thumb);
    for (let i = 0; i < 3; i++) g.add(box(.1, .14, .1, skin, .3, -.1 - i * .17, .0));   // dedos asomando al borde
    g.add(box(.7, .6, .5, mat('#F2A033'), 0, -.95, -.15));        // manga
    g.userData = ph.userData; return g;
  }
  /* portón con barrotes y candado */
  function gate() {
    const g = new THREE.Group(), iron = mat('#3A3A44', { metalness: .6, roughness: .45 });
    const leaf = new THREE.Group(); g.add(leaf);
    leaf.add(box(2.6, .1, .1, iron, 1.3, 2.2, 0)); leaf.add(box(2.6, .1, .1, iron, 1.3, .25, 0));
    for (let i = 0; i <= 10; i++) leaf.add(box(.06, 2.0, .06, iron, .1 + i * .25, 1.22, 0));
    const lock = new THREE.Group(); lock.position.set(2.62, 1.2, .1); leaf.add(lock);
    lock.add(box(.22, .26, .1, mat('#C8A040', { metalness: .7, roughness: .3 }), 0, 0, 0));
    const sh = new THREE.Mesh(new THREE.TorusGeometry(.08, .022, 8, 16, Math.PI), mat('#B8B8C0', { metalness: .8, roughness: .3 })); sh.position.y = .14; lock.add(sh);
    g.userData = { leaf, lock, shackle: sh }; return g;
  }
  /* casita del cerro */
  function hut() {
    const g = new THREE.Group();
    g.add(box(4, 2.6, 3.4, mat('#8A6A4A'), 0, 1.3, 0));
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 3.1, 1.4, 4), mat('#5A2A22')); roof.rotation.y = Math.PI / 4; roof.position.y = 3.3; roof.scale.set(1, 1, .85); roof.castShadow = true; g.add(roof);
    g.add(box(.9, 1.8, .06, mat('#4A3020'), -.8, .9, 1.72));
    g.add(box(.9, .7, .06, glow('#FFC65A'), .9, 1.5, 1.72));
    return g;
  }
  window.M = { THREE, rng, mat, glow, box, ball, cyl, person, hero, vecino, building, sky, stars, phone, addBrows, truck, jug, wallClock, handPhone, gate, hut };
})();
