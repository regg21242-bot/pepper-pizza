/* La ficha de la Tienda Pirata — escenas (arte original, sin assets del juego) */
const RGB = ['#FF3B6B', '#FFB23F', '#5BFF8A', '#3BD1FF', '#B26BFF'];
const SQUAD = [
  { coat: '#2F7BE0', hat: 'hair', hatColor: '#5A3A22' },
  { coat: '#E3352B', hat: 'longhair', hatColor: '#1C1C22', dress: true },
  { coat: '#3FAE5A', hat: 'beret', hatColor: '#2B2B33' },
  { coat: '#B26BFF', hat: 'bun', hatColor: '#F2B92E' },
];

/* mar e isla pirata */
function sea(t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, 1100);
  const c = o.night ? ['#0B1030', '#2A2552'] : ['#5FB8F0', '#BDE6FA'];
  g.addColorStop(0, c[0]); g.addColorStop(1, c[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (!o.night) { ctx.beginPath(); ctx.arc(820, 260, 80, 0, 7); inked('#FFE68A', 5); }
  else moon(820, 260, 70);
  const sg = ctx.createLinearGradient(0, 1000, 0, H); sg.addColorStop(0, '#2A8AD0'); sg.addColorStop(1, '#0E3A70');
  ctx.fillStyle = sg; ctx.fillRect(0, 1000, W, H - 1000);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 5;
  for (let i = 0; i < 10; i++) { const y = 1040 + i * 90, off = (t * 40 + i * 70) % 160; ctx.beginPath(); for (let x = -160 + off; x < W + 160; x += 160) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 40, y - 14, x + 80, y); } ctx.stroke(); }
}
function island(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 420, 120, 0, 0, 7); inked('#F2D38A', 7);
  ctx.beginPath(); ctx.ellipse(0, -30, 300, 80, 0, Math.PI, 0); inked('#5DBB4A', 6);
  // palmera
  ctx.strokeStyle = '#8A5A2A'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-140, -40); ctx.quadraticCurveTo(-170, -200, -110, -340); ctx.stroke();
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .6 + Math.sin(t * 2 + i) * .05; ctx.save(); ctx.translate(-110, -340); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(90, 0, 100, 26, 0, 0, 7); inked('#3FAE5A', 5); ctx.restore(); }
  // bandera pirata
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(160, -60); ctx.lineTo(160, -330); ctx.stroke();
  ctx.save(); ctx.translate(160, -330); ctx.beginPath(); ctx.moveTo(0, 0); for (let i = 0; i <= 8; i++) ctx.lineTo(i * 18, Math.sin(t * 6 + i) * 6); ctx.lineTo(144, 90); for (let i = 8; i >= 0; i--) ctx.lineTo(i * 18, 90 + Math.sin(t * 6 + i) * 6); ctx.closePath(); inked('#1E1E24', 5);
  skull(72, 45, .5); ctx.restore();
  ctx.restore();
}
function skull(x, y, s, col = '#F3F3F3') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-60, -10); ctx.lineTo(60, 70); ctx.moveTo(60, -10); ctx.lineTo(-60, 70); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -10, 44, 0, 7); ctx.fill(); ctx.fillRect(-26, 20, 52, 30);
  ctx.fillStyle = '#1E1E24'; ctx.beginPath(); ctx.arc(-16, -12, 11, 0, 7); ctx.arc(16, -12, 11, 0, 7); ctx.fill();
  ctx.restore();
}
/* ficha pirata dorada */
function token(x, y, s, t, glow = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (glow) { const g = ctx.createRadialGradient(0, 0, 40, 0, 0, 340); g.addColorStop(0, `rgba(255,220,110,${.7 * glow})`); g.addColorStop(1, 'rgba(255,220,110,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 340, 0, 7); ctx.fill();
    ctx.save(); ctx.rotate(t * .8); for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillStyle = `rgba(255,236,160,${.25 * glow})`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, -380); ctx.lineTo(30, -380); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  const sx = Math.cos(t * 2.5) * .25 + .75; ctx.scale(sx, 1);
  ctx.beginPath(); ctx.arc(0, 0, 160, 0, 7);
  const gg = ctx.createRadialGradient(-50, -60, 20, 0, 0, 170); gg.addColorStop(0, '#FFF6C0'); gg.addColorStop(.5, '#F2C53A'); gg.addColorStop(1, '#A8761A'); inked(gg, 8);
  ctx.beginPath(); ctx.arc(0, 0, 124, 0, 7); ctx.lineWidth = 8; ctx.strokeStyle = '#A8761A'; ctx.stroke();
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 132, Math.sin(a) * 132); ctx.lineTo(Math.cos(a) * 150, Math.sin(a) * 150); ctx.lineWidth = 5; ctx.stroke(); }
  skull(0, -6, .9, '#7A5410');
  ctx.restore();
}
/* cofre que brilla, tiembla y explota */
function chest(x, y, s, t, o = {}) {
  const shake = o.shake ? Math.sin(t * 60) * 8 * o.shake : 0;
  ctx.save(); ctx.translate(x + shake, y); ctx.scale(s, s);
  if (o.glow) { const g = ctx.createRadialGradient(0, -40, 20, 0, -40, 380); g.addColorStop(0, `rgba(255,220,110,${o.glow})`); g.addColorStop(1, 'rgba(255,220,110,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -40, 380, 0, 7); ctx.fill(); }
  roundRect(-170, -40, 340, 180, 14); inked('#8A5A2A', 7);
  ctx.strokeStyle = '#5A3A1A'; ctx.lineWidth = 4; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-170, -40 + i * 45); ctx.lineTo(170, -40 + i * 45); ctx.stroke(); }
  const open = o.open || 0;
  ctx.save(); ctx.translate(0, -40); ctx.rotate(-open * 1.1);
  ctx.beginPath(); ctx.moveTo(-170, 0); ctx.lineTo(-170, -60); ctx.quadraticCurveTo(0, -150, 170, -60); ctx.lineTo(170, 0); ctx.closePath(); inked('#A86E34', 7);
  ctx.restore();
  for (const bx of [-120, 120]) { ctx.fillStyle = '#E2B33C'; ctx.fillRect(bx - 14, -100, 28, 240); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(bx - 14, -100, 28, 240); }
  roundRect(-30, -50, 60, 70, 8); inked('#E2B33C', 5); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, -20, 9, 0, 7); ctx.fill(); ctx.fillRect(-4, -18, 8, 22);
  ctx.restore();
}
/* tienda pirata con atuendos originales colgados */
function outfit(x, y, s, col, col2, t, i) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2 + i) * 4); ctx.scale(s, s);
  ctx.strokeStyle = '#8A8A90'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(0, -120); ctx.moveTo(-60, -100); ctx.lineTo(0, -125); ctx.lineTo(60, -100); ctx.stroke();
  roundRect(-60, -100, 120, 190, 30); inked(col, 6);
  ctx.fillStyle = col2; ctx.fillRect(-60, -20, 120, 26); ctx.beginPath(); ctx.arc(0, -40, 18, 0, 7); ctx.fill();
  ctx.restore();
}
function pirateShop(t, o = {}) {
  ctx.fillStyle = '#2A1A10'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 4; for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // letrero
  roundRect(180, 120, 720, 170, 20); inked('#6A3E24', 8);
  neonText('TIENDA PIRATA', 540, 205, 76, '#FFD84A', {});
  skull(120, 205, .55); skull(960, 205, .55);
  // estanterías con atuendos, armas de juguete y bailes
  const cols = [['#2F7BE0', '#F2C53A'], ['#E3352B', '#1E1E24'], ['#3FAE5A', '#FFFFFF'], ['#B26BFF', '#5BFF8A'], ['#FF7FB5', '#2F7BE0'], ['#F2B92E', '#E3352B']];
  cols.forEach(([a, b], i) => {
    const x = 180 + (i % 3) * 360, y = 520 + Math.floor(i / 3) * 360;
    roundRect(x - 140, y - 190, 280, 320, 20); inked('#3A2418', 5);
    outfit(x, y, 1, a, b, t, i);
    const free = o.free && t > o.free + i * .12;
    roundRect(x - 100, y + 100, 200, 54, 14); inked(free ? '#5BFF8A' : '#1E1E24', 4);
    ctx.fillStyle = free ? INK : '#FFFFFF'; ctx.font = `900 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(free ? 'GRATIS' : `${[1500, 2000, 1200, 800, 1800, 950][i]} pavos`, x, y + 128);
  });
  ctx.fillStyle = '#4A2E1A'; ctx.fillRect(0, 1260, W, H - 1260); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 1260); ctx.lineTo(W, 1260); ctx.stroke();
}
function robot(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(-60, -200, 120, 160, 16); inked('#9AA0B0', 6);
  roundRect(-70, -330, 140, 110, 20); inked('#C9CED8', 6);
  ctx.fillStyle = '#E3352B'; ctx.beginPath(); ctx.arc(-28, -278, 14, 0, 7); ctx.arc(28, -278, 14, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -330); ctx.lineTo(0, -370); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -378, 10, 0, 7); inked('#5BFF8A', 4);
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 60, -170); ctx.lineTo(sd * 100, -100 + Math.sin(t * 6) * 10); ctx.lineWidth = 10; ctx.stroke(); ctx.beginPath(); ctx.moveTo(sd * 30, -40); ctx.lineTo(sd * 30, 0); ctx.stroke(); }
  ctx.restore();
}
function phoneVideo(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-.05);
  roundRect(-160, -300, 320, 600, 40); inked('#1E1E24', 8);
  roundRect(-140, -270, 280, 540, 20); inked('#2A2448', 4);
  ctx.fillStyle = '#FFD84A'; ctx.font = `900 40px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('¡TRUCO', 0, -180); ctx.fillText('100% REAL!', 0, -130);
  token(0, 20, .45, t, 0);
  ctx.fillStyle = '#E3352B'; ctx.beginPath(); ctx.moveTo(-30, 150); ctx.lineTo(40, 190); ctx.lineTo(-30, 230); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* 1 — un cofre que da toda la tienda gratis */
function scene1(t) {
  sea(t, { night: true });
  island(540, 1180, 1.1, t);
  const g = .6 + .4 * Math.sin(t * 6);
  chest(560, 1100, 1.15, t, { glow: g, shake: t > 1.5 ? .6 : 0 });
  bigNumber('¡GRATIS!', 540, 450, 150, t, cap(0, 5), { color: '#5BFF8A' });
  popIn(t, cap(0, 3), k => { ctx.save(); ctx.translate(540, 640); ctx.scale(k, k); label('TODA LA TIENDA', 0, 0, { size: 56, bg: '#FFD84A' }); ctx.restore(); });
  captions(CAPS[0], t);
}
/* 2 — la ficha y la temporada Cazatesoros */
function scene2(t) {
  sea(t, { night: true });
  dim(t, 0, .45);
  popIn(t, .2, k => token(540, 760, 1.2 * k, t, 1));
  popIn(t, cap(1, 1), k => { ctx.save(); ctx.translate(540, 360); ctx.scale(k, k); label('Acceso a la Tienda Pirata', 0, 0, { size: 48, bg: '#FFD84A' }); ctx.restore(); });
  popIn(t, cap(1, 3), k => { ctx.save(); ctx.translate(540, 1130); ctx.scale(k, k); label('Temporada Cazatesoros', 0, 0, { size: 44, bg: '#FFF6DC' }); ctx.restore(); });
  captions(CAPS[1], t);
}
/* 3 — todo gratis 14 días y te lo quedas */
function scene3(t) {
  pirateShop(t, { free: cap(2, 1) });
  bigNumber('14 DÍAS', 540, 380, 130, t, cap(2, 4), { color: '#FFD84A', tOut: cap(2, 5) - .3 });
  if (t > cap(2, 5)) {
    dim(t, cap(2, 5), .55);
    const p = person(540, 1720, 1.4, Object.assign({}, SQUAD[0], { arms: [2.5, 2.5], armLen: 140, eyes: 'happy', mouth: 'grin', face: 1 }));
    popIn(t, cap(2, 5) + .2, k => { ctx.save(); ctx.translate(540, 560); ctx.scale(k, k); roundRect(-260, -160, 520, 320, 30); inked('#3A2418', 7); outfit(-120, 40, .8, '#2F7BE0', '#F2C53A', t, 0); outfit(0, 40, .8, '#E3352B', '#1E1E24', t, 1); outfit(120, 40, .8, '#B26BFF', '#5BFF8A', t, 2); ctx.restore(); });
    stamp('PARA SIEMPRE', 540, 860, t, cap(2, 6) + .3, { size: 76, color: '#1F9D55' });
  }
  captions(CAPS[2], t);
}
/* 4 — en cofres normales: brilla, tiembla, explota */
function scene4(t) {
  sea(t, {});
  island(540, 1240, 1.1, t);
  const b = cap(3, 3), sh = cap(3, 4), ex = cap(3, 5);
  const glow = t > b ? .5 + .5 * Math.sin(t * 10) : 0;
  const shake = t > sh ? 1 : 0;
  const open = easeOut(prog(t, ex, ex + .3));
  chest(560, 1160, 1.2, t, { glow, shake: open > 0 ? 0 : shake, open });
  if (t < b) popIn(t, cap(3, 1), k => { ctx.save(); ctx.translate(540, 560); ctx.scale(k, k); label('cofre normal', 0, 0, { size: 50 }); ctx.restore(); });
  if (open > 0) {
    if (t < ex + .2) { ctx.fillStyle = `rgba(255,255,230,${1 - prog(t, ex, ex + .2)})`; ctx.fillRect(0, 0, W, H); }
    const k = easeBack(prog(t, ex + .05, ex + .5));
    token(560, lerp(1080, 620, k), 1.0 * k, t, 1);
  }
  if (t > b) sfxText('✨', 330, 900, t, b, { size: 90, dur: .9 });
  if (t > sh) sfxText('¡brrr!', 800, 900, t, sh, { size: 70, color: '#FFFFFF', dur: .8 });
  captions(CAPS[3], t);
}
/* 5 — la recibe todo el escuadrón */
function scene5(t) {
  sea(t, {});
  island(540, 1280, 1.15, t);
  const share = cap(4, 3);
  const xs = [190, 420, 660, 890];
  const ps = xs.map((x, i) => person(x, 1720, 1.05, Object.assign({}, SQUAD[i], { arms: t > share ? [2.5, 2.5] : (i === 1 && t > cap(4, 1) ? [2.3, -.2] : [.2, -.2]), armLen: 130, eyes: t > share ? 'happy' : 'open', mouth: t > share ? 'grin' : 'flat', face: i < 2 ? 1 : -1 })));
  if (t > cap(4, 1)) token(420, 920, .45, t, t > share ? .4 : .8);
  if (t > share) {
    const k = easeOut(prog(t, share, share + .8));
    xs.forEach((x, i) => { if (i === 1) return; const tx = lerp(420, x, k), ty = lerp(920, 920 - Math.sin(k * Math.PI) * 120, k); token(tx, ty, .38, t, .5); });
  }
  if (t > cap(4, 4)) { noSign(540, 480, 140, t, cap(4, 4), () => { person(0, 110, .45, Object.assign({}, SQUAD[0], { arms: [.2, -.2], eyes: 'sleepy', mouth: 'frown' })); }); popIn(t, cap(4, 4) + .2, k => { ctx.save(); ctx.translate(540, 680); ctx.scale(k, k); label('¡NO JUEGUES SOLO!', 0, 0, { size: 50, bg: '#FFD84A' }); ctx.restore(); }); }
  captions(CAPS[4], t);
}
/* 6 — no sale con bots; rarísima */
function scene6(t) {
  sea(t, { night: true });
  noSign(540, 700, 250, t, cap(5, 1), () => robot(0, 160, .9, t), cap(5, 3) - .3);
  if (t > cap(5, 3) - .1) {
    for (let i = 0; i < 3; i++) { const kk = (t * .8 + i / 3) % 1; ctx.save(); ctx.globalAlpha = Math.sin(kk * Math.PI); ctx.font = `900 ${100 + i * 16}px ${FONT}`; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.strokeText('?', 380 + i * 140, 800 - kk * 140); ctx.fillStyle = '#FFD84A'; ctx.fillText('?', 380 + i * 140, 800 - kk * 140); ctx.restore(); }
    popIn(t, cap(5, 3), k => { ctx.save(); ctx.translate(540, 460); ctx.scale(k, k); label('Probabilidad: ???', 0, 0, { size: 52 }); ctx.restore(); });
  }
  stamp('RARÍSIMA', 540, 1050, t, cap(5, 5), { size: 110, color: '#B26BFF' });
  captions(CAPS[5], t);
}
/* 7 — hasta el 15 de diciembre; ojo con los trucos falsos */
function calendar(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(-200, -220, 400, 440, 24); inked('#FFFFFF', 8);
  ctx.fillStyle = '#E3352B'; roundRect(-200, -220, 400, 110, 24); ctx.fill(); ctx.fillRect(-200, -140, 400, 30);
  ctx.fillStyle = '#fff'; ctx.font = `900 56px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DICIEMBRE', 0, -160);
  ctx.fillStyle = INK; ctx.font = `900 200px ${FONT}`; ctx.fillText('15', 0, 50);
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * 110, -220, 18, 0, 7); inked('#9AA0B0', 5); }
  ctx.restore();
}
function scene7(t) {
  sea(t, { night: true }); dim(t, 0, .35);
  if (t < cap(6, 2) - .2) popIn(t, .2, k => calendar(540, 740, 1.2 * k));
  else {
    popIn(t, cap(6, 2) - .1, k => phoneVideo(540, 760, 1.15 * k, t));
    stamp('FALSO', 540, 760, t, cap(6, 4), { size: 130 });
  }
  captions(CAPS[6], t);
}
/* 8 — pregunta */
function scene8(t) {
  pirateShop(t, { free: 0 });
  dim(t, 0, .25);
  token(860, 1080, .5, t, .6);
  questionBox('¿Ya la encontraste?', '¿Qué te llevarías?', t, cap(7, 0) + .2);
  captions(CAPS[7], t);
}
startVideo([scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8], 3.2);
