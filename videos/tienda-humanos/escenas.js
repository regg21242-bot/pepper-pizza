/* ¿Qué pasaría si abrieras una tienda de personas? — vídeo educativo sobre la trata, estilo cine oscuro */
const RED = '#FF4A4A';
function bg(t, o = {}) { stage(t, Object.assign({ light: 'rgba(80,70,110,0.45)', mid: 'rgba(25,22,40,0.35)', ly: 900, lr: 900, bokeh: 'rgba(200,180,255,0.05)' }, o)); }
function vignette() { const v = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
function storefront(t, o = {}) {
  const x = 140, y = 620, w = 800, h = 900;
  ctx.fillStyle = '#14121C'; ctx.fillRect(x - 40, y - 140, w + 80, h + 160);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2; for (let yy = y - 120; yy < y + h; yy += 50) { ctx.beginPath(); ctx.moveTo(x - 40, yy); ctx.lineTo(x + w + 40, yy); ctx.stroke(); }
  // letrero apagado
  roundRect(x + 120, y - 110, w - 240, 90, 10); ctx.fillStyle = '#0B0A12'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = `rgba(255,255,255,${o.signA ?? .25})`; ctx.font = `700 46px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '12px'; ctx.fillText('TIENDA', x + w / 2, y - 64); ctx.letterSpacing = '0px';
  // vitrina vacía con reflejos
  const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#1E1C2A'); g.addColorStop(1, '#0E0C16');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.moveTo(x + 80, y + h); ctx.lineTo(x + 380, y); ctx.lineTo(x + 470, y); ctx.lineTo(x + 170, y + h); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 4; ctx.strokeRect(x, y, w, h);
  // luces de policía
  if (o.police) { const on = Math.floor(t * 5) % 2; const pg = ctx.createRadialGradient(on ? 0 : W, 1500, 20, on ? 0 : W, 1500, 900); pg.addColorStop(0, on ? 'rgba(255,40,60,0.55)' : 'rgba(40,90,255,0.55)'); pg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = pg; ctx.fillRect(0, 0, W, H); }
}
function tape(y, rot, t, txt) {
  ctx.save(); ctx.translate(540, y); ctx.rotate(rot);
  ctx.fillStyle = '#F2C21B'; ctx.fillRect(-700, -40, 1400, 80);
  ctx.fillStyle = '#141414'; ctx.font = `900 46px ${FONT}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const off = (t * 60) % 520; for (let x = -1240 + off; x < 700; x += 520) ctx.fillText(txt, x, 4);
  ctx.restore();
}
function bars(a) { ctx.save(); ctx.globalAlpha = a; for (let x = 60; x < W; x += 120) { const g = ctx.createLinearGradient(x - 16, 0, x + 16, 0); g.addColorStop(0, '#3A3E48'); g.addColorStop(.5, '#C9CED8'); g.addColorStop(1, '#3A3E48'); ctx.fillStyle = g; ctx.fillRect(x - 16, 0, 32, H); } ctx.fillStyle = '#5A606C'; ctx.fillRect(0, 380, W, 30); ctx.fillRect(0, 1500, W, 30); ctx.restore(); }
function decree(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-.03);
  const g = ctx.createRadialGradient(0, 0, 20, 0, 0, 500); g.addColorStop(0, '#F3E3BC'); g.addColorStop(1, '#C49A5E');
  roundRect(-340, -440, 680, 880, 10); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#6A4A24'; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = '#3A2410'; ctx.textAlign = 'center'; ctx.font = `italic 700 44px Georgia, serif`; ctx.fillText('Decreto', 0, -340);
  ctx.font = `700 34px Georgia, serif`; ctx.fillText('Queda abolida la', 0, -260); ctx.fillText('esclavitud en la', 0, -215); ctx.fillText('República', 0, -170);
  ctx.fillStyle = 'rgba(58,36,16,0.35)'; for (let i = 0; i < 9; i++) ctx.fillRect(-260, -110 + i * 34, 520 - (i % 3) * 60, 10);
  ctx.font = `italic 700 54px Georgia, serif`; ctx.fillStyle = '#3A2410'; ctx.fillText('1829', 0, 300);
  ctx.beginPath(); ctx.arc(200, 330, 60, 0, 7); const sg = ctx.createRadialGradient(185, 315, 5, 200, 330, 60); sg.addColorStop(0, '#E85A4A'); sg.addColorStop(1, '#8A1E1E'); ctx.fillStyle = sg; ctx.fill();
  ctx.restore();
}
function globeDots(t, n) {
  const cx = 540, cy = 900, R = 330;
  const og = ctx.createRadialGradient(cx - 100, cy - 120, 40, cx, cy, R); og.addColorStop(0, '#2A4A7A'); og.addColorStop(1, '#0E1A34');
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fillStyle = og; ctx.fill(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R - 3, 0, 7); ctx.clip();
  const sh = (t * 24) % (R * 2); ctx.fillStyle = 'rgba(120,160,220,0.35)';
  for (const [x, y, rx, ry] of [[-150, -100, 120, 90], [60, -40, 140, 110], [-80, 150, 90, 70], [200, 170, 80, 60]]) { ctx.beginPath(); ctx.ellipse(cx + ((x + sh + R) % (R * 2)) - R, cy + y, rx, ry, .3, 0, 7); ctx.fill(); }
  const r = rng(11); for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * R; ctx.fillStyle = `rgba(255,${120 + r() * 60},90,${.6 + .4 * Math.sin(t * 3 + i)})`; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 3.5, 0, 7); ctx.fill(); }
  ctx.restore();
}
function phone(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(-230, -440, 460, 880, 54); ctx.fillStyle = '#0E0E14'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4; ctx.stroke();
  roundRect(-205, -410, 410, 820, 36); ctx.fillStyle = '#1A1C24'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `700 26px ${FONT}`; ctx.textAlign = 'left'; ctx.fillText('Mensaje nuevo', -170, -350);
  roundRect(-180, -300, 360, 400, 22); ctx.fillStyle = '#25332C'; ctx.fill();
  const lines = ['¡Trabajo en el extranjero!', '$40,000 al mes', 'Sin experiencia', 'Viaje pagado', '¡Sales mañana!'];
  ctx.font = `600 30px ${FONT}`; lines.forEach((l, i) => { ctx.fillStyle = i === 0 ? '#9CFF9A' : '#E9ECF2'; ctx.fillText(l, -160, -240 + i * 62); });
  ctx.restore();
}

/* 1 — la pregunta */
function s1(t) { bg(t); storefront(t, { signA: .2 + .1 * Math.sin(t * 6) }); vignette(); say(CAPS[0], t); }
/* 2 — no durarías ni un día: trata de personas */
function s2(t) {
  bg(t); storefront(t, { police: true, signA: .15 });
  const k = easeOut(prog(t, .3, .8));
  tape(900, -.12 * k, t, 'CLAUSURADO  ·  ');
  tape(1150, .1 * k, t, 'NO PASAR  ·  ');
  vignette();
  tag('Trata de personas', 540, 1450, t, cap(1, 2), { color: RED });
  tag('Delito grave', 540, 1560, t, cap(1, 4), { color: RED });
  say(CAPS[1], t);
}
/* 3 — de 5 a 15 años de cárcel, y puede ser mayor */
function s3(t) {
  bg(t, { light: 'rgba(60,60,80,0.4)' });
  bars(easeOut(prog(t, .2, .9)));
  vignette();
  readout('Pena por trata', '5 a 15 años', 110, 820, 860, t, cap(2, 2), { vsize: 52, h: 120 });
  readout('Además', 'Multa', 110, 980, 860, t, cap(2, 3), { vsize: 44 });
  if (t > cap(2, 4)) readout('Agravantes', 'Pena mayor ↑', 110, 1120, 860, t, cap(2, 4), { vsize: 44 });
  say(CAPS[2], t);
}
/* 4 — fue legal durante siglos; abolida en 1829 */
function s4(t) {
  bg(t, { light: 'rgba(120,96,50,0.45)' });
  popIn(t, cap(3, 3) - .3, k => decree(540, 960, .95 * k, t));
  if (t < cap(3, 3) - .3) { const k = prog(t, .2, cap(3, 2) + .5); ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#E6C36A'; ctx.font = `800 120px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Siglos', 540, 900); ctx.restore(); }
  vignette();
  tag('Vicente Guerrero', 540, 1560, t, cap(3, 6), { color: GOLD });
  say(CAPS[3], t);
}
/* 5 — 50 millones hoy */
function s5(t) {
  bg(t);
  const n = Math.floor(easeOut(prog(t, cap(4, 2), cap(4, 4) + .5)) * 500);
  globeDots(t, n);
  vignette();
  const v = Math.floor(easeOut(prog(t, cap(4, 3) - .2, cap(4, 4) + .4)) * 50);
  if (t > cap(4, 3) - .2) { ctx.save(); ctx.font = `900 120px ${MONO()}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = GOLD; ctx.shadowColor = 'rgba(230,195,106,0.5)'; ctx.shadowBlur = 20; ctx.fillText(`${v} millones`, 540, 470); ctx.restore(); }
  readout('Trabajo forzoso', '27,6 M', 110, 1340, 860, t, cap(4, 6), { vsize: 44 });
  readout('Matrimonio forzado', '22 M', 110, 1470, 860, t, cap(4, 6) + .4, { vsize: 44 });
  say(CAPS[4], t);
}
/* 6 — empieza con una oferta de trabajo demasiado buena */
function s6(t) {
  bg(t);
  popIn(t, cap(5, 2) - .2, k => phone(540, 980, .95 * k, t));
  if (t < cap(5, 2) - .2) { storefront(t, { signA: .1 }); noSign(540, 1000, 220, t, .4, () => { ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(-120, -140, 240, 280); }); }
  vignette();
  tag('Sueldo irreal', 260, 560, t, cap(5, 4), { color: RED });
  tag('Sin requisitos', 820, 640, t, cap(5, 4) + .25, { color: RED });
  tag('Prisa por irte', 540, 1500, t, cap(5, 5), { color: RED });
  say(CAPS[5], t);
}
/* 7 — Línea Nacional contra la Trata */
function s7(t) {
  bg(t, { light: 'rgba(120,96,50,0.45)' });
  vignette();
  popIn(t, cap(6, 2), k => {
    ctx.save(); ctx.translate(540, 900); ctx.scale(k, k);
    glass(-460, -240, 920, 480, 30);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 34px ${FONT}`; ctx.letterSpacing = '6px'; ctx.fillStyle = 'rgba(225,230,240,0.85)'; ctx.fillText('LÍNEA NACIONAL CONTRA LA TRATA', 0, -150); ctx.letterSpacing = '0px';
    const parts = [['800', 4], ['5533', 5], ['000', 6]]; let s = parts.filter(([, k2]) => t > cap(6, k2) - .1).map(([p]) => p).join(' ');
    ctx.font = `900 120px ${MONO()}`; ctx.fillStyle = GOLD; ctx.shadowColor = 'rgba(230,195,106,0.6)'; ctx.shadowBlur = 24; ctx.fillText(s || ' ', 0, 0); ctx.shadowBlur = 0;
    ctx.font = `600 34px ${FONT}`; ctx.fillStyle = '#E9ECF2'; ctx.fillText('Gratis · 24 horas · Confidencial', 0, 140);
    ctx.restore();
  });
  say(CAPS[6], t);
}
/* 8 — compártelo */
function s8(t) {
  bg(t, { light: 'rgba(120,96,50,0.45)' });
  vignette();
  ctx.save(); ctx.translate(540, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 96px ${MONO()}`; ctx.fillStyle = GOLD; ctx.shadowColor = 'rgba(230,195,106,0.6)'; ctx.shadowBlur = 24; ctx.fillText('800 5533 000', 0, -60); ctx.shadowBlur = 0;
  ctx.font = `600 34px ${FONT}`; ctx.fillStyle = '#E9ECF2'; ctx.fillText('Línea Nacional contra la Trata · México', 0, 30);
  ctx.restore();
  tag('Comparte', 540, 1300, t, cap(7, 0), { color: GOLD });
  say(CAPS[7], t);
}
startVideo([s1, s2, s3, s4, s5, s6, s7, s8], 3.2);
