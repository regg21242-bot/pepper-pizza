/* El Chichón, 1982 — la erupción más mortal de la historia moderna de México */
const ZOQ = [{ coat: '#E8E2D0', hat: 'hair', hatColor: '#1C1C22' }, { coat: '#C8322E', dress: true, hat: 'longhair', hatColor: '#1C1C22' }, { coat: '#2F7BE0', dress: true, hat: 'bun', hatColor: '#1C1C22' }, { coat: '#F2C53A', hat: 'cap', hatColor: '#E8DCC0' }];

/* ---------- piezas ---------- */
function tropicalSky(t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, 1500);
  const c = o.night ? ['#060818', '#1E2246', '#3A2A4A'] : o.ash ? ['#4A4642', '#7A7268', '#9A8E80'] : ['#5FB8F0', '#A8DCF5', '#E8F6E0'];
  g.addColorStop(0, c[0]); g.addColorStop(.6, c[1]); g.addColorStop(1, c[2]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (o.night) { const r = rng(5); for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,255,240,${.3 + .5 * r()})`; ctx.beginPath(); ctx.arc(r() * W, r() * 700, 1 + r() * 1.4, 0, 7); ctx.fill(); } }
  else if (!o.ash) { ctx.beginPath(); ctx.arc(860, 220, 70, 0, 7); inked('#FFE68A', 5); }
}
function jungleTree(x, gy, s, ph, col = '#2E8A44') {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  ctx.fillStyle = '#5A3A22'; ctx.fillRect(-8, -120, 16, 120);
  for (const [dx, dy, r] of [[-40, -130, 55], [40, -135, 58], [0, -175, 65], [-10, -110, 50]]) { ctx.beginPath(); ctx.arc(dx, dy + Math.sin(ph) * 2, r, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.stroke(); }
  ctx.restore();
}
function palm(x, gy, s, t) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); ctx.strokeStyle = '#7A5A30'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(20, -120, 0, -240); ctx.stroke();
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(0, -240); ctx.rotate(-Math.PI / 2 + (i - 2.5) * .55 + Math.sin(t * 2 + i) * .04); ctx.beginPath(); ctx.ellipse(70, 0, 80, 18, 0, 0, 7); inked('#3FAE5A', 4); ctx.restore(); }
  ctx.restore();
}
/* montaña con selva; o.crater, o.bare (sin selva), o.glow */
function chichon(x, gy, s, t, o = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-520, 0); ctx.bezierCurveTo(-320, -60, -200, -380, -60, -420);
  if (o.crater) { ctx.lineTo(-40, -380); ctx.lineTo(40, -380); ctx.lineTo(60, -420); } else ctx.quadraticCurveTo(0, -440, 60, -420);
  ctx.bezierCurveTo(200, -380, 320, -60, 520, 0); ctx.closePath();
  const g = ctx.createLinearGradient(0, -440, 0, 0);
  if (o.bare) { g.addColorStop(0, '#8A8078'); g.addColorStop(1, '#6A6058'); } else { g.addColorStop(0, '#3E8A4A'); g.addColorStop(1, '#2A6A34'); }
  inked(g, 7);
  if (!o.bare) { ctx.save(); ctx.clip(); const r = rng(12); for (let i = 0; i < 90; i++) { const tx = -480 + r() * 960, ty = -r() * 430; ctx.fillStyle = ['#2E7A3C', '#4A9A4E', '#236A30'][i % 3]; ctx.beginPath(); ctx.arc(tx, ty, 22 + r() * 18, 0, 7); ctx.fill(); } ctx.restore(); }
  if (o.glow) { const gg = ctx.createRadialGradient(0, -400, 10, 0, -400, 260); gg.addColorStop(0, `rgba(255,140,40,${o.glow})`); gg.addColorStop(1, 'rgba(255,140,40,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, -400, 260, 0, 7); ctx.fill(); }
  ctx.restore();
}
function house(x, gy, s, o = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  roundRect(-90, -120, 180, 120, 4); inked(o.ash ? '#9A948C' : '#F0E2C8', 5);
  ctx.beginPath(); ctx.moveTo(-110, -115); ctx.lineTo(0, -190); ctx.lineTo(110, -115); ctx.closePath(); inked(o.ash ? '#7A746C' : '#B5553A', 5);
  roundRect(-24, -70, 48, 70, 3); inked(o.ash ? '#5A544C' : '#6A3E24', 4);
  roundRect(42, -90, 34, 34, 3); inked(o.ash ? '#5A544C' : '#3A4A6A', 4);
  ctx.restore();
}
function chapel(x, gy, s, o = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  roundRect(-90, -200, 180, 200, 4); inked(o.ash ? '#A8A298' : '#F4F0E6', 6);
  roundRect(-40, -300, 80, 110, 4); inked(o.ash ? '#A8A298' : '#F4F0E6', 6);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -300); ctx.lineTo(0, -350); ctx.moveTo(-18, -330); ctx.lineTo(18, -330); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -240, 16, 0, 7); inked(o.ash ? '#6A645C' : '#D9A62E', 4);
  ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-30, -80); ctx.arc(0, -80, 30, Math.PI, 0); ctx.lineTo(30, 0); ctx.closePath(); inked(o.ash ? '#5A544C' : '#6A3E24', 4);
  ctx.restore();
}
function village(t, gy, o = {}) {
  [[120, .9], [330, .8], [760, .85], [950, .9]].forEach(([x, s]) => house(x, gy, s, o));
  chapel(560, gy, .9, o);
  if (!o.ash) for (const x of [40, 230, 450, 660, 860, 1040]) palm(x, gy + 6, .7, t);
}
function groundBand(gy, col) { ctx.fillStyle = col; ctx.fillRect(0, gy, W, H - gy); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
function plume(x, top, base, t, w = 1) {
  for (let i = 0; i < 30; i++) {
    const ph = (i / 30), y = lerp(base, top, ph), sp = 60 + ph * 260 * w;
    const xx = x + Math.sin(i * 2.3 + t * .8) * sp * .5;
    ctx.fillStyle = `rgba(${70 + ph * 70},${66 + ph * 60},${62 + ph * 56},${.95 - ph * .25})`;
    ctx.beginPath(); ctx.arc(xx, y + Math.sin(t * 2 + i) * 10, 50 + ph * 120 * w, 0, 7); ctx.fill();
  }
  for (let i = 0; i < 10; i++) { const ph = (t * .9 + i / 10) % 1; ctx.strokeStyle = `rgba(255,240,180,${(1 - ph) * .8})`; ctx.lineWidth = 4; if (Math.sin(t * 13 + i * 7) > .9) { ctx.beginPath(); const lx = x + (i - 5) * 30; ctx.moveTo(lx, top + 200); ctx.lineTo(lx + 30, top + 280); ctx.lineTo(lx - 10, top + 300); ctx.lineTo(lx + 20, top + 380); ctx.stroke(); } }
}
function ashFall(t, a = 1) { const r = rng(3); ctx.fillStyle = `rgba(200,195,185,${.7 * a})`; for (let i = 0; i < 160; i++) { const x = (r() * W + t * 30) % W, y = (r() * H + t * (60 + r() * 60)) % H; ctx.fillRect(x, y, 3, 3); } }

/* 1 — no fue el Popocatépetl */
function sc1(t) {
  tropicalSky(t, {});
  const sw = cap(0, 4) - .2;
  if (t < sw) {
    // el Popocatépetl, famoso
    ctx.beginPath(); ctx.moveTo(-40, 1500); ctx.lineTo(400, 760); ctx.lineTo(490, 735); ctx.lineTo(580, 740); ctx.lineTo(680, 775); ctx.lineTo(1120, 1500); ctx.closePath(); inked('#6A6A7A', 7);
    ctx.beginPath(); ctx.moveTo(400, 760); ctx.lineTo(490, 735); ctx.lineTo(580, 740); ctx.lineTo(680, 775); ctx.lineTo(740, 870); ctx.lineTo(660, 840); ctx.lineTo(600, 890); ctx.lineTo(540, 850); ctx.lineTo(470, 900); ctx.lineTo(420, 850); ctx.lineTo(350, 870); ctx.closePath(); ctx.fillStyle = '#F4F6FA'; ctx.fill();
    groundBand(1500, '#6A8A4A');
    popIn(t, .4, k => { ctx.save(); ctx.translate(540, 560); ctx.scale(k, k); label('Popocatépetl', 0, 0, { size: 50 }); ctx.restore(); });
    noSign(540, 1000, 160, t, cap(0, 3) + .2, () => { ctx.fillStyle = '#fff'; ctx.font = `900 60px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('¿?', 0, 4); });
  } else {
    chichon(540, 1500, 1.1, t, {}); groundBand(1500, '#3E7A3A');
    for (let i = 0; i < 3; i++) { const k = (t * .8 + i / 3) % 1; ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI); ctx.font = `900 ${100 + i * 16}px ${FONT}`; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.strokeText('?', 400 + i * 140, 800 - k * 140); ctx.fillStyle = '#FFD84A'; ctx.fillText('?', 400 + i * 140, 800 - k * 140); ctx.restore(); }
  }
  captions(CAPS[0], t);
}
/* 2 — El Chichón, Chiapas, selva y comunidades zoques */
function sc2(t) {
  tropicalSky(t, {});
  chichon(540, 1300, 1.1, t, {});
  groundBand(1300, '#4A8A3E');
  for (let i = 0; i < 8; i++) jungleTree(60 + i * 140, 1330 + (i % 2) * 20, .8, t + i);
  popIn(t, .3, k => { ctx.save(); ctx.translate(540, 520); ctx.scale(k, k); label('El Chichón · Chiapas', 0, 0, { size: 50 }); ctx.restore(); });
  if (t > cap(1, 4) - .2) {
    const k = easeOut(prog(t, cap(1, 4) - .2, cap(1, 4) + .5));
    ctx.save(); ctx.translate(0, (1 - k) * 400);
    groundBand(1560, '#7A9A4A'); village(t, 1600, {});
    ZOQ.forEach((o, i) => person(170 + i * 250, 1800, 1.0, Object.assign({}, o, { arms: [.4, -.3], eyes: 'happy', mouth: 'smile', face: i % 2 ? -1 : 1 })));
    ctx.restore();
    popIn(t, cap(1, 5), kk => { ctx.save(); ctx.translate(540, 1060); ctx.scale(kk, kk); label('Comunidades zoques', 0, 0, { size: 44, bg: '#FFD84A' }); ctx.restore(); });
  }
  captions(CAPS[1], t);
}
/* 3 — nadie lo vigilaba */
function sc3(t) {
  tropicalSky(t, {});
  chichon(540, 1400, 1.1, t, {});
  groundBand(1400, '#4A8A3E');
  for (let i = 0; i < 8; i++) jungleTree(60 + i * 140, 1430, .8, t + i);
  // una oficina de vigilancia vacía
  noSign(540, 650, 140, t, .3, () => { ctx.save(); ctx.scale(1.2, 1.2); roundRect(-60, -40, 120, 80, 10); inked('#C9CED8', 5); ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); inked('#2B2D3A', 4); ctx.restore(); });
  popIn(t, cap(2, 1), k => { ctx.save(); ctx.translate(540, 860); ctx.scale(k, k); label('"Solo una montaña"', 0, 0, { size: 46 }); ctx.restore(); });
  person(300, 1720, 1.2, Object.assign({}, ZOQ[3], { arms: [.3, -.2], eyes: 'happy', mouth: 'smile', face: 1 }));
  person(800, 1720, 1.1, Object.assign({}, ZOQ[1], { arms: [-.3, .2], eyes: 'happy', mouth: 'smile', face: -1 }));
  captions(CAPS[2], t);
}
/* 4 — 28 de marzo de 1982: explota; 17 km */
function sc4(t) {
  tropicalSky(t, { night: true });
  const boom = cap(3, 3) - .2;
  chichon(540, 1500, 1.0, t, { crater: t > boom, glow: t > boom ? .8 : 0 });
  groundBand(1500, '#1E2A1E');
  if (t < boom) { parchment([['28 de marzo', 54, FONT], ['1982', 110, FONT]], 540, 560, 520, 300, t, .3, { lh: 100, write: 1.0 }); }
  else {
    if (t < boom + .15) { ctx.fillStyle = `rgba(255,220,160,${1 - (t - boom) / .15})`; ctx.fillRect(0, 0, W, H); }
    const h = easeOut(prog(t, boom, boom + 3)) * 1000;
    plume(540, 1080 - h, 1080, t, 1);
    sfxText('¡BOOM!', 540, 900, t, boom, { size: 150, color: '#FFB23F', dur: 1.3 });
    // regla de altura
    if (t > cap(3, 4) - .2) {
      const k = prog(t, cap(3, 4) - .2, cap(3, 4) + .3);
      ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(960, 1080); ctx.lineTo(960, 80); ctx.stroke();
      for (let i = 0; i <= 17; i++) { const y = 1080 - i * (1000 / 17); ctx.beginPath(); ctx.moveTo(940, y); ctx.lineTo(i % 5 === 0 ? 900 : 925, y); ctx.stroke(); }
      // avión comercial a ~10 km
      const ay = 1080 - 10 * (1000 / 17); ctx.fillStyle = '#E8ECF2'; ctx.beginPath(); ctx.ellipse(820, ay, 50, 10, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(810, ay); ctx.lineTo(790, ay + 26); ctx.lineTo(830, ay); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `800 26px ${FONT}`; ctx.textAlign = 'right'; ctx.fillText('avión ~10 km', 900, ay - 22);
      ctx.restore();
      bigNumber('17 km', 780, 160, 90, t, cap(3, 5), { color: '#FFD84A' });
    }
  }
  captions(CAPS[3], t);
}
/* 5 — evacuaciones, pero mucha gente seguía cerca */
function sc5(t) {
  tropicalSky(t, { ash: true });
  chichon(760, 1350, .7, t, { crater: true, bare: false });
  plume(760, 300, 1060, t, .6);
  groundBand(1350, '#6A6A5A');
  village(t, 1400, { ash: true });
  for (let i = 0; i < 4; i++) { const x = ((t * 90 + i * 300) % 1400) - 200; const p = person(x, 1780, 1.0, Object.assign({}, ZOQ[i], { walk: t * 7 + i, bob: true, arms: [2.6, .2], armLen: 120, eyes: 'open', mouth: 'flat', brows: 'worried', face: -1 })); ctx.save(); ctx.translate(p.hands[0].x, p.hands[0].y - 30); roundRect(-40, -40, 80, 50, 8); inked('#C8A070', 4); ctx.restore(); }
  ashFall(t);
  popIn(t, cap(4, 1), k => { ctx.save(); ctx.translate(540, 560); ctx.scale(k, k); label('Muchos seguían cerca', 0, 0, { size: 46, bg: '#FFD84A' }); ctx.restore(); });
  captions(CAPS[4], t);
}
/* 6 — 4 de abril: nubes ardientes borran nueve pueblos */
function pyroCloud(xFront, gy, t, h = 1) {
  // nube ardiente: núcleo incandescente y ceniza encima
  const g = ctx.createRadialGradient(xFront - 260, gy - 80, 20, xFront - 260, gy - 80, 560); g.addColorStop(0, 'rgba(255,140,40,0.75)'); g.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = g; ctx.fillRect(xFront - 900, gy - 600, 1000, 700);
  for (let i = 0; i < 26; i++) {
    const x = xFront - i * 58 + Math.sin(i * 3 + t * 5) * 16, rr = 70 + (i % 5) * 28;
    const y = gy - 60 - (i % 4) * 62 * h;
    const hot = (i % 4) === 0;
    ctx.fillStyle = hot ? 'rgba(210,110,50,0.95)' : (i % 3 ? 'rgba(110,96,88,0.96)' : 'rgba(140,116,96,0.96)'); ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) { const x = xFront - 40 - i * 70, y = gy - 40 - (i % 3) * 40; const gg = ctx.createRadialGradient(x, y, 4, x, y, 70); gg.addColorStop(0, 'rgba(255,170,60,0.55)'); gg.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, 70, 0, 7); ctx.fill(); }
  ctx.restore();
}
function flames(x, gy, s, t, i) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  for (let k = 0; k < 3; k++) { const f = 1 + Math.sin(t * 14 + i * 2 + k) * .15; ctx.fillStyle = ['#FF6A1A', '#FFB23F', '#FFE8A0'][k]; ctx.beginPath(); ctx.moveTo(-40 + k * 12, 0); ctx.quadraticCurveTo(-50 + k * 14, -80 * f, 0, -150 * f * (1 - k * .25)); ctx.quadraticCurveTo(50 - k * 14, -80 * f, 40 - k * 12, 0); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function sc6(t) {
  tropicalSky(t, { ash: true });
  const c = k => cap(5, k);
  parchment([['4 de abril', 64, FONT]], 540, 420, 420, 150, t, .2, { write: .6, tOut: c(2) - .4 });
  const kk0 = prog(t, c(3) - .2, c(7) + .6);
  chichon(300, 1250, .8, t, { crater: true, glow: .6, bare: kk0 > .35 });
  plume(300, 150, 920, t, .8);
  groundBand(1250, '#6A6A5A');
  // "no fue la lava"
  noSign(540, 560, 130, t, c(2), () => { ctx.fillStyle = '#FF6A1A'; ctx.beginPath(); ctx.moveTo(0, -70); ctx.bezierCurveTo(30, -30, 55, 0, 55, 25); ctx.arc(0, 25, 55, 0, Math.PI); ctx.bezierCurveTo(-55, 0, -30, -30, 0, -70); ctx.fill(); }, c(3) + .6);
  const k = prog(t, c(3) - .2, c(7) + .6);
  const burnt = k > .55;
  village(t, 1500, { ash: burnt });
  if (burnt) { [[120, .9], [330, .8], [560, 1.1], [760, .85], [950, .9]].forEach(([x, s], i) => flames(x, 1430, s * .9, t, i)); ctx.fillStyle = 'rgba(30,18,10,0.25)'; ctx.fillRect(0, 1200, W, H - 1200); }
  if (k > 0) pyroCloud(lerp(300, 1500, easeIn(k)), 1520, t, 1.3);
  // brasas en el aire
  if (k > .3) { const r = rng(5); for (let i = 0; i < 40; i++) { const x = (r() * W + t * 80) % W, y = 900 + ((r() * 700 - t * 120) % 700 + 700) % 700; ctx.fillStyle = `rgba(255,${150 + r() * 80},60,${.7 * r()})`; ctx.beginPath(); ctx.arc(x, y, 3 + r() * 4, 0, 7); ctx.fill(); } }
  // temperatura
  popIn(t, c(5), kk => { ctx.save(); ctx.translate(540, 560); ctx.scale(kk, kk); roundRect(-300, -70, 600, 140, 30); inked('#FFF6DC', 7); ctx.fillStyle = '#C8322E'; ctx.font = `900 64px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🌡 cientos de °C', 0, 4); ctx.restore(); }, c(7) - .2);
  if (t > c(7)) sfxText('¡TODO ARDIÓ!', 540, 560, t, c(7), { size: 90, color: '#FFB23F', dur: 1.3 });
  if (t > c(8)) {
    ctx.fillStyle = `rgba(30,26,22,${.5 * prog(t, c(8), c(8) + .4)})`; ctx.fillRect(0, 0, W, H);
    bigNumber('9 PUEBLOS', 540, 760, 120, t, c(8) + .1, { color: '#FFFFFF' });
  }
  captions(CAPS[5], t);
}
/* 7 — 2.000 personas; desplazamiento */
function candle(x, y, s, t, i) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(-14, -60, 28, 60, 4); inked('#F4ECD8', 4);
  const f = 1 + Math.sin(t * 9 + i) * .1;
  const g = ctx.createRadialGradient(0, -80, 2, 0, -80, 60); g.addColorStop(0, 'rgba(255,220,120,0.6)'); g.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -80, 60, 0, 7); ctx.fill();
  ctx.fillStyle = '#FFB23F'; ctx.beginPath(); ctx.moveTo(0, -100 * f); ctx.quadraticCurveTo(12, -74, 0, -64); ctx.quadraticCurveTo(-12, -74, 0, -100 * f); ctx.fill();
  ctx.restore();
}
function sc7(t) {
  if (t < cap(6, 1) - .2) {
    ctx.fillStyle = '#100C14'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 15; i++) candle(120 + (i % 5) * 210, 1200 + Math.floor(i / 5) * 150, 1.1, t, i);
    bigNumber('~2.000', 540, 600, 170, t, cap(6, 0) + .5, { color: '#FFE8A0', sub: 'PERSONAS' });
  } else {
    tropicalSky(t, { ash: true }); groundBand(1500, '#7A7466');
    chichon(820, 1500, .6, t, { crater: true, bare: true });
    for (let i = 0; i < 6; i++) { const x = 900 - ((t * 70 + i * 170) % 1100); const p = person(x, 1760 + (i % 2) * 40, .95, Object.assign({}, ZOQ[i % 4], { walk: t * 6 + i, bob: true, arms: [2.6, .2], armLen: 120, eyes: 'closed', mouth: 'frown', face: -1 })); ctx.save(); ctx.translate(p.hands[0].x, p.hands[0].y - 30); roundRect(-40, -40, 80, 50, 8); inked('#C8A070', 4); ctx.restore(); }
    popIn(t, cap(6, 2), k => { ctx.save(); ctx.translate(540, 560); ctx.scale(k, k); label('Dejaron su tierra', 0, 0, { size: 50, bg: '#FFD84A' }); ctx.restore(); });
  }
  captions(CAPS[6], t);
}
/* 8 — la nube de azufre da la vuelta al planeta */
function sc8(t) {
  ctx.fillStyle = '#05070F'; ctx.fillRect(0, 0, W, H);
  const r = rng(9); for (let i = 0; i < 100; i++) { ctx.fillStyle = `rgba(255,255,255,${.3 + .5 * r()})`; ctx.beginPath(); ctx.arc(r() * W, r() * H, 1 + r() * 1.5, 0, 7); ctx.fill(); }
  const cx = 540, cy = 860, R = 320;
  const og = ctx.createRadialGradient(cx - 100, cy - 120, 40, cx, cy, R); og.addColorStop(0, '#5FB8F0'); og.addColorStop(1, '#1C4FA0');
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); inked(og, 8);
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R - 4, 0, 7); ctx.clip();
  const sh = (t * 30) % (R * 2);
  ctx.fillStyle = '#5DBB4A'; for (const [x, y, rx, ry] of [[-150, -100, 120, 90], [60, -40, 140, 110], [-80, 150, 90, 70], [200, 170, 80, 60]]) { ctx.beginPath(); ctx.ellipse(cx + ((x + sh + R) % (R * 2)) - R, cy + y, rx, ry, .3, 0, 7); ctx.fill(); }
  // banda de azufre que rodea el planeta
  const k = prog(t, cap(7, 1), cap(7, 2) + 1);
  ctx.strokeStyle = 'rgba(240,220,120,0.55)'; ctx.lineWidth = 60; ctx.beginPath(); ctx.ellipse(cx, cy + 60, R + 10, 50, 0, Math.PI, Math.PI + Math.PI * 2 * k); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = 'rgba(240,220,120,0.35)'; ctx.lineWidth = 40; ctx.beginPath(); ctx.ellipse(cx, cy + 60, R + 40, 70, 0, Math.PI, Math.PI + Math.PI * 2 * k); ctx.stroke();
  popIn(t, cap(7, 0), kk => { ctx.save(); ctx.translate(540, 420); ctx.scale(kk, kk); label('Azufre (SO₂)', 0, 0, { size: 48, bg: '#F2D85A' }); ctx.restore(); });
  if (t > cap(7, 3) - .1) popIn(t, cap(7, 3), kk => { ctx.save(); ctx.translate(880, 1300); ctx.scale(kk, kk); roundRect(-30, -160, 60, 220, 30); inked('#FFFFFF', 6); const lv = lerp(.6, .45, prog(t, cap(7, 3), cap(7, 4) + .5)); ctx.fillStyle = '#5FB8F0'; ctx.fillRect(-14, 40 - 180 * lv, 28, 180 * lv); ctx.beginPath(); ctx.arc(0, 60, 40, 0, 7); inked('#5FB8F0', 6); ctx.font = `900 60px ${FONT}`; ctx.fillStyle = '#5FB8F0'; ctx.textAlign = 'center'; ctx.fillText('↓', -80, -40); ctx.restore(); });
  captions(CAPS[7], t);
}
/* 9 — la lección + pregunta */
function sc9(t) {
  tropicalSky(t, {});
  chichon(540, 1400, 1.1, t, { crater: true });
  // vapor suave del cráter
  for (let i = 0; i < 5; i++) { const ph = (t * .3 + i / 5) % 1; ctx.fillStyle = `rgba(255,255,255,${.4 * (1 - ph)})`; ctx.beginPath(); ctx.arc(540 + Math.sin(i + t) * 20, 920 - ph * 200, 20 + ph * 50, 0, 7); ctx.fill(); }
  groundBand(1400, '#4A8A3E');
  for (let i = 0; i < 8; i++) jungleTree(60 + i * 140, 1430, .8, t + i);
  popIn(t, cap(8, 1), k => { ctx.save(); ctx.translate(540, 560); ctx.scale(k, k); roundRect(-430, -80, 860, 160, 30); inked('#FFF6DC', 7); ctx.fillStyle = INK; ctx.font = `900 46px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Dormido ≠ apagado', 0, 4); ctx.restore(); }, cap(8, 3) - .3);
  questionBox('¿Conocías', 'esta historia?', t, cap(8, 3), { y: 560 });
  captions(CAPS[8], t);
}
startVideo([sc1, sc2, sc3, sc4, sc5, sc6, sc7, sc8, sc9], 3.0);
