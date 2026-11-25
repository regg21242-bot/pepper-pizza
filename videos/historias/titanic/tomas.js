/* Imagina que despiertas en el Titanic — una toma por línea del guion */
(function () {
  const rotulo = (x, l1, l2, a = 1, y = 430) => { x.save(); x.globalAlpha = a; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.font = '700 92px Fredoka'; x.lineWidth = 16; x.strokeStyle = '#000'; x.strokeText(l1, 540, y); x.fillStyle = '#FFD24A'; x.fillText(l1, 540, y);
    if (l2) { x.font = '700 56px Fredoka'; x.lineWidth = 12; x.strokeText(l2, 540, y + 96); x.fillStyle = '#FFFFFF'; x.fillText(l2, 540, y + 96); } x.restore(); };
  const ROPA = [{ torso: '#1E2230', manga: '#1E2230', pierna: '#1E2230', pelo: 'corto', colPelo: '#2A1E16', zapato: '#111', suela: '#000' }, { torso: '#E8DCC8', manga: '#E8DCC8', pierna: '#8A6A9A', pelo: 'chongo', colPelo: '#5A3A22', zapato: '#3A2A2A', suela: '#111' }, { torso: '#5A4A3A', manga: '#5A4A3A', pierna: '#3A3A3A', pelo: 'ondas', colPelo: '#C89A4A', zapato: '#222', suela: '#111' }];
  const pasajero = (K, i, expr = 'lado') => K.persona({ i, expr, avatar: ROPA[i % 3] });
  // el barco (proa hacia -x), escala ~1:7
  function barco(K, o = {}) { const g = K.G(), L = 38, A = 4.4; const negro = K.mat('#121418', { roughness: .6 }), blanco = K.mat('#F2EEE6', { roughness: .7 }), rojo = K.mat('#8A2A22'), ocre = K.mat('#D8963A', { roughness: .6 });
    g.add(K.caja(L, 2.6, A, negro, 0, 1.3, 0, .2)); g.add(K.caja(L - .6, .9, A - .4, rojo, 0, -.3, 0, .2)); g.add(K.caja(L - 1, .5, A + .02, blanco, 0, 2.85, 0, .05));
    g.add(K.caja(L * .62, 1.0, A - .6, blanco, 1, 3.6, 0, .05)); g.add(K.caja(L * .5, .8, A - 1.1, blanco, 1.5, 4.5, 0, .05)); g.add(K.caja(3, .9, A - 1.4, blanco, -8.5, 5.3, 0, .05));
    const ch = []; for (let i = 0; i < 4; i++) { const f = K.G(); f.add(K.cil(.55, .6, 3.8, ocre, 0, 1.9, 0, 16)); f.add(K.cil(.56, .56, .7, negro, 0, 3.5, 0, 16)); f.position.set(-6 + i * 4.6, 4.9, 0); f.rotation.z = -.12; g.add(f); ch.push(f); }
    for (const x of [-17, 16]) g.add(K.cil(.07, .07, 9, K.mat('#C8A878'), x, 7, 0, 6));
    // ojos de buey encendidos
    const luzV = K.luz('#FFE2A0', o.luces != null ? o.luces : 2.2); for (let r = 0; r < 2; r++) for (let i = 0; i < 46; i++) for (const sz of [-1, 1]) { const p = K.esf(.07, luzV, -L / 2 + 1.5 + i * .76, 1.9 + r * .62, sz * (A / 2 + .01), 6); p.castShadow = false; g.add(p); }
    for (let i = 0; i < 20; i++) for (const sz of [-1, 1]) { const p = K.caja(.3, .25, .02, luzV, -9 + i * 1.1, 3.6, sz * (A / 2 - .29), .01); p.castShadow = false; g.add(p); }
    g.userData.luzV = luzV; return g; }
  function mar(K, s, o = {}) { const est = K.noche(s, { hemi: .35, i: .5, arriba: '#05070F', horizonte: '#101830', niebla: '#0A1020', n0: 40, n1: 260, luna: false }); const a = K.agua(400, 400, '#0A1424', { amp: o.amp || .06, seg: 80 }); s.add(a); return { est, a }; }
  function camarote(K) { const s = K.escena('#0A0806'); K.cuarto(s, { pared: '#6A4A2E', w: 5, d: 5, h: 2.6, piso: K.mat('#7A2A2A', { roughness: .95 }) }); K.hemi(s, '#FFD8A0', '#2A1A10', .55);
    const v = K.G(); const ring = K.M(new K.THREE.TorusGeometry(.3, .05, 8, 24), K.mat('#C8A040', { metalness: .6, roughness: .3 })); v.add(ring); const vid = K.M(new K.THREE.CircleGeometry(.29, 24), K.luz('#2A3A6A', .8)); v.add(vid); v.position.set(1.2, 1.6, -2.38); s.add(v);
    const c = K.cama('#E8E0D0'); c.position.set(-.8, 0, -1.3); s.add(c); const lam = K.foco(s, '#FFC880', 1.6, [.8, 2.0, -1], 5); return { s, c, lam }; }

  window.TOMAS = [
    // 0 — despiertas en el camarote: la cama tiembla
    (K) => { const C = camarote(K); const a = pasajero(K, 0, 'dormido'); a.rotation.x = -Math.PI / 2; a.position.set(-.8, .7, -.45); a.scale.setScalar(.9); C.s.add(a);
      return { scene: C.s, cam: K.cam([1.3, 1.6, 1.0], [-.8, .7, -1.8], 46), cam2: K.cam([.9, 1.4, .4], [-.8, .75, -1.9], 42), anima: (t) => { a.cara(t > 1.3 ? 'sorpresa' : 'dormido'); C.lam.intensity = 1.6 + (t > 1 ? .3 * Math.sin(t * 40) : 0); },
        sacudida: (t) => t > 1.0 && t < 2.6 ? 1.1 : .05, encima: (x, t) => rotulo(x, '11:40 p.m.', '14 de abril de 1912', Math.min(1, t * 2)) }; },
    // 1 — el Titanic de noche
    (K) => { const s = K.escena('#05070F'); const M = mar(K, s); const b = barco(K); s.add(b);
      return { scene: s, cam: K.cam([-30, 4, 26], [0, 3, 0], 40), cam2: K.cam([-24, 3, 18], [0, 3.5, 0], 40), anima: (t) => { M.a.anima(t); M.est.anima(t); b.position.y = .05 * Math.sin(t * .8); }, post: { ap: .02, bloom: 1.1 }, encima: (x, t) => rotulo(x, 'TITANIC', '"Imposible de hundir"', Math.min(1, t * 1.5)) }; },
    // 2 — pasillo/salón: nadie corre, la orquesta sigue tocando
    (K) => { const s = K.escena('#0A0806'); K.cuarto(s, { pared: '#7A5A3A', w: 8, d: 8, h: 3.2, piso: K.mat('#F2EEE6', { roughness: .6 }) }); K.hemi(s, '#FFE2B0', '#3A2A1A', .9); K.foco(s, '#FFD890', 2.5, [0, 2.8, -1], 9);
      for (let i = 0; i < 4; i++) s.add(K.cil(.12, .12, 3.2, K.mat('#F4F0E6'), -3 + i * 2, 1.6, -2.5, 12));
      const mus = []; for (let i = 0; i < 4; i++) { const a = pasajero(K, 0, 'feliz'); a.position.set(-1.5 + i, 0, -2.2); s.add(a); mus.push(a); }
      const g = []; for (let i = 0; i < 5; i++) { const a = pasajero(K, i + 1, 'sonrisa'); a.position.set(-2.6 + i * 1.3, 0, .6 + (i % 2) * .7); a.rotation.y = Math.PI + (i - 2) * .2; s.add(a); g.push(a); }
      return { scene: s, cam: K.cam([3.4, 2.7, 4.8], [-.6, 1.1, -2], 46), cam2: K.cam([2.8, 2.5, 4.0], [-.6, 1.2, -2], 44), anima: (t) => { mus.forEach((a, i) => a.pose(t + i * .3, 'guitarra')); g.forEach(a => a.pose(t, 'quieto')); } }; },
    // 3 — corte del casco: el agua entra en 5 compartimentos
    (K) => { const s = K.escena('#05070F'); K.hemi(s, '#8090C0', '#101018', .7); K.sol(s, { i: .8, dir: [5, 20, 30] }); const g = K.G(); s.add(g);
      g.add(K.caja(24, .2, 3, K.mat('#2A2A30'), 0, 0, 0, .02)); const aguas = [];
      for (let i = 0; i < 10; i++) { const x = -10.8 + i * 2.4; g.add(K.caja(.12, 3, 3, K.mat('#4A4A52'), x - 1.2, 1.5, 0, .01)); if (i < 5) { const w = K.M(new K.THREE.BoxGeometry(2.25, 1, 2.8), new K.THREE.MeshStandardMaterial({ color: '#2A6AC8', transparent: true, opacity: .75, roughness: .1 }), x, .5, 0); w.scale.y = .01; g.add(w); aguas.push(w); } }
      g.add(K.caja(24, .1, 3, K.mat('#4A4A52'), 0, 3, 0, .01)); g.add(K.caja(24, 3.1, .1, K.mat('#121418'), 0, 1.5, -1.5, .01));
      return { scene: s, cam: K.cam([0, 5.5, 26], [0, 1.4, 0], 38), cam2: K.cam([-3, 4.5, 20], [-3, 1.4, 0], 38), anima: (t) => aguas.forEach((w, i) => { const h = Math.min(2.6, Math.max(.01, (t - i * .25) * .9)); w.scale.y = h; w.position.y = h / 2 + .1; }),
        encima: (x, t) => rotulo(x, '5 compartimentos', 'inundándose', Math.min(1, Math.max(0, (t - .6) * 2))) }; },
    // 4 — los botes salvavidas: solo para 1,178 personas
    (K) => { const s = K.escena('#05070F'); const M = mar(K, s); const b = barco(K); s.add(b); const botes = [];
      for (let i = 0; i < 6; i++) { const bt = K.G(); bt.add(K.caja(1.6, .35, .55, K.mat('#F2EEE6'), 0, 0, 0, .12)); bt.add(K.caja(1.5, .06, .5, K.mat('#9A6A42'), 0, .16, 0, .02)); bt.position.set(-6 + i * 2.2, 5.4, 2.6); b.add(bt); botes.push(bt); for (const sx of [-1, 1]) b.add(K.cil(.04, .04, 1.2, K.mat('#2A2A2A'), -6 + i * 2.2 + sx * .7, 5.9, 2.4, 6)); }
      return { scene: s, cam: K.cam([-4, 6.2, 8], [-1, 5.2, 2.2], 44), cam2: K.cam([-3, 5.9, 6], [0, 5.3, 2.2], 42), anima: (t) => { M.a.anima(t); M.est.anima(t); }, post: { ap: .05 }, encima: (x, t) => rotulo(x, '1,178', 'lugares en los botes', Math.min(1, Math.max(0, (t - .8) * 2))) }; },
    // 5 — y a bordo van más de 2,000
    (K) => { const s = K.escena('#05070F'); const M = mar(K, s); const b = barco(K); s.add(b); const g = [];
      for (let i = 0; i < 26; i++) { const a = pasajero(K, i, ['preocupado', 'miedo', 'sorpresa', 'lado'][i % 4]); a.scale.setScalar(.5); a.position.set(-9 + (i % 13) * 1.2, 4.1, -1 + Math.floor(i / 13) * 1.4); a.rotation.y = .3 * Math.sin(i); b.add(a); g.push(a); }
      return { scene: s, cam: K.cam([-2, 7.5, 9], [-2, 4.2, 0], 44), cam2: K.cam([-2, 7, 7], [-2, 4.3, 0], 40), anima: (t) => { M.a.anima(t); g.forEach((a, i) => a.pose(t + i, 'quieto')); }, encima: (x, t) => rotulo(x, '+2,000', 'personas a bordo', Math.min(1, Math.max(0, (t - .3) * 2))) }; },
    // 6 — 2:20 a.m.: el Titanic desaparece
    (K) => { const s = K.escena('#03040A'); const M = mar(K, s, { amp: .05 }); const b = barco(K, { luces: 0 }); const piv = K.G(); piv.add(b); b.position.set(10, 0, 0); s.add(piv);
      return { scene: s, cam: K.cam([-22, 3, 30], [0, 4, 0], 40), cam2: K.cam([-20, 2.5, 26], [0, 3, 0], 40), anima: (t, tg, k) => { M.a.anima(t); M.est.anima(t); piv.rotation.z = .55 + .25 * k; piv.position.y = -2 - 14 * k * k; }, post: { ap: .02 }, encima: (x, t) => rotulo(x, '2:20 a.m.', '15 de abril de 1912', Math.min(1, t * 2)) }; },
    // 7 — el agua a dos grados bajo cero
    (K) => { const s = K.escena('#03040A'); const M = mar(K, s, { amp: .04 }); K.sembrar(3); const cosas = []; for (let i = 0; i < 14; i++) { const c = K.caja(.3 + K.rnd() * .8, .12, .3 + K.rnd() * .5, K.mat('#6A4A2E'), (K.rnd() - .5) * 14, .02, -K.rnd() * 14, .02); c.rotation.y = K.rnd() * 3; s.add(c); cosas.push(c); }
      const vaho = K.nube({ n: 30, col: '#B8C8E0', tam: 1.2, area: [12, .3, 12], vel: [0, .25, 0], vida: 4, opac: .25, origen: [0, .2, -6] }); s.add(vaho);
      return { scene: s, cam: K.cam([0, 1.2, 4], [0, 0, -8], 46), cam2: K.cam([0, .8, 2.4], [0, 0, -8], 46), anima: (t) => { M.a.anima(t); vaho.anima(t); cosas.forEach((c, i) => { c.position.y = .03 + .05 * Math.sin(t * 1.3 + i); }); }, post: { ap: .04 }, encima: (x, t) => rotulo(x, '−2 °C', '', Math.min(1, Math.max(0, (t - .2) * 2))) }; },
    // 8 — sobreviven unas 700 personas: botes a oscuras con linternas
    (K) => { const s = K.escena('#03040A'); const M = mar(K, s, { amp: .05 }); const botes = [];
      for (let i = 0; i < 4; i++) { const bt = K.G(); bt.add(K.caja(2.4, .45, .9, K.mat('#E8E2D8'), 0, .1, 0, .15)); for (let j = 0; j < 4; j++) { const a = pasajero(K, i * 4 + j, ['triste', 'preocupado'][j % 2]); a.scale.setScalar(.45); a.position.set(-.8 + j * .55, .1, 0); bt.add(a); }
        const l = K.esf(.08, K.luz('#FFC860', 3), 1.05, .7, 0, 8); bt.add(l); const pl = new K.THREE.PointLight('#FFB860', 1.2, 5, 2); pl.position.set(1.05, .9, 0); bt.add(pl); bt.position.set(-5 + i * 3.6, 0, -2 - (i % 2) * 4); bt.rotation.y = .3 * i; s.add(bt); botes.push(bt); }
      return { scene: s, cam: K.cam([2, 2.6, 7], [0, .5, -3], 46), cam2: K.cam([1.6, 2.2, 5], [0, .5, -3], 44), anima: (t) => { M.a.anima(t); botes.forEach((b, i) => { b.position.y = .06 * Math.sin(t * 1.2 + i); b.rotation.z = .03 * Math.sin(t + i); }); }, encima: (x, t) => rotulo(x, '≈ 700', 'sobrevivientes', Math.min(1, Math.max(0, (t - .5) * 2))) }; },
    // 9 — pregunta: desde un bote, mirando dónde estaba el barco
    (K) => { const s = K.escena('#03040A'); const M = mar(K, s, { amp: .06 }); const bt = K.G(); bt.add(K.caja(2.4, .45, .9, K.mat('#E8E2D8'), 0, .1, 0, .15)); const a = pasajero(K, 1, 'triste'); a.scale.setScalar(.5); a.position.set(.2, .1, 0); a.rotation.y = Math.PI / 2; bt.add(a); s.add(bt);
      const bengala = K.esf(.25, K.luz('#FF5A40', 4), -6, 14, -30, 8); s.add(bengala);
      return { scene: s, cam: K.cam([.9, 1.5, 3.4], [-.6, 1.2, -10], 46), cam2: K.cam([.7, 1.4, 2.8], [-.6, 1.6, -10], 46), anima: (t) => { M.a.anima(t); M.est.anima(t); bt.position.y = .06 * Math.sin(t * 1.2); bengala.position.y = 14 + t * 1.5; bengala.material.emissiveIntensity = 4 * Math.max(0, 1 - t / 6); } }; },
  ];
})();
