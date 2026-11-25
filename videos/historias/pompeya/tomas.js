/* Imagina que despiertas en Pompeya — una toma por línea del guion */
(function () {
  const rotulo = (x, l1, l2, a = 1) => { x.save(); x.globalAlpha = a; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.font = '700 92px Fredoka'; x.lineWidth = 16; x.strokeStyle = '#000'; x.strokeText(l1, 540, 430); x.fillStyle = '#FFD24A'; x.fillText(l1, 540, 430);
    if (l2) { x.font = '700 60px Fredoka'; x.lineWidth = 12; x.strokeText(l2, 540, 530); x.fillStyle = '#FFFFFF'; x.fillText(l2, 540, 530); } x.restore(); };
  const ROMANO = [{ torso: '#F2EAD8', manga: '#F2EAD8', pierna: '#C8A878', pelo: 'corto', colPelo: '#2A1E16', zapato: '#7A4A2A', suela: '#5A3A1A' }, { torso: '#C84B3A', manga: '#C84B3A', pierna: '#E8DCC0', pelo: 'chongo', colPelo: '#3A2414', zapato: '#7A4A2A', suela: '#5A3A1A' }, { torso: '#E8DCC0', manga: '#E8DCC0', pierna: '#8A6A42', pelo: 'rizos', colPelo: '#1A1410', zapato: '#7A4A2A', suela: '#5A3A1A' }];
  const romano = (K, i, expr = 'lado') => K.persona({ i, expr, avatar: ROMANO[i % 3] });
  // casa romana: muros claros, techo de teja, columnas en la entrada
  function casaRomana(K, o = {}) { const g = K.G(), w = o.w || 5, h = o.h || 3.2, d = o.d || 5; const muro = K.mat(o.col || '#E8D8B8', { roughness: .95 });
    g.add(K.caja(w, h, d, muro, 0, h / 2, -d / 2, .03)); const teja = K.mat('#B0502E', { roughness: .8 }); const t1 = K.caja(w + .4, .25, d / 2 + .5, teja, 0, h + .3, -d * .25 + .1, .02); t1.rotation.x = -.32; g.add(t1); const t2 = K.caja(w + .4, .25, d / 2 + .5, teja, 0, h + .3, -d * .75 - .1, .02); t2.rotation.x = .32; g.add(t2);
    g.add(K.caja(w, .5, .06, K.mat('#A83A2A'), 0, .25, .01, .01)); g.add(K.caja(1.1, 2.1, .1, K.mat('#4A2E1A'), 0, 1.05, .02, .01));
    for (const sx of [-1, 1]) g.add(K.cil(.13, .15, 2.6, K.mat('#F4F0E6'), sx * .85, 1.3, .35, 12)); g.add(K.caja(2.2, .2, .7, K.mat('#F4F0E6'), 0, 2.7, .2, .02)); return g; }
  // el Vesubio con su cráter
  function vesubio(K) { const g = K.G(); const m = K.M(new K.THREE.ConeGeometry(38, 22, 24, 1, true), K.mat('#6A5E50', { roughness: 1, side: K.THREE.DoubleSide }), 0, 11, 0); g.add(m); const m2 = K.M(new K.THREE.ConeGeometry(30, 16, 24), K.mat('#7E7060', { roughness: 1 }), 12, 8, 6); g.add(m2); return g; }
  function ciudad(K, s, o = {}) { const cols = ['#E8D8B8', '#F0E2C8', '#D8C09A', '#E8C8A0', '#F2E8D8'];
    K.piso(s, '#BFAE8E'); const cal = K.mat('#9A9286', { roughness: 1 }); s.add(K.plano(5, 200, cal, 0, .004, -60));
    for (let z = -2, i = 0; z > -60; z -= 6, i++) for (const sx of [-1, 1]) { const c = casaRomana(K, { col: cols[(i + (sx > 0 ? 2 : 0)) % 5], w: 5, h: 3 + (i % 2) * .6 }); c.position.set(sx * 5.2, 0, z); c.rotation.y = -sx * Math.PI / 2; s.add(c); }
    const v = vesubio(K); v.position.set(-10, 0, -110); s.add(v); return v; }
  function cielo(K, s, oscuro = 0) { const top = new K.THREE.Color('#5E9BE0').lerp(new K.THREE.Color('#2A221E'), oscuro), hor = new K.THREE.Color('#FFE2B8').lerp(new K.THREE.Color('#4A3A30'), oscuro);
    s.add(K.cielo('#' + top.getHexString(), '#' + hor.getHexString(), 1)); K.hemi(s, '#FFF0D8', '#6A5A48', .8 - .45 * oscuro); K.sol(s, { i: 1.6 - 1.1 * oscuro, dir: [-15, 25, 12], r: 22, col: oscuro > .5 ? '#FFB080' : '#FFF2DC' }); s.fog = new K.THREE.Fog('#' + hor.getHexString(), 60 - 30 * oscuro, 420 - 220 * oscuro); K.E.relleno(.12 + .1 * oscuro); }
  const columna = (K, alto = 1) => { const g = K.G(); const a = K.nube({ n: 110, col: '#2E2824', tam: 16, area: [12, 6, 12], vel: [0, 10 * alto, 0], vida: 8, opac: 1, crece: 2.2, origen: [-10, 22, -110], semilla: 3 }); const b = K.nube({ n: 40, col: '#FF7A30', tam: 9, area: [8, 4, 8], vel: [0, 3, 0], vida: 3, opac: .8, crece: 1, origen: [-10, 21, -110], semilla: 8, aditivo: true }); g.add(a, b); a.material = null; g.anima = (t) => { a.anima(t); b.anima(t); }; g.anima(0); return g; };

  window.TOMAS = [
    // 0 — despiertas en una casa de Pompeya
    (K) => { const s = K.escena('#1A0E08'); K.cuarto(s, { pared: '#A8382A', w: 6, d: 6, piso: K.mat('#C8B090', { roughness: .9 }) }); K.hemi(s, '#FFE0B0', '#5A3020', .9);
      const v = K.ventana({ w: 1.2, h: 1.2, vidrio: '#9CC8F0', brillo: 1.2, marco: '#8A5A3A' }); v.position.set(1.4, 1.8, -2.88); s.add(v); const sp = new K.THREE.SpotLight('#FFE8C0', 3.5, 10, .6, .6, 1.2); sp.position.set(1.4, 1.9, -2.5); sp.target.position.set(0, 0, 0); sp.castShadow = true; s.add(sp, sp.target);
      const c = K.cama('#E8DCC0'); c.position.set(-.6, 0, -1.5); s.add(c); const a = romano(K, 0, 'dormido'); s.add(a);
      for (let i = 0; i < 3; i++) s.add(K.caja(.06, 3, .06, K.mat('#E8C870'), -2.9, 1.5, -2 + i * 2, .01));
      return { scene: s, cam: K.cam([1.8, 1.7, 1.6], [-.5, .9, -1.5], 46), cam2: K.cam([1.3, 1.5, .8], [-.5, .9, -1.6], 44),
        anima: (t) => { const u = Math.min(1, Math.max(0, (t - 1.2) / .5)); a.cara(t > 1.0 ? 'sorpresa' : 'dormido'); if (u > 0) a.pose(t, 'sentado'); else a.pose(0, 'quieto'); a.rotation.x = -Math.PI / 2 * (1 - u); a.position.set(-.6, .7 + .2 * u, -.42 - 1.0 + (1 - u) * 1.0 - 1.45 * u * 0); },
        encima: (x, t) => rotulo(x, 'POMPEYA', 'Año 79', Math.min(1, t * 2)) }; },
    // 1 — calle de mañana: el pan en el horno, los perros ladran, el Vesubio al fondo
    (K) => { const s = K.escena('#9CC4E8'); cielo(K, s, 0); ciudad(K, s);
      const horno = K.G(); horno.add(K.caja(2, 1, 1.6, K.mat('#C8B090'), 0, .5, 0, .05)); horno.add(K.esf(.9, K.mat('#C89A6A', { roughness: .95 }), 0, 1, 0)); horno.add(K.esf(.32, K.luz('#FF8A2A', 2.5), 0, .95, .62)); horno.position.set(-2.1, 0, -4); horno.rotation.y = .5; s.add(horno);
      const fuego = K.foco(s, '#FF9A40', 2, [-1.6, 1.1, -3.2], 4);
      const perro = K.G(); const pm = K.mat('#8A6A42'); perro.add(K.caja(.7, .32, .3, pm, 0, .42, 0, .05)); perro.add(K.caja(.3, .28, .26, pm, .45, .62, 0, .05)); for (const [x, z] of [[-.25, -.1], [-.25, .1], [.25, -.1], [.25, .1]]) perro.add(K.caja(.08, .3, .08, pm, x, .15, z, .01)); perro.add(K.caja(.25, .06, .06, pm, -.45, .55, 0, .01)); perro.position.set(1.4, 0, -2.5); perro.rotation.y = 2.2; K.prepara(perro); s.add(perro);
      const a = romano(K, 1, 'lado'); a.position.set(-.7, 0, -3.2); a.rotation.y = -.8; s.add(a);
      return { scene: s, cam: K.cam([.6, 1.6, 4], [-.6, 2.2, -12], 50), cam2: K.cam([.4, 1.5, 2.6], [-.8, 2.4, -12], 50), anima: (t) => { perro.children[1].position.y = .62 + .04 * Math.abs(Math.sin(t * 9)); fuego.intensity = 1.6 + .5 * Math.sin(t * 13); a.pose(t, 'quieto'); } }; },
    // 2 — el Vesubio revienta
    (K) => { const s = K.escena('#9CC4E8'); cielo(K, s, .1); ciudad(K, s); const col = columna(K, 1); s.add(col); const fl = K.foco(s, '#FF6A20', 0, [-10, 26, -105], 120);
      return { scene: s, cam: K.cam([2, 3, 6], [-8, 16, -100], 46), cam2: K.cam([2, 2.6, 3], [-8, 18, -100], 50), post: { ap: .02 }, anima: (t) => { col.anima(Math.max(0, t - .5) * 1.4); fl.intensity = t > .5 ? 6 * Math.exp(-(t - .5) * 1.5) + 1 : 0; }, sacudida: (t) => t > .5 ? Math.max(0, 1.2 - (t - .5) * .5) : 0 }; },
    // 3 — la columna tapa el sol
    (K) => { const s = K.escena('#6A6058'); cielo(K, s, .55); ciudad(K, s); const col = columna(K, 1.4); s.add(col); const sol = K.esf(5, K.luz('#FFE8A0', 1.6), 40, 70, -160); s.add(sol);
      return { scene: s, cam: K.cam([0, 1.6, 2], [-2, 14, -80], 56), cam2: K.cam([0, 1.6, 2], [0, 18, -80], 56), post: { ap: .02 }, anima: (t, tg, k) => { col.anima(4 + t * 1.4); sol.material.emissiveIntensity = 1.6 * (1 - k * .85); } }; },
    // 4 — lluvia de piedra pómez; la gente corre cubriéndose
    (K) => { const s = K.escena('#3A322C'); cielo(K, s, .85); ciudad(K, s); const ll = K.lluvia({ n: 900, area: [14, 14, 22], centro: [0, 0, -6], vel: 7, r: .045, col: '#D8D0C0', viento: .4 }); s.add(ll); const g = [];
      for (let i = 0; i < 5; i++) { const a = romano(K, i, 'miedo'); a.position.set((i % 2 ? 1 : -1) * (.8 + (i % 3) * .4), 0, -2 - i * 1.6); a.rotation.y = Math.PI; s.add(a); g.push(a); }
      return { scene: s, cam: K.cam([0, 1.6, 4.5], [0, 1.4, -6], 48), anima: (t) => { ll.anima(t); g.forEach((a, i) => { a.position.z = -2 - i * 1.6 + t * 1.8; a.pose(t * 1.6, 'caminar'); a.userData.brazos.forEach(b => { b.rotation.x = -2.7; }); }); } }; },
    // 5 — escondidos en casa; el techo cruje por el peso
    (K) => { const s = K.escena('#120A06'); K.cuarto(s, { pared: '#B8483A', w: 6, d: 6, piso: K.mat('#C8B090', { roughness: .9 }) }); K.hemi(s, '#FFC890', '#3A2010', .55); const lam = K.foco(s, '#FFB060', 2.2, [0, 1.3, -.5], 6);
      const vigas = []; for (let i = 0; i < 5; i++) { const v = K.caja(6, .22, .25, K.mat('#5A3A22'), 0, 2.85, -2.4 + i * 1.2, .02); s.add(v); vigas.push(v); }
      const fam = [romano(K, 0, 'miedo'), romano(K, 1, 'miedo'), romano(K, 2, 'miedo')]; fam.forEach((a, i) => { a.position.set(-.9 + i * .9, 0, -1.2); a.scale.setScalar(i === 2 ? .7 : 1); s.add(a); });
      const polvo = K.lluvia({ n: 250, area: [5, 3, 5], centro: [0, 0, -1], vel: 1.2, r: .012, col: '#E8DCC8' }); s.add(polvo);
      return { scene: s, cam: K.cam([0, 1.3, 3.2], [0, 1.6, -1.2], 50), cam2: K.cam([0, 1.1, 2.4], [0, 2.0, -1.2], 50), anima: (t) => { polvo.anima(t); vigas.forEach((v, i) => { v.position.y = 2.85 - .03 * Math.max(0, Math.sin(t * 3 + i)) * (t / 3); }); fam.forEach(a => { a.userData.cabeza.rotation.x = -.45; }); lam.intensity = 2 + .3 * Math.sin(t * 9); }, sacudida: (t) => .25 + .25 * (Math.sin(t * 2.3) > .7 ? 1 : 0) }; },
    // 6 — de noche todo se calma; algunos se quedan
    (K) => { const s = K.escena('#0A0808'); s.add(K.cielo('#121014', '#2A2420', 1)); K.hemi(s, '#5A5060', '#1A1410', .22); K.sol(s, { i: .15, col: '#8A90B0', dir: [10, 20, 10] }); s.fog = new K.THREE.Fog('#1A1614', 10, 90); K.E.relleno(.3); ciudad(K, s);
      s.add(K.plano(5, 200, K.mat('#8A8478', { roughness: 1 }), 0, .02, -60)); const lam = K.foco(s, '#FFA850', 2.5, [-3.6, 1.6, -2.4], 6);
      const g = [romano(K, 0, 'triste'), romano(K, 1, 'preocupado')]; g[0].position.set(-3.6, 0, -2.4); g[1].position.set(-3.2, 0, -3.3); g.forEach(a => { a.rotation.y = Math.PI / 2; s.add(a); });
      return { scene: s, cam: K.cam([1.2, 1.5, 2.6], [-3.2, 1.3, -3], 44), cam2: K.cam([.6, 1.5, 1.4], [-3.2, 1.4, -3], 40), anima: (t) => { lam.intensity = 2.3 + .4 * Math.sin(t * 7); g.forEach(a => a.pose(t, 'quieto')); } }; },
    // 7 — la nube ardiente baja de la montaña
    (K) => { const s = K.escena('#4A3A30'); cielo(K, s, .4); ciudad(K, s); const col = columna(K, 1.4); s.add(col);
      const ola = K.nube({ n: 180, col: '#3A322C', tam: 14, area: [90, 10, 14], vel: [0, 0, 16], vida: 5, opac: 1, crece: 1.2, origen: [-10, 7, -90], semilla: 9 }); s.add(ola); const brillo = K.foco(s, '#FF7030', 4, [-10, 5, -70], 80);
      return { scene: s, cam: K.cam([1.5, 2.5, 4], [-6, 8, -60], 50), post: { ap: .02 }, anima: (t) => { col.anima(8 + t); ola.anima(t * 1.1); brillo.position.z = -95 + t * 18; }, sacudida: .6 }; },
    // 8 — enterrada… y encontrada más de 1,600 años después (ruinas)
    (K) => { const s = K.escena('#9CC4E8'); cielo(K, s, 0); K.piso(s, '#BFAE8E'); const v = vesubio(K); v.position.set(-10, 0, -110); s.add(v);
      K.sembrar(4); for (let i = 0; i < 18; i++) { const x = (K.rnd() - .5) * 16, z = -2 - K.rnd() * 24; const h = .4 + K.rnd() * 2.4; s.add(K.cil(.15, .17, h, K.mat('#F0EAD8'), x, h / 2, z, 12)); if (i % 3 === 0) s.add(K.caja(1.5 + K.rnd() * 3, .3 + K.rnd() * 1.6, .4, K.mat('#D8C09A', { roughness: 1 }), x + 1, .5, z - 1, .03)); }
      return { scene: s, cam: K.cam([0, 2.2, 6], [-2, 3, -40], 50), post: { ap: .02 }, cam2: K.cam([0, 3.4, 9], [-3, 4, -40], 50), encima: (x, t) => rotulo(x, 'Más de 1,600 años', 'redescubierta en 1748', Math.min(1, Math.max(0, (t - 1.5) * 2))) }; },
    // 9 — pregunta: un pompeyano mira al Vesubio humeando
    (K) => { const s = K.escena('#6A6058'); cielo(K, s, .35); ciudad(K, s); const col = columna(K, 1); s.add(col); const a = romano(K, 0, 'preocupado'); a.position.set(.4, 0, 1); a.rotation.y = Math.PI - .15; s.add(a);
      return { scene: s, cam: K.cam([1.6, 1.8, 3.6], [-3, 6, -60], 50), cam2: K.cam([1.2, 1.7, 2.8], [-4, 8, -60], 50), post: { ap: .02 }, anima: (t) => { col.anima(3 + t); a.pose(t, 'quieto'); } }; },
  ];
})();
