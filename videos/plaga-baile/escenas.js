/* La plaga del baile de 1518 — escenas */
const DCOLS = ['#C8322E', '#2F7BE0', '#3FAE5A', '#F2B92E', '#7A3FA0', '#E07A2F', '#2E6B6A', '#8A4A2A'];
function dancer(x, gy, s, t, ph = 0, o = {}) {
  const sp = o.speed || 8;
  const hop = Math.abs(Math.sin(t * sp * .5 + ph)) * 26 * (o.energy ?? 1);
  return person(x + Math.sin(t * sp * .25 + ph) * 18, gy - hop * s, s, Object.assign({
    arms: danceArms(t, ph, sp), armLen: 128, walk: t * sp + ph, tilt: Math.sin(t * sp * .5 + ph) * .18,
    eyes: o.tired ? 'sleepy' : 'closed', mouth: o.tired ? 'wavy' : 'smile', face: Math.sin(t * sp * .125 + ph) > 0 ? 1 : -1,
  }, o.look || {}));
}
const FRAU = { coat: '#C8322E', dress: true, hat: 'longhair', hatColor: '#6A3E24' };
function sweat(x, y, t, n = 3) {
  for (let i = 0; i < n; i++) { const k = (t * 1.5 + i / n) % 1; drop(x + (i - 1) * 50 + k * 30 * (i - 1), y + k * 120, 12, 1 - k); }
}
function lying(x, gy, s, o) {
  ctx.save(); ctx.translate(x, gy); ctx.rotate(-Math.PI / 2 * .97); person(0, 0, s, Object.assign({ arms: [1.2, -.6], eyes: 'closed', mouth: 'wavy' }, o)); ctx.restore();
}

/* 1 — una mujer empieza a bailar */
function scene1(t) {
  medievalTown(t, 60, {});
  parchment([['1518', 110, FONT]], 300, 520, 360, 200, t, .2, { write: .6, tOut: cap(0, 2) - .3 });
  popIn(t, cap(0, 1), k => { ctx.save(); ctx.translate(720, 520); ctx.scale(k, k); label('Estrasburgo', 0, 0, { size: 46, bg: '#FFD84A' }); ctx.restore(); }, cap(0, 2) - .3);
  const start = cap(0, 4);
  if (t < start) {
    const k = easeOut(prog(t, cap(0, 2), start));
    person(lerp(-100, 540, k), 1720, 1.35, Object.assign({}, FRAU, { walk: k < 1 ? t * 7 : undefined, bob: k < 1, arms: [.2, -.2], eyes: 'open', mouth: 'flat' }));
  } else {
    dancer(540, 1720, 1.35, t, 0, { look: FRAU, speed: 8 + prog(t, start, start + 2) * 3 });
    if (t > cap(0, 5)) sweat(540, 900, t);
  }
  // vecinos que miran asombrados
  person(170, 1720, 1.0, { coat: '#6A3E24', hat: 'beret', arms: [.2, -.2], eyes: t > start ? 'wide' : 'open', mouth: t > start ? 'o' : 'flat', face: 1 });
  person(900, 1720, 1.0, { coat: '#2E4A6A', dress: true, hat: 'bun', arms: [.2, 1.8], eyes: t > start ? 'wide' : 'open', mouth: t > start ? 'o' : 'flat', face: -1 });
  captions(CAPS[0], t);
}
/* 2 — días enteros, sin música ni descanso; otros se unen */
function scene2(t) {
  const dayK = (t * .9) % 1, night = dayK > .5;
  medievalTown(t, 60, night ? { night: true } : {});
  const days = 1 + Math.floor(t * .9);
  ctx.save(); ctx.translate(540, 420);
  roundRect(-170, -70, 340, 140, 30); inked('#FFF6DC', 7);
  ctx.fillStyle = INK; ctx.font = `900 70px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`DÍA ${days}`, 0, 4);
  ctx.restore();
  noSign(250, 700, 100, t, cap(1, 1), () => musicNote(-16, 0, 1.3, '#fff'), cap(1, 3) - .2);
  noSign(830, 700, 100, t, cap(1, 2), () => { ctx.font = `900 80px ${FONT}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Zz', 0, 4); }, cap(1, 3) - .2);
  dancer(540, 1720, 1.35, t, 0, { look: FRAU, tired: t > cap(1, 2), speed: 9 });
  sweat(540, 900, t);
  const j = cap(1, 4);
  if (t > j - .3) {
    const k = easeOut(prog(t, j - .3, j + .5));
    dancer(lerp(-150, 230, k), 1720, 1.15, t, 1.3, { look: { coat: DCOLS[1], hat: 'beret' } });
    dancer(lerp(1250, 860, k), 1720, 1.15, t, 2.6, { look: { coat: DCOLS[2], dress: true, hat: 'bun' } });
  }
  captions(CAPS[1], t);
}
/* 3 — de decenas a 400 */
function scene3(t) {
  medievalTown(t, 400, {});
  const total = Math.floor(lerp(3, 30, easeInOut(prog(t, .3, cap(2, 3) + .5))));
  const r = rng(77); const ds = [];
  for (let i = 0; i < 30; i++) ds.push({ x: 80 + r() * 920, row: Math.floor(r() * 3), ph: r() * 6, c: DCOLS[i % 8], h: ['beret', 'bun', 'longhair', 'hair', 'beret'][i % 5], d: i % 3 === 1 });
  ds.slice(0, total).sort((a, b) => a.row - b.row).forEach(d => {
    const gy = 1560 + d.row * 110, s = .75 + d.row * .2;
    dancer(d.x, gy, s, t, d.ph, { look: { coat: d.c, hat: d.h, hatColor: ['#6A3E24', '#2B1B10', '#C9A15E'][d.row], dress: d.d } });
  });
  bigNumber('DECENAS', 540, 520, 120, t, cap(2, 0) + .9, { color: '#FFFFFF', tOut: cap(2, 3) - .3 });
  bigNumber('400', 540, 560, 260, t, cap(2, 3), { sub: 'PERSONAS', color: '#FFD84A' });
  captions(CAPS[2], t);
}
/* 4 — los médicos: sangre caliente → más baile */
function scene4(t) {
  // estudio con estanterías
  ctx.fillStyle = '#4A3428'; ctx.fillRect(0, 0, W, H);
  const r = rng(9);
  for (let row = 0; row < 4; row++) { const y = 200 + row * 190; ctx.fillStyle = '#6A4A34'; ctx.fillRect(40, y + 140, 1000, 20); for (let x = 60; x < 1020;) { const w = 24 + r() * 30, h = 90 + r() * 50; roundRect(x, y + 140 - h, w, h, 3); inked(['#8A2B2B', '#2E4A6A', '#3F6A3A', '#8A6A2A', '#5A2E5A'][Math.floor(r() * 5)], 3); x += w + 4; } }
  ctx.fillStyle = '#3A2A20'; ctx.fillRect(0, 1500, W, 420);
  const m1 = person(320, 1720, 1.3, { coat: '#1E1E28', hat: 'beret', hatColor: '#1E1E28', mustache: true, arms: [2.3, -.2], armLen: 130, eyes: 'open', mouth: 'flat', face: 1, brows: 'angry' });
  person(780, 1720, 1.3, { coat: '#2B1E3C', hat: 'beret', hatColor: '#4A1E2E', arms: [.2, 1.6], armLen: 130, eyes: 'open', mouth: 'flat', face: -1 });
  // diagnóstico: gota de sangre con fuego
  popIn(t, cap(3, 2), k => {
    ctx.save(); ctx.translate(540, 640); ctx.scale(k, k);
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .35, fl = 1 + Math.sin(t * 12 + i) * .15; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 60, Math.sin(a) * 60 - 40); ctx.quadraticCurveTo(Math.cos(a) * 140 * fl, Math.sin(a) * 140 * fl - 60, Math.cos(a) * 90, Math.sin(a) * 90 - 120 * fl); ctx.quadraticCurveTo(Math.cos(a) * 60, Math.sin(a) * 60 - 60, Math.cos(a) * 40, Math.sin(a) * 40 - 40); inked(i % 2 ? '#FFB23F' : '#FF6B2F', 4); }
    ctx.beginPath(); ctx.moveTo(0, -150); ctx.bezierCurveTo(40, -80, 110, -20, 110, 50); ctx.arc(0, 50, 110, 0, Math.PI); ctx.bezierCurveTo(-110, -20, -40, -80, 0, -150); inked('#D2232A', 8);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-40, 20, 18, 34, -.4, 0, 7); ctx.fill();
    ctx.restore();
  }, cap(3, 3) - .2);
  if (t > cap(3, 3) - .2 && t < cap(3, 4)) {
    for (let i = 0; i < 3; i++) { const k = (t * .8 + i / 3) % 1; ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI); ctx.font = `900 ${90 + i * 14}px ${FONT}`; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.strokeText('?', 420 + i * 120, 760 - k * 140); ctx.fillStyle = '#FFD84A'; ctx.fillText('?', 420 + i * 120, 760 - k * 140); ctx.restore(); }
  }
  stamp('¡MÁS BAILE!', 540, 640, t, cap(3, 4), { size: 100, color: '#E3352B' });
  captions(CAPS[3], t);
}
/* 5 — músicos y escenarios */
function lute(p) {
  const h = p.hands[0];
  ctx.save(); ctx.translate(h.x - 10, h.y + 10); ctx.rotate(-.5);
  ctx.beginPath(); ctx.ellipse(0, 0, 60, 44, 0, 0, 7); inked('#C98A3E', 5);
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, 7); ctx.fillStyle = INK; ctx.fill();
  roundRect(50, -10, 120, 20, 6); inked('#6A3E24', 4);
  ctx.restore();
}
function scene5(t) {
  medievalTown(t, 700, {});
  // escenario de madera
  const sy = 1420;
  ctx.fillStyle = '#9A6A3A'; ctx.fillRect(60, sy, 960, 60); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(60, sy, 960, 60);
  for (let x = 90; x < 1020; x += 140) { ctx.fillStyle = '#7A4A24'; ctx.fillRect(x, sy + 60, 26, 240); ctx.strokeRect(x, sy + 60, 26, 240); }
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3; for (let x = 60; x < 1020; x += 80) { ctx.beginPath(); ctx.moveTo(x, sy); ctx.lineTo(x, sy + 60); ctx.stroke(); }
  // banderines
  for (let i = 0; i < 12; i++) { const x = 70 + i * 82; ctx.beginPath(); ctx.moveTo(x, 900); ctx.lineTo(x + 70, 900); ctx.lineTo(x + 35, 970); ctx.closePath(); inked(DCOLS[i % 8], 3); }
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(60, 900); ctx.lineTo(1020, 900); ctx.stroke();
  const on = t > cap(4, 1) - .2;
  if (on) {
    const k = easeBack(prog(t, cap(4, 1) - .2, cap(4, 1) + .3));
    ctx.save(); ctx.translate(0, (1 - k) * 300);
    const m1 = person(200, sy, 1.0, { coat: '#2E4A6A', hat: 'beret', arms: [1.2 + Math.sin(t * 12) * .3, 1.0 - Math.sin(t * 12) * .3], armLen: 110, eyes: 'closed', mouth: 'smile', face: 1 });
    ctx.save(); ctx.translate(200, sy - 300); roundRect(-60, -10, 120, 90, 16); inked('#C8322E', 5); ctx.beginPath(); ctx.ellipse(0, -10, 60, 16, 0, 0, 7); inked('#F3EAD2', 4); ctx.restore();
    const m2 = person(370, sy, 1.0, { coat: '#3F6A3A', hat: 'jester', hatColor: '#F2B92E', arms: [1.75, 1.45], armLen: 128, eyes: 'closed', mouth: 'puff', face: 1 });
    const m3 = person(880, sy, 1.0, { coat: '#6A3E24', hat: 'beret', hatColor: '#8A2B2B', arms: [1.3, 1.9 + Math.sin(t * 14) * .2], armLen: 120, eyes: 'happy', mouth: 'smile', face: -1 });
    lute(m3);
    ctx.restore();
    for (let i = 0; i < 4; i++) { const kk = (t * .6 + i / 4) % 1; ctx.save(); ctx.globalAlpha = Math.sin(kk * Math.PI); musicNote(300 + i * 160 + Math.sin(kk * 6) * 30, 1000 - kk * 200, .8, ['#FFD84A', '#FF7FB5', '#7FE0FF', '#9CFF9A'][i]); ctx.restore(); }
  }
  dancer(560, sy, 1.15, t, 0, { look: FRAU });
  dancer(700, sy, 1.0, t, 1.7, { look: { coat: DCOLS[1], hat: 'beret' } });
  for (let i = 0; i < 6; i++) dancer(120 + i * 170, 1820, 1.0, t, i * 1.1, { look: { coat: DCOLS[(i + 2) % 8], hat: ['bun', 'beret', 'longhair'][i % 3], dress: i % 2 === 0 } });
  if (t > cap(4, 0)) for (let i = 0; i < 5; i++) { const d = t - cap(4, 0) - i * .15; if (d > 0 && d < 1.4) coin(540 + (i - 2) * 80, 560 + d * 200, 30, t * 8 + i); }
  captions(CAPS[4], t);
}
/* 6 — desastre: agotamiento */
function scene6(t) {
  medievalTown(t, 300, { dusk: true });
  ctx.fillStyle = 'rgba(20,10,30,0.25)'; ctx.fillRect(0, 0, W, H);
  const fall = prog(t, cap(5, 1) - .3, cap(5, 1) + 1.2);
  const r = rng(4);
  for (let i = 0; i < 7; i++) {
    const x = 120 + i * 140, gy = 1640 + (i % 2) * 90, s = .95 + (i % 2) * .15;
    const look = { coat: DCOLS[i % 8], hat: ['bun', 'beret', 'longhair', 'hair'][i % 4], hatColor: '#6A3E24', dress: i % 2 === 0 };
    if (fall * 7 > i + .5 && i % 3 !== 1) lying(x + 60, gy, s, look);
    else dancer(x, gy, s, t * .6, i, { look, tired: true, energy: .4, speed: 5 });
  }
  if (t > cap(5, 4) - .2) {
    dim(t, cap(5, 4), .55);
    popIn(t, cap(5, 4), k => {
      ctx.save(); ctx.translate(540, 760); ctx.scale(k, k);
      for (const [dx, s] of [[-180, .8], [0, 1], [180, .8]]) {
        ctx.save(); ctx.translate(dx, 0); ctx.scale(s, s);
        ctx.beginPath(); ctx.moveTo(-70, 120); ctx.lineTo(-70, -40); ctx.arc(0, -40, 70, Math.PI, 0); ctx.lineTo(70, 120); ctx.closePath(); inked('#9A96A8', 6);
        ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, 30); ctx.moveTo(-30, -40); ctx.lineTo(30, -40); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    });
  }
  captions(CAPS[5], t);
}
/* 7 — el santuario en la montaña */
function scene7(t) {
  daySky(t, { dusk: true });
  // montañas
  const mts = [[-100, 1300, 520, 650, '#5A5A78'], [380, 1300, 1150, 900, '#4A4A66'], [-200, 1500, 700, 500, '#3E5A44'], [500, 1500, 1300, 560, '#355A40']];
  for (const [x1, y1, x2, h, c] of mts) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo((x1 + x2) / 2, y1 - h); ctx.lineTo(x2, y1); ctx.closePath(); inked(c, 6); }
  ctx.fillStyle = '#F3F3F8'; ctx.beginPath(); ctx.moveTo(765 - 80, 400 + 80); ctx.lineTo(765, 400); ctx.lineTo(765 + 80, 480); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2E4A34'; ctx.fillRect(0, 1500, W, H - 1500);
  // capilla en lo alto
  ctx.save(); ctx.translate(640, 820); ctx.scale(.42, .42); church(0, 0, t, { dusk: true }); ctx.restore();
  const lg = ctx.createRadialGradient(640, 600, 10, 640, 600, 300); lg.addColorStop(0, 'rgba(255,230,160,0.45)'); lg.addColorStop(1, 'rgba(255,230,160,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  // camino en zigzag
  ctx.strokeStyle = '#C9B48A'; ctx.lineWidth = 26; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const path = [[120, 1700], [700, 1560], [300, 1350], [760, 1150], [500, 960], [640, 830]];
  ctx.beginPath(); path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  // procesión subiendo
  const n = 7;
  for (let i = 0; i < n; i++) {
    const u = clamp(prog(t, .3, DURS[6]) * .9 - i * .07);
    if (u <= 0) continue;
    const seg = Math.min(path.length - 2, Math.floor(u * (path.length - 1))), f = u * (path.length - 1) - seg;
    const x = lerp(path[seg][0], path[seg + 1][0], f), y = lerp(path[seg][1], path[seg + 1][1], f);
    const s = lerp(.7, .25, u);
    const calm = t > cap(6, 5);
    person(x, y, s, { coat: DCOLS[i % 8], hat: ['bun', 'beret', 'longhair'][i % 3], hatColor: '#6A3E24', dress: i % 2 === 0, walk: t * 6 + i, bob: true, arms: calm ? [2.4, 2.4] : danceArms(t, i, 4), armLen: 120, eyes: 'closed', mouth: 'flat', face: path[seg + 1][0] > path[seg][0] ? 1 : -1 });
  }
  captions(CAPS[6], t);
}
/* 8 — histeria colectiva + pregunta */
function bread(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 110, 60, 0, 0, 7); inked('#D9A05A', 6);
  ctx.strokeStyle = '#8A5A24'; ctx.lineWidth = 6; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 45 - 20, -30); ctx.lineTo(i * 45 + 20, 10); ctx.stroke(); }
  ctx.restore();
}
function scene8(t) {
  medievalTown(t, 60, { dusk: true });
  dim(t, 0, .35);
  // cerebro con ondas
  popIn(t, cap(7, 1), k => {
    ctx.save(); ctx.translate(540, 600); ctx.scale(k, k);
    for (let i = 0; i < 3; i++) { const kk = (t * .8 + i / 3) % 1; ctx.strokeStyle = `rgba(255,216,74,${1 - kk})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 160 + kk * 160, 0, 7); ctx.stroke(); }
    ctx.fillStyle = '#F7A9C4';
    ctx.beginPath(); for (const [lx, ly, r] of [[-70, -10, 70], [-20, -55, 72], [45, -48, 70], [85, 8, 58], [40, 50, 62], [-35, 48, 62]]) { ctx.moveTo(lx + r, ly); ctx.arc(lx, ly, r, 0, 7); } ctx.fill();
    ctx.strokeStyle = '#B5517A'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    for (const [a, b, c, d, e, f] of [[-90, -10, -40, -40, -10, 0], [0, -80, 14, -30, 54, -40], [26, 14, 54, 40, 96, 14], [-54, 40, -14, 14, 0, 70]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(c, d, e, f); ctx.stroke(); }
    ctx.restore();
  }, cap(7, 4) - .3);
  popIn(t, cap(7, 2), k => { bread(250, 900, k); label('HAMBRE', 250, 1010, { size: 40 }); }, cap(7, 4) - .3);
  popIn(t, cap(7, 3), k => { ctx.save(); ctx.translate(830, 900); ctx.scale(k, k); ctx.beginPath(); ctx.moveTo(-70, 90); ctx.lineTo(-70, -20); ctx.arc(0, -20, 70, Math.PI, 0); ctx.lineTo(70, 90); for (let i = 0; i < 4; i++) ctx.lineTo(70 - i * 47 - 23, 70), ctx.lineTo(70 - (i + 1) * 47, 90); ctx.closePath(); inked('#F3F3F8', 6); face({ eyes: 'wide', mouth: 'o' }, 60, 1); ctx.restore(); label('MIEDO', 830, 1010, { size: 40 }); }, cap(7, 4) - .3);
  for (let i = 0; i < 5; i++) dancer(160 + i * 190, 1760, .95, t, i * 1.3, { look: { coat: DCOLS[i], hat: ['bun', 'beret', 'longhair'][i % 3], dress: i % 2 === 0 } });
  questionBox('¿Podría pasar', 'algo así hoy?', t, cap(7, 4));
  captions(CAPS[7], t);
}
startVideo([scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8]);
