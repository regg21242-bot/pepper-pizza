/* Biblioteca común de los vídeos animados (muñecos, subtítulos, fondos). */
/* ============================================================
   EL SECRETO DEL PACHINKO — reel/TikTok 1080x1920
   Muñecos sencillos sobre fondos detallados.
   draw(t) pinta el fotograma del segundo t.
   ============================================================ */
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const W = 1080, H = 1920;
const FONT = 'Inter, "Inter Display", Arial, sans-serif';
const JP = '"IPAGothic", "IPAPGothic", sans-serif';
const INK = '#141414';

/* ---------- utilidades ---------- */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeIn = t => Math.pow(clamp(t), 3);
const easeInOut = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const easeBack = t => { t = clamp(t); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function inked(fill, lw = 6) { ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }

/* ---------- grano ---------- */
const grain = document.createElement('canvas');
grain.width = 540; grain.height = 960;
(() => {
  const g = grain.getContext('2d'), img = g.createImageData(540, 960), r = rng(7);
  for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (r() - .5) * 120; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0);
})();
function finishFrame() {
  ctx.save(); ctx.globalAlpha = .07; ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(grain, 0, 0, W, H); ctx.restore();
  const v = ctx.createRadialGradient(W / 2, H * .48, H * .28, W / 2, H * .48, H * .75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

/* ============================================================
   SUBTÍTULOS — palabras que entran una a una, blanco con borde negro
   ============================================================ */
const CAP_Y = 1290;
function parseWords(text) { return text.split(' ').map(w => ({ w: w.replace(/\*/g, ''), hl: w.includes('*') })); }
function captions(chunks, t, o = {}) {
  let ci = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0]) ci = i;
  if (ci < 0) return;
  const [t0, text] = chunks[ci];
  const words = parseWords(text);
  let size = o.size || 84;
  const y = o.y || CAP_Y;
  ctx.save();
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  let widths, space, total;
  for (;;) {
    ctx.font = `900 ${size}px ${FONT}`;
    space = ctx.measureText(' ').width;
    widths = words.map(w => ctx.measureText(w.w).width);
    total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
    if (total < 940 || size < 44) break;
    size -= 4;
  }
  let x = 540 - total / 2;
  words.forEach((wd, i) => {
    const tw = t0 + i * 0.13;
    const p = prog(t, tw, tw + .2);
    if (p > 0) {
      const s = easeBack(p);
      ctx.save();
      ctx.translate(x + widths[i] / 2, y); ctx.scale(s, s);
      ctx.globalAlpha = clamp(p * 3);
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
      ctx.strokeStyle = '#000'; ctx.lineWidth = size * 0.2;
      ctx.strokeText(wd.w, -widths[i] / 2, 0);
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = wd.hl ? '#FFD84A' : '#FFFFFF';
      ctx.fillText(wd.w, -widths[i] / 2, 0);
      ctx.restore();
    }
    x += widths[i] + space;
  });
  ctx.restore();
}
/* texto de onomatopeya (TOC, TIC...) */
function sfxText(text, x, y, t, t0, o = {}) {
  const d = t - t0; if (d < 0 || d > (o.dur || .55)) return;
  const p = easeBack(clamp(d / .15)), a = 1 - prog(d, (o.dur || .55) - .2, o.dur || .55);
  ctx.save(); ctx.translate(x, y - d * 40); ctx.rotate(o.rot || -0.12); ctx.scale(p, p); ctx.globalAlpha = a;
  ctx.font = `900 ${o.size || 90}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 18; ctx.strokeText(text, 0, 0);
  ctx.fillStyle = o.color || '#FFD84A'; ctx.fillText(text, 0, 0);
  ctx.restore();
}

/* ============================================================
   PERSONAJE (muñeco de palo con abrigo)
   ============================================================ */
function person(x, y, s, o = {}) {
  const f = o.face || 1;                 // 1 mira a la derecha, -1 a la izquierda
  const legL = 175, bodyH = 215, bodyW = 118, headR = 64;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.bob) ctx.translate(0, -Math.abs(Math.sin(o.walk || 0)) * 8);
  const hipY = -legL, topY = hipY - bodyH;
  // sombra
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 4, 95, 16, 0, 0, 7); ctx.fill();
  // piernas
  ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const ph = (o.walk || 0) + (side > 0 ? 0 : Math.PI);
    const fx = side * 20 + (o.walk !== undefined ? Math.sin(ph) * 42 : 0);
    const fy = o.walk !== undefined ? -Math.max(0, Math.cos(ph)) * 14 : 0;
    ctx.strokeStyle = INK; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(side * 22, hipY); ctx.lineTo(fx, fy - 6); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(fx + f * 14, fy - 6, 24, 11, 0, 0, 7); ctx.fill();
  }
  // cuerpo / abrigo
  roundRect(-bodyW / 2, topY, bodyW, bodyH + 14, 38);
  const cg = ctx.createLinearGradient(-bodyW / 2, 0, bodyW / 2, 0);
  cg.addColorStop(0, shade(o.coat || '#3B5A8A', .18)); cg.addColorStop(1, shade(o.coat || '#3B5A8A', -.2));
  inked(cg, 6);
  if (o.dress) { // falda
    ctx.beginPath(); ctx.moveTo(-bodyW / 2 + 6, hipY - 30); ctx.lineTo(-bodyW / 2 - 22, hipY + 60); ctx.lineTo(bodyW / 2 + 22, hipY + 60); ctx.lineTo(bodyW / 2 - 6, hipY - 30); ctx.closePath();
    inked(shade(o.coat, -.1), 6);
  }
  if (o.patch) {
    ctx.save(); roundRect(-bodyW / 2, topY, bodyW, bodyH + 14, 38); ctx.clip();
    const pc = o.patch; let k = 0;
    for (let yy = topY - 30; yy < hipY + 40; yy += 40) for (let xx = -bodyW / 2 - 40; xx < bodyW / 2 + 40; xx += 40) { ctx.fillStyle = pc[(k++) % pc.length]; ctx.beginPath(); ctx.moveTo(xx, yy + 20); ctx.lineTo(xx + 20, yy); ctx.lineTo(xx + 40, yy + 20); ctx.lineTo(xx + 20, yy + 40); ctx.closePath(); ctx.fill(); }
    ctx.restore(); roundRect(-bodyW / 2, topY, bodyW, bodyH + 14, 38); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  }
  // botones / detalle
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(f * 8, topY + 60 + i * 45, 6, 0, 7); ctx.fill(); }
  if (o.tie) { ctx.beginPath(); ctx.moveTo(-26, topY + 4); ctx.lineTo(0, topY + 40); ctx.lineTo(26, topY + 4); ctx.closePath(); inked('#FFFFFF', 4);
    ctx.beginPath(); ctx.moveTo(-9, topY + 22); ctx.lineTo(9, topY + 22); ctx.lineTo(13, topY + 120); ctx.lineTo(0, topY + 138); ctx.lineTo(-13, topY + 120); ctx.closePath(); inked(o.tie, 4); }
  if (o.apron) { roundRect(-bodyW / 2 + 12, topY + 70, bodyW - 24, bodyH - 40, 14); inked(o.apron, 5); }
  if (o.scarf) { roundRect(-bodyW / 2 + 4, topY - 4, bodyW - 8, 34, 16); inked(o.scarf, 5); }
  // brazos
  const hands = [];
  const arms = o.arms || [0.15, -0.15];
  arms.forEach((a, i) => {
    const side = i === 0 ? f : -f;
    const sx = side * (bodyW / 2 - 14), sy = topY + 46;
    const len = o.armLen || 150;
    const ex = sx + Math.sin(a) * len * f, ey = sy + Math.cos(a) * len;
    ctx.strokeStyle = INK; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo((sx + ex) / 2 + side * 10, (sy + ey) / 2, ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.arc(ex, ey, 15, 0, 7); inked('#FFFFFF', 5);
    hands.push({ x: x + ex * s, y: y + ey * s });
  });
  // cabeza
  const hx = 0, hy = topY - headR + 14;
  ctx.save();
  ctx.translate(hx, hy); ctx.rotate(o.tilt || 0);
  if (o.hat === 'bonnet') { // capota / pañuelo por detrás
    ctx.beginPath(); ctx.arc(0, 0, headR + 16, Math.PI * .85, Math.PI * 2.15); ctx.closePath(); inked(o.hatColor || '#6B3A5A', 6);
  }
  ctx.beginPath(); ctx.arc(0, 0, headR, 0, 7); inked('#FFFFFF', 6);
  face(o, headR, f);
  if (o.hat === 'cap') { // gorra plana obrera
    ctx.beginPath(); ctx.moveTo(-headR - 6, -18); ctx.quadraticCurveTo(-headR + 4, -headR - 18, 10, -headR - 14);
    ctx.quadraticCurveTo(headR + 10, -headR - 8, headR + 6, -22); ctx.closePath();
    inked(o.hatColor || '#4A4A52', 6);
    ctx.beginPath(); ctx.moveTo(f * (headR - 20), -22); ctx.quadraticCurveTo(f * (headR + 30), -26, f * (headR + 44), -12);
    ctx.lineTo(f * (headR - 10), -10); ctx.closePath(); inked(shade(o.hatColor || '#4A4A52', -.25), 5);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 18, -headR - 10); ctx.lineTo(i * 22, -28); ctx.stroke(); }
  } else if (o.hat === 'hair') { // pelo negro con flequillo
    ctx.beginPath(); ctx.arc(0, -4, headR + 5, Math.PI * .95, Math.PI * 2.05);
    ctx.quadraticCurveTo(headR * .5, -headR * .45, f * 10, -headR * .55);
    ctx.quadraticCurveTo(-headR * .5, -headR * .3, -headR - 5, -2); ctx.closePath(); inked(o.hatColor || '#1C1C22', 5);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-14, -30, 34, 3.6, 4.4); ctx.stroke();
  } else if (o.hat === 'police') {
    ctx.beginPath(); ctx.moveTo(-headR - 4, -20); ctx.lineTo(-headR + 6, -headR - 20); ctx.lineTo(headR - 6, -headR - 20); ctx.lineTo(headR + 4, -20); ctx.closePath(); inked('#1E2D5A', 6);
    ctx.beginPath(); ctx.moveTo(-headR - 4, -20); ctx.lineTo(headR + 4, -20); ctx.lineTo(f * (headR + 34), -6); ctx.lineTo(-f * 20, -10); ctx.closePath(); inked('#111827', 5);
    ctx.beginPath(); ctx.arc(0, -headR + 6, 14, 0, 7); inked('#E7C25A', 4);
  } else if (o.hat === 'fedora') {
    ctx.beginPath(); ctx.ellipse(0, -36, headR + 40, 16, 0, 0, 7); inked(o.hatColor || '#2B2B33', 6);
    ctx.beginPath(); ctx.moveTo(-headR + 6, -36); ctx.quadraticCurveTo(-headR + 10, -headR - 52, 0, -headR - 40); ctx.quadraticCurveTo(headR - 10, -headR - 52, headR - 6, -36); ctx.closePath(); inked(o.hatColor || '#2B2B33', 6);
    ctx.fillStyle = o.band || '#8A2B2B'; ctx.fillRect(-headR + 8, -58, headR * 2 - 16, 16);
  } else if (o.hat === 'tophat') {
    ctx.beginPath(); ctx.ellipse(0, -40, headR + 28, 14, 0, 0, 7); inked('#141418', 6);
    roundRect(-headR + 8, -headR - 110, headR * 2 - 16, headR + 74, 8); inked('#141418', 6);
    ctx.fillStyle = '#7A1E2B'; ctx.fillRect(-headR + 10, -66, headR * 2 - 20, 16);
  } else if (o.hat === 'beret') {
    ctx.beginPath(); ctx.ellipse(f * 8, -headR + 10, headR + 14, 30, f * -.15, 0, 7); inked(o.hatColor || '#5A2E2E', 6);
  } else if (o.hat === 'jester') { // gorro puntiagudo con pluma (flautista)
    ctx.beginPath(); ctx.moveTo(-headR - 4, -20); ctx.quadraticCurveTo(-10, -headR * 1.4, f * headR * 1.5, -headR * 1.9); ctx.quadraticCurveTo(headR * .6, -headR * .8, headR + 4, -20); ctx.closePath(); inked(o.hatColor || '#C8322E', 6);
    ctx.beginPath(); ctx.moveTo(-headR - 4, -20); ctx.lineTo(headR + 4, -20); ctx.lineWidth = 14; ctx.strokeStyle = '#F2C53A'; ctx.stroke();
    ctx.save(); ctx.translate(-f * 30, -headR - 10); ctx.rotate(-f * .5);
    ctx.beginPath(); ctx.ellipse(0, -40, 14, 48, 0, 0, 7); inked('#3FAE5A', 4); ctx.restore();
  } else if (o.hat === 'longhair') {
    ctx.beginPath(); ctx.moveTo(-headR - 8, 70); ctx.quadraticCurveTo(-headR - 26, -headR - 20, 0, -headR - 10); ctx.quadraticCurveTo(headR + 26, -headR - 20, headR + 8, 70);
    ctx.quadraticCurveTo(headR * .6, 0, headR * .4, -headR * .55); ctx.quadraticCurveTo(0, -headR * .3, -headR * .4, -headR * .55); ctx.quadraticCurveTo(-headR * .6, 0, -headR - 8, 70); ctx.closePath();
    inked(o.hatColor || '#4A2A18', 5);
  } else if (o.hat === 'bun') {
    ctx.beginPath(); ctx.arc(0, -headR - 14, 30, 0, 7); inked(o.hatColor || '#3A2418', 5);
    ctx.beginPath(); ctx.arc(0, -4, headR + 4, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(0, -headR * .5, -headR - 4, -6); ctx.closePath(); inked(o.hatColor || '#3A2418', 5);
  } else if (o.hat === 'nightcap') {
    ctx.beginPath(); ctx.moveTo(-headR, -14); ctx.quadraticCurveTo(-10, -headR * 2.1, f * headR * 1.6, -headR * .3);
    ctx.quadraticCurveTo(headR * .4, -headR * .9, headR, -14); ctx.closePath(); inked('#E8E2D0', 6);
    ctx.beginPath(); ctx.arc(f * headR * 1.6, -headR * .3, 14, 0, 7); inked('#FFFFFF', 5);
  } else if (o.hat === 'bonnet') {
    ctx.beginPath(); ctx.arc(0, -6, headR + 4, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 16; ctx.strokeStyle = o.hatColor || '#6B3A5A'; ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  }
  if (o.mustache) { ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(f * 10, 14); ctx.quadraticCurveTo(f * 10 - 30, 6, f * 10 - 36, 22); ctx.quadraticCurveTo(f * 10 - 14, 20, f * 10, 18); ctx.quadraticCurveTo(f * 10 + 14, 20, f * 10 + 36, 22); ctx.quadraticCurveTo(f * 10 + 30, 6, f * 10, 14); ctx.fill(); }
  if (o.glasses) { ctx.fillStyle = INK; for (const sd of [-1, 1]) { roundRect(f * 10 + sd * 22 - 18, -18, 36, 24, 8); ctx.fill(); } ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(f * 10 - 6, -10); ctx.lineTo(f * 10 + 6, -10); ctx.stroke(); }
  if (o.blush) { ctx.fillStyle = 'rgba(255,120,120,0.45)'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(f * 10 + sd * 34, 12, 12, 7, 0, 0, 7); ctx.fill(); } }
  ctx.restore();
  ctx.restore();
  return { hands, head: { x: x + hx * s, y: y + hy * s, r: headR * s } };
}
function face(o, R, f) {
  const ex = f * 10, ey = -6;
  const eyes = o.eyes || 'open';
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  for (const side of [-1, 1]) {
    const x = ex + side * 22, y = ey;
    if (eyes === 'open') { ctx.beginPath(); ctx.arc(x, y, 7.5, 0, 7); ctx.fill(); }
    else if (eyes === 'wide') { ctx.beginPath(); ctx.arc(x, y, 15, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + f * 2, y, 6, 0, 7); ctx.fill(); }
    else if (eyes === 'closed') { ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y - 2, 9, .3, Math.PI - .3); ctx.stroke(); }
    else if (eyes === 'sleepy') { ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 11, y); ctx.lineTo(x + 11, y); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y + 2, 5, 0, Math.PI); ctx.fill(); }
    else if (eyes === 'happy') { ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y + 4, 9, Math.PI + .3, -.3); ctx.stroke(); }
  }
  if (o.brows === 'worried') { ctx.lineWidth = 5; for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(ex + side * 12, ey - 24); ctx.lineTo(ex + side * 32, ey - 18); ctx.stroke(); } }
  if (o.brows === 'angry') { ctx.lineWidth = 5; for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(ex + side * 12, ey - 18); ctx.lineTo(ex + side * 32, ey - 26); ctx.stroke(); } }
  const m = o.mouth || 'flat', my = 26;
  ctx.lineWidth = 5;
  if (m === 'flat') { ctx.beginPath(); ctx.moveTo(ex - 12, my); ctx.lineTo(ex + 12, my); ctx.stroke(); }
  else if (m === 'smile') { ctx.beginPath(); ctx.arc(ex, my - 8, 14, .4, Math.PI - .4); ctx.stroke(); }
  else if (m === 'o') { ctx.beginPath(); ctx.ellipse(ex, my + 2, 9, 12, 0, 0, 7); ctx.fill(); }
  else if (m === 'frown') { ctx.beginPath(); ctx.arc(ex, my + 10, 13, Math.PI + .5, -.5); ctx.stroke(); }
  else if (m === 'wavy') { ctx.beginPath(); ctx.moveTo(ex - 16, my); for (let i = 1; i <= 4; i++) ctx.lineTo(ex - 16 + i * 8, my + (i % 2 ? -5 : 4)); ctx.stroke(); }
  else if (m === 'puff') { ctx.fillStyle = '#FFC9C9'; for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(ex + side * 22, my, 13, 0, 7); ctx.fill(); ctx.stroke(); } ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + f * 4, my, 6, 0, 7); ctx.fill(); }
  else if (m === 'grin') { ctx.beginPath(); ctx.moveTo(ex - 18, my - 4); ctx.quadraticCurveTo(ex, my + 22, ex + 18, my - 4); ctx.closePath(); ctx.fill(); }
}
function shade(hex, k) {
  if (typeof hex !== 'string' || hex[0] !== '#') return hex;
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => clamp(Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)), 0, 255);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
/* palo largo del despertador humano */
function pole(x1, y1, x2, y2) {
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = '#B07A3E'; ctx.lineWidth = 9; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,220,160,0.5)'; ctx.lineWidth = 3; ctx.stroke();
  // nudos de bambú
  const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
  ctx.strokeStyle = INK; ctx.lineWidth = 4;
  for (let d = 120; d < L - 30; d += 140) { const px = x1 + ux * d, py = y1 + uy * d; ctx.beginPath(); ctx.moveTo(px - uy * 8, py + ux * 8); ctx.lineTo(px + uy * 8, py - ux * 8); ctx.stroke(); }
  // punta con alambre
  ctx.fillStyle = '#6E6E74'; ctx.beginPath(); ctx.arc(x2, y2, 11, 0, 7); ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}

/* ============================================================
   FONDOS
   ============================================================ */
function nightSky(t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, 1500);
  g.addColorStop(0, o.top || '#0A0F2C'); g.addColorStop(1, o.bottom || '#3A2C5E');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = rng(o.seed || 5);
  for (let i = 0; i < 110; i++) {
    const x = r() * W, y = r() * 900, s = .8 + r() * 2.2;
    ctx.fillStyle = `rgba(255,255,240,${(.35 + r() * .6) * (.7 + .3 * Math.sin(t * 2 + i))})`;
    ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
  }
  if (o.moon !== false) moon(o.mx || 820, o.my || 260, 90);
}
function moon(x, y, r) {
  const g = ctx.createRadialGradient(x, y, r * .5, x, y, r * 3.2);
  g.addColorStop(0, 'rgba(255,245,210,0.35)'); g.addColorStop(1, 'rgba(255,245,210,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, 7); ctx.fill();
  const mg = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .2, x, y, r);
  mg.addColorStop(0, '#FFFBE8'); mg.addColorStop(1, '#E9DDB0');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(180,165,120,0.35)';
  for (const [dx, dy, rr] of [[-25, -20, 18], [30, 10, 13], [-5, 35, 10], [35, -35, 8]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, rr, 0, 7); ctx.fill(); }
}
/* fila de casas adosadas de ladrillo (estilo inglés) */
const HOUSE_W = 400;
function houses(camX, groundY, t, o = {}) {
  const first = Math.floor((camX - 200) / HOUSE_W) - 1;
  for (let i = first; i < first + 5; i++) {
    const x = i * HOUSE_W - camX;
    house(x, groundY, i, t, o);
  }
}
function house(x, gy, idx, t, o) {
  const r = rng(1000 + idx * 7);
  const h = 860, top = gy - h;
  const brick = ['#8A4434', '#7C3E31', '#94503A', '#83463A'][((idx % 4) + 4) % 4];
  // chimenea + humo
  const chx = x + 60 + r() * 220;
  ctx.fillStyle = shade(brick, -.15); ctx.fillRect(chx, top - 110, 80, 130);
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(chx, top - 110, 80, 130);
  for (let k = 0; k < 2; k++) { roundRect(chx + 8 + k * 36, top - 140, 28, 34, 6); inked('#B5674A', 5); }
  for (let k = 0; k < 6; k++) {
    const ph = (t * .25 + k / 6 + idx * .13) % 1;
    ctx.fillStyle = `rgba(200,200,215,${.22 * (1 - ph)})`;
    ctx.beginPath(); ctx.arc(chx + 40 + Math.sin(ph * 6 + idx) * 30 + ph * 80, top - 150 - ph * 300, 26 + ph * 60, 0, 7); ctx.fill();
  }
  // tejado
  ctx.fillStyle = '#2B2D3A'; ctx.fillRect(x - 2, top - 30, HOUSE_W + 4, 44);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.strokeRect(x - 2, top - 30, HOUSE_W + 4, 44);
  // fachada
  ctx.fillStyle = brick; ctx.fillRect(x, top + 14, HOUSE_W, h - 14);
  ctx.save(); ctx.beginPath(); ctx.rect(x, top + 14, HOUSE_W, h - 14); ctx.clip();
  ctx.strokeStyle = 'rgba(30,10,5,0.28)'; ctx.lineWidth = 2.5;
  for (let yy = top + 14, row = 0; yy < gy; yy += 26, row++) {
    ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + HOUSE_W, yy); ctx.stroke();
    for (let xx = x + (row % 2) * 30; xx < x + HOUSE_W; xx += 60) { ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + 26); ctx.stroke(); }
  }
  // ladrillos sueltos con otro tono
  for (let k = 0; k < 26; k++) { ctx.fillStyle = `rgba(${r() > .5 ? '255,200,170' : '40,10,5'},0.12)`; ctx.fillRect(x + Math.floor(r() * 7) * 60 + (r() > .5 ? 30 : 0), top + 14 + Math.floor(r() * 32) * 26, 58, 24); }
  ctx.restore();
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(x, top + 14, HOUSE_W, h - 14);
  // ventana superior (la que se golpea)
  const lit = o.lit ? o.lit(idx) : r() > .7;
  windowFrame(x + 110, top + 140, 180, 230, lit, t, idx, o);
  // puerta
  const dc = ['#2F5D50', '#5A2A2A', '#28405F', '#3D3D3D'][((idx % 4) + 4) % 4];
  roundRect(x + 40, gy - 330, 130, 330, 8); inked(dc, 6);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 4;
  ctx.strokeRect(x + 58, gy - 305, 94, 120); ctx.strokeRect(x + 58, gy - 165, 94, 130);
  ctx.fillStyle = '#E7C25A'; ctx.beginPath(); ctx.arc(x + 150, gy - 170, 8, 0, 7); ctx.fill();
  ctx.fillStyle = '#9AA0A8'; ctx.fillRect(x + 30, gy - 345, 150, 18); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(x + 30, gy - 345, 150, 18);
  // pizarrita con la hora junto a la puerta
  if (o.slates) { roundRect(x + 190, gy - 270, 70, 54, 4); inked('#2E3B33', 4); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = `700 22px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(['4:30', '5:00', '4:45', '5:15'][((idx % 4) + 4) % 4], x + 225, gy - 236); ctx.textAlign = 'left'; }
  // ventana inferior
  windowFrame(x + 230, gy - 300, 140, 190, r() > .8, t, idx + 50, o);
  // escalón
  ctx.fillStyle = '#A8A39A'; ctx.fillRect(x + 30, gy - 16, 150, 16); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(x + 30, gy - 16, 150, 16);
}
function windowFrame(x, y, w, h, lit, t, seed, o = {}) {
  const r = rng(seed * 13 + 3);
  ctx.fillStyle = '#D8D2C4'; ctx.fillRect(x - 14, y - 14, w + 28, h + 28); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(x - 14, y - 14, w + 28, h + 28);
  ctx.fillStyle = '#C9C2B2'; ctx.fillRect(x - 24, y + h + 14, w + 48, 18); ctx.strokeRect(x - 24, y + h + 14, w + 48, 18);
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  if (lit) { g.addColorStop(0, '#FFE6A0'); g.addColorStop(1, '#F2A94B'); }
  else { g.addColorStop(0, '#26355E'); g.addColorStop(1, '#141B33'); }
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  if (lit) { const lg = ctx.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, w * 1.4); lg.addColorStop(0, 'rgba(255,210,120,0.35)'); lg.addColorStop(1, 'rgba(255,210,120,0)'); ctx.fillStyle = lg; ctx.fillRect(x - w, y - h, w * 3, h * 3); }
  // cortinas
  ctx.fillStyle = lit ? 'rgba(170,60,50,0.85)' : 'rgba(60,40,70,0.9)';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * .3, y); ctx.quadraticCurveTo(x + w * .18, y + h * .5, x + w * .26, y + h); ctx.lineTo(x, y + h); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w * .7, y); ctx.quadraticCurveTo(x + w * .82, y + h * .5, x + w * .74, y + h); ctx.lineTo(x + w, y + h); ctx.fill();
  if (o.inWindow) o.inWindow(seed, x, y, w, h);
  // reflejo
  if (!lit) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(x + w * .15, y + h); ctx.lineTo(x + w * .55, y); ctx.lineTo(x + w * .7, y); ctx.lineTo(x + w * .3, y + h); ctx.fill(); }
  // marcos
  ctx.strokeStyle = '#E9E4D8'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
  ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w, h);
}
function street(gy, camX = 0) {
  // acera
  ctx.fillStyle = '#6D6A72'; ctx.fillRect(0, gy, W, 70);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 3;
  for (let x = -((camX) % 120); x < W; x += 120) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy + 70); ctx.stroke(); }
  // bordillo
  ctx.fillStyle = '#8E8A90'; ctx.fillRect(0, gy + 70, W, 22); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-5, gy + 70, W + 10, 22);
  // adoquines
  const g = ctx.createLinearGradient(0, gy + 92, 0, H);
  g.addColorStop(0, '#3E3A45'); g.addColorStop(1, '#25222B');
  ctx.fillStyle = g; ctx.fillRect(0, gy + 92, W, H - gy);
  for (let row = 0, y = gy + 110; y < H + 30; row++, y += 34 + row * 3) {
    const sz = 50 + row * 6;
    for (let x = -((camX * (1 + row * .08)) % sz) - (row % 2) * sz / 2; x < W + sz; x += sz) {
      ctx.fillStyle = `rgba(${row % 2 ? '120,115,130' : '95,90,105'},0.55)`;
      ctx.beginPath(); ctx.ellipse(x, y, sz * .42, 12 + row * 1.6, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    }
  }
}
function gasLamp(x, gy, t) {
  const top = gy - 720;
  const lg = ctx.createRadialGradient(x, top + 40, 10, x, top + 40, 420);
  lg.addColorStop(0, `rgba(255,214,130,${0.55 + Math.sin(t * 9) * .03})`); lg.addColorStop(1, 'rgba(255,214,130,0)');
  ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(x, top + 40, 420, 0, 7); ctx.fill();
  ctx.fillStyle = '#1F2228'; ctx.fillRect(x - 10, top + 80, 20, 640); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(x - 10, top + 80, 20, 640);
  ctx.fillRect(x - 26, gy - 40, 52, 40);
  ctx.beginPath(); ctx.moveTo(x - 40, top); ctx.lineTo(x + 40, top); ctx.lineTo(x + 28, top + 80); ctx.lineTo(x - 28, top + 80); ctx.closePath();
  ctx.fillStyle = '#FFE3A0'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 50, top); ctx.lineTo(x, top - 40); ctx.lineTo(x + 50, top); ctx.closePath(); inked('#1F2228', 5);
}
function fog(t, y, alpha = .25) {
  for (let i = 0; i < 6; i++) {
    const x = ((i * 300 + t * 25) % (W + 600)) - 300;
    const g = ctx.createRadialGradient(x, y, 10, x, y, 320);
    g.addColorStop(0, `rgba(190,190,220,${alpha})`); g.addColorStop(1, 'rgba(190,190,220,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, 420, 120, 0, 0, 7); ctx.fill();
  }
}
/* despertador mecánico de campanas */
function alarmClock(x, y, s, ring = 0, t = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const sh = ring ? Math.sin(t * 60) * 4 * ring : 0;
  ctx.rotate(sh * .01); ctx.translate(sh, 0);
  // patas
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 50, 80); ctx.lineTo(sx * 75, 125); ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.stroke(); }
  // campanas
  for (const sx of [-1, 1]) {
    ctx.save(); ctx.translate(sx * 62, -88); ctx.rotate(sx * .5 + (ring ? Math.sin(t * 50 + sx) * .1 : 0));
    ctx.beginPath(); ctx.arc(0, 0, 42, Math.PI, 0); ctx.closePath(); inked('#D9A62E', 6);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(-14, -18, 8, 14, -.5, 0, 7); ctx.fill();
    ctx.restore();
  }
  ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(0, -128); ctx.lineWidth = 10; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -134, 12, 0, 7); inked('#D9A62E', 5);
  // cuerpo
  ctx.beginPath(); ctx.arc(0, 0, 100, 0, 7);
  const g = ctx.createRadialGradient(-30, -30, 10, 0, 0, 100); g.addColorStop(0, o.color2 || '#F0634F'); g.addColorStop(1, o.color || '#A52A1E');
  inked(g, 7);
  ctx.beginPath(); ctx.arc(0, 0, 78, 0, 7); inked('#FFF8E8', 5);
  ctx.fillStyle = INK; ctx.font = `800 22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; ctx.fillText(String(i), Math.cos(a) * 60, Math.sin(a) * 60); }
  ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(-Math.PI / 2 + 4 / 12 * Math.PI * 2) * 30, Math.sin(-Math.PI / 2 + 4 / 12 * Math.PI * 2) * 30); ctx.stroke();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(-Math.PI / 2 + Math.PI) * 50, Math.sin(-Math.PI / 2 + Math.PI) * 50); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill();
  if (ring) {
    ctx.strokeStyle = `rgba(255,255,255,${ring})`; ctx.lineWidth = 6;
    for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(sx * 70, -90, 70 + k * 22, sx > 0 ? -1.2 : Math.PI + .2, sx > 0 ? -.2 : Math.PI + 1.2); ctx.stroke(); }
  }
  ctx.restore();
}
function priceTag(x, y, text, t, s = 1, col = '#FFE9A8') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3) * .12); ctx.scale(s, s);
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(0, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(90, 0); ctx.lineTo(110, 45); ctx.lineTo(90, 90); ctx.lineTo(-90, 90); ctx.closePath(); inked(col, 6);
  ctx.fillStyle = INK; ctx.font = `900 40px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 47);
  ctx.restore();
}
function coin(x, y, r, spin) {
  const sx = Math.abs(Math.cos(spin)) * .9 + .1;
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7);
  const g = ctx.createRadialGradient(-r * .3, -r * .3, 1, 0, 0, r); g.addColorStop(0, '#FFF1B0'); g.addColorStop(.5, '#E2B33C'); g.addColorStop(1, '#9C6E14');
  inked(g, 5);
  ctx.beginPath(); ctx.arc(0, 0, r * .7, 0, 7); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(120,80,10,0.7)'; ctx.stroke();
  ctx.restore();
}
function zzz(x, y, t, s = 1) {
  ctx.save(); ctx.font = `900 ${Math.round(56 * s)}px ${FONT}`; ctx.lineJoin = 'round';
  for (let i = 0; i < 3; i++) {
    const k = (t * .5 + i / 3) % 1;
    ctx.globalAlpha = Math.sin(k * Math.PI);
    const px = x + k * 90 * s + Math.sin(k * 6) * 10, py = y - k * 160 * s;
    ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.strokeText('Z', px, py);
    ctx.fillStyle = '#FFFFFF'; ctx.fillText('Z', px, py);
  }
  ctx.restore();
}

/* ---------- piezas comunes ---------- */
const SIGNS = [['パチンコ', '#FF3B6B'], ['ラーメン', '#FFC93C'], ['カラオケ', '#3BD1FF'], ['ホテル', '#B26BFF'], ['すし', '#FF7A3B'], ['ゲーム', '#5BFF8A']];
function ball(x, y, r) {
  const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(.35, '#D9DEE6'); g.addColorStop(.8, '#8A94A3'); g.addColorStop(1, '#4D5562');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * .18); ctx.strokeStyle = 'rgba(20,20,20,0.8)'; ctx.stroke();
}
function neonText(text, x, y, size, color, o = {}) {
  const flick = o.flicker ? (Math.sin(o.t * 37 + x) > .97 ? .35 : 1) : 1;
  ctx.save(); ctx.globalAlpha *= flick;
  ctx.font = `900 ${size}px ${o.jp ? JP : FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const chars = o.vertical ? [...text] : [text];
  chars.forEach((c, i) => {
    const yy = o.vertical ? y + i * size * 1.05 : y;
    ctx.shadowColor = color; ctx.shadowBlur = size * .6;
    ctx.fillStyle = color; ctx.fillText(c, x, yy);
    ctx.shadowBlur = size * .2; ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha *= .85; ctx.fillText(c, x, yy); ctx.globalAlpha /= .85;
  });
  ctx.restore();
}
function yenBill(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  roundRect(-80, -40, 160, 80, 6); inked('#E9E2C8', 5);
  ctx.strokeStyle = '#8A7A4A'; ctx.lineWidth = 3; ctx.strokeRect(-70, -30, 140, 60);
  ctx.beginPath(); ctx.ellipse(30, 0, 22, 26, 0, 0, 7); ctx.fillStyle = 'rgba(140,120,80,0.35)'; ctx.fill();
  ctx.fillStyle = '#6B5A2E'; ctx.font = `900 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('¥', -34, 2);
  ctx.restore();
}
function stamp(text, x, y, t, t0, o = {}) {
  if (t < t0) return;
  const k = prog(t, t0, t0 + .18), a = o.tOut !== undefined ? 1 - prog(t, o.tOut, o.tOut + .3) : 1;
  if (a <= 0) return;
  const s = lerp(2.2, 1, easeOut(k));
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -.14); ctx.scale(s, s); ctx.globalAlpha = k * a;
  ctx.font = `900 ${o.size || 96}px ${o.jp ? JP : FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + 70, h = (o.size || 96) * 1.45;
  ctx.lineWidth = 12; ctx.strokeStyle = o.color || '#E3352B';
  roundRect(-w / 2, -h / 2, w, h, 18); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = o.color || '#E3352B'; ctx.fillText(text, 0, 6);
  ctx.restore();
}
function label(text, x, y, o = {}) {
  ctx.save();
  ctx.font = `900 ${o.size || 40}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + 44, h = (o.size || 40) * 1.6;
  roundRect(x - w / 2, y - h / 2, w, h, h / 2); inked(o.bg || '#FFF6DC', 5);
  ctx.fillStyle = o.fg || INK; ctx.fillText(text, x, y + 2);
  ctx.restore();
}
function popIn(t, t0, fn, tOut) {
  const k = easeBack(prog(t, t0, t0 + .35)) * (tOut !== undefined ? 1 - prog(t, tOut, tOut + .3) : 1);
  if (k <= 0) return; fn(k);
}
function tokyoSky(t) {
  const g = ctx.createLinearGradient(0, 0, 0, 1500);
  g.addColorStop(0, '#0B0A24'); g.addColorStop(.6, '#2A1748'); g.addColorStop(1, '#5A2350');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = rng(4);
  for (let i = 0; i < 50; i++) { ctx.fillStyle = `rgba(255,255,255,${.2 + .4 * r()})`; ctx.beginPath(); ctx.arc(r() * W, r() * 600, 1 + r() * 1.5, 0, 7); ctx.fill(); }
}
function farCity(camX, t) {
  const r = rng(12);
  for (let i = -2; i < 14; i++) {
    const w = 120 + r() * 120, h = 500 + r() * 600, x = i * 150 - (camX * .3) % 150 - 100;
    ctx.fillStyle = '#1A1534'; ctx.fillRect(x, 1500 - h, w, h);
    for (let yy = 1500 - h + 30; yy < 1450; yy += 44) for (let xx = x + 16; xx < x + w - 20; xx += 34) {
      if (r() > .55) { ctx.fillStyle = r() > .5 ? 'rgba(255,220,140,0.5)' : 'rgba(140,200,255,0.35)'; ctx.fillRect(xx, yy, 18, 24); }
    }
  }
}
function signBuilding(x, gy, w, h, idx, t) {
  const top = gy - h;
  roundRect(x, top, w, h + 20, 4); inked(['#2E2848', '#3A2E40', '#2A3446', '#3B2F2A'][idx % 4], 6);
  const r = rng(300 + idx);
  for (let yy = top + 40; yy < gy - 340; yy += 90) for (let xx = x + 24; xx < x + w - 60; xx += 80) {
    roundRect(xx, yy, 56, 60, 4); inked(r() > .45 ? '#FFD98A' : '#22203A', 4);
  }
  // letrero vertical de neón
  const [txt, col] = SIGNS[((idx % SIGNS.length) + SIGNS.length) % SIGNS.length];
  const sx = x + w - 40, sy = top + 60, sh = [...txt].length * 76 + 40;
  roundRect(sx - 44, sy, 88, sh, 10); inked('#14121F', 5);
  neonText(txt, sx, sy + 58, 64, col, { vertical: true, jp: true, flicker: true, t });
  // toldo con luz
  ctx.fillStyle = col; ctx.globalAlpha = .9; ctx.fillRect(x + 10, gy - 300, w - 20, 40); ctx.globalAlpha = 1;
  ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(x + 10, gy - 300, w - 20, 40);
  const lg = ctx.createLinearGradient(0, gy - 260, 0, gy); lg.addColorStop(0, 'rgba(255,230,180,0.25)'); lg.addColorStop(1, 'rgba(255,230,180,0)');
  ctx.fillStyle = lg; ctx.fillRect(x + 10, gy - 260, w - 20, 260);
}
function parlor(x, gy, t, o = {}) {
  const w = 760, h = 1080, top = gy - h;
  roundRect(x, top, w, h + 20, 6); inked('#2B1E3C', 7);
  // gran letrero con bombillas
  roundRect(x + 40, top + 50, w - 80, 230, 22); inked('#130F22', 7);
  const n = 34;
  for (let i = 0; i < n; i++) {
    const k = i / n, per = 2 * (w - 80 + 230);
    let d = k * per, bx, by;
    if (d < w - 80) { bx = x + 40 + d; by = top + 50; }
    else if ((d -= w - 80) < 230) { bx = x + w - 40; by = top + 50 + d; }
    else if ((d -= 230) < w - 80) { bx = x + w - 40 - d; by = top + 280; }
    else { d -= w - 80; bx = x + 40; by = top + 280 - d; }
    const on = (Math.floor(t * 10) + i) % 3 === 0;
    ctx.fillStyle = on ? '#FFF2B0' : '#9A7A3A'; ctx.shadowColor = '#FFD84A'; ctx.shadowBlur = on ? 20 : 0;
    ctx.beginPath(); ctx.arc(bx, by, 10, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  }
  neonText('パチンコ', x + w / 2, top + 150, 120, '#FF3B6B', { jp: true, flicker: true, t });
  neonText('PACHINKO', x + w / 2, top + 240, 52, '#FFD84A', {});
  // banderolas
  for (let i = 0; i < 2; i++) {
    const bx = x + 60 + i * (w - 180);
    roundRect(bx, top + 330, 60, 300, 6); inked(i ? '#E3352B' : '#2F7BE0', 5);
    ctx.fillStyle = '#fff'; ctx.font = `900 46px ${JP}`; ctx.textAlign = 'center';
    [...(i ? '大当り' : '新台')].forEach((c, k) => ctx.fillText(c, bx + 30, top + 390 + k * 70));
  }
  // entrada de cristal con luz
  const dx = x + 180, dw = w - 360, dy = gy - 420;
  const lg = ctx.createRadialGradient(x + w / 2, gy - 200, 20, x + w / 2, gy - 200, 520);
  lg.addColorStop(0, 'rgba(255,240,190,0.55)'); lg.addColorStop(1, 'rgba(255,240,190,0)');
  ctx.fillStyle = lg; ctx.fillRect(x - 200, gy - 700, w + 400, 900);
  const open = o.open || 0;
  ctx.fillStyle = '#FFF3C8'; ctx.fillRect(dx, dy, dw, 420);
  // máquinas vistas a través del cristal
  for (let i = 0; i < 5; i++) { roundRect(dx + 20 + i * 80, dy + 90, 60, 200, 6); inked(['#E3352B', '#2F7BE0', '#F2B92E', '#7A3FA0', '#2EA65A'][i], 3); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(dx + 50 + i * 80, dy + 160, 20, 0, 7); ctx.fill(); }
  for (const sd of [0, 1]) {
    const pw = dw / 2, px = dx + sd * pw + (sd ? 1 : -1) * open * pw * .9;
    ctx.fillStyle = 'rgba(180,220,255,0.25)'; ctx.fillRect(px, dy, pw, 420);
    ctx.lineWidth = 6; ctx.strokeStyle = '#C9CED8'; ctx.strokeRect(px, dy, pw, 420);
  }
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(dx - 6, dy - 6, dw + 12, 426);
}
function asphalt(gy, camX = 0, t = 0) {
  const g = ctx.createLinearGradient(0, gy, 0, H); g.addColorStop(0, '#2A2436'); g.addColorStop(1, '#141220');
  ctx.fillStyle = g; ctx.fillRect(0, gy, W, H - gy);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  // reflejos de neón en el suelo mojado
  const r = rng(8);
  for (let i = 0; i < 14; i++) {
    const x = ((r() * 1400 - camX * .9) % 1400 + 1400) % 1400 - 160, c = SIGNS[i % SIGNS.length][1];
    ctx.fillStyle = c; ctx.globalAlpha = .18 + .06 * Math.sin(t * 3 + i);
    ctx.fillRect(x, gy + 30 + r() * 220, 14 + r() * 26, 60 + r() * 120); ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 10; ctx.setLineDash([60, 60]); ctx.lineDashOffset = camX;
  ctx.beginPath(); ctx.moveTo(0, gy + 200); ctx.lineTo(W, gy + 200); ctx.stroke(); ctx.setLineDash([]);
}
function wires(t) {
  ctx.strokeStyle = 'rgba(10,8,20,0.9)'; ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-20, 150 + i * 40); ctx.quadraticCurveTo(540, 260 + i * 50 + Math.sin(t + i) * 4, 1100, 120 + i * 45); ctx.stroke(); }
}
function sparkle(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2); ctx.scale(s, s);
  ctx.fillStyle = '#FFF6C8'; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = i % 2 ? 8 : 30; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function hand(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  roundRect(-26, -60, 52, 80, 18); inked('#3A3A44', 5);
  ctx.beginPath(); ctx.ellipse(0, 40, 34, 30, 0, 0, 7); inked('#FFFFFF', 5);
  ctx.restore();
}
function MONO() { return '"DejaVu Sans Mono", monospace'; }
const cap = (si, k) => CAPS[si][Math.min(k, CAPS[si].length - 1)][0];

/* ---------- montaje: escenas a partir de tiempos.js ---------- */
function buildScenes(fns, extraEnd = 2.6) {
  const S = []; let s = 0;
  DURS.forEach((d, i) => { const e = s + d + (i === DURS.length - 1 ? extraEnd : 0); S.push({ start: s, end: e, draw: fns[i] }); s = e; });
  return S;
}
function startVideo(fns, extraEnd = 2.6) {
  const SCENES = buildScenes(fns, extraEnd);
  const DURATION = SCENES[SCENES.length - 1].end, TRANS = 0.25;
  function draw(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '0px';
    let i = SCENES.findIndex(s => t >= s.start && t < s.end); if (i < 0) i = SCENES.length - 1;
    const sc = SCENES[i], lt = t - sc.start, zoom = 1 + lt * 0.006;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2);
    sc.draw(lt); ctx.restore();
    ctx.textAlign = 'left';
    if (i > 0 && lt < TRANS) { ctx.fillStyle = `rgba(255,255,255,${(1 - lt / TRANS) * .5})`; ctx.fillRect(0, 0, W, H); }
    finishFrame();
  }
  window.draw = draw; window.DURATION = DURATION; window.SCENES = SCENES;
  window.frameJPEG = (t, q) => { draw(t); return cv.toDataURL('image/jpeg', q || 0.93); };
  if (!location.search.includes('render')) { const t0 = performance.now(); (function loop() { draw(((performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); })(); }
}

/* ---------- piezas extra para historias ---------- */
function questionBox(l1, l2, t, t0, o = {}) {
  const qp = easeBack(prog(t, t0 - .1, t0 + .3)); if (qp <= 0) return;
  ctx.save(); ctx.translate(540, o.y || 520); ctx.scale(qp, qp);
  ctx.font = `900 ${o.size || 66}px ${FONT}`;
  const w = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width) + 120;
  roundRect(-w / 2, -150, w, 300, 40); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; inked('#FFF6DC', 8); ctx.shadowColor = 'transparent';
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(l1, 0, -55); ctx.fillText(l2, 0, 30);
  ctx.font = `800 42px ${FONT}`; ctx.fillStyle = '#B3261E'; ctx.fillText('Comenta 👇', 0, 108);
  ctx.restore();
}
function parchment(lines, x, y, w, h, t, t0, o = {}) {
  popIn(t, t0, k => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(o.rot || -.03);
    ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2);
    for (let i = 0; i <= 10; i++) ctx.lineTo(-w / 2 + w * i / 10, -h / 2 + (i % 2 ? 8 : -4));
    ctx.lineTo(w / 2, h / 2); for (let i = 10; i >= 0; i--) ctx.lineTo(-w / 2 + w * i / 10, h / 2 + (i % 2 ? -6 : 6)); ctx.closePath();
    const g = ctx.createRadialGradient(0, 0, 20, 0, 0, w * .7); g.addColorStop(0, '#F6E7C1'); g.addColorStop(1, '#D9B97E');
    inked(g, 6);
    ctx.fillStyle = '#3A2410'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const reveal = prog(t, t0 + .2, t0 + .2 + (o.write || 1.2));
    lines.forEach((ln, i) => {
      const [txt, size, font] = Array.isArray(ln) ? ln : [ln, o.size || 46, FONT];
      ctx.font = `${o.italic ? 'italic ' : ''}800 ${size}px ${font}`;
      const n = Math.floor(txt.length * clamp(reveal * lines.length - i));
      ctx.fillText(txt.slice(0, n), 0, -((lines.length - 1) * (o.lh || 64)) / 2 + i * (o.lh || 64));
    });
    ctx.restore();
  }, o.tOut);
}
function musicNote(x, y, s, col = '#FFFFFF') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(-14, 30, 20, 14, -.4, 0, 7); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(36, 18, 20, 14, -.4, 0, 7); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(4, 26); ctx.lineTo(4, -40); ctx.lineTo(54, -52); ctx.lineTo(54, 14); ctx.stroke();
  ctx.restore();
}
function noSign(x, y, r, t, t0, drawInside, tOut) {
  popIn(t, t0, k => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.fillStyle = 'rgba(10,8,20,0.6)'; ctx.beginPath(); ctx.arc(0, 0, r * 1.1, 0, 7); ctx.fill();
    drawInside && drawInside();
    ctx.lineWidth = r * .16; ctx.strokeStyle = '#E3352B'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * .7, -r * .7); ctx.lineTo(r * .7, r * .7); ctx.stroke();
    ctx.restore();
  }, tOut);
}
function bigNumber(text, x, y, size, t, t0, o = {}) {
  popIn(t, t0, k => {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(o.rot || -.05);
    ctx.font = `900 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = size * .16; ctx.strokeText(text, 0, 0);
    ctx.fillStyle = o.color || '#FFD84A'; ctx.fillText(text, 0, 0);
    if (o.sub) { ctx.font = `900 ${size * .3}px ${FONT}`; ctx.lineWidth = size * .07; ctx.strokeText(o.sub, 0, size * .62); ctx.fillStyle = '#fff'; ctx.fillText(o.sub, 0, size * .62); }
    ctx.restore();
  }, o.tOut);
}
function dim(t, t0, a = .75, tOut) {
  const k = prog(t, t0 - .2, t0 + .1) * (tOut !== undefined ? 1 - prog(t, tOut, tOut + .3) : 1);
  if (k > 0) { ctx.fillStyle = `rgba(8,6,20,${a * k})`; ctx.fillRect(0, 0, W, H); }
}
/* brazos de baile: devuelve [a1, a2] */
const danceArms = (t, ph = 0, sp = 8) => [2.3 + Math.sin(t * sp + ph) * .7, 2.3 + Math.sin(t * sp + ph + 2) * .7];

/* ---------- pueblo medieval (Hamelín / Estrasburgo) ---------- */
function daySky(t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, 1500);
  const c = o.dusk ? ['#2B2350', '#B5566A', '#F2A65A'] : o.night ? ['#0A0F2C', '#2A2552', '#3A2C5E'] : ['#6FB7E8', '#A8D8F0', '#E8F2E0'];
  g.addColorStop(0, c[0]); g.addColorStop(.6, c[1]); g.addColorStop(1, c[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (!o.night && !o.dusk) { // nubes
    for (let i = 0; i < 4; i++) {
      const x = ((i * 330 + t * 18) % 1500) - 200, y = 140 + (i % 2) * 120;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (const [dx, dy, r] of [[0, 0, 50], [50, -20, 60], [100, 0, 48], [50, 20, 50]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r, 0, 7); ctx.fill(); }
    }
    const sg = ctx.createRadialGradient(850, 230, 20, 850, 230, 260); sg.addColorStop(0, 'rgba(255,240,180,0.9)'); sg.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, 600);
    ctx.beginPath(); ctx.arc(850, 230, 70, 0, 7); inked('#FFE68A', 5);
  } else if (o.night) {
    const r = rng(5); for (let i = 0; i < 80; i++) { ctx.fillStyle = `rgba(255,255,240,${.3 + .5 * r()})`; ctx.beginPath(); ctx.arc(r() * W, r() * 800, 1 + r() * 1.5, 0, 7); ctx.fill(); }
    moon(820, 250, 80);
  }
}
function hills(y, col = '#7FA35A', col2 = '#5E8A44') {
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, y);
  for (let x = 0; x <= W; x += 60) ctx.lineTo(x, y - 90 - Math.sin(x / 180) * 60 - Math.sin(x / 70) * 15);
  ctx.lineTo(W, y + 200); ctx.lineTo(0, y + 200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col2; ctx.beginPath(); ctx.moveTo(0, y + 40);
  for (let x = 0; x <= W; x += 60) ctx.lineTo(x, y - 20 - Math.sin(x / 140 + 2) * 40);
  ctx.lineTo(W, y + 200); ctx.lineTo(0, y + 200); ctx.closePath(); ctx.fill();
}
const TIMBER_W = 300;
function timberHouse(x, gy, idx, t, o = {}) {
  const r = rng(500 + idx * 17);
  const w = TIMBER_W - 10, h = 620 + r() * 260, top = gy - h, roofH = 260 + r() * 80;
  const plaster = ['#F3E6CC', '#EAD9B8', '#F5E9D6', '#E9D2B0'][((idx % 4) + 4) % 4];
  const beam = ['#5A3420', '#4A2C1C', '#6A3E24'][((idx % 3) + 3) % 3];
  const roof = ['#A8432E', '#8E3A2A', '#B5553A', '#7A3424'][((idx % 4) + 4) % 4];
  // tejado a dos aguas (fachada de hastial)
  ctx.beginPath(); ctx.moveTo(x - 14, top); ctx.lineTo(x + w / 2, top - roofH); ctx.lineTo(x + w + 14, top); ctx.closePath(); inked(roof, 6);
  ctx.save(); ctx.beginPath(); ctx.moveTo(x - 14, top); ctx.lineTo(x + w / 2, top - roofH); ctx.lineTo(x + w + 14, top); ctx.closePath(); ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; for (let yy = top - roofH; yy < top; yy += 26) { ctx.beginPath(); ctx.moveTo(x - 20, yy); ctx.lineTo(x + w + 20, yy); ctx.stroke(); }
  ctx.restore();
  // hastial con entramado
  ctx.beginPath(); ctx.moveTo(x + 30, top); ctx.lineTo(x + w / 2, top - roofH + 50); ctx.lineTo(x + w - 30, top); ctx.closePath(); inked(plaster, 5);
  ctx.save(); ctx.clip(); ctx.strokeStyle = beam; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(x + w / 2, top - roofH + 50); ctx.lineTo(x + w / 2, top); ctx.moveTo(x + 60, top - 40); ctx.lineTo(x + w - 60, top - 40); ctx.stroke(); ctx.restore();
  ctx.beginPath(); ctx.arc(x + w / 2, top - roofH * .45, 22, 0, 7); inked(o.night ? '#FFD98A' : '#3A4A6A', 4);
  // fachada
  ctx.fillStyle = plaster; ctx.fillRect(x, top, w, h); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(x, top, w, h);
  // vigas de entramado
  ctx.save(); ctx.beginPath(); ctx.rect(x, top, w, h); ctx.clip();
  ctx.strokeStyle = beam; ctx.lineWidth = 14;
  const floors = Math.floor(h / 210);
  for (let f = 0; f <= floors; f++) { const yy = top + f * 210; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
  for (const xx of [x + 8, x + w / 2, x + w - 8]) { ctx.beginPath(); ctx.moveTo(xx, top); ctx.lineTo(xx, gy); ctx.stroke(); }
  for (let f = 0; f < floors; f++) { const yy = top + f * 210; ctx.beginPath(); ctx.moveTo(x + 8, yy + 210); ctx.lineTo(x + w / 2 - 50, yy + 60); ctx.moveTo(x + w - 8, yy + 210); ctx.lineTo(x + w / 2 + 50, yy + 60); ctx.stroke(); }
  ctx.restore();
  // ventanas con contraventanas
  for (let f = 0; f < floors - 1; f++) for (const wx of [x + 50, x + w / 2 + 34]) {
    const wy = top + f * 210 + 50, lit = o.night ? r() > .4 : false;
    ctx.fillStyle = '#2E6B4A'; ctx.fillRect(wx - 22, wy, 20, 110); ctx.fillRect(wx + 70, wy, 20, 110);
    ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(wx - 22, wy, 20, 110); ctx.strokeRect(wx + 70, wy, 20, 110);
    roundRect(wx, wy, 68, 110, 6); inked(lit ? '#FFD98A' : '#3A4A6A', 5);
    ctx.strokeStyle = '#E8DCC0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx + 34, wy); ctx.lineTo(wx + 34, wy + 110); ctx.moveTo(wx, wy + 55); ctx.lineTo(wx + 68, wy + 55); ctx.stroke();
    if (r() > .5) { ctx.fillStyle = '#C8322E'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(wx + 10 + k * 16, wy + 112, 9, 0, 7); ctx.fill(); } ctx.fillStyle = '#5A3420'; ctx.fillRect(wx - 4, wy + 116, 76, 14); }
  }
  // puerta en arco
  ctx.beginPath(); ctx.moveTo(x + w / 2 - 50, gy); ctx.lineTo(x + w / 2 - 50, gy - 150); ctx.arc(x + w / 2, gy - 150, 50, Math.PI, 0); ctx.lineTo(x + w / 2 + 50, gy); ctx.closePath();
  inked(['#6A3E24', '#2E4A6A', '#5A2A2A'][((idx % 3) + 3) % 3], 5);
  ctx.fillStyle = '#E7C25A'; ctx.beginPath(); ctx.arc(x + w / 2 + 30, gy - 90, 6, 0, 7); ctx.fill();
}
function medievalTown(t, camX = 0, o = {}) {
  daySky(t, o);
  if (o.church !== false) church(o.churchX ?? 760 - camX * .5, 1080, t, o);
  hills(1200, o.dusk || o.night ? '#3E4A3A' : '#7FA35A', o.dusk || o.night ? '#2E3A2E' : '#5E8A44');
  const gy = o.gy || 1600;
  const first = Math.floor((camX - 200) / TIMBER_W) - 1;
  for (let i = first; i < first + 6; i++) { if (o.skip && o.skip.includes(i)) continue; timberHouse(i * TIMBER_W - camX, gy, i, t, o); }
  cobbles(gy, camX, o);
}
function church(x, gy, t, o = {}) {
  const stone = o.dusk || o.night ? '#6A6478' : '#B8B0A0';
  roundRect(x - 110, gy - 820, 220, 840, 4); inked(stone, 6);
  ctx.beginPath(); ctx.moveTo(x - 130, gy - 820); ctx.lineTo(x, gy - 1180); ctx.lineTo(x + 130, gy - 820); ctx.closePath(); inked('#4E6A6A', 6);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, gy - 1180); ctx.lineTo(x, gy - 1250); ctx.moveTo(x - 24, gy - 1225); ctx.lineTo(x + 24, gy - 1225); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, gy - 680, 54, 0, 7); inked('#F3EAD2', 5);
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, gy - 680); ctx.lineTo(x, gy - 715); ctx.moveTo(x, gy - 680); ctx.lineTo(x + 26, gy - 668); ctx.stroke();
  for (const yy of [gy - 540, gy - 380]) { ctx.beginPath(); ctx.moveTo(x - 30, yy + 90); ctx.lineTo(x - 30, yy + 20); ctx.arc(x, yy + 20, 30, Math.PI, 0); ctx.lineTo(x + 30, yy + 90); ctx.closePath(); inked('#2E3A5A', 4); }
}
function cobbles(gy, camX = 0, o = {}) {
  const g = ctx.createLinearGradient(0, gy, 0, H);
  g.addColorStop(0, o.dusk || o.night ? '#4A4452' : '#9A8A78'); g.addColorStop(1, o.dusk || o.night ? '#2A2630' : '#6E6052');
  ctx.fillStyle = g; ctx.fillRect(0, gy, W, H - gy);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  for (let row = 0, y = gy + 20; y < H + 30; row++, y += 30 + row * 3) {
    const sz = 46 + row * 6;
    for (let x = -((camX * (1 + row * .08)) % sz) - (row % 2) * sz / 2; x < W + sz; x += sz) {
      ctx.fillStyle = `rgba(${row % 2 ? '255,240,220' : '60,40,30'},0.12)`;
      ctx.beginPath(); ctx.ellipse(x, y, sz * .42, 10 + row * 1.6, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; ctx.stroke();
    }
  }
}
function child(x, gy, s, o = {}) { return person(x, gy, s * .62, Object.assign({ armLen: 120 }, o)); }

function drop(x, y, r, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x, y - r * 2.3);
  ctx.bezierCurveTo(x + r * .3, y - r * 1.5, x + r, y - r * .8, x + r, y);
  ctx.arc(x, y, r, 0, Math.PI);
  ctx.bezierCurveTo(x - r, y - r * .8, x - r * .3, y - r * 1.5, x, y - r * 2.3);
  const g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r * 1.6);
  g.addColorStop(0, '#E8F8FF'); g.addColorStop(.5, '#7FD3FF'); g.addColorStop(1, '#2F8FE0');
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = r * .12; ctx.strokeStyle = 'rgba(20,70,140,0.6)'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.ellipse(x - r * .35, y - r * .35, r * .18, r * .3, -.5, 0, 7); ctx.fill();
  ctx.restore();
}
