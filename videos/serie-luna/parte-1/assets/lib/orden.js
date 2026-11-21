/* Serie "Luna" — gráficos de interfaz (2D) y orden de la parte 1. Sustituye/añade ESC.crear(renderer, T). */
(function () {
  const THREE = window.THREE, N = window.N, L = window.L, E = window.ESC, { rng, clamp, lerp, prog, ease, easeOut } = N, { HDR, CIAN, ROJO, rr, logo } = L, { mira, V3, FONT, MANO } = E;
  const W = 1080, H = 1920;
  const fondo = (x, a = '#05070C', b = '#0A1020') => { const g = x.createRadialGradient(W / 2, H * .45, 50, W / 2, H * .45, H * .8); g.addColorStop(0, b); g.addColorStop(1, a); x.fillStyle = g; x.fillRect(0, 0, W, H); };
  const pop = k => k <= 0 ? 0 : k < .6 ? easeOut(k / .6) * 1.12 : 1.12 - .12 * ease((k - .6) / .4);

  // círculo grande con arco que se llena y número gigante (segundos)
  function dibCirculo(T) { return (x, t, k) => { fondo(x); const cx = W / 2, cy = H * .52, R = 330; const s = clamp((t - T.seg0) / 4 * 4, 0, 4), n = Math.min(4, Math.floor(s) + (t >= T.seg0 ? 1 : 0));
    x.save(); x.strokeStyle = 'rgba(63,230,242,.25)'; x.lineWidth = 6; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.stroke(); x.fillStyle = 'rgba(8,14,24,.9)'; x.beginPath(); x.arc(cx, cy, R - 20, 0, 7); x.fill();
    x.fillStyle = CIAN; for (const yy of [cy - R - 40, cy + R + 40]) { for (let i = -1; i <= 1; i++) { x.beginPath(); x.arc(cx + i * 30, yy, 7, 0, 7); x.fill(); } }
    const fr = t < T.seg0 ? 0 : clamp((t - T.seg0) / 4); x.strokeStyle = CIAN; x.lineWidth = 22; x.lineCap = 'round'; x.shadowColor = CIAN; x.shadowBlur = 30; x.beginPath(); x.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + fr * Math.PI * 2); x.stroke();
    x.shadowBlur = 50; x.fillStyle = CIAN; x.font = FONT(900, 380); x.textAlign = 'center'; x.fillText(String(Math.max(0, n)), cx, cy + 135);
    x.shadowBlur = 0; x.fillStyle = 'rgba(200,240,255,.7)'; x.font = FONT(800, 44); x.fillText('SEGUNDOS', cx, cy + R + 130); logo(x, cx, cy - R - 170, 60, .9); x.restore(); }; }

  // contador gigante "SIN CONEXIÓN"
  function cuenta(T, t) { return Math.max(0, 90 - Math.floor(Math.max(0, t - T.t90))); }
  function dibContador(T) { return (x, t, k) => { fondo(x, '#030406', '#0A0C14'); logo(x, W / 2, 560, 90); const n = cuenta(T, t), fr = (t - T.t90) % 1;
    x.save(); x.fillStyle = '#FFFFFF'; x.font = FONT(900, 420); x.textAlign = 'center'; x.shadowColor = 'rgba(255,255,255,.5)'; x.shadowBlur = 40; x.globalAlpha = .85 + .15 * (1 - fr); x.fillText(String(n), W / 2, 1110); x.globalAlpha = 1;
    x.shadowBlur = 0; x.fillStyle = ROJO; x.font = FONT(900, 74); const bl = Math.sin(t * 6) > -.3 ? 1 : .4; x.globalAlpha = bl; x.beginPath(); x.arc(W / 2 - 280, 1262, 18, 0, 7); x.fill(); x.fillText('SIN CONEXIÓN', W / 2 + 22, 1290); x.globalAlpha = 1;
    x.strokeStyle = 'rgba(232,50,58,.4)'; x.lineWidth = 3; rr(x, W / 2 - 330, 1200, 660, 120, 60); x.stroke(); x.restore(); }; }

  // ficha "ARCHIVO · SUJETO 12" con datos que van apareciendo
  function dibArchivo(T) { return (x, t, k) => { fondo(x, '#04060A', '#081420'); const ap = (t0) => clamp((t - t0) / .35);
    x.save(); x.strokeStyle = 'rgba(63,230,242,.8)'; x.lineWidth = 3; rr(x, 70, 330, 940, 1250, 24); x.stroke(); x.fillStyle = 'rgba(8,18,28,.75)'; x.fill();
    x.fillStyle = CIAN; x.font = FONT(900, 50); x.textAlign = 'left'; x.fillText('ARCHIVO · SUJETO 12', 120, 420); x.fillRect(120, 445, 840, 3);
    // silueta cian
    x.globalAlpha = ap(T.arch0); x.strokeStyle = CIAN; x.lineWidth = 4; rr(x, 120, 480, 300, 360, 18); x.stroke(); x.fillStyle = 'rgba(63,230,242,.85)'; x.beginPath(); x.arc(270, 610, 70, 0, 7); x.fill(); x.beginPath(); x.ellipse(270, 820, 130, 110, 0, Math.PI, 0); x.fill();
    // audio del padre con onda
    x.globalAlpha = ap(T.arch0 + .6); x.fillStyle = '#E8F8FF'; x.font = FONT(800, 36); x.fillText('papá · audio grabado', 460, 540); x.fillStyle = 'rgba(200,240,255,.6)'; x.font = FONT(700, 30); x.fillText('0:21', 460, 585);
    x.fillStyle = CIAN; for (let i = 0; i < 46; i++) { const hgt = 10 + 70 * Math.abs(Math.sin(i * .7) * Math.sin(i * .23 + 1)) * (.6 + .4 * Math.sin(t * 6 + i)); x.fillRect(460 + i * 11, 700 - hgt / 2, 6, hgt); }
    x.strokeStyle = 'rgba(63,230,242,.5)'; x.lineWidth = 2; x.beginPath(); x.moveTo(460, 790); x.lineTo(960, 790); x.stroke(); x.fillStyle = CIAN; x.beginPath(); x.arc(460 + 500 * clamp((t - T.arch0 - .6) / 3), 790, 10, 0, 7); x.fill();
    // datos extra (escena 21)
    const fila = (y, et, v, t0) => { x.globalAlpha = ap(t0); x.fillStyle = 'rgba(200,240,255,.6)'; x.font = FONT(800, 28); x.fillText(et, 120, y); x.fillStyle = '#FFFFFF'; x.font = FONT(900, 36); x.fillText(v, 120, y + 44); };
    fila(910, 'HABLA EN SUEÑOS', 'NO', T.datos0); fila(1010, 'CAFÉ', 'CORTO, SIN AZÚCAR', T.datos0 + .5); fila(1110, 'DUERME', '00:30 – 07:00', T.datos0 + 1.0);
    // mapa "TU CALLE"
    x.globalAlpha = ap(T.datos0 + .3); x.fillStyle = '#0E1A28'; rr(x, 560, 880, 400, 300, 16); x.fill(); x.strokeStyle = 'rgba(63,230,242,.6)'; x.lineWidth = 2; x.stroke(); x.save(); rr(x, 560, 880, 400, 300, 16); x.clip();
    x.strokeStyle = 'rgba(160,190,220,.35)'; x.lineWidth = 10; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(560, 900 + i * 70); x.lineTo(960, 860 + i * 80); x.stroke(); x.beginPath(); x.moveTo(600 + i * 90, 880); x.lineTo(560 + i * 100, 1180); x.stroke(); } x.restore();
    x.fillStyle = ROJO; x.beginPath(); x.arc(760, 1030, 16 + 4 * Math.sin(t * 5), 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = FONT(900, 28); x.fillText('TU CALLE', 580, 1165);
    // chat con tu madre
    x.globalAlpha = ap(T.datos0 + 1.4); x.fillStyle = 'rgba(255,255,255,.08)'; rr(x, 120, 1220, 840, 210, 20); x.fill(); x.fillStyle = 'rgba(200,240,255,.6)'; x.font = FONT(800, 26); x.fillText('CHAT · MAMÁ', 150, 1262);
    x.fillStyle = '#2A2C36'; rr(x, 150, 1285, 470, 60, 26); x.fill(); x.fillStyle = '#EEF0F6'; x.font = FONT(700, 28); x.fillText('¿Has dormido bien, cariño?', 175, 1325);
    x.fillStyle = '#2E5AA8'; rr(x, 560, 1355, 370, 60, 26); x.fill(); x.fillStyle = '#fff'; x.fillText('Sí, mamá. Te llamo luego.', 580, 1395);
    // sello rojo inclinado
    const ks = clamp((t - T.sello) / .3); if (ks > 0) { x.globalAlpha = 1; x.save(); x.translate(740, 1500); x.rotate(-.18); const s = 1.6 - .6 * easeOut(ks); x.scale(s, s); x.globalAlpha = .9 * ks; x.strokeStyle = ROJO; x.lineWidth = 7; rr(x, -260, -55, 520, 110, 10); x.stroke(); x.fillStyle = ROJO; x.font = FONT(900, 46); x.textAlign = 'center'; x.fillText('ENVIADO POR: M. REY', 0, 16); x.restore(); }
    x.restore(); }; }

  // cuadrícula "SUJETOS ANTERIORES"
  function dibSujetos(T) { const meses = ['ENE', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV']; return (x, t, k) => { fondo(x, '#030405', '#0A0B10');
    x.save(); x.fillStyle = '#FFFFFF'; x.font = FONT(900, 64); x.textAlign = 'center'; x.globalAlpha = clamp((t - T.suj0 + .4) / .4); x.fillText('SUJETOS ANTERIORES', W / 2, 400); x.fillStyle = ROJO; x.fillRect(W / 2 - 160, 430, 320, 5);
    for (let i = 0; i < 12; i++) { const col = i % 3, fila = Math.floor(i / 3), X = 90 + col * 310, Y = 500 + fila * 300, ki = clamp((t - T.suj0 - i * .22) / .3); if (ki <= 0) continue;
      x.globalAlpha = ki; const esTu = i === 11; x.fillStyle = esTu ? 'rgba(232,50,58,.12)' : 'rgba(150,154,164,.16)'; rr(x, X, Y, 280, 270, 16); x.fill(); x.strokeStyle = esTu ? ROJO : 'rgba(170,174,184,.45)'; x.lineWidth = 3; x.stroke();
      x.fillStyle = esTu ? ROJO : '#8A8E98'; x.beginPath(); x.arc(X + 70, Y + 80, 38, 0, 7); x.fill(); x.beginPath(); x.ellipse(X + 70, Y + 170, 60, 45, 0, Math.PI, 0); x.fill();
      x.fillStyle = esTu ? '#FFB0B0' : '#D8DAE0'; x.font = FONT(900, 46); x.textAlign = 'left'; x.fillText(String(i + 1).padStart(2, '0'), X + 140, Y + 95);
      x.fillStyle = esTu ? '#FFD0D0' : '#A8ACB6'; x.font = FONT(800, 22); x.fillText('ENTRADA:', X + 20, Y + 222); x.fillText('SALIDA:', X + 20, Y + 254); x.fillStyle = '#E8EAF0';
      x.fillText(esTu ? 'ESTE MES' : `${meses[i % 6]}/${2021 + Math.floor(i / 3)}`, X + 130, Y + 222); x.fillText('—', X + 130, Y + 254); }
    x.restore(); }; }

  // ---------------- orden de la parte 1 ----------------
  function crear(renderer, T) {
    const C = T.cortes, lista = [], sp = i => ({ a: C[i], b: C[i + 1] || T.end });
    const add = (i, e) => { lista.push(Object.assign(e, sp(i))); return e; };
    // 1 y loop: altavoz frente a la ciudad
    const camAlt = (e, t, a, b, z0 = 2.6, z1 = 1.5) => { const k = ease(prog(t, a, b)); mira(e.cam, V3(lerp(.82, .72, k), lerp(.62, .66, k), lerp(-1.35 + z0, -1.35 + z1, k)), V3(.6, .7, -1.35)); };
    const ciclo = (e, t) => { e.alt.setColor(0, 1); e.domos.forEach(d => d.setLed(1)); e.pintaPantalla(null); };
    add(0, E.escAtico(T, { upd: (t, e) => { ciclo(e, t); camAlt(e, t, 0, C[1], 2.6, 1.55); }, post: () => ({ focus: 1.6, ap: .35 }) }));
    add(1, E.escAtico(T, { fov: 30, upd: (t, e) => { ciclo(e, t); const d = e.domos[0], k = ease(prog(t, C[1], C[2])); mira(e.cam, V3(lerp(1.3, 1.0, k), lerp(2.3, 2.5, k), lerp(.2, -.3, k)), d.position.clone().add(V3(0, -.04, 0))); e.domos[0].setLed(Math.sin(t * 3) > -.6 ? 1 : .2); }, post: () => ({ focus: .9, ap: .4 }) }));
    add(2, E.escTorre(T, { estado: () => ({ noche: false }), zoom: k => lerp(.3, 2.0, ease(Math.min(1, k / .78))), cy: k => lerp(1.36, .28, ease(Math.min(1, k / .78))) }));
    add(3, E.escFoco(T));
    add(4, E.escAtico(T, { fov: 34, upd: (t, e) => { ciclo(e, t); e.pintaPantalla('logo', t, prog(t, C[4], C[4] + .8)); const k = ease(prog(t, C[4], C[6])); mira(e.cam, V3(-1.6, 1.75, lerp(2.6, 2.3, k)), V3(-3.6, 1.75, 1.2)); } }));
    add(5, E.escAtico(T, { fov: 34, upd: (t, e) => { ciclo(e, t); e.pintaPantalla('cal', t, prog(t, C[5] + .3, C[6] - .3)); const k = ease(prog(t, C[4], C[6])); mira(e.cam, V3(-1.6, 1.75, lerp(2.6, 2.3, k)), V3(-3.6, 1.75, 1.2)); } }));
    add(6, E.escAtico(T, { fov: 30, upd: (t, e) => { ciclo(e, t); e.pintaPantalla('charla', t, 1); const k = ease(prog(t, C[6], C[7])); mira(e.cam, V3(-2.0, 1.75, lerp(2.0, 1.8, k)), V3(-3.6, 1.75, 1.2)); } }));
    add(7, E.escTarjeta(T));
    add(8, E.escEnchufe(T));
    add(9, E.escCafetera(T));
    add(10, E.escMesita(T));
    add(11, E.escMesita(T, { foto: true }));
    add(12, E.escUI(dibCirculo(T), { z0: 1.0, z1: .92 }));
    add(13, E.escNocturna(T));
    add(14, E.escTorre(T, { estado: (t) => ({ noche: true, off: t < T.apagon ? -1 : Math.floor(clamp((t - T.apagon) / 2.6) * 35) }), zoom: k => lerp(2.0, 1.85, k), cy: k => lerp(.28, .35, k) }));
    add(15, E.escAtico(T, { fov: 40, upd: (t, e) => { e.alt.setColor(0, 1); e.pintaPantalla(null); e.domos.forEach((d, i) => d.setLed(t < T.camOff + i * .25 ? 1 : 0)); const k = ease(prog(t, C[15], C[16])); mira(e.cam, V3(1.0, lerp(1.2, 1.3, k), lerp(2.6, 2.3, k)), V3(.4, 2.6, -1.0)); }, post: () => ({ focus: 3, ap: .2 }) }));
    const blanco = (t) => ease(prog(t, T.blanco, T.blanco + 1.2));
    add(16, E.escAtico(T, { upd: (t, e) => { e.alt.setColor(blanco(t), 1); e.domos.forEach(d => d.setLed(0)); e.pintaPantalla(null); e.foco.intensity = 6 * (1 - .7 * blanco(t)); camAlt(e, t, C[16], C[17], 1.5, 1.1); }, post: () => ({ focus: 1.2, ap: .4, oscuro: .3 }) }));
    add(17, E.escAtico(T, { upd: (t, e) => { e.alt.setColor(1, .9 + .1 * Math.sin(t * 7)); e.domos.forEach(d => d.setLed(0)); e.pintaPantalla(null); e.foco.intensity = 1.8; camAlt(e, t, C[17], C[18], 1.1, .62); }, post: () => ({ focus: .7, ap: .5, oscuro: .4 }) }));
    add(18, E.escUI(dibContador(T), { z0: 1.05, z1: .95 }));
    const arch = E.escUI(dibArchivo(T), { z0: 1.0, z1: .92, dx: .04 }); lista.push(Object.assign(arch, { a: C[19], b: C[21] }));
    add(21, E.escUI(dibSujetos(T), { z0: 1.0, z1: .93 }));
    add(22, E.escPuerta(T));
    add(23, E.escEnchufe(T, { cerca: true, quieto: true }));
    add(24, E.escAtico(T, { upd: (t, e) => { const v = ease(prog(t, T.vuelve, T.vuelve + .8)); e.alt.setColor(1 - v, 1); e.domos.forEach(d => d.setLed(v)); e.pintaPantalla(null); e.foco.intensity = 1.8 + 4.2 * v; e.relleno.intensity = .6 * v; camAlt(e, t, C[24], C[25], 1.0, 1.9); }, post: () => ({ focus: 1.5, ap: .3 }) }));
    add(25, E.escChat(T));
    const fin = add(26, E.escAtico(T, { upd: (t, e) => { ciclo(e, t); const k = ease(prog(t, C[26], C[27])); mira(e.cam, V3(lerp(-.2, .2, k), 1.2, lerp(2.4, 2.0, k)), V3(.4, .9, -1.4)); }, post: () => ({ focus: 2.4, ap: .25, oscuro: .9 }) }));
    // loop: el mismo plano del inicio (el último cuadro = el primero)
    lista.push(Object.assign(E.escAtico(T, { upd: (t, e) => { ciclo(e, t); camAlt(e, t - T.end, 0, C[1], 2.6, 1.55); }, post: () => ({ focus: 1.6, ap: .35 }) }), { a: C[27], b: T.end + 1 }));
    lista.sort((p, q) => p.a - q.a);
    // miniaturas de las tarjetas
    const foto = (e, t, prep) => { e.a = 0; e.b = 1; e.upd(t); if (prep) prep(e); renderer.setRenderTarget(null); renderer.render(e.scene, e.cam); const c = document.createElement('canvas'); c.width = 520; c.height = 392; c.getContext('2d').drawImage(renderer.domElement, 0, 560, 1080, 814, 0, 0, 520, 392); return c; };
    const mA = foto(E.escEnchufe(T), .5, e => mira(e.cam, V3(.03, -.08, .2), V3(0, -.09, 0))), mB = foto(E.escPuerta(T), .5);
    const cB = mB.getContext('2d'); cB.fillStyle = 'rgba(10,10,12,.82)'; rr(cB, 300, 20, 200, 86, 16); cB.fill(); cB.fillStyle = ROJO; cB.font = FONT(900, 60); cB.textAlign = 'center'; cB.fillText('09:00', 400, 84);
    return { lista, miniaturas: { A: mA, B: mB }, cuenta: t => cuenta(T, t) };
  }
  E.crear = crear;
})();
