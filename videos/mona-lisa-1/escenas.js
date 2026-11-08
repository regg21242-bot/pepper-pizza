/* El robo de la Mona Lisa — PARTE 1: el robo */
function louvreFacade(t, o = {}) {
  daySky(t, {});
  ctx.fillStyle = '#E2D6BC'; ctx.fillRect(0, 620, W, 900); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(-5, 620, W + 10, 900);
  ctx.fillStyle = '#4E5A6A'; ctx.beginPath(); ctx.moveTo(-10, 620); ctx.lineTo(80, 480); ctx.lineTo(1000, 480); ctx.lineTo(1090, 620); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (let i = 0; i < 7; i++) { const x = 40 + i * 150; roundRect(x, 700, 90, 200, 4); inked('#3A4A6A', 4); roundRect(x, 980, 90, 200, 4); inked('#3A4A6A', 4); ctx.fillStyle = '#CFC2A4'; ctx.fillRect(x + 100, 640, 30, 860); }
  ctx.fillStyle = '#B8A888'; ctx.fillRect(0, 1480, W, 40);
  ctx.beginPath(); ctx.moveTo(430, 1520); ctx.lineTo(430, 1300); ctx.arc(540, 1300, 110, Math.PI, 0); ctx.lineTo(650, 1520); ctx.closePath(); inked('#3A2A1E', 6);
  ctx.fillStyle = INK; ctx.font = `900 54px Georgia, serif`; ctx.textAlign = 'center'; ctx.fillText('MUSÉE DU LOUVRE', 540, 580);
  cobbles(1520, 0, {});
}
/* 1 — el cuadro más famoso del mundo, robado, y nadie lo notó en un día */
function s1(t) {
  gallery(t, { mona: t < cap(0, 2) + .3 ? 'wall' : 'hooks' });
  if (t < cap(0, 2) + .3) { const z = 1 + prog(t, 0, 2) * .05; parchment([['21 de agosto', 52, FONT], ['1911', 110, FONT]], 540, 1180, 480, 280, t, .2, { lh: 100, write: .9, tOut: cap(0, 2) }); }
  else { sfxText('¡?!', 540, 1000, t, cap(0, 2) + .3, { size: 140, color: '#FF5A4F', dur: 1.5 }); }
  if (t > cap(0, 4)) { popIn(t, cap(0, 4), k => { ctx.save(); ctx.translate(540, 1150); ctx.scale(k, k); roundRect(-260, -90, 520, 180, 30); inked('#FFF6DC', 7); ctx.fillStyle = INK; ctx.font = `900 80px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⏰ 24 horas', 0, 6); ctx.restore(); }); }
  captions(CAPS[0], t);
}
/* 2 — lunes, museo cerrado */
function s2(t) {
  louvreFacade(t);
  popIn(t, cap(1, 3), k => { ctx.save(); ctx.translate(540, 1430); ctx.scale(k, k); ctx.rotate(-.06); roundRect(-150, -60, 300, 120, 10); inked('#B3261E', 6); ctx.fillStyle = '#fff'; ctx.font = `900 64px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('FERMÉ', 0, 6); ctx.restore(); });
  popIn(t, .3, k => { ctx.save(); ctx.translate(820, 330); ctx.scale(k, k); roundRect(-110, -110, 220, 220, 18); inked('#FFFFFF', 6); ctx.fillStyle = '#C8322E'; ctx.fillRect(-110, -110, 220, 60); ctx.fillStyle = '#fff'; ctx.font = `900 34px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('LUNES', 0, -70); ctx.fillStyle = INK; ctx.font = `900 96px ${FONT}`; ctx.fillText('21', 0, 60); ctx.restore(); });
  popIn(t, cap(1, 1), k => { ctx.save(); ctx.translate(250, 330); ctx.scale(k, k); label('París', 0, 0, { size: 50 }); ctx.restore(); });
  captions(CAPS[1], t);
}
/* 3 — un hombre con bata blanca la descuelga */
function s3(t) {
  const take = cap(2, 4);
  gallery(t, { mona: t < take ? 'wall' : 'hooks' });
  const k = easeOut(prog(t, 0, cap(2, 3)));
  const px = lerp(-120, 360, k);
  const p = person(px, 1720, 1.35, Object.assign({}, PERUGGIA, { walk: k < 1 ? t * 7 : undefined, bob: k < 1, arms: t > take - .3 ? [2.3, 2.1] : [.2, -.2], armLen: 150, eyes: 'open', mouth: 'flat', face: 1 }));
  if (t > take) { const kk = easeOut(prog(t, take, take + .6)); monaLisa(lerp(540, p.hands[0].x + 60, kk), lerp(640, p.hands[0].y - 120, kk), lerp(1.15, .55, kk), {}); }
  popIn(t, cap(2, 1), kk => { ctx.save(); ctx.translate(px, 880); ctx.scale(kk, kk); label('bata blanca', 0, 0, { size: 40 }); ctx.restore(); }, take - .2);
  captions(CAPS[2], t);
}
/* 4 — le quita el marco, la esconde bajo la bata y sale */
function stair(t) {
  ctx.fillStyle = '#4A3A30'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#6A5444' : '#5E4A3C'; ctx.fillRect(0, 1100 + i * 70, W, 70); }
  ctx.fillStyle = '#2E2420'; ctx.fillRect(760, 380, 220, 720); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(760, 380, 220, 720);
  ctx.fillStyle = '#E7C25A'; ctx.beginPath(); ctx.arc(790, 760, 10, 0, 7); ctx.fill();
  const lg = ctx.createRadialGradient(300, 300, 20, 300, 300, 600); lg.addColorStop(0, 'rgba(255,240,200,0.3)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
}
function s4(t) {
  const hide = cap(3, 1), out = cap(3, 3);
  stair(t);
  // marco abandonado en la escalera
  if (t > cap(3, 0) + .3) { ctx.save(); ctx.translate(250, 1460); ctx.rotate(-.25); roundRect(-170, -235, 340, 470, 8); ctx.lineWidth = 34; ctx.strokeStyle = '#C9A040'; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  const walk = t > out;
  const x = walk ? lerp(520, 870, prog(t, out, out + 1.4)) : 520;
  const p = person(x, 1720, 1.35, Object.assign({}, PERUGGIA, { walk: walk ? t * 7 : undefined, bob: walk, arms: t < hide ? [1.6, 1.4] : [.5, -.5], armLen: 150, eyes: walk ? 'happy' : 'open', mouth: walk ? 'smile' : 'flat', face: 1 }));
  if (t < hide) monaLisa(p.hands[0].x + 20, p.hands[0].y - 90, .5, { frame: t < cap(3, 0) + .3 });
  else { ctx.save(); ctx.fillStyle = '#E8E6DE'; roundRect(x - 75, 1720 - 1.35 * 380, 150, 1.35 * 200, 40); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  if (walk) { sfxText('♪ fiu fiu ♪', x + 120, 1000, t, out + .2, { size: 54, color: '#FFFFFF', dur: 1.6 }); }
  captions(CAPS[3], t);
}
/* 5 — al día siguiente, un pintor: solo cuatro ganchos */
function easel(x, gy) { ctx.save(); ctx.strokeStyle = '#6A4A24'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 80, gy); ctx.lineTo(x, gy - 420); ctx.lineTo(x + 80, gy); ctx.moveTo(x, gy - 420); ctx.lineTo(x, gy); ctx.stroke(); roundRect(x - 110, gy - 400, 220, 260, 6); inked('#F4F0E6', 5); ctx.restore(); }
function s5(t) {
  gallery(t, { mona: 'hooks' });
  popIn(t, .2, k => { ctx.save(); ctx.translate(540, 1080); ctx.scale(k, k); label('Al día siguiente', 0, 0, { size: 48 }); ctx.restore(); }, cap(4, 1) - .2);
  easel(820, 1760);
  const shock = t > cap(4, 3);
  person(560, 1760, 1.3, { coat: '#5A4A3A', hat: 'beret', hatColor: '#2B2B33', mustache: true, arms: shock ? [2.6, 2.5] : [1.4, -.2], armLen: 140, eyes: shock ? 'wide' : 'happy', mouth: shock ? 'o' : 'smile', face: -1 });
  if (shock) { ctx.save(); ctx.strokeStyle = '#FFD84A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(540, 640, 330 + Math.sin(t * 6) * 8, 0, 7); ctx.stroke(); ctx.restore(); popIn(t, cap(4, 3) + .2, k => { ctx.save(); ctx.translate(540, 1080); ctx.scale(k, k); label('4 ganchos', 0, 0, { size: 50, bg: '#FFD84A' }); ctx.restore(); }); }
  captions(CAPS[4], t);
}
/* 6 — el Louvre cierra; la noticia en todo el mundo */
function s6(t) {
  louvreFacade(t);
  popIn(t, .2, k => { ctx.save(); ctx.translate(540, 1430); ctx.scale(k, k); ctx.rotate(-.06); roundRect(-260, -60, 520, 120, 10); inked('#B3261E', 6); ctx.fillStyle = '#fff'; ctx.font = `900 54px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CERRADO 1 SEMANA', 0, 6); ctx.restore(); });
  const papers = [[['LA JOCONDE', 'A DISPARU'], 'Paris'], [['MONA LISA', 'STOLEN'], 'New York'], [['RUBATA LA', 'GIOCONDA'], 'Roma'], [['¡ROBAN LA', 'GIOCONDA!'], 'México']];
  papers.forEach(([h, s], i) => { const t0 = cap(5, 2) + i * .35; if (t < t0) return; const k = easeBack(prog(t, t0, t0 + .4)); newspaper(200 + i * 230, 760 + (i % 2) * 120, .55 * k, (i - 1.5) * .12, h, s); });
  captions(CAPS[5], t);
}
/* 7 — sospechosos: Apollinaire detenido, Picasso interrogado */
function suspectCard(x, y, s, name, note, look, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(x) * .05);
  roundRect(-150, -200, 300, 400, 10); inked('#F4F0E6', 6);
  ctx.save(); ctx.beginPath(); ctx.rect(-130, -180, 260, 250); ctx.clip(); ctx.fillStyle = '#C9C2B2'; ctx.fillRect(-130, -180, 260, 250); person(0, 260, .7, Object.assign({}, look, { arms: [.2, -.2], eyes: 'open', mouth: 'flat' })); ctx.restore();
  ctx.fillStyle = INK; ctx.font = `900 36px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(name, 0, 120);
  ctx.fillStyle = '#B3261E'; ctx.font = `800 28px ${FONT}`; ctx.fillText(note, 0, 165);
  ctx.fillStyle = '#C8322E'; ctx.beginPath(); ctx.arc(0, -200, 14, 0, 7); ctx.fill();
  ctx.restore();
}
function s7(t) {
  ctx.fillStyle = '#3A2A20'; ctx.fillRect(0, 0, W, H);
  roundRect(60, 300, 960, 1000, 14); inked('#8A6A44', 8);
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let i = 0; i < 300; i++) { const r = rng(i); ctx.fillRect(80 + r() * 920, 320 + r() * 960, 3, 3); }
  ctx.strokeStyle = '#C8322E'; ctx.lineWidth = 4;
  if (t > cap(6, 1)) { ctx.beginPath(); ctx.moveTo(300, 600); ctx.lineTo(540, 450); ctx.stroke(); }
  if (t > cap(6, 2)) { ctx.beginPath(); ctx.moveTo(780, 600); ctx.lineTo(540, 450); ctx.stroke(); }
  monaLisa(540, 450, .38, {});
  popIn(t, cap(6, 1), k => suspectCard(300, 820, k, 'Apollinaire', 'DETENIDO', { coat: '#3A3A44', hat: 'hair', hatColor: '#4A2A18', tie: '#222' }, t));
  popIn(t, cap(6, 2), k => suspectCard(780, 820, k, 'Picasso', 'INTERROGADO', { coat: '#2E4A6A', hat: 'hair', hatColor: '#141418' }, t));
  person(540, 1760, 1.2, Object.assign({}, GENDARME, { arms: [1.6, -.2], armLen: 130, eyes: 'open', mouth: 'flat', brows: 'angry', face: 1 }));
  magnifier(700, 1200, 1, .6);
  captions(CAPS[6], t);
}
/* 8 — miles hicieron fila para ver el hueco vacío */
function s8(t) {
  gallery(t, { mona: 'hooks' });
  const r = rng(5); const n = Math.floor(prog(t, cap(7, 2) - .3, cap(7, 3)) * 10);
  const cols = ['#2E3440', '#6A3E5A', '#3A5A4A', '#5A4A3A', '#2E4A6A', '#7A3A2A', '#4A4A52', '#8A6A3A', '#3A3A5A', '#5A2E2E'];
  for (let i = n - 1; i >= 0; i--) { const row = i % 2; person(80 + i * 100 + row * 40, 1700 + row * 120, .9 + row * .2, { coat: cols[i], hat: ['fedora', 'bun', 'tophat', 'hair', 'beret'][i % 5], hatColor: '#2B2B33', dress: i % 3 === 1, arms: [.2, -.2], eyes: 'wide', mouth: 'o', face: 1 }); }
  if (t > cap(7, 4)) { ctx.save(); ctx.strokeStyle = '#FFD84A'; ctx.lineWidth = 8; ctx.setLineDash([20, 14]); ctx.strokeRect(540 - 200, 640 - 275, 400, 550); ctx.restore(); popIn(t, cap(7, 4) + .2, k => { ctx.save(); ctx.translate(540, 1000); ctx.scale(k, k); label('¡Un hueco!', 0, 0, { size: 54, bg: '#FFD84A' }); ctx.restore(); }); }
  captions(CAPS[7], t);
}
/* 9 — ¿quién fue? parte 2 */
function s9(t) {
  ctx.fillStyle = '#0E0C14'; ctx.fillRect(0, 0, W, H);
  const lg = ctx.createRadialGradient(540, 900, 20, 540, 900, 700); lg.addColorStop(0, 'rgba(255,240,200,0.25)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.filter = 'brightness(0)'; person(540, 1500, 1.6, Object.assign({}, PERUGGIA_CALLE, { arms: [.2, -.2] })); ctx.restore();
  ctx.save(); ctx.font = `900 260px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#FFD84A'; ctx.globalAlpha = .9; ctx.fillText('?', 540, 820 + Math.sin(t * 3) * 10); ctx.restore();
  popIn(t, cap(8, 2), k => { ctx.save(); ctx.translate(540, 420); ctx.scale(k, k); ctx.rotate(-.05); roundRect(-260, -90, 520, 180, 30); inked('#FFD84A', 8); ctx.fillStyle = INK; ctx.font = `900 96px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PARTE 2', 0, 8); ctx.restore(); });
  captions(CAPS[8], t);
}
startVideo([s1, s2, s3, s4, s5, s6, s7, s8, s9], 3.0);
