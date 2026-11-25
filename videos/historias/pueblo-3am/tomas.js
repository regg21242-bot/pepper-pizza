/* En este pueblo, todos despiertan a las 3 a.m. — una toma por línea del guion */
(function () {
  const reloj2D = (x, texto, a = 1) => { x.save(); x.globalAlpha = a; x.font = '700 120px "DejaVu Sans Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#FF3B30'; x.shadowBlur = 30; x.fillStyle = '#FF4A3D'; x.fillText(texto, 540, 470); x.restore(); };
  // calle de noche con fachadas a los dos lados y gente asomada
  function calleFachadas(K, o = {}) { const s = K.escena('#05060C'); const est = K.noche(s, { hemi: .45, i: .7, n1: 120 }); K.piso(s, '#2E4A2E', null); K.calle(s, { ancho: 7 });
    const asom = []; const cols = ['#8A7A9A', '#9A7A6A', '#6A8A9A', '#A89A7A', '#7A8A6A', '#9A6A7A'];
    for (const sx of [-1, 1]) for (let i = 0; i < 7; i++) { const f = K.fachada({ w: 6, pisos: 2, cols: 2, col: cols[(i * 2 + (sx > 0 ? 1 : 0)) % cols.length], semilla: 10 + i * 3 + (sx > 0 ? 50 : 0), gente: o.gente != null ? o.gente : .95, encendidas: o.encendidas != null ? o.encendidas : 1, expr: o.expr || 'vacio' });
      f.position.set(sx * 8.2, 0, 4 - i * 7); f.rotation.y = -sx * Math.PI / 2; s.add(f); asom.push(...f.userData.asomados); }
    for (let i = 0; i < 6; i++) { const fa = K.farol(i % 2 ? 1 : -1, true); fa.position.set((i % 2 ? 1 : -1) * 4.9, 0, 2 - i * 9); s.add(fa); }
    return { s, est, asom }; }
  // las cabezas giran de la calle (frente) a mirar un punto
  function mirar(asom, objetivo, k) { const v = new K.THREE.Vector3(); asom.forEach(({ a, cab }) => { a.updateMatrixWorld(true); const p = a.getWorldPosition(v); const dx = objetivo[0] - p.x, dz = objetivo[2] - p.z;
      const rot = a.parent.rotation.y; const ang = Math.atan2(dx, dz) - rot; cab.rotation.y = Math.max(-1.3, Math.min(1.3, Math.atan2(Math.sin(ang), Math.cos(ang)))) * k; cab.rotation.x = -.18 * k; }); }

  window.TOMAS = [
    // 0 — vista aérea del pueblo dormido, 3:00
    (K) => { const P = K.CREA.pueblo({ sinProta: true }); return { scene: P.scene, cam: K.cam([2, 22, 26], [0, 0, -18], 52), cam2: K.cam([1.5, 18, 18], [0, 0, -22], 52), anima: (t) => P.anima(t),
      encima: (x, t) => reloj2D(x, '3:00', Math.min(1, t * 2) * (.75 + .25 * Math.sin(t * 6))) }; },
    // 1 — alguien dormido abre los ojos de golpe
    (K) => { const s = K.escena('#06070E'); K.cuarto(s, { pared: '#232A4A', w: 6, d: 6 }); K.hemi(s, '#5A6AB0', '#141420', .5); const c = K.cama('#5A4A8A'); c.position.set(0, 0, -1.6); s.add(c);
      const a = K.persona({ i: 4, expr: 'dormido' }); a.rotation.x = -Math.PI / 2; a.position.set(0, .7, -.62); a.scale.setScalar(.9); s.add(a); c.userData.cobija.visible = false; s.add(K.caja(1.34, .14, 1.15, K.mat('#5A4A8A', { roughness: .95 }), 0, .86, -1.3, .06));
      const r = K.reloj('3:00'); r.position.set(1.05, .55, -2.4); s.add(r); const mes = K.caja(.5, .55, .45, K.mat('#FFFFFF', { map: K.TEX.madera }), 1.05, .27, -2.4, .03); s.add(mes);
      K.foco(s, '#7F9CFF', 1.2, [-1.5, 2.2, 0], 7);
      return { scene: s, cam: K.cam([1.9, 1.75, -1.0], [0, .75, -2.2], 46), cam2: K.cam([1.45, 1.5, -1.45], [0, .75, -2.2], 40), anima: (t) => { a.cara(t > .9 ? 'vacio' : 'dormido'); a.userData.cabeza.rotation.y = .75; }, sacudida: (t) => t > .9 && t < 1.2 ? 1 : 0, post: { ap: .25 } }; },
    // 2 — se levanta y se asoma por la ventana (de espaldas)
    (K) => { const s = K.escena('#06070E'); K.cuarto(s, { pared: '#232A4A', w: 6, d: 6 }); K.hemi(s, '#7A8AD0', '#202030', .8); const v = K.ventana({ w: 1.6, h: 1.5, vidrio: '#2A3A80', brillo: .9 }); v.position.set(0, 1.6, -2.88); s.add(v);
      const sp = new K.THREE.SpotLight('#8FA8FF', 3, 10, .55, .6, 1.2); sp.position.set(0, 1.8, -2.6); sp.target.position.set(0, 0, 1.5); sp.castShadow = true; s.add(sp, sp.target);
      const a = K.persona({ i: 4, expr: 'vacio' }); a.position.set(0, 0, 1.2); a.rotation.y = Math.PI; s.add(a);
      return { scene: s, cam: K.cam([.9, 1.4, 3.4], [0, 1.2, -2], 46), anima: (t, tg, k) => { a.position.z = 1.2 - 3.2 * Math.min(1, t / 2.2); a.pose(t, t < 2.2 ? 'caminar' : 'quieto'); }, post: { ap: .12 } }; },
    // 3 — la calle: todos en la ventana mirando abajo, sin hablar (15 min)
    (K) => { const C = calleFachadas(K, {}); mirar(C.asom, [0, 0, -5], 0); C.asom.forEach(({ cab }) => { cab.rotation.x = .35; });
      return { scene: C.s, cam: K.cam([-1, 2.0, 3], [-8.2, 3.6, -6], 46), cam2: K.cam([-2.2, 2.4, 0], [-8.2, 3.8, -6], 42), anima: (t) => C.est.anima(t),
        encima: (x, t) => { const m = Math.min(15, Math.floor(t * 6)); reloj2D(x, `3:${String(m).padStart(2, '0')}`, .9); } }; },
    // 4 — de día: el protagonista llega con su caja de mudanza
    (K) => { const s = K.escena('#9CC4E8'); K.dia(s, {}); K.piso(s, '#5E8A44', null); K.calle(s, { ancho: 7 });
      for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) { const f = K.fachada({ w: 6, pisos: 2, cols: 2, col: ['#C8B89A', '#9AB8C8', '#C89AA8', '#A8C89A', '#E0C890'][(i + (sx > 0 ? 2 : 0)) % 5], semilla: 70 + i + (sx > 0 ? 9 : 0), gente: 0, encendidas: 0, luzCol: '#222' }); f.position.set(sx * 8.2, 0, 2 - i * 7); f.rotation.y = -sx * Math.PI / 2; s.add(f); }
      const p = K.prota('feliz', 'sostener'); p.position.set(-1.2, 0, 2); s.add(p); const caja = K.caja(.55, .4, .45, K.mat('#C8A06A', { roughness: .9 }), 0, 0, 0, .02); s.add(caja);
      return { scene: s, cam: K.cam([1.6, 1.3, 6], [-.6, 1.2, 0], 46), anima: (t) => { p.position.z = 2 - t * .9; p.pose(t, 'caminar'); p.userData.brazos.forEach(b => { b.rotation.x = -1.05; b.rotation.z = (b === p.userData.brazos[0] ? .42 : -.42); }); caja.position.set(p.position.x, 1.05, p.position.z + .35); }, post: { ap: .08 } }; },
    // 5 — primera noche: el protagonista despierta, el reloj marca 3:00
    (K) => { const s = K.escena('#06070E'); K.cuarto(s, { pared: '#1E2A5A', w: 6, d: 6 }); K.hemi(s, '#5A6AB0', '#141420', .5); const c = K.cama('#2F57B8'); c.position.set(0, 0, -1.4); s.add(c);
      const p = K.prota('dormido'); p.rotation.x = -Math.PI / 2; p.position.set(0, .7, -.42); p.scale.setScalar(.9); s.add(p);
      const r = K.reloj('2:59'); r.position.set(1.05, .55, -2.2); s.add(r); s.add(K.caja(.5, .55, .45, K.mat('#FFFFFF', { map: K.TEX.madera }), 1.05, .27, -2.2, .03));
      const v = K.ventana({ w: 1.3, h: 1.2 }); v.position.set(-1.6, 1.7, -2.88); s.add(v); K.foco(s, '#7F9CFF', 1, [-1.4, 2, -1.8], 6);
      return { scene: s, cam: K.cam([2.4, 1.7, 1.0], [.4, .75, -1.6], 46), cam2: K.cam([1.9, 1.5, .3], [.4, .75, -1.7], 44),
        anima: (t) => { const des = t > 1.0; r.poner(des ? '3:00' : '2:59'); p.cara(des ? 'sorpresa' : 'dormido'); const u = Math.min(1, Math.max(0, (t - 1.1) / .4)); if (u > 0) { p.pose(t, 'sentado'); p.rotation.x = -Math.PI / 2 * (1 - u); p.position.set(0, .7 + .2 * u, -.42 - 1.45 * u); } } }; },
    // 6 — "pero no miraban la calle": las cabezas giran hacia la cámara (la ventana del protagonista)
    (K) => { const C = calleFachadas(K, {}); const ojo = [3.5, 4.2, 6];
      return { scene: C.s, cam: K.cam([3.5, 4.2, 6], [-4, 3.6, -8], 50), cam2: K.cam([3.4, 4.2, 5.4], [-4, 3.4, -8], 48), anima: (t) => { C.est.anima(t); const k = Math.min(1, Math.max(0, (t - .4) / 1.2)); mirar(C.asom, ojo, k * k * (3 - 2 * k)); } }; },
    // 7 — "me miraban a mí": primer plano de una cara vacía en la ventana de enfrente
    (K) => { const C = calleFachadas(K, {}); const V = new K.THREE.Vector3(); C.s.updateMatrixWorld(true);
      const cand = C.asom.filter(({ a }) => a.parent.position.x < 0 && a.position.y > 2).map(o => ({ o, p: o.cab.getWorldPosition(new K.THREE.Vector3()) })).sort((u, v) => Math.abs(u.p.z + 4) - Math.abs(v.p.z + 4));
      const H = cand[0].p.clone(); H.y += .1; const ojo = [H.x + 3.2, H.y + .1, H.z + .4];
      return { scene: C.s, cam: K.cam(ojo, [H.x, H.y, H.z], 32), cam2: K.cam([H.x + 2.0, H.y + .05, H.z + .25], [H.x, H.y, H.z], 30), anima: (t) => { C.est.anima(t); mirar(C.asom, ojo, 1); }, sacudida: .3, post: { ap: .15 } }; },
    // 8 — al día siguiente, el vecino sonríe… y al final sus ojos se vacían
    (K) => { const s = K.escena('#9CC4E8'); K.dia(s, { i: 1.3 }); K.piso(s, '#5E8A44', null); K.calle(s, { ancho: 7 }); const f = K.fachada({ w: 7, pisos: 2, cols: 2, col: '#C8B89A', semilla: 5, gente: 0, encendidas: 0, luzCol: '#222' }); f.position.set(0, 0, -4); s.add(f);
      const v = K.persona({ i: 9, expr: 'sonrisa', avatar: { pelo: 'corto', colPelo: '#5A3A22', torso: '#7A8A6A' } }); v.position.set(.75, 0, -.2); v.rotation.y = -.5; s.add(v);
      const p = K.prota('preocupado'); p.position.set(-.75, 0, .2); p.rotation.y = .6; s.add(p); const fin = window.T.lineas[8].fin - window.T.lineas[8].corte;
      return { scene: s, cam: K.cam([-.2, 1.45, 4.4], [-.1, 1.2, -.1], 50), cam2: K.cam([.3, 1.5, 2.4], [.7, 1.45, -.2], 34), anima: (t) => { v.cara(t > fin - 1.1 ? 'vacio' : 'sonrisa'); v.pose(t, 'quieto'); p.pose(t, 'quieto'); }, post: { ap: .1 } }; },
    // 9 — final: todo el pueblo en la ventana… y el protagonista también (ventana del 2.º piso, primera casa de la derecha)
    (K) => { const C = calleFachadas(K, {}); mirar(C.asom, [0, 0, -6], 1); C.asom.forEach(({ cab }) => { cab.rotation.x = .3; });
      const sit = C.asom.find(({ a }) => a.parent.position.x > 0 && a.parent.position.z === 4 && a.position.y > 2) || C.asom[0]; const p = K.prota('vacio'); p.position.copy(sit.a.position); sit.a.parent.add(p); sit.a.visible = false; p.userData.cabeza.rotation.set(.3, 0, 0);
      const W = new K.THREE.Vector3(); sit.a.parent.updateMatrixWorld(true); p.getWorldPosition(W);
      return { scene: C.s, cam: K.cam([-2, 1.8, 14], [3, 3.4, -6], 46), cam2: K.cam([W.x - 4.2, W.y + 1.4, W.z + 2.6], [W.x, W.y + 1.5, W.z], 34), anima: (t) => C.est.anima(t), encima: (x, t) => reloj2D(x, '3:00', .85) }; },
  ];
})();
