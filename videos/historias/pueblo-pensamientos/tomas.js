/* En este pueblo, todos escuchan lo que piensas — una toma por línea del guion */
(function () {
  const COLS = ['#E8C89A', '#9AC8D8', '#E8A8B8', '#B8D89A', '#F0D890', '#C8A8E0'];
  function pueblo(K, o = {}) { const s = K.escena('#9CC4E8'); K.dia(s, { i: o.tarde ? 1.2 : 1.5, arriba: o.tarde ? '#E8906A' : undefined, horizonte: o.tarde ? '#FFD8A0' : undefined, dir: o.tarde ? [-30, 12, 10] : undefined }); K.piso(s, '#6E9A4E'); K.calle(s, { ancho: 7 });
    for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { const f = K.fachada({ w: 6, pisos: 2, cols: 2, col: COLS[(i * 2 + (sx > 0 ? 1 : 0)) % COLS.length], semilla: 20 + i + (sx > 0 ? 30 : 0), gente: 0, encendidas: 0 }); f.position.set(sx * 8.2, 0, 4 - i * 7); f.rotation.y = -sx * Math.PI / 2; s.add(f); }
    for (let i = 0; i < 5; i++) { const a = K.arbol(1 + (i % 2) * .2); a.position.set((i % 2 ? 1 : -1) * 5.6, 0, 1 - i * 8); s.add(a); }
    return s; }
  // persona con burbuja encima
  function conBurbuja(K, s, a, texto, o = {}) { const b = K.burbuja(texto, { tam: o.tam || 1.3 }); b.position.set(o.dx || .55, o.y || 2.45, 0); a.add(b); return b; }
  const caminar = (a, t, v, z0, dir = 1) => { a.position.z = z0 - dir * t * v; a.pose(t, 'caminar'); };
  function salon(K) { const s = K.escena('#0E1018'); K.cuarto(s, { pared: '#D8C8A0', w: 8, d: 8, h: 3.2, piso: K.mat('#FFFFFF', { map: K.rep(K.TEX.pisoMadera, 2, 2), roughness: .8 }) }); K.hemi(s, '#FFF4E0', '#6A5A48', 1.1); K.sol(s, { i: .9, dir: [6, 10, 8], r: 8 });
    s.add(K.caja(3.6, 1.6, .08, K.mat('#24402E', { roughness: .9 }), 0, 1.8, -3.92, .02)); s.add(K.caja(3.7, .08, .2, K.mat('#9A6A42'), 0, .98, -3.85, .02));
    const pc = document.createElement('canvas'); pc.width = 512; pc.height = 224; const x = pc.getContext('2d'); x.fillStyle = '#24402E'; x.fillRect(0, 0, 512, 224); x.fillStyle = '#F4F4EE'; x.font = '700 64px Fredoka'; x.textAlign = 'center'; x.fillText('EXAMEN', 256, 80); x.font = '700 56px Fredoka'; x.fillText('7 × 8 = ?', 256, 170);
    const tt = new K.THREE.CanvasTexture(pc); tt.encoding = K.THREE.sRGBEncoding; const pz = new K.THREE.Mesh(new K.THREE.PlaneGeometry(3.4, 1.5), new K.THREE.MeshBasicMaterial({ map: tt })); pz.position.set(0, 1.8, -3.87); s.add(pz);
    const alumnos = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x0 = (c - 1) * 1.9, z0 = -1.6 + r * 1.7; s.add(K.caja(1.1, .08, .7, K.mat('#C8A06A'), x0, .78, z0, .02)); for (const sx of [-1, 1]) s.add(K.caja(.06, .78, .06, K.mat('#555'), x0 + sx * .5, .39, z0, .01));
      const a = K.persona({ i: 3 + r * 3 + c, expr: 'lado', pose: 'sentado' }); a.position.set(x0, .18, z0 + .55); a.rotation.y = Math.PI; a.pose(0, 'sentado'); a.userData.brazos.forEach(b => { b.rotation.x = -1.2; }); s.add(a); alumnos.push(a); }
    return { s, alumnos }; }
  const NINO = { torso: '#8A8E98', manga: '#8A8E98', pierna: '#3A3E4A', pelo: 'corto', colPelo: '#1A1A1E', piel: '#E8C8A8', zapato: '#2A2A2E', suela: '#111' };

  window.TOMAS = [
    // 0 — calle de día, cada quien con su pensamiento flotando
    (K) => { const s = pueblo(K); const gente = []; const P = ['¿Qué hago de comer?', 'Ojalá llueva', 'Tengo sueño…', 'Se me olvidó algo', '¿Y mis llaves?'];
      P.forEach((tx, i) => { const a = K.persona({ i: 11 + i * 3, expr: 'lado' }); a.position.set((i % 2 ? 1 : -1) * (2.1 + (i % 3) * .5), 0, 2 - i * 2.4); a.rotation.y = i % 2 ? Math.PI : 0; s.add(a); conBurbuja(K, s, a, tx, { tam: 1.5 }); gente.push(a); });
      return { scene: s, cam: K.cam([0, 2.4, 8], [0, 2.0, -6], 50), cam2: K.cam([0, 2.2, 5.5], [0, 2.0, -6], 50), anima: (t) => gente.forEach((a, i) => caminar(a, t, .7, 2 - i * 2.4, i % 2 ? -1 : 1)), post: { ap: .05 } }; },
    // 1 — vecinos sonriendo sobre la cerca
    (K) => { const s = pueblo(K); const a = K.persona({ i: 21, expr: 'sonrisa' }), b = K.persona({ i: 30, expr: 'sonrisa' }); a.position.set(-.8, 0, 1); a.rotation.y = .6; b.position.set(.8, 0, 1); b.rotation.y = -.6; s.add(a, b);
      for (let i = -3; i <= 3; i++) s.add(K.caja(.1, .9, .1, K.mat('#F4F4EE'), i * .5, .45, 1.6, .01)); s.add(K.caja(3.2, .08, .06, K.mat('#F4F4EE'), 0, .75, 1.6, .01));
      conBurbuja(K, s, a, '¡Qué bonito día!', { tam: .85, dx: 0, y: 2.3 }); conBurbuja(K, s, b, '¡Igualmente!', { tam: .8, dx: 0, y: 2.3 });
      return { scene: s, cam: K.cam([0, 1.95, 6.4], [0, 1.85, .6], 46), cam2: K.cam([0, 1.95, 5.6], [0, 1.85, .6], 44), anima: (t) => { a.pose(t, 'quieto'); b.pose(t, 'quieto'); }, post: { ap: .1 } }; },
    // 2 — "qué feo corte de pelo"… y voltea ofendido
    (K) => { const s = pueblo(K); const p = K.prota('lado'); p.position.set(-.9, 0, 1.4); p.rotation.y = .5; s.add(p); const pb = conBurbuja(K, s, p, 'Qué feo corte de pelo…', { tam: 1.25, dx: .35, y: 2.25 });
      const v = K.persona({ i: 7, expr: 'lado', avatar: { pelo: 'picos', colPelo: '#E040A0' } }); v.position.set(1.0, 0, -1.2); v.rotation.y = -Math.PI / 2; s.add(v); const fin = window.T.lineas[2].fin - window.T.lineas[2].corte;
      return { scene: s, cam: K.cam([.2, 1.9, 6.2], [0, 1.75, -.2], 46), anima: (t) => { const k = Math.min(1, Math.max(0, (t - (fin - 1.2)) / .35)); v.userData.cabeza.rotation.y = -1.3 * k; v.cara(k > .5 ? 'seria' : 'lado'); p.cara(k > .5 ? 'preocupado' : 'lado'); v.position.x = 1.0 - Math.min(t, fin - 1.2) * .5; v.pose(t, k > 0 ? 'quieto' : 'caminar'); }, post: { ap: .08 } }; },
    // 3 — examen: un alumno piensa la respuesta y toda la clase la copia
    (K) => { const S = salon(K); const lider = S.alumnos[4]; conBurbuja(K, S.s, lider, '7 × 8 = 56', { tam: 1.0, dx: 0, y: 1.7 });
      return { scene: S.s, cam: K.cam([2.0, 2.6, 4.2], [-.2, 1.45, .4], 50), cam2: K.cam([1.6, 2.4, 3.4], [-.2, 1.5, .4], 48),
        anima: (t) => { const k = Math.min(1, Math.max(0, (t - 1.2) / .4)); S.alumnos.forEach((a, i) => { if (a === lider) return; a.userData.cabeza.rotation.y = (i % 3 === 0 ? -1 : i % 3 === 2 ? 1 : 0) * .5 * k; a.userData.brazos[1].rotation.x = -1.2 + .15 * Math.sin(t * 14 + i) * k; a.cara(k > .5 ? 'guino' : 'lado'); }); } }; },
    // 4 — piensan muy… muy despacito
    (K) => { const s = pueblo(K); const a = K.persona({ i: 16, expr: 'recta' }); a.position.set(0, 0, 1); s.add(a); const etapas = ['p…', 'pien…', 'pienso…', 'pienso… des…', 'pienso… despacito'].map(tx => { const b = conBurbuja(K, s, a, tx, { tam: 1.0, dx: 0, y: 2.3 }); b.visible = false; return b; });
      return { scene: s, cam: K.cam([0, 1.95, 4.4], [0, 2.0, .9], 42), cam2: K.cam([0, 1.95, 3.8], [0, 2.0, .9], 40), anima: (t) => { const n = Math.min(etapas.length - 1, Math.floor(t / .5)); etapas.forEach((b, i) => b.visible = i === n); a.userData.cabeza.rotation.z = .05 * Math.sin(t * 2); } }; },
    // 5 — un niño al que nadie puede escuchar: todos tienen burbuja menos él
    (K) => { const s = pueblo(K); const n = K.persona({ expr: 'recta', avatar: NINO }); n.position.set(0, 0, 0); s.add(n); const gente = [];
      [[-2.2, 1.5, .6, '¿?'], [2.3, 1.2, -.7, '¿Qué estará pensando?'], [-1.6, -2.2, .3, '…'], [1.8, -2.6, -.4, 'No oigo nada']].forEach(([x, z, ry, tx], i) => { const a = K.persona({ i: 40 + i * 5, expr: 'preocupado' }); a.position.set(x, 0, z); a.rotation.y = Math.atan2(-x, -z); s.add(a); conBurbuja(K, s, a, tx, { tam: 1.2, dx: 0 }); gente.push(a); });
      return { scene: s, cam: K.cam([0, 3.2, 7.5], [0, 1.3, 0], 46), cam2: K.cam([0, 2.6, 5.5], [0, 1.4, 0], 42), anima: (t) => { n.pose(t, 'quieto'); gente.forEach(a => a.pose(t, 'quieto')); } }; },
    // 6 — la gente le tiene miedo: se alejan y murmuran
    (K) => { const s = pueblo(K); const n = K.persona({ expr: 'recta', avatar: NINO }); n.position.set(0, 0, -2); s.add(n); const g = [];
      for (let i = 0; i < 4; i++) { const a = K.persona({ i: 60 + i * 4, expr: 'miedo' }); a.position.set(-1.2 + (i % 2) * .8, 0, 1.5 + (i >> 1) * .7); a.rotation.y = Math.PI + .3; s.add(a); g.push(a); }
      conBurbuja(K, s, g[0], 'Esconde algo…', { tam: 1.3, dx: -.2 });
      return { scene: s, cam: K.cam([2.4, 1.8, 5.6], [-.4, 1.3, -.4], 44), anima: (t) => g.forEach((a, i) => { a.position.z = 1.5 + (i >> 1) * .7 + t * .25; a.pose(t * .6, 'caminar'); }), post: { ap: .1 } }; },
    // 7 — el protagonista le pregunta (en una banca del parque)
    (K) => { const s = pueblo(K, { tarde: true }); const bn = K.caja(2.2, .1, .6, K.mat('#9A6A42'), 0, .5, 0, .02); s.add(bn); s.add(K.caja(2.2, .5, .08, K.mat('#9A6A42'), 0, .85, -.28, .02));
      const n = K.persona({ expr: 'recta', avatar: NINO }); n.position.set(.55, .5, .1); n.pose(0, 'sentado'); s.add(n); const p = K.prota('lado'); p.position.set(-.6, .5, .1); p.pose(0, 'sentado'); p.rotation.y = .35; s.add(p);
      conBurbuja(K, s, p, '¿Qué piensas todo el tiempo?', { tam: 1.3, dx: 0, y: 1.8 });
      return { scene: s, cam: K.cam([0, 1.6, 4.8], [0, 1.4, 0], 44), cam2: K.cam([0, 1.6, 4.2], [0, 1.4, 0], 42), anima: (t) => { p.pose(t, 'sentado'); n.pose(t, 'sentado'); } }; },
    // 8 — "Nada. Por eso soy el único que es libre."
    (K) => { const s = pueblo(K, { tarde: true }); s.add(K.caja(2.2, .1, .6, K.mat('#9A6A42'), 0, .5, 0, .02)); s.add(K.caja(2.2, .5, .08, K.mat('#9A6A42'), 0, .85, -.28, .02));
      const n = K.persona({ expr: 'sonrisa', avatar: NINO }); n.position.set(.55, .5, .1); n.pose(0, 'sentado'); n.rotation.y = -.35; s.add(n); const p = K.prota('sorpresa'); p.position.set(-.6, .5, .1); p.pose(0, 'sentado'); p.rotation.y = .35; s.add(p);
      return { scene: s, cam: K.cam([1.0, 1.3, 2.6], [.5, 1.25, .1], 36), cam2: K.cam([.85, 1.3, 1.9], [.55, 1.3, .1], 32), anima: (t) => { n.pose(t, 'sentado'); p.pose(t, 'sentado'); }, post: { ap: .18 } }; },
    // 9 — pregunta final: el pueblo al atardecer, lleno de pensamientos
    (K) => { const s = pueblo(K, { tarde: true }); const P = ['…', '¿Y si me oyen?', 'Shhh', '¿Qué pensará?', 'No pienses', '¡Ups!'];
      P.forEach((tx, i) => { const a = K.persona({ i: 80 + i * 3, expr: 'lado' }); a.position.set((i % 2 ? 1 : -1) * (1.6 + (i % 3) * .6), 0, 1 - i * 2.2); a.rotation.y = i % 2 ? Math.PI : 0; s.add(a); conBurbuja(K, s, a, tx, { tam: 1.4 }); });
      return { scene: s, cam: K.cam([0, 6, 10], [0, 1.5, -6], 50), cam2: K.cam([0, 8, 7], [0, 1.0, -8], 50) }; },
  ];
})();
