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

  // ===== ESCENA 1 — Despertar =====
  S[0] = (Q) => {
    const s = Q.escena({ fondo: 0x1a0306, niebla: .015, nieblaColor: 0x3a0a0e });
    const rc = Q.recamara({ pared: 0x3a0d12 }); s.add(rc); const L = luzRoja(Q, s);
    const yo = Q.personaje(); yo.position.set(-.93, .83, -.1); yo.rotation.set(0, 1.0, 1.3); s.add(yo);
    const cel = Q.celular({ luz: 1.0, color: 0xff5a4c, brillo: 2.1 }); cel.scale.setScalar(1.5); cel.rotation.set(-Math.PI / 2 + .1, 0, 0); const celG = new THREE.Group(); celG.add(cel); celG.position.set(-.42, .752, .1); celG.rotation.y = Math.PI / 2 - .55; s.add(celG);
    const pol = Q.polvo(160, [3, 2.4, 2.5], 0xff9a9a, .01); pol.position.set(-.5, .3, 0); s.add(pol);
    return { scene: s,
      cam: [[.55, 1.9, .9], [-.8, .86, -.06], 36], cam2: [[.2, 1.6, .62], [-.7, .86, -.02], 36],
      anima(tl, tg) { cel.userData.pinta(x => Q.pantallaA(x, tl)); const vib = (Math.floor(tl * 4) % 2 === 0) ? 1 : 0; cel.position.x = Math.sin(tl * 2 * Math.PI * 20) * .002 * vib; cel.position.z = Math.cos(tl * 2 * Math.PI * 20) * .0015 * vib;
        // parpadeo lento al abrir los ojos (6 cuadros) cerca de 1.2 s
        const a = clamp((tl - 1.1) / .2); yo.userData.ojo(tl < 1.1 ? .08 : a); Q.moverPolvo(pol, tg); },
      post: { ap: .05, bloom: 1.25, umbral: .7 }, ca: .0015,
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
