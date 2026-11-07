/* La noche de los muertos vivientes (1968) — resumen animado, estilo cine antiguo en blanco y negro */
const BEN = { coat: '#2E2E36', hat: 'hair', hatColor: '#141418' };
const BARBRA = { coat: '#B8B4A8', dress: true, hat: 'longhair', hatColor: '#D8C8A0' };
const JOHNNY = { coat: '#4A4A52', hat: 'hair', hatColor: '#3A2A1A', glasses: true, tie: '#222' };
const ZCOLS = ['#5A5A5A', '#6A6458', '#4E5048', '#605A66'];

/* ---------- aspecto de película antigua ---------- */
const film = document.createElement('canvas'); film.width = W; film.height = H;
const fctx = film.getContext('2d');
function filmLook(t) {
  fctx.filter = 'grayscale(1) contrast(1.25) brightness(0.95)';
  fctx.clearRect(0, 0, W, H); fctx.drawImage(cv, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(film, 0, 0);
  // parpadeo
  const fl = .06 + .05 * Math.sin(t * 37) * Math.sin(t * 13);
  ctx.fillStyle = `rgba(0,0,0,${fl})`; ctx.fillRect(0, 0, W, H);
  // rayas y motas
  const r = rng(Math.floor(t * 24));
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
  for (let i = 0; i < 2; i++) if (r() > .5) { const x = r() * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (r() - .5) * 20, H); ctx.stroke(); }
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(r() * W, r() * H, 1 + r() * 4, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(r() * W, r() * H, 1 + r() * 3, 0, 7); ctx.fill(); }
  ctx.restore();
}
function scene(t, draw, si) { draw(); filmLook(t); captions(CAPS[si], t); }

/* ---------- piezas ---------- */
function zombie(x, gy, s, t, ph = 0, o = {}) {
  return person(x + (o.walk === false ? 0 : 0), gy, s, Object.assign({
    coat: ZCOLS[Math.abs(Math.floor(ph * 7)) % 4], hat: 'hair', hatColor: '#2A2A2A',
    arms: [1.4 + Math.sin(t * 2 + ph) * .12, 1.3 - Math.sin(t * 2 + ph) * .12], armLen: 140,
    walk: o.walk === false ? undefined : t * 2.2 + ph, bob: o.walk !== false, tilt: .22 + Math.sin(t * 1.5 + ph) * .06,
    eyes: 'wide', mouth: 'o', brows: 'angry', face: o.face || 1,
  }, o.look || {}));
}
function ground(gy, col = '#3A4A34') {
  ctx.fillStyle = col; ctx.fillRect(0, gy, W, H - gy);
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3;
  const r = rng(3); for (let i = 0; i < 120; i++) { const x = r() * W, y = gy + r() * (H - gy); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y - 14); ctx.stroke(); }
}
function deadTree(x, gy, s) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); ctx.strokeStyle = '#1E1A16'; ctx.lineCap = 'round';
  const br = (len, ang, w, d) => { if (d > 5) return; ctx.lineWidth = w; const ex = Math.cos(ang) * len, ey = Math.sin(ang) * len; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke(); ctx.save(); ctx.translate(ex, ey); br(len * .7, ang - .45, w * .65, d + 1); br(len * .66, ang + .4, w * .65, d + 1); ctx.restore(); };
  br(260, -Math.PI / 2, 26, 0); ctx.restore();
}
function grave(x, gy, s, txt) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-60, -120); ctx.arc(0, -120, 60, Math.PI, 0); ctx.lineTo(60, 0); ctx.closePath(); inked('#9A968C', 6);
  if (txt) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.font = `800 26px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(txt, 0, -110); ctx.fillRect(-30, -80, 60, 6); ctx.fillRect(-30, -60, 60, 6); }
  ctx.restore();
}
function farmhouse(x, gy, s, t, o = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  roundRect(-300, -520, 600, 520, 4); inked('#D8D2C4', 7);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 3; for (let y = -500; y < 0; y += 26) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(300, y); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-340, -520); ctx.lineTo(0, -760); ctx.lineTo(340, -520); ctx.closePath(); inked('#3A3A40', 7);
  ctx.fillStyle = '#4A4A50'; ctx.fillRect(160, -780, 50, 140); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(160, -780, 50, 140);
  // porche
  ctx.fillStyle = '#B8B2A4'; ctx.fillRect(-320, -210, 640, 24); ctx.strokeRect(-320, -210, 640, 24);
  for (const px of [-300, -100, 100, 300]) { ctx.fillStyle = '#E8E2D4'; ctx.fillRect(px - 10, -186, 20, 186); ctx.strokeRect(px - 10, -186, 20, 186); }
  // ventanas
  const wins = [[-220, -440], [100, -440], [-220, -170], [140, -170]];
  wins.forEach(([wx, wy], i) => {
    roundRect(wx, wy, 120, 140, 4); inked(o.lit ? '#F2E6B8' : '#1E2230', 5);
    if (o.lit) { const g = ctx.createRadialGradient(wx + 60, wy + 70, 10, wx + 60, wy + 70, 200); g.addColorStop(0, 'rgba(255,240,190,0.3)'); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.fillRect(wx - 140, wy - 130, 400, 400); }
    const b = o.boards ?? 0;
    for (let k = 0; k < 3; k++) if (b * 3 > k + i * .2) { ctx.save(); ctx.translate(wx + 60, wy + 30 + k * 40); ctx.rotate((k % 2 ? .25 : -.2)); roundRect(-80, -12, 160, 24, 3); inked('#8A6A44', 4); ctx.restore(); }
    if (o.face && i === o.face.win) { ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, 120, 140); ctx.clip(); person(wx + 60, wy + 330, .55, Object.assign({}, BEN, { arms: [.2, -.2], eyes: 'open', mouth: 'flat' })); ctx.restore(); }
  });
  // puerta
  roundRect(-40, -170, 90, 170, 4); inked('#2E2620', 5);
  if ((o.boards ?? 0) > .5) for (let k = 0; k < 3; k++) { ctx.save(); ctx.translate(5, -140 + k * 50); ctx.rotate(k % 2 ? .3 : -.3); roundRect(-70, -12, 140, 24, 3); inked('#8A6A44', 4); ctx.restore(); }
  ctx.restore();
}
function nightBase(t, o = {}) { nightSky(t, Object.assign({ top: '#05070F', bottom: '#2A2C3A', mx: 800, my: 230 }, o)); }
function radioBox(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(-220, -150, 440, 300, 40); inked('#6A4A30', 8);
  roundRect(-180, -110, 200, 220, 20); inked('#3A3A3A', 5);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-170, -80 + i * 34); ctx.lineTo(10, -80 + i * 34); ctx.stroke(); }
  for (const [dx, dy] of [[110, -50], [110, 50]]) { ctx.beginPath(); ctx.arc(dx, dy, 40, 0, 7); inked('#D8D2C4', 5); ctx.save(); ctx.translate(dx, dy); ctx.rotate(t); ctx.fillStyle = INK; ctx.fillRect(-4, -34, 8, 30); ctx.restore(); }
  ctx.restore();
  for (let i = 0; i < 3; i++) { const k = (t * .9 + i / 3) % 1; ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x + 240 * s, y, 40 + k * 140, -.6, .6); ctx.stroke(); ctx.restore(); }
}
function truck(x, gy, s, t) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  roundRect(-260, -170, 300, 120, 12); inked('#5A5A5A', 7);
  roundRect(40, -240, 200, 190, 20); inked('#6A6A6A', 7); roundRect(70, -215, 130, 80, 10); inked('#A8B8C8', 5);
  for (const wx of [-170, 150]) { ctx.beginPath(); ctx.arc(wx, -40, 50, 0, 7); inked('#1E1E1E', 7); ctx.beginPath(); ctx.arc(wx, -40, 20, 0, 7); inked('#9A9A9A', 4); }
  ctx.restore();
}
function gasPump(x, gy, s) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  roundRect(-50, -260, 100, 260, 14); inked('#B8B2A4', 6); ctx.beginPath(); ctx.arc(0, -290, 40, 0, 7); inked('#E8E2D4', 6);
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(50, -180); ctx.quadraticCurveTo(110, -100, 70, -40); ctx.stroke();
  ctx.restore();
}
function explosion(x, y, k, t) {
  if (k <= 0 || k >= 1.4) return;
  const R = 80 + k * 520, a = clamp(1.4 - k);
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 14; i++) { const ang = i / 14 * Math.PI * 2 + t, rr = R * (.6 + .4 * Math.sin(i * 3.1)); ctx.fillStyle = ['#FFF2B0', '#FFB23F', '#FF6B2F', '#8A8A8A'][i % 4]; ctx.beginPath(); ctx.arc(x + Math.cos(ang) * rr * .5, y + Math.sin(ang) * rr * .4, rr * .45, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x, y, R * .3, 0, 7); ctx.fill();
  ctx.restore();
}
function cellar(t) {
  ctx.fillStyle = '#2A2622'; ctx.fillRect(0, 0, W, H);
  for (let y = 0, row = 0; y < 1500; y += 60, row++) for (let x = (row % 2) * 70 - 70; x < W; x += 140) { roundRect(x + 4, y + 4, 132, 52, 4); ctx.fillStyle = `rgba(${120 + (x * 7 + y) % 30},${90 + (x + y * 3) % 20},70,0.55)`; ctx.fill(); }
  const sw = Math.sin(t * 1.2) * .08;
  ctx.save(); ctx.translate(540, 120); ctx.rotate(sw); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 200); ctx.stroke();
  ctx.fillStyle = '#FFF6D0'; ctx.shadowColor = '#FFF6D0'; ctx.shadowBlur = 60; ctx.beginPath(); ctx.arc(0, 220, 26, 0, 7); ctx.fill(); ctx.restore();
  const lg = ctx.createRadialGradient(540, 360, 40, 540, 360, 900); lg.addColorStop(0, 'rgba(255,240,200,0.3)'); lg.addColorStop(1, 'rgba(0,0,0,0.5)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  // escalera
  ctx.fillStyle = '#4A3A2A'; for (let i = 0; i < 8; i++) { ctx.fillRect(820 - i * 50, 1500 - i * 90, 220, 20); }
  ctx.fillStyle = '#1E1A16'; ctx.fillRect(0, 1500, W, H - 1500);
}

/* 1 — 1968: el origen de los zombis modernos */
function s1(t) { scene(t, () => {
  nightBase(t); ground(1500);
  farmhouse(540, 1500, 1.15, t, { lit: true });
  fog(t, 1480, .3);
  for (let i = 0; i < 5; i++) zombie(-100 + ((t * 40 + i * 260) % 1300), 1720 + (i % 2) * 60, .9 + (i % 2) * .15, t, i);
  parchment([['1968', 110, FONT]], 540, 360, 380, 190, t, .3, { write: .6, tOut: cap(0, 1) - .2 });
  stamp('ZOMBIS MODERNOS', 540, 420, t, cap(0, 3), { size: 70, color: '#B3261E', tOut: cap(0, 4) - .3 });
}, 0); }
/* 2 — el cementerio: "vienen por ti, Barbra" */
function s2(t) { scene(t, () => {
  daySky(t, { dusk: true }); ground(1450, '#4A5A44');
  deadTree(860, 1450, 1.3);
  [[150, .9, ''], [330, .7, ''], [700, 1.1, 'R.I.P.']].forEach(([x, s, tx]) => grave(x, 1460, s, tx));
  person(340, 1720, 1.25, Object.assign({}, BARBRA, { arms: t > cap(1, 4) ? [2.6, 2.5] : [.2, -.2], armLen: 120, eyes: t > cap(1, 4) ? 'wide' : 'open', mouth: t > cap(1, 4) ? 'o' : 'flat', face: 1 }));
  person(620, 1720, 1.3, Object.assign({}, JOHNNY, { arms: t > cap(1, 3) ? [1.8, 1.6] : [.2, -.2], armLen: 130, eyes: 'happy', mouth: 'grin', face: -1 }));
  if (t > cap(1, 4)) sfxText('¡buuu!', 760, 1000, t, cap(1, 4), { size: 80, color: '#FFFFFF', dur: 1.2 });
}, 1); }
/* 3 — el ataque y la huida */
function s3(t) { scene(t, () => {
  daySky(t, { dusk: true }); ground(1450, '#4A5A44'); deadTree(160, 1450, 1.1);
  const atk = cap(2, 1), fall = cap(2, 2), run = cap(2, 3);
  if (t < run) {
    grave(800, 1460, 1.0, '');
    zombie(lerp(980, 700, prog(t, 0, atk + .4)), 1720, 1.35, t, 1, { face: -1, look: { coat: '#3A3A3A', tie: '#111' } });
    if (t < fall) person(540, 1720, 1.3, Object.assign({}, JOHNNY, { arms: [1.8, 1.8], armLen: 130, eyes: 'wide', mouth: 'o', face: 1, tilt: Math.sin(t * 20) * .05 }));
    else { ctx.save(); ctx.translate(500, 1720); ctx.rotate(-Math.PI / 2 * easeOut(prog(t, fall, fall + .3))); person(0, 0, 1.3, Object.assign({}, JOHNNY, { arms: [1.2, -.6], eyes: 'closed', mouth: 'flat' })); ctx.restore(); }
    person(260, 1720, 1.2, Object.assign({}, BARBRA, { arms: [2.6, 2.5], armLen: 120, eyes: 'wide', mouth: 'o', face: 1 }));
  } else {
    nightBase(t); ground(1500);
    farmhouse(760, 1500, .8, t, {});
    const k = prog(t, run, run + 2.5);
    person(lerp(80, 560, k), 1720, 1.2, Object.assign({}, BARBRA, { walk: t * 12, bob: true, arms: [Math.sin(t * 12) * .9, -Math.sin(t * 12) * .9], armLen: 120, eyes: 'wide', mouth: 'o', face: 1 }));
  }
}, 2); }
/* 4 — Ben y las tablas */
function s4(t) { scene(t, () => {
  nightBase(t); ground(1500);
  farmhouse(540, 1500, 1.1, t, { lit: true, boards: prog(t, cap(3, 1), cap(3, 2) + .8) });
  const ben = person(300, 1760, 1.35, Object.assign({}, BEN, { arms: t > cap(3, 1) ? [2.3 + Math.sin(t * 14) * .3, .3] : [.3, -.2], armLen: 140, eyes: 'open', mouth: 'flat', brows: 'angry', face: 1 }));
  if (t > cap(3, 1)) sfxText('¡TOC TOC!', 700, 1040, t, cap(3, 1) + .3, { size: 70, color: '#FFFFFF', dur: 2 });
  popIn(t, cap(3, 0), k => { ctx.save(); ctx.translate(300, 960); ctx.scale(k, k); label('Ben', 0, 0, { size: 48 }); ctx.restore(); }, cap(3, 2));
  const n = t > cap(3, 3) ? Math.floor(prog(t, cap(3, 3), cap(3, 5) + .5) * 6) : 1;
  for (let i = 0; i < n; i++) zombie(1100 - ((t * 30 + i * 140) % 500), 1800 + (i % 2) * 40, .8, t, i, { face: -1 });
}, 3); }
/* 5 — los escondidos del sótano */
function s5(t) { scene(t, () => {
  cellar(t);
  const ppl = [[160, .95, { coat: '#4A4A52', hat: 'hair', hatColor: '#222', mustache: true }], [320, .9, { coat: '#6A6A6A', dress: true, hat: 'bun', hatColor: '#3A3A3A' }], [460, .6, { coat: '#9A9A9A', dress: true, hat: 'longhair', hatColor: '#4A3A2A' }], [700, .95, { coat: '#5A5A60', hat: 'hair', hatColor: '#3A2A1A' }], [860, .9, { coat: '#AAA49A', dress: true, hat: 'longhair', hatColor: '#C8B890' }]];
  ppl.forEach(([x, s, o], i) => popIn(t, cap(4, 1) + i * .15, k => person(x, 1720, s * 1.25 * k, Object.assign({}, o, { arms: [.2, -.2], eyes: i === 2 ? 'sleepy' : 'wide', mouth: i === 2 ? 'wavy' : 'o', face: 1 }))));
  bigNumber('5', 540, 700, 220, t, cap(4, 1) + .2, { color: '#FFFFFF', tOut: cap(4, 2) });
  if (t > cap(4, 3) - .1) { popIn(t, cap(4, 3), k => { ctx.save(); ctx.translate(460, 1060); ctx.scale(k, k); label('MORDIDA', 0, 0, { size: 44, bg: '#E3352B', fg: '#fff' }); ctx.restore(); }); }
}, 4); }
/* 6 — la radio: vuelven a la vida, golpe en la cabeza */
function s6(t) { scene(t, () => {
  ctx.fillStyle = '#3A3430'; ctx.fillRect(0, 0, W, H);
  const lg = ctx.createRadialGradient(540, 800, 40, 540, 800, 800); lg.addColorStop(0, 'rgba(255,240,200,0.35)'); lg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  roundRect(120, 1080, 840, 60, 8); inked('#6A4A30', 6);
  radioBox(480, 920, 1.1, t);
  if (t > cap(5, 3) - .2) { dim(t, cap(5, 3), .55); popIn(t, cap(5, 3), k => { ctx.save(); ctx.translate(540, 520); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); inked('#E8E2D4', 7); face({ eyes: 'wide', mouth: 'o', brows: 'angry' }, 150, 1); ctx.lineWidth = 16; ctx.strokeStyle = '#B3261E'; ctx.beginPath(); ctx.arc(0, 0, 190, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-230, 0); ctx.lineTo(230, 0); ctx.moveTo(0, -230); ctx.lineTo(0, 230); ctx.stroke(); ctx.restore(); }); }
}, 5); }
/* 7 — la camioneta explota */
function s7(t) { scene(t, () => {
  nightBase(t); ground(1500);
  farmhouse(160, 1500, .55, t, { lit: true, boards: 1 });
  gasPump(820, 1520, 1.1);
  const boom = cap(6, 1) - .2;
  if (t < boom + .1) truck(lerp(400, 640, prog(t, 0, boom)), 1640, 1.0, t);
  else { ctx.save(); ctx.globalAlpha = .7; ctx.fillStyle = '#1E1E1E'; ctx.fillRect(420, 1460, 420, 120); ctx.restore(); }
  explosion(640, 1450, prog(t, boom, boom + 1.5) * 1.4, t);
  if (t > boom) sfxText('¡BOOM!', 540, 900, t, boom, { size: 140, color: '#FFFFFF', dur: 1.5 });
  for (let i = 0; i < 4; i++) zombie(-80 + ((t * 30 + i * 300) % 1200), 1820, .85, t, i);
}, 6); }
/* 8 — la niña se convierte; Barbra arrastrada por su hermano */
function s8(t) { scene(t, () => {
  if (t < cap(7, 3) - .2) {
    cellar(t); dim(t, 0, .25);
    const turned = t > cap(7, 2) + .4;
    person(540, 1760, 1.3, { coat: '#B8B8B8', dress: true, hat: 'longhair', hatColor: '#4A3A2A', arms: turned ? [1.45, 1.35] : [.2, -.2], armLen: 120, eyes: turned ? 'wide' : 'closed', mouth: turned ? 'o' : 'flat', brows: turned ? 'angry' : null, face: 1, tilt: turned ? .25 : 0 });
    if (turned) sfxText('!', 700, 1100, t, cap(7, 2) + .4, { size: 160, color: '#FF5A4F', dur: 1.5 });
  } else {
    nightBase(t); ground(1500); farmhouse(540, 1500, 1.0, t, { lit: true, boards: 1 });
    const k = easeIn(prog(t, cap(7, 4), DURS[7]));
    const bx = lerp(560, 1000, k);
    const j = zombie(bx + 160, 1760, 1.3, t, 2, { face: 1, walk: false, look: Object.assign({}, JOHNNY, { arms: [-1.4, -1.3] }) });
    person(bx, 1760, 1.2, Object.assign({}, BARBRA, { arms: [2.2, 1.9], armLen: 120, eyes: 'wide', mouth: 'o', face: -1, tilt: .3 }));
    popIn(t, cap(7, 5), kk => { ctx.save(); ctx.translate(bx + 160, 1040); ctx.scale(kk, kk); label('Johnny', 0, 0, { size: 44 }); ctx.restore(); });
  }
}, 7); }
/* 9 — Ben solo en el sótano */
function s9(t) { scene(t, () => {
  cellar(t);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H);
  person(540, 1720, 1.4, Object.assign({}, BEN, { arms: [.4, -.4], eyes: t > cap(8, 2) ? 'sleepy' : 'open', mouth: 'flat', face: 1 }));
  for (let i = 0; i < 4; i++) { const k = (t * .6 + i / 4) % 1; ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI) * .7; ctx.fillStyle = '#fff'; ctx.font = `900 60px ${FONT}`; ctx.fillText('¡bam!', 100 + i * 240, 400 - k * 100); ctx.restore(); }
}, 8); }
/* 10 — amanecer: llegan los hombres armados */
function benAtWindow(t, alpha = 1) {
  const x = 760 + (-220 + 60) * .9, y = 1500 + (-170 + 60) * .9;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = '#F2E6B8'; ctx.fillRect(x - 54, y - 63, 108, 126);
  ctx.beginPath(); ctx.arc(x, y + 10, 34, 0, 7); inked('#FFFFFF', 4); ctx.save(); ctx.translate(x, y + 10); ctx.scale(.5, .5); face({ eyes: 'open', mouth: 'flat' }, 64, 1); ctx.restore();
  ctx.beginPath(); ctx.arc(x, y - 6, 36, Math.PI, 0); ctx.fillStyle = '#141418'; ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 90 + Math.sin(t * 6) * 6, 0, 7); ctx.stroke();
  ctx.restore();
}
function rifleman(x, gy, s, t, i) {
  const p = person(x, gy, s, { coat: ['#4A4A3A', '#5A5040', '#3A4040'][i % 3], hat: 'cap', hatColor: '#2A2A2A', arms: [1.65, 1.45], armLen: 130, eyes: 'open', mouth: 'flat', brows: 'angry', face: 1, walk: t * 4 + i, bob: true });
  ctx.save(); ctx.strokeStyle = INK; ctx.lineWidth = 12 * s; ctx.lineCap = 'round'; const h = p.hands[0]; ctx.beginPath(); ctx.moveTo(h.x - 80 * s, h.y + 20 * s); ctx.lineTo(h.x + 140 * s, h.y - 10 * s); ctx.stroke(); ctx.restore();
}
function s10(t) { scene(t, () => {
  daySky(t, { dusk: true }); ground(1500, '#5A6A50');
  farmhouse(760, 1500, .9, t, { boards: 1 });
  if (t > cap(9, 3)) benAtWindow(t, prog(t, cap(9, 3), cap(9, 3) + .4));
  for (let i = 0; i < 4; i++) rifleman(lerp(-200, 40 + i * 90, prog(t, 0, cap(9, 2))), 1720 + (i % 2) * 50, .9, t, i);
  
}, 9); }
/* 11 — lo confunden con un zombi */
function s11(t) { scene(t, () => {
  daySky(t, { dusk: true }); ground(1500, '#5A6A50');
  const shot = cap(10, 2);
  farmhouse(760, 1500, .9, t, { boards: 1 });
  if (t < shot) benAtWindow(t);
  for (let i = 0; i < 4; i++) rifleman(40 + i * 90, 1720 + (i % 2) * 50, .9, t, i);
  popIn(t, cap(10, 1) - .1, k => { ctx.save(); ctx.translate(320, 1000); ctx.scale(k, k); label('¿un zombi?', 0, 0, { size: 46 }); ctx.restore(); }, shot - .2);
  if (t > shot && t < shot + .12) { ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(0, 0, W, H); }
  if (t > shot) sfxText('¡BANG!', 640, 900, t, shot, { size: 150, color: '#FFFFFF', dur: 1.2 });
  if (t > cap(10, 4)) { dim(t, cap(10, 4), .6); stamp('POR ERROR', 540, 700, t, cap(10, 4) + .2, { size: 100 }); }
}, 10); }
/* 12 — pregunta */
function s12(t) { scene(t, () => {
  nightBase(t, { dusk: true }); ground(1500);
  farmhouse(540, 1500, 1.0, t, { boards: 1 });
  fog(t, 1480, .35);
  questionBox('¿El final más', 'injusto del cine?', t, cap(11, 0) + .2, { y: 560 });
}, 11); }
startVideo([s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12], 3.2);
