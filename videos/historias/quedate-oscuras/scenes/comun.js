/* Quédate a oscuras: piezas compartidas (paleta, materiales, caja redondeada, personaje, celular, recámara, calle, pasillo).
   Todo es 3D "plastilina": cajas con bisel, colores planos, roughness alto. Se expone como window.Q. */
(function () {
  const THREE = window.THREE, V = (x, y, z) => new THREE.Vector3(x, y, z);
  THREE.ColorManagement.legacyMode = false; // los HEX se leen como sRGB (colores fieles a la paleta)
  const P = {
    rojoAmb: 0x7A1218, rojo: 0xE0262B, rojoGlow: 0xFF3B3B, sabana: 0xE89A93,
    noche0: 0x0B0F1C, noche1: 0x0E1424, noche2: 0x1B2440, luna: 0x6F86D6, niebla: 0x2A3350, duela0: 0x3A3F6E, duela1: 0x5A5FA0,
    sodio: 0xFFA24A, ventCalida: 0xF6D9A0, ventCalida2: 0xFFE3B0, dorado: 0xC9A25A, refri: 0xEAF2FF,
    ladrillo: 0x5A2A35, ladrillo2: 0x6B2F3A, grisAzul: 0x3B4256, hueso: 0xD9D6CF, piel: 0xE07A6E,
  };
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .82, metalness: 0 }, o));
  const brilla = (color, k = 1, o = {}) => { const m = new THREE.MeshBasicMaterial(Object.assign({ color, fog: false, toneMapped: true }, o)); m.color.multiplyScalar(k); return m; };
  const aditivo = (color, op, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }, o));
  // ---------- caja con bisel (adaptado de RoundedBoxGeometry) ----------
  const cacheG = new Map();
  function cajaGeo(w, h, d, r, seg = 3) {
    r = Math.min(r == null ? Math.min(w, h, d) * .035 : r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
    const key = [w, h, d, r, seg].map(v => v.toFixed(4)).join(); if (cacheG.has(key)) return cacheG.get(key);
    const s = seg * 2 + 1, g = new THREE.BoxGeometry(1, 1, 1, s, s, s), hs = .5 / s, box = V(w, h, d).divideScalar(2).subScalar(r);
    const pos = g.attributes.position, nor = g.attributes.normal, p = V(0, 0, 0), n = V(0, 0, 0);
    for (let i = 0; i < pos.count; i++) { p.fromBufferAttribute(pos, i); n.copy(p); n.x -= Math.sign(n.x) * hs; n.y -= Math.sign(n.y) * hs; n.z -= Math.sign(n.z) * hs; n.normalize();
      pos.setXYZ(i, box.x * Math.sign(p.x) + n.x * r, box.y * Math.sign(p.y) + n.y * r, box.z * Math.sign(p.z) + n.z * r); nor.setXYZ(i, n.x, n.y, n.z); }
    cacheG.set(key, g); return g;
  }
  function caja(w, h, d, m, pos, o = {}) { const me = new THREE.Mesh(cajaGeo(w, h, d, o.r, o.seg), m.isMaterial ? m : mat(m)); if (pos) me.position.set(...pos); me.castShadow = o.sombra !== false; me.receiveShadow = true; if (o.rot) me.rotation.set(...o.rot); return me; }
  function esfera(r, m, pos, esc) { const me = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), m.isMaterial ? m : mat(m)); if (pos) me.position.set(...pos); if (esc) me.scale.set(...esc); me.castShadow = true; me.receiveShadow = true; return me; }
  function cil(rt, rb, h, m, pos, seg = 32) { const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m.isMaterial ? m : mat(m)); if (pos) me.position.set(...pos); me.castShadow = true; me.receiveShadow = true; return me; }
  function textura(w, h, dibuja) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); dibuja(x, w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; t.userData.x = x; t.userData.c = c; return t; }
  // halo (sprite aditivo con degradado radial)
  const texHalo = textura(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
  function halo(color, tam, op = 1, pos) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texHalo, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); s.scale.set(tam, tam, 1); if (pos) s.position.set(...pos); return s; }
  // cono de luz visible en la niebla
  const texCono = textura(8, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.75, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  function conoLuz(color, largo, radio, op = .12) { const g = new THREE.ConeGeometry(radio, largo, 40, 1, true); g.translate(0, -largo / 2, 0); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, map: texCono, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); return m; }
  function escena(o = {}) {
    const s = new THREE.Scene(); s.background = new THREE.Color(o.fondo != null ? o.fondo : P.noche0);
    if (o.niebla) s.fog = new THREE.FogExp2(o.nieblaColor != null ? o.nieblaColor : P.niebla, o.niebla);
    return s;
  }
  function luzSombra(l, tam = 2048, area = 6) { l.castShadow = true; l.shadow.mapSize.set(tam, tam); l.shadow.bias = -.0004; l.shadow.normalBias = .02; l.shadow.radius = 6; if (l.shadow.camera.isOrthographicCamera) { const c = l.shadow.camera; c.left = c.bottom = -area; c.right = c.top = area; c.near = .1; c.far = 60; } return l; }
  // polvo flotando (puntos)
  function polvo(n, caja3, color = 0xffffff, tam = .012) { const g = new THREE.BufferGeometry(), a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - .5) * caja3[0]; a[i * 3 + 1] = Math.random() * caja3[1]; a[i * 3 + 2] = (Math.random() - .5) * caja3[2]; }
    g.setAttribute('position', new THREE.BufferAttribute(a, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color, size: tam, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending })); m.userData.base = a.slice(); return m; }
  function moverPolvo(p, t, v = .02) { const a = p.geometry.attributes.position, b = p.userData.base; for (let i = 0; i < a.count; i++) { a.array[i * 3] = b[i * 3] + Math.sin(t * .3 + i) * v * 3; a.array[i * 3 + 1] = b[i * 3 + 1] + Math.sin(t * .2 + i * 1.7) * v * 2; } a.needsUpdate = true; }

  // =============== PERSONAJE ("tú") ===============
  function personaje() {
    const g = new THREE.Group(), piel = mat(P.piel, { roughness: .7 }), pelo = mat(0x111116, { roughness: .55 });
    const cab = new THREE.Group(); g.add(cab);
    cab.add(esfera(.16, piel, [0, 0, 0]));
    // pelo tipo casco: atrás + arriba + un lado (izquierdo) y fleco
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.168, 44, 24, 0, Math.PI * 2, 0, 1.02), pelo); cap.castShadow = true; cab.add(cap);
    const nuca = new THREE.Mesh(new THREE.SphereGeometry(.1675, 44, 28, Math.PI + .3, Math.PI + .25, .5, 1.7), pelo); nuca.castShadow = true; cab.add(nuca);
    const oreja = esfera(.035, piel, [.158, -.01, -.01], [.6, 1, 1]); cab.add(oreja);
    const ojos = [], negro = mat(0x0a0a0e, { roughness: .3 });
    for (const sx of [-1, 1]) { const o = esfera(.019, negro, [sx * .055, .0, .148], [1, 1.15, .45]); cab.add(o); ojos.push(o); }
    for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.CircleGeometry(.03, 24), new THREE.MeshStandardMaterial({ color: 0xff3a3a, transparent: true, opacity: .75, roughness: .9 })); m.position.set(sx * .085, -.045, .135); m.lookAt(sx * .3, -.2, .6); cab.add(m); }
    const boca = new THREE.Mesh(new THREE.TorusGeometry(.012, .0035, 6, 16, Math.PI), negro); boca.position.set(0, -.07, .148); boca.rotation.z = Math.PI; cab.add(boca);
    g.userData = { cab, ojos, ojo(k) { ojos.forEach(o => o.scale.y = Math.max(.08, 1.15 * k)); } };
    return g;
  }
  function mano() { return esfera(.05, mat(P.piel, { roughness: .7 }), null, [1, .85, 1.1]); }

  // =============== CELULAR ===============
  const SW = 600, SH = 1300;
  function rr(x, X, Y, w, h, r) { x.beginPath(); x.roundRect(X, Y, w, h, r); }
  function barra(x, hora, w) { x.fillStyle = '#fff'; x.font = '700 34px Inter'; x.textBaseline = 'middle'; x.fillText(hora, 58, 62); // señal, wifi, batería
    for (let i = 0; i < 4; i++) x.fillRect(w - 178 + i * 12, 72 - (i + 1) * 7, 8, (i + 1) * 7);
    x.lineWidth = 5; x.strokeStyle = '#fff'; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(w - 112, 76, 8 + i * 8, -Math.PI * .75, -Math.PI * .25); x.stroke(); }
    rr(x, w - 84, 50, 46, 24, 6); x.lineWidth = 3; x.stroke(); x.fillRect(w - 80, 54, 32, 16); x.fillRect(w - 36, 57, 4, 10); }
  function textoCentrado(x, t, y, font, color, glow) { x.font = font; x.textAlign = 'center'; x.fillStyle = color; if (glow) { x.shadowColor = glow; x.shadowBlur = 30; } x.fillText(t, SW / 2, y); x.shadowBlur = 0; x.textAlign = 'left'; }
  function pantallaA(x, t = 0) {
    const g = x.createLinearGradient(0, 0, 0, SH); g.addColorStop(0, '#D2232A'); g.addColorStop(1, '#8E1018'); x.fillStyle = g; x.fillRect(0, 0, SW, SH);
    const v = x.createRadialGradient(SW / 2, SH * .45, SH * .2, SW / 2, SH * .45, SH * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,0,0,.55)'); x.fillStyle = v; x.fillRect(0, 0, SW, SH);
    barra(x, '3:17', SW);
    // triángulo de advertencia
    x.save(); x.translate(SW / 2, 470); x.shadowColor = 'rgba(255,255,255,.9)'; x.shadowBlur = 40; x.fillStyle = '#fff'; x.beginPath(); x.moveTo(0, -125); x.lineTo(140, 115); x.lineTo(-140, 115); x.closePath(); x.lineJoin = 'round'; x.lineWidth = 34; x.strokeStyle = '#fff'; x.stroke(); x.fill(); x.shadowBlur = 0;
    x.fillStyle = '#C81E26'; x.font = '900 170px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('!', 0, 30); x.restore(); x.textBaseline = 'alphabetic';
    x.save(); x.font = '700 30px Inter'; x.letterSpacing = '3px'; x.textAlign = 'center'; x.fillStyle = 'rgba(255,255,255,.92)'; x.fillText('ALERTA DE EMERGENCIA', SW / 2, 720); x.restore();
    const pul = .6 + .4 * (.5 + .5 * Math.sin(t * Math.PI * 2));
    x.save(); x.shadowColor = `rgba(255,255,255,${pul})`; x.shadowBlur = 40 * pul; textoCentrado(x, 'QUÉDATE A', 840, '900 74px Inter', '#fff'); x.shadowColor = `rgba(255,255,255,${pul})`; x.shadowBlur = 40 * pul; textoCentrado(x, 'OSCURAS', 930, '900 92px Inter', '#fff'); x.restore();
    rr(x, SW / 2 - 150, 1080, 300, 86, 43); x.lineWidth = 4; x.strokeStyle = '#fff'; x.stroke(); x.fillStyle = 'rgba(255,255,255,.08)'; x.fill(); textoCentrado(x, 'ACEPTAR', 1136, '700 36px Inter', '#fff');
  }
  function fondoB(x) { const g = x.createLinearGradient(0, 0, 0, SH); g.addColorStop(0, '#0C1030'); g.addColorStop(1, '#1E2A7A'); x.fillStyle = g; x.fillRect(0, 0, SW, SH);
    const r = x.createRadialGradient(SW * .6, SH * .8, 0, SW * .6, SH * .8, SH * .6); r.addColorStop(0, 'rgba(120,110,255,.35)'); r.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = r; x.fillRect(0, 0, SW, SH); }
  function horaGrande(x, h, y = 330, k = 1) { x.save(); x.globalAlpha = k; x.shadowColor = 'rgba(200,210,255,.9)'; x.shadowBlur = 36; textoCentrado(x, h, y, '800 190px Inter', '#fff'); x.restore(); }
  function tarjeta(x, y, alto) { rr(x, 34, y, SW - 68, alto, 40); x.fillStyle = 'rgba(26,31,58,.85)'; x.fill(); x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,.08)'; x.stroke(); }
  function cabecera(x, y, cuando = 'ahora') { x.font = '800 26px Inter'; x.fillStyle = '#FF4A4A'; x.textAlign = 'left'; x.fillText('⚠ ALERTA DE EMERGENCIA', 66, y); x.font = '500 26px Inter'; x.fillStyle = 'rgba(200,205,220,.8)'; x.textAlign = 'right'; x.fillText(cuando, SW - 66, y); x.textAlign = 'left'; }
  // reglas: o.lineas (0..5 aparecidas, fraccional = fade), o.foco (índice resaltado; el resto 40 %)
  function pantallaB(x, o = {}) {
    fondoB(x); barra(x, '', SW); horaGrande(x, o.hora || '3:17');
    const L = [['QUÉDATE A OSCURAS.', '800 44px Inter'], ['1. No enciendas ninguna luz.', '500 33px Inter'], ['2. No te asomes por la ventana.', '500 33px Inter'], ['3. Si tocan tres veces, no abras.', '500 33px Inter'], ['ESTO NO ES UN SIMULACRO.', '800 34px Inter']];
    const n = o.lineas == null ? 5 : o.lineas; tarjeta(x, 470, 520); cabecera(x, 530);
    L.forEach(([t, f], i) => { const a = Math.max(0, Math.min(1, n - i)); if (a <= 0) return; x.save(); x.globalAlpha = a * (o.foco != null && o.foco !== i ? .4 : 1); x.font = f; x.fillStyle = '#fff'; const y = 620 + (i === 0 ? 0 : 30) + i * 72 + (i === 4 ? 20 : 0);
      if (o.foco === i) { x.shadowColor = 'rgba(255,255,255,.9)'; x.shadowBlur = 24; } x.fillText(t, 66, y + (1 - a) * 14); x.restore(); });
  }
  // segunda alerta: k = 0..1 entrada (baja con rebote), flip = 0..1 cambio de hora 3:17 → 3:18
  function pantallaC(x, o = {}) {
    fondoB(x); barra(x, '', SW);
    const f = o.flip == null ? 1 : o.flip; if (f < 1) { x.save(); x.translate(0, 330 - 60); x.scale(1, Math.abs(1 - 2 * f)); x.translate(0, -(330 - 60)); horaGrande(x, f < .5 ? '3:17' : '3:18'); x.restore(); } else horaGrande(x, '3:18');
    const k = o.k == null ? 1 : o.k, e = k >= 1 ? 1 : 1 - Math.pow(1 - k, 3) * Math.cos(k * 9) ;
    // tarjeta anterior (chica), se recorre hacia abajo
    const yv = 470 + 330 * Math.min(1, k * 1.4); tarjeta(x, yv, 140); cabecera(x, yv + 56, '3:17'); x.font = '500 30px Inter'; x.fillStyle = 'rgba(255,255,255,.85)'; x.fillText('Quédate a oscuras.', 66, yv + 106);
    if (k > 0) { const y = -320 + (470 + 320) * e; x.save(); tarjeta(x, y, 300); cabecera(x, y + 58); x.font = '800 38px Inter'; x.fillStyle = '#fff'; x.fillText('QUÉDATE A OSCURAS.', 66, y + 122);
      x.shadowColor = 'rgba(255,255,255,.95)'; x.shadowBlur = 30; x.font = '900 52px Inter'; x.fillText('SE GUÍA POR LA LUZ.', 66, y + 222); x.restore(); }
  }
  function celular(o = {}) {
    const g = new THREE.Group(), w = .075, h = .158, d = .009;
    const cuerpo = caja(w, h, d, mat(0x0d0d10, { roughness: .55 }), null, { r: w * .08 * 1.2, seg: 4 }); g.add(cuerpo);
    const marco = caja(w + .002, h + .002, d * .7, mat(0x2a2c33, { metalness: .7, roughness: .35 }), null, { r: w * .1, seg: 4 }); g.add(marco);
    const tex = textura(SW, SH, (x) => pantallaA(x, 0));
    const pm = new THREE.MeshBasicMaterial({ map: tex, toneMapped: true, fog: false }); pm.color.setScalar(o.brillo || 1.6);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(w * .9, h * .93), pm); scr.position.z = d / 2 + .0006; g.add(scr);
    // isla mínima
    const isla = new THREE.Mesh(new THREE.PlaneGeometry(w * .22, w * .06), new THREE.MeshBasicMaterial({ color: 0x000000 })); isla.position.set(0, h * .43, d / 2 + .0008); g.add(isla);
    const luz = new THREE.PointLight(o.color || P.rojoGlow, o.luz == null ? 2.5 : o.luz, 2.2, 2); luz.position.z = .06; g.add(luz);
    g.userData = { tex, scr, luz, pm, pinta(fn) { const x = tex.userData.x; x.save(); x.clearRect(0, 0, SW, SH); fn(x); x.restore(); tex.needsUpdate = true; } };
    return g;
  }

  // =============== RECÁMARA ===============
  function texReloj(txt, puntos = true) { return textura(256, 110, (x) => { x.fillStyle = '#050505'; x.fillRect(0, 0, 256, 110); x.font = '700 92px "JetBrains Mono"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#FF2A2A'; x.shadowBlur = 18; x.fillStyle = '#FF2A2A';
    const [h, m] = txt.split(':'); x.fillText(h, 62, 58); x.fillText(m, 172, 58); if (puntos) { x.fillRect(118, 34, 12, 12); x.fillRect(118, 68, 12, 12); } }); }
  function reloj() { const g = new THREE.Group(); g.add(caja(.2, .09, .07, mat(0x111114, { roughness: .5 }), null, { r: .02 }));
    const tex = texReloj('3:17'); const m = new THREE.MeshBasicMaterial({ map: tex, fog: false }); m.color.setScalar(2.4); const s = new THREE.Mesh(new THREE.PlaneGeometry(.17, .068), m); s.position.z = .0355; g.add(s);
    const l = new THREE.PointLight(0xff2020, .6, 1.2, 2); l.position.set(0, 0, .1); g.add(l); g.userData = { tex, m, l, puntos(on) { const t2 = texReloj('3:17', on); m.map = t2; } }; return g; }
  function buro() { const g = new THREE.Group(), madera = mat(0x3a2418, { roughness: .7 });
    g.add(caja(.5, .5, .42, madera, [0, .25, 0], { r: .025 })); g.add(caja(.44, .015, .01, mat(0x24160f), [0, .3, .212]));
    const pom = esfera(.016, mat(P.dorado, { metalness: .7, roughness: .35 }), [0, .38, .215]); g.add(pom);
    // lámpara: base cilíndrica negra con anillo rojo, pantalla cónica beige
    const lamp = new THREE.Group(); lamp.position.set(-.12, .5, -.06); g.add(lamp);
    lamp.add(cil(.06, .07, .14, mat(0x111114, { roughness: .45 }), [0, .07, 0])); lamp.add(cil(.071, .071, .018, mat(0xb3121a, { roughness: .5 }), [0, .045, 0]));
    lamp.add(cil(.008, .008, .12, mat(0x222222), [0, .2, 0])); const pan = cil(.075, .14, .17, mat(0xd8c9a8, { roughness: .9, side: THREE.DoubleSide }), [0, .3, 0]); lamp.add(pan);
    const vaso = new THREE.Mesh(new THREE.CylinderGeometry(.032, .028, .1, 24), new THREE.MeshPhysicalMaterial({ color: 0xcfe3ff, roughness: .05, transmission: .0, transparent: true, opacity: .35 })); vaso.position.set(.15, .55, .08); g.add(vaso);
    const agua = cil(.029, .026, .06, new THREE.MeshStandardMaterial({ color: 0x9fc3ff, transparent: true, opacity: .25, roughness: .1 }), [.15, .53, .08]); g.add(agua);
    const r = reloj(); r.position.set(.08, .545, .05); r.rotation.y = -.15; g.add(r); g.userData = { reloj: r, lamp };
    return g; }
  function cama() { const g = new THREE.Group(), madera = mat(0x2e1c14, { roughness: .7 });
    g.add(caja(2.1, .32, 1.5, madera, [0, .16, 0], { r: .04 })); g.add(caja(.1, 1.0, 1.5, madera, [-1.07, .5, 0], { r: .04 }));
    g.add(caja(2.02, .24, 1.42, mat(0xb9a8a4, { roughness: .95 }), [0, .42, 0], { r: .08 }));
    const alm = caja(.5, .17, .95, mat(0xc8b4b0, { roughness: .95 }), [-.76, .62, 0], { r: .08, seg: 5 }); g.add(alm);
    // cobija acolchada inflada: una caja grande + "costuras" de cajas redondeadas encimadas
    const cob = new THREE.Group(); g.add(cob); const mc = mat(P.sabana, { roughness: .95 });
    cob.add(caja(1.56, .26, 1.5, mc, [.25, .6, 0], { r: .13, seg: 6 }));
    // pliegues: rollos alargados y suaves sobre la cobija (no cuadrícula)
    [[.2, .12, 1.36, .45], [.55, -.06, 1.3, .36], [.85, .08, 1.2, .3]].forEach(([x, rz, largo, gr]) => { const pl = new THREE.Mesh(new THREE.CapsuleGeometry(.07 * gr / .38, largo, 8, 24), mc); pl.rotation.set(Math.PI / 2, 0, rz); pl.scale.set(1.6, 1, .55); pl.position.set(x, .72, 0); pl.castShadow = pl.receiveShadow = true; cob.add(pl); });
    // borde doblado junto al cuello
    const dob = new THREE.Mesh(new THREE.CapsuleGeometry(.075, 1.34, 8, 24), mat(0xF0B5AE, { roughness: .95 })); dob.rotation.x = Math.PI / 2; dob.scale.set(1.5, 1, .8); dob.position.set(-.5, .7, 0); dob.castShadow = dob.receiveShadow = true; cob.add(dob);
    g.userData = { cob, alm }; return g; }
  function ventanaCruz(o = {}) { const g = new THREE.Group(), w = o.w || 1.1, h = o.h || 1.3, mm = mat(P.hueso, { roughness: .7 }), t = .07;
    g.add(caja(w + t * 2, t, .12, mm, [0, h / 2 + t / 2, 0])); g.add(caja(w + t * 2, t * 1.3, .2, mm, [0, -h / 2 - t / 2, .04])); g.add(caja(t, h, .12, mm, [-w / 2 - t / 2, 0, 0])); g.add(caja(t, h, .12, mm, [w / 2 + t / 2, 0, 0]));
    g.add(caja(.05, h, .08, mm, [0, 0, 0])); g.add(caja(w, .05, .08, mm, [0, 0, 0]));
    const vid = brilla(o.color || P.rojo, o.k || 2.2); const cr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), vid); cr.position.z = -.03; g.add(cr);
    g.userData = { vid, cr }; return g; }
  function recamara(o = {}) {
    const g = new THREE.Group(), pared = mat(o.pared || 0x23263f, { roughness: .9 });
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), mat(0x3b2a26, { roughness: .8 })); piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; g.add(piso);
    const fondo = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), pared); fondo.position.set(0, 2, -1.05); fondo.receiveShadow = true; g.add(fondo);
    const izq = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), pared); izq.rotation.y = Math.PI / 2; izq.position.set(-2.1, 2, 2); izq.receiveShadow = true; g.add(izq);
    const c = cama(); c.position.set(-.3, 0, -.25); g.add(c);
    const b = buro(); b.position.set(-1.75, 0, -.68); g.add(b);
    const v = ventanaCruz({ color: o.ventana || P.rojo, k: o.ventanaK || 2.4 }); v.position.set(.75, 1.75, -1.0); g.add(v);
    g.userData = { cama: c, buro: b, ventana: v, reloj: b.userData.reloj }; return g;
  }

  // =============== CIUDAD / CALLE ===============
  function inst(geo, m, n) { const im = new THREE.InstancedMesh(geo, m, n); im.castShadow = false; im.receiveShadow = true; im.count = 0; return im; }
  const _o = new THREE.Object3D();
  function poner(im, p, r = [0, 0, 0], s = [1, 1, 1], col) { _o.position.set(...p); _o.rotation.set(...r); _o.scale.set(...s); _o.updateMatrix(); im.setMatrixAt(im.count, _o.matrix); if (col) im.setColorAt(im.count, col); im.count++; }
  let semilla = 7; const rnd = () => { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };
  /* hilera de edificios a lo largo de z. lado = -1 (izquierda, fachada mira +x) o 1 (derecha, mira -x).
     Devuelve { grupo, ventanas: [{i, x, y, z, piso}] } para encender/apagar por índice (InstancedMesh de vidrios). */
  function hilera(lado, z0, z1, o = {}) {
    const g = new THREE.Group(), x0 = lado * (o.calle || 4.2), MAX = 900;
    const vid = inst(new THREE.PlaneGeometry(.78, 1.25), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: true }), MAX);
    const marco = inst(cajaGeo(.95, 1.42, .1, .025, 2), mat(P.hueso, { roughness: .7 }), MAX);
    const cruz = inst(new THREE.BoxGeometry(1, 1, 1), mat(P.hueso, { roughness: .7 }), MAX * 2);
    const losa = inst(cajaGeo(1.3, .1, .55, .02, 2), mat(0x2a2d38), 300), bar = inst(new THREE.BoxGeometry(.022, .9, .022), mat(0x0c0c10, { roughness: .5 }), 6000), pas = inst(new THREE.BoxGeometry(1.3, .04, .04), mat(0x0c0c10), 300);
    g.add(vid, marco, cruz, losa, bar, pas); const ventanas = []; let z = z0;
    const negro = new THREE.Color(0x07080d);
    while (z > z1) { const ancho = 6 + Math.floor(rnd() * 4) * 1.2, pisos = 5 + Math.floor(rnd() * 4), alto = pisos * 3 + .6, col = [P.ladrillo, P.ladrillo2, P.grisAzul][Math.floor(rnd() * 3)];
      const prof = 10; const ed = caja(prof, alto, ancho - .08, mat(col, { roughness: .9 }), [x0 + lado * prof / 2, alto / 2, z - ancho / 2], { r: .06, sombra: false }); g.add(ed);
      for (let p = 1; p < pisos; p++) g.add(caja(.25, .14, ancho - .04, mat(0x2b2b33), [x0 - lado * .06, p * 3 + .25, z - ancho / 2], { r: .03, sombra: false }));
      g.add(caja(.4, .3, ancho + .02, mat(0x24242c), [x0 - lado * .1, alto - .1, z - ancho / 2], { r: .04, sombra: false }));
      const nv = Math.floor((ancho - .6) / 1.6); const paso = (ancho - .6) / nv, fx = x0 - lado * .02, ry = lado < 0 ? Math.PI / 2 : -Math.PI / 2;
      if (rnd() < .5) { const bj = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, alto, 10), mat(0x50545e, { roughness: .6 })); bj.position.set(x0 - lado * .1, alto / 2, z - .25); g.add(bj); }
      for (let p = 0; p < pisos; p++) for (let k = 0; k < nv; k++) {
        const zz = z - .3 - paso * (k + .5), yy = p * 3 + 1.75; if (p === 0 && k === Math.floor(nv / 2)) continue; // puerta
        poner(marco, [fx - lado * .03, yy, zz], [0, ry, 0]); poner(vid, [fx - lado * .085, yy, zz], [0, ry, 0], [1, 1, 1], negro);
        ventanas.push({ i: vid.count - 1, x: fx - lado * .085, y: yy, z: zz, piso: p, lado });
        if ((k + p) % 2 === 0) { poner(cruz, [fx - lado * .09, yy, zz], [0, 0, 0], [.03, 1.25, .03]); poner(cruz, [fx - lado * .09, yy + .12, zz], [0, 0, 0], [.03, .03, .78]); }
        if (p > 0 && (k % 2 === 1) && rnd() < .7) { const bx = fx - lado * .3; poner(losa, [bx, yy - .72, zz], [0, ry, 0]); poner(pas, [x0 - lado * .56, yy + .2, zz], [0, ry, 0]);
          for (let b = 0; b < 12; b++) poner(bar, [x0 - lado * .56, yy - .25, zz - .6 + b * .11]); }
      }
      z -= ancho;
    }
    [vid, marco, cruz, losa, bar, pas].forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
    g.userData = { vid, ventanas }; return g;
  }
  function colorVentana(h, idx, col) { h.userData.vid.setColorAt(idx, col); h.userData.vid.instanceColor.needsUpdate = true; }
  function auto(color = 0x2b3348) { const g = new THREE.Group(), m = mat(color, { roughness: .35, metalness: .3 }), vid = mat(0x0b0e18, { roughness: .1, metalness: .5 });
    g.add(caja(1.72, .6, 4.3, m, [0, .68, 0], { r: .16, seg: 4 })); g.add(caja(1.46, .48, 2.0, m, [0, 1.2, -.25], { r: .14, seg: 4 }));
    const vd = mat(0x2a3656, { roughness: .12, metalness: .5, emissive: 0x0c1222 }); g.add(caja(1.48, .32, 1.7, vd, [0, 1.2, -.25], { r: .07 })); g.add(caja(1.32, .34, 2.04, vd, [0, 1.19, -.25], { r: .07 }));
    for (const [x, z] of [[-.8, 1.35], [.8, 1.35], [-.8, -1.4], [.8, -1.4]]) { const r = cil(.34, .34, .22, mat(0x0a0a0c, { roughness: .8 }), [x, .34, z], 24); r.rotation.z = Math.PI / 2; g.add(r); }
    for (const x of [-.6, .6]) { g.add(caja(.32, .12, .05, mat(0x9aa0ab, { roughness: .2 }), [x, .78, 2.14])); g.add(caja(.32, .1, .05, mat(0x5a0c12), [x, .8, -2.14])); }
    return g; }
  function farola(o = {}) { const g = new THREE.Group(), negro = mat(0x0b0b0e, { roughness: .5, metalness: .4 }), h = o.h || 5;
    g.add(cil(.07, .1, h, negro, [0, h / 2, 0], 12)); const brazo = caja(.9, .07, .07, negro, [o.lado * .45, h - .05, 0]); g.add(brazo);
    const cab = caja(.45, .14, .28, negro, [o.lado * .85, h - .1, 0], { r: .05 }); g.add(cab);
    const foco = new THREE.Mesh(new THREE.PlaneGeometry(.36, .2), brilla(P.sodio, 2.2, { side: THREE.DoubleSide })); foco.rotation.x = Math.PI / 2; foco.position.set(o.lado * .85, h - .175, 0); g.add(foco);
    const hal = halo(P.sodio, 3.0, .38, [o.lado * .85, h - .3, 0]); g.add(hal);
    const cono = conoLuz(P.sodio, h - .2, 1.9, .09); cono.position.set(o.lado * .85, h - .18, 0); g.add(cono);
    const sl = new THREE.SpotLight(P.sodio, o.i || 9, 14, .78, .65, 1.6); sl.position.set(o.lado * .85, h - .2, 0); sl.target.position.set(o.lado * .85, 0, 0); g.add(sl, sl.target);
    g.userData = { foco, hal, cono, sl, k(v) { foco.material.color.set(P.sodio).multiplyScalar(2.2 * v); hal.material.opacity = .38 * v; cono.material.opacity = .09 * v; sl.intensity = (o.i || 9) * v; } };
    return g; }
  function perro() { const g = new THREE.Group(), m = mat(0x4a2c1c, { roughness: .85 }), osc = mat(0x2a180e, { roughness: .85 });
    const cuerpo = new THREE.Group(); g.add(cuerpo); cuerpo.add(caja(.32, .3, .7, m, [0, .5, 0], { r: .13, seg: 4 }));
    const patas = []; for (const [x, z] of [[-.1, .24], [.1, .24], [-.1, -.24], [.1, -.24]]) { const p = caja(.09, .4, .1, m, [x, .2, z], { r: .04 }); cuerpo.add(p); patas.push(p); }
    const cola = caja(.06, .06, .3, m, [0, .66, -.42], { r: .03, rot: [-.7, 0, 0] }); cuerpo.add(cola);
    const cue = new THREE.Group(); cue.position.set(0, .66, .32); cuerpo.add(cue);
    const cab = new THREE.Group(); cab.position.set(0, .16, .06); cue.add(cab); cue.add(caja(.16, .26, .16, m, [0, .06, 0], { r: .06, rot: [.5, 0, 0] }));
    cab.add(caja(.24, .22, .24, m, [0, 0, 0], { r: .09, seg: 4 })); const hoc = caja(.14, .11, .18, m, [0, -.04, .17], { r: .05 }); cab.add(hoc); cab.add(esfera(.028, mat(0x0a0a0a, { roughness: .3 }), [0, -.0, .26]));
    const mand = caja(.12, .04, .14, osc, [0, -.1, .15], { r: .02 }); cab.add(mand);
    for (const sx of [-1, 1]) cab.add(caja(.06, .14, .1, osc, [sx * .11, .1, -.03], { r: .03, rot: [0, 0, sx * .5] }));
    // ladrido: 3 poses (0 reposo, 1 cabeza arriba, 2 hocico abierto)
    g.userData = { cab, mand, pose(n) { cab.rotation.x = n === 0 ? 0 : -.35 - (n === 2 ? .15 : 0); mand.rotation.x = n === 2 ? .45 : 0; mand.position.y = n === 2 ? -.13 : -.1; } };
    return g; }
  function estrellas(n = 120, r = 140) { const g = new THREE.BufferGeometry(), a = []; for (let i = 0; i < n; i++) { const th = rnd() * Math.PI * 2, ph = .15 + rnd() * .9; a.push(Math.cos(th) * Math.cos(ph) * r, Math.sin(ph) * r, Math.sin(th) * Math.cos(ph) * r); }
    g.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: .8 })); }
  function calle(o = {}) {
    semilla = o.semilla || 11; const g = new THREE.Group();
    const asf = new THREE.Mesh(new THREE.PlaneGeometry(9, 160), mat(0x1a1d26, { roughness: .55, metalness: .1 })); asf.rotation.x = -Math.PI / 2; asf.position.z = -70; asf.receiveShadow = true; g.add(asf);
    for (const s of [-1, 1]) { const b = caja(1.9, .16, 160, mat(0x3a3d48, { roughness: .9 }), [s * 3.3, .08, -70], { r: .03, sombra: false }); g.add(b); }
    const lin = inst(new THREE.PlaneGeometry(.12, 1.6), new THREE.MeshStandardMaterial({ color: 0x8b8f98, roughness: .8 }), 60); for (let i = 0; i < 40; i++) poner(lin, [0, .01, 4 - i * 4], [-Math.PI / 2, 0, 0]); lin.instanceMatrix.needsUpdate = true; g.add(lin);
    const L = hilera(-1, 8, -110), R = hilera(1, 8, -110); g.add(L, R);
    g.add(estrellas());
    g.userData = { L, R }; return g;
  }

  // =============== PASILLO + COCINA ===============
  const texDuela = (k = 1) => { const t = textura(512, 1024, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); const n = 6, aw = w / n; for (let i = 0; i < n; i++) { const off = (i * 397) % 600; x.fillStyle = `rgba(0,0,0,${.03 + (i % 3) * .025})`; x.fillRect(i * aw, 0, aw, h);
      x.fillStyle = 'rgba(6,6,18,.9)'; x.fillRect(i * aw, 0, 5, h); for (let y = off % 700; y < h; y += 700) x.fillRect(i * aw, y, aw, 5); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const texAzulejo = () => { const t = textura(256, 256, (x, w, h) => { x.fillStyle = '#e9edf2'; x.fillRect(0, 0, w, h); x.fillStyle = '#9aa3b4'; for (let i = 0; i <= 4; i++) { x.fillRect(i * 64 - 2, 0, 4, h); x.fillRect(0, i * 64 - 2, w, 4); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const texAjedrez = () => { const t = textura(256, 256, (x) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#15161c' : '#e8e8ec'; x.fillRect(i * 64, j * 64, 64, 64); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.NearestFilter; return t; };
  /* Pasillo a lo largo de -z: desde la puerta de la recámara (z=+3) hasta la cocina (z<-3). Refri al fondo a la derecha, mirando +z, puerta izquierda entreabierta. */
  function pasillo(o = {}) {
    const g = new THREE.Group(), AW = 1.5, LZ0 = 3.2, LZ1 = -3.0, pared = mat(0x161c33, { roughness: .9 }), madera = mat(0x7d7f9c, { roughness: .65, metalness: .0 });
    const td = texDuela(); td.repeat.set(1.5, 3); madera.map = td;
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(AW, LZ0 - LZ1), madera); piso.rotation.x = -Math.PI / 2; piso.position.z = (LZ0 + LZ1) / 2; piso.receiveShadow = true; g.add(piso);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(LZ0 - LZ1, 2.7), pared); p.rotation.y = -s * Math.PI / 2; p.position.set(s * AW / 2, 1.35, (LZ0 + LZ1) / 2); p.receiveShadow = true; g.add(p);
      g.add(caja(.03, .1, LZ0 - LZ1, mat(0x0f1326), [s * (AW / 2 - .015), .05, (LZ0 + LZ1) / 2])); }
    const techo = new THREE.Mesh(new THREE.PlaneGeometry(AW, LZ0 - LZ1), mat(0x0d1122)); techo.rotation.x = Math.PI / 2; techo.position.set(0, 2.7, (LZ0 + LZ1) / 2); g.add(techo);
    // una puerta lateral cerrada en el pasillo (para profundidad)
    const pl = caja(.06, 2.05, .85, mat(0x2A1E18, { roughness: .6 }), [-AW / 2 + .03, 1.03, .4]); g.add(pl); g.add(esfera(.025, mat(P.dorado, { metalness: .75, roughness: .3 }), [-AW / 2 + .08, 1.0, .1]));
    // arco de entrada a la cocina
    const hueso = mat(P.hueso, { roughness: .7 }); g.add(caja(.1, 2.3, .14, hueso, [-AW / 2 + .05, 1.15, LZ1])); g.add(caja(.1, 2.3, .14, hueso, [AW / 2 - .05, 1.15, LZ1])); g.add(caja(AW, .12, .14, hueso, [0, 2.3, LZ1]));
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.7), pared); p.position.set(s * (AW / 2 + .6), 1.35, LZ1 + .01); g.add(p); }
    const ar = new THREE.Mesh(new THREE.PlaneGeometry(AW, .4), pared); ar.position.set(0, 2.55, LZ1 + .01); g.add(ar);
    // ---- cocina ----
    const KW = 3.6, KD = 3.0, kz = LZ1 - KD / 2, ta = texAjedrez(); ta.repeat.set(KW / .5, KD / .5);
    const pk = new THREE.Mesh(new THREE.PlaneGeometry(KW, KD), mat(0xffffff, { map: ta, roughness: .35 })); pk.rotation.x = -Math.PI / 2; pk.position.set(0, .002, kz); pk.receiveShadow = true; g.add(pk);
    const tz = texAzulejo(); tz.repeat.set(KW / .6, 2.7 / .6); const fondo = new THREE.Mesh(new THREE.PlaneGeometry(KW, 2.7), mat(0xffffff, { map: tz, roughness: .4 })); fondo.position.set(0, 1.35, LZ1 - KD); fondo.receiveShadow = true; g.add(fondo);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(KD, 2.7), pared); p.rotation.y = -s * Math.PI / 2; p.position.set(s * KW / 2, 1.35, kz); p.receiveShadow = true; g.add(p); }
    const tk = new THREE.Mesh(new THREE.PlaneGeometry(KW, KD), mat(0x0d1122)); tk.rotation.x = Math.PI / 2; tk.position.set(0, 2.7, kz); g.add(tk);
    // ventana de la cocina con luna y estrellas
    const vz = LZ1 - KD + .02, vw = 1.0, vh = .9; const cielo = new THREE.Mesh(new THREE.PlaneGeometry(vw, vh), new THREE.MeshBasicMaterial({ map: textura(256, 230, (x, w, h) => { const gg = x.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, '#1b2a66'); gg.addColorStop(1, '#2f3f8a'); x.fillStyle = gg; x.fillRect(0, 0, w, h);
      x.fillStyle = '#fff'; for (let i = 0; i < 18; i++) x.fillRect((i * 97) % w, (i * 53) % (h * .8), 2, 2); x.shadowColor = '#dfe8ff'; x.shadowBlur = 30; x.beginPath(); x.arc(w * .68, h * .32, 30, 0, 7); x.fillStyle = '#f2f5ff'; x.fill(); }), fog: false }));
    cielo.material.color.setScalar(1.7); cielo.position.set(-.5, 1.65, vz); g.add(cielo);
    const vm = ventanaCruz({ w: vw, h: vh, color: 0x000000, k: 0 }); vm.userData.cr.visible = false; vm.position.set(-.5, 1.65, vz + .04); g.add(vm);
    // gabinetes, barra, fregadero y grifo
    const gab = mat(0x1e2a4a, { roughness: .6 }), cub = mat(0xcfd3da, { roughness: .4 });
    g.add(caja(1.6, .88, .62, gab, [-.95, .44, LZ1 - KD + .32], { r: .02 })); g.add(caja(1.64, .05, .66, cub, [-.95, .905, LZ1 - KD + .33]));
    for (let i = 0; i < 3; i++) g.add(caja(.012, .7, .01, mat(0x101830), [-1.5 + i * .55, .45, LZ1 - KD + .64]));
    g.add(caja(1.6, .7, .36, gab, [-.95, 2.2, LZ1 - KD + .2], { r: .02 }));
    g.add(caja(.6, .04, .42, mat(0x9aa2ad, { metalness: .6, roughness: .25 }), [-.5, .93, LZ1 - KD + .33]));
    const metal = mat(0xb8bec8, { metalness: .8, roughness: .2 }); const gr = new THREE.Mesh(new THREE.TorusGeometry(.12, .014, 10, 30, Math.PI), metal); gr.position.set(-.5, 1.12, LZ1 - KD + .16); gr.rotation.y = Math.PI / 2; g.add(gr); g.add(cil(.016, .016, .2, metal, [-.5, 1.0, LZ1 - KD + .04]));
    // REFRI: al fondo a la derecha, de frente (+z). Puerta izquierda entreabierta (~10 cm).
    const rf = new THREE.Group(); rf.position.set(.6, 0, LZ1 - KD + .45); g.add(rf); const blanco = mat(0xd6dbe3, { roughness: .4 });
    rf.add(caja(.9, 1.85, .7, blanco, [0, .925, 0], { r: .05 })); const interior = new THREE.Mesh(new THREE.PlaneGeometry(.84, 1.7), brilla(P.refri, 2.6)); interior.position.set(0, .95, .3); rf.add(interior);
    const pD = caja(.44, 1.8, .07, blanco, [.22, .93, .385], { r: .03 }); rf.add(pD); rf.add(caja(.025, .5, .04, metal, [.04, 1.1, .44]));
    const piv = new THREE.Group(); piv.position.set(-.44, 0, .37); rf.add(piv); const pI = caja(.44, 1.8, .07, blanco, [.22, .93, .015], { r: .03 }); piv.add(pI); piv.add(caja(.025, .5, .04, metal, [.4, 1.1, .065])); piv.rotation.y = -.23;
    const sl = new THREE.SpotLight(P.refri, 0, 10, .085, .6, 1.2); sl.position.set(-.38, .95, .5); sl.target.position.set(-.75, 0, 6.5); luzSombra(sl, 1024); rf.add(sl, sl.target);
    const rend = new THREE.Mesh(new THREE.PlaneGeometry(.03, 1.66), brilla(P.refri, 3.2)); rend.position.set(.005, .95, .44); rf.add(rend); rf.add(halo(P.refri, .5, .5, [.0, .9, .5]));
    const pl2 = new THREE.PointLight(P.refri, .9, 1.6, 2); pl2.position.set(.0, .9, .5); rf.add(pl2);
    // franja de luz sobre el piso (trapecio con degradado), del refri hacia la cámara
    const texF = textura(64, 512, (x, w, h) => { const gg = x.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, 'rgba(255,255,255,.35)'); gg.addColorStop(1, 'rgba(255,255,255,1)'); x.fillStyle = gg; x.fillRect(0, 0, w, h);
      const s = x.createLinearGradient(0, 0, w, 0); s.addColorStop(0, 'rgba(0,0,0,1)'); s.addColorStop(.3, 'rgba(0,0,0,0)'); s.addColorStop(.7, 'rgba(0,0,0,0)'); s.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = s; x.fillRect(0, 0, w, h); });
    const fg = new THREE.BufferGeometry(); const zA = LZ1 - KD + .86, zB = LZ0 - .2, xA = .6, xB = .12;
    fg.setAttribute('position', new THREE.Float32BufferAttribute([xA - .04, .006, zA, xA + .04, .006, zA, xB - .16, .006, zB, xB + .16, .006, zB], 3)); fg.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 0, 0, 1, 0], 2)); fg.setIndex([0, 2, 1, 1, 2, 3]);
    const franja = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ color: new THREE.Color(P.refri).multiplyScalar(1.8), map: texF, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); g.add(franja);
    // luz de luna rasante desde la ventana de la cocina
    const luna = new THREE.DirectionalLight(0xa3abd0, .5); luna.position.set(-2.5, 3.2, LZ1 - KD - 2); luna.target.position.set(.3, 0, 1.5); luzSombra(luna, 2048, 5); g.add(luna, luna.target);
    const amb = new THREE.HemisphereLight(0x5a5f90, 0x1a1d33, .9); g.add(amb);
    // marco de la puerta de la recámara (primer plano) y la puerta abierta con manija dorada
    g.add(caja(.12, 2.4, .16, hueso, [-AW / 2 + .02, 1.2, LZ0])); g.add(caja(.12, 2.4, .16, hueso, [AW / 2 - .02, 1.2, LZ0])); g.add(caja(AW + .1, .12, .16, hueso, [0, 2.4, LZ0]));
    const pu = new THREE.Group(); pu.position.set(-AW / 2 + .06, 0, LZ0 + .05); g.add(pu); pu.add(caja(.85, 2.25, .05, mat(0x2A1E18, { roughness: .6 }), [-.43, 1.13, 0])); pu.rotation.y = 1.25;
    const man = caja(.14, .025, .025, mat(P.dorado, { metalness: .75, roughness: .28 }), [-.74, 1.02, .05], { r: .01 }); pu.add(man);
    g.userData = { refri: rf, franja, puertaRefri: piv, spot: sl, LZ0, LZ1, KD }; return g;
  }

  window.Q = { P, mat, brilla, aditivo, cajaGeo, caja, esfera, cil, textura, halo, conoLuz, escena, luzSombra, polvo, moverPolvo, personaje, mano, celular, pantallaA, pantallaB, pantallaC,
    reloj, texReloj, buro, cama, ventanaCruz, recamara, hilera, colorVentana, auto, farola, perro, estrellas, calle, pasillo, rnd, SW, SH };
})();
