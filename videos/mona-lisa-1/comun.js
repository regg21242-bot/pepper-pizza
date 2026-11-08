/* Piezas comunes para "El robo de la Mona Lisa" (partes 1 y 2) */
const PERUGGIA = { coat: '#F2F0E8', hat: 'cap', hatColor: '#2B2B33', mustache: true };
const PERUGGIA_CALLE = { coat: '#3A3A44', hat: 'fedora', hatColor: '#2B2B33', band: '#5A2E2E', mustache: true, tie: '#5A2E2E' };
const GENDARME = { coat: '#1E2D5A', hat: 'police', mustache: true };
const GOLDF = '#C9A040';

/* la Mona Lisa (dominio público), dibujo simplificado */
function monaLisa(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.frame !== false) {
    roundRect(-170, -235, 340, 470, 8); const fg = ctx.createLinearGradient(-170, -235, 170, 235); fg.addColorStop(0, '#F2D27A'); fg.addColorStop(.5, '#A87A24'); fg.addColorStop(1, '#E2B84A'); ctx.fillStyle = fg; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.strokeStyle = 'rgba(90,60,10,0.6)'; ctx.lineWidth = 4; ctx.strokeRect(-150, -215, 300, 430);
  }
  // fondo: paisaje brumoso
  ctx.save(); ctx.beginPath(); ctx.rect(-135, -200, 270, 400); ctx.clip();
  const bg = ctx.createLinearGradient(0, -200, 0, 200); bg.addColorStop(0, '#8FA48A'); bg.addColorStop(.45, '#6A7A56'); bg.addColorStop(1, '#3E3A24'); ctx.fillStyle = bg; ctx.fillRect(-140, -205, 280, 410);
  ctx.strokeStyle = 'rgba(200,190,140,0.45)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-135, -40); ctx.quadraticCurveTo(-90, -70, -60, -30); ctx.moveTo(70, -60); ctx.quadraticCurveTo(110, -30, 135, -50); ctx.stroke();
  // cuerpo con vestido oscuro
  ctx.fillStyle = '#2A2418'; ctx.beginPath(); ctx.moveTo(-120, 200); ctx.quadraticCurveTo(-110, 40, -40, 10); ctx.lineTo(40, 10); ctx.quadraticCurveTo(110, 40, 120, 200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C9A070'; ctx.beginPath(); ctx.moveTo(-34, 14); ctx.quadraticCurveTo(0, 60, 34, 14); ctx.closePath(); ctx.fill();
  // manos cruzadas
  ctx.fillStyle = '#D8B080'; ctx.beginPath(); ctx.ellipse(-10, 150, 46, 18, -.15, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(18, 140, 40, 16, .2, 0, 7); ctx.fill();
  // cabello y cara
  ctx.fillStyle = '#2A1E12'; ctx.beginPath(); ctx.ellipse(0, -70, 70, 92, 0, 0, 7); ctx.fill(); ctx.fillRect(-70, -70, 140, 90);
  ctx.fillStyle = '#D9B482'; ctx.beginPath(); ctx.ellipse(0, -70, 46, 62, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#3A2614'; ctx.beginPath(); ctx.ellipse(-16, -82, 7, 4, 0, 0, 7); ctx.ellipse(16, -82, 7, 4, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#7A4A2A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, -40); ctx.quadraticCurveTo(0, -35, 13, -41); ctx.stroke();   // la sonrisa
  ctx.fillStyle = 'rgba(255,240,200,0.12)'; ctx.fillRect(-140, -205, 280, 410);
  ctx.restore();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.strokeRect(-135, -200, 270, 400);
  ctx.restore();
}
function smallPainting(x, y, w, h, seed) {
  const r = rng(seed);
  roundRect(x - 12, y - 12, w + 24, h + 24, 6); ctx.fillStyle = '#B8902E'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, ['#7A9AB0', '#C9A070', '#8AA07A'][seed % 3]); g.addColorStop(1, ['#3A4A3A', '#6A3A2A', '#2E3A5A'][seed % 3]); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(x + r() * w, y + h * (.5 + r() * .4), 20 + r() * 40, 12 + r() * 20, 0, 0, 7); ctx.fill(); }
}
function hooks(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); for (const [dx, dy] of [[-120, -170], [120, -170], [-120, 170], [120, 170]]) { ctx.fillStyle = '#3A3A44'; ctx.beginPath(); ctx.arc(dx, dy, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#8A8A94'; ctx.fillRect(dx - 3, dy - 3, 18, 6); } ctx.restore(); }
/* sala del Louvre. o.mona: 'wall' | 'hooks' | null */
function gallery(t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, 1450); g.addColorStop(0, '#5A2A2A'); g.addColorStop(1, '#7A3A34'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 1450);
  // tragaluz
  const lg = ctx.createLinearGradient(0, 0, 0, 500); lg.addColorStop(0, 'rgba(255,240,200,0.35)'); lg.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, 500);
  ctx.fillStyle = '#E8DCC0'; ctx.fillRect(0, 0, W, 60); ctx.fillStyle = '#C9B890'; ctx.fillRect(0, 60, W, 18);
  smallPainting(30, 260, 200, 260, 1); smallPainting(850, 240, 200, 300, 2); smallPainting(60, 640, 150, 190, 3); smallPainting(870, 660, 160, 200, 4);
  if (o.mona === 'wall') monaLisa(540, 640, 1.15, {});
  if (o.mona === 'hooks') { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(540 - 195, 640 - 270, 390, 540); hooks(540, 640, 1.15); }
  // zócalo y parquet
  ctx.fillStyle = '#3A2018'; ctx.fillRect(0, 1380, W, 70);
  const pg = ctx.createLinearGradient(0, 1450, 0, H); pg.addColorStop(0, '#8A5A34'); pg.addColorStop(1, '#5A3A20'); ctx.fillStyle = pg; ctx.fillRect(0, 1450, W, H - 1450);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; for (let x = -200; x < W + 200; x += 60) { ctx.beginPath(); ctx.moveTo(x, 1450); ctx.lineTo(x + 120, H); ctx.stroke(); }
  // cordón de seguridad
  ctx.strokeStyle = '#8A1E1E'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(260, 1340); ctx.quadraticCurveTo(540, 1400, 820, 1340); ctx.stroke();
  for (const px of [260, 820]) { ctx.fillStyle = GOLDF; ctx.fillRect(px - 8, 1330, 16, 150); ctx.beginPath(); ctx.arc(px, 1330, 16, 0, 7); ctx.fill(); }
}
function newspaper(x, y, s, rot, head, sub) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  roundRect(-220, -280, 440, 560, 6); inked('#F1ECDD', 6);
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.font = `900 40px Georgia, serif`; ctx.fillText(sub, 0, -215); ctx.fillRect(-200, -195, 400, 5);
  ctx.font = `900 46px ${FONT}`; head.forEach((l, i) => ctx.fillText(l, 0, -130 + i * 52));
  ctx.save(); ctx.translate(-90, 90); monaLisa(0, 0, .42, {}); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 8; i++) ctx.fillRect(20, 0 + i * 26, 180 - (i % 3) * 30, 10);
  ctx.restore();
}
function magnifier(x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.strokeStyle = '#3A2A1A'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(40, 40); ctx.lineTo(110, 110); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 56, 0, 7); ctx.fillStyle = 'rgba(200,230,255,0.35)'; ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = '#B8902E'; ctx.stroke(); ctx.restore(); }
function carryPainting(p, s = .38) { const h = p.hands[0]; monaLisa(h.x + 30, h.y - 70, s, {}); }
