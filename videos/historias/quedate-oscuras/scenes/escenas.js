/* Las 24 escenas de "Quédate a oscuras" (una por entrada; el índice = escena - 1). */
(function () {
  const THREE = window.THREE, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const S = [];
  const pendiente = (n) => (Q) => { const s = Q.escena({ fondo: 0x05060a }); return { scene: s, cam: [[0, 0, 5], [0, 0, 0], 45], encima(x) { x.fillStyle = '#333'; x.font = '700 60px Inter'; x.textAlign = 'center'; x.fillText('Escena ' + n, 540, 960); x.textAlign = 'left'; } }; };
  for (let i = 1; i <= 24; i++) S.push(pendiente(i));

  // ---------- luz roja de alerta para la recámara ----------
  function luzRoja(Q, s, k = 1) {
    const hemi = new THREE.HemisphereLight(0xffa49a, 0x2a0608, .2 * k); s.add(hemi);
    const amb = new THREE.AmbientLight(Q.P.rojoAmb, .2 * k); s.add(amb);
    const vent = new THREE.SpotLight(0xff6a5c, 1.5 * k, 9, .9, .8, 1.4); vent.position.set(.9, 2.2, -2.2); vent.target.position.set(-.6, .5, .4); Q.luzSombra(vent, 2048); s.add(vent, vent.target);
    return { hemi, amb, vent };
  }

  // ===== ESCENA 1 — Despertar (como la referencia: cabeza de lado en la almohada, cobija esponjosa, celular brillando encima) =====
  S[0] = (Q) => {
    const s = Q.escena({ fondo: 0x2a0a10 });
    // textura "felpa" moteada para almohada y cobija
    const felpa = (base) => Q.textura(256, 256, (x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h); let r = 7; const R = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
      for (let i = 0; i < 260; i++) { const cx = R() * w, cy = R() * h, rad = 6 + R() * 22; const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad); const d = R() < .5; g.addColorStop(0, d ? 'rgba(90,20,30,.16)' : 'rgba(255,230,230,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2); } });
    const tFel = felpa('#df928b'); tFel.wrapS = tFel.wrapT = THREE.RepeatWrapping; tFel.repeat.set(2, 2);
    const mCob = Q.mat(0xdc8f89, { roughness: .97 }), mAlm = Q.mat(0xf4ccc7, { roughness: .97 });
    // pared, cabecera y piso
    const pared = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), Q.mat(0x4a1420, { roughness: .95 })); pared.position.set(0, 2, -2.2); pared.receiveShadow = true; s.add(pared);
    s.add(Q.caja(2.6, 1.6, .14, Q.mat(0x2a0a12, { roughness: .8 }), [0, .9, -1.75], { r: .05 }));
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), Q.mat(0x2a0c10)); piso.rotation.x = -Math.PI / 2; s.add(piso);
    // colchón
    s.add(Q.caja(2.5, .42, 3.6, Q.mat(0xd9a8a6, { roughness: .95 }), [0, .21, 0], { r: .12, seg: 5 }));
    // almohada esponjosa
    s.add(Q.caja(1.45, .42, .85, mAlm, [-.25, .6, -1.08], { r: .19, seg: 8 }));
    // cabeza de lado sobre la almohada (arriba de la cabeza hacia la izquierda, oreja arriba, cara hacia la cámara)
    const yo = Q.personaje(); yo.scale.setScalar(1.65); yo.position.set(-.5, 1.06, -1.05); yo.rotation.set(-.15, .35, -Math.PI / 2 + .1); s.add(yo);
    // cobija grande y esponjosa (tapa el cuerpo), con el borde de arriba doblado
    s.add(Q.caja(2.4, .3, 2.1, mCob, [.05, .5, .55], { r: .15, seg: 8 }));
    const dob = new THREE.Mesh(new THREE.CapsuleGeometry(.16, 2.0, 10, 28), mCob); dob.rotation.z = Math.PI / 2; dob.scale.set(1, .55, .8); dob.position.set(.05, .69, -.36); dob.castShadow = dob.receiveShadow = true;
    // bulto del cuerpo bajo la cobija (primer plano izquierdo, desenfocado)
    const bul = new THREE.Mesh(new THREE.SphereGeometry(.5, 32, 20), mCob); bul.scale.set(.75, .6, 1.5); bul.position.set(-.42, .72, 1.25); bul.castShadow = bul.receiveShadow = true; s.add(bul);
    // celular acostado sobre la cobija
    const cel = Q.celular({ luz: 1.4, color: 0xff5a4c, brillo: 2.3 }); cel.scale.setScalar(2.4); cel.rotation.set(-Math.PI / 2, 0, 0);
    const celG = new THREE.Group(); celG.add(cel); celG.position.set(.32, .656, .12); celG.rotation.y = -.35; s.add(celG);
    // luz: roja general, llave rosada desde el frente, toque morado arriba a la izquierda
    s.add(new THREE.HemisphereLight(0x6a3a7a, 0x5a1018, .55)); s.add(new THREE.AmbientLight(0x8a1a22, .35));
    const key = new THREE.SpotLight(0xff9080, 1.35, 12, .8, .7, 1.2); key.position.set(2.6, 2.8, 1.6); key.target.position.set(-.1, .6, -.6); Q.luzSombra(key, 2048); s.add(key, key.target);
    const rel = new THREE.PointLight(0xff4a4a, .8, 4, 2); rel.position.set(-1.4, 1.4, -.4); s.add(rel); const mor = new THREE.PointLight(0x7a5aff, .45, 5, 2); mor.position.set(-1.6, 2.2, -1.4); s.add(mor);
    const pol = Q.polvo(140, [3, 2.2, 3], 0xffb0b0, .012); pol.position.set(0, .5, -.3); s.add(pol);
    return { scene: s,
      cam: [[1.1, 2.0, 2.0], [-.22, .78, -.75], 38], cam2: [[.85, 1.72, 1.3], [.15, .68, -.1], 38],
      anima(tl, tg) { cel.userData.pinta(x => Q.pantallaA(x, tl)); const vib = (Math.floor(tl * 4) % 2 === 0) ? 1 : 0; cel.position.x = Math.sin(tl * 2 * Math.PI * 20) * .003 * vib; cel.position.y = Math.cos(tl * 2 * Math.PI * 20) * .002 * vib;
        // ojos cerrados y se abren cerca de 1.2 s
        const a = clamp((tl - 1.1) / .2); yo.userData.ojo(tl < 1.1 ? .08 : a); Q.moverPolvo(pol, tg); },
      post: { ap: .05, bloom: 1.1, umbral: .72 }, ca: .0012,
      grade: { sat: .78, luz: 1.12, con: .95, piso: '#1a0c12' },
      sacudida: (tl) => tl < 4 / 30 ? 1 : 0 };
  };

  // ===== ESCENA 7 — La ciudad muerta =====
  function calleNoche(Q, o = {}) {
    const NB = o.nieblaColor || 0x2A3350, s = Q.escena({ fondo: NB, niebla: o.niebla || .03, nieblaColor: NB });
    const c = Q.calle({ semilla: 11 }); s.add(c);
    // domo de cielo que SÍ recibe niebla: #2A3350 en el horizonte → #0B0F1C arriba
    const dg = new THREE.SphereGeometry(60, 32, 16), col = [], cH = new THREE.Color(o.horizonte || 0x2A3350), cT = new THREE.Color(o.cenit || 0x0B0F1C);
    for (let i = 0; i < dg.attributes.position.count; i++) { const y = dg.attributes.position.getY(i) / 60; const cc = cH.clone().lerp(cT, Math.min(1, Math.max(0, y * 1.6))); col.push(cc.r, cc.g, cc.b); }
    dg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); const domo = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: true, depthWrite: false, depthTest: false }));
    domo.renderOrder = -10; domo.position.set(0, 0, -10); s.add(domo);
    const luna = new THREE.DirectionalLight(Q.P.luna, .5); luna.position.set(-20, 40, -30); s.add(luna);
    s.add(new THREE.HemisphereLight(0x3a4a8a, 0x0b0f1c, .25));
    // ventanas: unas cálidas con cortina, unas azules de TV, la mayoría negras
    const cal = new THREE.Color(Q.P.ventCalida).multiplyScalar(1.6), cal2 = new THREE.Color(Q.P.ventCalida2).multiplyScalar(1.2), tv = new THREE.Color(0x7D8FD0).multiplyScalar(1.1);
    let sem = 5; const r = () => { sem = (sem * 16807) % 2147483647; return sem / 2147483647; };
    for (const h of [c.userData.L, c.userData.R]) h.userData.ventanas.forEach(v => { const q = r(); if (q < .13) Q.colorVentana(h, v.i, cal); else if (q < .18) Q.colorVentana(h, v.i, cal2); else if (q < .22) Q.colorVentana(h, v.i, tv); });
    const autos = [[2.0, -4.5, 0x3b4458, 0], [2.0, -12.5, 0x464d5e, 0], [-2.0, -16, 0x343c50, Math.PI]].map(([x, z, col, ry]) => { const a = Q.auto(col); a.position.set(x, 0, z); a.rotation.y = ry; s.add(a); return a; });
    const fs = [[3.55, -4.5, -1], [-3.55, -17, 1], [3.55, -30, -1], [-3.55, -43, 1]].map(([x, z, l]) => { const f = Q.farola({ lado: l, i: 6 }); f.position.set(x, 0, z); s.add(f); return f; });
    const dog = Q.perro(); dog.scale.setScalar(1.25); dog.position.set(3.05, .16, -2.6); dog.rotation.y = -Math.PI / 2 + .25; s.add(dog);
    return { s, c, autos, fs, dog };
  }
  S[6] = (Q) => {
    const C = calleNoche(Q);
    return { scene: C.s, cam: [[1.25, 1.3, 7.5], [1.2, 2.6, -30], 50], cam2: [[1.22, 1.3, 7.0], [1.2, 2.6, -30], 50],
      anima(tl) { // la farola de enfrente parpadea dos veces y se queda prendida
        const f = C.fs[0], p = (tl > .5 && tl < .62) || (tl > .8 && tl < .9) ? .15 : 1; f.userData.k(p); },
      post: { ap: .02, bloom: .9 } };
  };

  // ===== ESCENA 21 — El pasillo cruje =====
  S[20] = (Q) => {
    const s = Q.escena({ fondo: 0x05070e, niebla: .015, nieblaColor: 0x1b2440 }); const p = Q.pasillo(); s.add(p);
    const pol = Q.polvo(90, [1.4, 1.6, 5], 0xdfe6ff, .006); pol.position.set(0, 0, 0); s.add(pol);
    return { scene: s, cam: [[.05, 1.25, 4.4], [.05, .75, -3.5], 48], cam2: [[.05, 1.2, 3.85], [.05, .72, -3.5], 48],
      anima(tl, tg) { Q.moverPolvo(pol, tg, .01); p.userData.spot.intensity = 0 * (1 + .03 * Math.sin(tg * 2 * Math.PI * 60 / 30)); },
      post: { ap: .05, bloom: 1.0 } };
  };


  // ===== ESCENA 12 — Los vecinos se apagan (prueba) =====
  S[11] = (Q, tq) => {
    const NB = 0x2A3350, s = Q.escena({ fondo: NB, niebla: .03, nieblaColor: NB });
    const dg = new THREE.SphereGeometry(80, 32, 16), col = [], cH = new THREE.Color(NB), cT = new THREE.Color(0x0B0F1C);
    for (let i = 0; i < dg.attributes.position.count; i++) { const y = dg.attributes.position.getY(i) / 80; const cc = cH.clone().lerp(cT, clamp(y * 1.6)); col.push(cc.r, cc.g, cc.b); }
    dg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); const domo = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: true, depthWrite: false, depthTest: false })); domo.renderOrder = -10; s.add(domo);
    const st = Q.estrellas(160, 70); s.add(st);
    const f = Q.fachada({ pisos: 7 }); f.position.set(0, 0, -14); s.add(f);
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), Q.mat(0x161a24, { roughness: .6 })); suelo.rotation.x = -Math.PI / 2; s.add(suelo);
    const luna = new THREE.DirectionalLight(Q.P.luna, 1.0); luna.position.set(-15, 30, 20); s.add(luna); s.add(new THREE.HemisphereLight(0x4a5a9a, 0x0b0f1c, .45));
    const fa = Q.farola({ lado: 1, i: 5 }); fa.position.set(-6.5, 0, -8.5); s.add(fa);
    // 14 encendidas: 11 cálidas y 3 de TV, en orden de apagado (de abajo hacia arriba, siguiendo el paneo)
    const V = f.userData.ventanas.slice().sort((a, b) => a.p - b.p || a.c - b.c);
    let sem = 3; const r = () => { sem = (sem * 16807) % 2147483647; return sem / 2147483647; };
    const elegidas = []; const porPiso = [2, 2, 2, 2, 2, 2, 2];
    for (let p = 0; p < 7; p++) { const cand = V.filter(v => v.p === p).sort(() => r() - .5).slice(0, porPiso[p]); elegidas.push(...cand); }
    const tv = new Set([2, 7, 11]); elegidas.forEach((v, i) => f.userData.prender(v, tv.has(i) ? 'tv' : 'a'));
    const T0 = window.EV.apagados12;
    return { scene: s,
      cam: (tl, k) => [[0, 1.6, 9], [0, 4 + 13.5 * k, -14], 50],
      anima(tl, tg) {
        elegidas.forEach((v, i) => { const t = T0[i]; if (tg >= t) { if (v.encendida) f.userData.apagar(v); return; }
          if (!v.encendida) f.userData.prender(v, v.tipo || 'a');
          const pre = t - tg; let k = 1; if (pre < 2 / 30) k = pre < 1 / 30 ? .35 : 1.25; // parpadeo 2 cuadros antes
          if (v.tipo === 'tv') k *= .8 + .2 * Math.sin(tg * 23 + i); f.userData.brillo(v, k); });
        // la farola se queda prendida (azul noche + niebla); al final solo luna
      },
      post: { ap: .02, bloom: 1.0 } };
  };

  window.ESCENAS = S;
})();
