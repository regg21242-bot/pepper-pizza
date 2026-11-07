/* La cinta métrica que casi todos usan mal — versión cinematográfica (macro 3D, fondo oscuro) */

/* ---------- mini motor 3D (ortográfico, con iluminación por cara) ---------- */
function view(cx, cy, s, yaw, pitch) { return { cx, cy, s, yaw, pitch, cy_: Math.cos(yaw), sy: Math.sin(yaw), cp: Math.cos(pitch), sp: Math.sin(pitch) }; }
function P(V, x, y, z) {
  const X = x * V.cy_ - z * V.sy, Z = x * V.sy + z * V.cy_;
  const Y2 = y * V.cp - Z * V.sp, Z2 = y * V.sp + Z * V.cp;
  return [V.cx + X * V.s, V.cy - Y2 * V.s, Z2];
}
const LIGHT = (() => { const l = [-.45, .8, .4], n = Math.hypot(...l); return l.map(v => v / n); })();
function shadeCol(rgb, k) { return `rgb(${rgb.map(v => Math.round(clamp(v * k, 0, 255))).join(',')})`; }
function boxFaces(x0, x1, y0, y1, z0, z1, mat) {
  const v = (x, y, z) => [x, y, z];
  return [
    { p: [v(x0, y1, z0), v(x1, y1, z0), v(x1, y1, z1), v(x0, y1, z1)], n: [0, 1, 0], mat, id: 'top' },
    { p: [v(x0, y0, z1), v(x1, y0, z1), v(x1, y0, z0), v(x0, y0, z0)], n: [0, -1, 0], mat, id: 'bottom' },
    { p: [v(x0, y0, z1), v(x0, y1, z1), v(x1, y1, z1), v(x1, y0, z1)], n: [0, 0, 1], mat, id: 'front' },
    { p: [v(x1, y0, z0), v(x1, y1, z0), v(x0, y1, z0), v(x0, y0, z0)], n: [0, 0, -1], mat, id: 'back' },
    { p: [v(x0, y0, z0), v(x0, y1, z0), v(x0, y1, z1), v(x0, y0, z1)], n: [-1, 0, 0], mat, id: 'left' },
    { p: [v(x1, y0, z1), v(x1, y1, z1), v(x1, y1, z0), v(x1, y0, z0)], n: [1, 0, 0], mat, id: 'right' },
  ];
}
function drawFaces(V, faces, after) {
  const vis = [];
  for (const f of faces) {
    const q = f.p.map(([x, y, z]) => P(V, x, y, z));
    const area = q.reduce((a, [x1, y1], i) => { const [x2, y2] = q[(i + 1) % q.length]; return a + (x1 * y2 - x2 * y1); }, 0);
    if (area >= 0) continue;                       // cara de espaldas
    vis.push({ f, q, z: q.reduce((a, p) => a + p[2], 0) / q.length });
  }
  vis.sort((a, b) => a.z - b.z);
  for (const { f, q } of vis) {
    const [nx, ny, nz] = f.n;
    const d = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
    const k = .45 + .75 * d;
    ctx.beginPath(); q.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    const [a, b] = [q[0], q[2]];
    const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
    g.addColorStop(0, shadeCol(f.mat, k * 1.15)); g.addColorStop(1, shadeCol(f.mat, k * .8));
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.stroke();
    after && after(f, q);
  }
}
const STEELM = [206, 209, 214], BLADEM = [242, 196, 40], CASEM = [104, 110, 124], WOODM = [196, 150, 96];
const BW = 60;   // ancho de la hoja (z)

/* punta de la cinta en 3D. o.slide = desplazamiento del gancho (x), o.len = largo visible de hoja */
function tapeTip(V, t, o = {}) {
  const L = o.len ?? 220, sl = o.slide || 0;
  // sombra suave
  const [sx, sy] = P(V, L * .35, -42, BW / 2);
  const sg = ctx.createRadialGradient(sx, sy, 10, sx, sy, V.s * 160);
  sg.addColorStop(0, 'rgba(0,0,0,0.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(sx, sy, V.s * 170, V.s * 50, 0, 0, 7); ctx.fill();
  // hoja
  drawFaces(V, boxFaces(0, L, 0, 1.2, 0, BW, BLADEM));
  ((f) => {
    ctx.save(); ctx.strokeStyle = 'rgba(20,20,20,0.9)';
    for (let i = 0; i * 2 < L; i++) {
      const x = 2 + i * 2 + sl * 0, len = i % 10 === 0 ? BW * .42 : i % 5 === 0 ? BW * .28 : BW * .15;
      if (x > L - 1) break;
      const [ax, ay] = P(V, x, 1.25, 0), [bx, by] = P(V, x, 1.25, len);
      ctx.lineWidth = i % 10 === 0 ? 2.4 : 1.4; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      if (i % 10 === 0 && i > 0) { const [tx, ty] = P(V, x - 3, 1.25, BW * .7); ctx.fillStyle = '#141414'; ctx.font = `900 ${Math.round(V.s * 9)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i / 10), tx, ty); }
    }
    // reflejo
    const [r1x, r1y] = P(V, 0, 1.3, BW * .85), [r2x, r2y] = P(V, L, 1.3, BW * .85);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = V.s * 2.5; ctx.beginPath(); ctx.moveTo(r1x, r1y); ctx.lineTo(r2x, r2y); ctx.stroke();
    ctx.restore();
  })();
  // gancho: placa superior + labio vertical
  const faces = [
    ...boxFaces(-4 - sl, 34 - sl, 1.2, 7.5, -3, BW + 3, STEELM),
    ...boxFaces(-10 - sl, -4 - sl, -40, 7.5, -3, BW + 3, STEELM),
  ];
  drawFaces(V, faces, (f, q) => {
    // ranura en la cara exterior del labio
    if (f.id === 'left' && f.p[0][0] <= -9.9 - sl && o.slot !== false) {
      const c = [[-10.05 - sl, -28, BW * .38], [-10.05 - sl, -14, BW * .38], [-10.05 - sl, -14, BW * .62], [-10.05 - sl, -28, BW * .62]].map(p => P(V, ...p));
      ctx.beginPath(); c.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fillStyle = '#16171C'; ctx.fill();
      if (o.slotGlow) { ctx.strokeStyle = `rgba(230,195,106,${o.slotGlow})`; ctx.lineWidth = 4; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; ctx.stroke(); ctx.shadowBlur = 0; }
    }
    // dientes en el borde inferior
    if (f.id === 'left' && f.p[0][0] <= -9.9 - sl && o.teeth !== false) {
      ctx.fillStyle = 'rgba(40,44,52,0.9)'; ctx.beginPath();
      const n = 10; for (let k = 0; k <= n; k++) { const z = -2 + (BW + 4) * k / n; const [x, y] = P(V, -10.05 - sl, k % 2 ? -36 : -40, z); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      const [ex, ey] = P(V, -10.05 - sl, -40, BW + 2), [sx2, sy2] = P(V, -10.05 - sl, -40, -2); ctx.lineTo(ex, ey); ctx.lineTo(sx2, sy2); ctx.closePath(); ctx.fill();
      if (o.teethGlow) { ctx.strokeStyle = `rgba(230,195,106,${o.teethGlow})`; ctx.lineWidth = 4; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; ctx.stroke(); ctx.shadowBlur = 0; }
    }
  });
  // remaches dorados
  for (const [rx, rz] of [[12, BW * .26], [12, BW * .74], [24, BW * .5]]) {
    const [x, y] = P(V, rx - sl, 7.6, rz), r = V.s * 4.2;
    ctx.fillStyle = 'rgba(70,74,84,0.8)'; ctx.beginPath(); ctx.ellipse(x, y + r * .08, r * 1.3, r * .82, 0, 0, 7); ctx.fill();
    const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
    g.addColorStop(0, '#FFF6C8'); g.addColorStop(.45, '#E2B33C'); g.addColorStop(1, '#7A5410');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * .62, 0, 0, 7); ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(60,40,10,0.8)'; ctx.stroke();
  }
  // brillo especular en la placa
  const [hx, hy] = P(V, 4 - sl, 7.6, BW * .12);
  const hg = ctx.createRadialGradient(hx, hy, 2, hx, hy, V.s * 14); hg.addColorStop(0, 'rgba(255,255,255,0.7)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy, V.s * 14, 0, 7); ctx.fill();
}
function viewShift(V, dx) { const [a, b] = P(V, dx, 0, 0), [c, d] = P(V, 0, 0, 0); return view(V.cx + a - c, V.cy + b - d, V.s, V.yaw, V.pitch); }
function tapeCase3D(V, t) {
  drawFaces(V, boxFaces(200, 330, -60, 70, -20, BW + 20, CASEM), (f, q) => {
    if (f.id === 'front') { const [cx, cy] = q.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0]); ctx.fillStyle = 'rgba(230,195,106,0.9)'; ctx.font = `900 ${Math.round(V.s * 18)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('5 m', cx, cy); }
  });
}
function woodPlane(t) {
  const g = ctx.createLinearGradient(0, 1000, 0, H); g.addColorStop(0, '#3A2A1C'); g.addColorStop(1, '#1E140C');
  ctx.fillStyle = g; ctx.fillRect(0, 1000, W, H - 1000);
  ctx.strokeStyle = 'rgba(160,110,60,0.18)'; ctx.lineWidth = 3;
  for (let i = 0; i < 14; i++) { const y = 1010 + i * 34 + i * i * 1.5; ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(300, y + 8, 700, y - 8, W, y + 4); ctx.stroke(); }
}
function bgStage(t, o = {}) { stage(t, Object.assign({ light: 'rgba(120,96,50,0.45)', mid: 'rgba(30,28,40,0.35)', ly: 960, lr: 900, bokeh: 'rgba(230,195,106,0.06)' }, o)); }

/* ---------- escenas: ¿por qué la punta del metro está suelta? ---------- */
const GAP = 6;
function hero(t, o = {}) {
  bgStage(t, { ly: 1000, light: 'rgba(130,100,50,0.5)' });
  const V = view(o.cx ?? 560, o.cy ?? 980, (o.s ?? 10.5) * .7, o.yaw ?? .78, o.pitch ?? .46);
  goldRing(o.rx ?? 520, o.ry ?? 960, o.rr ?? 300, t, o.ringA ?? .85);
  return V;
}
function gapBracket(V, sl, a = 1) {
  if (sl < .3) return;
  const [x1, y1] = P(V, -4, 9.5, -3), [x2, y2] = P(V, -4 - sl, 9.5, -3);
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = GOLD; ctx.fillStyle = GOLD; ctx.lineWidth = 4; ctx.shadowColor = GOLD; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.moveTo(x1, y1 - 50); ctx.lineTo(x1, y1 - 10); ctx.moveTo(x2, y2 - 50); ctx.lineTo(x2, y2 - 10); ctx.moveTo(x1, y1 - 34); ctx.lineTo(x2, y2 - 34); ctx.stroke();
  ctx.restore();
}
/* 1 — ¿por qué está suelta? */
function scene1(t) {
  const V = hero(t, { s: 11.5 - t * .25, yaw: .72 + t * .02 });
  const wig = t > cap(0, 1) + .3 ? (Math.sin(t * 9) * .5 + .5) * GAP : 0;
  tapeTip(V, t, { teeth: false, len: 240, slide: wig });
  say(CAPS[0], t);
}
/* 2 — ¿rota? no */
function scene2(t) {
  const V = hero(t, { s: 10.2, yaw: .9 - t * .03, pitch: .5 });
  tapeTip(V, t, { teeth: false, len: 240, slide: (Math.sin(t * 7) * .5 + .5) * GAP * (t < cap(1, 2) ? 1 : .3) });
  tag(t < cap(1, 2) ? '¿Rota?' : 'No está rota', 540, 1560, t, cap(1, 1), { color: t < cap(1, 2) ? '#FF5A4F' : '#5BFF8A' });
  say(CAPS[1], t);
}
/* 3 — se mueve lo que mide de grueso */
function scene3(t) {
  const V = hero(t, { s: 12, yaw: 1.05, pitch: .36, cx: 640, ringA: .5 });
  const sl = (Math.sin(t * 3) * .5 + .5) * GAP;
  tapeTip(V, t, { teeth: false, len: 200, slide: sl });
  gapBracket(V, sl, prog(t, cap(2, 1), cap(2, 1) + .3));
  readout('Holgura', '= grosor de la punta', 110, 1500, 860, t, cap(2, 2), { vsize: 38 });
  say(CAPS[2], t);
}
/* 4 — jalar desde un borde: se abre */
function scene4(t) {
  const V = hero(t, { s: 8.6, yaw: .95, pitch: .42, cx: 640, cy: 960, ringA: .35 });
  const sl = easeOut(prog(t, cap(3, 1) - .3, cap(3, 1) + .3)) * GAP;
  // tabla bajo la hoja; su borde toca la cara interior del gancho
  drawFaces(V, boxFaces(-4 - sl, 260, -40, -1, -30, BW + 30, WOODM));
  tapeTip(V, t, { teeth: false, len: 240, slide: sl });
  gapBracket(V, sl);
  tag('Jalar', 540, 1500, t, cap(3, 0), { color: GOLD });
  say(CAPS[3], t);
}
/* 5 — empujar contra la pared: se cierra */
function scene5(t) {
  const V = hero(t, { s: 8.6, yaw: .95, pitch: .42, cx: 640, cy: 960, ringA: .35 });
  const sl = (1 - easeOut(prog(t, cap(4, 2) - .4, cap(4, 2) + .1))) * GAP;
  const wallX = -10 - sl;
  tapeTip(V, t, { teeth: false, len: 240, slide: sl });
  // pared de cristal delante del gancho
  ctx.save(); ctx.globalAlpha = .55; drawFaces(V, boxFaces(wallX - 30, wallX, -70, 50, -40, BW + 40, [120, 130, 150])); ctx.restore();
  gapBracket(V, sl);
  tag('Empujar', 540, 1500, t, cap(4, 0), { color: GOLD });
  say(CAPS[4], t);
}
/* 6 — exacta en los dos casos */
function scene6(t) {
  const V = hero(t, { s: 10.5 + t * .15, yaw: .78, pitch: .46 });
  tapeTip(V, t, { teeth: false, len: 240, slide: (Math.sin(t * 2.5) * .5 + .5) * GAP });
  readout('Medida', 'Exacta ✓', 110, 1440, 860, t, cap(5, 1), { vsize: 44 });
  say(CAPS[5], t);
}
startVideo([scene1, scene2, scene3, scene4, scene5, scene6], 2.6);
