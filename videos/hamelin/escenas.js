/* El flautista de Hamelín era real — escenas */
const PIPER = { coat: '#C8322E', patch: ['#C8322E', '#F2C53A', '#3FAE5A', '#2F7BE0'], hat: 'jester', hatColor: '#3FAE5A' };
const KID_COLS = ['#2F7BE0', '#C8322E', '#3FAE5A', '#F2B92E', '#7A3FA0', '#E07A2F'];

function flute(p, t) { // flauta entre las dos manos, notas saliendo
  const [a, b] = p.hands;
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(a.x - 10, a.y - 10); ctx.lineTo(b.x + 40, b.y + 10); ctx.stroke();
  ctx.strokeStyle = '#C9A15E'; ctx.lineWidth = 9; ctx.stroke(); ctx.restore();
  for (let i = 0; i < 4; i++) {
    const k = (t * .6 + i / 4) % 1;
    ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI);
    musicNote(a.x + 40 + k * 220 + Math.sin(k * 8 + i) * 30, a.y - 60 - k * 260, .7, ['#FFD84A', '#FF7FB5', '#7FE0FF', '#9CFF9A'][i]);
    ctx.restore();
  }
}
function piper(x, gy, s, t, o = {}) {
  const p = person(x, gy, s, Object.assign({}, PIPER, { arms: [1.75, 1.45], armLen: 128, eyes: o.eyes || 'closed', mouth: 'puff', face: o.face || 1, walk: o.walk, bob: o.walk !== undefined }));
  flute(p, t);
  return p;
}
function weddingParade(x, gy, t, quiet) {
  // novios + músicos
  person(x, gy, 1.0, { coat: '#2B2B33', hat: 'hair', hatColor: '#4A2A18', arms: [.4, -.2], eyes: 'happy', mouth: 'smile', face: 1 });
  person(x + 130, gy, 1.0, { coat: '#F7F3EA', dress: true, hat: 'longhair', hatColor: '#C9A15E', arms: [-.4, .2], eyes: 'happy', mouth: 'smile', face: 1 });
  const m1 = person(x - 210, gy, .95, { coat: '#6A3E24', hat: 'beret', arms: quiet ? [.1, -.1] : [1.4, 1.2], armLen: 120, eyes: quiet ? 'open' : 'closed', mouth: quiet ? 'flat' : 'puff', face: 1 });
  const d = person(x - 380, gy, .95, { coat: '#2E4A6A', hat: 'beret', hatColor: '#2B2B33', arms: quiet ? [.1, -.1] : [1.2 + Math.sin(t * 12) * .3, 1.0 - Math.sin(t * 12) * .3], armLen: 110, eyes: 'open', mouth: quiet ? 'flat' : 'smile', face: 1 });
  // tambor
  ctx.save(); ctx.translate(x - 380, gy - 300);
  roundRect(-60, -10, 120, 90, 16); inked('#C8322E', 5); ctx.strokeStyle = '#F2C53A'; ctx.lineWidth = 4;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-60 + i * 30, -10); ctx.lineTo(-45 + i * 30, 80); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -10, 60, 16, 0, 0, 7); inked('#F3EAD2', 4); ctx.restore();
  if (!quiet) for (let i = 0; i < 3; i++) { const k = (t * .7 + i / 3) % 1; ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI); musicNote(x - 300 + k * 160, gy - 520 - k * 200, .6, '#FFD84A'); ctx.restore(); }
}

/* 1 — la calle donde no se puede tocar música */
function scene1(t) {
  medievalTown(t, 120, {});
  const quiet = t > cap(0, 5) - .2;
  weddingParade(560, 1720, t, quiet);
  noSign(540, 640, 170, t, cap(0, 2), () => { musicNote(-20, 0, 2.2, '#FFFFFF'); }, cap(0, 3) - .3);
  if (quiet) sfxText('shhh…', 300, 980, t, cap(0, 5), { size: 90, color: '#FFFFFF', dur: 1.8 });
  captions(CAPS[0], t);
}
/* 2 — el letrero de la calle */
function streetSign(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(-380, -90, 760, 180, 12); inked('#F4F1E6', 8);
  roundRect(-360, -70, 720, 140, 6); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = INK; ctx.font = `900 64px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Bungelosenstraße', 0, 4);
  ctx.restore();
}
function scene2(t) {
  medievalTown(t, 480, {});
  dim(t, 0, .35);
  popIn(t, .2, k => streetSign(540, 620, k));
  popIn(t, cap(1, 1), k => { ctx.save(); ctx.translate(540, 820); ctx.scale(k, k); label('= "calle sin tambores"', 0, 0, { size: 48, bg: '#FFD84A' }); ctx.restore(); }, cap(1, 2) + 1.2);
  noSign(540, 1050, 120, t, cap(1, 1) + .3, () => { roundRect(-60, -30, 120, 80, 14); inked('#C8322E', 5); ctx.beginPath(); ctx.ellipse(0, -30, 60, 16, 0, 0, 7); inked('#F3EAD2', 4); }, cap(1, 2) + 1.2);
  bigNumber('+700', 540, 960, 220, t, cap(1, 4), { sub: 'AÑOS', color: '#FFD84A' });
  captions(CAPS[1], t);
}
/* 3 — 1284: llega el flautista */
function scene3(t) {
  medievalTown(t, 0, {});
  parchment([['26 de junio', 54, FONT], ['1284', 120, FONT]], 540, 520, 520, 320, t, cap(2, 0) + .1, { lh: 110, write: 1.4, tOut: cap(2, 2) - .2 });
  const k = easeOut(prog(t, cap(2, 2) - .2, cap(2, 4)));
  piper(lerp(-150, 520, k), 1720, 1.25, t, { walk: k < 1 ? t * 7 : undefined, eyes: 'happy' });
  // vecinos mirando
  person(880, 1700, .95, { coat: '#6A3E24', hat: 'beret', arms: [.2, -.2], eyes: 'wide', mouth: 'o', face: -1 });
  child(760, 1700, 1.2, { coat: KID_COLS[2], hat: 'hair', hatColor: '#6A3E24', arms: [.3, -.3], eyes: 'wide', mouth: 'o', face: -1 });
  if (t > cap(2, 4)) popIn(t, cap(2, 4), kk => { ctx.save(); ctx.translate(520, 700); ctx.scale(kk, kk); label('mil colores', 0, 0, { bg: '#FF7FB5', size: 46 }); ctx.restore(); });
  captions(CAPS[2], t);
}
/* 4 — los niños lo siguen y desaparecen */
function scene4(t) {
  medievalTown(t, 900, { dusk: true });
  // puerta de la muralla al fondo derecha
  const go = prog(t, 0, DURS[3]);
  const px = lerp(420, 1100, go);
  piper(px, 1720, 1.1, t, { walk: t * 7, eyes: 'closed' });
  const n = 9;
  for (let i = 0; i < n; i++) {
    const x = px - 170 - i * 110 + Math.sin(t * 3 + i) * 6;
    if (x < -100) continue;
    child(x, 1720 + (i % 2) * 18, 1.25, { coat: KID_COLS[i % 6], hat: i % 3 === 1 ? 'longhair' : 'hair', hatColor: ['#6A3E24', '#C9A15E', '#2B1B10'][i % 3], walk: t * 8 + i, bob: true, arms: [Math.sin(t * 8 + i) * .4, -Math.sin(t * 8 + i) * .4], eyes: 'happy', mouth: 'smile' });
  }
  bigNumber('130', 540, 620, 230, t, cap(3, 1), { sub: 'NIÑOS', color: '#FFD84A', tOut: cap(3, 3) - .3 });
  if (t > cap(3, 3) - .2) { // fundido a vacío
    const k = prog(t, cap(3, 3) - .2, cap(3, 3) + .6);
    medievalTown(t, 900, { dusk: true });
    ctx.fillStyle = `rgba(10,8,25,${.35 + .2 * k})`; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 3; i++) { const kk = (t * .8 + i / 3) % 1; ctx.save(); ctx.globalAlpha = Math.sin(kk * Math.PI) * k; ctx.font = `900 ${90 + i * 16}px ${FONT}`; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.strokeText('?', 420 + i * 120, 900 - kk * 140); ctx.fillStyle = '#FFD84A'; ctx.fillText('?', 420 + i * 120, 900 - kk * 140); ctx.restore(); }
  }
  captions(CAPS[3], t);
}
/* 5 — el vitral y el registro */
function stainedGlass(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const glow = ctx.createRadialGradient(0, 0, 50, 0, 0, 600); glow.addColorStop(0, 'rgba(255,230,160,0.35)'); glow.addColorStop(1, 'rgba(255,230,160,0)');
  ctx.fillStyle = glow; ctx.fillRect(-600, -700, 1200, 1400);
  ctx.beginPath(); ctx.moveTo(-260, 420); ctx.lineTo(-260, -200); ctx.arc(0, -200, 260, Math.PI, 0); ctx.lineTo(260, 420); ctx.closePath();
  ctx.save(); ctx.clip();
  const cols = ['#2F5DB0', '#C8322E', '#E2B33C', '#3FAE5A', '#7A3FA0', '#5FB8E8'];
  const r = rng(12);
  for (let yy = -480; yy < 440; yy += 70) for (let xx = -280; xx < 280; xx += 70) { ctx.fillStyle = cols[Math.floor(r() * 6)]; ctx.globalAlpha = .75 + .25 * Math.sin(t * 2 + xx + yy); ctx.fillRect(xx, yy, 70, 70); }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#141414'; ctx.lineWidth = 8;
  for (let yy = -480; yy < 440; yy += 70) { ctx.beginPath(); ctx.moveTo(-280, yy); ctx.lineTo(280, yy); ctx.stroke(); }
  for (let xx = -280; xx < 280; xx += 70) { ctx.beginPath(); ctx.moveTo(xx, -480); ctx.lineTo(xx, 440); ctx.stroke(); }
  ctx.restore();
  // figuras: flautista y niños en el vitral
  person(-120, 260, .9, Object.assign({}, PIPER, { arms: [1.75, 1.45], armLen: 128, eyes: 'closed', mouth: 'puff' }));
  for (let i = 0; i < 3; i++) child(40 + i * 80, 260, 1.1, { coat: KID_COLS[i], hat: 'hair', hatColor: '#6A3E24', arms: [.3, -.3], eyes: 'happy', mouth: 'smile', face: -1 });
  ctx.beginPath(); ctx.moveTo(-260, 420); ctx.lineTo(-260, -200); ctx.arc(0, -200, 260, Math.PI, 0); ctx.lineTo(260, 420); ctx.closePath();
  ctx.lineWidth = 20; ctx.strokeStyle = '#8A8070'; ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
function scene5(t) {
  // interior de piedra de la iglesia
  ctx.fillStyle = '#3A3444'; ctx.fillRect(0, 0, W, H);
  const r = rng(7);
  for (let yy = 0; yy < H; yy += 70) for (let xx = (yy / 70 % 2) * 60; xx < W; xx += 120) { ctx.fillStyle = `rgba(255,255,255,${.03 + r() * .05})`; ctx.fillRect(xx, yy, 116, 66); ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; ctx.strokeRect(xx, yy, 116, 66); }
  stainedGlass(540, 700, 1.0, t);
  stamp('~1300', 820, 330, t, cap(4, 3) + .2, { size: 60, color: '#B3261E', tOut: cap(4, 5) - .3 });
  const pk = prog(t, cap(4, 5) - .2, cap(4, 5) + .1);
  if (pk > 0) {
    dim(t, cap(4, 5), .7);
    parchment([['Registro de 1384:', 44, FONT], ['"Hace 100 años', 58, FONT], ['que se fueron', 58, FONT], ['nuestros niños"', 58, FONT]], 540, 720, 820, 520, t, cap(4, 5), { lh: 90, write: 2.4, italic: true });
  }
  captions(CAPS[4], t);
}
/* 6 — las ratas se añadieron después */
function rat(x, y, s, t, ph) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const b = Math.sin(t * 20 + ph) * 3;
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-60, 10); ctx.quadraticCurveTo(-110, 0 + b * 3, -140, 30); ctx.stroke();
  ctx.strokeStyle = '#E8A0A0'; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0 + b, 70, 40, 0, 0, 7); inked('#7A7480', 5);
  ctx.beginPath(); ctx.moveTo(50, -20 + b); ctx.lineTo(100, 8 + b); ctx.lineTo(50, 28 + b); ctx.closePath(); inked('#7A7480', 5);
  ctx.beginPath(); ctx.arc(40, -30 + b, 16, 0, 7); inked('#E8A0A0', 4);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(70, -2 + b, 5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(100, 8 + b, 6, 0, 7); ctx.fill();
  for (const lx of [-30, 30]) { ctx.beginPath(); ctx.moveTo(lx, 34 + b); ctx.lineTo(lx + Math.sin(t * 20 + ph + lx) * 10, 50); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.restore();
}
function scene6(t) {
  medievalTown(t, 300, {});
  for (let i = 0; i < 9; i++) {
    const x = ((t * 380 + i * 170) % 1500) - 200, y = 1700 + (i % 3) * 60;
    rat(x, y, .9, t, i);
  }
  piper(300, 1640, 1.1, t, { eyes: 'closed' });
  stamp('SIGLO XVI', 640, 640, t, cap(5, 2), { size: 90, color: '#2F5DB0', tOut: cap(5, 3) - .3 });
  if (t > cap(5, 3) - .2) {
    dim(t, cap(5, 3), .55);
    noSign(540, 820, 230, t, cap(5, 4), () => { rat(-10, 20, 1.6, t, 0); });
    parchment([['1284', 80, FONT], ['sin ratas', 54, FONT]], 540, 1180, 420, 220, t, cap(5, 3) + .1, { lh: 86, write: .8, tOut: cap(5, 4) - .2 });
  }
  captions(CAPS[5], t);
}
/* 7 — teorías: mapa antiguo con la ruta al este */
function compass(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t) * .05);
  ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); inked('#F1E2BC', 5);
  for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(16, 0); ctx.lineTo(-16, 0); ctx.closePath(); inked(i % 2 ? '#8A2B2B' : '#3A2410', 3); }
  ctx.restore();
  ctx.save(); ctx.fillStyle = '#3A2410'; ctx.font = `900 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('N', x, y - 120 * s); ctx.fillText('E', x + 120 * s, y); ctx.fillText('O', x - 120 * s, y); ctx.fillText('S', x, y + 120 * s); ctx.restore();
}
function townIcon(x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const [dx, h] of [[-40, 60], [0, 90], [40, 70]]) { ctx.fillStyle = col; ctx.fillRect(dx - 18, -h, 36, h); ctx.lineWidth = 4; ctx.strokeStyle = '#3A2410'; ctx.strokeRect(dx - 18, -h, 36, h); ctx.beginPath(); ctx.moveTo(dx - 24, -h); ctx.lineTo(dx, -h - 30); ctx.lineTo(dx + 24, -h); ctx.closePath(); ctx.fillStyle = '#8A2B2B'; ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
function scene7(t) {
  // papel de mapa antiguo
  const g = ctx.createRadialGradient(540, 800, 100, 540, 800, 1100); g.addColorStop(0, '#F3E3BC'); g.addColorStop(1, '#B98E55');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = rng(31);
  ctx.strokeStyle = 'rgba(90,60,30,0.35)'; ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) { ctx.beginPath(); const y0 = 250 + i * 110; ctx.moveTo(0, y0); for (let x = 0; x <= W; x += 60) ctx.lineTo(x, y0 + Math.sin(x / 120 + i) * 18); ctx.stroke(); }
  // montañas y bosques dibujados
  for (let i = 0; i < 14; i++) { const x = 80 + r() * 900, y = 300 + r() * 800; ctx.beginPath(); ctx.moveTo(x - 30, y); ctx.lineTo(x, y - 46); ctx.lineTo(x + 30, y); ctx.closePath(); ctx.fillStyle = 'rgba(90,60,30,0.25)'; ctx.fill(); ctx.strokeStyle = 'rgba(60,40,20,0.6)'; ctx.stroke(); }
  compass(880, 420, 1, t);
  const hx = 200, hy = 820;
  townIcon(hx, hy, 1.2, '#E9D2B0');
  label('Hamelín', hx, hy + 70, { size: 38 });
  // ruta hacia el este
  const ex = 820, ey = 760;
  const ak = easeInOut(prog(t, cap(6, 1), cap(6, 3) + .5));
  if (ak > 0) {
    ctx.save(); ctx.strokeStyle = '#8A2B2B'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.setLineDash([26, 20]);
    ctx.beginPath(); const n = 40;
    for (let i = 0; i <= n * ak; i++) { const u = i / n; const x = lerp(hx + 60, ex - 60, u), y = lerp(hy - 30, ey - 30, u) - Math.sin(u * Math.PI) * 220; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    const u = ak, cx = lerp(hx + 60, ex - 60, u), cy = lerp(hy - 30, ey - 30, u) - Math.sin(u * Math.PI) * 220;
    for (let i = 0; i < 4; i++) child(cx - 40 + i * 28, cy + 30, .45, { coat: KID_COLS[i], hat: 'hair', hatColor: '#6A3E24', arms: [.3, -.3], eyes: 'happy', mouth: 'smile' });
  }
  if (t > cap(6, 3)) { popIn(t, cap(6, 3), k => { townIcon(ex, ey, 1.2 * k, '#F5E9D6'); }); popIn(t, cap(6, 3) + .2, k => { ctx.save(); ctx.translate(ex, ey + 70); ctx.scale(k, k); label('Este de Europa', 0, 0, { size: 38, bg: '#FFD84A' }); ctx.restore(); }); }
  // enfermedad
  if (t > cap(6, 4) - .2) {
    dim(t, cap(6, 4), .6);
    popIn(t, cap(6, 4), k => {
      ctx.save(); ctx.translate(540, 760); ctx.scale(k, k);
      ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); inked('#7FBF5A', 8);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 150, Math.sin(a) * 150); ctx.lineTo(Math.cos(a) * 200, Math.sin(a) * 200); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.arc(Math.cos(a) * 205, Math.sin(a) * 205, 18, 0, 7); inked('#B5E08A', 5); }
      face({ eyes: 'open', mouth: 'grin', brows: 'angry' }, 150, 1);
      ctx.restore();
    });
  }
  if (t > cap(6, 5)) { ctx.fillStyle = `rgba(0,0,0,${.5 * prog(t, cap(6, 5), cap(6, 5) + .8)})`; ctx.fillRect(0, 0, W, H); }
  captions(CAPS[6], t);
}
/* 8 — final */
function scene8(t) {
  medievalTown(t, 120, { dusk: true });
  weddingParade(560, 1720, t, true);
  questionBox('¿Qué crees que les', 'pasó a esos niños?', t, cap(7, 3), { size: 60 });
  captions(CAPS[7], t);
}
startVideo([scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8]);
