/* Plantilla "Mitos de animales": ilustración 2D semirrealista en canvas (paleta apagada, viñeta).
   Persona dormida vista desde arriba (estilizada), insectos realistas, anillos de detección,
   y un celular genérico para el cierre "envíaselo a…". Uso: const MT = window.MT; */
(function () {
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, prog = (t, a, b) => clamp((t - a) / (b - a));
  const ease = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2), easeOut = k => 1 - Math.pow(1 - clamp(k), 3);
  const backOut = k => { k = clamp(k); const c = 1.8; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };

  // ---------- la recámara vista desde arriba: cama, almohada, edredón acolchado, la mujer dormida ----------
  // coordenadas del "mundo": 1080×1920; la cabeza queda cerca de (540, 640)
  function recamara(c, t, o = {}) {
    // piso de madera oscura
    c.fillStyle = '#2B2F36'; c.fillRect(-400, -400, 1880, 2720);
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let x = -400; x < 1480; x += 120) { c.beginPath(); c.moveTo(x, -400); c.lineTo(x, 2320); c.stroke(); }
    // buró con lámpara apagada
    c.fillStyle = '#3A3530'; rr(c, 60, 420, 150, 150, 10); c.fill(); c.fillStyle = '#2E2A26'; c.beginPath(); c.arc(135, 495, 42, 0, 7); c.fill();
    // cama
    c.save(); c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 50; c.fillStyle = '#4A4E58'; rr(c, 230, 380, 620, 1500, 34); c.fill(); c.restore();
    c.fillStyle = '#C9CCD2'; rr(c, 250, 400, 580, 1460, 26); c.fill();   // sábana
    // almohada gris
    c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 24; c.fillStyle = '#8E939C'; rr(c, 300, 450, 480, 260, 70); c.fill(); c.restore();
    const pg = c.createLinearGradient(300, 450, 780, 710); pg.addColorStop(0, 'rgba(255,255,255,.18)'); pg.addColorStop(1, 'rgba(0,0,0,.18)'); c.fillStyle = pg; rr(c, 300, 450, 480, 260, 70); c.fill();
    const br = Math.sin(t * 1.5) * .5 + .5;   // respiración
    // cabello oscuro extendido en la almohada
    c.fillStyle = '#1E1A1C'; c.beginPath(); c.ellipse(540, 600, 150, 120, 0, 0, 7); c.fill();
    for (const [x, y, rx, ry, a] of [[440, 640, 70, 120, .5], [640, 640, 70, 120, -.5], [540, 560, 140, 70, 0]]) { c.beginPath(); c.ellipse(x, y, rx, ry, a, 0, 7); c.fill(); }
    // cuello y hombros con blusa gris
    c.fillStyle = '#B98F79'; rr(c, 505, 700, 70, 70, 20); c.fill();
    c.fillStyle = '#6E737C'; c.beginPath(); c.moveTo(370, 860); c.quadraticCurveTo(380, 760, 470, 750); c.lineTo(610, 750); c.quadraticCurveTo(700, 760, 710, 860); c.lineTo(710, 900); c.lineTo(370, 900); c.fill();
    c.fillStyle = '#B98F79'; c.beginPath(); c.ellipse(540, 755, 48, 18, 0, 0, 7); c.fill();
    // cara (estilizada, lisa)
    const fg = c.createRadialGradient(525, 620, 20, 540, 640, 120); fg.addColorStop(0, '#E2BDA4'); fg.addColorStop(1, '#C69A80');
    c.fillStyle = fg; c.beginPath(); c.ellipse(540, 640, 92, 118, 0, 0, 7); c.fill();
    c.fillStyle = '#1E1A1C'; c.beginPath(); c.ellipse(540, 545, 100, 46, 0, Math.PI, 0); c.fill();   // flequillo
    c.beginPath(); c.moveTo(445, 560); c.quadraticCurveTo(470, 520, 540, 525); c.quadraticCurveTo(470, 545, 452, 620); c.fill();
    c.strokeStyle = '#4A3430'; c.lineWidth = 4; c.lineCap = 'round';
    for (const s of [-1, 1]) { c.beginPath(); c.arc(540 + s * 36, 628, 18, .2 * Math.PI, .8 * Math.PI); c.stroke(); c.beginPath(); c.moveTo(540 + s * 22, 596); c.quadraticCurveTo(540 + s * 38, 588, 540 + s * 54, 596); c.stroke(); }
    c.strokeStyle = 'rgba(120,80,70,.5)'; c.beginPath(); c.moveTo(540, 645); c.lineTo(534, 672); c.lineTo(546, 674); c.stroke();
    // boca entreabierta (respira)
    c.fillStyle = '#5A2E30'; c.beginPath(); c.ellipse(540, 712, 17, 7 + 4 * br, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(210,120,120,.35)'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(540 + s * 58, 676, 20, 12, 0, 0, 7); c.fill(); }
    // edredón azul pizarra acolchado en rombos (sube y baja con la respiración)
    c.save(); c.translate(540, 900); c.scale(1, 1 + .006 * br); c.translate(-540, -900);
    c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 30; c.fillStyle = '#4A5B72'; rr(c, 240, 880, 600, 1000, 30); c.fill(); c.restore();
    c.save(); rr(c, 240, 880, 600, 1000, 30); c.clip();
    for (let y = 880; y < 1900; y += 90) for (let x = 240 - 45 * ((y / 90) % 2); x < 860; x += 90) {
      const g = c.createRadialGradient(x + 30, y + 30, 5, x + 45, y + 45, 60); g.addColorStop(0, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.18)'); c.fillStyle = g;
      c.beginPath(); c.moveTo(x + 45, y); c.lineTo(x + 90, y + 45); c.lineTo(x + 45, y + 90); c.lineTo(x, y + 45); c.closePath(); c.fill(); }
    c.strokeStyle = 'rgba(20,28,40,.5)'; c.lineWidth = 2.5; for (let k = -12; k < 20; k++) { c.beginPath(); c.moveTo(240 + k * 90, 880); c.lineTo(240 + k * 90 + 1000, 1880); c.stroke(); c.beginPath(); c.moveTo(840 - k * 90, 880); c.lineTo(840 - k * 90 - 1000, 1880); c.stroke(); }
    c.fillStyle = '#5A6D86'; c.fillRect(240, 880, 600, 34); c.restore();   // doblez
    c.restore();
    // brazos sobre el edredón
    for (const s of [-1, 1]) { c.save(); c.translate(540 + s * 175, 870); c.rotate(s * -.08);
      c.fillStyle = '#6E737C'; rr(c, -40, -10, 80, 90, 30); c.fill();
      const ag = c.createLinearGradient(-30, 0, 30, 0); ag.addColorStop(0, '#B98F79'); ag.addColorStop(.5, '#D2AA92'); ag.addColorStop(1, '#B08670'); c.fillStyle = ag; rr(c, -32, 70, 64, 330, 30); c.fill();
      c.beginPath(); c.ellipse(0, 410, 36, 46, 0, 0, 7); c.fill(); c.restore(); }
    return { cara: [540, 640], boca: [540, 712], brazoI: [365, 1050], pecho: [540, 900] };
  }

  // ---------- mosquito realista visto desde arriba ----------
  // (x, y) = tórax; s = escala (1 ≈ 60 px de largo); a = ángulo (0 = cabeza hacia arriba)
  function mosquito(c, x, y, s, a, t, o = {}) {
    c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
    const flap = o.vuela ? Math.sin(t * 90) : 0;
    // sombra
    if (o.sombra !== false) { c.save(); c.globalAlpha = .28; c.fillStyle = '#000'; c.filter = 'blur(4px)'; c.beginPath(); c.ellipse(10, 18, 14, 34, 0, 0, 7); c.fill(); c.restore(); }
    // patas: tres pares, largas, con articulaciones
    c.strokeStyle = '#2A2420'; c.lineCap = 'round';
    const legs = [[-6, -4, -1.0, 34, 30], [-7, 2, -1.7, 36, 40], [-6, 8, -2.4, 40, 46]];
    for (const sd of [-1, 1]) for (const [lx, ly, ang, l1, l2] of legs) {
      const wig = o.vuela ? Math.sin(t * 6 + ly) * .15 : 0;
      const a1 = (sd < 0 ? Math.PI - ang : ang) + wig, k1x = sd * Math.abs(lx) + Math.cos(a1) * l1 * sd * (sd < 0 ? -1 : 1), k1y = ly + Math.sin(a1) * l1 * .6;
      const kx = sd * (Math.abs(lx) + l1 * .9), ky = ly + (ly - 2) * 1.6 - 6;
      c.lineWidth = 2.2; c.beginPath(); c.moveTo(sd * 3, ly); c.lineTo(kx, ky); c.stroke();
      const ex = kx + sd * l2 * .55, ey = ky + (ly > 0 ? l2 : ly < 0 ? -l2 * .9 : l2 * .2);
      c.lineWidth = 1.4; c.beginPath(); c.moveTo(kx, ky); c.lineTo(ex, ey); c.stroke();
      c.lineWidth = .9; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex + sd * 6, ey + (ly > 0 ? 10 : -8)); c.stroke();
      // bandas blancas (Aedes)
      c.strokeStyle = 'rgba(230,230,225,.8)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(lerp(kx, ex, .5), lerp(ky, ey, .5)); c.lineTo(lerp(kx, ex, .58), lerp(ky, ey, .58)); c.stroke(); c.strokeStyle = '#2A2420';
    }
    // alas translúcidas con nervaduras
    for (const sd of [-1, 1]) { c.save(); c.rotate(sd * (.32 + .5 * flap)); c.translate(sd * 4, 4);
      const wg = c.createLinearGradient(0, -4, 0, 46); wg.addColorStop(0, 'rgba(210,225,235,.55)'); wg.addColorStop(1, 'rgba(180,200,215,.25)');
      c.fillStyle = wg; c.beginPath(); c.ellipse(sd * 6, 22, 7, 26, sd * .12, 0, 7); c.fill();
      c.strokeStyle = 'rgba(90,100,110,.6)'; c.lineWidth = .7; c.stroke();
      for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(sd * 2, 0); c.quadraticCurveTo(sd * (6 + k * 3), 20, sd * (6 + k * 4), 44); c.stroke(); }
      if (o.vuela) { c.globalAlpha = .25; c.fillStyle = 'rgba(220,230,240,.5)'; c.beginPath(); c.ellipse(sd * 6, 22, 14, 28, 0, 0, 7); c.fill(); }
      c.restore(); }
    // abdomen rayado (blanco y negro)
    const ab = c.createLinearGradient(-6, 0, 6, 0); ab.addColorStop(0, '#1A1614'); ab.addColorStop(.5, '#3A322C'); ab.addColorStop(1, '#1A1614');
    c.fillStyle = ab; c.beginPath(); c.ellipse(0, 26, 5.5, 22, 0, 0, 7); c.fill();
    if (o.llena) { c.fillStyle = 'rgba(150,20,30,.85)'; c.beginPath(); c.ellipse(0, 28, 6.5, 18, 0, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(235,235,228,.85)'; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(0, 10 + k * 6.5, 4.6, 1, 0, 0, 7); c.fill(); }
    // tórax con la lira blanca
    const th = c.createRadialGradient(-2, -4, 1, 0, 0, 10); th.addColorStop(0, '#4A4038'); th.addColorStop(1, '#1A1614');
    c.fillStyle = th; c.beginPath(); c.ellipse(0, 0, 8, 10, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(240,240,232,.9)'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(0, -8); c.lineTo(0, 7); c.moveTo(-3.5, -6); c.quadraticCurveTo(-5, 0, -3, 6); c.moveTo(3.5, -6); c.quadraticCurveTo(5, 0, 3, 6); c.stroke();
    // cabeza, ojos, antenas y trompa
    c.fillStyle = '#1A1614'; c.beginPath(); c.arc(0, -13, 4.5, 0, 7); c.fill();
    c.fillStyle = '#3A3A40'; for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * 2.8, -13.5, 2.2, 0, 7); c.fill(); }
    const ag = o.antenas || 0;
    for (const sd of [-1, 1]) { c.strokeStyle = ag ? `rgba(${lerp(40, 120, ag)},${lerp(36, 230, ag)},${lerp(32, 255, ag)},1)` : '#2A2420'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(sd * 1.5, -16); c.quadraticCurveTo(sd * 6, -26, sd * 8, -34); c.stroke();
      for (let k = 0; k < 7; k++) { const u = k / 7, px = lerp(sd * 2, sd * 8, u), py = lerp(-17, -33, u); c.beginPath(); c.moveTo(px, py); c.lineTo(px + sd * 3, py - 1); c.moveTo(px, py); c.lineTo(px - sd * 2, py - 2); c.stroke(); } }
    c.strokeStyle = '#2A2420'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(0, -17); c.lineTo(0, -40); c.stroke();
    c.restore();
  }

  // ---------- anillos de detección (cian o rojo-magenta) ----------
  function anillos(c, x, y, k, t, color = [90, 220, 255], n = 3, rMax = 420) {
    for (let i = 0; i < n; i++) { const u = ((t * .35 + i / n) % 1), r = 40 + u * rMax * k; c.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${(1 - u) * .8 * k})`; c.lineWidth = 6 - u * 3; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); }
    const g = c.createRadialGradient(x, y, 0, x, y, 120 * k + 1); g.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${.18 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 120 * k + 1, 0, 7); c.fill();
  }
  // nube de CO2 (aliento) saliendo de la boca
  function aliento(c, x, y, k, t) {
    for (let i = 0; i < 9; i++) { const u = ((t * .45 + i / 9) % 1); const px = x + Math.sin(i * 2.3 + t) * 30 * u, py = y + 40 + u * 260, r = 30 + u * 90;
      const g = c.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(140,190,255,${.35 * (1 - u) * k})`); g.addColorStop(1, 'rgba(140,190,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(px, py, r, 0, 7); c.fill(); }
  }
  // viñeta
  function vineta(c, W, H, k = .65) { const g = c.createRadialGradient(W / 2, H * .45, H * .25, W / 2, H * .5, H * .78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(5,7,12,${k})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }

  // ---------- celular genérico con hoja de "Enviar a" ----------
  function celular(c, W, H, t, pantalla, o = {}) {
    const pw = 600, ph = 1220, px = (W - pw) / 2, py = 300;
    c.save(); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 60; c.fillStyle = '#121418'; rr(c, px - 22, py - 22, pw + 44, ph + 44, 80); c.fill(); c.restore();
    c.save(); rr(c, px, py, pw, ph, 62); c.clip(); c.translate(px, py); c.scale(pw / W, ph / H); pantalla(c); c.restore();
    c.fillStyle = '#121418'; rr(c, px + pw / 2 - 90, py + 18, 180, 40, 20); c.fill();   // isla
    // botones genéricos de la interfaz (corazón, comentario, compartir)
    const bx = px + pw - 70; c.fillStyle = 'rgba(255,255,255,.92)'; c.strokeStyle = 'rgba(255,255,255,.92)'; c.lineWidth = 6; c.lineJoin = 'round';
    c.beginPath(); const hy = py + 620; c.moveTo(bx, hy + 18); c.bezierCurveTo(bx - 34, hy - 6, bx - 18, hy - 30, bx, hy - 12); c.bezierCurveTo(bx + 18, hy - 30, bx + 34, hy - 6, bx, hy + 18); c.stroke();
    c.beginPath(); c.arc(bx, py + 720, 22, .3, Math.PI * 2 - .3); c.stroke();
    const sy = py + 820; c.beginPath(); c.moveTo(bx - 22, sy + 14); c.lineTo(bx + 24, sy - 2); c.lineTo(bx - 22, sy - 18); c.lineTo(bx - 14, sy - 2); c.closePath(); c.stroke();
    const share = { x: bx, y: sy };
    // hoja inferior "Enviar a"
    const sh = o.hoja || 0;
    if (sh > 0) { const hy0 = py + ph - 520 * easeOut(sh);
      c.save(); rr(c, px, py, pw, ph, 62); c.clip(); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(px, py, pw, ph);
      c.fillStyle = '#1E2128'; rr(c, px, hy0, pw, 560, 40); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; rr(c, px + pw / 2 - 40, hy0 + 16, 80, 8, 4); c.fill();
      c.fillStyle = '#fff'; c.font = '800 34px Nunito, sans-serif'; c.textAlign = 'center'; c.fillText('Enviar a', px + pw / 2, hy0 + 70);
      const names = [['Ana', '#C97B6E'], ['Leo', '#6E8FC9'], ['Marta', '#8FC96E'], ['Dani', '#C9B36E']];
      names.forEach(([n, col], i) => { const cx = px + 90 + i * 140, cy = hy0 + 170; c.fillStyle = col; c.beginPath(); c.arc(cx, cy, 52, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,.9)'; c.font = '900 46px Nunito, sans-serif'; c.fillText(n[0], cx, cy + 16); c.fillStyle = '#C9CCD6'; c.font = '700 26px Nunito, sans-serif'; c.fillText(n, cx, cy + 92);
        if (o.sel === i) { c.strokeStyle = '#4AA3FF'; c.lineWidth = 7; c.beginPath(); c.arc(cx, cy, 60, 0, 7); c.stroke(); c.fillStyle = '#4AA3FF'; c.beginPath(); c.arc(cx + 38, cy + 38, 18, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx + 29, cy + 38); c.lineTo(cx + 36, cy + 45); c.lineTo(cx + 48, cy + 31); c.stroke(); } });
      const sent = o.enviado || 0; const by = hy0 + 330;
      c.fillStyle = sent > 0 ? '#2E9E5A' : '#4AA3FF'; rr(c, px + 40, by, pw - 80, 96, 48); c.fill();
      c.fillStyle = '#fff'; c.font = '900 40px Nunito, sans-serif'; c.fillText(sent > 0 ? 'Enviado ✓' : 'Enviar', px + pw / 2, by + 62);
      c.restore(); o.botonEnviar = [px + pw / 2, by + 48]; o.avatar = (i) => [px + 90 + i * 140, hy0 + 170]; }
    return { share, o };
  }
  // dedo ilustrado (apunta hacia arriba), con "tap"
  function dedo(c, x, y, s = 1, tap = 0) {
    c.save(); c.translate(x, y); c.scale(s * (1 - .08 * tap), s * (1 - .08 * tap));
    if (tap > 0) { c.strokeStyle = `rgba(255,255,255,${.8 * tap})`; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 30 + 40 * (1 - tap), 0, 7); c.stroke(); }
    c.fillStyle = '#E2B79C'; c.strokeStyle = '#7A4E3A'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(-22, 0); c.quadraticCurveTo(-22, -24, 0, -24); c.quadraticCurveTo(22, -24, 22, 0); c.lineTo(24, 110); c.quadraticCurveTo(70, 100, 78, 140); c.lineTo(80, 230); c.lineTo(-60, 230); c.lineTo(-62, 120); c.quadraticCurveTo(-40, 100, -22, 110); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = 'rgba(255,240,230,.7)'; c.beginPath(); c.ellipse(0, -6, 12, 14, 0, 0, 7); c.fill();
    c.restore();
  }

  window.MT = { clamp, lerp, prog, ease, easeOut, backOut, rng, rr, recamara, mosquito, anillos, aliento, vineta, celular, dedo };
})();
