/* No abras la puerta · Parte 1 — estilo "alerta" (noche morada/azul, subtítulos arriba, A/B al final) */
(function () {
  window.ESTILO = 'alerta';
  const T = window.T;
  // tiempo (relativo a la toma) en que se dice una palabra de la línea li
  const w = (li, pal, n = 0) => { const L = T.lineas[li]; const ps = L.palabras.filter(p => p[2].toLowerCase().replace(/[^a-záéíóúñ]/g, '') === pal); const p = ps[Math.min(n, ps.length - 1)] || L.palabras[0]; return p[0] - L.corte; };
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const golpeEn = (t, ts) => ts.reduce((m, t0) => Math.max(m, t >= t0 && t < t0 + .25 ? Math.exp(-(t - t0) * 14) : 0), 0);

  // ---------- departamento: pasillo de entrada con la puerta al fondo ----------
  function puerta(K, o = {}) { const g = new K.THREE.Group(); const madera = K.mat(o.col || '#4A2E44', { roughness: .7 });
    g.add(K.caja(1.22, 2.3, .12, K.mat('#D8D2E8'), 0, 1.15, -.02, .01));
    const hoja = K.caja(1.0, 2.15, .07, madera, 0, 1.08, .03, .01); g.add(hoja);
    for (const y of [.62, 1.6]) g.add(K.caja(.72, .72, .02, K.mat(o.col2 || '#5A3A54', { roughness: .7 }), 0, y, .075, .02));
    const ojo = K.cil(.022, .022, .03, K.mat('#C8C8D8', { metalness: .8, roughness: .3 }), 0, 1.58, .07); ojo.rotation.x = Math.PI / 2; g.add(ojo);
    const man = new K.THREE.Group(); man.position.set(.38, 1.0, .08); man.add(K.caja(.06, .16, .03, K.mat('#D8D8E4', { metalness: .9, roughness: .25 }), 0, 0, 0, .01));
    const palanca = K.caja(.17, .035, .035, K.mat('#E8E8F0', { metalness: .9, roughness: .2 }), -.075, 0, .035, .012); man.add(palanca); g.add(man);
    // luz que se mete por debajo de la puerta
    const raya = K.caja(.98, .012, .02, K.luz(o.luzCol || '#FFC890', 3), 0, .006, .08, .002); g.add(raya);
    const charco = new K.THREE.Mesh(new K.THREE.PlaneGeometry(1.2, .9), new K.THREE.MeshBasicMaterial({ color: o.luzCol || '#FFB070', transparent: true, opacity: .32, depthWrite: false, blending: K.THREE.AdditiveBlending }));
    charco.rotation.x = -Math.PI / 2; charco.position.set(0, .004, .5); g.add(charco);
    const pies = new K.THREE.Group(); for (const sx of [-.13, .13]) pies.add(K.caja(.13, .03, .5, new K.THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: .8 }), sx, .006, .3)); pies.visible = false; g.add(pies);
    const LZ = new K.THREE.PointLight(o.luzCol || '#FFB070', 1.1, 2.4, 2); LZ.position.set(0, .05, .35); g.add(LZ);
    g.userData = { hoja, man, raya, charco, pies, LZ }; return g; }
  function depa(K, o = {}) { const s = K.escena('#05040C'); K.cuarto(s, { pared: o.pared || '#2B2456', w: 3.2, d: 7, h: 2.8, piso: K.mat('#FFFFFF', { map: K.rep(K.TEX.pisoMadera, 1, 2), roughness: .8 }) });
    K.hemi(s, '#7A5AE0', '#1A0820', o.hemi != null ? o.hemi : .55);
    const p = puerta(K, o); p.position.set(0, 0, -3.38); s.add(p);
    // cuadros y perchero para que se sienta casa
    s.add(K.caja(.5, .62, .03, K.mat('#E8D8C0'), -1.58, 1.6, -1.6, .01)); s.add(K.caja(.4, .5, .02, K.mat('#6A8AC8'), -1.56, 1.6, -1.6, .01));
    s.add(K.caja(.08, 1.7, .08, K.mat('#2A1E22'), 1.35, .85, -2.7, .02)); s.add(K.caja(.5, .7, .2, K.mat('#7A3A4A', { roughness: .95 }), 1.32, 1.3, -2.62, .08));
    const fm = K.foco(s, o.magenta || '#FF3A9A', o.iMag != null ? o.iMag : 1.4, [1.2, 2.3, -1.0], 6); const fa = K.foco(s, '#3A6AFF', 1.3, [-1.2, 2.2, .5], 7);
    return { s, p, fm, fa }; }
  // pasillo del edificio (afuera)
  function pasilloAfuera(K, n = 6) { const s = K.escena('#030208'); K.cuarto(s, { pared: '#3A3048', w: 2.6, d: n * 3, h: 2.7, piso: K.mat('#8A8090', { roughness: .9 }) }); K.hemi(s, '#4A3A80', '#100510', .25);
    const lamps = []; for (let i = 0; i < n; i++) { const z = n * 1.5 - 1.5 - i * 3; const pl = K.caja(.5, .05, .5, K.luz('#FFD9A0', 2.2), 0, 2.66, z, .02); s.add(pl); const L = new K.THREE.PointLight('#FFC880', 1.6, 5, 1.8); L.position.set(0, 2.4, z); s.add(L); lamps.push({ pl, L, z });
      for (const sx of [-1, 1]) if (i % 2 === 0) { const pu = K.caja(.06, 2.1, .95, K.mat(['#5A3A50', '#3A4A60'][i % 2]), sx * 1.27, 1.05, z - .6, .01); s.add(pu); } }
    return { s, lamps }; }
  function mama(K) { const a = K.persona({ i: 2, expr: 'recta', avatar: { torso: '#B0405A', pierna: '#3A3A48', pelo: 'chongo', colPelo: '#2A1E16', piel: '#C98E62' } }); return a; }
  // ---------- 2D: celular con mensaje ----------
  function cel(x, k, o) { if (k <= 0) return; const e = 1 - Math.pow(1 - cl(k), 3); x.save(); x.globalAlpha = cl(k * 1.5); x.translate(540, 1000 + 120 * (1 - e)); x.scale(o.esc || 1, o.esc || 1); x.rotate(o.rot || 0);
    x.shadowColor = 'rgba(120,80,255,.55)'; x.shadowBlur = 80; x.fillStyle = '#0D0B16'; x.beginPath(); x.roundRect(-300, -560, 600, 1120, 70); x.fill(); x.shadowColor = 'transparent';
    x.fillStyle = o.fondo || '#14112A'; x.beginPath(); x.roundRect(-276, -536, 552, 1072, 52); x.fill();
    x.fillStyle = '#FFFFFF'; x.font = '700 30px Fredoka'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('3:0' + (o.min || 2), -236, -496); x.textAlign = 'right'; x.fillText('▮▮▮  83%', 236, -496);
    o.dibuja(x); x.restore(); }
  function burbujaChat(x, y, lineas, col = '#F2EEF8', txt = '#14112A') { const h = 30 + lineas.length * 52; x.fillStyle = col; x.beginPath(); x.roundRect(-236, y, 440, h, 30); x.fill(); x.fillStyle = txt; x.font = '700 38px Fredoka'; x.textAlign = 'left';
    lineas.forEach((l, i) => x.fillText(l, -206, y + 42 + i * 52)); return y + h; }
  function cabeceraChat(x, nombre) { x.fillStyle = '#E05A8A'; x.beginPath(); x.arc(-196, -400, 40, 0, 7); x.fill(); x.fillStyle = '#FFFFFF'; x.font = '700 40px Fredoka'; x.textAlign = 'center'; x.fillText(nombre[0], -196, -398);
    x.textAlign = 'left'; x.font = '700 44px Fredoka'; x.fillText(nombre, -136, -412); x.font = '700 26px Fredoka'; x.fillStyle = 'rgba(255,255,255,.6)'; x.fillText('en línea', -136, -372);
    x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(-276, -330, 552, 2); }
  // ---------- tarjetas A / B ----------
  function tarjeta(x, cx, cy, k, letra, col, titulo, sub, icono) { if (k <= 0) return; const e = 1 - Math.pow(1 - cl(k), 3); x.save(); x.globalAlpha = cl(k * 1.6); x.translate(cx, cy + 60 * (1 - e)); x.scale(.85 + .15 * e, .85 + .15 * e);
    x.shadowColor = col; x.shadowBlur = 50; x.fillStyle = 'rgba(14,12,30,.92)'; x.beginPath(); x.roundRect(-215, -270, 430, 540, 34); x.fill(); x.shadowColor = 'transparent'; x.lineWidth = 9; x.strokeStyle = col; x.stroke();
    x.save(); x.beginPath(); x.roundRect(-180, -235, 360, 300, 22); x.clip(); x.fillStyle = '#1E1A3A'; x.fillRect(-180, -235, 360, 300); icono(x); x.restore();
    x.fillStyle = col; x.beginPath(); x.arc(-180, -235, 46, 0, 7); x.fill(); x.fillStyle = '#0B0B18'; x.font = '700 56px Fredoka'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(letra, -180, -232);
    x.fillStyle = '#FFFFFF'; x.font = '700 50px Fredoka'; x.fillText(titulo, 0, 130); x.font = '700 34px Fredoka'; x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText(sub, 0, 192); x.restore(); }
  const iconoPuerta = (x) => { x.fillStyle = '#FFB070'; x.globalAlpha = .9; x.beginPath(); x.moveTo(-60, 60); x.lineTo(60, 60); x.lineTo(120, 65); x.lineTo(-120, 65); x.fill(); x.globalAlpha = 1;
    x.fillStyle = '#5A3A54'; x.fillRect(-70, -190, 140, 250); x.fillStyle = '#FFC890'; x.fillRect(-70, -190, 22, 250); x.fillStyle = '#E8E8F0'; x.fillRect(30, -70, 30, 10); x.fillStyle = '#0B0B18'; x.beginPath(); x.arc(0, -120, 32, 0, 7); x.fill(); x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(-11, -124, 7, 0, 7); x.arc(11, -124, 7, 0, 7); x.fill(); };
  const iconoCuarto = (x) => { x.fillStyle = '#3A5ACF'; x.fillRect(-130, -40, 260, 70); x.fillStyle = '#F2F2F2'; x.fillRect(-130, -70, 90, 34); x.fillStyle = '#6A4A3A'; x.fillRect(-140, 30, 280, 26); x.fillRect(-140, -110, 18, 166);
    x.strokeStyle = '#FFE135'; x.lineWidth = 10; x.beginPath(); x.arc(110, -150, 26, Math.PI, 0); x.stroke(); x.fillStyle = '#FFE135'; x.fillRect(78, -150, 64, 50); };

  window.TOMAS = [
    // 0 — 3 a.m., tocan tres veces
    (K) => { const D = depa(K); const u = D.p.userData; const ts = [w(0, 'toca'), w(0, 'toca') + .32, w(0, 'toca') + .64, w(0, 'veces') - .1, w(0, 'veces') + .2, w(0, 'veces') + .5];
      return { scene: D.s, cam: K.cam([.35, 1.45, 1.6], [0, 1.25, -3.3], 44), cam2: K.cam([.15, 1.35, -.6], [0, 1.2, -3.3], 40), anima: (t) => { const g = golpeEn(t, ts); u.hoja.position.z = .03 - g * .02; u.LZ.intensity = 1.1 + g; },
        sacudida: (t) => golpeEn(t, ts) * 1.2, post: { ap: .22 },
        encima: (x, t) => { const a = cl(t * 1.5) * cl((w(0, 'toca') + .2 - t) * 2 + 1); if (a <= 0) return; x.save(); x.globalAlpha = a; x.font = '700 150px "DejaVu Sans Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#FF2A6A'; x.shadowBlur = 40; x.fillStyle = '#FF4A7A'; x.fillText('3:00', 540, 880); x.restore(); } }; },
    // 1 — la voz de mamá; dos sombras de pies bajo la puerta
    (K) => { const D = depa(K, { iMag: 1.0 }); const u = D.p.userData; u.pies.visible = true;
      return { scene: D.s, cam: K.cam([.25, .28, -1.7], [0, .12, -3.4], 48), cam2: K.cam([.12, .22, -2.3], [0, .1, -3.4], 42), anima: (t) => { u.LZ.intensity = 1.3; u.charco.material.opacity = .4; }, post: { ap: .3, focus: 1.1 } }; },
    // 2 — te levantas; vibra el celular en el buró
    (K) => { const s = K.escena('#05040C'); K.cuarto(s, { pared: '#2A2058', w: 6, d: 6 }); K.hemi(s, '#6A4AD0', '#140818', .5); const c = K.cama('#3A3A9A'); c.position.set(0, 0, -1.6); s.add(c);
      const a = K.prota('dormido'); a.rotation.x = -Math.PI / 2; a.position.set(0, .7, -.62); a.scale.setScalar(.9); s.add(a); c.userData.cobija.visible = false; s.add(K.caja(1.34, .14, 1.15, K.mat('#3A3A9A', { roughness: .95 }), 0, .86, -1.3, .06));
      const mes = K.caja(.5, .55, .45, K.mat('#FFFFFF', { map: K.TEX.madera }), 1.05, .27, -2.4, .03); s.add(mes); const tel = K.caja(.14, .02, .26, K.mat('#101018'), 1.05, .56, -2.35, .01); s.add(tel);
      const pant = K.caja(.12, .005, .23, K.luz('#9A8AFF', 2.5), 1.05, .572, -2.35, .002); s.add(pant); const Lt = new K.THREE.PointLight('#8A7AFF', 0, 2.5, 2); Lt.position.set(1.05, .9, -2.3); s.add(Lt);
      K.foco(s, '#FF3A9A', .9, [-1.5, 2.2, 0], 7); const tv = w(2, 'vibra');
      return { scene: s, cam: K.cam([1.6, 1.55, -1.1], [-.1, .8, -2.1], 46), cam2: K.cam([1.35, 1.3, -1.5], [.3, .7, -2.2], 42),
        anima: (t) => { a.cara(t > .5 ? 'preocupado' : 'dormido'); a.userData.cabeza.rotation.y = .75; const on = t > tv; pant.visible = on; Lt.intensity = on ? 1.4 : 0; tel.position.x = 1.05 + (on && t < tv + 1.6 ? Math.sin(t * 90) * .006 : 0); }, post: { ap: .25 } }; },
    // 3 — el mensaje de mamá
    (K) => { const D = depa(K, { hemi: .35 }); const tm = w(3, 'no', 0);
      return { scene: D.s, cam: K.cam([.3, 1.4, .8], [0, 1.2, -3.3], 46), post: { ap: .9, focus: .4, oscuro: .3 },
        encima: (x, t) => cel(x, t / .45, { min: 2, dibuja: (x) => { cabeceraChat(x, 'Mamá'); const y = burbujaChat(x, -290, ['Ya voy para allá', 'mijo 🙂'], 'rgba(255,255,255,.14)', '#FFFFFF');
          if (t > tm - .3) { x.globalAlpha = cl((t - tm + .3) * 4); const y2 = burbujaChat(x, y + 40, ['NO ABRAS.'], '#E0385A', '#FFFFFF'); burbujaChat(x, y2 + 24, ['Yo sigo en casa', 'de tu tía.']); x.fillStyle = 'rgba(255,255,255,.55)'; x.font = '700 26px Fredoka'; x.fillText('3:02 a.m.  ✓✓', -206, y2 + 170); } } }) }; },
    // 4 — vuelven a tocar; tú en el pasillo, de espaldas
    (K) => { const D = depa(K); const u = D.p.userData; const yo = K.prota('miedo'); yo.position.set(.15, 0, -1.9); yo.rotation.y = Math.PI; D.s.add(yo); u.pies.visible = true;
      const ts = [w(4, 'tocar'), w(4, 'tocar') + .3, w(4, 'tocar') + .6, w(4, 'veces') + .2, w(4, 'veces') + .5, w(4, 'veces') + .8];
      return { scene: D.s, cam: K.cam([.6, 1.7, 3.2], [0, 1.3, -3.0], 46), cam2: K.cam([.45, 1.65, 2.0], [0, 1.3, -3.0], 44), anima: (t) => { const g = golpeEn(t, ts); u.hoja.position.z = .03 - g * .02; yo.pose(t, 'quieto'); yo.position.y = -g * .02; }, sacudida: (t) => golpeEn(t, ts), post: { ap: .2 } }; },
    // 5 — la mirilla: el suéter de siempre (2D: máscara redonda)
    (K) => { const P = pasilloAfuera(K, 4); const m = mama(K); m.position.set(0, 0, P.lamps[0].z - .3); m.rotation.y = 0; P.s.add(m); P.lamps.forEach((l, i) => { l.L.intensity = i === 0 ? 2.2 : i === 1 ? .6 : .2; l.pl.material.emissiveIntensity = i <= 1 ? 1.4 : .3; });
      const tsu = w(5, 'suéter');
      return { scene: P.s, cam: K.cam([0, 1.6, P.lamps[0].z + 1.6], [0, 1.25, P.lamps[0].z - 3], 74), cam2: K.cam([0, 1.6, P.lamps[0].z + 1.45], [0, 1.15, P.lamps[0].z - 3], 68), anima: (t) => { m.cara('recta'); m.userData.cabeza.rotation.x = .35; m.userData.cabeza.rotation.y = .1 * Math.sin(t * .7); }, post: { ap: .1, oscuro: .2 },
        encima: (x, t) => { x.save(); x.fillStyle = '#000'; x.beginPath(); x.rect(0, 0, 1080, 1920); x.arc(540, 980, 470 + 8 * Math.sin(t * 1.3), 0, Math.PI * 2, true); x.fill('evenodd');
          const gr = x.createRadialGradient(540, 980, 300, 540, 980, 480); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.85)'); x.fillStyle = gr; x.beginPath(); x.arc(540, 980, 480, 0, 7); x.fill(); x.restore(); } }; },
    // 6 — le marcas… y suena un celular detrás de la puerta
    (K) => { const D = depa(K, { hemi: .4 }); const u = D.p.userData; u.pies.visible = true; const ts = w(6, 'suena');
      return { scene: D.s, cam: K.cam([-.3, 1.2, .4], [0, .9, -3.4], 46), cam2: K.cam([-.15, .8, -1.2], [0, .6, -3.4], 44),
        anima: (t) => { const r = t > ts ? (.5 + .5 * Math.sin(t * 18)) : 0; u.raya.material.emissive.set(t > ts ? '#BFD4FF' : '#FFC890'); u.LZ.color.set(t > ts ? '#9AB8FF' : '#FFB070'); u.LZ.intensity = 1.1 + r * 1.8; u.charco.material.color.set(t > ts ? '#7A9AFF' : '#FFB070'); u.charco.material.opacity = .3 + r * .3; }, post: { ap: .3 },
        encima: (x, t) => { const k = cl(t / .4) * cl((ts - t) * 3 + 1); if (k <= 0) return; x.save(); x.globalAlpha = k; x.translate(540, 1500); x.fillStyle = 'rgba(14,12,30,.9)'; x.beginPath(); x.roundRect(-300, -90, 600, 180, 40); x.fill();
          x.fillStyle = '#E05A8A'; x.beginPath(); x.arc(-200, 0, 50, 0, 7); x.fill(); x.fillStyle = '#FFF'; x.font = '700 48px Fredoka'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('M', -200, 2);
          x.textAlign = 'left'; x.font = '700 46px Fredoka'; x.fillText('Mamá', -120, -24); x.font = '700 32px Fredoka'; x.fillStyle = 'rgba(255,255,255,.65)'; x.fillText('Llamando' + '...'.slice(0, 1 + ((t * 3) | 0) % 3), -120, 26);
          x.fillStyle = '#3ACF6A'; x.beginPath(); x.arc(210, 0, 44, 0, 7); x.fill(); x.restore(); } }; },
    // 7 — te contesta: en tu oído… y detrás de la puerta
    (K) => { const D = depa(K, { iMag: 1.8 }); const u = D.p.userData; u.pies.visible = true; const yo = K.prota('miedo'); yo.position.set(0, 0, -1.4); D.s.add(yo);
      return { scene: D.s, cam: K.cam([.15, 1.62, .4], [0, 1.55, -1.4], 40), cam2: K.cam([.08, 1.6, -.35], [0, 1.58, -1.4], 36), anima: (t) => { yo.pose(t, 'quieto'); yo.userData.cabeza.rotation.y = -.25 + .05 * Math.sin(t * 2); }, post: { ap: .6, focus: 1.1 } }; },
    // 8 — "¿Por qué no me abres, mijo?" — la puerta, muy cerca, en rojo
    (K) => { const D = depa(K, { magenta: '#FF1A4A', iMag: 2.2, hemi: .3 }); const u = D.p.userData; u.pies.visible = true;
      return { scene: D.s, cam: K.cam([.0, 1.5, -2.2], [0, 1.45, -3.4], 44), cam2: K.cam([.0, 1.55, -2.75], [0, 1.55, -3.4], 40), post: { ap: .2, oscuro: .15 } }; },
    // 9 — se apagan las luces del pasillo, una por una, hasta la tuya
    (K) => { const P = pasilloAfuera(K, 6); const m = mama(K); m.position.set(.35, 0, P.lamps[5].z - .2); m.rotation.y = -Math.PI / 2; P.s.add(m); const t0 = w(9, 'apagan'), t1 = w(9, 'tuya');
      const apag = P.lamps.map((l, i) => t0 + (t1 - t0) * i / 5);
      return { scene: P.s, cam: K.cam([-.5, 1.8, P.lamps[0].z + 2.5], [.2, 1.0, P.lamps[5].z - 1], 52), cam2: K.cam([-.4, 1.7, P.lamps[0].z + 1.2], [.2, 1.0, P.lamps[5].z - 1], 48),
        anima: (t) => { m.cara('recta'); P.lamps.forEach((l, i) => { const on = t < apag[i]; const fl = on && t > apag[i] - .3 ? (Math.sin(t * 80) > 0 ? 1 : .2) : 1; l.L.intensity = on ? 1.6 * fl : 0; l.pl.material.emissiveIntensity = on ? 2.2 * fl : .05; }); }, post: { ap: .15 } }; },
    // 10 — la manija empieza a girar
    (K) => { const D = depa(K, { hemi: .3, iMag: .9 }); const u = D.p.userData; u.LZ.intensity = 0; u.raya.visible = false; u.charco.visible = false; const tg = w(10, 'girar');
      return { scene: D.s, cam: K.cam([.62, 1.08, -2.55], [.36, 1.0, -3.3], 40), cam2: K.cam([.55, 1.05, -2.8], [.36, 1.0, -3.3], 36), anima: (t) => { u.man.rotation.z = t > tg ? -cl((t - tg) / 2.4) * .55 + Math.sin(t * 40) * .01 : 0; }, post: { ap: .35, focus: .55 } }; },
    // 11 — ¿A o B?
    (K) => { const D = depa(K, { hemi: .3, iMag: .9 }); const u = D.p.userData; u.LZ.intensity = 0; u.raya.visible = false; u.charco.visible = false; u.man.rotation.z = -.55; const yo = K.prota('miedo'); yo.position.set(0, 0, -2.1); D.s.add(yo);
      const ta = w(11, 'a', 0), tb = w(11, 'b', 0), tc = w(11, 'comenta');
      return { scene: D.s, cam: K.cam([.3, 1.75, 2.4], [0, 1.45, -2.6], 44), cam2: K.cam([.2, 1.7, 1.7], [0, 1.45, -2.6], 42), anima: (t) => { yo.pose(t, 'quieto'); }, post: { ap: .4, oscuro: .2 },
        encima: (x, t) => { const sel = (t0) => cl((t - t0) / .35); tarjeta(x, 290, 1440, sel(ta - .1), 'A', '#3A8AFF', 'Abres', 'y le ves la cara', iconoPuerta); tarjeta(x, 790, 1440, sel(tb - .1), 'B', '#FFD23A', 'Te encierras', 'en tu cuarto', iconoCuarto);
          const k = sel(tc - .1); if (k > 0) { x.save(); x.globalAlpha = k; x.font = '700 50px Fredoka'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = 'rgba(0,0,0,.8)'; x.shadowBlur = 16; x.fillStyle = '#FFFFFF'; x.fillText('Comenta A o B  ▼', 540, 1785); x.restore(); } } }; },
  ];
})();
