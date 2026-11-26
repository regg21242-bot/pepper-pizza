/* Las 24 escenas de "Quédate a oscuras" (una por entrada; el índice = escena - 1). */
(function () {
  const THREE = window.THREE, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const S = [];
  const pendiente = (n) => (Q) => { const s = Q.escena({ fondo: 0x05060a }); return { scene: s, cam: [[0, 0, 5], [0, 0, 0], 45], encima(x) { x.fillStyle = '#333'; x.font = '700 60px Inter'; x.textAlign = 'center'; x.fillText('Escena ' + n, 540, 960); x.textAlign = 'left'; } }; };
  for (let i = 1; i <= 24; i++) S.push(pendiente(i));

  // ---------- luz roja de alerta para la recámara ----------
  function luzRoja(Q, s, k = 1) {
    const hemi = new THREE.HemisphereLight(0xff3b3b, 0x1a0204, .18 * k); s.add(hemi);
    const amb = new THREE.AmbientLight(Q.P.rojoAmb, .35 * k); s.add(amb);
    const vent = new THREE.SpotLight(Q.P.rojo, 3.2 * k, 9, .9, .8, 1.4); vent.position.set(.9, 2.2, -2.2); vent.target.position.set(-.6, .5, .4); Q.luzSombra(vent, 2048); s.add(vent, vent.target);
    return { hemi, amb, vent };
  }

  // ===== ESCENA 1 — Despertar =====
  S[0] = (Q) => {
    const s = Q.escena({ fondo: 0x1a0306, niebla: .015, nieblaColor: 0x3a0a0e });
    const rc = Q.recamara({ pared: 0x3a0d12 }); s.add(rc); const L = luzRoja(Q, s);
    const yo = Q.personaje(); yo.position.set(-.93, .83, -.1); yo.rotation.set(0, .3, 1.5); s.add(yo);
    const cel = Q.celular({ luz: 2.2 }); cel.scale.setScalar(1.5); cel.position.set(-.38, .75, .14); cel.rotation.set(-Math.PI / 2 + .12, 0, -.5); s.add(cel);
    const pol = Q.polvo(160, [3, 2.4, 2.5], 0xff9a9a, .01); pol.position.set(-.5, .3, 0); s.add(pol);
    return { scene: s,
      cam: [[.7, 1.62, .78], [-.7, .76, -.04], 36], cam2: [[.4, 1.45, .6], [-.68, .77, -.02], 36],
      anima(tl, tg) { cel.userData.pinta(x => Q.pantallaA(x, tl)); const vib = (Math.floor(tl * 4) % 2 === 0) ? 1 : 0; cel.position.x = -.42 + Math.sin(tl * 2 * Math.PI * 20) * .002 * vib; cel.position.z = .12 + Math.cos(tl * 2 * Math.PI * 20) * .0015 * vib;
        // parpadeo lento al abrir los ojos (6 cuadros) cerca de 1.2 s
        const a = clamp((tl - 1.1) / .2); yo.userData.ojo(tl < 1.1 ? .08 : a); Q.moverPolvo(pol, tg); },
      post: { ap: .05, bloom: 1.0 }, ca: .0015,
      sacudida: (tl) => tl < 4 / 30 ? 1 : 0 };
  };

  // ===== ESCENA 7 — La ciudad muerta =====
  function calleNoche(Q, o = {}) {
    const s = Q.escena({ fondo: 0x0d1222, niebla: o.niebla || .045, nieblaColor: 0x1c2340 });
    const c = Q.calle({ semilla: 11 }); s.add(c);
    const luna = new THREE.DirectionalLight(Q.P.luna, .3); luna.position.set(-20, 40, -30); s.add(luna);
    s.add(new THREE.HemisphereLight(0x3a4a8a, 0x0b0f1c, .12));
    const cg = Q.textura(4, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0e1328'); g.addColorStop(.55, '#1a2140'); g.addColorStop(1, '#262f52'); x.fillStyle = g; x.fillRect(0, 0, w, h); }); cg.encoding = THREE.LinearEncoding; s.background = cg;
    // ventanas: unas cálidas con cortina, unas azules de TV, la mayoría negras
    const cal = new THREE.Color(Q.P.ventCalida).multiplyScalar(2.2), cal2 = new THREE.Color(Q.P.ventCalida2).multiplyScalar(1.6), tv = new THREE.Color(0x7D8FD0).multiplyScalar(1.5);
    let sem = 5; const r = () => { sem = (sem * 16807) % 2147483647; return sem / 2147483647; };
    for (const h of [c.userData.L, c.userData.R]) h.userData.ventanas.forEach(v => { const q = r(); if (q < .09) Q.colorVentana(h, v.i, cal); else if (q < .13) Q.colorVentana(h, v.i, cal2); else if (q < .17) Q.colorVentana(h, v.i, tv); });
    const autos = [[2.0, -4.5, 0x3b4458, 0], [2.0, -12.5, 0x464d5e, 0], [-2.0, -16, 0x343c50, Math.PI]].map(([x, z, col, ry]) => { const a = Q.auto(col); a.position.set(x, 0, z); a.rotation.y = ry; s.add(a); return a; });
    const fs = [[3.55, -4.5, -1], [-3.55, -17, 1], [3.55, -30, -1], [-3.55, -43, 1]].map(([x, z, l]) => { const f = Q.farola({ lado: l, i: 10 }); f.position.set(x, 0, z); s.add(f); return f; });
    const dog = Q.perro(); dog.position.set(2.5, .16, -1.2); dog.rotation.y = -.45; s.add(dog);
    return { s, c, autos, fs, dog };
  }
  S[6] = (Q) => {
    const C = calleNoche(Q);
    return { scene: C.s, cam: [[.8, 1.3, 7.5], [1.0, 2.6, -30], 50], cam2: [[.78, 1.3, 7.0], [1.0, 2.6, -30], 50],
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

  window.ESCENAS = S;
})();
