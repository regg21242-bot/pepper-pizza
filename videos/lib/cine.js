/* Estilo cinematográfico: fondo oscuro, subtítulos arriba con selección azul, paneles de cristal. */
const GOLD = '#E6C36A';
const BLUE = '#4C8DFF';
function stage(t, o = {}) {
  ctx.fillStyle = o.base || '#05070C'; ctx.fillRect(0, 0, W, H);
  const sx = o.lx ?? 540, sy = o.ly ?? 980;
  const rg = ctx.createRadialGradient(sx, sy, 20, sx, sy, o.lr || 900);
  rg.addColorStop(0, o.light || 'rgba(70,80,110,0.55)');
  rg.addColorStop(.55, o.mid || 'rgba(25,30,48,0.35)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  // polvo / estrellas finas a la deriva
  const r = rng(o.seed || 3);
  for (let i = 0; i < 90; i++) {
    const bx = r() * W, by = r() * H, sz = .8 + r() * 2.2, sp = 4 + r() * 14, tw = r() * 6;
    const x = (bx + t * sp * .4) % W, y = ((by - t * sp) % H + H) % H;
    ctx.fillStyle = `rgba(220,228,255,${(0.15 + 0.35 * r()) * (0.6 + 0.4 * Math.sin(t * 1.3 + tw))})`;
    ctx.beginPath(); ctx.arc(x, y, sz, 0, 7); ctx.fill();
  }
  // bokeh desenfocado
  for (let i = 0; i < 7; i++) {
    const x = r() * W, y = r() * H, br = 60 + r() * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, br);
    g.addColorStop(0, o.bokeh || 'rgba(120,140,200,0.07)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + Math.sin(t * .3 + i) * 30, y, br, 0, 7); ctx.fill();
  }
}
function withBlur(px, fn) {
  ctx.save();
  if (px > 0.3) ctx.filter = `blur(${px.toFixed(1)}px)`;
  fn();
  ctx.restore();
}
function glass(x, y, w, h, r = 18) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  roundRect(x, y, w, h, r); ctx.fillStyle = 'rgba(16,19,28,0.78)'; ctx.fill();
  ctx.restore();
  roundRect(x, y, w, h, r);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0.06)');
  ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.stroke();
}
function tag(text, x, y, t, t0, o = {}) {
  if (t < t0) return;
  const a = fadeIO(t, t0, o.tOut); if (a <= 0) return;
  const size = o.size || 30;
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = `600 ${size}px ${FONT}`; ctx.letterSpacing = `${Math.round(size * .18)}px`;
  const label = text.toUpperCase();
  const tw = ctx.measureText(label).width;
  const w = tw + size * 1.4 + 30, h = size * 2;
  const rise = (1 - easeOut(prog(t, t0, t0 + .4))) * 16;
  const bx = x - w / 2, by = y - h / 2 + rise;
  glass(bx, by, w, h, 16);
  ctx.fillStyle = o.color || GOLD;
  ctx.shadowColor = o.color || GOLD; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(bx + size * .7 + 4, by + h / 2, 7, 0, 7); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#E9ECF2'; ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + size * .7 + 26, by + h / 2 + 1);
  ctx.restore();
}
function readout(label, value, x, y, w, t, t0, o = {}) {
  if (t < t0) return;
  const a = fadeIO(t, t0, o.tOut); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  const rise = (1 - easeOut(prog(t, t0, t0 + .4))) * 16;
  const h = o.h || 96;
  glass(x, y + rise, w, h, 18);
  ctx.textBaseline = 'middle';
  ctx.font = `700 28px ${FONT}`; ctx.letterSpacing = '7px'; ctx.fillStyle = 'rgba(225,230,240,0.85)';
  ctx.fillText(label.toUpperCase(), x + 28, y + rise + h / 2 + 1);
  ctx.letterSpacing = '0px';
  ctx.font = `700 ${o.vsize || 44}px ${MONO()}`; ctx.fillStyle = GOLD; ctx.textAlign = 'right';
  ctx.shadowColor = 'rgba(230,195,106,0.5)'; ctx.shadowBlur = 14;
  ctx.fillText(value, x + w - 28, y + rise + h / 2 + 2);
  ctx.restore();
}
function leader(x1, y1, x2, y2, p, color = 'rgba(255,255,255,0.7)') {
  if (p <= 0) return;
  const x = lerp(x1, x2, p), y = lerp(y1, y2, p);
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
  ctx.globalAlpha = .35; ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.fill();
  ctx.restore();
}
function fadeIO(t, t0, tOut) {
  return clamp((t - t0) / .35) * (tOut !== undefined ? 1 - prog(t, tOut, tOut + .35) : 1);
}
function say(chunks, t, o = {}) {
  let ci = -1;
  for (let i = 0; i < chunks.length; i++) if (t >= chunks[i][0]) ci = i;
  if (ci < 0) return;
  const [t0, text] = chunks[ci];
  const words = parseWords(text);
  const next = ci + 1 < chunks.length ? chunks[ci + 1][0] : t0 + words.length * .3;
  const dt = Math.min(.32, Math.max(.12, (next - t0 - .15) / words.length));
  const y = o.y || 250;
  let size = o.size || 74;
  ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  let widths, space, total;
  for (;;) {
    ctx.font = `800 ${size}px ${FONT}`;
    space = ctx.measureText(' ').width * 1.05;
    widths = words.map(w => ctx.measureText(w.w).width);
    total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
    if (total < 960 || size < 40) break;
    size -= 4;
  }
  let k = -1; words.forEach((w, i) => { if (t >= t0 + i * dt) k = i; });
  let x = 540 - total / 2;
  words.forEach((wd, i) => {
    const tw = t0 + i * dt, p = prog(t, tw, tw + .16);
    if (p > 0) {
      const cur = i === k, yy = y + (1 - easeOut(p)) * 18;
      ctx.globalAlpha = p;
      ctx.font = `${cur ? 800 : 500} ${size}px ${FONT}`;
      ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 24;
      ctx.fillStyle = cur ? '#FFFFFF' : 'rgba(150,156,168,0.85)';
      ctx.fillText(wd.w, x, yy); ctx.shadowColor = 'transparent';
      if (cur && wd.hl) {
        const pad = 12, bw = widths[i] + pad * 2, bh = size * 1.12, bx = x - pad, by = yy - bh / 2;
        const sp = easeOut(prog(t, tw, tw + .22));
        ctx.fillStyle = 'rgba(76,141,255,0.14)'; ctx.fillRect(bx, by, bw * sp, bh);
        ctx.strokeStyle = BLUE; ctx.lineWidth = 3; ctx.strokeRect(bx, by, bw * sp, bh);
        for (const [hx, hy] of [[bx, by], [bx + bw * sp, by + bh]]) { ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(hx, hy, 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke(); }
      }
    }
    x += widths[i] + space;
  });
  ctx.restore();
}
function goldRing(x, y, r, t, a = 1) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = 'rgba(230,195,106,0.85)'; ctx.lineWidth = 3; ctx.shadowColor = GOLD; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(x, y, r, t * .3, t * .3 + Math.PI * 1.7); ctx.stroke();
  ctx.restore();
}
