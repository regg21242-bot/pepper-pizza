/* Serie "Luna" — gráficos de interfaz (2D) y orden de la parte 1. Sustituye/añade ESC.crear(renderer, T). */
(function () {
  const THREE = window.THREE, N = window.N, L = window.L, E = window.ESC, { rng, clamp, lerp, prog, ease, easeOut } = N, { HDR, CIAN, ROJO, rr, logo } = L, { mira, V3, FONT, MANO } = E;
  const W = 1080, H = 1920;
  const fondo = (x, a = '#05070C', b = '#0A1020') => { const g = x.createRadialGradient(W / 2, H * .45, 50, W / 2, H * .45, H * .8); g.addColorStop(0, b); g.addColorStop(1, a); x.fillStyle = g; x.fillRect(0, 0, W, H); };
  const pop = k => k <= 0 ? 0 : k < .6 ? easeOut(k / .6) * 1.12 : 1.12 - .12 * ease((k - .6) / .4);

  // círculo grande tipo rejilla de altavoz con borde metálico, arco que se llena y número gigante
  const madera = (x) => { x.fillStyle = '#1E140E'; x.fillRect(0, 0, W, H); for (let i = 0; i < W; i += 36) { x.fillStyle = (i / 36) % 2 ? 'rgba(60,40,28,.5)' : 'rgba(40,26,18,.5)'; x.fillRect(i, 0, 32, H); x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(i + 32, 0, 4, H); } const v = x.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, H * .7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.7)'); x.fillStyle = v; x.fillRect(0, 0, W, H); };
  function dibCirculo(T) { return (x, t, k) => { madera(x); const cx = W / 2, cy = H * .52, R = 425;
    x.save(); const rim = x.createLinearGradient(cx - R, cy - R, cx + R, cy + R); rim.addColorStop(0, '#4A525E'); rim.addColorStop(.5, '#14181E'); rim.addColorStop(1, '#3A424C'); x.fillStyle = rim; x.beginPath(); x.arc(cx, cy, R + 30, 0, 7); x.fill();
    x.fillStyle = '#0C0F14'; x.beginPath(); x.arc(cx, cy, R - 6, 0, 7); x.fill(); x.save(); x.beginPath(); x.arc(cx, cy, R - 40, 0, 7); x.clip(); x.fillStyle = '#12161C'; x.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    x.fillStyle = 'rgba(70,80,92,.55)'; for (let yy = cy - R; yy < cy + R; yy += 14) for (let xx = cx - R + ((yy / 14) % 2) * 7; xx < cx + R; xx += 14) { x.beginPath(); x.arc(xx, yy, 3, 0, 7); x.fill(); } x.restore();
    x.strokeStyle = 'rgba(120,150,170,.35)'; x.lineWidth = 4; x.beginPath(); x.arc(cx, cy, R - 6, 0, 7); x.stroke();
    for (const yy of [cy - R - 100, cy + R + 100]) { x.shadowColor = '#7AD8FF'; x.shadowBlur = 30; x.fillStyle = '#9ADCF0'; x.beginPath(); x.arc(cx, yy, 16, 0, 7); x.fill(); } x.shadowBlur = 0;
    const s = t < T.seg0 ? 0 : Math.min(4, Math.floor(t - T.seg0) + 1), fr = t < T.seg0 ? 0 : clamp((t - T.seg0) / 4);
    x.strokeStyle = '#8AD8F8'; x.lineWidth = 20; x.lineCap = 'round'; x.shadowColor = '#5AC8FF'; x.shadowBlur = 26; if (fr > 0) { x.beginPath(); x.arc(cx, cy, R + 14, -Math.PI / 2, -Math.PI / 2 + fr * Math.PI * 2); x.stroke(); }
    x.shadowBlur = 40; x.fillStyle = '#4FC8F0'; x.font = FONT(900, 400); x.textAlign = 'center'; if (s > 0) x.fillText(String(s), cx, cy + 120); x.restore(); }; }

  // contador gigante "SIN CONEXIÓN"
  function cuenta(T, t) { return Math.max(0, 90 - Math.floor(Math.max(0, t - T.t90))); }
  function dibContador(T) { return (x, t, k) => { fondo(x, '#030406', '#0A0C14'); logo(x, W / 2, 560, 90); const n = cuenta(T, t), fr = (t - T.t90) % 1;
    x.save(); x.fillStyle = '#FFFFFF'; x.font = FONT(900, 420); x.textAlign = 'center'; x.shadowColor = 'rgba(255,255,255,.5)'; x.shadowBlur = 40; x.globalAlpha = .85 + .15 * (1 - fr); x.fillText(String(n), W / 2, 1110); x.globalAlpha = 1;
    x.shadowBlur = 0; x.fillStyle = ROJO; x.font = FONT(900, 74); const bl = Math.sin(t * 6) > -.3 ? 1 : .4; x.globalAlpha = bl; x.beginPath(); x.arc(W / 2 - 280, 1262, 18, 0, 7); x.fill(); x.fillText('SIN CONEXIÓN', W / 2 + 22, 1290); x.globalAlpha = 1;
    x.strokeStyle = 'rgba(232,50,58,.4)'; x.lineWidth = 3; rr(x, W / 2 - 330, 1200, 660, 120, 60); x.stroke(); x.restore(); }; }

  // ficha "ARCHIVO · SUJETO 12" compacta (franja oscura con cajas de borde azul fino)
  const caja = (x, X, Y, w, h) => { x.fillStyle = 'rgba(10,14,22,.85)'; rr(x, X, Y, w, h, 8); x.fill(); x.strokeStyle = 'rgba(160,190,230,.55)'; x.lineWidth = 2.5; x.stroke(); };
  function fondoLampara(x) { x.fillStyle = '#07080B'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(40,44,52,.8)'; x.lineWidth = 14; x.beginPath(); x.moveTo(-40, 1500); x.quadraticCurveTo(300, 1380, 420, 1470); x.stroke(); x.fillStyle = '#16181E'; x.beginPath(); x.ellipse(420, 1560, 110, 90, 0, Math.PI, 0); x.fill(); }
  function dibArchivo(T) { return (x, t, k) => { fondoLampara(x); const ap = (t0) => clamp((t - t0) / .35); x.save();
    const extra = ease(clamp((t - T.datos0 + .2) / .5)), bandH = 520 + 470 * extra;
    x.fillStyle = 'rgba(14,16,22,.96)'; x.fillRect(0, 560, W, bandH); x.fillStyle = '#8ACBF0'; x.font = FONT(600, 46); x.textAlign = 'left'; x.fillText('ARCHIVO · SUJETO 12', 60, 640); x.fillStyle = '#9A9EA8'; x.font = FONT(800, 46); x.textAlign = 'right'; x.fillText(String(cuenta(T, t)), W - 60, 640);
    x.globalAlpha = ap(T.arch0); caja(x, 60, 680, 250, 330); x.fillStyle = '#5AB4E0'; x.beginPath(); x.arc(185, 790, 62, 0, 7); x.fill(); x.beginPath(); x.ellipse(185, 990, 110, 105, 0, Math.PI, 0); x.fill(); x.fillStyle = '#E8F4FF'; x.font = FONT(700, 30); x.textAlign = 'center'; x.fillText('TÚ', 185, 1000);
    x.globalAlpha = ap(T.arch0 + .5); caja(x, 340, 680, 680, 150); x.textAlign = 'left'; x.fillStyle = '#E8EAF0'; x.font = FONT(600, 34); x.fillText('papá · audio grabado', 370, 728); x.textAlign = 'right'; x.fillText('0:21', 990, 728);
    for (let i = 0; i < 60; i++) { const hh = 6 + 46 * Math.abs(Math.sin(i * .9) * Math.sin(i * .31 + 1)) * (.7 + .3 * Math.sin(t * 7 + i)); x.fillStyle = '#E8C060'; x.fillRect(370 + i * 10.3, 790 - hh / 2, 5, hh); }
    x.globalAlpha = ap(T.arch0 + 1.0); caja(x, 340, 850, 680, 70); x.textAlign = 'left'; x.fillStyle = '#C8D8F0'; x.font = FONT(600, 32); x.fillText('HABLA EN SUEÑOS:', 370, 897); x.textAlign = 'right'; x.fillStyle = '#FFFFFF'; x.font = FONT(800, 34); x.fillText('NO', 990, 897);
    x.globalAlpha = extra; x.textAlign = 'left';
    caja(x, 60, 1040, 470, 70); x.fillStyle = '#C8D8F0'; x.font = FONT(600, 28); x.fillText('CAFÉ:', 85, 1086); x.fillStyle = '#fff'; x.font = FONT(800, 28); x.fillText('CORTO, SIN AZÚCAR', 175, 1086);
    caja(x, 60, 1125, 470, 70); x.fillStyle = '#C8D8F0'; x.font = FONT(600, 28); x.fillText('DUERME:', 85, 1171); x.fillStyle = '#fff'; x.font = FONT(800, 28); x.fillText('00:30 – 07:00', 220, 1171);
    caja(x, 560, 1040, 460, 250); x.save(); rr(x, 562, 1042, 456, 246, 8); x.clip(); x.strokeStyle = 'rgba(150,170,200,.35)'; x.lineWidth = 8; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(560, 1070 + i * 60); x.lineTo(1020, 1040 + i * 66); x.stroke(); x.beginPath(); x.moveTo(600 + i * 100, 1040); x.lineTo(570 + i * 104, 1290); x.stroke(); } x.restore();
    x.fillStyle = '#E8323A'; x.beginPath(); x.arc(790, 1160, 14 + 3 * Math.sin(t * 5), 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = FONT(800, 24); x.fillText('TU CALLE', 580, 1276);
    caja(x, 60, 1210, 470, 200); x.fillStyle = '#9AB0D0'; x.font = FONT(700, 22); x.fillText('CHAT · MAMÁ', 85, 1244); x.fillStyle = '#2A2C36'; rr(x, 85, 1262, 360, 50, 22); x.fill(); x.fillStyle = '#EEF0F6'; x.font = FONT(600, 24); x.fillText('¿Has dormido bien?', 105, 1296);
    x.fillStyle = '#2E5AA8'; rr(x, 200, 1330, 310, 50, 22); x.fill(); x.fillStyle = '#fff'; x.fillText('Sí, mamá. Te llamo.', 218, 1364);
    const sello = (txt, t0, X0, Y0) => { const ks = clamp((t - t0) / .3); if (ks <= 0) return; x.save(); x.globalAlpha = ks; x.translate(X0, Y0); x.rotate(-.06); const sc = 1.4 - .4 * easeOut(ks); x.scale(sc, sc); x.strokeStyle = '#E8323A'; x.lineWidth = 5; rr(x, -230, -36, 460, 72, 8); x.stroke(); x.fillStyle = '#F04A4A'; x.font = FONT(700, 34); x.textAlign = 'center'; x.fillText(txt, 0, 12); x.restore(); };
    x.globalAlpha = 1; sello('ENVIADO POR: M. REY', T.sello, 680, 975 + 470 * extra * .97);
    x.restore(); }; }

  // cuadrícula "SUJETOS ANTERIORES" (fichas grises con silueta a la izquierda)
  function dibSujetos(T) { const fechas = ['01/22', '04/22', '07/22', '10/22', '01/23', '04/23', '07/23', '10/23', '01/24', '04/24', '07/24']; return (x, t, k) => { fondoLampara(x); x.save();
    x.fillStyle = 'rgba(14,16,22,.96)'; x.fillRect(0, 520, W, 1000); x.fillStyle = '#8ACBF0'; x.font = FONT(600, 46); x.textAlign = 'left'; x.fillText('SUJETOS ANTERIORES', 40, 600); x.fillStyle = '#9A9EA8'; x.font = FONT(800, 46); x.textAlign = 'right'; x.fillText(String(cuenta(T, t)), W - 40, 600);
    for (let i = 0; i < 12; i++) { const col = i % 3, fila = Math.floor(i / 3), X = 30 + col * 345, Y = 635 + fila * 215, ki = clamp((t - T.suj0 - i * .2) / .3); if (ki <= 0) continue;
      const tu = i === 11; x.globalAlpha = ki; x.fillStyle = tu ? 'rgba(60,18,22,.9)' : 'rgba(34,36,42,.95)'; rr(x, X, Y, 330, 200, 10); x.fill(); x.strokeStyle = tu ? '#E8323A' : 'rgba(190,196,206,.55)'; x.lineWidth = 2.5; x.stroke();
      x.save(); rr(x, X, Y, 330, 200, 10); x.clip(); x.fillStyle = tu ? '#C84048' : '#6A6E78'; x.beginPath(); x.arc(X + 80, Y + 80, 40, 0, 7); x.fill(); x.beginPath(); x.ellipse(X + 80, Y + 205, 78, 80, 0, Math.PI, 0); x.fill(); x.restore();
      x.fillStyle = '#FFFFFF'; x.font = FONT(900, 46); x.textAlign = 'right'; x.fillText(tu ? 'TÚ' : String(i + 1).padStart(2, '0'), X + 310, Y + 56);
      x.textAlign = 'left'; x.fillStyle = '#C8CCD4'; x.font = FONT(700, 21); x.fillText('ENTRADA: ' + (tu ? 'HOY' : fechas[i]), X + 150, Y + 120); x.fillText('SALIDA:', X + 150, Y + 160); x.fillStyle = '#E8323A'; x.fillRect(X + 245, Y + 152, 22, 4); }
    x.restore(); }; }

  // ---------------- orden de la parte 1 ----------------
  function crear(renderer, T) {
    const C = T.cortes, lista = [], sp = i => ({ a: C[i], b: C[i + 1] || T.end });
    const add = (i, e) => { lista.push(Object.assign(e, sp(i))); return e; };
    // 1 y loop: altavoz frente a la ciudad
    const camAlt = (e, t, a, b, z0 = 3.0, z1 = 1.8) => { const k = ease(prog(t, a, b)); const z = lerp(z0, z1, k); mira(e.cam, V3(lerp(.55, .45, k), 2.1 + (z - 1.8) * .1, z), V3(.45, lerp(1.72, 1.78, k), -1.6)); };
    const ciclo = (e, t) => { e.alt.setColor(0, 1); e.domos.forEach(d => d.setLed(1, .6)); e.pintaPantalla(null); };
    add(0, E.escAtico(T, { upd: (t, e) => { ciclo(e, t); camAlt(e, t, 0, C[1], 3.0, 1.9); }, post: () => ({ focus: 3.4, ap: .12 }) }));
    add(1, E.escAtico(T, { fov: 30, upd: (t, e) => { ciclo(e, t); const d = e.domos[0], k = ease(prog(t, C[1], C[2])); mira(e.cam, V3(lerp(1.3, 1.1, k), lerp(2.7, 2.85, k), lerp(-.6, -1.0, k)), d.position.clone().add(V3(0, -.06, 0))); e.domos[0].setLed(Math.sin(t * 3) > -.6 ? 1 : .2); }, post: () => ({ focus: .9, ap: .4 }) }));
    add(2, E.escTorre(T, { estado: () => ({ noche: false }), zoom: k => lerp(.3, 2.0, ease(Math.min(1, k / .78))), cy: k => lerp(1.36, .28, ease(Math.min(1, k / .78))) }));
    add(3, E.escFoco(T));
    add(4, E.escAtico(T, { fov: 34, upd: (t, e) => { ciclo(e, t); e.pintaPantalla('logo', t, prog(t, C[4], C[4] + .8)); const k = ease(prog(t, C[4], C[6])); mira(e.cam, V3(lerp(1.1, .7, k), 1.75, 1.2), V3(-3.6, 1.75, 1.2)); } }));
    add(5, E.escAtico(T, { fov: 34, upd: (t, e) => { ciclo(e, t); e.pintaPantalla('cal', t, prog(t, C[5] + .3, C[6] - .3)); const k = ease(prog(t, C[4], C[6])); mira(e.cam, V3(lerp(1.1, .7, k), 1.75, 1.2), V3(-3.6, 1.75, 1.2)); } }));
    add(6, E.escAtico(T, { fov: 30, upd: (t, e) => { ciclo(e, t); e.pintaPantalla('charla', t, 1); const k = ease(prog(t, C[6], C[7])); mira(e.cam, V3(lerp(.7, .4, k), 1.75, 1.2), V3(-3.6, 1.75, 1.2)); } }));
    add(7, E.escTarjeta(T));
    add(8, E.escEnchufe(T));
    add(9, E.escCafetera(T));
    add(10, E.escMesita(T));
    add(11, E.escMesita(T, { foto: true }));
    add(12, E.escUI(dibCirculo(T), { z0: 1.0, z1: .92 }));
    add(13, E.escNocturna(T));
    add(14, E.escTorre(T, { estado: (t) => ({ noche: true, off: t < T.apagon ? -1 : Math.floor(clamp((t - T.apagon) / 2.6) * 35) }), zoom: k => lerp(2.0, 1.85, k), cy: k => lerp(.28, .35, k) }));
    add(15, E.escAtico(T, { fov: 40, upd: (t, e) => { e.alt.setColor(0, 1); e.pintaPantalla(null); e.domos.forEach((d, i) => d.setLed(t < T.camOff + i * .25 ? 1 : 0, 5)); const k = ease(prog(t, C[15], C[16])); mira(e.cam, V3(lerp(.6, .5, k), lerp(1.9, 2.0, k), lerp(3.2, 2.7, k)), V3(.5, 2.05, -2)); }, post: () => ({ focus: 3, ap: .2 }) }));
    const blanco = (t) => ease(prog(t, T.blanco, T.blanco + 1.2));
    add(16, E.escAtico(T, { upd: (t, e) => { e.alt.setColor(blanco(t), 1); e.domos.forEach(d => d.setLed(0)); e.pintaPantalla(null); e.foco.intensity = 6 * (1 - .7 * blanco(t)); camAlt(e, t, C[16], C[17], 1.9, 1.3); }, post: () => ({ focus: 1.2, ap: .4, oscuro: .3 }) }));
    add(17, E.escAtico(T, { upd: (t, e) => { e.alt.setColor(1, .9 + .1 * Math.sin(t * 7)); e.domos.forEach(d => d.setLed(0)); e.pintaPantalla(null); e.foco.intensity = 1.8; camAlt(e, t, C[17], C[18], 1.3, .9); }, post: () => ({ focus: .95, ap: .5, oscuro: .4 }) }));
    add(18, E.escUI(dibContador(T), { z0: 1.05, z1: .95 }));
    const arch = E.escUI(dibArchivo(T), { z0: 1.0, z1: .92, dx: .04 }); lista.push(Object.assign(arch, { a: C[19], b: C[21] }));
    add(21, E.escUI(dibSujetos(T), { z0: 1.0, z1: .93 }));
    add(22, E.escPuerta(T));
    add(23, E.escEnchufe(T, { cerca: true, quieto: true }));
    add(24, E.escAtico(T, { upd: (t, e) => { const v = ease(prog(t, T.vuelve, T.vuelve + .8)); e.alt.setColor(1 - v, 1); e.domos.forEach(d => d.setLed(v)); e.pintaPantalla(null); e.foco.intensity = 1.8 + 4.2 * v; e.relleno.intensity = .6 * v; camAlt(e, t, C[24], C[25], 1.0, 2.0); }, post: () => ({ focus: 1.5, ap: .3 }) }));
    add(25, E.escChat(T));
    const fin = add(26, E.escAtico(T, { upd: (t, e) => { ciclo(e, t); const k = ease(prog(t, C[26], C[27])); mira(e.cam, V3(lerp(.1, .4, k), 1.55, lerp(3.3, 2.9, k)), V3(.3, 1.4, -1.0)); }, post: () => ({ focus: 3.6, ap: .15, oscuro: .9 }) }));
    // loop: el mismo plano del inicio (el último cuadro = el primero)
    lista.push(Object.assign(E.escAtico(T, { upd: (t, e) => { ciclo(e, t); camAlt(e, t - T.end, 0, C[1], 3.0, 1.9); }, post: () => ({ focus: 3.4, ap: .12 }) }), { a: C[27], b: T.end + 1 }));
    lista.sort((p, q) => p.a - q.a);
    // miniaturas de las tarjetas
    const foto = (e, t, prep) => { e.a = 0; e.b = 1; e.upd(t); if (prep) prep(e); renderer.setRenderTarget(null); renderer.render(e.scene, e.cam); const c = document.createElement('canvas'); c.width = 520; c.height = 392; c.getContext('2d').drawImage(renderer.domElement, 0, 560, 1080, 814, 0, 0, 520, 392); return c; };
    const mA = foto(E.escEnchufe(T), .5, e => mira(e.cam, V3(.03, -.08, .2), V3(0, -.09, 0))), mB = foto(E.escPuerta(T), .5);
    const cB = mB.getContext('2d'); cB.fillStyle = 'rgba(10,10,12,.82)'; rr(cB, 300, 20, 200, 86, 16); cB.fill(); cB.fillStyle = ROJO; cB.font = FONT(900, 60); cB.textAlign = 'center'; cB.fillText('09:00', 400, 84);
    return { lista, miniaturas: { A: mA, B: mB }, cuenta: t => cuenta(T, t) };
  }
  E.crear = crear;
})();
