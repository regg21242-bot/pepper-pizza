/* Imagina que despiertas en Chernóbil — una toma por línea del guion */
(function () {
  const rotulo = (x, l1, l2, a = 1, y = 430) => { x.save(); x.globalAlpha = a; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.font = '700 92px Fredoka'; x.lineWidth = 16; x.strokeStyle = '#000'; x.strokeText(l1, 540, y); x.fillStyle = '#FFD24A'; x.fillText(l1, 540, y);
    if (l2) { x.font = '700 56px Fredoka'; x.lineWidth = 12; x.strokeText(l2, 540, y + 96); x.fillStyle = '#FFFFFF'; x.fillText(l2, 540, y + 96); } x.restore(); };
  const ROPA = [{ torso: '#6A7A5A', pierna: '#3A3E4A', pelo: 'corto', colPelo: '#3A2A1E' }, { torso: '#B84A4A', pierna: '#4A4A5A', pelo: 'chongo', colPelo: '#C89A4A' }, { torso: '#4A6A9A', pierna: '#2A2E3A', pelo: 'picos', colPelo: '#8B5A2B' }, { torso: '#E8D8B0', pierna: '#5A4A3A', pelo: 'ondas', colPelo: '#2A1E16' }];
  const vecino = (K, i, expr = 'lado') => K.persona({ i, expr, avatar: ROPA[i % 4] });
  // edificio de departamentos soviético (frente hacia +z)
  function bloque(K, o = {}) { const g = K.G(), w = o.w || 16, pisos = o.pisos || 9, d = 8, ph = 2.8, H = pisos * ph; g.add(K.caja(w, H, d, K.mat(o.col || '#E4E2DA', { roughness: .95 }), 0, H / 2, -d / 2, .02));
    const enc = K.luz('#FFD890', 1.4), apag = K.mat('#28303E', { roughness: .3 }); K.sembrar(o.semilla || 5);
    for (let p = 0; p < pisos; p++) { g.add(K.caja(w + .1, .18, .1, K.mat(o.franja || '#C8C4B8'), 0, p * ph + .1, .02, .01)); for (let c = 0; c < Math.floor(w / 1.6); c++) { const on = o.luces != null && K.rnd() < o.luces; const v = K.caja(.9, 1.1, .06, on ? enc : apag, -w / 2 + .9 + c * 1.6, p * ph + 1.5, .03, .01); v.castShadow = false; g.add(v); } }
    return g; }
  function planta(K, o = {}) { const g = K.G(); g.add(K.caja(30, 10, 14, K.mat('#9A9C98', { roughness: 1 }), 0, 5, 0, .05)); g.add(K.caja(14, 16, 12, K.mat('#8A8C88', { roughness: 1 }), 6, 8, 0, .05));
    const chim = K.G(); for (let i = 0; i < 8; i++) chim.add(K.cil(1.25 - i * .06, 1.3 - i * .06, 4, K.mat(i % 2 ? '#C83A2E' : '#F2F0EA'), 0, 2 + i * 4, 0, 16)); chim.position.set(6, 16, 0); g.add(chim); return g; }
  function ciudad(K, s, o = {}) { K.piso(s, o.noche ? '#2A3A2A' : '#6E8A4E'); const asf = K.mat('#4A4C50', { roughness: 1 }); s.add(K.plano(10, 300, asf, 0, .005, -80));
    [[-14, -10, '#E4E2DA'], [14, -14, '#DCD8CC'], [-14, -40, '#E8E4DA'], [14, -44, '#E4E2DA'], [-14, -70, '#DCD8CC']].forEach(([x, z, c], i) => { const b = bloque(K, { col: c, luces: o.luces, semilla: 3 + i, pisos: 8 + (i % 3) }); b.position.set(x, 0, z); b.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; s.add(b); });
    for (let i = 0; i < 10; i++) { const a = K.arbol(1.1, o.noche ? '#2A4A2E' : '#4C8A3C'); a.position.set((i % 2 ? 1 : -1) * 6.5, 0, 2 - i * 8); s.add(a); }
    const pl = planta(K); pl.position.set(10, 0, -190); s.add(pl); return pl; }
  function autobus(K, col = '#E8C040') { const g = K.G(); g.add(K.caja(2.5, 2.6, 9, K.mat(col, { roughness: .6 }), 0, 1.6, 0, .25)); g.add(K.caja(2.52, .9, 8.4, K.mat('#22303E', { roughness: .2 }), 0, 2.1, .1, .05)); g.add(K.caja(2.52, .2, 9.02, K.mat('#F2F0EA'), 0, 1.4, 0, .02));
    for (const z of [-3, 3]) for (const x of [-1.2, 1.2]) { const r = K.cil(.5, .5, .3, K.mat('#151515'), x, .5, z, 14); r.rotation.z = Math.PI / 2; g.add(r); } return g; }
  function noria(K) { const g = K.G(); const am = K.mat('#E8C030', { roughness: .5 }), gr = K.mat('#8A8A86', { roughness: .8 }); const r = 7;
    const rueda = K.G(); rueda.add(K.M(new K.THREE.TorusGeometry(r, .12, 6, 40), gr)); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const rayo = K.caja(.08, r, .08, gr, Math.cos(a) * r / 2, Math.sin(a) * r / 2, 0, .01); rayo.rotation.z = a - Math.PI / 2; rueda.add(rayo);
      const cab = K.caja(1.1, 1.2, 1.1, am, Math.cos(a) * r, Math.sin(a) * r - .8, .5, .1); rueda.add(cab); }
    rueda.position.y = r + 1.5; g.add(rueda); for (const sx of [-1, 1]) { const p = K.caja(.25, r + 2, .25, gr, sx * 2.2, (r + 2) / 2, -.3, .02); p.rotation.z = sx * .28; g.add(p); } return g; }

  window.TOMAS = [
    // 0 — 1:23 a.m., algo a lo lejos te despierta
    (K) => { const s = K.escena('#06070E'); K.cuarto(s, { pared: '#5A6A7A', w: 6, d: 6 }); K.hemi(s, '#6A7AB0', '#141420', .5); const v = K.ventana({ w: 1.5, h: 1.4, vidrio: '#1A2450' }); v.position.set(1.2, 1.7, -2.88); s.add(v);
      const c = K.cama('#8A4A4A'); c.position.set(-.8, 0, -1.4); s.add(c); const a = vecino(K, 0, 'dormido'); a.rotation.x = -Math.PI / 2; a.position.set(-.8, .7, -.5); a.scale.setScalar(.9); s.add(a); const fl = K.foco(s, '#9AB8FF', 0, [1.2, 1.7, -2.4], 8);
      return { scene: s, cam: K.cam([1.4, 1.7, 1.2], [-.8, .8, -1.8], 46), cam2: K.cam([1.0, 1.5, .5], [-.8, .8, -1.9], 42), anima: (t) => { const f = t > 1.0 && t < 1.25; fl.intensity = f ? 6 : .4; v.userData.vidrio.material.emissiveIntensity = f ? 3 : .7; a.cara(t > 1.1 ? 'sorpresa' : 'dormido'); },
        sacudida: (t) => t > 1.0 && t < 1.5 ? .8 : 0, encima: (x, t) => rotulo(x, '1:23 a.m.', '26 de abril de 1986', Math.min(1, t * 2)) }; },
    // 1 — por la ventana: un resplandor raro en la planta
    (K) => { const s = K.escena('#05060C'); const est = K.noche(s, { hemi: .35, i: .4, luna: false, niebla: '#0A0E1C', n0: 60, n1: 400 }); const pl = ciudad(K, s, { noche: true, luces: .2 });
      const brillo = K.nube({ n: 50, col: '#8AB0FF', tam: 14, area: [6, 30, 6], vel: [0, 6, 0], vida: 5, opac: .55, aditivo: true, crece: 1, origen: [10, 12, -190], semilla: 4 }); s.add(brillo); const humo = K.nube({ n: 40, col: '#4A4A52', tam: 18, area: [10, 6, 10], vel: [3, 5, 0], vida: 8, opac: .7, origen: [12, 22, -190] }); s.add(humo);
      const marco = K.ventana({ w: 2.6, h: 2.2, vidrio: '#000000', brillo: 0 }); return { scene: s, cam: K.cam([0, 14, 20], [8, 10, -190], 34), cam2: K.cam([0, 14, 20], [9, 12, -190], 30), anima: (t) => { est.anima(t); brillo.anima(t); humo.anima(t); }, post: { ap: .02, bloom: 1.3 },
        encima: (x) => { x.save(); x.fillStyle = '#1A1E2A'; x.fillRect(0, 0, 1080, 140); x.fillRect(0, 1780, 1080, 140); x.fillRect(0, 0, 90, 1920); x.fillRect(990, 0, 90, 1920); x.fillRect(0, 900, 1080, 40); x.fillRect(520, 0, 40, 1920); x.restore(); } }; },
    // 2 — Prípiat, 1986: la ciudad y la planta al fondo
    (K) => { const s = K.escena('#05060C'); const est = K.noche(s, { hemi: .4, i: .5, luna: [-.3, .4, -.85], niebla: '#0E1224', n0: 80, n1: 500 }); ciudad(K, s, { noche: true, luces: .3 });
      const brillo = K.nube({ n: 40, col: '#8AB0FF', tam: 12, area: [6, 24, 6], vel: [0, 5, 0], vida: 5, opac: .45, aditivo: true, origen: [10, 12, -190], semilla: 4 }); s.add(brillo);
      return { scene: s, cam: K.cam([0, 24, 40], [4, 8, -120], 44), cam2: K.cam([0, 20, 28], [4, 8, -120], 44), anima: (t) => { est.anima(t); brillo.anima(t); }, post: { ap: .02 }, encima: (x, t) => rotulo(x, 'PRÍPIAT', 'Unión Soviética · 1986', Math.min(1, t * 2)) }; },
    // 3 — al día siguiente todo normal: niños a la escuela
    (K) => { const s = K.escena('#9CC4E8'); K.dia(s, { niebla: '#D8E4EC', n1: 500 }); ciudad(K, s, {}); const humo = K.nube({ n: 40, col: '#6A6A70', tam: 16, area: [8, 6, 8], vel: [3, 4, 0], vida: 8, opac: .6, origen: [12, 22, -190] }); s.add(humo);
      const ninos = []; for (let i = 0; i < 4; i++) { const a = vecino(K, i + 2, 'feliz'); a.scale.setScalar(.7); a.position.set(-1.6 + (i % 2) * .9, 0, 2 - i * 1.3); a.rotation.y = Math.PI; a.userData.torso.add(K.caja(.9, 1.1, .5, K.mat(['#C83A3A', '#3A6AC8', '#3AA85A', '#E8A030'][i]), 0, .1, -.6, .1)); s.add(a); ninos.push(a); }
      return { scene: s, cam: K.cam([2.2, 1.6, 6], [-1, 1.2, -6], 46), anima: (t) => { humo.anima(t); ninos.forEach((a, i) => { a.position.z = 2 - i * 1.3 - t * .9; a.pose(t * 1.2 + i, 'caminar'); }); } }; },
    // 4 — llegan cientos de autobuses
    (K) => { const s = K.escena('#9CC4E8'); K.dia(s, { niebla: '#D8E4EC', n1: 500, i: 1.2 }); ciudad(K, s, {}); const bs = []; for (let i = 0; i < 14; i++) { const b = autobus(K, i % 3 ? '#E8C040' : '#D8DCE0'); b.position.set(-2.4 + (i % 2) * 4.8, 0, 10 - i * 11); s.add(b); bs.push(b); }
      return { scene: s, cam: K.cam([4, 9, 22], [-1, 1, -40], 44), cam2: K.cam([4, 7, 16], [-1, 1, -40], 44), anima: (t) => bs.forEach((b, i) => { b.position.z = 10 - i * 11 + Math.min(t, 3) * 2 * (i % 2 ? 0 : 1); }), post: { ap: .02 } }; },
    // 5 — "solo tres días; lleven lo necesario"
    (K) => { const s = K.escena('#9CC4E8'); K.dia(s, { niebla: '#D8E4EC', n1: 500, i: 1.3 }); ciudad(K, s, {}); const b = autobus(K); b.position.set(-2.4, 0, -4); s.add(b); const g = [];
      for (let i = 0; i < 4; i++) { const a = vecino(K, i, ['preocupado', 'triste', 'preocupado', 'recta'][i]); a.position.set(.2, 0, 1.6 - i * 1.2); a.rotation.y = Math.PI + .4; a.scale.setScalar(i === 2 ? .7 : 1); s.add(a); const mal = K.caja(.55, .4, .2, K.mat(['#6A3A2A', '#3A4A6A', '#5A5A3A', '#7A2A2A'][i]), 0, 0, 0, .04); s.add(mal); g.push([a, mal]); }
      return { scene: s, cam: K.cam([3.2, 1.7, 4.2], [-.4, 1.2, -1.6], 44), anima: (t) => g.forEach(([a, m], i) => { a.position.z = 1.6 - i * 1.2 - t * .35; a.pose(t * .8 + i, 'caminar'); a.updateMatrixWorld(true); const h = a.userData.brazos[1].localToWorld(new K.THREE.Vector3(0, -1.6, 0)); m.position.set(h.x, h.y - .2, h.z); }),
        encima: (x, t) => rotulo(x, '"Solo 3 días"', '', Math.min(1, Math.max(0, (t - .5) * 2))) }; },
    // 6 — 49,000 personas se van: el convoy sale de la ciudad
    (K) => { const s = K.escena('#B8C4CC'); K.dia(s, { niebla: '#C8D0D8', n1: 380, i: 1.0, arriba: '#8AA0B8' }); ciudad(K, s, {}); const bs = []; for (let i = 0; i < 16; i++) { const b = autobus(K, i % 3 ? '#E8C040' : '#D8DCE0'); b.rotation.y = Math.PI; b.position.set(2.4, 0, -10 - i * 11); s.add(b); bs.push(b); }
      return { scene: s, cam: K.cam([-3, 16, 26], [2, 0, -60], 44), cam2: K.cam([-3, 18, 30], [2, 0, -80], 44), anima: (t) => bs.forEach((b, i) => { b.position.z = -10 - i * 11 + t * 4; }), post: { ap: .02 }, encima: (x, t) => rotulo(x, '49,000', 'personas evacuadas', Math.min(1, Math.max(0, (t - .3) * 2))) }; },
    // 7 — casi nadie volvió: la ciudad vacía y la rueda de la fortuna abandonada
    (K) => { const s = K.escena('#8A9098'); K.dia(s, { niebla: '#9AA0A6', n0: 20, n1: 160, i: .7, arriba: '#7A8088', horizonte: '#A8ACB0', hemi: .6 }); ciudad(K, s, {}); const n = noria(K); n.position.set(-1, 0, -16); s.add(n);
      K.sembrar(9); for (let i = 0; i < 30; i++) { const a = K.arbol(.5 + K.rnd() * .8, '#5A6A3A'); a.position.set((K.rnd() - .5) * 9, 0, -K.rnd() * 30); s.add(a); }
      return { scene: s, cam: K.cam([3, 2, 8], [-1, 6, -16], 48), cam2: K.cam([2.4, 2.2, 5], [-1, 7, -16], 48), post: { ap: .03 } }; },
    // 8 — pregunta: la noria, tantos años después
    (K) => { const s = K.escena('#8A9098'); K.dia(s, { niebla: '#9AA0A6', n0: 20, n1: 160, i: .6, arriba: '#6A7078', horizonte: '#A0A4A8', hemi: .55 }); ciudad(K, s, {}); const n = noria(K); n.position.set(0, 0, -10); s.add(n);
      return { scene: s, cam: K.cam([0, 1.5, 6], [0, 7, -10], 52), cam2: K.cam([0, 1.5, 3], [0, 8, -10], 56), post: { ap: .02 } }; },
  ];
})();
