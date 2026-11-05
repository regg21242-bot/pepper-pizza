/* El chico que ganó 3 millones jugando Fortnite — escenas (arte original, sin assets del juego) */
const KID = { coat: '#2F7BE0', hat: 'hair', hatColor: '#5A3A22' };   // sudadera azul
const RGB = ['#FF3B6B', '#FFB23F', '#5BFF8A', '#3BD1FF', '#B26BFF'];

function headset(p, col = '#1E1E24') {
  const { x, y, r } = p.head;
  ctx.save(); ctx.lineWidth = r * .16; ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r * 1.12, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + sd * r * 1.02, y + r * .1, r * .26, r * .38, 0, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = '#3BD1FF'; ctx.beginPath(); ctx.arc(x + sd * r * 1.02, y + r * .1, r * .1, 0, 7); ctx.fill(); }
  ctx.strokeStyle = col; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.moveTo(x - r * 1.0, y + r * .35); ctx.quadraticCurveTo(x - r * .7, y + r * .8, x - r * .2, y + r * .62); ctx.stroke();
  ctx.restore();
}
/* pantalla de un battle royale genérico: isla, tormenta que se cierra, muñequito */
function gameScreen(x, y, w, h, t, o = {}) {
  ctx.save(); roundRect(x, y, w, h, 10); ctx.clip();
  const sky = ctx.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#7EC8F2'); sky.addColorStop(1, '#CFEFFF'); ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  // isla
  ctx.fillStyle = '#3A8AD0'; ctx.fillRect(x, y + h * .55, w, h * .45);
  ctx.beginPath(); ctx.ellipse(x + w * .5, y + h * .72, w * .44, h * .2, 0, 0, 7); ctx.fillStyle = '#5DBB4A'; ctx.fill();
  for (let i = 0; i < 6; i++) { const tx = x + w * (.18 + i * .13), ty = y + h * (.62 + (i % 2) * .08); ctx.fillStyle = '#2E7A34'; ctx.beginPath(); ctx.moveTo(tx, ty - h * .1); ctx.lineTo(tx + w * .03, ty); ctx.lineTo(tx - w * .03, ty); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#C98A3E'; ctx.fillRect(x + w * .58, y + h * .6, w * .08, h * .07);
  // tormenta morada que se cierra
  const R = lerp(w * .7, w * .22, ((t * .12) % 1));
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.arc(x + w * .5, y + h * .68, R, 0, Math.PI * 2, true); ctx.fillStyle = 'rgba(140,60,220,0.45)'; ctx.fill('evenodd'); ctx.restore();
  ctx.strokeStyle = '#E6B3FF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + w * .5, y + h * .68, R, 0, 7); ctx.stroke();
  // muñequito jugador + rampas que construye
  const px = x + w * .45 + Math.sin(t * 2) * w * .05, py = y + h * .66;
  ctx.fillStyle = '#C98A3E'; for (let k = 0; k < 3; k++) { ctx.save(); ctx.translate(px + w * .04 + k * w * .05, py - k * h * .05); ctx.rotate(-.6); ctx.fillRect(0, 0, w * .06, h * .015); ctx.restore(); }
  ctx.fillStyle = '#2F7BE0'; ctx.fillRect(px - 4, py - 14, 8, 14); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py - 18, 5, 0, 7); ctx.fill();
  // HUD
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(x + w - 150, y + 12, 136, 40, 8); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `800 24px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(`👤 ${o.alive ?? Math.max(2, 100 - Math.floor(t * 9))}`, x + w - 140, y + 33);
  ctx.restore();
  roundRect(x, y, w, h, 10); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
}
function gamerRoom(t, o = {}) {
  ctx.fillStyle = '#16122A'; ctx.fillRect(0, 0, W, H);
  // tira LED
  const c = RGB[Math.floor(t * 2) % RGB.length];
  const lg = ctx.createLinearGradient(0, 0, 0, 900); lg.addColorStop(0, c + '55'); lg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, 900);
  ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 30; ctx.fillRect(0, 120, W, 10); ctx.shadowBlur = 0;
  // pósters
  roundRect(60, 220, 220, 300, 8); inked('#2A2448', 5); ctx.fillStyle = '#FFD84A'; ctx.font = `900 60px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('GG', 170, 400);
  roundRect(820, 260, 200, 260, 8); inked('#2A2448', 5); ctx.beginPath(); ctx.arc(920, 390, 60, 0, 7); inked('#FF3B6B', 4);
  if (o.window) { // ventana con luces de policía
    roundRect(820, 240, 220, 320, 8); inked('#0B0F24', 6);
    const on = Math.floor(t * 6) % 2;
    const pg = ctx.createRadialGradient(930, 420, 10, 930, 420, 400); pg.addColorStop(0, on ? 'rgba(255,40,60,0.75)' : 'rgba(40,90,255,0.75)'); pg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pg; ctx.fillRect(500, 0, 580, 1000);
    ctx.strokeStyle = '#E9E4D8'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(930, 240); ctx.lineTo(930, 560); ctx.moveTo(820, 400); ctx.lineTo(1040, 400); ctx.stroke();
  }
  // escritorio
  roundRect(40, 1120, 1000, 50, 10); inked('#2B2D3A', 6);
  for (const x of [80, 960]) { ctx.fillStyle = '#1E1E24'; ctx.fillRect(x, 1170, 40, 500); }
  ctx.fillStyle = '#2A2238'; ctx.fillRect(0, 1650, W, H - 1650);
  // monitor
  roundRect(250, 640, 580, 380, 16); inked('#111', 8);
  gameScreen(266, 656, 548, 348, t, o);
  ctx.fillStyle = '#111'; ctx.fillRect(510, 1020, 60, 90); roundRect(440, 1100, 200, 24, 8); inked('#111', 4);
  // teclado RGB
  roundRect(300, 1060, 300, 50, 8); inked('#1E1E24', 4);
  for (let i = 0; i < 10; i++) { ctx.fillStyle = RGB[(i + Math.floor(t * 8)) % RGB.length]; ctx.fillRect(312 + i * 28, 1072, 20, 10); ctx.fillRect(312 + i * 28, 1088, 20, 10); }
  roundRect(680, 1070, 70, 40, 18); inked('#1E1E24', 4);
  if (o.live) {
    roundRect(270, 670, 150, 46, 10); ctx.fillStyle = '#E3352B'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `900 28px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('● EN VIVO', 282, 694);
    roundRect(270, 724, 160, 40, 10); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `800 24px ${FONT}`; ctx.fillText(`👁 ${o.viewers || '38.000'}`, 282, 745);
  }
}
/* el chico de espaldas jugando, en su silla */
function playerAtDesk(t, o = {}) {
  roundRect(400, 1180, 280, 420, 60); inked('#E3352B', 7); // silla gamer
  roundRect(430, 1230, 220, 120, 30); inked('#1E1E24', 5);
  const p = person(540, 1620, 1.25, Object.assign({}, KID, { arms: [2.0 + Math.sin(t * 18) * .05, 2.0 - Math.sin(t * 18) * .05], armLen: 130, eyes: o.eyes || 'open', mouth: o.mouth || 'flat', face: 1 }, o.look || {}));
  headset(p);
  return p;
}
function moneyRain(t, t0, n = 24) {
  const r = rng(5);
  for (let i = 0; i < n; i++) { const d = t - t0 - r() * .8; if (d < 0) continue; const x = r() * W, y = -100 + d * (500 + r() * 300); if (y < H) dollar(x + Math.sin(d * 3 + i) * 40, y, .8, d * 3 + i); }
}
function dollar(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  roundRect(-80, -40, 160, 80, 6); inked('#8FD08A', 5); ctx.strokeStyle = '#2E6A2E'; ctx.lineWidth = 3; ctx.strokeRect(-70, -30, 140, 60);
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fillStyle = 'rgba(46,106,46,0.3)'; ctx.fill();
  ctx.fillStyle = '#2E6A2E'; ctx.font = `900 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 2);
  ctx.restore();
}

/* 1 — un chico de 16 años ganó 3 millones */
function scene1(t) {
  gamerRoom(t, { alive: t > cap(0, 2) ? 1 : undefined });
  const win = t > cap(0, 2) - .2;
  const p = playerAtDesk(t, win ? { look: { arms: [2.6, 2.5], armLen: 140 }, eyes: 'happy', mouth: 'grin' } : {});
  if (win) {
    neonText('#1 VICTORIA', 540, 760, 70, '#FFD84A', {});
    moneyRain(t, cap(0, 2) - .1, 30);
    bigNumber('$3.000.000', 540, 420, 130, t, cap(0, 2), { color: '#9CFF9A' });
  } else bigNumber('16 AÑOS', 540, 420, 120, t, cap(0, 0) + .3, { color: '#FFD84A', tOut: cap(0, 2) - .3 });
  captions(CAPS[0], t);
}
/* 2 — Kyle Giersdorf, alias Bugha */
function scene2(t) {
  gamerRoom(t, {});
  const g = ctx.createRadialGradient(540, 1100, 50, 540, 1100, 700); g.addColorStop(0, 'rgba(255,216,74,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(10,8,20,0.45)'; ctx.fillRect(0, 0, W, H);
  const p = person(540, 1720, 1.55, Object.assign({}, KID, { arms: [2.4, -.2], armLen: 140, eyes: 'happy', mouth: 'smile', face: 1 }));
  headset(p);
  popIn(t, .3, k => { ctx.save(); ctx.translate(540, 500); ctx.scale(k, k); label('Kyle Giersdorf', 0, 0, { size: 52 }); ctx.restore(); });
  popIn(t, cap(1, 2) + .6, k => { ctx.save(); ctx.translate(540, 640); ctx.scale(k, k); ctx.rotate(-.05); label('"BUGHA"', 0, 0, { size: 84, bg: '#FFD84A' }); ctx.restore(); });
  captions(CAPS[1], t);
}
/* 3 — el primer Mundial, 40 millones */
function scene3(t) {
  ctx.fillStyle = '#121A3A'; ctx.fillRect(0, 0, W, H);
  // planeta con jugadores conectándose
  const cx = 540, cy = 860, R = 330;
  const og = ctx.createRadialGradient(cx - 100, cy - 120, 40, cx, cy, R); og.addColorStop(0, '#5FB8F0'); og.addColorStop(1, '#1C4FA0');
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); inked(og, 8);
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R - 4, 0, 7); ctx.clip();
  const sh = (t * 40) % (R * 2);
  ctx.fillStyle = '#5DBB4A';
  for (const [x, y, rx, ry] of [[-150, -120, 120, 80], [80, -60, 150, 100], [-60, 150, 100, 70], [200, 180, 90, 60]]) { ctx.beginPath(); ctx.ellipse(cx + ((x + sh + R) % (R * 2)) - R, cy + y, rx, ry, .3, 0, 7); ctx.fill(); }
  ctx.restore();
  const r = rng(9), n = Math.floor(prog(t, cap(2, 2), cap(2, 4) + .5) * 70);
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = R + 30 + r() * 180; ctx.fillStyle = RGB[i % 5]; ctx.shadowColor = RGB[i % 5]; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .9, 9, 0, 7); ctx.fill(); ctx.shadowBlur = 0; }
  // trofeo
  popIn(t, cap(2, 1), k => trophy(540, 330, .9 * k, t), cap(2, 3) - .3);
  if (t > cap(2, 3)) {
    const v = Math.floor(easeOut(prog(t, cap(2, 3), cap(2, 4) + .4)) * 40000000);
    ctx.save(); ctx.font = `900 120px ${MONO()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 18; const s = v.toLocaleString('es-ES'); ctx.strokeText(s, 540, 330); ctx.fillStyle = '#FFD84A'; ctx.fillText(s, 540, 330);
    ctx.font = `900 46px ${FONT}`; ctx.lineWidth = 10; ctx.strokeText('JUGADORES', 540, 420); ctx.fillStyle = '#fff'; ctx.fillText('JUGADORES', 540, 420);
    ctx.restore();
  }
  captions(CAPS[2], t);
}
function trophy(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-120, 0, 120, 0); g.addColorStop(0, '#B8862E'); g.addColorStop(.5, '#FFE68A'); g.addColorStop(1, '#B8862E');
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * 120, -40, 50, 0, 7); ctx.lineWidth = 22; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 12; ctx.strokeStyle = '#E2B33C'; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-130, -140); ctx.lineTo(130, -140); ctx.quadraticCurveTo(120, 60, 0, 90); ctx.quadraticCurveTo(-120, 60, -130, -140); inked(g, 7);
  roundRect(-30, 90, 60, 70, 6); inked('#E2B33C', 6); roundRect(-100, 160, 200, 50, 8); inked('#2B2D3A', 6);
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-60, -60, 16, 50, -.2, 0, 7); ctx.fill();
  ctx.fillStyle = '#B8862E'; ctx.font = `900 80px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('★', 0, -40);
  ctx.restore();
}
/* 4 — la final: 100 jugadores, estadio lleno */
function stadium(t) {
  ctx.fillStyle = '#0B0A1E'; ctx.fillRect(0, 0, W, H);
  // gradas con público (luces de móviles)
  const r = rng(21);
  for (let row = 0; row < 14; row++) { const y = 260 + row * 46, w = 1100 - row * 30; ctx.fillStyle = row % 2 ? '#1E1A3A' : '#24204A'; ctx.fillRect(540 - w / 2, y, w, 46);
    for (let i = 0; i < 26; i++) { const x = 540 - w / 2 + 20 + i * (w - 40) / 25; ctx.fillStyle = ['#3A3460', '#4A3A5A', '#2E3A5A'][(i + row) % 3]; ctx.beginPath(); ctx.arc(x, y + 22, 12, 0, 7); ctx.fill(); if (r() > .8) { ctx.fillStyle = `rgba(255,255,240,${.5 + .5 * Math.sin(t * 6 + i + row)})`; ctx.beginPath(); ctx.arc(x + 8, y + 10, 4, 0, 7); ctx.fill(); } } }
  // focos
  for (let i = 0; i < 4; i++) { const a = Math.sin(t * .8 + i) * .4; ctx.save(); ctx.translate(140 + i * 270, 0); ctx.rotate(a); const sg = ctx.createLinearGradient(0, 0, 0, 1400); sg.addColorStop(0, `${RGB[i]}88`); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.lineTo(200, 1400); ctx.lineTo(-200, 1400); ctx.closePath(); ctx.fill(); ctx.restore(); }
  // pantalla gigante
  roundRect(240, 120, 600, 340, 14); inked('#111', 8); gameScreen(256, 136, 568, 308, t, {});
  // escenario con filas de PCs
  ctx.fillStyle = '#1A1630'; ctx.fillRect(0, 1000, W, H - 1000);
  for (let row = 0; row < 4; row++) for (let i = 0; i < 9; i++) {
    const s = .5 + row * .15, x = 540 + (i - 4) * (110 + row * 20), y = 1060 + row * 150;
    roundRect(x - 40 * s, y - 60 * s, 80 * s, 54 * s, 4); ctx.fillStyle = RGB[(i + row) % 5]; ctx.shadowColor = RGB[(i + row) % 5]; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#111'; ctx.fillRect(x - 60 * s, y, 120 * s, 10 * s);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y + 40 * s, 22 * s, 0, 7); ctx.fill(); ctx.fillStyle = KID.coat; ctx.fillRect(x - 24 * s, y + 60 * s, 48 * s, 60 * s);
  }
}
function scene4(t) {
  stadium(t);
  bigNumber('100', 540, 620, 240, t, cap(3, 0) + .3, { sub: 'FINALISTAS', color: '#FFD84A', tOut: cap(3, 2) - .2 });
  popIn(t, cap(3, 2), k => { ctx.save(); ctx.translate(540, 620); ctx.scale(k, k); label('Nueva York 🗽', 0, 0, { size: 60, bg: '#FFF6DC' }); ctx.restore(); });
  if (t > cap(3, 4) - .2) sfxText('¡AAAAH!', 540, 860, t, cap(3, 4), { size: 110, color: '#FFFFFF', dur: 1.2 });
  captions(CAPS[3], t);
}
/* 5 — 59 contra 33 */
function scene5(t) {
  stadium(t); dim(t, 0, .55);
  const k1 = easeOut(prog(t, cap(4, 1) - .3, cap(4, 1) + 1.2)), k2 = easeOut(prog(t, cap(4, 2), cap(4, 3) + .8));
  const base = 1180, maxH = 640;
  // barras
  for (const [x, val, k, col, name] of [[340, 59, k1, '#FFD84A', 'BUGHA'], [740, 33, k2, '#9AA0B0', '2º LUGAR']]) {
    const h = maxH * (val / 59) * k;
    roundRect(x - 120, base - h, 240, h, 14); inked(col, 7);
    ctx.save(); ctx.font = `900 96px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 14;
    const v = String(Math.round(val * k)); ctx.strokeText(v, x, base - h - 70); ctx.fillStyle = '#fff'; ctx.fillText(v, x, base - h - 70);
    ctx.font = `900 40px ${FONT}`; ctx.lineWidth = 8; ctx.strokeText(name, x, base + 50); ctx.fillText(name, x, base + 50); ctx.restore();
  }
  if (k1 > .95) { trophy(340, base - maxH - 220, .45, t); for (let i = 0; i < 5; i++) sparkle(340 + Math.cos(t * 2 + i) * 170, base - maxH - 120 + Math.sin(t * 2 + i) * 80, .7, t); }
  captions(CAPS[4], t);
}
/* 6 — 3 millones con 16 años: el cheque gigante */
function scene6(t) {
  stadium(t);
  ctx.fillStyle = 'rgba(10,8,20,0.35)'; ctx.fillRect(0, 0, W, H);
  // confeti
  const r = rng(808);
  for (let i = 0; i < 80; i++) { const x0 = r() * W, sp = 200 + r() * 300, y = (r() * H + t * sp) % (H + 100) - 50; ctx.save(); ctx.translate(x0 + Math.sin(t * 2 + i) * 40, y); ctx.rotate(t * 4 + i); ctx.fillStyle = RGB[i % 5]; ctx.fillRect(-9, -5, 18, 10); ctx.restore(); }
  const p = person(540, 1760, 1.45, Object.assign({}, KID, { arms: [2.5, 2.5], armLen: 150, eyes: 'happy', mouth: 'grin', face: 1 }));
  headset(p);
  popIn(t, cap(5, 0), k => {
    ctx.save(); ctx.translate(540, 640); ctx.scale(k, k); ctx.rotate(-.04);
    roundRect(-440, -170, 880, 340, 18); inked('#F6F1E4', 8);
    ctx.fillStyle = '#2E6A2E'; ctx.fillRect(-440, -170, 880, 50);
    ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `800 34px ${FONT}`; ctx.fillText('PÁGUESE A: Kyle Giersdorf', -400, -60);
    ctx.font = `900 110px ${MONO()}`; ctx.textAlign = 'center'; ctx.fillStyle = '#2E6A2E'; ctx.fillText('$3,000,000', 0, 50);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-400, 130); ctx.lineTo(400, 130); ctx.stroke();
    ctx.restore();
  });
  bigNumber('16 AÑOS', 540, 330, 120, t, cap(5, 2), { color: '#FFD84A' });
  captions(CAPS[5], t);
}
/* 7 — la policía en pleno directo */
function scene7(t) {
  const cops = cap(6, 2);
  gamerRoom(t, { live: true, window: t > cops - .3, viewers: '38.000' });
  const scared = t > cops;
  const p = person(540, 1720, 1.4, Object.assign({}, KID, { arms: scared ? [2.6, 2.6] : [2.0, 2.0], armLen: 130, eyes: scared ? 'wide' : 'open', mouth: scared ? 'o' : 'flat', face: 1, tilt: scared ? Math.sin(t * 20) * .03 : 0 }));
  headset(p);
  if (t > cops) {
    const k = easeOut(prog(t, cops, cops + .6));
    person(lerp(1250, 900, k), 1720, 1.35, { coat: '#1E2D5A', hat: 'police', arms: [2.1, -.2], armLen: 140, eyes: 'open', mouth: 'o', brows: 'angry', face: -1 });
    sfxText('¡POLICÍA!', 760, 820, t, cops + .2, { size: 90, color: '#FFFFFF', dur: 1.4 });
  }
  stamp('LLAMADA FALSA', 540, 520, t, cap(6, 4), { size: 72 });
  captions(CAPS[6], t);
}
/* 8 — "bueno, eso es nuevo" + pregunta */
function chatBubble(x, y, text, col) {
  ctx.save(); ctx.font = `800 30px ${FONT}`; const w = ctx.measureText(text).width + 40;
  roundRect(x, y, w, 56, 16); inked(col, 4); ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 20, y + 29); ctx.restore();
}
function scene8(t) {
  gamerRoom(t, { live: true, viewers: '38.000' });
  const p = playerAtDesk(t, { eyes: 'happy', mouth: 'smile' });
  const msgs = ['jajaja 😂', '¿estás bien?', 'GG', 'qué locura', '¡leyenda!'];
  msgs.forEach((m, i) => { const t0 = .2 + i * .35; if (t > t0) { const k = easeOut(prog(t, t0, t0 + .3)); ctx.save(); ctx.globalAlpha = k; chatBubble(i % 2 ? 640 : 60, 300 + i * 70 - (1 - k) * 30, m, ['#FFD0E0', '#BFE3FF', '#D8F5C8', '#FFF0B0', '#E6D0FF'][i]); ctx.restore(); } });
  popIn(t, cap(7, 2), k => { ctx.save(); ctx.translate(540, 1000); ctx.scale(k, k); label('"Bueno, eso es nuevo"', 0, 0, { size: 50, bg: '#FFD84A' }); ctx.restore(); }, cap(7, 4) - .2);
  questionBox('¿Jugar videojuegos puede', 'ser un trabajo de verdad?', t, cap(7, 4), { size: 54 });
  captions(CAPS[7], t);
}
startVideo([scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8], 3.0);
