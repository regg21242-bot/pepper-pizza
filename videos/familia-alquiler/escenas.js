/* En Japón puedes alquilar a un papá — escenas */
const DAD = { coat: '#2E3440', tie: '#2F7BE0', hat: 'hair', hatColor: '#1C1C22', glasses: false };
const ISHII = { coat: '#1E1E28', tie: '#8A2B2B', hat: 'hair', hatColor: '#1C1C22' };
const GIRL = { coat: '#FF7FB5', dress: true, hat: 'longhair', hatColor: '#1C1C22' };
const MOM = { coat: '#7A3FA0', dress: true, hat: 'bun', hatColor: '#1C1C22' };

function nameTag(x, y, text, col = '#FFD84A', s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-.06);
  roundRect(-80, -26, 160, 52, 8); inked(col, 4);
  ctx.fillStyle = INK; ctx.font = `900 30px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2);
  ctx.restore();
}
function tokyoDay(t) {
  const g = ctx.createLinearGradient(0, 0, 0, 1500); g.addColorStop(0, '#7EC3EE'); g.addColorStop(1, '#D8EEF8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = rng(12);
  for (let i = -1; i < 9; i++) { const w = 130 + r() * 90, h = 500 + r() * 500, x = i * 140; ctx.fillStyle = ['#B8C4D4', '#A8B4C8', '#C8D0DC'][i % 3 < 0 ? 0 : i % 3]; ctx.fillRect(x, 1500 - h, w, h); ctx.fillStyle = 'rgba(255,255,255,0.45)'; for (let yy = 1500 - h + 30; yy < 1470; yy += 50) for (let xx = x + 14; xx < x + w - 20; xx += 34) ctx.fillRect(xx, yy, 20, 30); }
}
function japRoom(t, o = {}) {
  ctx.fillStyle = '#EFE3C8'; ctx.fillRect(0, 0, W, H);
  // shoji
  roundRect(560, 260, 440, 620, 4); inked('#F8F3E6', 7);
  ctx.strokeStyle = '#8A5A34'; ctx.lineWidth = 6;
  for (let x = 560; x <= 1000; x += 88) { ctx.beginPath(); ctx.moveTo(x, 260); ctx.lineTo(x, 880); ctx.stroke(); }
  for (let y = 260; y <= 880; y += 104) { ctx.beginPath(); ctx.moveTo(560, y); ctx.lineTo(1000, y); ctx.stroke(); }
  const lg = ctx.createRadialGradient(780, 560, 20, 780, 560, 520); lg.addColorStop(0, 'rgba(255,240,200,0.4)'); lg.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  // cuadro y planta
  roundRect(120, 360, 280, 200, 6); inked('#F3EAD2', 6); ctx.beginPath(); ctx.arc(260, 460, 50, 0, 7); inked('#E3352B', 4);
  // tatami
  ctx.fillStyle = '#C9C08A'; ctx.fillRect(0, 1450, W, H - 1450);
  ctx.strokeStyle = '#5A6A34'; ctx.lineWidth = 8; for (let x = 0; x < W; x += 360) { ctx.strokeRect(x, 1450, 360, 240); ctx.strokeRect(x - 180, 1690, 360, 240); }
  ctx.strokeStyle = 'rgba(90,100,50,0.25)'; ctx.lineWidth = 2; for (let y = 1460; y < H; y += 12) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.fillStyle = '#B98A54'; ctx.fillRect(0, 1430, W, 24); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-5, 1430, W + 10, 24);
}
function hearts(x, y, t, n = 4) {
  for (let i = 0; i < n; i++) { const k = (t * .7 + i / n) % 1; ctx.save(); ctx.globalAlpha = Math.sin(k * Math.PI); ctx.translate(x + Math.sin(k * 6 + i) * 40, y - k * 200); ctx.scale(.8, .8); ctx.beginPath(); ctx.moveTo(0, 20); ctx.bezierCurveTo(-40, -10, -20, -40, 0, -20); ctx.bezierCurveTo(20, -40, 40, -10, 0, 20); inked('#FF5A7A', 4); ctx.restore(); }
}

/* 1 — alquilar a un papá */
function scene1(t) {
  tokyoSky(t); farCity(0, t);
  const gy = 1600;
  signBuilding(-120, gy, 320, 1250, 1, t); signBuilding(880, gy, 320, 1300, 2, t);
  asphalt(gy, 0, t); wires(t);
  const d = person(420, gy + 120, 1.35, Object.assign({}, DAD, { arms: [.2, .9], armLen: 140, eyes: 'happy', mouth: 'smile', face: 1 }));
  person(640, gy + 120, .85, Object.assign({}, GIRL, { arms: [-.9, .2], armLen: 130, eyes: 'happy', mouth: 'smile', face: -1 }));
  hearts(540, 900, t, 3);
  popIn(t, cap(0, 0) + .9, k => nameTag(420, gy + 120 - 380, 'ALQUILADO', '#FFD84A', k));
  popIn(t, cap(0, 1), k => priceTag(780, 560, '¥¥¥', t, k));
  stamp('ES REAL', 540, 760, t, cap(0, 2) + .1, { size: 100, color: '#1F9D55' });
  captions(CAPS[0], t);
}
/* 2 — catálogo: padre, pareja, amigo, familia */
function card(x, y, s, title, draw, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(-200, -260, 400, 520, 30); inked('#FFF6DC', 7);
  roundRect(-170, -230, 340, 360, 20); inked(col, 5);
  ctx.save(); ctx.beginPath(); roundRect(-170, -230, 340, 360, 20); ctx.clip(); draw(); ctx.restore();
  ctx.fillStyle = INK; ctx.font = `900 50px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(title, 0, 190);
  ctx.restore();
}
function scene2(t) {
  ctx.fillStyle = '#1E1A3A'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 20; i++) { ctx.beginPath(); ctx.arc((i * 173) % W, (i * 311) % H, 80, 0, 7); ctx.fill(); }
  neonText('レンタル家族', 540, 230, 90, '#FF7FB5', { jp: true });
  popIn(t, cap(1, 1), k => { ctx.save(); ctx.translate(540, 360); ctx.scale(k, k); label('ACTORES', 0, 0, { size: 46, bg: '#FFD84A' }); ctx.restore(); });
  const items = [
    ['Padre', '#BFE3FF', () => person(0, 120, .58, Object.assign({}, DAD, { arms: [.2, -.2], eyes: 'happy', mouth: 'smile' }))],
    ['Pareja', '#FFD0E0', () => { person(-60, 120, .5, Object.assign({}, GIRL, { coat: '#E3352B', arms: [-.9, .2], eyes: 'happy', mouth: 'smile', face: -1 })); person(60, 120, .55, Object.assign({}, DAD, { arms: [.9, -.2], eyes: 'happy', mouth: 'smile' })); }],
    ['Amigo', '#D8F5C8', () => person(0, 120, .58, { coat: '#3FAE5A', hat: 'hair', hatColor: '#6A3E24', arms: [2.5, -.2], eyes: 'happy', mouth: 'grin' })],
    ['¡Familia!', '#FFF0B0', () => { [[-100, .5, MOM], [0, .56, DAD], [100, .4, GIRL]].forEach(([x, s, o]) => person(x, 120, s, Object.assign({}, o, { arms: [.2, -.2], eyes: 'happy', mouth: 'smile' }))); }],
  ];
  items.forEach(([title, col, draw], i) => {
    popIn(t, cap(1, 2 + i), k => card(i % 2 ? 790 : 290, i < 2 ? 760 : 1360, .95 * k, title, draw, col));
  });
  captions(CAPS[1], t);
}
/* 3 — Family Romance y Yuichi Ishii */
function scene3(t) {
  tokyoDay(t);
  // edificio de oficinas
  roundRect(120, 380, 840, 1240, 8); inked('#E9ECF2', 7);
  for (let y = 460; y < 1350; y += 120) for (let x = 170; x < 900; x += 130) { roundRect(x, y, 100, 80, 4); inked('#9CC8E8', 4); }
  roundRect(240, 300, 600, 130, 14); inked('#1E1A3A', 7);
  neonText('Family Romance', 540, 368, 64, '#FF7FB5', {});
  roundRect(400, 1380, 280, 240, 6); inked('#B8DDF2', 6);
  ctx.fillStyle = '#7A7A84'; ctx.fillRect(0, 1600, W, H - 1600); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 1600); ctx.lineTo(W, 1600); ctx.stroke();
  const p = person(540, 1760, 1.4, Object.assign({}, ISHII, { arms: [2.2, -.2], armLen: 140, eyes: 'happy', mouth: 'smile', face: 1 }));
  popIn(t, cap(2, 3), k => { ctx.save(); ctx.translate(540, 1000); ctx.scale(k, k); label('Yuichi Ishii', 0, 0, { size: 54 }); ctx.restore(); });
  bigNumber('2009', 820, 640, 140, t, cap(2, 4), { color: '#FFD84A' });
  captions(CAPS[2], t);
}
/* 4 — para qué: boda, novio, evento */
function scene4(t) {
  const b1 = cap(3, 1), b2 = cap(3, 3), b3 = cap(3, 5);
  if (t < b2 - .2) { // boda con invitados de alquiler
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#FFF3E6'); g.addColorStop(1, '#F2D8C0'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) { const x = 60 + i * 120; ctx.beginPath(); ctx.arc(x, 200, 60, 0, Math.PI); ctx.strokeStyle = '#E2B33C'; ctx.lineWidth = 6; ctx.stroke(); ctx.beginPath(); ctx.arc(x, 260, 14, 0, 7); inked('#FFFFFF', 3); }
    ctx.fillStyle = '#E8C8A8'; ctx.fillRect(0, 1450, W, H - 1450);
    person(420, 1500, 1.15, Object.assign({}, DAD, { coat: '#1E1E28', arms: [.6, -.2], eyes: 'happy', mouth: 'smile', face: 1 }));
    person(600, 1500, 1.15, { coat: '#FFFFFF', dress: true, hat: 'bun', hatColor: '#1C1C22', arms: [-.6, .2], eyes: 'happy', mouth: 'smile', face: -1 });
    const nG = Math.floor(prog(t, b1, b1 + 1.4) * 6);
    for (let i = 0; i < 6; i++) {
      const x = 90 + i * 180, y = 1820;
      const rented = i < nG;
      if (i < 2 || rented) {
        person(x, y, .95, { coat: ['#2E3440', '#7A3FA0', '#2F7BE0', '#3FAE5A', '#8A2B2B', '#E07A2F'][i], hat: i % 2 ? 'bun' : 'hair', hatColor: '#1C1C22', dress: i % 2 === 1, arms: [2.4 + Math.sin(t * 8 + i) * .2, -.2], armLen: 120, eyes: 'happy', mouth: 'smile', face: -1 });
        if (rented && i >= 2) nameTag(x, y - 330, 'ACTOR', '#FFD84A', .8);
      }
    }
    hearts(510, 900, t, 3);
  } else if (t < b3 - .2) { // presentar novio a los padres
    japRoom(t);
    roundRect(260, 1380, 560, 70, 10); inked('#6A3E24', 6);
    person(250, 1600, 1.1, { coat: '#5A4A3A', hat: 'hair', hatColor: '#8A8A90', glasses: true, arms: [.4, -.2], eyes: 'open', mouth: 'flat', face: 1 });
    person(390, 1600, 1.0, { coat: '#6A3E5A', dress: true, hat: 'bun', hatColor: '#8A8A90', arms: [.4, -.2], eyes: 'open', mouth: 'smile', face: 1 });
    person(700, 1600, 1.1, Object.assign({}, DAD, { coat: '#3A4A6A', arms: [1.2, -.2], eyes: 'happy', mouth: 'grin', face: -1 }));
    person(860, 1600, 1.0, Object.assign({}, GIRL, { coat: '#E3352B', arms: [-.6, .2], eyes: 'happy', mouth: 'smile', face: -1 }));
    nameTag(700, 1600 - 420, 'NOVIO ALQUILADO', '#FFD84A', .9);
    if (t > b2 + .8) sfxText('¡qué buen chico!', 320, 980, t, b2 + .8, { size: 56, color: '#FFFFFF', dur: 1.6 });
  } else { // no ir solo a un evento
    tokyoSky(t); farCity(300, t); signBuilding(-120, 1600, 320, 1250, 3, t); signBuilding(880, 1600, 320, 1300, 4, t); asphalt(1600, 300, t);
    const k = prog(t, b3 + .3, b3 + 1.2);
    person(540, 1720, 1.3, { coat: '#3FAE5A', hat: 'hair', hatColor: '#1C1C22', arms: k > 0 ? [2.5, 2.5] : [.1, -.1], armLen: 130, eyes: k > 0 ? 'happy' : 'sleepy', mouth: k > 0 ? 'grin' : 'frown', face: 1 });
    if (k > 0) for (const [x, i] of [[280, 0], [800, 1]]) { person(x, 1720, 1.2 * easeBack(k), { coat: i ? '#2F7BE0' : '#E07A2F', hat: i ? 'bun' : 'hair', hatColor: '#1C1C22', dress: !!i, arms: [2.4, -.2], armLen: 130, eyes: 'happy', mouth: 'grin', face: i ? -1 : 1 }); nameTag(x, 1720 - 400, 'AMIGO', '#9CFF9A', .8 * k); }
  }
  captions(CAPS[3], t);
}
/* 5 — madres que contratan un papá */
function scene5(t) {
  japRoom(t);
  const arrive = cap(4, 3);
  person(250, 1640, 1.25, Object.assign({}, MOM, { arms: t < cap(4, 2) ? [2.7, -.2] : [.6, -.2], armLen: 112, eyes: 'open', mouth: 'flat', face: 1 }));
  if (t < cap(4, 2)) { ctx.save(); ctx.translate(250 + 74, 1640 - 470); roundRect(-16, -34, 32, 68, 6); inked('#2B2D3A', 4); ctx.restore(); sfxText('ring!', 420, 1000, t, cap(4, 1), { size: 60, color: '#FFFFFF', dur: .9 }); }
  person(460, 1640, .85, Object.assign({}, GIRL, { arms: t > arrive ? [2.4, 2.4] : [.2, -.2], armLen: 120, eyes: t > arrive ? 'happy' : 'open', mouth: t > arrive ? 'grin' : 'flat', face: 1 }));
  const k = easeOut(prog(t, arrive - .6, arrive + .3));
  if (k > 0) {
    // puerta corrediza que se abre
    person(lerp(1200, 800, k), 1640, 1.35, Object.assign({}, DAD, { arms: [2.4, -.2], armLen: 140, eyes: 'happy', mouth: 'smile', face: -1, walk: k < 1 ? t * 7 : undefined, bob: k < 1 }));
    if (t > arrive + .2) { hearts(620, 980, t, 3); popIn(t, arrive + .3, kk => nameTag(800, 1640 - 420, 'ACTOR', '#FFD84A', kk)); }
  }
  captions(CAPS[4], t);
}
/* 6 — la película de Werner Herzog */
function clapper(x, y, s, t, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(-160, -40, 320, 200, 10); inked('#1E1E24', 6);
  ctx.fillStyle = '#fff'; ctx.font = `800 28px ${FONT}`; ctx.textAlign = 'left'; ctx.fillText('ESCENA 1', -130, 30); ctx.fillText('TOMA 1', -130, 80);
  ctx.save(); ctx.translate(-160, -40); ctx.rotate(-.5 * (1 - k));
  roundRect(0, -50, 320, 50, 6); inked('#F3F3F3', 6);
  ctx.save(); ctx.beginPath(); ctx.rect(0, -50, 320, 50); ctx.clip(); ctx.fillStyle = INK; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(i * 64, -50); ctx.lineTo(i * 64 + 32, -50); ctx.lineTo(i * 64 + 2, 0); ctx.lineTo(i * 64 - 30, 0); ctx.closePath(); ctx.fill(); } ctx.restore();
  ctx.restore(); ctx.restore();
}
function scene6(t) {
  // sala de cine
  ctx.fillStyle = '#140E1E'; ctx.fillRect(0, 0, W, H);
  const sc = { x: 90, y: 260, w: 900, h: 640 };
  const sg = ctx.createLinearGradient(0, sc.y, 0, sc.y + sc.h); sg.addColorStop(0, '#2B2350'); sg.addColorStop(1, '#5A2350');
  roundRect(sc.x, sc.y, sc.w, sc.h, 10); inked(sg, 8);
  ctx.save(); ctx.beginPath(); ctx.rect(sc.x, sc.y, sc.w, sc.h); ctx.clip();
  ctx.translate(0, -20);
  if (t > cap(5, 3) - .2) { person(420, 880, 1.1, Object.assign({}, DAD, { arms: [.2, .9], armLen: 140, eyes: 'happy', mouth: 'smile', face: 1 })); person(600, 880, .7, Object.assign({}, GIRL, { arms: [-.9, .2], eyes: 'happy', mouth: 'smile', face: -1 })); }
  ctx.restore();
  const beam = ctx.createLinearGradient(540, 1900, 540, 600); beam.addColorStop(0, 'rgba(255,250,220,0.25)'); beam.addColorStop(1, 'rgba(255,250,220,0)');
  ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(500, 1920); ctx.lineTo(580, 1920); ctx.lineTo(990, 260); ctx.lineTo(90, 260); ctx.closePath(); ctx.fill();
  // butacas
  for (let row = 0; row < 3; row++) for (let i = 0; i < 7; i++) { const x = 60 + i * 150 + (row % 2) * 70, y = 1500 + row * 150; roundRect(x, y, 120, 140, 30); inked('#8A1E2B', 5); }
  if (t < cap(5, 3) - .2) popIn(t, cap(5, 2), k => clapper(540, 560, 1.2 * k, t, prog(t, cap(5, 2) + .3, cap(5, 2) + .5)));
  popIn(t, .3, k => { ctx.save(); ctx.translate(540, 1000); ctx.scale(k, k); label('Werner Herzog', 0, 0, { size: 50 }); ctx.restore(); }, cap(5, 2) - .2);
  popIn(t, cap(5, 2), k => { ctx.save(); ctx.translate(540, 1000); ctx.scale(k, k); label('"Family Romance, LLC" (2019)', 0, 0, { size: 40, bg: '#FFD84A' }); ctx.restore(); });
  bigNumber('12 AÑOS', 300, 440, 70, t, cap(5, 3), { color: '#FF7FB5', tOut: cap(5, 4) - .2 });
  captions(CAPS[5], t);
}
/* 7 — el sueño de Ishii */
function scene7(t) {
  tokyoDay(t);
  ctx.fillStyle = '#7A7A84'; ctx.fillRect(0, 1600, W, H - 1600); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 1600); ctx.lineTo(W, 1600); ctx.stroke();
  const p = person(330, 1760, 1.4, Object.assign({}, ISHII, { arms: [.2, -.2], eyes: t > cap(6, 3) ? 'happy' : 'open', mouth: 'smile', face: 1 }));
  // burbuja de pensamiento
  popIn(t, cap(6, 1), k => {
    ctx.save(); ctx.translate(640, 640); ctx.scale(k, k);
    for (const [x, y, r] of [[-260, 300, 20], [-220, 240, 30]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); inked('#FFFFFF', 5); }
    ctx.beginPath(); ctx.ellipse(0, 0, 340, 230, 0, 0, 7); inked('#FFFFFF', 7);
    // familia real unida
    [[-130, .7, MOM], [0, .8, { coat: '#3A4A6A', hat: 'hair', hatColor: '#1C1C22' }], [120, .55, GIRL]].forEach(([x, s, o]) => person(x, 170, s, Object.assign({}, o, { arms: [.9, -.9], eyes: 'happy', mouth: 'smile' })));
    hearts(0, -60, t, 3);
    ctx.restore();
  });
  // cartel "sin clientes" feliz
  popIn(t, cap(6, 3), k => {
    ctx.save(); ctx.translate(800, 1080); ctx.scale(k, k); ctx.rotate(Math.sin(t * 3) * .05);
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-60, -100); ctx.lineTo(0, -160); ctx.lineTo(60, -100); ctx.stroke();
    roundRect(-170, -100, 340, 160, 14); inked('#FFF6DC', 6);
    ctx.fillStyle = '#1F9D55'; ctx.font = `900 46px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('0 CLIENTES', 0, -40); ctx.font = `900 34px ${FONT}`; ctx.fillText('¡objetivo!', 0, 14);
    ctx.restore();
  });
  captions(CAPS[6], t);
}
/* 8 — pregunta */
function scene8(t) {
  tokyoSky(t); farCity(0, t);
  signBuilding(-120, 1600, 320, 1250, 5, t); signBuilding(880, 1600, 320, 1300, 0, t);
  asphalt(1600, 0, t); wires(t);
  person(420, 1720, 1.35, Object.assign({}, DAD, { arms: [.2, .9], armLen: 140, eyes: 'happy', mouth: 'smile', face: 1 }));
  person(640, 1720, .85, Object.assign({}, GIRL, { arms: [-.9, .2], armLen: 130, eyes: 'happy', mouth: 'smile', face: -1 }));
  nameTag(420, 1720 - 400, 'ALQUILADO', '#FFD84A');
  questionBox('¿Tú alquilarías', 'a alguien así?', t, cap(7, 0) + .3);
  captions(CAPS[7], t);
}
startVideo([scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8], 3.2);
