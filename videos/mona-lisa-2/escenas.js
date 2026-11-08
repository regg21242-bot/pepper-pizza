/* El robo de la Mona Lisa — PARTE 2: el ladrón */
function smallRoom(t) {
  ctx.fillStyle = '#C9B48A'; ctx.fillRect(0, 0, W, 1450);
  ctx.strokeStyle = 'rgba(90,60,30,0.18)'; ctx.lineWidth = 3; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1450); ctx.stroke(); }
  // ventana con tejados de París
  roundRect(620, 260, 340, 420, 6); inked('#6A8AB0', 7);
  ctx.save(); ctx.beginPath(); ctx.rect(620, 260, 340, 420); ctx.clip(); ctx.fillStyle = '#5E6878'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(600 + i * 80, 680); ctx.lineTo(640 + i * 80, 560 - (i % 2) * 40); ctx.lineTo(700 + i * 80, 680); ctx.fill(); } ctx.restore();
  ctx.strokeStyle = '#E8E2D4'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(790, 260); ctx.lineTo(790, 680); ctx.moveTo(620, 470); ctx.lineTo(960, 470); ctx.stroke();
  // cama
  roundRect(60, 1120, 420, 160, 14); inked('#8A3A3A', 6); roundRect(60, 1060, 120, 90, 20); inked('#F4F0E6', 5);
  ctx.fillStyle = '#6A4A30'; ctx.fillRect(0, 1450, W, H - 1450); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 1450); ctx.lineTo(W, 1450); ctx.stroke();
}
function trunk(x, gy, s, open, t) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  roundRect(-200, -200, 400, 200, 14); inked('#7A4A24', 7);
  ctx.strokeStyle = '#E2B33C'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-200, -120); ctx.lineTo(200, -120); ctx.stroke();
  ctx.save(); ctx.translate(-200, -200); ctx.rotate(-open * 1.2); roundRect(0, -70, 400, 70, 14); inked('#8A5A2E', 7); ctx.restore();
  if (open > .5) monaLisa(0, -230, .4, { frame: false });
  ctx.restore();
}
/* 1 — dos años sin rastro… hasta un error */
function s1(t) {
  ctx.fillStyle = '#1E1A26'; ctx.fillRect(0, 0, W, H);
  const yr = t < cap(0, 2) ? 1911 + Math.floor(prog(t, .3, cap(0, 2)) * 2.99) : 1913;
  ctx.save(); ctx.translate(540, 760);
  roundRect(-220, -240, 440, 480, 30); inked('#FFFFFF', 8); ctx.fillStyle = '#C8322E'; roundRect(-220, -240, 440, 120, 30); ctx.fill(); ctx.fillRect(-220, -160, 440, 40);
  ctx.fillStyle = '#fff'; ctx.font = `900 60px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('AÑO', 0, -175);
  ctx.fillStyle = INK; ctx.font = `900 170px ${FONT}`; ctx.fillText(String(yr), 0, 60);
  ctx.restore();
  bigNumber('2 AÑOS', 540, 330, 120, t, cap(0, 0) + .4, { color: '#FFD84A', tOut: cap(0, 3) - .3 });
  stamp('UN ERROR', 540, 1150, t, cap(0, 4), { size: 110 });
  captions(CAPS[0], t);
}
/* 2 — Vincenzo Peruggia, que hizo la vitrina del cuadro */
function s2(t) {
  if (t < cap(1, 1) - .2) {
    ctx.fillStyle = '#2A2238'; ctx.fillRect(0, 0, W, H);
    const lg = ctx.createRadialGradient(540, 900, 30, 540, 900, 700); lg.addColorStop(0, 'rgba(255,240,200,0.3)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    person(540, 1720, 1.6, Object.assign({}, PERUGGIA_CALLE, { arms: [.2, -.2], armLen: 150, eyes: 'open', mouth: 'flat', face: 1 }));
    popIn(t, .4, k => { ctx.save(); ctx.translate(540, 500); ctx.scale(k, k); label('Vincenzo Peruggia', 0, 0, { size: 56 }); ctx.restore(); });
  } else {
    gallery(t, { mona: 'wall' });
    const glassK = easeOut(prog(t, cap(1, 6) - .2, cap(1, 6) + .6));
    if (glassK > 0) { ctx.save(); ctx.globalAlpha = glassK; ctx.fillStyle = 'rgba(190,220,255,0.25)'; ctx.fillRect(540 - 210, 640 - 285, 420, 570); ctx.strokeStyle = '#E8ECF0'; ctx.lineWidth = 8; ctx.strokeRect(540 - 210, 640 - 285, 420, 570); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(360, 900); ctx.lineTo(520, 370); ctx.lineTo(570, 370); ctx.lineTo(410, 900); ctx.fill(); ctx.restore(); }
    const p = person(830, 1720, 1.3, Object.assign({}, PERUGGIA, { arms: [2.2 + Math.sin(t * 10) * .15, .3], armLen: 140, eyes: 'happy', mouth: 'smile', face: -1 }));
    ctx.save(); ctx.translate(p.hands[0].x, p.hands[0].y); ctx.rotate(Math.sin(t * 10) * .4); ctx.fillStyle = '#5A5E6A'; ctx.fillRect(-6, -60, 12, 60); ctx.fillStyle = '#3A3A44'; ctx.fillRect(-28, -78, 56, 24); ctx.restore();
    popIn(t, cap(1, 6), k => { ctx.save(); ctx.translate(540, 1100); ctx.scale(k, k); label('Él hizo la vitrina', 0, 0, { size: 46, bg: '#FFD84A' }); ctx.restore(); });
  }
  captions(CAPS[1], t);
}
/* 3 — escondida en su cuarto; la policía no la encuentra */
function s3(t) {
  smallRoom(t);
  const pol = cap(2, 3) - .2;
  trunk(760, 1450, 1.0, t < pol ? easeOut(prog(t, .3, 1.0)) : 0, t);
  person(380, 1720, 1.25, Object.assign({}, PERUGGIA_CALLE, { hat: 'hair', hatColor: '#2B2B33', arms: t > pol ? [.4, -.2] : [1.2, -.2], armLen: 140, eyes: t > pol ? 'open' : 'happy', mouth: t > pol ? 'flat' : 'smile', face: 1 }));
  if (t > pol) {
    const k = easeOut(prog(t, pol, pol + .6));
    person(lerp(1250, 980, k), 1720, 1.25, Object.assign({}, GENDARME, { arms: [1.5, -.2], armLen: 130, eyes: 'open', mouth: 'o', face: -1 }));
    if (t > cap(2, 5)) { noSign(760, 1100, 110, t, cap(2, 5), () => { magnifier(-10, -10, .7, .6); }); sfxText('…uf', 380, 1000, t, cap(2, 5) + .5, { size: 70, color: '#FFFFFF', dur: 1.3 }); }
  }
  captions(CAPS[2], t);
}
/* 4 — viaja a Florencia y ofrece el cuadro por 500.000 liras */
function s4(t) {
  if (t < cap(3, 3) - .2) {
    // mapa con la ruta París → Florencia
    const g = ctx.createRadialGradient(540, 800, 100, 540, 800, 1000); g.addColorStop(0, '#F3E3BC'); g.addColorStop(1, '#C49A5E'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const P = [300, 560], F = [760, 1120];
    for (const [x, y, n] of [[P[0], P[1], 'París'], [F[0], F[1], 'Florencia']]) { ctx.fillStyle = '#B3261E'; ctx.beginPath(); ctx.arc(x, y, 20, 0, 7); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); label(n, x, y - 70, { size: 42 }); }
    const k = easeInOut(prog(t, .3, cap(3, 2)));
    ctx.save(); ctx.strokeStyle = '#3A2410'; ctx.lineWidth = 10; ctx.setLineDash([24, 16]); ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.quadraticCurveTo(700, 700, lerp(P[0], F[0], k), lerp(P[1], F[1], k)); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(lerp(P[0], F[0], k), lerp(P[1], F[1], k)); ctx.fillStyle = '#2E2E36'; roundRect(-70, -40, 140, 70, 10); ctx.fill(); ctx.fillStyle = '#C8322E'; ctx.fillRect(-70, -10, 140, 10); for (const wx of [-40, 40]) { ctx.beginPath(); ctx.arc(wx, 34, 16, 0, 7); ctx.fillStyle = INK; ctx.fill(); } ctx.restore();
    parchment([['1913', 100, FONT]], 540, 300, 340, 170, t, .2, { write: .5 });
  } else {
    smallRoom(t);
    // la carta
    popIn(t, cap(3, 3) - .1, k => { ctx.save(); ctx.translate(540, 820); ctx.scale(k, k); ctx.rotate(-.04); roundRect(-320, -260, 640, 520, 10); inked('#F6F1E4', 7); ctx.fillStyle = INK; ctx.font = `italic 700 40px Georgia, serif`; ctx.textAlign = 'left'; ctx.fillText('Estimado señor:', -270, -180); ctx.fillText('Tengo la Gioconda.', -270, -110); ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (let i = 0; i < 4; i++) ctx.fillRect(-270, -60 + i * 40, 520 - (i % 2) * 120, 10); ctx.restore(); });
    if (t > cap(3, 6) - .1) bigNumber('500.000 liras', 540, 1150, 90, t, cap(3, 6), { color: '#FFD84A' });
    popIn(t, cap(3, 4), k => { ctx.save(); ctx.translate(540, 420); ctx.scale(k, k); label('Comerciante de arte · Florencia', 0, 0, { size: 40 }); ctx.restore(); });
  }
  captions(CAPS[3], t);
}
/* 5 — el director de los Uffizi la revisa: auténtica */
function s5(t) {
  smallRoom(t);
  trunk(540, 1450, .9, 1, t);
  person(220, 1720, 1.2, { coat: '#3A4A3A', hat: 'fedora', hatColor: '#3A3A2A', mustache: true, arms: [1.6, -.2], armLen: 130, eyes: 'open', mouth: 'flat', face: 1 });
  const d = person(860, 1720, 1.25, { coat: '#2B2B33', hat: 'tophat', mustache: true, glasses: false, arms: [2.1, -.2], armLen: 140, eyes: 'wide', mouth: 'o', face: -1 });
  magnifier(d.hands[0].x - 40, d.hands[0].y - 40, 1, -.6);
  popIn(t, cap(4, 2) - .2, k => { ctx.save(); ctx.translate(860, 1020); ctx.scale(k, k); label('Director de los Uffizi', 0, 0, { size: 38 }); ctx.restore(); }, cap(4, 4) - .2);
  stamp('AUTÉNTICA', 540, 640, t, cap(4, 4) + .2, { size: 110, color: '#1F9D55' });
  captions(CAPS[4], t);
}
/* 6 — lo arrestan en su hotel */
function s6(t) {
  smallRoom(t);
  const k = easeOut(prog(t, 0, cap(5, 1)));
  const p = person(480, 1720, 1.3, Object.assign({}, PERUGGIA_CALLE, { arms: t > cap(5, 1) ? [2.7, 2.7] : [.2, -.2], armLen: 112, eyes: 'wide', mouth: 'o', face: 1 }));
  person(lerp(1250, 760, k), 1720, 1.3, Object.assign({}, GENDARME, { arms: [1.6, -.2], armLen: 130, eyes: 'open', mouth: 'flat', brows: 'angry', face: -1 }));
  person(lerp(1400, 960, k), 1720, 1.2, Object.assign({}, GENDARME, { mustache: false, arms: [.2, -.2], eyes: 'open', mouth: 'flat', brows: 'angry', face: -1 }));
  if (t > cap(5, 1)) { sfxText('¡ARRESTADO!', 540, 900, t, cap(5, 1), { size: 100, color: '#FF5A4F', dur: 2 }); popIn(t, cap(5, 2), kk => { ctx.save(); ctx.translate(540, 520); ctx.scale(kk, kk); label('Hotel · Florencia', 0, 0, { size: 44 }); ctx.restore(); }); }
  captions(CAPS[5], t);
}
/* 7 — "quería devolverla a Italia" */
function italyFlag(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -320); ctx.stroke(); ['#2E8A44', '#FFFFFF', '#C8322E'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(i * 70, -320 + Math.sin(t * 5 + i) * 6); ctx.lineTo((i + 1) * 70, -320 + Math.sin(t * 5 + i + 1) * 6); ctx.lineTo((i + 1) * 70, -180 + Math.sin(t * 5 + i + 1) * 6); ctx.lineTo(i * 70, -180 + Math.sin(t * 5 + i) * 6); ctx.closePath(); ctx.fill(); }); ctx.lineWidth = 4; ctx.strokeRect(0, -320, 210, 140); ctx.restore(); }
function s7(t) {
  daySky(t, {}); hills(1400, '#9AB06A', '#7A9A50');
  ctx.fillStyle = '#C9A070'; ctx.fillRect(0, 1450, W, H - 1450);
  const p = person(380, 1720, 1.35, Object.assign({}, PERUGGIA_CALLE, { arms: [2.5, -.2], armLen: 140, eyes: 'happy', mouth: 'smile', face: 1 }));
  italyFlag(p.hands[0].x, p.hands[0].y + 30, 1, t);
  popIn(t, cap(6, 3), k => { ctx.save(); ctx.translate(760, 760); ctx.scale(k, k); for (const [x, y, r] of [[-200, 220, 16], [-170, 180, 24]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); inked('#FFFFFF', 5); } ctx.beginPath(); ctx.ellipse(0, 0, 230, 190, 0, 0, 7); inked('#FFFFFF', 6); monaLisa(-70, 10, .45, {}); person(110, 140, .45, { coat: '#6A3A5A', hat: 'beret', hatColor: '#3A2A3A', mustache: true, arms: [.3, -.3], eyes: 'happy', mouth: 'smile', face: -1 }); ctx.restore(); });
  popIn(t, cap(6, 4), k => { ctx.save(); ctx.translate(760, 1040); ctx.scale(k, k); label('Leonardo da Vinci', 0, 0, { size: 42 }); ctx.restore(); });
  captions(CAPS[6], t);
}
/* 8 — 7 meses de cárcel; la Mona Lisa vuelve a París en 1914 */
function s8(t) {
  if (t < cap(7, 4) - .2) {
    ctx.fillStyle = '#3A3A44'; ctx.fillRect(0, 0, W, H);
    person(540, 1650, 1.3, Object.assign({}, PERUGGIA_CALLE, { hat: 'hair', hatColor: '#2B2B33', arms: [.3, -.3], eyes: 'sleepy', mouth: 'flat', face: 1 }));
    for (let x = 60; x < W; x += 120) { const g = ctx.createLinearGradient(x - 16, 0, x + 16, 0); g.addColorStop(0, '#3A3E48'); g.addColorStop(.5, '#C9CED8'); g.addColorStop(1, '#3A3E48'); ctx.fillStyle = g; ctx.fillRect(x - 16, 0, 32, H); }
    bigNumber('7 MESES', 540, 520, 130, t, cap(7, 2), { color: '#FFD84A' });
  } else {
    gallery(t, { mona: 'wall' });
    const cols = ['#2E3440', '#6A3E5A', '#3A5A4A', '#5A4A3A', '#2E4A6A', '#7A3A2A'];
    for (let i = 0; i < 6; i++) person(120 + i * 170, 1760 + (i % 2) * 40, 1.0, { coat: cols[i], hat: ['fedora', 'bun', 'tophat', 'hair', 'beret', 'bun'][i], hatColor: '#2B2B33', dress: i % 2 === 1, arms: [2.5 + Math.sin(t * 8 + i) * .2, 2.4], armLen: 120, eyes: 'happy', mouth: 'grin', face: 1 });
    parchment([['1914', 100, FONT]], 540, 1130, 320, 160, t, cap(7, 4) - .1, { write: .5 });
    for (let i = 0; i < 6; i++) sparkle(540 + Math.cos(t * 2 + i) * 300, 640 + Math.sin(t * 2 + i) * 340, .9, t);
  }
  captions(CAPS[7], t);
}
/* 9 — el robo la hizo el cuadro más famoso del mundo */
function s9(t) {
  ctx.fillStyle = '#0E1226'; ctx.fillRect(0, 0, W, H);
  const r = rng(4); for (let i = 0; i < 90; i++) { ctx.fillStyle = `rgba(255,255,255,${.3 + .5 * r()})`; ctx.beginPath(); ctx.arc(r() * W, r() * H, 1 + r() * 1.5, 0, 7); ctx.fill(); }
  const big = t > cap(8, 2);
  const s = big ? lerp(.7, 1.35, easeOut(prog(t, cap(8, 2), cap(8, 4) + .3))) : .7;
  if (big) { ctx.save(); ctx.translate(540, 760); ctx.rotate(t * .3); for (let i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.fillStyle = 'rgba(255,216,74,0.12)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, -900); ctx.lineTo(60, -900); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  monaLisa(540, 760, s, {});
  if (big) bigNumber('#1', 860, 360, 140, t, cap(8, 3), { color: '#FFD84A' });
  questionBox('¿Tú conocías', 'esta historia?', t, cap(8, 5), { y: 1580 });
  captions(CAPS[8], t);
}
startVideo([s1, s2, s3, s4, s5, s6, s7, s8, s9], 3.0);
