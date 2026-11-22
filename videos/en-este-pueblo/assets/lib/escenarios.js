/* "En este pueblo" · escenarios 3D de bloques (unidades = metros; los personajes miden ≈ 1.8 m).
   Uso: const E = window.PUEBLO_E; const s = E.crear('pueblo'|'fiesta'|'alcalde'|'cancha'|'cancha_dia'|'partido'|'cuarto_kevin'|'cuarto_linda'|'cuarto_abuela'|'fiesta_final');
        s.scene, s.cam (cámara del fotograma de prueba), s.post (opciones para POST.render), s.anima(t), s.actores {nombre: grupo} */
(function () {
  const THREE = window.THREE, P = window.PUEBLO_P; if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
  const { rbox, M, tex } = P;
  // ---------- utilidades ----------
  let semilla = 7; const rnd = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; }; const sembrar = (s) => { semilla = s; };
  const MC = {}; const mat = (c, o = {}) => { const k = c + JSON.stringify(o, (kk, v) => (v && v.isTexture ? v.uuid : v)); if (!MC[k]) MC[k] = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .62, metalness: 0 }, o)); return MC[k]; };
  const luz = (c, i = 1.6) => mat(c, { emissive: c, emissiveIntensity: i, roughness: .4 });
  const GC = {}; const geoCaja = (w, h, d, r) => { const k = [w, h, d, r].map(v => (+v).toFixed(3)).join(); if (!GC[k]) GC[k] = rbox(w, h, d, r, 0, 2); return GC[k]; };
  const caja = (w, h, d, m, x = 0, y = 0, z = 0, r) => M(geoCaja(w, h, d, r != null ? r : Math.min(w, h, d) * .06), m, x, y, z);
  const cil = (rt, rb, h, m, x = 0, y = 0, z = 0, seg = 14) => M(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z);
  const esf = (r, m, x = 0, y = 0, z = 0, seg = 14) => M(new THREE.SphereGeometry(r, seg, Math.max(6, seg * .7 | 0)), m, x, y, z);
  const rep = (t, rx, ry) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  const ruido = (base, alt, n = 2200, tam = 2, s = 3) => tex(256, 256, (x, w, h) => { sembrar(s); x.fillStyle = base; x.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { x.fillStyle = alt[i % alt.length]; x.globalAlpha = .25 + rnd() * .35; x.fillRect(rnd() * w, rnd() * h, tam, tam); } x.globalAlpha = 1; });
  const madera = (base = '#8A5A36', s = 5) => tex(256, 256, (x, w, h) => { sembrar(s); x.fillStyle = base; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(40,20,5,${.05 + rnd() * .08})`; x.lineWidth = 1 + rnd() * 2; x.beginPath(); const y0 = rnd() * h; x.moveTo(0, y0); x.bezierCurveTo(w * .3, y0 + rnd() * 8 - 4, w * .6, y0 + rnd() * 8 - 4, w, y0); x.stroke(); } });
  const tablones = (base, lin, n = 8, vertical = true) => tex(256, 256, (x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h); x.fillStyle = lin; for (let i = 1; i < n; i++) vertical ? x.fillRect(i * w / n - 2, 0, 4, h) : x.fillRect(0, i * h / n - 2, w, 4); });
  const ladrillos = (base = '#7A4A36', junta = '#B9A48E') => tex(256, 256, (x, w, h) => { sembrar(11); x.fillStyle = junta; x.fillRect(0, 0, w, h); const bw = 32, bh = 14; for (let r = 0; r * bh < h; r++) for (let c = -1; c * bw < w; c++) { const v = (rnd() - .5) * 18; const col = new THREE.Color(base); col.offsetHSL(0, 0, v / 255); x.fillStyle = '#' + col.getHexString(); x.fillRect(c * bw + (r % 2) * bw / 2 + 1.5, r * bh + 1.5, bw - 3, bh - 3); } });
  const radial = (c0 = 'rgba(255,255,255,1)') => tex(128, 128, (x, w, h) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, c0); g.addColorStop(.45, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const TRAD = radial();
  // círculo de luz en el piso (luz falsa, aditiva)
  const charco = (r, col, int = .5, x = 0, z = 0, y = .03) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: TRAD, color: new THREE.Color(col).multiplyScalar(int), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); return m; };
  const halo = (r, col, int = 1) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TRAD, color: new THREE.Color(col).multiplyScalar(int), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.set(r * 2, r * 2, 1); return s; };
  const plano = (w, d, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); o.rotation.x = -Math.PI / 2; o.position.set(x, y, z); o.receiveShadow = true; return o; };
  const G = () => new THREE.Group();
  const en = (o, x = 0, y = 0, z = 0, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return o; };

  // ---------- cielo, estrellas, luna, colinas ----------
  function cielo(arriba, horizonte, k = 1) {
    const u = { a: { value: new THREE.Color(arriba).multiplyScalar(k) }, b: { value: new THREE.Color(horizonte).multiplyScalar(k) } };
    const m = new THREE.ShaderMaterial({ uniforms: u, side: THREE.BackSide, depthWrite: false, fog: false, vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: 'uniform vec3 a, b; varying vec3 vP; void main(){ float t = clamp(vP.y * 2.2, 0., 1.); gl_FragColor = vec4(mix(b, a, pow(t, .8)), 1.); }' });
    const s = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), m); s.renderOrder = -10; s.frustumCulled = false; return s;
  }
  function estrellas(n = 700) { sembrar(21); const p = [], c = []; for (let i = 0; i < n; i++) { const az = rnd() * Math.PI * 2, el = .06 + Math.pow(rnd(), .7) * 1.4, r = 850; p.push(Math.cos(el) * Math.cos(az) * r, Math.sin(el) * r, Math.cos(el) * Math.sin(az) * r); const b = .5 + rnd() * 1.4; c.push(b, b, b * 1.05); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
    const o = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false })); o.frustumCulled = false; o.userData.col = c.slice();
    o.anima = (t) => { const a = g.attributes.color; for (let i = 0; i < n; i += 9) { const f = .55 + .45 * Math.sin(t * 2.3 + i); a.setXYZ(i, o.userData.col[i * 3] * f, o.userData.col[i * 3 + 1] * f, o.userData.col[i * 3 + 2] * f); } a.needsUpdate = true; }; return o; }
  function luna(dir, dist = 700, r = 26) { const g = G(); const d = new THREE.Vector3(...dir).normalize().multiplyScalar(dist); g.position.copy(d);
    const disco = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.6, 2.6), fog: false })); g.add(disco);
    const h = halo(r * 3.2, '#C9D6FF', .55); h.material.fog = false; g.add(h); g.lookAt(0, 0, 0); return g; }
  function colinas(capas, z0 = -120, ancho = 520) { const g = G(); sembrar(5); capas.forEach((col, k) => { const m = mat(col, { roughness: 1 });
      for (let i = 0; i < 9; i++) { const r = 60 + rnd() * 60; const o = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 10), m); o.scale.set(1.5, .3 + k * .05 + rnd() * .12, 1); o.position.set(-ancho / 2 + i * ancho / 8 + rnd() * 30, -4, z0 - k * 90 - rnd() * 20); g.add(o); } }); return g; }

  // ---------- piezas del pueblo ----------
  const PAL = { techo: '#2A2D3A', techoRojo: '#B23A2E', ventana: '#FFD98A', marco: '#F4F2EE', farol: '#FFE3A8' };
  function techo(w, d, h, col) { const s = new THREE.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.lineTo(-d / 2, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false }); geo.translate(0, 0, -w / 2); geo.rotateY(Math.PI / 2); return M(geo, mat(col, { roughness: .8, flatShading: true })); }
  function ventana(o = {}) { const g = G(), w = o.w || 1.0, h = o.h || 1.25;
    g.add(caja(w + .16, h + .16, .14, mat(PAL.marco), 0, 0, 0, .03));
    const enc = o.apagada ? mat('#2A3350', { roughness: .2 }) : luz(o.col || PAL.ventana, o.int || 1.5); g.add(caja(w, h, .16, enc, 0, 0, .01, .01));
    if (o.cruz) { g.add(caja(.06, h, .2, mat(PAL.marco), 0, 0, .02, .01)); g.add(caja(w, .06, .2, mat(PAL.marco), 0, 0, .02, .01)); }
    if (o.persianas) for (const s of [-1, 1]) g.add(caja(w * .45, h + .1, .08, mat(o.persianas), s * (w / 2 + w * .25 + .1), 0, 0, .02));
    if (o.silueta) { const sm2 = new THREE.MeshBasicMaterial({ color: '#0B0B12' }); const sil = G(); sil.add(new THREE.Mesh(new THREE.PlaneGeometry(w * .42, h * .42).translate(0, -h * .3, 0), sm2)); sil.add(new THREE.Mesh(new THREE.CircleGeometry(w * .14, 20).translate(0, -h * .02, 0), sm2)); sil.position.set((o.silX || 0) * w * .2, 0, .095); g.add(sil); }
    return g; }
  /* casa: o = { w, d, pisos, col, map, techoCol, columnas, persianas, cruz, silueta, apagadas, chimenea } (fachada hacia +z) */
  function casa(o) { const g = G(); const w = o.w || 7, d = o.d || 6, ph = 2.9, H = ph * (o.pisos || 1);
    const mf = o.map ? mat('#FFFFFF', { map: o.map, roughness: .75 }) : mat(o.col, { roughness: .7 }); const mlado = mat(o.colLado || o.col, { roughness: .7 });
    const cuerpo = caja(w, H, d, mf, 0, H / 2 + .25, 0, .08); g.add(cuerpo); if (o.map) { const l = caja(w - .02, H - .02, d - .02, mlado, 0, H / 2 + .25, -.02, .08); g.add(l); }
    g.add(caja(w + .3, .3, d + .3, mat('#8E8A86', { roughness: .9 }), 0, .15, 0, .04)); // cimiento
    const tr = techo(w + .7, d + .9, Math.min(3.2, d * .45), o.techoCol || PAL.techo); tr.position.y = H + .25; g.add(tr);
    g.add(caja(w + .7, .18, .2, mat(o.techoCol || PAL.techo), 0, H + .3, d / 2 + .4, .03));
    if (o.chimenea !== false) g.add(caja(.75, 2.4, .75, mat('#FFFFFF', { map: TEX.ladrillo, roughness: .85 }), w * .28, H + 1.6, -d * .12, .04));
    sembrar((o.semilla || 1) * 13);
    const nv = Math.max(2, Math.round(w / 2.6));
    for (let p = 0; p < (o.pisos || 1); p++) for (let i = 0; i < nv; i++) { const x = -w / 2 + (i + .5) * w / nv; if (p === 0 && i === Math.floor(nv / 2)) continue;
      const v = ventana({ cruz: o.cruz, persianas: o.persianas, apagada: o.apagadas && rnd() < o.apagadas, silueta: o.silueta && rnd() < o.silueta, silX: rnd() - .5, int: 1.2 + rnd() * .6 }); v.position.set(x, .25 + p * ph + ph * .55, d / 2 + .02); g.add(v); }
    // puerta, porche, escalones y caminito
    const xd = -w / 2 + (Math.floor(nv / 2) + .5) * w / nv;
    g.add(caja(1.05, 2.15, .14, mat(o.puerta || '#5A3A28', { roughness: .6 }), xd, 1.33, d / 2 + .04, .03)); g.add(caja(.08, .08, .1, luz('#FFE3A8', 2), xd + .35, 1.3, d / 2 + .13, .02));
    g.add(luzPuerta(xd, 2.7, d / 2 + .2));
    g.add(caja(2.4, .2, 1.4, mat('#B9B4AE', { roughness: .9 }), xd, .15, d / 2 + .75, .03)); g.add(caja(2.0, .12, .5, mat('#A9A4A0'), xd, .06, d / 2 + 1.6, .03));
    g.add(caja(1.1, .03, .6, mat('#9A4A3A', { roughness: 1 }), xd, .27, d / 2 + .7, .01));
    for (let k = 0; k < 4; k++) g.add(cil(.32, .32, .05, mat('#8F8B88', { roughness: 1 }), xd + (k % 2 ? .12 : -.12), .03, d / 2 + 2.2 + k * .75, 10));
    if (o.columnas) { for (const s of [-1, 1]) g.add(cil(.13, .15, 2.6, mat('#F6F4F0'), xd + s * 1.05, 1.55, d / 2 + 1.3, 14)); g.add(caja(2.8, .2, 1.6, mat('#F6F4F0'), xd, 2.9, d / 2 + .8, .04)); }
    return g; }
  function luzPuerta(x, y, z) { const g = G(); g.add(caja(.18, .24, .14, luz('#FFE3A8', 2.2), x - .8, y - .7, z, .03)); const h = halo(.6, '#FFC878', .35); h.position.set(x - .8, y - .7, z + .1); g.add(h); return g; }
  function arbol(s = 1, col = '#4C8A3C') { const g = G(); g.add(caja(.4 * s, 1.8 * s, .4 * s, mat('#6B4A2E', { map: TEX.madera }), 0, .9 * s, 0, .03));
    const c = M(rbox(2.4 * s, 2.2 * s, 2.4 * s, .75 * s, 0, 3), mat(col, { roughness: .9, map: TEX.pasto })); c.position.y = 2.7 * s; g.add(c);
    const c2 = M(rbox(1.5 * s, 1.3 * s, 1.5 * s, .5 * s, 0, 3), mat(col, { roughness: .9, map: TEX.pasto })); c2.position.set(.3 * s, 3.9 * s, -.1 * s); g.add(c2); return g; }
  const arbusto = (s = 1) => M(rbox(1.2 * s, .8 * s, 1 * s, .35 * s, 0, 2), mat('#3F7A34', { roughness: .95, map: TEX.pasto }), 0, .4 * s, 0);
  function farol(lado = 1, conLuz = false) { const g = G(); const n = mat('#15161A', { roughness: .4 }); g.add(cil(.06, .08, 4.3, n, 0, 2.15, 0, 10)); g.add(caja(1.1, .08, .08, n, lado * .5, 4.25, 0, .02));
    g.add(caja(.42, .14, .42, n, lado * 1.0, 4.18, 0, .03)); g.add(caja(.34, .1, .34, luz('#FFF2D6', 3), lado * 1.0, 4.08, 0, .02)); const h = halo(.9, PAL.farol, .5); h.position.set(lado * 1.0, 3.95, 0); g.add(h);
    g.add(charco(3.2, PAL.farol, .55, lado * 1.0, 0)); if (conLuz) { const l = new THREE.PointLight(PAL.farol, 2.2, 11, 2); l.position.set(lado * 1.0, 3.8, 0); g.add(l); } return g; }
  function buzon() { const g = G(); g.add(caja(.1, 1.0, .1, mat('#5A3A28'), 0, .5, 0, .02)); g.add(caja(.32, .32, .55, mat('#2D3F8F', { roughness: .4 }), 0, 1.15, 0, .1)); g.add(caja(.04, .2, .04, mat('#D9423A'), .18, 1.25, .1, .01)); return g; }
  function hidrante() { const g = G(), r = mat('#C8302B', { roughness: .4 }); g.add(cil(.16, .18, .55, r, 0, .28, 0)); g.add(esf(.16, r, 0, .56, 0)); { const br = cil(.06, .06, .42, r, 0, .4, 0); br.rotation.z = Math.PI / 2; g.add(br); } g.add(cil(.2, .2, .06, r, 0, .05, 0)); return g; }
  function coche(col, tipo = 'coche', faros = true) { const g = G(); const L = tipo === 'camioneta' ? 4.6 : 4.0, m = mat(col, { roughness: .35 });
    g.add(caja(1.9, .75, L, m, 0, .72, 0, .12)); const cab = caja(1.72, .7, tipo === 'camioneta' ? 2.9 : 2.1, m, 0, 1.42, tipo === 'camioneta' ? -.5 : -.2, .14); g.add(cab);
    const vid = mat('#1A2232', { roughness: .15 }); g.add(caja(1.5, .5, .06, vid, 0, 1.45, (tipo === 'camioneta' ? .97 : .87), .02)); for (const s of [-1, 1]) g.add(caja(.05, .48, tipo === 'camioneta' ? 2.5 : 1.7, vid, s * .87, 1.45, tipo === 'camioneta' ? -.5 : -.2, .02));
    const ll = mat('#141416', { roughness: .7 }), rin = mat('#B8BCC4', { roughness: .3 }); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = cil(.38, .38, .3, ll, sx * .9, .38, sz * L * .31, 16); w.rotation.z = Math.PI / 2; g.add(w); const r2 = cil(.18, .18, .32, rin, sx * .9, .38, sz * L * .31, 12); r2.rotation.z = Math.PI / 2; g.add(r2); }
    for (const s of [-1, 1]) { g.add(caja(.36, .18, .06, faros ? luz('#FFF4D8', 3) : mat('#EDEDED'), s * .62, .85, L / 2 + .01, .03)); g.add(caja(.3, .14, .06, luz('#E0201C', faros ? 1.6 : .3), s * .66, .85, -L / 2 - .01, .03)); }
    if (faros) { const c = charco(3.5, '#FFF0C8', .35, 0, L / 2 + 3); c.scale.set(.7, 1.4, 1); g.add(c); } return g; }
  function bandera(col = '#2F5FC8') { const g = G(); g.add(cil(.07, .09, 9, mat('#D9DCE2', { roughness: .3, metalness: .3 }), 0, 4.5, 0, 10)); g.add(esf(.14, mat('#E3B53A', { metalness: .4, roughness: .3 }), 0, 9.05, 0));
    const t = new THREE.PlaneGeometry(2.6, 1.6, 12, 1); const bm = new THREE.Mesh(t, mat(col, { side: THREE.DoubleSide, roughness: .8 })); bm.position.set(1.35, 8.1, 0); bm.castShadow = true; g.add(bm);
    const p0 = t.attributes.position.array.slice(); g.anima = (tt) => { const a = t.attributes.position; for (let i = 0; i < a.count; i++) { const x = p0[i * 3] + 1.3; a.setZ(i, Math.sin(x * 2.4 - tt * 5) * .12 * x / 2.6); } a.needsUpdate = true; t.computeVertexNormals(); }; return g; }
  function barda(largo, alto = 2, col = '#8A5A36', blanca = false) { const g = G(); const m = blanca ? mat('#FFFFFF', { map: TEX.tablonBlanco, roughness: .7 }) : mat('#FFFFFF', { map: TEX.tablonCafe, roughness: .8 });
    const t = blanca ? TEX.tablonBlanco : TEX.tablonCafe; const pan = caja(largo, alto, .12, mat('#FFFFFF', { map: rep(t.clone(), largo / 2.5, 1), roughness: .8 }), 0, alto / 2, 0, .02); pan.material.map.needsUpdate = true; g.add(pan);
    const pm = mat(blanca ? '#9EA2AA' : '#6B4426'); for (let x = -largo / 2; x <= largo / 2 + .01; x += 2.5) g.add(caja(.18, alto + .2, .2, pm, x, (alto + .2) / 2, 0, .03)); return g; }
  // tira de banderines (y pompones opcionales) entre dos puntos, con caída
  const COLB = ['#E8212B', '#F28A2E', '#F2C230', '#4CB050', '#2F6FE0', '#8A4FC8'];
  function banderines(a, b, caida = .8, n = 18, pompones = false, esc = 1) { const g = G(); const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const pts = [];
    for (let i = 0; i <= 40; i++) { const u = i / 40; const p = A.clone().lerp(B, u); p.y -= caida * 4 * u * (1 - u); pts.push(p); }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#F4F4F4' })));
    const dir = B.clone().sub(A).setY(0).normalize(); const ang = Math.atan2(dir.x, dir.z) - Math.PI / 2;
    for (let i = 1; i < n; i++) { const u = i / n; const p = A.clone().lerp(B, u); p.y -= caida * 4 * u * (1 - u);
      const f = caja(.36 * esc, .46 * esc, .03, mat(COLB[i % 6], { roughness: .7, side: THREE.DoubleSide }), 0, 0, 0, .01); f.position.copy(p); f.position.y -= .25 * esc; f.rotation.y = ang; g.add(f);
      if (pompones) { const q = A.clone().lerp(B, u + .5 / n); q.y -= caida * 4 * (u + .5 / n) * (1 - u - .5 / n) + .06; g.add(esf(.07 * esc, mat('#FFFFFF', { roughness: .9 }), q.x, q.y, q.z, 8)); } } return g; }
  function foquitos(a, b, caida = 1.0, n = 22) { const g = G(); const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const pts = [];
    for (let i = 0; i <= 40; i++) { const u = i / 40; const p = A.clone().lerp(B, u); p.y -= caida * 4 * u * (1 - u); pts.push(p); }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#202020' }))); const fm = luz('#FFF6E0', 3.2);
    for (let i = 1; i < n; i++) { const u = i / n; const p = A.clone().lerp(B, u); p.y -= caida * 4 * u * (1 - u) + .12; g.add(esf(.085, fm, p.x, p.y, p.z, 10)); const h = halo(.45, '#FFE8C0', .3); h.position.copy(p); g.add(h); } return g; }
  function globo(col, alto = 2.2) { const g = G(); const b = esf(.32, mat(col, { roughness: .25, emissive: col, emissiveIntensity: .12 }), 0, alto, 0, 16); b.scale.set(1, 1.18, 1); g.add(b); g.add(cil(.04, .02, .08, mat(col), 0, alto - .4, 0, 8));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, alto - .44, 0), new THREE.Vector3(.05, alto * .5, .02), new THREE.Vector3(0, 0, 0)]), new THREE.LineBasicMaterial({ color: '#FFFFFF' }))); return g; }
  function silla(col) { const g = G(), m = mat(col, { roughness: .5 }); g.add(caja(.5, .08, .5, m, 0, .48, 0, .02)); g.add(caja(.5, .55, .08, m, 0, .78, -.21, .02)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(caja(.06, .46, .06, m, sx * .2, .23, sz * .2, .01)); return g; }
  function pizza(r = .26) { const g = G(); g.add(cil(r, r, .04, mat('#E3B26A', { roughness: .8 }), 0, .02, 0, 24)); g.add(cil(r * .88, r * .88, .045, mat('#F2C94C', { roughness: .7 }), 0, .03, 0, 24)); sembrar(31);
    for (let i = 0; i < 7; i++) { const a = i * 2.4, rr = r * (.2 + rnd() * .55); g.add(cil(.045, .045, .05, mat('#C8352B', { roughness: .6 }), Math.cos(a) * rr, .045, Math.sin(a) * rr, 10)); } return g; }
  function pastel(col = '#F28DB2') { const g = G(); g.add(cil(.2, .2, .2, mat('#FFF4E8'), 0, .1, 0, 20)); g.add(cil(.205, .205, .05, mat(col), 0, .19, 0, 20)); g.add(cil(.13, .13, .14, mat('#FFF4E8'), 0, .28, 0, 18)); g.add(cil(.135, .135, .04, mat(col), 0, .34, 0, 18)); g.add(esf(.03, mat('#E8212B'), 0, .38, 0, 8)); return g; }
  function vaso(col) { return cil(.045, .035, .12, mat(col, { roughness: .4 }), 0, .06, 0, 10); }
  function mesaLarga(L = 4) { const g = G(); g.add(caja(L, .08, 1.0, mat('#F6F6F2', { roughness: .5 }), 0, .78, 0, .02)); g.add(caja(L - .02, .3, 1.0, mat('#FFFFFF', { roughness: .9 }), 0, .62, 0, .02));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(caja(.07, .74, .07, mat('#DADAD6'), sx * (L / 2 - .15), .37, sz * .4, .01)); return g; }
  function dona(col) { const t = M(new THREE.TorusGeometry(.45, .2, 12, 24), mat(col, { roughness: .3 })); t.rotation.x = -Math.PI / 2; return t; }
  function guitarra() { const g = G(), m = mat('#8A5530', { roughness: .4 }); const c1 = cil(.2, .2, .1, m, 0, 0, 0, 20); c1.rotation.x = Math.PI / 2; g.add(c1); const c2 = cil(.15, .15, .1, m, 0, .25, 0, 20); c2.rotation.x = Math.PI / 2; g.add(c2);
    const hoyo = cil(.06, .06, .11, mat('#1A120C'), 0, .1, .0, 14); hoyo.rotation.x = Math.PI / 2; g.add(hoyo); g.add(caja(.07, .65, .05, mat('#4A2E1A'), 0, .65, 0, .01)); g.add(caja(.11, .16, .05, mat('#2A1A10'), 0, 1.02, 0, .01)); return g; }
  function lampara(col = '#FFD9A0', conLuz = true, int = 2.2) { const g = G(); g.add(cil(.07, .1, .35, mat('#3A2A20'), 0, .17, 0, 10)); g.add(cil(.13, .2, .24, luz(col, 1.6), 0, .45, 0, 14));
    const h = halo(.6, col, .45); h.position.y = .45; g.add(h); if (conLuz) { const l = new THREE.PointLight(col, int, 6, 1.6); l.position.y = .5; l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -.002; g.add(l); } return g; }

  // ---------- texturas compartidas ----------
  const TEX = {};
  function texturas() { if (TEX.listo) return; TEX.listo = 1;
    TEX.pasto = ruido('#FFFFFF', ['#D8E8D0', '#C8DCC0', '#E8F4E4'], 2600, 3, 2); TEX.asfalto = rep(ruido('#34363C', ['#2C2E33', '#3E4047', '#45474D'], 4000, 2, 4), 2, 40); TEX.banqueta = rep(ruido('#A3A6AC', ['#9A9DA3', '#B0B3B8'], 2600, 2, 6), 1, 30);
    TEX.concreto = ruido('#BFC2C6', ['#B5B8BC', '#CACDD1'], 3000, 2, 8); TEX.madera = madera(); TEX.ladrillo = rep(ladrillos('#8A3A2A'), 1, 1); TEX.ladrilloCafe = ladrillos('#7A4A36');
    TEX.tablonAzul = tablones('#2F57B8', '#25469A', 10); TEX.tablonGris = tablones('#8E8C86', '#77756F', 9, false); TEX.tablonCafe = tablones('#8A5A36', '#6E4428', 10); TEX.tablonBlanco = tablones('#F4F4F2', '#D2D4D8', 10);
    TEX.pisoMadera = rep(tablones('#9A6A42', '#7A4E2E', 6, false), 3, 3); }

  // ---------- el pueblo (calle principal a lo largo de z) ----------
  const ESTILOS = [
    { col: '#2F57B8', mapa: 'tablonAzul', pisos: 2, w: 7.5 }, { col: '#A8322B', pisos: 1, w: 7, persianas: '#F4F2EE' }, { col: '#B98BB8', pisos: 2, w: 7 },
    { col: '#E8C552', pisos: 1, w: 7.5, techoCol: PAL.techoRojo, cruz: true }, { col: '#F2F0EA', pisos: 2, w: 8, columnas: true, cruz: true }, { col: '#8E8C86', mapa: 'tablonGris', pisos: 1, w: 7 },
    { col: '#7A4A36', mapa: 'ladrilloCafe', pisos: 2, w: 7.5 }, { col: '#6FC2B0', pisos: 1, w: 7, persianas: '#2F6F64' }, { col: '#5B7FD0', pisos: 1, w: 6.5, techoCol: PAL.techoRojo }, { col: '#D98AA0', pisos: 2, w: 7, cruz: true },
  ];
  function casaEstilo(i, extra = {}) { const e = ESTILOS[i % ESTILOS.length]; return casa(Object.assign({ col: e.col, map: e.mapa ? TEX[e.mapa] : null, pisos: e.pisos, w: e.w, d: 6.5, techoCol: e.techoCol, columnas: e.columnas, persianas: e.persianas, cruz: e.cruz, semilla: i + 1, apagadas: .25 }, extra)); }
  function pueblo(o = {}) { const g = G(); const z0 = o.z0 != null ? o.z0 : 30, z1 = o.z1 != null ? o.z1 : -150, L = z0 - z1, zc = (z0 + z1) / 2;
    g.add(plano(400, 400, mat('#FFFFFF', { color: o.pasto || '#3E6E34', map: rep(TEX.pasto.clone(), 60, 60), roughness: 1 }), 0, -.01, -100)); g.children[0].material.map.needsUpdate = true;
    g.add(plano(7, L, mat('#FFFFFF', { map: rep(TEX.asfalto.clone(), 2, L / 4), roughness: .9 }), 0, 0, zc)); g.children[1].material.map.needsUpdate = true;
    for (let z = z0 - 2; z > z1; z -= 6) g.add(caja(.16, .02, 3.0, mat('#E3B53A', { roughness: .6 }), 0, .015, z - 1.5, .005));
    for (const s of [-1, 1]) { g.add(caja(2.4, .18, L, mat('#FFFFFF', { map: rep(TEX.banqueta.clone(), 1, L / 3), roughness: .9 }), s * 4.7, .09, zc, .03)); g.add(caja(.2, .22, L, mat('#B8BBC0'), s * 3.55, .11, zc, .03)); }
    let k = o.semilla || 0; const sep = 10.5;
    for (const s of [-1, 1]) for (let z = z0 - 6, i = 0; z > z1 + 5; z -= sep, i++) { if (o.hueco && o.hueco(s, z)) continue; const c = casaEstilo(k++ * 3 + (s > 0 ? 1 : 0) + i, { silueta: o.siluetas || 0 }); c.position.set(s * 13.5, 0, z); c.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(c);
      if (i % 2 === 0) { const a = arbol(.9 + (i % 3) * .1, i % 2 ? '#4C8A3C' : '#3F7E36'); a.position.set(s * 8.2, 0, z - 5); g.add(a); } else { const b = arbusto(1); b.position.set(s * 8.4, 0, z - 4.5); g.add(b); }
      if (i % 3 === 1) { const b = buzon(); b.position.set(s * 6.3, 0, z + 2.2); g.add(b); }
      const bd = barda(6, 1.6, '#8A5A36'); bd.position.set(s * 13.5, 0, z - 5.1); bd.rotation.y = Math.PI / 2; g.add(bd); }
    let nl = 0; for (let z = z0 - 3; z > z1; z -= 15) { const s = (nl++ % 2) ? 1 : -1; const f = farol(-s, o.lucesReales && Math.abs(z - (o.zLuz || 0)) < 18); f.position.set(s * 6.1, 0, z); g.add(f); }
    if (o.hidrante !== false) { const h = hidrante(); h.position.set(5.9, 0, o.zHidrante || 8); g.add(h); }
    const fl = bandera(); fl.position.set(-6, 0, z1 + 8); g.add(fl); g.userData.bandera = fl; return g; }

  // ---------- canchas ----------
  function lineasCancha(c, w, h, conTres = true) { c.strokeStyle = '#FFFFFF'; c.lineWidth = 10; c.strokeRect(10, 10, w - 20, h - 20); }
  function mediaCancha(dia = false) { const g = G(); const W = 15, D = 14;
    const t = tex(1024, 960, (c, w, h) => { c.fillStyle = '#BFC2C6'; c.fillRect(0, 0, w, h); sembrar(9); for (let i = 0; i < 26000; i++) { c.fillStyle = rnd() < .5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.06)'; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
      const sx = w / W, sy = h / D; c.strokeStyle = '#FFFFFF'; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12);
      const cx = w / 2, by = 1.2 * sy; c.strokeRect(cx - 2.45 * sx, 6, 4.9 * sx, 5.8 * sy); c.beginPath(); c.arc(cx, 5.8 * sy, 1.8 * sx, 0, Math.PI); c.stroke();
      c.beginPath(); c.moveTo(cx - 6.6 * sx, 6); c.lineTo(cx - 6.6 * sx, by + .2 * sy); c.arc(cx, by + .38 * sy, 6.75 * sx, Math.PI - .02, .02, true); c.lineTo(cx + 6.6 * sx, 6); c.stroke();
      for (const s of [-1, 1]) for (const yy of [2.1, 3.0, 3.9, 4.8]) { c.fillStyle = '#FFFFFF'; c.fillRect(cx + s * 2.45 * sx + (s < 0 ? -.35 * sx : 0), yy * sy, .35 * sx, 6); } });
    const piso = caja(W, .12, D, mat('#FFFFFF', { map: t, roughness: .85 }), 0, .06, 0, .02); piso.geometry = piso.geometry.clone(); // UV superior
    { const p = piso.geometry.attributes.position, uv = piso.geometry.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + W / 2) / W, (p.getZ(i) + D / 2) / D); uv.needsUpdate = true; } g.add(piso);
    const aro = canasta('#15161A'); aro.position.set(0, 0, -D / 2 + .4); g.add(aro); g.userData.aro = aro;
    for (const [x, z, r, L] of [[-W / 2 - .6, 0, Math.PI / 2, D + 1.2], [W / 2 + .6, 0, Math.PI / 2, D + 1.2], [0, -D / 2 - .6, 0, W + 1.2]]) { const b = barda(L, 2.0); b.position.set(x, 0, z); b.rotation.y = r; g.add(b); }
    return g; }
  function canasta(colPoste = '#15161A', alto = 3.05) { const g = G(); const pm = mat(colPoste, { roughness: .4 }); g.add(caja(.28, alto + .6, .28, pm, 0, (alto + .6) / 2, -.9, .04)); g.add(caja(.2, .2, 1.0, pm, 0, alto + .45, -.45, .03));
    const tab = caja(1.8, 1.05, .06, new THREE.MeshStandardMaterial({ color: '#F4F6F8', transparent: true, opacity: .88, roughness: .25 }), 0, alto + .45, 0, .02); g.add(tab);
    const cuad = new THREE.Mesh(new THREE.PlaneGeometry(.6, .45), new THREE.MeshBasicMaterial({ color: '#C8352B' })); cuad.position.set(0, alto + .23, .035); g.add(cuad); const cuad2 = new THREE.Mesh(new THREE.PlaneGeometry(.5, .35), new THREE.MeshBasicMaterial({ color: '#F4F6F8' })); cuad2.position.set(0, alto + .25, .036); g.add(cuad2);
    const rim = M(new THREE.TorusGeometry(.23, .02, 8, 28), mat('#F07A20', { roughness: .4 })); rim.rotation.x = Math.PI / 2; rim.position.set(0, alto, .3); g.add(rim);
    const red = new THREE.Mesh(new THREE.CylinderGeometry(.23, .15, .42, 14, 4, true), new THREE.MeshBasicMaterial({ color: '#FFFFFF', wireframe: true, transparent: true, opacity: .85 })); red.position.set(0, alto - .21, .3); g.add(red); g.userData.red = red; return g; }

  // ---------- luces de escena ----------
  function luzNoche(s, o = {}) { const hemi = new THREE.HemisphereLight('#5A6CB0', '#1C1C2C', o.hemi != null ? o.hemi : .55); s.add(hemi);
    const L = new THREE.DirectionalLight('#AFC3FF', o.luna != null ? o.luna : 1.1); L.position.set(...(o.dir || [-30, 40, 20])); L.castShadow = true; L.shadow.mapSize.set(4096, 4096); L.shadow.bias = -.0004; L.shadow.normalBias = .03; L.shadow.radius = 4;
    const c = L.shadow.camera, r = o.sombra || 22; c.left = c.bottom = -r; c.right = c.top = r; c.near = 1; c.far = 200; L.target.position.set(...(o.centro || [0, 0, 0])); s.add(L, L.target);
    s.fog = new THREE.Fog(o.niebla || '#232C52', o.n0 || 40, o.n1 || 260); return L; }
  function cieloNoche(s, dirLuna = [-.45, .5, -.75]) { s.add(cielo('#1A2040', '#2E3A66', 1.25)); const e = estrellas(); s.add(e); s.add(luna(dirLuna)); return e; }
  function personaje(k, x, z, ry = 0, expr, pose, t = .3) { const a = P.crear(k); a.position.set(x, 0, z); a.rotation.y = ry; if (expr && a.cara) a.cara(expr); if (pose && a.pose) a.pose(t, pose); a.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); return a; }
  const camara = (pos, mira, fov = 50) => { const c = new THREE.PerspectiveCamera(fov, 1080 / 1920, .05, 1500); c.position.set(...pos); c.lookAt(...mira); return c; };

  // ---------- los escenarios ----------
  const CREA = {
    // A · El pueblo de noche
    pueblo() { const s = new THREE.Scene(); const est = cieloNoche(s, [-.22, .3, -1]); luzNoche(s, { dir: [-35, 40, -10], sombra: 30, centro: [0, 0, -8] });
      const pb = pueblo({ lucesReales: true, zLuz: 10, hueco: (sd, z) => false }); s.add(pb); s.add(colinas(['#20402A', '#1C3328', '#1A2A2C']));
      for (const [col, tipo, x, z, ry] of [['#3F9A4E', 'camioneta', -5.0 + 2.1, -6, 0], ['#E8E8EA', 'camioneta', 5.0 - 2.1, -26, Math.PI], ['#3F9A4E', 'coche', 2.9, -48, Math.PI]]) { const c = coche(col, tipo, false); c.position.set(x, 0, z); c.rotation.y = ry; s.add(c); }
      const rojo = coche('#D9423A', 'coche', true); rojo.position.set(-1.7, 0, -18); s.add(rojo);
      const prota = personaje('prota', 2.7, 14.6, -.2, 'lado', 'caminar', .25); s.add(prota); const b = P.balon(.17); b.position.set(2.7 - .4, .75, 14.6 + .2); s.add(b);
      const cam = camara([2.4, 4.0, 23.5], [-.4, 3.2, -14], 54);
      return { scene: s, cam, post: { focus: 11, ap: .12, bloom: .8 }, actores: { prota, rojo, balon: b }, anima: (t) => { est.anima(t); pb.userData.bandera.anima(t); rojo.position.z = -18 + t * 8; prota.pose(t, 'caminar'); } }; },

    // B · La casa de fiesta (patio con alberca, noche)
    fiesta() { const s = new THREE.Scene(); const est = cieloNoche(s, [.55, .5, -.7]); luzNoche(s, { dir: [25, 35, 10], sombra: 16, centro: [0, 0, -3], luna: .8, hemi: .6 });
      s.add(plano(200, 200, mat('#3E6E34', { map: rep(TEX.pasto.clone(), 40, 40), roughness: 1 }), 0, 0, 0));
      const c = casa({ col: '#B98BB8', pisos: 2, w: 10, d: 7, semilla: 3, cruz: true, chimenea: true }); c.position.set(0, 0, -11); s.add(c);
      for (const [x, z, i] of [[-17, -12, 0], [16, -13, 6], [-30, -16, 4], [29, -17, 3]]) { const h = casaEstilo(i); h.position.set(x, 0, z); s.add(h); }
      s.add(banderines([-5.2, 5.3, -7.3], [5.2, 5.3, -7.3], .7, 16, true)); s.add(banderines([-5.4, 3.1, -7.2], [-5.4, 3.1, 4.6], .6, 18, true)); s.add(banderines([5.4, 3.1, -7.2], [5.4, 3.1, 4.6], .6, 18, true));
      for (const [x, y] of [[-5.4, 0], [5.4, 0]]) { s.add(caja(.12, 3.2, .12, mat('#F4F4F2'), x, 1.6, 4.6, .02)); }
      const colG = ['#8A4FC8', '#4CB050', '#F28A2E', '#F28DB2']; [[-3.2, -6.6], [-2.6, -6.9], [3.0, -6.6], [3.6, -6.9], [-5.6, -4], [5.8, -4.2]].forEach(([x, z], i) => { for (let j = 0; j < 3; j++) { const gb = globo(colG[(i + j) % 4], 2.3 + j * .35); gb.position.set(x + (j - 1) * .3, 0, z + (j % 2) * .2); s.add(gb); } });
      const mesa = mesaLarga(5); mesa.position.set(0, 0, -4.2); s.add(mesa); [[-2, 'p'], [-1, 'c'], [0, 'p'], [1, 'c2'], [2, 'p']].forEach(([x, t], i) => { const o = t === 'p' ? pizza() : pastel(t === 'c' ? '#F28DB2' : '#8FD0F0'); o.position.set(x, .83, -4.2); s.add(o); });
      for (let i = 0; i < 8; i++) { const v = vaso(COLB[i % 6]); v.position.set(-2.3 + i * .66, .83, -3.85); s.add(v); }
      ['#8A4FC8', '#F28A2E', '#F2C230', '#2F6FE0', '#4CB050', '#E8212B'].forEach((col, i) => { const ch = silla(col); ch.position.set(-2.1 + i * .84, 0, -5.1); s.add(ch); });
      // alberca
      s.add(caja(8.4, .3, 5.4, mat('#D6D4CE', { roughness: .8 }), 0, .1, 2.0, .05)); const agua = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 4.4), new THREE.MeshStandardMaterial({ color: '#3FA9F5', emissive: '#1E8FE8', emissiveIntensity: 1.25, roughness: .1, transparent: true, opacity: .93 }));
      agua.rotation.x = -Math.PI / 2; agua.position.set(0, .2, 2.0); s.add(agua); const pl = new THREE.PointLight('#5CC0FF', 2.5, 9, 1.6); pl.position.set(0, .6, 2); s.add(pl);
      for (const [x, z] of [[-2.6, 2.0], [2.6, 2.0]]) { const h = halo(1.4, '#9AD8FF', .35); h.position.set(x, .22, z); s.add(h); }
      const d1 = dona('#C6E05A'); d1.position.set(-1.8, .26, 1.4); s.add(d1); const d2 = dona('#9A5AD0'); d2.position.set(2.0, .26, 2.8); s.add(d2);
      const nadan = [personaje('rubio', -1.8, 1.4, .3, 'feliz', 'brazos'), personaje('invitado_verde', 2.0, 2.8, -.4, 'feliz', 'bailar', .4)]; nadan.forEach(a => { a.position.y = -.85; s.add(a); });
      const bailan = [personaje('linda', -3.4, -1.7, .5, 'feliz', 'bailar', .2), personaje('nino_gorro', -1.2, -2.2, .1, 'feliz', 'bailar', .45), personaje('invitada_amarilla', 1.4, -2.0, -.2, 'feliz', 'bailar', .7), personaje('invitado_blanco', 3.4, -1.5, -.5, 'feliz', 'bailar', .95)]; bailan.forEach(a => s.add(a));
      const prota = personaje('prota', 2.3, 6.6, .4, 'feliz', 'quieto'); s.add(prota);
      const warm = new THREE.PointLight('#FFD8A0', 2.0, 16, 1.6); warm.position.set(0, 4.5, -3); s.add(warm);
      const cam = camara([6.8, 3.6, 13.5], [0, 1.6, -3.5], 50);
      return { scene: s, cam, post: { focus: 13, ap: .1, bloom: .85 }, actores: { prota }, anima: (t) => { est.anima(t); bailan.forEach((a, i) => a.pose(t + i * .3, 'bailar')); nadan[0].position.y = -.85 + .05 * Math.sin(t * 2); d1.position.y = .26 + .04 * Math.sin(t * 2); d2.position.y = .26 + .04 * Math.sin(t * 2.3 + 1); } }; },

    // C · La casa del alcalde (interior rosa-magenta)
    alcalde() { const s = new THREE.Scene(); s.background = new THREE.Color('#1A0E1C'); const r = cuarto(s, { w: 8, d: 7, h: 3.2, pared: '#E592C6', piso: mat('#C77AA8', { roughness: .7 }), techo: '#F0B0D6' });
      s.add(new THREE.HemisphereLight('#FFB0E8', '#5A2050', .3)); const k = new THREE.PointLight('#E070D8', 1.6, 14, 1.4); k.position.set(-2.5, 2.8, 1.5); k.castShadow = true; k.shadow.mapSize.set(2048, 2048); k.shadow.bias = -.002; s.add(k);
      const k2 = new THREE.PointLight('#FFE0F0', 1.0, 12, 1.6); k2.position.set(2.8, 2.6, 2.5); s.add(k2);
      const v = ventanaInterior('#3A4A9A'); v.position.set(1.8, 1.7, -3.45); s.add(v);
      for (const [x, z, col] of [[-3.2, -2.8, '#F28DB2'], [-2.8, -3.0, '#FF6FB0'], [-3.4, -2.4, '#F7A8CF'], [3.1, -2.7, '#F28DB2'], [2.7, -3.0, '#FF6FB0']]) { const gb = globo(col, 2.0 + ((x * 7) % 1 + 1) * .15); gb.position.set(x, 0, z); s.add(gb); }
      const al = personaje('alcalde', -1.9, -1.9, .45, 'lado'); s.add(al);
      const pc = P.pecera(); pc.position.set(0, 0, .6); s.add(pc); pc.traverse(o => { if (o.isMesh) o.castShadow = false; });
      const cam = camara([.75, 1.38, 2.75], [-.35, 1.12, .2], 42);
      return { scene: s, cam, post: { focus: 2.3, ap: .6, bloom: .6 }, actores: { alcalde: al, pecera: pc }, anima: (t) => pc.anima(t, 0) }; },

    // D · La cancha de noche
    cancha(o = {}) { const s = new THREE.Scene(); const dia = o.dia; let est = null;
      if (dia) { s.add(cielo('#7FA9E8', '#A9C7F0', 1.15)); s.add(new THREE.HemisphereLight('#CFE2FF', '#5A6A40', .42)); const sol = new THREE.DirectionalLight('#FFFFFF', 1.25); sol.position.set(6, 30, 8); sol.castShadow = true; sol.shadow.mapSize.set(4096, 4096); sol.shadow.normalBias = .03; const c = sol.shadow.camera; c.left = c.bottom = -16; c.right = c.top = 16; c.far = 80; s.add(sol); s.fog = new THREE.Fog('#A9C7F0', 60, 320); }
      else { est = cieloNoche(s, [-.12, .42, -.9]); luzNoche(s, { dir: [24, 22, -30], sombra: 16, luna: .95, hemi: .45, centro: [0, 0, -1] }); }
      s.add(plano(300, 300, mat(dia ? '#4E8A3E' : '#365E30', { map: rep(TEX.pasto.clone(), 50, 50), roughness: 1 }), 0, -.01, 0));
      const c = mediaCancha(dia); s.add(c);
      [[-9, -16, 6, 'ladrilloCafe'], [0, -17, 0, 'ladrilloCafe'], [9.5, -16, 2, 'ladrilloCafe'], [-19, -12, 1], [19, -11, 8]].forEach(([x, z, i, m], j) => { const h = casa({ col: '#7A4A36', map: TEX.ladrilloCafe, pisos: j % 2 ? 2 : 1, w: 8, d: 6.5, semilla: 20 + j, silueta: o.siluetas || 0, apagadas: dia ? 1 : .2 }); h.position.set(x, 0, z); s.add(h); });
      for (const [x, z] of [[-13, -10], [13, -9], [-12, 8], [12.5, 7]]) { const a = arbol(1); a.position.set(x, 0, z); s.add(a); }
      if (!dia) { const f = farol(-1, true); f.position.set(9, 0, 6); s.add(f); }
      s.add(colinas(dia ? ['#5E9A4C', '#7FA8A0', '#A6BCD6'] : ['#20402A', '#1C3328', '#1A2A2C'], -90));
      let prota = null, balon = null, anima = (t) => { if (est) est.anima(t); };
      if (!o.vacia) { prota = personaje('prota', .3, 1.6, -.15, 'lado', 'botar', .15); s.add(prota); balon = P.balon(.17); balon.position.set(.3 + .5, .45, 1.6 + .45); s.add(balon); }
      const cam = dia ? camara([2.6, 1.3, 7.8], [0, 1.6, -1], 48) : camara([1.7, .45, 5.4], [-.2, 2.2, -1.5], 56);
      return { scene: s, cam, post: { focus: dia ? 6.6 : 4.2, ap: .14, bloom: .75 }, actores: { prota, balon, aro: c.userData.aro }, anima: (t) => { anima(t); if (prota) prota.pose(t, 'botar'); } }; },
    cancha_dia() { return CREA.cancha({ dia: true }); },

    // E · El partido de fiesta de verano (atardecer)
    partido() { const s = new THREE.Scene(); s.add(cielo('#B8BDEB', '#F6CBA4', 1.18)); s.fog = new THREE.Fog('#F2C7A8', 60, 380);
      s.add(new THREE.HemisphereLight('#C8C8F0', '#8A6A50', .85)); const sol = new THREE.DirectionalLight('#FFD8B0', 3.0); sol.position.set(40, 16, 18); sol.castShadow = true; sol.shadow.mapSize.set(4096, 4096); sol.shadow.bias = -.0004; sol.shadow.normalBias = .03; { const c = sol.shadow.camera; c.left = c.bottom = -24; c.right = c.top = 24; c.far = 140; } s.add(sol);
      const rel = new THREE.DirectionalLight('#B8BDEB', .6); rel.position.set(-20, 10, -10); s.add(rel);
      s.add(plano(500, 500, mat('#6FA24E', { map: rep(TEX.pasto.clone(), 70, 70), roughness: 1 }), 0, -.01, -60));
      const W = 15, D = 28; const t = tex(512, 960, (c, w, h) => { c.fillStyle = '#4F7FE0'; c.fillRect(0, 0, w, h); const sx = w / W, sy = h / D; c.fillStyle = '#F08A3C'; c.fillRect(w / 2 - 2.45 * sx, 0, 4.9 * sx, 5.8 * sy); c.fillRect(w / 2 - 2.45 * sx, h - 5.8 * sy, 4.9 * sx, 5.8 * sy);
        c.fillStyle = '#F6D44A'; c.beginPath(); c.arc(w / 2, h / 2, 1.8 * sx, 0, 7); c.fill(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; c.strokeRect(4, 4, w - 8, h - 8); c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke(); c.beginPath(); c.arc(w / 2, h / 2, 1.8 * sx, 0, 7); c.stroke();
        for (const e of [0, 1]) { const y0 = e ? h : 0, sg = e ? -1 : 1; c.strokeRect(w / 2 - 2.45 * sx, e ? h - 5.8 * sy : 0, 4.9 * sx, 5.8 * sy); c.beginPath(); c.arc(w / 2, y0 + sg * 5.8 * sy, 1.8 * sx, 0, 7); c.stroke(); c.beginPath(); c.arc(w / 2, y0 + sg * 1.6 * sy, 6.75 * sx, e ? Math.PI + .2 : .2, e ? -.2 : Math.PI - .2, false); c.stroke(); } });
      const piso = caja(W, .12, D, mat('#FFFFFF', { map: t, roughness: .55 }), 0, .06, 0, .02); piso.geometry = piso.geometry.clone(); { const p = piso.geometry.attributes.position, uv = piso.geometry.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + W / 2) / W, (p.getZ(i) + D / 2) / D); } s.add(piso);
      for (const z of [-D / 2 + .3, D / 2 - .3]) { const a = canasta('#D9312B'); a.position.set(0, 0, z); if (z > 0) a.rotation.y = Math.PI; s.add(a); }
      // gradas (6 escalones) a la izquierda con invitados
      for (let i = 0; i < 6; i++) s.add(caja(.75, (i + 1) * .45, 20, mat(i % 2 ? '#6E6965' : '#8F8A86', { roughness: .95 }), -W / 2 - 1.6 - i * .75, (i + 1) * .225, 0, .02));
      const gradas = []; const KS = ['invitado_verde', 'invitado_blanco', 'invitada_amarilla', 'nino_gorro', 'rubio', 'linda', 'abuela', 'kevin'];
      for (let fila = 0; fila < 3; fila++) for (let j = 0; j < 8; j++) { const k = KS[(fila * 5 + j * 3) % KS.length]; const a = personaje(k, -W / 2 - 1.6 - (fila * 2 + 1) * .75, -8.6 + j * 2.4 + (fila % 2) * 1.1, Math.PI / 2, 'feliz', (fila + j) % 3 ? 'bailar' : 'brazos', fila * .4 + j * .7); a.position.y = .45 * (fila * 2 + 2); s.add(a); gradas.push(a); }
      // letrero
      const lt = tex(1600, 260, (c, w, h) => { c.fillStyle = '#E7B53C'; c.fillRect(0, 0, w, h); c.fillStyle = '#5B4A9E'; c.font = 'bold 118px "DejaVu Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; const tw = c.measureText('PARTIDO DE FIESTA DE VERANO').width; c.save(); c.translate(w / 2, h * .42); c.scale(Math.min(1, (w - 80) / tw), 1); c.fillText('PARTIDO DE FIESTA DE VERANO', 0, 0); c.restore(); for (let i = 0; i < 26; i++) { c.fillStyle = COLB[i % 6]; c.fillRect(40 + i * 60, h - 52, 40, 30); } });
      const letrero = G(); letrero.add(caja(14, 2.3, .2, mat('#FFFFFF', { map: lt, roughness: .6 }), 0, 7.2, 0, .05)); for (const x of [-6, 6]) letrero.add(caja(.3, 7.2, .3, mat('#15161A'), x, 3.6, -.2, .04)); letrero.position.set(0, 0, -D / 2 - 4); s.add(letrero);
      // marcador
      const mt = tex(800, 420, (c, w, h) => { c.fillStyle = '#121214'; c.fillRect(0, 0, w, h); c.textAlign = 'center'; c.fillStyle = '#F0A040'; c.font = 'bold 64px "DejaVu Sans", sans-serif'; c.fillText('VISITA', w * .27, 90); c.fillText('LOCAL', w * .73, 90); c.fillStyle = '#F6E06A'; c.font = 'bold 210px "DejaVu Sans Mono", monospace'; c.fillText('08', w * .27, 330); c.fillText('10', w * .73, 330); });
      const marc = G(); marc.add(caja(4.2, 2.2, .3, mat('#FFFFFF', { map: mt, roughness: .5, emissive: '#FFFFFF', emissiveMap: mt, emissiveIntensity: .35 }), 0, 4.3, 0, .05)); for (const x of [-1.5, 1.5]) marc.add(caja(.22, 3.4, .22, mat('#15161A'), x, 1.7, -.2, .03)); marc.position.set(W / 2 + 4.5, 0, -6); marc.rotation.y = -.75; s.add(marc);
      // banderines sobre la cancha
      for (const z of [-9, -2, 5, 12]) s.add(banderines([-W / 2 - 1.5, 5.6, z], [W / 2 + 1.5, 5.6, z - 1], .9, 26, false, 1.2));
      for (const x of [-W / 2 - 1.5, W / 2 + 1.5]) for (const z of [-9, -2, 5, 12]) s.add(caja(.14, 5.7, .14, mat('#9EA2AA'), x, 2.85, z - (x > 0 ? 1 : 0), .02));
      // barda blanca, casetita y mesa de botanas
      for (const [x, z, r, L] of [[W / 2 + 7, 0, Math.PI / 2, 40], [0, -D / 2 - 8, 0, 34]]) { const b = barda(L, 1.4, '#FFFFFF', true); b.position.set(x, 0, z); b.rotation.y = r; s.add(b); }
      const cas = G(); cas.add(caja(3, 2.6, 3, mat('#FFFFFF', { map: TEX.tablonCafe, roughness: .8 }), 0, 1.3, 0, .05)); const tc = techo(3.6, 3.8, 1.3, '#C8352B'); tc.position.y = 2.6; cas.add(tc); cas.add(caja(1.6, .9, .1, mat('#2A1A10'), 0, 1.6, 1.52, .02)); cas.position.set(W / 2 + 4.5, 0, 6); cas.rotation.y = -Math.PI / 2; s.add(cas);
      const mb = G(); mb.add(caja(3, .1, 1, mat('#E8525C', { roughness: .5 }), 0, .8, 0, .02)); mb.add(caja(3, .4, 1, mat('#E8525C'), 0, .55, 0, .02)); for (const x of [-1.3, 1.3]) mb.add(caja(.08, .8, .8, mat('#B83A44'), x, .4, 0, .01)); [-1, 0, 1].forEach(x => { const pz = pizza(.22); pz.position.set(x, .86, 0); mb.add(pz); }); mb.position.set(W / 2 + 2.2, 0, 1); mb.rotation.y = -Math.PI / 2; s.add(mb);
      // jugadores
      const prota = personaje('prota', 1.2, 4, Math.PI, 'feliz', 'botar', .2); s.add(prota); const bal = P.balon(.17); bal.position.set(1.2 + .55, .5, 4 - .3); s.add(bal);
      const kevin = personaje('kevin', -1.6, 1.0, 0, 'seria', 'brazos'); s.add(kevin); const rub = personaje('rubio', 3.4, -1.6, -.3, 'sorpresa', 'brazos'); s.add(rub);
      // pueblo y colinas al fondo
      [[-24, -34, 1], [-12, -40, 4], [2, -44, 6], [16, -40, 9], [28, -34, 2], [-34, -24, 7], [36, -22, 3]].forEach(([x, z, i]) => { const h = casaEstilo(i, { apagadas: 1 }); h.position.set(x, 0, z); h.rotation.y = Math.atan2(-x, -z) + Math.PI; s.add(h); });
      for (const [x, z] of [[-18, -30], [8, -34], [22, -28], [-30, -12]]) { const a = arbol(1.1, '#5E9A3E'); a.position.set(x, 0, z); s.add(a); }
      s.add(colinas(['#7FA85A', '#A6B08A', '#C9B8B0'], -110));
      const cam = camara([7.5, 7.5, 25], [-2.6, 3.0, -10], 56);
      return { scene: s, cam, post: { focus: 20, ap: .05, bloom: .5, umbral: 1.4 }, actores: { prota, kevin, rubio: rub, balon: bal, marcador: marc, gradas }, anima: (tt) => { gradas.forEach((a, i) => a.pose(tt + i * .21, i % 3 ? 'bailar' : 'brazos')); prota.pose(tt, 'botar'); } }; },

    // F · Interiores de noche
    cuarto_kevin() { return interior({ pared: '#1F2C66', piso: mat('#FFFFFF', { map: TEX.pisoMadera, roughness: .7 }), tapete: '#D6A72E', poster: true, quien: 'kevin',
      extras: (s) => { const k = personaje('kevin', .3, -.6, -.15, 'lado', 'brazos'); s.add(k); const gt = guitarra(); gt.position.set(.3, .95, -.15); gt.rotation.z = -.9; gt.rotation.x = -.2; s.add(gt); const cama = camaB('#3D6BD8'); cama.position.set(-2.4, 0, -1.8); s.add(cama); return { kevin: k }; }, lampX: 2.6 }); },
    cuarto_linda() { return interior({ pared: '#8E86A8', piso: mat('#8A8698', { roughness: .8 }), poster: true, quien: 'linda',
      extras: (s) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) s.add(caja(1.2, .1, 1.2, mat((i + j) % 2 ? '#9E2A2A' : '#2B3F8F', { roughness: .85 }), -2.0 + i * 1.22, .05, -2.0 + j * 1.22, .03));
        const saco = G(); saco.add(cil(.3, .3, 1.1, mat('#C8302B', { roughness: .5 }), 0, 0, 0, 18)); saco.add(cil(.31, .31, .08, mat('#1A1A1A'), 0, .5, 0, 18)); saco.add(cil(.015, .015, 1.3, mat('#2A2A2A'), 0, 1.2, 0, 6)); saco.position.set(1.6, 1.45, -1.5); s.add(saco);
        const l = P.crear('linda', { sinGorro: true }); l.position.set(-.3, 0, -.4); l.rotation.y = .35; l.cara('seria'); l.pose(.26, 'karate'); l.traverse(q => { if (q.isMesh) q.castShadow = q.receiveShadow = true; }); s.add(l); return { linda: l, saco }; }, lampX: -2.7 }); },
    cuarto_abuela() { return interior({ pared: '#4A2A5E', piso: mat('#FFFFFF', { map: TEX.pisoMadera, roughness: .7 }), tapete: '#C2447A', quien: 'abuela',
      extras: (s) => { const cama = camaB('#F4F4F4'); cama.position.set(-1.9, 0, -2.0); s.add(cama); const bu = G(); bu.add(caja(.6, .6, .5, mat('#FFFFFF', { map: TEX.madera }), 0, .3, 0, .03)); bu.add(caja(.5, .04, .02, mat('#3A2A20'), 0, .42, .26, .01)); bu.position.set(-.3, 0, -2.85); s.add(bu); const lp = lampara('#FFD9A0', false); lp.position.set(-.3, .6, -2.85); s.add(lp);
        const a = P.crear('abuela', { sinGorro: true }); a.cara('feliz'); a.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); const [bi, bd] = a.userData.brazos; bi.rotation.x = bd.rotation.x = -Math.PI / 2 + .25; a.rotation.y = -.6; const piv = G(); piv.add(a); a.rotation.set(1.27, 0, 0); piv.position.set(1.0, .06, -.4); piv.rotation.y = -Math.PI / 2 + .25; s.add(piv); return { abuela: a }; }, lampX: 2.7, cam: [[-.3, 1.45, 4.4], [.1, .45, -.7], 50] }); },

    // G · La fiesta final (cancha de noche con foquitos y la pecera)
    fiesta_final() { const base = CREA.cancha({ siluetas: .8, vacia: true }); const s = base.scene;
      s.add(foquitos([-7.6, 3.6, -6.8], [7.6, 3.6, 2], 1.1, 24)); s.add(foquitos([-7.6, 3.4, 3], [7.6, 3.6, -6.5], 1.0, 24)); for (const [x, z] of [[-7.6, -6.8], [7.6, 2], [-7.6, 3], [7.6, -6.5]]) s.add(caja(.12, 3.7, .12, mat('#2A2A2A'), x, 1.85, z, .02));
      const warm = new THREE.PointLight('#FFF0D0', 1.3, 18, 1.5); warm.position.set(0, 3.3, -2); s.add(warm);
      const pc = P.pecera(); pc.position.set(0, 0, -1.4); s.add(pc); const col = new THREE.PointLight('#FF8FD0', 1.8, 8, 1.4); col.position.set(0, 2.4, -.6); s.add(col); const cpiso = charco(3.2, '#FF8FD0', .22, 0, -1.2, .14); s.add(cpiso);
      const gente = [['prota', -1.6, .4, .5], ['linda', 1.7, .2, -.5], ['abuela', -2.9, -1.8, .9], ['kevin', 2.9, -2.4, -.9], ['rubio', -1.0, -3.4, .2], ['nino_gorro', 1.2, -3.6, -.2], ['invitada_amarilla', -3.8, .9, .6], ['invitado_verde', 3.9, .6, -.6]].map(([k, x, z, r], i) => { const a = personaje(k, x, z, r, 'feliz', 'bailar', i * .27); s.add(a); return a; });
      const al = personaje('alcalde', 0, -4.6, 0, 'feliz'); s.add(al);
      const CL = ['#FF8FD0', '#8FF0C0', '#FFE680', '#C8A0FF'].map(c => new THREE.Color(c)); const tmp = new THREE.Color();
      const cam = camara([.6, 2.1, 7.4], [0, 1.3, -1.4], 52);
      return { scene: s, cam, post: { focus: 8.6, ap: .1, bloom: .9 }, actores: { pecera: pc, gente, alcalde: al }, anima: (t) => { base.anima(t); pc.anima(t, 1); gente.forEach((a, i) => a.pose(t + i * .27, 'bailar')); const u = t % 4, i = Math.floor(u), f = u - i, e = f < .7 ? 0 : (f - .7) / .3; tmp.copy(CL[i]).lerp(CL[(i + 1) % 4], e * e * (3 - 2 * e)); col.color.copy(tmp); cpiso.material.color.copy(tmp).multiplyScalar(.22); } }; },
  };

  // cuarto genérico (caja abierta hacia la cámara)
  function cuarto(s, o) { const g = G(); const { w, d, h } = o; g.add(plano(w, d, o.piso, 0, 0, 0)); const pm = mat(o.pared, { roughness: .85 });
    g.add(caja(w, h, .2, pm, 0, h / 2, -d / 2, .02)); for (const sx of [-1, 1]) g.add(caja(.2, h, d, pm, sx * w / 2, h / 2, 0, .02)); g.add(caja(w, .2, d, mat(o.techo || o.pared), 0, h + .1, 0, .02));
    g.add(caja(w, .14, .06, mat('#F4F2EE'), 0, .07, -d / 2 + .12, .01)); s.add(g); return g; }
  function ventanaInterior(noche = '#2A3A80') { const g = G(); g.add(caja(1.5, 1.4, .12, mat('#F4F2EE'), 0, 0, 0, .03)); g.add(caja(1.3, 1.2, .14, mat(noche, { emissive: noche, emissiveIntensity: .6, roughness: .2 }), 0, 0, .01, .01));
    g.add(caja(.05, 1.2, .18, mat('#F4F2EE'), 0, 0, .02, .01)); g.add(caja(1.3, .05, .18, mat('#F4F2EE'), 0, 0, .02, .01)); for (const s of [-1, 1]) g.add(caja(.45, 1.75, .08, mat('#F7F0F4', { roughness: .95 }), s * .78, -.05, .14, .03)); g.add(caja(2.0, .07, .07, mat('#D8D2CC'), 0, .85, .16, .02));
    const est = esf(.03, luz('#FFFFFF', 2), -.35, .35, .09, 6); g.add(est); return g; }
  function camaB(col) { const g = G(); g.add(caja(1.3, .35, 2.1, mat('#FFFFFF', { map: TEX.madera }), 0, .2, 0, .04)); g.add(caja(1.26, .2, 2.0, mat('#F6F6F6'), 0, .47, 0, .06)); g.add(caja(1.3, .14, 1.4, mat(col, { roughness: .9 }), 0, .6, .32, .05)); g.add(caja(.8, .18, .4, mat('#FFFFFF'), 0, .64, -.75, .08)); g.add(caja(1.3, .9, .12, mat('#FFFFFF', { map: TEX.madera }), 0, .45, -1.06, .03)); return g; }
  function interior(o) { const s = new THREE.Scene(); s.background = new THREE.Color('#0A0C18'); cuarto(s, { w: 7, d: 6.5, h: 3.1, pared: o.pared, piso: o.piso });
    s.add(new THREE.HemisphereLight('#6A7AC0', '#2A2034', .8)); const v = ventanaInterior(); v.position.set(o.lampX > 0 ? -1.6 : 1.6, 1.75, -3.12); s.add(v);
    const azul = new THREE.SpotLight('#7F9CFF', 2.6, 14, .6, .6, 1.2); azul.position.set(v.position.x, 1.9, -2.6); azul.target.position.set(v.position.x * .3, 0, 1.5); azul.castShadow = true; azul.shadow.mapSize.set(2048, 2048); azul.shadow.bias = -.001; s.add(azul, azul.target);
    const mesita = G(); mesita.add(caja(.6, .6, .5, mat('#FFFFFF', { map: TEX.madera }), 0, .3, 0, .03)); mesita.position.set(o.lampX, 0, -2.6); s.add(mesita); const lp = lampara('#FFC880', true, 3.2); lp.position.set(o.lampX, .6, -2.6); s.add(lp);
    s.add(charco(2.2, '#FFC880', .25, o.lampX * .8, -1.8, .02));
    if (o.tapete) s.add(caja(2.8, .03, 2.0, mat(o.tapete, { roughness: 1 }), .3, .02, -.2, .01));
    if (o.poster) { const p = caja(1.0, 1.35, .03, mat('#F8F8F6', { roughness: .9 }), o.lampX > 0 ? 1.0 : -1.0, 1.85, -3.12, .01); s.add(p); }
    const act = o.extras(s);
    const cam = o.cam ? camara(...o.cam) : camara([.9, 1.55, 4.7], [0, 1.0, -1.2], 54);
    return { scene: s, cam, post: { focus: 5.2, ap: .12, bloom: .8 }, actores: act, anima: () => {} }; }

  window.PUEBLO_E = { crear: (k, o) => { texturas(); return CREA[k](o); }, CREA, casa, casaEstilo, pueblo, coche, farol, arbol, banderines, foquitos, globo, canasta, mediaCancha, cielo, luna, estrellas, colinas, charco, halo, caja, mat, luz, TEX, texturas };
})();
