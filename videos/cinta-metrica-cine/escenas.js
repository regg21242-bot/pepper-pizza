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
const STEELM = [196, 202, 210], BLADEM = [242, 196, 40], CASEM = [104, 110, 124], WOODM = [196, 150, 96];
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
  drawFaces(V, boxFaces(0, L, 0, 1.2, 0, BW, BLADEM), (f) => {
    if (f.id !== 'top') return;
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
  });
  // gancho: placa superior + labio vertical
  const faces = [
    ...boxFaces(-4 - sl, 34 - sl, 1.2, 4.2, -2, BW + 2, STEELM),
    ...boxFaces(-8 - sl, -4 - sl, -40, 4.2, -2, BW + 2, STEELM),
  ];
  drawFaces(V, faces, (f, q) => {
    // ranura en la cara exterior del labio
    if (f.id === 'left' && f.p[0][0] <= -7.9 - sl && o.slot !== false) {
      const c = [[-8.05 - sl, -28, BW * .38], [-8.05 - sl, -14, BW * .38], [-8.05 - sl, -14, BW * .62], [-8.05 - sl, -28, BW * .62]].map(p => P(V, ...p));
      ctx.beginPath(); c.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fillStyle = '#16171C'; ctx.fill();
      if (o.slotGlow) { ctx.strokeStyle = `rgba(230,195,106,${o.slotGlow})`; ctx.lineWidth = 4; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; ctx.stroke(); ctx.shadowBlur = 0; }
    }
    // dientes en el borde inferior
    if (f.id === 'left' && f.p[0][0] <= -7.9 - sl && o.teeth !== false) {
      ctx.fillStyle = 'rgba(40,44,52,0.9)'; ctx.beginPath();
      const n = 10; for (let k = 0; k <= n; k++) { const z = -2 + (BW + 4) * k / n; const [x, y] = P(V, -8.05 - sl, k % 2 ? -36 : -40, z); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      const [ex, ey] = P(V, -8.05 - sl, -40, BW + 2), [sx2, sy2] = P(V, -8.05 - sl, -40, -2); ctx.lineTo(ex, ey); ctx.lineTo(sx2, sy2); ctx.closePath(); ctx.fill();
      if (o.teethGlow) { ctx.strokeStyle = `rgba(230,195,106,${o.teethGlow})`; ctx.lineWidth = 4; ctx.shadowColor = GOLD; ctx.shadowBlur = 20; ctx.stroke(); ctx.shadowBlur = 0; }
    }
  });
  // remaches dorados
  for (const [rx, rz] of [[12, BW * .26], [12, BW * .74], [24, BW * .5]]) {
    const [x, y] = P(V, rx - sl, 4.3, rz), r = V.s * 4.2;
    const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
    g.addColorStop(0, '#FFF6C8'); g.addColorStop(.45, '#E2B33C'); g.addColorStop(1, '#7A5410');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * .62, 0, 0, 7); ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(60,40,10,0.8)'; ctx.stroke();
  }
  // brillo especular en la placa
  const [hx, hy] = P(V, 6 - sl, 4.3, BW * .15);
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

/* 1 — la tienes en casa y la usas mal */
function scene1(t) {
  bgStage(t);
  const V = view(380, 980, 6.2 - t * .12, -.55 + t * .03, .42);
  goldRing(470, 1000, 340, t, .8);
  tapeTip(V, t, { len: 230 });
  tag('Cinta métrica', 540, 1500, t, .6);
  tag('Error común', 540, 1610, t, cap(0, 3), { color: '#FF5A4F' });
  say(CAPS[0], t);
}
/* 2 — el gancho se mueve: no está roto */
function scene2(t) {
  bgStage(t);
  const wig = t > cap(1, 2) - .2 ? (Math.sin(t * 8) * .5 + .5) * 4 : 0;
  const V = view(420, 1020, 8.4, -.75 + Math.sin(t * .4) * .05, .45);
  goldRing(400, 1060, 300, t, .7);
  tapeTip(V, t, { len: 160, slide: wig });
  const [ax, ay] = P(V, -6, 4, -6);
  leader(ax, ay, 260, 760, prog(t, cap(1, 2), cap(1, 2) + .4), GOLD);
  readout('Holgura', t > cap(1, 4) ? 'A propósito' : '¿Roto?', 140, 650, 520, t, cap(1, 2), { vsize: 40 });
  if (t > cap(1, 4)) tag('Diseñado así', 540, 1560, t, cap(1, 4), { color: '#5BFF8A' });
  say(CAPS[1], t);
}
/* 3 — se mueve lo que mide de grueso: jalar / empujar */
function profile(x, y, s, slide, t, mode) {
  // vista lateral limpia: hoja + gancho + tabla/pared
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, '#FFE066'); g.addColorStop(1, '#C99A10');
  ctx.fillStyle = g; ctx.fillRect(-420, -4, 420 + slide, 8);
  const sg = ctx.createLinearGradient(0, -10, 0, 60); sg.addColorStop(0, '#F0F3F6'); sg.addColorStop(1, '#7A838E');
  ctx.fillStyle = sg; ctx.fillRect(-40 + slide, -10, 50, 6); ctx.fillRect(slide, -10, 10, 70);
  if (mode === 'pull') { ctx.fillStyle = '#6A4A2E'; ctx.fillRect(10 + slide, 6, 300, 120); ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 2; ctx.strokeRect(10 + slide, 6, 300, 120); }
  else { ctx.fillStyle = '#5A5E6A'; ctx.fillRect(10 + slide, -200, 120, 400); }
  // cero real (línea dorada)
  ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.shadowColor = GOLD; ctx.shadowBlur = 12;
  const zx = mode === 'pull' ? 10 + slide : slide; ctx.beginPath(); ctx.moveTo(zx, -120); ctx.lineTo(zx, 140); ctx.stroke();
  ctx.restore();
}
function scene3(t) {
  bgStage(t);
  if (t < cap(2, 3) - .2) {
    const V = view(400, 1040, 9.5, -1.2, .25);
    tapeTip(V, t, { len: 140 });
    const [a1x, a1y] = P(V, -8, -10, BW + 2), [a2x, a2y] = P(V, -4, -10, BW + 2);
    if (t > cap(2, 1)) { ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 4; ctx.shadowColor = GOLD; ctx.shadowBlur = 16; ctx.beginPath(); ctx.moveTo(a1x, a1y + 60); ctx.lineTo(a2x, a2y + 60); ctx.stroke(); ctx.restore(); }
    readout('Desplazamiento', '= grosor', 140, 640, 520, t, cap(2, 1), { vsize: 40 });
    tag('Medida exacta', 540, 1560, t, cap(2, 2) + .2, { color: '#5BFF8A' });
  } else {
    const pushT = cap(2, 5);
    glass(70, 560, 940, 380, 24);
    tag('Jalar', 220, 610, t, cap(2, 3) - .1, { color: GOLD });
    profile(560, 760, 1.4, 6, t, 'pull');
    if (t > pushT - .2) {
      glass(70, 1000, 940, 380, 24);
      tag('Empujar', 220, 1050, t, pushT - .1, { color: GOLD });
      profile(560, 1200, 1.4, lerp(6, 0, easeOut(prog(t, pushT, pushT + .5))), t, 'push');
      readout('Cero', 'Exacto en ambos', 70, 1420, 940, t, pushT + .6, { vsize: 40 });
    }
  }
  say(CAPS[2], t);
}
/* 4 — la ranura para clavos */
function scene4(t) {
  bgStage(t);
  if (t < cap(3, 4) - .2) {
    const V = view(620, 1000, 9, .95, .22);
    goldRing(500, 1180, 260, t, .6);
    tapeTip(V, t, { len: 120, slotGlow: .5 + .5 * Math.sin(t * 6) });
    const [sx, sy] = P(V, -9, -21, BW / 2); const [sx0] = [sx];
    if (t > cap(3, 2) - .1) {
      const k = easeOut(prog(t, cap(3, 2) - .1, cap(3, 2) + .5));
      ctx.save(); ctx.translate(sx - 140 * (1 - k), sy);
      const ng = ctx.createLinearGradient(0, -30, 0, 30); ng.addColorStop(0, '#E8ECF0'); ng.addColorStop(1, '#6A727C');
      ctx.fillStyle = ng; ctx.fillRect(-260, -8, 240, 16); ctx.beginPath(); ctx.ellipse(-20, 0, 12, 36, 0, 0, 7); ctx.fill(); ctx.restore();
    }
    tag('Ranura', 300, 760, t, .5, { color: GOLD });
    readout('Uso', 'Clavo / tornillo', 140, 1460, 800, t, cap(3, 2), { vsize: 40 });
  } else {
    // vista superior: tú solo
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0A0C14'); g.addColorStop(1, '#141824'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#5A4028'; roundRect(60, 820, 960, 140, 10); ctx.fill();
    const ext = easeOut(prog(t, cap(3, 4) - .2, cap(3, 4) + .8)) * 760;
    ctx.fillStyle = '#F2C21B'; ctx.fillRect(120, 872, ext, 36);
    ctx.fillStyle = '#C9CED8'; ctx.fillRect(110, 862, 18, 56);
    ctx.fillStyle = '#9AA3AD'; ctx.beginPath(); ctx.arc(112, 890, 10, 0, 7); ctx.fill();
    ctx.fillStyle = '#464A54'; roundRect(120 + ext, 830, 130, 120, 30); ctx.fill();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.shadowColor = GOLD; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(112, 890, 30, 0, 7); ctx.stroke(); ctx.shadowBlur = 0;
    readout('Ayudante', 'No hace falta', 140, 1100, 800, t, cap(3, 4) + .2, { vsize: 40 });
  }
  say(CAPS[3], t);
}
/* 5 — borde dentado: raspar y marcar */
function scene5(t) {
  bgStage(t); woodPlane(t);
  const scr = t > cap(4, 3) - .2;
  const dz = scr ? Math.sin(t * 22) * 5 : 0;
  const V = view(600 + dz * 8, 1000, 8.5, .95, .3);
  tapeTip(V, t, { len: 120, teethGlow: t > cap(4, 1) ? .5 + .5 * Math.sin(t * 6) : 0 });
  if (scr) { const k = prog(t, cap(4, 3), cap(4, 5) + .4); ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 6; ctx.shadowColor = GOLD; ctx.shadowBlur = 24; ctx.beginPath(); ctx.moveTo(320, 1330); ctx.lineTo(320 + 420 * k, 1330); ctx.stroke(); ctx.restore(); }
  tag('Borde dentado', 540, 700, t, cap(4, 1), { color: GOLD });
  readout('Lápiz', 'No necesitas', 140, 800, 800, t, cap(4, 2), { vsize: 40, tOut: cap(4, 5) - .2 });
  if (t > cap(4, 5)) tag('Marca hecha', 540, 1560, t, cap(4, 5), { color: '#5BFF8A' });
  say(CAPS[4], t);
}
/* 6 — compás de luz */
function scene6(t) {
  bgStage(t, { ly: 900 });
  const cx = 540, cy = 900, R = 360;
  const k = prog(t, cap(5, 2) - .2, DURS[5] - .2);
  const a = -Math.PI / 2 + k * Math.PI * 2;
  if (k > 0) { ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 7; ctx.shadowColor = GOLD; ctx.shadowBlur = 30; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, a); ctx.stroke(); ctx.restore(); }
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
  const g = ctx.createLinearGradient(0, -18, 0, 18); g.addColorStop(0, '#FFE066'); g.addColorStop(1, '#C99A10');
  ctx.fillStyle = g; ctx.fillRect(0, -18, R, 36);
  ctx.fillStyle = '#141414'; for (let i = 0; i < R; i += 12) ctx.fillRect(i, -18, 2, i % 60 === 0 ? 16 : 8);
  const sg = ctx.createLinearGradient(0, -20, 0, 20); sg.addColorStop(0, '#F0F3F6'); sg.addColorStop(1, '#7A838E'); ctx.fillStyle = sg; ctx.fillRect(-14, -22, 40, 44);
  ctx.fillStyle = '#FFF6C8'; ctx.shadowColor = GOLD; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(R, 0, 10, 0, 7); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#C9CED8'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fill();
  tag('Compás', 540, 1400, t, cap(5, 4), { color: GOLD });
  say(CAPS[5], t);
}
/* 7 — no la sueltes de golpe */
function scene7(t) {
  bgStage(t);
  const snap = cap(6, 2) - .3, hit = snap + .3;
  const ext = t < snap ? 190 : Math.max(0, lerp(190, 0, easeIn(prog(t, snap, hit))));
  const sh = t > hit && t < hit + .3 ? Math.sin(t * 90) * 10 : 0;
  const V = view(90 + sh, 1000, 2.95, -.35, .4);
  tapeTip(viewShift(V, 192 - ext), t, { len: ext + 10 });
  tapeCase3D(V, t);
  if (t > hit && t < hit + .15) { ctx.fillStyle = `rgba(255,255,255,${1 - (t - hit) / .15})`; ctx.fillRect(0, 0, W, H); }
  readout('Calibración', t > cap(6, 3) ? 'Dañada' : 'OK', 140, 640, 800, t, cap(6, 2), { vsize: 40 });
  if (t > cap(6, 5)) tag('Medidas incorrectas', 540, 1560, t, cap(6, 5), { color: '#FF5A4F' });
  say(CAPS[6], t);
}
/* 8 — resumen + pregunta */
function scene8(t) {
  bgStage(t);
  const items = [['01', 'El gancho se mueve'], ['02', 'Ranura para clavos'], ['03', 'Borde para marcar'], ['04', 'Hace de compás'], ['05', 'No la sueltes de golpe']];
  items.forEach(([n, s], i) => readout(s, n, 110, 560 + i * 130, 860, t, .1 + i * .15, { vsize: 44, h: 104 }));
  say(CAPS[7], t);
}
startVideo([scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8], 3.2);
