/* Escenas 2–24 al estilo de la referencia (se cargan después de escenas.js y la completan). */
(function () {
  const THREE = window.THREE, S = window.ESCENAS, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const FPS = 30;
  // ---------- utilidades ----------
  // estudio con niebla de color (fondo del celular flotante)
  function estudio(Q, arriba, abajo, niebla, k = .9) {
    const s = Q.escena({ fondo: abajo, niebla: .9, nieblaColor: niebla });
    const t = Q.textura(4, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, arriba); g.addColorStop(1, '#' + new THREE.Color(abajo).getHexString()); x.fillStyle = g; x.fillRect(0, 0, w, h); }); s.background = t;
    s.add(new THREE.HemisphereLight(0xffffff, 0x555566, k)); const d = new THREE.DirectionalLight(0xffffff, .8); d.position.set(.4, 1, .8); s.add(d);
    return s;
  }
  // celular grande flotando: gira lento ±12° en Y, ±6° en X y sube/baja 2 cm a 0.3 Hz
  function celFlotante(Q, s, o = {}) {
    const g = new THREE.Group(); s.add(g); const c = Q.celular({ luz: o.luz == null ? .6 : o.luz, color: o.color || 0xff3b3b, brillo: o.brillo || 1.7 }); g.add(c);
    g.rotation.set(o.rx || -.12, o.ry || .28, o.rz || -.18);
    return { g, c, mover(tg) { g.rotation.y = (o.ry || .28) + Math.sin(tg * .7) * .21 * .5; g.rotation.x = (o.rx || -.12) + Math.sin(tg * .5 + 1) * .1 * .5; g.position.y = Math.sin(tg * 2 * Math.PI * .3) * .006; } };
  }
  const flashAlerta = (color = '255,60,60') => (x, tl) => { const f = Math.floor(tl * FPS); if (f < 3) { x.fillStyle = f === 0 ? 'rgba(255,255,255,.85)' : `rgba(${color},${.55 - f * .15})`; x.fillRect(0, 0, 1080, 1920); }
    if (f >= 2 && f < 6) { const d = 14 - f * 2; x.save(); x.globalCompositeOperation = 'screen'; x.globalAlpha = .5; x.drawImage(x.canvas, d, 0); x.drawImage(x.canvas, -d, 0); x.restore();
      for (let i = 0; i < 5; i++) { const y = (f * 397 + i * 211) % 1920; x.drawImage(x.canvas, 0, y, 1080, 40, (i % 2 ? 1 : -1) * 30, y, 1080, 40); } } };
  const sacudon = (tl) => tl < 4 / FPS ? 1 : 0;
  function domo(Q, s, horizonte, cenit, r = 70) { const dg = new THREE.SphereGeometry(r, 32, 16), col = [], cH = new THREE.Color(horizonte), cT = new THREE.Color(cenit);
    for (let i = 0; i < dg.attributes.position.count; i++) { const y = dg.attributes.position.getY(i) / r; const cc = cH.clone().lerp(cT, clamp(y * 1.6)); col.push(cc.r, cc.g, cc.b); }
    dg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); const m = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: true, depthWrite: false, depthTest: false })); m.renderOrder = -10; s.add(m); return m; }
  function cuartoOscuro(Q, o = {}) { const s = Q.escena({ fondo: 0x05070d, niebla: .02, nieblaColor: 0x0e1424 }); s.add(new THREE.HemisphereLight(0x3a4a8a, 0x05060a, o.amb || .35)); return s; }

  // ===== 2 — La alerta: celular flotando en niebla rosada =====
  S[1] = (Q) => {
    const s = estudio(Q, '#c98e8f', 0x6e3a40, 0x9a5c60, .7); const C = celFlotante(Q, s, { brillo: 1.9, luz: 1.2, rx: -.18, ry: .35, rz: -.32 });
    return { scene: s, cam: [[0, 0, .36], [0, 0, 0], 40], cam2: [[0, 0, .29], [0, .005, 0], 40],
      anima(tl, tg) { C.mover(tg); C.c.userData.pinta(x => Q.pantallaA(x, tl)); }, post: { ap: .0, bloom: 1.2, umbral: .72 }, ca: .0015 };
  };
  // ===== 3 — No suena solo el tuyo: fachada con ventanas rojas en cascada =====
  function fachadaRoja(Q, o = {}) {
    const s = Q.escena({ fondo: 0x120a14, niebla: .028, nieblaColor: 0x1a0f1c }); domo(Q, s, 0x1d1424, 0x0B0F1C);
    const f = Q.fachada({ pisos: 7, color: 0x5a3a44 }); f.position.set(0, 0, -12); s.add(f);
    s.add(new THREE.HemisphereLight(0x6a3a50, 0x0b0f1c, .35)); const l = new THREE.DirectionalLight(0x8a6aa0, .35); l.position.set(-10, 20, 20); s.add(l);
    const rojo = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xE0262B).multiplyScalar(1.5), fog: true });
    const V = f.userData.ventanas; let sem = 9; const r = () => { sem = (sem * 16807) % 2147483647; return sem / 2147483647; };
    V.forEach(v => { v.ret = r() * 1.2; v.hal.material.color.set(0xff3b3b); });
    const off = V[0].vid.material; return { s, f, V, rojo, pintar(tl, todas) { V.forEach(v => { const on = todas != null ? todas : tl > v.ret; v.vid.material = on ? rojo : off; v.hal.material.opacity = on ? .25 + .1 * Math.sin(tl * 9 + v.ret * 7) : 0; }); } };
  }
  S[2] = (Q) => {
    const F = fachadaRoja(Q);
    return { scene: F.s, cam: (tl, k) => [[7.5, 2.5, 3], [0, 6 + 8 * k, -12], 46],
      anima(tl) { F.pintar(tl); }, post: { ap: .02, bloom: 1.1 } };
  };
  // ===== 4 — Y de repente… silencio: tu ventana con cruz roja que se apaga de golpe =====
  S[3] = (Q, tq) => {
    const s = Q.escena({ fondo: 0x0a0b14 }); const pared = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), Q.mat(0x2a1a22, { roughness: .9 })); pared.position.z = -.08; s.add(pared);
    const v = Q.ventanaCruz({ w: 1.1, h: 1.35, color: 0xE0262B, k: 2.0 }); s.add(v); const amb = new THREE.HemisphereLight(0xff5a5a, 0x100406, .5); s.add(amb);
    const luz = new THREE.PointLight(0xff3030, 3, 4, 2); luz.position.set(0, 0, .8); s.add(luz);
    const tOff = (window.T.palabras.find(p => p[4] === 3 && /silencio/i.test(p[2])) || [tq.ini + 1.5])[0];
    return { scene: s, cam: [[0, -.05, 2.6], [0, 0, 0], 45], cam2: [[0, -.04, 2.35], [0, 0, 0], 45],
      anima(tl, tg) { const on = tg < tOff; v.userData.vid.color.set(on ? 0xE0262B : 0x2b3866).multiplyScalar(on ? 2.0 : .7); luz.color.set(on ? 0xff3030 : 0x6F86D6); luz.intensity = on ? 3 : .8; amb.color.set(on ? 0xff5a5a : 0x3a4a8a); pared.material.color.set(on ? 0x2a1a22 : 0x141a2c); },
      post: { ap: .02, bloom: 1.1 }, ca: (tl) => .0015 };
  };
  // ===== 5 — Son las 3:17: reloj gigante =====
  S[4] = (Q) => {
    const s = Q.escena({ fondo: 0x0c1020, niebla: .2, nieblaColor: 0x10162a }); s.add(new THREE.HemisphereLight(0x8090c0, 0x101018, .55));
    const top = new THREE.DirectionalLight(0xdde4ff, .9); top.position.set(-.5, 2, 1); s.add(top);
    const r = Q.reloj(); r.scale.setScalar(3); r.rotation.set(-.05, -.42, 0); s.add(r);
    const cuerpo = Q.caja(.62, .08, .3, Q.mat(0xcfd3dc, { roughness: .6 }), [0, .17, -.02], { r: .02 }); r.add(cuerpo); cuerpo.scale.setScalar(1 / 3);
    const buro = Q.caja(2, .1, 1, Q.mat(0x5a1a1e), [0, -.19, 0]); s.add(buro);
    return { scene: s, cam: [[.28, .12, 1.15], [.0, 0, 0], 42], cam2: [[.24, .1, .98], [.0, 0, 0], 42], entrada: 'fundido',
      anima(tl) { r.userData.puntos(Math.floor(tl) % 2 === 0); }, post: { ap: .05, bloom: 1.3, umbral: .7 } };
  };
  // ===== 6 / 11 / 17 — celular de reglas en estudio gris claro =====
  function reglas(Q, o) {
    const s = estudio(Q, '#e4e6ec', 0x8d919c, 0xb5b9c3, 1.0); const C = celFlotante(Q, s, { brillo: 1.5, luz: .4, color: 0x6a6aff, rx: -.1, ry: -.3, rz: .12 });
    return { s, C };
  }
  S[5] = (Q, tq) => { const R = reglas(Q); const d = tq.fin - tq.ini;
    return { scene: R.s, cam: [[0, 0, .4], [0, 0, 0], 40], cam2: [[0, -.005, .3], [0, -.006, 0], 40],
      anima(tl, tg) { R.C.mover(tg); R.C.c.userData.pinta(x => Q.pantallaB(x, { lineas: clamp(tl / (d * .8)) * 5.2 })); }, post: { ap: 0, bloom: .9, umbral: .8 } }; };
  S[10] = (Q) => { const R = reglas(Q);
    return { scene: R.s, cam: [[0, .02, .3], [0, .01, 0], 40], cam2: [[0, -.012, .22], [0, -.02, 0], 40],
      anima(tl, tg) { R.C.mover(tg); R.C.c.userData.pinta(x => Q.pantallaB(x, { foco: tl > .2 ? 4 : null })); }, post: { ap: 0, bloom: .9, umbral: .8 } }; };
  S[16] = (Q) => { const R = reglas(Q);
    return { scene: R.s, cam: [[0, 0, .38], [0, 0, 0], 40], cam2: [[0, .01, .28], [0, .01, 0], 40], flash: flashAlerta('255,255,255'), sacudida: sacudon,
      anima(tl, tg) { R.C.mover(tg); R.C.c.userData.pinta(x => Q.pantallaC(x, { flip: clamp((tl - .3) / .25), k: clamp((tl - .6) / (10 / FPS)) })); }, post: { ap: 0, bloom: 1.0, umbral: .78 } }; };

  // ===== 8 — lámpara del buró (apagada) con el reloj =====
  S[7] = (Q) => {
    const s = cuartoOscuro(Q, { amb: .5 }); const b = Q.buro(); s.add(b); const pared = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), Q.mat(0x1b2440)); pared.position.set(0, 1.2, -.3); s.add(pared);
    const luna = new THREE.DirectionalLight(0x6F86D6, .6); luna.position.set(2, 3, 2); s.add(luna);
    const m = Q.mano(); m.position.set(.25, .62, .35); s.add(m);
    return { scene: s, cam: [[.25, .75, .75], [-.06, .72, -.05], 45], cam2: [[.22, .74, .62], [-.08, .74, -.05], 45],
      anima(tl, tg, k) { m.position.set(.3 - .2 * clamp(k * 1.6), .6 + .1 * clamp(k * 1.6), .3 - .2 * clamp(k * 1.6)); }, post: { ap: .08, bloom: 1.1 } };
  };
  // ===== 9 — ventana con cortina y luna detrás =====
  S[8] = (Q) => {
    const s = cuartoOscuro(Q, { amb: .5 }); const v = Q.ventanaCruz({ w: 1.1, h: 1.35, color: 0x5a6aa8, k: .55 }); s.add(v);
    const pared = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), Q.mat(0x161c33)); pared.position.z = -.08; s.add(pared);
    const cort = new THREE.Mesh(new THREE.PlaneGeometry(.75, 1.7, 30, 8), new THREE.MeshStandardMaterial({ color: 0x9aa0c8, roughness: .95, transparent: true, opacity: .78, side: THREE.DoubleSide })); cort.position.set(-.3, -.05, .12); s.add(cort);
    const base = cort.geometry.attributes.position.array.slice(); const luz = new THREE.DirectionalLight(0x8fa2ff, .7); luz.position.set(0, .5, -2); s.add(luz); s.add(new THREE.PointLight(0x6F86D6, .8, 3).translateZ(1));
    return { scene: s, cam: [[.15, 0, 2.4], [0, 0, 0], 45], cam2: [[.12, 0, 2.15], [0, 0, 0], 45],
      anima(tl) { const a = cort.geometry.attributes.position; for (let i = 0; i < a.count; i++) a.array[i * 3 + 2] = base[i * 3 + 2] + Math.sin(base[i * 3] * 14 + tl * 1.4) * .025 * (1 - (base[i * 3 + 1] + .85) / 1.7); a.needsUpdate = true; },
      post: { ap: .03, bloom: 1.0 } };
  };
  // ===== 10 — puerta de la recámara, plano bajo, luz azul por debajo =====
  function puertaBaja(Q) { const s = cuartoOscuro(Q, { amb: .8 }); const lu = new THREE.DirectionalLight(0x6F86D6, .5); lu.position.set(2, 3, 3); s.add(lu); const P = Q.P;
    const pared = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), Q.mat(0x141a2c)); pared.position.z = -.06; s.add(pared);
    const hueso = Q.mat(0xbfc3c9); s.add(Q.caja(.1, 2.2, .12, hueso, [-.5, 1.1, 0])); s.add(Q.caja(.1, 2.2, .12, hueso, [.5, 1.1, 0])); s.add(Q.caja(1.1, .1, .12, hueso, [0, 2.2, 0]));
    const pu = Q.caja(.9, 2.12, .05, Q.mat(0x2A1E18, { roughness: .6 }), [0, 1.08, 0]); s.add(pu); const man = Q.caja(.14, .025, .03, Q.mat(P.dorado, { metalness: .8, roughness: .25 }), [.33, 1.0, .05], { r: .01 }); s.add(man);
    const raya = new THREE.Mesh(new THREE.PlaneGeometry(.88, .012), Q.brilla(0x8fb0ff, 3)); raya.position.set(0, .006, .03); s.add(raya);
    const charco = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .6), new THREE.MeshBasicMaterial({ map: Q.textura(64, 64, (x) => { const g = x.createRadialGradient(32, 0, 0, 32, 0, 60); g.addColorStop(0, 'rgba(140,170,255,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    charco.rotation.x = -Math.PI / 2; charco.position.set(0, .004, .3); s.add(charco);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), Q.mat(0x2a2d4a, { roughness: .5 })); piso.rotation.x = -Math.PI / 2; piso.position.z = 1.5; s.add(piso);
    const l = new THREE.SpotLight(0x8fb0ff, 3, 3, 1.2, .9); l.position.set(0, .02, -.3); l.target.position.set(0, 0, 1); s.add(l, l.target);
    return { s, man }; }
  S[9] = (Q, tq) => { const D = puertaBaja(Q); const tNo = (window.T.palabras.find(p => p[4] === 9 && /no/i.test(p[2]) && p[0] > tq.ini + 1) || [tq.fin])[0];
    return { scene: D.s, cam: [[.1, .35, 2.6], [0, .8, 0], 45], cam2: [[.08, .3, 1.9], [0, .75, 0], 45], post: { ap: .04, bloom: 1.1 },
      sacudida: (tl) => Math.abs(tl + tq.ini - tNo) < 3 / FPS ? .6 : 0 }; };
  // ===== 13 — Tú aguantas: rincón oscuro con silla y la luz bajo la puerta =====
  S[12] = (Q) => { const D = puertaBaja(Q); D.s.add(new THREE.HemisphereLight(0x3a4a8a, 0x05060a, .3)); const silla = new THREE.Group(); const md = Q.mat(0x22160f);
    silla.add(Q.caja(.45, .05, .45, md, [0, .45, 0])); for (const [x, z] of [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]]) silla.add(Q.caja(.04, .45, .04, md, [x, .22, z])); silla.add(Q.caja(.45, .5, .04, md, [0, .72, -.2])); silla.position.set(-.95, 0, .4); silla.rotation.y = .5; D.s.add(silla);
    const pol = Q.polvo(140, [3, 2.4, 2], 0xcfd8ff, .006); D.s.add(pol);
    return { scene: D.s, cam: [[-.6, 1.1, 3.0], [-.2, .9, 0], 45], cam2: [[-.55, 1.08, 2.8], [-.2, .9, 0], 45], anima(tl, tg) { Q.moverPolvo(pol, tg, .006); }, post: { ap: .05, bloom: 1.0, oscuro: .25 } }; };
  // ===== 14 — la linterna en el edificio de enfrente =====
  function calleOscura(Q) { const NB = 0x1c2340, s = Q.escena({ fondo: NB, niebla: .035, nieblaColor: NB }); domo(Q, s, 0x232b48, 0x0B0F1C);
    const f = Q.fachada({ pisos: 7, color: 0x3B4256 }); f.position.set(-2, 0, -10); f.rotation.y = .5; s.add(f); s.add(Q.estrellas(120, 65));
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), Q.mat(0x12151d, { roughness: .6 })); suelo.rotation.x = -Math.PI / 2; s.add(suelo);
    s.add(new THREE.HemisphereLight(0x4a5a9a, 0x0b0f1c, .6)); const ln = new THREE.DirectionalLight(Q.P.luna, .9); ln.position.set(-10, 25, 15); s.add(ln);
    const v = f.userData.ventanas.find(v => v.p === 3 && v.c === 2); const pos = new THREE.Vector3(v.x, v.y, .3); f.localToWorld(pos);
    const cono = Q.conoLuz(0xffffff, 16, 2.6, .16); cono.position.copy(pos); s.add(cono); const hal = Q.halo(0xffffff, 1.6, .9); hal.position.copy(pos); s.add(hal);
    const sl = new THREE.SpotLight(0xffffff, 0, 30, .18, .5, 1.2); sl.position.copy(pos); s.add(sl, sl.target);
    return { s, f, cono, hal, sl, pos }; }
  S[13] = (Q, tq) => { const C = calleOscura(Q); const tOn = (window.T.palabras.find(p => p[4] === 13 && /linterna/i.test(p[2])) || [tq.ini + 2])[0] - .5;
    return { scene: C.s, cam: (tl, k) => [[2.5 - 1.2 * k, 1.4, 6], [C.pos.x, C.pos.y - 2, C.pos.z], 48],
      anima(tl, tg) { const on = tg >= tOn ? 1 : 0, a = (tg - tOn) * .5; C.cono.visible = C.hal.visible = !!on; C.sl.intensity = on * 6;
        const dir = new THREE.Vector3(Math.sin(-.6 + a), -.75, Math.cos(-.6 + a) * .9 + .3).normalize(); C.cono.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir); C.sl.target.position.copy(C.pos).addScaledVector(dir, 10); },
      post: { ap: .02, bloom: 1.2 } }; };
  // ===== 15 — el perro ladra hacia la luz =====
  S[14] = (Q, tq) => { const C = calleOscura(Q); C.cono.visible = C.hal.visible = true; C.sl.intensity = 5;
    const dir = new THREE.Vector3(.2, -.75, .7).normalize(); C.cono.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir); C.sl.target.position.copy(C.pos).addScaledVector(dir, 10);
    const dog = Q.perro(); dog.scale.setScalar(1.3); dog.position.set(1.0, 0, 3.4); dog.rotation.y = -Math.PI / 2 - .5; C.s.add(dog); const a = Q.auto(0x3b4458); a.position.set(3.2, 0, 2.5); C.s.add(a);
    const tl0 = (window.T.palabras.find(p => p[4] === 14 && /ladrar/i.test(p[2])) || [tq.ini + 1])[0];
    return { scene: C.s, cam: [[2.6, .7, 6.2], [0, 1.6, 0], 46], cam2: [[2.5, .7, 5.8], [0, 1.7, 0], 46],
      anima(tl, tg) { const b = tg - tl0; dog.userData.pose(b < 0 ? 0 : [1, 2, 0][Math.floor(b * 7) % 3]); }, post: { ap: .03, bloom: 1.1 } }; };
  // ===== 16 — lámpara de techo, grietas y polvo; el reflejo de la linterna se apaga =====
  S[15] = (Q, tq) => { const s = Q.escena({ fondo: 0x080b14, niebla: .05, nieblaColor: 0x0c1020 }); s.add(new THREE.HemisphereLight(0x8a90a8, 0x707890, .7)); const vl = new THREE.PointLight(0x6F86D6, 1.5, 6, 1.5); vl.position.set(1.4, .6, 1.2); s.add(vl);
    const techo = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), Q.mat(0x9aa2c0, { roughness: .95 })); techo.rotation.x = Math.PI / 2; techo.position.y = 2.6; s.add(techo);
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ transparent: true, map: Q.textura(512, 512, (x) => { x.strokeStyle = 'rgba(5,5,10,.9)'; x.lineWidth = 2; let sem = 7; const r = () => { sem = (sem * 16807) % 2147483647; return sem / 2147483647; };
      function rama(px, py, a, l, n) { if (n <= 0 || l < 6) return; const qx = px + Math.cos(a) * l, qy = py + Math.sin(a) * l; x.beginPath(); x.moveTo(px, py); x.lineTo(qx, qy); x.lineWidth = n * .32; x.stroke(); rama(qx, qy, a + (r() - .5) * .9, l * .8, n - 1); if (r() < .45) rama(qx, qy, a + (r() - .5) * 2, l * .6, n - 2); }
      for (let i = 0; i < 4; i++) rama(256, 256, i * 1.6 + r(), 50, 7); }) })); gr.rotation.x = Math.PI / 2; gr.position.y = 2.595; s.add(gr);
    const cable = Q.cil(.006, .006, .9, Q.mat(0x0a0a0a), [0, 2.15, 0]); s.add(cable); const pan = Q.cil(.06, .32, .3, Q.mat(0x0d0d10, { roughness: .5, side: THREE.DoubleSide }), [0, 1.62, 0]); s.add(pan);
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .5), new THREE.MeshBasicMaterial({ map: Q.textura(128, 64, (x) => { const g = x.createRadialGradient(64, 32, 2, 64, 32, 60); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 64); }), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    refl.rotation.x = Math.PI / 2; refl.position.set(.5, 2.59, -.6); s.add(refl); const rl = new THREE.PointLight(0xffffff, 3, 4); rl.position.set(.5, 2.3, -.6); s.add(rl);
    const pol = Q.polvo(260, [3, 2.6, 3], 0xffffff, .008); s.add(pol);
    const tOff = (window.T.palabras.find(p => p[4] === 15 && /apaga/i.test(p[2])) || [tq.ini + 1.2])[0];
    return { scene: s, cam: [[.9, 1.05, 2.3], [0, 2.0, 0], 48], cam2: [[.85, 1.07, 2.15], [0, 2.0, 0], 48],
      anima(tl, tg) { const on = tg < tOff; refl.visible = on; rl.intensity = on ? 3 : 0; if (on) Q.moverPolvo(pol, tg, .008); }, post: { ap: .04, bloom: 1.1 } }; };
  // ===== 18 — desde la puerta de la recámara hacia la cocina =====
  S[17] = (Q) => { const s = Q.escena({ fondo: 0x05070e, niebla: .015, nieblaColor: 0x1b2440 }); const p = Q.pasillo(); s.add(p);
    return { scene: s, cam: [[.0, 1.3, 4.6], [0, 1.0, -4], 46], cam2: [[.0, 1.28, 4.25], [0, 1.0, -4], 46], post: { ap: .04, bloom: 1.0 } }; };
  // ===== 19 — close-up del refri entreabierto y tilt hacia el piso =====
  S[18] = (Q) => { const s = Q.escena({ fondo: 0x05070e, niebla: .015, nieblaColor: 0x1b2440 }); const p = Q.pasillo(); s.add(p); const kl = new THREE.PointLight(0x8fa2d8, 1.2, 4, 2); kl.position.set(-.4, 2, -4.3); s.add(kl); const rz = p.userData.LZ1 - p.userData.KD + .45;
    return { scene: s, cam: (tl, k) => [[-.55, 1.3 - .5 * k, rz + 1.9 - .2 * k], [.5, 1.0 - .9 * k, rz + .35 + 1.0 * k], 44], post: { ap: .06, bloom: 1.25, umbral: .7 } }; };
  // ===== 20 — CAM 4 · ESCALERA =====
  S[19] = (Q, tq) => { const s = Q.escena({ fondo: 0x0a0a0a }); s.add(new THREE.HemisphereLight(0xffffff, 0x222222, .6)); const l = new THREE.PointLight(0xffffff, 2, 8); l.position.set(0, 3.5, 1); s.add(l);
    const con = Q.mat(0x8a8a8a, { roughness: .95 }); for (let i = 0; i < 10; i++) s.add(Q.caja(1.4, .18, .3, con, [0, .09 + i * .18, -i * .3], { r: .01 }));
    s.add(Q.caja(.05, 2.8, 4, Q.mat(0x6e6e6e), [-.75, 1.2, -1.4])); const bar = Q.mat(0x111111); for (let i = 0; i < 10; i++) s.add(Q.caja(.025, .9, .025, bar, [.72, .5 + i * .18, -i * .3])); s.add(Q.caja(.04, .04, 3.2, bar, [.72, 1.2, -1.4], { rot: [-.54, 0, 0] }));
    const puerta = Q.caja(.9, 2.1, .06, Q.mat(0x3a3a3a), [-.2, 2.9, -3.4]); s.add(puerta);
    const num = new THREE.Mesh(new THREE.PlaneGeometry(.3, .15), new THREE.MeshBasicMaterial({ map: Q.textura(128, 64, (x) => { x.fillStyle = '#ddd'; x.font = '800 48px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('4B', 64, 34); }), transparent: true })); num.position.set(-.2, 3.6, -3.36); s.add(num);
    const sil = new THREE.Group(); const negro = new THREE.MeshBasicMaterial({ color: 0x000000 }); sil.add(Q.caja(.32, 1.6, .2, negro, [0, .8, 0], { r: .1 })); sil.add(Q.esfera(.13, negro, [0, 1.75, 0])); s.add(sil);
    return { scene: s, cam: [[1.3, 4.2, 1.6], [-.2, 1.0, -1.6], 60], encima: camSeguridad(tq), post: { ap: 0, bloom: .4 },
      anima(tl, tg) { const t12 = Math.floor(tl * 12) / 12, k = clamp(t12 / 2.2), paso = Math.min(3, Math.floor(k * 3.2)); sil.position.set(.1, .18 * (3 - paso) + .02, -.3 * (3 - paso) + 1.0 - .2 * (k * 3 - paso)); } };
  };
  function camSeguridad(tq) { const dur = tq.fin - tq.ini; return (x, tl, tg) => {
    const W = 1080, H = 1920, img = x.getImageData(0, 0, W, H), d = img.data; let sem = Math.floor(tl * 12) * 7919 + 13;
    for (let i = 0; i < d.length; i += 4) { const L = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; sem = (sem * 1103515245 + 12345) & 0x7fffffff; let v = (L - 128) * 1.6 + 118 + ((sem >> 16) % 80 - 40) * .5; const y = (i / 4 / W) | 0; if (y % 4 === 0) v *= .85; d[i] = d[i + 1] = d[i + 2] = v; }
    x.putImageData(img, 0, 0); x.strokeStyle = '#fff'; x.lineWidth = 6; const m = W * .08, L = 70;
    [[m, m + 120, 1, 1], [W - m, m + 120, -1, 1], [m, H - m - 300, 1, -1], [W - m, H - m - 300, -1, -1]].forEach(([a, b, sx, sy]) => { x.beginPath(); x.moveTo(a, b + sy * L); x.lineTo(a, b); x.lineTo(a + sx * L, b); x.stroke(); });
    x.font = '700 44px "JetBrains Mono"'; x.fillStyle = '#fff'; x.fillText('REC', m + 70, m + 190); if (Math.floor(tg) % 2 === 0) { x.fillStyle = '#ff2a2a'; x.beginPath(); x.arc(m + 40, m + 175, 16, 0, 7); x.fill(); }
    const ss = 14 + Math.floor(tl); x.fillStyle = '#fff'; x.font = '700 40px "JetBrains Mono"'; x.fillText(`CAM 4 · ESCALERA · 03:18:${String(ss).padStart(2, '0')}`, m + 10, H - m - 330);
    if (tl < 4 / FPS || dur - tl < 4 / FPS) estatica(x, tl); }; }
  function estatica(x, t) { const W = 1080, H = 1920, img = x.createImageData(270, 480), d = img.data; let s = Math.floor(t * 30) * 31 + 7; for (let i = 0; i < d.length; i += 4) { s = (s * 16807) % 2147483647; const v = s & 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    const c = document.createElement('canvas'); c.width = 270; c.height = 480; c.getContext('2d').putImageData(img, 0, 0); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, W, H); x.imageSmoothingEnabled = true; }
  // ===== 22 — plano bajo de la duela con la línea del refri =====
  S[21] = (Q) => { const s = Q.escena({ fondo: 0x05070e, niebla: .03, nieblaColor: 0x1b2440 }); const p = Q.pasillo(); s.add(p);
    return { scene: s, cam: [[.12, .12, 1.6], [.15, .02, -2], 40], cam2: [[.12, .11, 1.35], [.15, .02, -2], 40], post: { ap: .12, bloom: 1.1 } }; };
  // ===== 23 / 24 — el pasillo desde la puerta + tarjetas A/B + píldora =====
  const G = () => window.GUION || {};
  function tarjetas(x, tl, tA, tB, tPill, tg) {
    const op = window.OPCIONES || { A: 'Cruzas el pasillo gateando para cerrarlo', B: 'Te tapas con la cobija y no te mueves' }, user = window.USUARIO || '@ElPanchoHuss';
    const sube = tPill != null && tg > tPill ? clamp((tg - tPill) / (8 / FPS)) : 0; const yA = 1000 - 140 * sube, yB = 1140 - 140 * sube;
    [[tA, 'A', op.A, '#E5333B', yA], [tB, 'B', op.B, '#3B6CF0', yB]].forEach(([t0, L, txt, col, yc]) => { if (tg < t0) return; const k = clamp((tg - t0) / (8 / FPS)), s = k < .6 ? .85 + .2 * (k / .6) : 1.05 - .05 * ((k - .6) / .4);
      x.save(); x.globalAlpha = k; x.translate(40 + 450, yc); x.scale(s, s); x.translate(-450, -60); x.beginPath(); x.roundRect(0, 0, 900, 120, 24); x.fillStyle = 'rgba(10,10,14,.72)'; x.fill(); x.lineWidth = 3; x.strokeStyle = col; x.stroke();
      x.beginPath(); x.arc(70, 60, 32, 0, 7); x.fillStyle = col; x.fill(); x.fillStyle = '#fff'; x.font = '800 38px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(L, 70, 62);
      x.textAlign = 'left'; x.font = '800 40px Inter'; const pal = txt.split(' '); let l1 = '', l2 = ''; for (const w of pal) { if (x.measureText(l1 + ' ' + w).width < 760 && !l2) l1 = (l1 ? l1 + ' ' : '') + w; else l2 = (l2 ? l2 + ' ' : '') + w; }
      if (l2) { x.fillText(l1, 124, 40); x.fillText(l2, 124, 84); } else x.fillText(l1, 124, 62); x.restore(); });
    if (tPill != null && tg >= tPill) { const k = clamp((tg - tPill) / (6 / FPS)), late = 1 + .04 * (.5 + .5 * Math.sin((tg - tPill) * 2 * Math.PI)); x.save(); x.globalAlpha = k; x.translate(540 - 70, 700); x.scale(late * (.8 + .2 * k), late * (.8 + .2 * k));
      x.font = '800 52px Inter'; const w = x.measureText(user).width + 70; x.beginPath(); x.roundRect(-w / 2, -45, w, 90, 45); x.fillStyle = '#0A0A0E'; x.fill(); x.lineWidth = 4; x.strokeStyle = '#E5333B'; x.stroke(); x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(user, 0, 3); x.restore(); }
  }
  function pasilloFinal(Q) { const s = Q.escena({ fondo: 0x05070e, niebla: .02, nieblaColor: 0x1b2440 }); const p = Q.pasillo(); s.add(p); return s; }
  const busca = (esc, re) => (window.T.palabras.find(p => p[4] === esc && re.test(p[2])) || [null])[0];
  S[22] = (Q) => { const s = pasilloFinal(Q); const tA = busca(22, /^A/), tB = busca(22, /^B/);
    return { scene: s, cam: [[.0, 1.3, 4.6], [0, 1.0, -4], 46], encima: (x, tl, tg) => tarjetas(x, tl, tA, tB, null, tg), post: { ap: .04, bloom: 1.0, oscuro: .2 } }; };
  S[23] = (Q) => { const s = pasilloFinal(Q); const tA = busca(22, /^A/), tB = busca(22, /^B/), tP = busca(23, /^Sígueme/);
    return { scene: s, cam: [[.0, 1.3, 4.6], [0, 1.0, -4], 46], cam2: [[.0, 1.3, 4.45], [0, 1.0, -4], 46], encima: (x, tl, tg) => tarjetas(x, tl, tA, tB, tP, tg), post: { ap: .04, bloom: 1.0, oscuro: .2 },
      salidaNegro: 2 }; };
  // alerta en escena 1 y 2: flash al arrancar
  const s0 = S[0]; S[0] = (Q, tq) => { const e = s0(Q, tq); e.flash = flashAlerta(); return e; };
})();
