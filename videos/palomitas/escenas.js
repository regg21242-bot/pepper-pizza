/* ¿Por qué explotan las palomitas? — escenas (estilo monitos) */
const HULL = '#F2A82E', HULL2 = '#D9661A', STARCH = '#FFF3CC', POP = '#FFF8E6';

/* momento aproximado en que la voz dice una palabra de la escena si */
function at(si, word, off = 0) {
  const ch = CAPS[si];
  for (let c = 0; c < ch.length; c++) {
    const ws = ch[c][1].replace(/[*¿?¡!.,…:]/g, '').toLowerCase().split(' ');
    const i = ws.findIndex(x => x.startsWith(word.toLowerCase()));
    if (i >= 0) { const nx = c + 1 < ch.length ? ch[c + 1][0] : DURS[si] - .4; return ch[c][0] + i * (nx - ch[c][0]) / ws.length + off; }
  }
  console.warn('sin palabra', si, word); return 0;
}
function mixHex(a, b, k) {
  const pa = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(k)))).join(',')})`;
}

/* ---------- el grano de maíz ---------- */
function kernelPath() {
  ctx.beginPath(); ctx.moveTo(0, -170);
  ctx.bezierCurveTo(125, -172, 150, -30, 62, 118); ctx.quadraticCurveTo(0, 200, -62, 118);
  ctx.bezierCurveTo(-150, -30, -125, -172, 0, -170); ctx.closePath();
}
/* o: rot, heat 0..1, cut 0..1 (corte), water 0..1, steam 0..1, press 0..1, crack 0..1, shake, face, mood, dry */
function kernel(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y);
  if (o.shake) ctx.translate(Math.sin(t * 61) * o.shake * 8, Math.cos(t * 47) * o.shake * 6);
  ctx.rotate(o.rot || 0); const sw = 1 + (o.swell || 0); ctx.scale(s * sw, s * sw);
  const heat = o.heat || 0, base = mixHex(HULL, '#E8461E', heat * .8);
  // casco
  kernelPath();
  const g = ctx.createRadialGradient(-45, -70, 10, 0, 0, 220); g.addColorStop(0, '#FFE08A'); g.addColorStop(.45, base); g.addColorStop(1, mixHex(HULL2, '#9A2A10', heat));
  ctx.fillStyle = g; ctx.fill();
  if (heat > 0) { ctx.save(); kernelPath(); ctx.clip(); const hg = ctx.createRadialGradient(0, 40, 10, 0, 40, 200); hg.addColorStop(0, `rgba(255,80,20,${.45 * heat})`); hg.addColorStop(1, 'rgba(255,80,20,0)'); ctx.fillStyle = hg; ctx.fillRect(-200, -200, 400, 400); ctx.restore(); }
  // corte transversal
  const cut = o.cut || 0;
  if (cut > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(-200, -220, 400 * cut, 440); ctx.clip();
    kernelPath(); ctx.fillStyle = mixHex('#C9561A', '#B0281A', heat); ctx.fill();
    ctx.save(); ctx.translate(0, -6); ctx.scale(.8, .8); kernelPath();
    const sg = ctx.createRadialGradient(0, -30, 10, 0, 0, 180); sg.addColorStop(0, '#FFFBEA'); sg.addColorStop(1, '#F3D78A'); ctx.fillStyle = sg; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(120,60,10,0.5)'; ctx.stroke();
    // gránulos de almidón
    const r = rng(7); ctx.fillStyle = 'rgba(200,150,60,0.35)';
    for (let i = 0; i < 46; i++) { const a = r() * 7, d = Math.sqrt(r()) * 120; const px = Math.cos(a) * d * .85, py = Math.sin(a) * d * 1.1 - 20; ctx.beginPath(); ctx.arc(px, py, 5 + r() * 6, 0, 7); ctx.fill(); }
    ctx.restore();
    // presión (brillo rojo)
    if (o.press) { const pg = ctx.createRadialGradient(0, -20, 5, 0, -20, 130); pg.addColorStop(0, `rgba(255,60,30,${.55 * o.press})`); pg.addColorStop(1, 'rgba(255,60,30,0)'); ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(0, -20, 140, 0, 7); ctx.fill(); }
    // gotita de agua
    if (o.water > .02) drop(0, -10, 34 * o.water, 1 - (o.steam || 0) * .9);
    // vapor atrapado
    const st = o.steam || 0;
    if (st > 0) {
      const n = Math.round(6 + st * 16), sp = 1.5 + (o.press || 0) * 5;
      for (let i = 0; i < n; i++) {
        const rr = rng(i * 31 + 5), a1 = rr() * 7, a2 = rr() * 7, rad = 40 + rr() * 50 * (.6 + st * .5);
        const px = Math.sin(t * sp * (.6 + rr()) + a1) * rad * .9, py = -20 + Math.cos(t * sp * (.5 + rr()) + a2) * rad * 1.15;
        ctx.globalAlpha = st; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.strokeStyle = 'rgba(80,120,170,0.7)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(px, py, 10 + rr() * 12, 0, 7); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
    if (cut < 1) { ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(-200 + 400 * cut, -200); ctx.lineTo(-200 + 400 * cut, 200); ctx.stroke(); ctx.setLineDash([]); }
  }
  // punta (donde se une a la mazorca)
  ctx.save(); kernelPath(); ctx.clip(); ctx.beginPath(); ctx.ellipse(0, 165, 52, 40, 0, 0, 7); ctx.fillStyle = '#F4E2B0'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.stroke(); ctx.restore();
  kernelPath(); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
  // brillo
  if (cut < 1) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(-55, -95, 16, 38, -.5, 0, 7); ctx.fill(); }
  // grieta
  if (o.crack) {
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath();
    const pts = [[0, -170], [-14, -130], [12, -95], [-10, -60], [14, -20], [-6, 20]], n = Math.max(2, Math.ceil(pts.length * o.crack));
    ctx.moveTo(...pts[0]); for (let i = 1; i < n; i++) ctx.lineTo(...pts[i]); ctx.stroke();
    if (o.crack > .6) { ctx.beginPath(); ctx.moveTo(12, -95); ctx.lineTo(50, -110); ctx.moveTo(-10, -60); ctx.lineTo(-50, -48); ctx.stroke(); }
  }
  // carita
  if (o.face) {
    const m = o.mood || 'happy';
    for (const sx of [-38, 38]) {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(sx, -40, 20, m === 'scared' ? 26 : 22, 0, 0, 7); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(sx + 3, -36, m === 'scared' ? 7 : 9, 0, 7); ctx.fill();
      if (m === 'sad') { ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx - 22, -72 + (sx < 0 ? 10 : 0)); ctx.lineTo(sx + 22, -72 + (sx < 0 ? 0 : 10)); ctx.stroke(); }
    }
    ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.beginPath();
    if (m === 'happy') ctx.arc(0, 2, 26, .25, Math.PI - .25);
    else if (m === 'sad') ctx.arc(0, 40, 22, Math.PI + .4, -.4);
    else { ctx.ellipse(0, 22, 14, 20, 0, 0, 7); }
    ctx.stroke();
    if (m === 'sad' && o.tear !== false) drop(52, -2 + ((t * 40) % 50), 7);
  }
  ctx.restore();
}

/* ---------- la palomita ---------- */
const BLOBS = [[0, 0, 72], [-72, -28, 56], [66, -36, 60], [-38, -86, 52], [36, -92, 54], [-80, 38, 48], [76, 36, 50], [0, 66, 52], [-30, 30, 44], [34, 18, 40]];
function popcorn(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  const r = rng(o.seed || 1), bl = BLOBS.map(([bx, by, br]) => [bx + (r() - .5) * 18, by + (r() - .5) * 18, br * (.85 + r() * .3)]);
  ctx.fillStyle = INK; for (const [bx, by, br] of bl) { ctx.beginPath(); ctx.arc(bx, by, br + 7, 0, 7); ctx.fill(); }
  for (const [bx, by, br] of bl) {
    const g = ctx.createRadialGradient(bx - br * .35, by - br * .4, br * .1, bx, by, br * 1.1);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(.6, o.color || POP); g.addColorStop(1, o.color2 || '#EBD7A8');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(150,110,40,0.35)'; ctx.lineWidth = 4;
  for (const [bx, by, br] of bl.slice(0, 6)) { ctx.beginPath(); ctx.arc(bx, by, br * .6, .3, 1.6); ctx.stroke(); }
  // trocitos de cáscara
  if (o.hull === true) for (const [hx, hy, hr] of [[-20, 96, .3], [30, 92, -.4], [4, 108, .1]]) { ctx.save(); ctx.translate(hx, hy); ctx.rotate(hr); ctx.beginPath(); ctx.moveTo(-16, -8); ctx.lineTo(16, -10); ctx.lineTo(8, 10); ctx.closePath(); ctx.fillStyle = HULL2; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  if (o.face) {
    for (const sx of [-30, 30]) { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(sx, -8, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + 3, -11, 3, 0, 7); ctx.fill(); }
    ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(0, 14, 20, .3, Math.PI - .3); ctx.stroke();
    ctx.fillStyle = 'rgba(255,120,120,0.45)'; ctx.beginPath(); ctx.arc(-52, 18, 12, 0, 7); ctx.arc(52, 18, 12, 0, 7); ctx.fill();
  }
  ctx.restore();
}

/* ---------- fondos ---------- */
function lab(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9ED8EC'); g.addColorStop(1, '#D9F1F7');
  ctx.fillStyle = g; ctx.fillRect(-40, -40, W + 80, H + 80);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
  for (let x = 0; x <= W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const r = rng(3); ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 14; i++) { const k = (t * .03 + r()) % 1; ctx.beginPath(); ctx.arc(r() * W, H - k * H, 8 + r() * 18, 0, 7); ctx.fill(); }
}
function flames(x, y, w, t, k = 1) {
  if (k <= 0) return;
  for (let i = 0; i < 9; i++) {
    const fx = x - w / 2 + (i + .5) * w / 9, h = (70 + 40 * Math.sin(t * 13 + i * 2.1)) * k;
    ctx.beginPath(); ctx.moveTo(fx - 22, y); ctx.quadraticCurveTo(fx - 26, y - h * .5, fx, y - h); ctx.quadraticCurveTo(fx + 26, y - h * .5, fx + 22, y); ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y - h); g.addColorStop(0, '#2F6BFF'); g.addColorStop(.35, '#FF8A1E'); g.addColorStop(1, '#FFE45A');
    ctx.fillStyle = g; ctx.fill();
  }
}
function heatWaves(x, y, w, t, k = 1) {
  ctx.strokeStyle = `rgba(255,120,40,${.5 * k})`; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const ph = (t * .6 + i / 3) % 1, yy = y - ph * 160, xx = x - w / 2 + (i + .5) * w / 3; ctx.globalAlpha = Math.sin(ph * Math.PI); ctx.beginPath(); for (let j = 0; j <= 10; j++) ctx.lineTo(xx + Math.sin(j * .9 + t * 6) * 12, yy - j * 9); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function kitchen(t, o = {}) {
  ctx.fillStyle = '#FFE7BF'; ctx.fillRect(-40, -40, W + 80, H + 80);
  // azulejos
  ctx.fillStyle = '#FFF4DE'; for (let y = 700; y < 1430; y += 90) for (let x = (y / 90 % 2) * 45 - 45; x < W; x += 90) { roundRect(x + 4, y + 4, 82, 82, 8); ctx.fill(); }
  // ventana
  roundRect(90, 150, 340, 400, 16); inked('#8ED3F5', 8);
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(210, 290, 40, 0, 7); ctx.arc(250, 280, 50, 0, 7); ctx.arc(300, 295, 36, 0, 7); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(260, 150); ctx.lineTo(260, 550); ctx.moveTo(90, 350); ctx.lineTo(430, 350); ctx.stroke();
  // repisa con frascos
  ctx.fillStyle = '#B9773E'; ctx.fillRect(600, 420, 400, 24); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(600, 420, 400, 24);
  [[660, '#E3352B'], [770, '#F2C230'], [880, '#3FAE5A']].forEach(([jx, c]) => { roundRect(jx - 40, 300, 80, 120, 14); inked('#E8F4FA', 5); roundRect(jx - 32, 340, 64, 74, 10); ctx.fillStyle = c; ctx.fill(); roundRect(jx - 44, 284, 88, 26, 6); inked('#7A5634', 5); });
  // barra
  ctx.fillStyle = '#9A6A3E'; ctx.fillRect(-40, 1430, W + 80, H); ctx.fillStyle = '#C79A62'; ctx.fillRect(-40, 1400, W + 80, 50);
  ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(-50, 1400, W + 100, 50);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 4; for (let x = 0; x < W; x += 270) { ctx.strokeRect(x + 20, 1500, 230, 380); }
}
/* olla con tapa; o.lid (levantada 0..1), o.pops (palomitas saltando) */
function pot(x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  flames(0, 40, 300, t, o.fire ?? 1);
  ctx.fillStyle = '#3A3A44'; ctx.fillRect(-190, 30, 380, 26); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(-190, 30, 380, 26);
  // asas
  for (const sd of [-1, 1]) { roundRect(sd * 200 - 30, -150, 60, 30, 12); inked('#2B2B33', 5); }
  roundRect(-180, -200, 360, 200, 24); const g = ctx.createLinearGradient(-180, 0, 180, 0); g.addColorStop(0, '#9AA4B4'); g.addColorStop(.4, '#E4EAF2'); g.addColorStop(1, '#6E7888'); inked(g, 7);
  // palomitas saliendo
  if (o.pops) for (let i = 0; i < o.pops; i++) {
    const rr = rng(i * 7 + 2), per = .9 + rr() * .5, ph = ((t + rr() * 3) % per) / per, vx = (rr() - .5) * 500;
    popcorn(vx * ph, -220 - (900 * ph - 900 * ph * ph) * (1.2 + rr()), .28 + rr() * .12, { rot: ph * 6 + i, seed: i + 1, hull: false });
  }
  // tapa
  const lid = o.lid || 0;
  ctx.save(); ctx.translate(0, -200 - lid * 120); ctx.rotate(lid * -.3 + Math.sin(t * 30) * .03 * (o.rattle || 0));
  ctx.beginPath(); ctx.ellipse(0, 0, 195, 34, 0, Math.PI, 0); ctx.closePath(); inked('#C4CCD8', 7);
  roundRect(-26, -60, 52, 30, 10); inked('#2B2B33', 5);
  ctx.restore();
  ctx.restore();
}
/* manómetro */
function gauge(x, y, r, v, txt, t) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); inked('#FFFDF5', 8);
  const a0 = Math.PI * .75, a1 = Math.PI * 2.25;
  [['#3FAE5A', 0, .5], ['#F2C230', .5, .75], ['#E3352B', .75, 1]].forEach(([c, s, e]) => { ctx.strokeStyle = c; ctx.lineWidth = r * .14; ctx.beginPath(); ctx.arc(0, 0, r * .78, lerp(a0, a1, s), lerp(a0, a1, e)); ctx.stroke(); });
  ctx.strokeStyle = INK; ctx.lineWidth = 4; for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10); ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * .6, Math.sin(a) * r * .6); ctx.lineTo(Math.cos(a) * r * .68, Math.sin(a) * r * .68); ctx.stroke(); }
  const vv = clamp(v + (v > .8 ? Math.sin(t * 40) * .02 : 0)), a = lerp(a0, a1, vv);
  ctx.strokeStyle = '#B3261E'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * .72, Math.sin(a) * r * .72); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * .1, 0, 7); inked('#2B2B33', 4);
  ctx.fillStyle = INK; ctx.font = `900 ${r * .24}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, r * .48);
  ctx.restore();
}
/* termómetro: v 0..1 (0..200 °C) */
function thermo(x, y, h, v, t) {
  ctx.save(); ctx.translate(x, y);
  roundRect(-34, -h, 68, h + 10, 34); inked('#FFFDF5', 7);
  ctx.beginPath(); ctx.arc(0, 40, 58, 0, 7); inked('#E3352B', 7);
  roundRect(-16, -h + 20 + (h - 20) * (1 - v), 32, (h - 20) * v + 40, 16); ctx.fillStyle = '#E3352B'; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 4; for (let i = 1; i < 10; i++) { const yy = -h + 20 + (h - 20) * i / 10; ctx.beginPath(); ctx.moveTo(18, yy); ctx.lineTo(34, yy); ctx.stroke(); }
  ctx.restore();
}
function readTag(text, x, y, k, bg = '#FFD84A') { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); label(text, 0, 0, { size: 52, bg }); ctx.restore(); }
/* etiqueta con línea guía */
function callout(text, x, y, tx, ty, t, t0, bg = '#FFF6DC') {
  popIn(t, t0, k => {
    ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, tx, k), lerp(y, ty, k)); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(tx, ty, 10, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); label(text, 0, 0, { size: 50, bg }); ctx.restore();
  });
}
function steamPuff(x, y, t, k, dir = -Math.PI / 2, spread = .5, n = 12, len = 360) {
  for (let i = 0; i < n; i++) {
    const rr = rng(i * 17 + 3), ph = (t * 1.6 + rr()) % 1, a = dir + (rr() - .5) * spread;
    ctx.globalAlpha = k * (1 - ph) * .85; ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = 'rgba(90,130,180,0.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * len * ph, y + Math.sin(a) * len * ph, 16 + ph * 50, 0, 7); ctx.fill(); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function burst(x, y, t, t0, s = 1) {
  const d = t - t0; if (d < 0 || d > .9) return;
  const k = easeOut(d / .9);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = 1 - k;
  ctx.fillStyle = '#FFE45A'; ctx.strokeStyle = INK; ctx.lineWidth = 6;
  ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, rr = (i % 2 ? 140 : 300) * (.4 + k); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke();
  // trozos de cáscara volando
  for (let i = 0; i < 8; i++) { const a = i / 8 * 7 + .3, dd = 120 + k * 420; ctx.save(); ctx.translate(Math.cos(a) * dd, Math.sin(a) * dd + k * k * 200); ctx.rotate(k * 9 + i); ctx.beginPath(); ctx.moveTo(-22, -10); ctx.lineTo(22, -14); ctx.lineTo(10, 14); ctx.closePath(); ctx.fillStyle = HULL2; ctx.fill(); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function flash(t, t0, a = .8) { const d = t - t0; if (d >= 0 && d < .15) { ctx.fillStyle = `rgba(255,250,220,${a * (1 - d / .15)})`; ctx.fillRect(0, 0, W, H); } }
const COOK = { coat: '#E3352B', apron: '#FFFFFF', hat: 'hair', hatColor: '#3A2418' };

/* 1 — gancho: el grano explota */
function sc1(t) {
  kitchen(t);
  const tx = at(0, 'explota', .1);
  pot(560, 1450, 1.05, t, { lid: t > tx ? .6 : 0, rattle: t < tx ? 1 : 0, pops: t > tx ? 10 : 0 });
  person(170, 1900, 1.15, Object.assign({}, COOK, { arms: [2.2, 2.6], eyes: t > tx ? 'wide' : 'open', mouth: t > tx ? 'o' : 'smile', face: 1 }));
  if (t < tx) {
    const wob = prog(t, 0, tx);
    kernel(540, 620, 1.35, t, { heat: wob * .8, shake: wob * wob, rot: Math.sin(t * 9) * .05 * wob, face: true, mood: wob > .55 ? 'scared' : 'happy' });
    heatWaves(540, 880, 300, t, wob);
    // signos de pregunta
    ctx.fillStyle = INK; ctx.font = `900 120px ${FONT}`; ctx.textAlign = 'center'; ctx.globalAlpha = clamp(t * 2);
    ctx.fillText('?', 240 + Math.sin(t * 3) * 10, 520); ctx.fillText('?', 850, 480 + Math.sin(t * 3 + 1) * 10); ctx.globalAlpha = 1;
  } else {
    const k = easeBack(prog(t, tx, tx + .45));
    popcorn(540, 600, 1.9 * k, { face: true, rot: Math.sin(t * 2) * .06, seed: 3 });
    burst(540, 600, t, tx, 1.2);
    sfxText('¡POP!', 540, 260, t, tx, { size: 150, dur: 1.4 });
    popIn(t, at(0, 'palomita') + .1, k2 => readTag('PALOMITA', 540, 1000, k2));
  }
  flash(t, tx);
  captions(CAPS[0], t);
}
/* 2 — las tres partes del grano */
function sc2(t) {
  lab(t);
  const cutK = easeInOut(prog(t, at(1, 'cáscara') + .4, at(1, 'almidón') - .1));
  kernel(540, 680, 2.25, t, { cut: cutK, water: easeBack(prog(t, at(1, 'gotita') - .2, at(1, 'gotita') + .3)) });
  callout('CÁSCARA', 230, 260, 360, 420, t, at(1, 'cáscara'), '#FFB36B');
  callout('ALMIDÓN', 850, 270, 640, 520, t, at(1, 'almidón'), '#FFF6DC');
  callout('AGUA', 870, 1080, 560, 660, t, at(1, 'agua'), '#8ED3F5');
  popIn(t, at(1, 'agua') + .5, k => { ctx.save(); ctx.translate(870, 1160); ctx.scale(k, k); ctx.fillStyle = INK; ctx.font = `800 40px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('≈ 14 % del grano', 0, 0); ctx.restore(); });
  person(150, 1900, .95, { coat: '#2F7BE0', hat: 'hair', glasses: true, arms: [2.4, .2], eyes: 'happy', mouth: 'smile' });
  captions(CAPS[1], t);
}
/* 3 — el agua se vuelve vapor y queda atrapada */
function sc3(t) {
  lab(t);
  const hot = prog(t, 0, at(2, 'vapor')), st = easeOut(prog(t, at(2, 'vapor') - .4, at(2, 'vapor') + .8));
  // parrilla
  ctx.fillStyle = '#3A3A44'; roundRect(160, 1080, 760, 40, 10); inked('#3A3A44', 5);
  flames(540, 1080, 700, t, .8 + hot * .6);
  kernel(540, 650, 2.1, t, { cut: 1, heat: hot * .6, water: 1 - st * .7, steam: st, press: st * .3 });
  heatWaves(540, 1060, 600, t, hot);
  thermo(930, 900, 560, lerp(.1, .5, hot), t);
  popIn(t, at(2, 'vapor'), k => readTag('100 °C', 930, 230, k, '#FFFFFF'));
  popIn(t, at(2, 'vapor') + .2, k => readTag('VAPOR', 300, 230, k, '#FFFFFF'));
  stamp('¡ATRAPADO!', 540, 1540, t, at(2, 'salir') - .1, { size: 90, color: '#B3261E' });
  captions(CAPS[2], t);
}
/* 4 — la presión sube: olla exprés */
function sc4(t) {
  lab(t);
  const steps = [cap(3, 1), cap(3, 2), cap(3, 3)], p = steps.reduce((a, s) => a + easeOut(prog(t, s, s + .5)) / 3, 0);
  ctx.fillStyle = '#3A3A44'; roundRect(60, 1060, 560, 36, 10); inked('#3A3A44', 5);
  flames(340, 1060, 500, t, 1.2);
  kernel(340, 640, 1.7, t, { cut: 1, heat: .6 + p * .3, steam: 1, press: .3 + p * .7, swell: Math.sin(t * 18) * .012 * p + p * .05, shake: p * .4 });
  gauge(830, 520, 190, .15 + p * .65, 'PRESIÓN', t);
  ['SUBE', 'Y SUBE', '¡Y SUBE!'].forEach((s, i) => popIn(t, steps[i], k => { ctx.save(); ctx.translate(830, 820 + i * 80); ctx.scale(k * (1 + i * .15), k * (1 + i * .15)); ctx.fillStyle = '#B3261E'; ctx.font = `900 54px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(s, 0, 0); ctx.restore(); }));
  // olla exprés
  popIn(t, at(3, 'olla') - .1, k => {
    ctx.save(); ctx.translate(560, 1690); ctx.scale(k, k);
    roundRect(-210, -150, 420, 220, 30); const g = ctx.createLinearGradient(-210, 0, 210, 0); g.addColorStop(0, '#8A94A4'); g.addColorStop(.4, '#E4EAF2'); g.addColorStop(1, '#5E6878'); inked(g, 7);
    ctx.beginPath(); ctx.ellipse(0, -150, 220, 34, 0, Math.PI, 0); ctx.closePath(); inked('#C4CCD8', 7);
    roundRect(200, -176, 200, 40, 16); inked('#2B2B33', 6);
    ctx.save(); ctx.translate(0, -190); ctx.rotate(t * 12); roundRect(-24, -24, 48, 48, 8); inked('#2B2B33', 5); ctx.restore();
    ctx.restore();
    steamPuff(560, 1490, t, k, -Math.PI / 2, .6, 10, 260);
    sfxText('PSSSS', 800, 1560, t, at(3, 'olla') + .3, { size: 70, dur: 1.6, color: '#FFFFFF' });
  });
  captions(CAPS[3], t);
}
/* 5 — 180 °C, 9 veces la presión, ¡revienta! */
function sc5(t) {
  lab(t);
  const tb = at(4, 'revienta', .15), crack = prog(t, at(4, 'cáscara') - .2, tb);
  ctx.fillStyle = '#3A3A44'; roundRect(160, 1080, 760, 40, 10); inked('#3A3A44', 5);
  flames(540, 1080, 700, t, 1.3);
  if (t < tb) {
    kernel(540, 650, 2.0, t, { cut: 1, heat: .9, steam: 1, press: 1, swell: .05 + crack * .05, shake: .6 + crack * 1.2, crack });
  } else {
    const k = easeBack(prog(t, tb, tb + .4));
    popcorn(540, 640, 2.4 * k, { seed: 5, face: false });
    burst(540, 640, t, tb, 1.3);
    sfxText('¡POP!', 540, 260, t, tb, { size: 160, dur: 1.5 });
  }
  flash(t, tb, .9);
  thermo(940, 900, 560, .9, t);
  popIn(t, at(4, '180') - .1, k => readTag('180 °C', 900, 230, k, '#FFFFFF'), tb - .1);
  popIn(t, at(4, 'nueve') - .1, k => { ctx.save(); ctx.translate(170, 300); ctx.scale(k, k); gauge(0, 0, 130, .97, '×9', t); ctx.restore(); }, tb - .1);
  captions(CAPS[4], t);
}
/* 6 — el almidón se infla como espuma, ×40 */
function sc6(t) {
  lab(t);
  const g0 = at(5, 'infla') - .3, gk = easeOut(prog(t, g0, at(5, 'cuarenta') + .4));
  // comparación: grano chico a la izquierda
  kernel(200, 760, .55, t, {});
  label('ANTES', 200, 960, { size: 40 });
  popcorn(640, 640, lerp(.4, 2.3, gk), { seed: 8, rot: Math.sin(t * 1.5) * .05, face: t > at(5, 'blanca') - .2 });
  // espuma: burbujitas que crecen
  if (gk < 1) for (let i = 0; i < 12; i++) { const rr = rng(i + 40), a = rr() * 7, d = gk * 330 * (.5 + rr() * .6); ctx.globalAlpha = 1 - gk; ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(640 + Math.cos(a) * d, 640 + Math.sin(a) * d, 14 + rr() * 16, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  bigNumber('×40', 870, 1060, 150, t, at(5, 'cuarenta') - .2, { tOut: at(5, 'enfría') - .2 });
  // se enfría: copos azules
  const cool = prog(t, at(5, 'enfría') - .2, at(5, 'enfría') + .4) * (1 - prog(t, at(5, 'por') - .2, at(5, 'por') + .3));
  if (cool > 0) { ctx.fillStyle = `rgba(120,190,255,${.25 * cool})`; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = `rgba(255,255,255,${cool})`; ctx.lineWidth = 6; for (let i = 0; i < 8; i++) { const sx = 160 + (i * 137) % 800, sy = 220 + (i * 211) % 800 + (t * 60) % 80; for (let j = 0; j < 3; j++) { const a = j * Math.PI / 3; ctx.beginPath(); ctx.moveTo(sx - Math.cos(a) * 22, sy - Math.sin(a) * 22); ctx.lineTo(sx + Math.cos(a) * 22, sy + Math.sin(a) * 22); ctx.stroke(); } } }
  popIn(t, at(5, 'blanca'), k => readTag('BLANCA', 330, 1580, k, '#FFFFFF'));
  popIn(t, at(5, 'crujiente'), k => readTag('CRUJIENTE', 760, 1580, k, '#FFD84A'));
  sfxText('¡CRUNCH!', 640, 1740, t, at(5, 'crujiente') + .3, { size: 100, dur: 1.2 });
  captions(CAPS[5], t);
}
/* 7 — el pop es el vapor y la palomita salta con una "patita" */
function sc7(t) {
  lab(t);
  const tJ = at(6, 'palomita') - .4;
  if (t < tJ) {
    // mito: la cáscara rompiéndose
    const tp = at(6, 'pop');
    sfxText('¡POP!', 540, 240, t, tp - .1, { size: 160, dur: 1.2 });
    kernel(540, 680, 1.7, t, { crack: 1, heat: .5 });
    noSign(540, 680, 300, t, at(6, 'rompiéndose') - .3, null, at(6, 'vapor') - .3);
    const tv = at(6, 'vapor') - .2;
    if (t > tv) {
      const k = prog(t, tv, tv + .3);
      steamPuff(540, 400, t, k, -Math.PI / 2, 1.2, 16, 380);
      popIn(t, tv + .2, k2 => readTag('VAPOR', 540, 1000, k2, '#FFFFFF'));
      sfxText('¡FSSSH!', 820, 330, t, at(6, 'golpe') - .2, { size: 80, dur: 1.2, color: '#FFFFFF' });
    }
  } else {
    // salto
    const gy = 1500;
    ctx.fillStyle = '#5E6878'; ctx.fillRect(-40, gy, W + 80, H); ctx.fillStyle = '#9AA4B4'; ctx.fillRect(-40, gy, W + 80, 26); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(-50, gy, W + 100, 26);
    flames(540, H + 20, 1100, t, .7);
    const tL = at(6, 'patita') - .3, d = t - tL;
    if (d < 0) {
      kernel(540, gy - 150, .9, t, { heat: .8, shake: .5 });
      popIn(t, at(6, 'salta'), k => readTag('¡SALTA!', 540, 400, k));
    } else {
      // la patita de almidón empuja y el grano sale volando
      const legK = easeOut(prog(d, 0, .35)), fly = Math.max(0, d - .35), h = Math.max(0, 900 * fly - 600 * fly * fly), fx = 540 + fly * 120;
      const y = gy - 150 - legK * 90 - h;
      if (d < .9) { ctx.fillStyle = POP; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(fx, y + 140 + legK * 45, 40, 30 + legK * 60, 0, 0, 7); ctx.fill(); ctx.stroke(); }
      if (d < .5) kernel(fx, y, .9, t, { heat: .8, rot: d * 2 }); else popcorn(fx, y, 1.1, { rot: fly * 5, seed: 9, face: true });
      callout('PATITA', 860, 1160, fx + 40, gy - 30, t, tL + .1, '#FFD84A');
      for (let i = 0; i < 4; i++) { ctx.strokeStyle = 'rgba(20,20,20,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(fx - 70 + i * 45, y + 120 + 40 * i % 3); ctx.lineTo(fx - 80 + i * 45, y + 220 + 40 * i % 3); ctx.stroke(); }
    }
  }
  captions(CAPS[6], t);
}
/* 8 — las que no revientan */
function sc8(t) {
  kitchen(t);
  // tazón con palomitas y granos sin reventar
  const bx = 540, by = 1080;
  if (t < at(7, 'su') - .2) {
    for (let i = 0; i < 9; i++) popcorn(bx - 240 + (i % 5) * 120, by - 140 - Math.floor(i / 5) * 90, .55, { seed: i + 20, rot: i, hull: false });
    ctx.beginPath(); ctx.moveTo(bx - 330, by - 150); ctx.quadraticCurveTo(bx, by + 260, bx + 330, by - 150); ctx.closePath(); inked('#E3352B', 8);
    ctx.fillStyle = '#FFF'; ctx.font = `900 46px ${FONT}`; ctx.textAlign = 'center';
    kernel(bx - 60, by - 30, .38, t, { face: true, mood: 'sad', tear: false, rot: -.3 }); kernel(bx + 80, by - 10, .34, t, { face: true, mood: 'sad', tear: false, rot: .4 });
    popIn(t, cap(7, 0) + .4, k => readTag('SIN REVENTAR', bx, by + 200, k, '#FFF6DC'));
  } else {
    // dos casos
    lab(t);
    kernel(300, 620, 1.25, t, { cut: 1, crack: prog(t, at(7, 'grieta') - .3, at(7, 'grieta') + .3), steam: .6, face: false });
    if (t > at(7, 'grieta')) for (let i = 0; i < 5; i++) { const ph = (t * .5 + i / 5) % 1; ctx.globalAlpha = (1 - ph) * .8; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(300 + Math.sin(ph * 6 + i) * 20, 400 - ph * 220, 10 + ph * 24, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    popIn(t, at(7, 'grieta'), k => readTag('GRIETA', 300, 1060, k, '#FFB36B'));
    popIn(t, at(7, 'faltaba') - .2, k => {
      ctx.save(); ctx.translate(780, 620); ctx.scale(k, k); ctx.translate(-780, -620);
      kernel(780, 620, 1.25, t, { cut: 1, water: .3 });
      ctx.restore();
      readTag('POCA AGUA', 780, 1060, k, '#8ED3F5');
    });
    popIn(t, at(7, 'escapó') - .1, k => { kernel(540, 1660, .55 * k, t, { face: true, mood: 'sad' }); sfxText('pfff…', 760, 1580, t, at(7, 'escapó'), { size: 60, dur: 1.5, color: '#FFFFFF' }); });
  }
  captions(CAPS[7], t);
}
/* 9 — México y Perú */
function cornPlant(x, gy, s, t, ph = 0) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.4 + ph) * .03);
  ctx.strokeStyle = '#2F7A3A'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -520); ctx.stroke();
  for (let i = 0; i < 5; i++) { const y = -100 - i * 90, sd = i % 2 ? 1 : -1; ctx.beginPath(); ctx.moveTo(0, y); ctx.quadraticCurveTo(sd * 140, y - 90, sd * 220, y + 20); ctx.quadraticCurveTo(sd * 120, y - 50, 0, y + 14); ctx.closePath(); inked('#4FAE4A', 4); }
  // mazorca
  ctx.save(); ctx.translate(30, -300); ctx.rotate(.3);
  ctx.beginPath(); ctx.ellipse(0, 0, 34, 90, 0, 0, 7); inked('#F2C230', 5);
  ctx.fillStyle = 'rgba(180,110,20,0.5)'; for (let yy = -70; yy <= 70; yy += 20) for (let xx = -20; xx <= 20; xx += 20) { ctx.beginPath(); ctx.arc(xx, yy, 6, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-36, 40); ctx.quadraticCurveTo(-50, -40, -10, -100); ctx.quadraticCurveTo(-30, 0, 0, 90); ctx.closePath(); inked('#7CC46A', 4);
  ctx.restore();
  ctx.strokeStyle = '#C9A040'; ctx.lineWidth = 6; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(0, -520); ctx.quadraticCurveTo(i * 20, -580, i * 40, -560); ctx.stroke(); }
  ctx.restore();
}
function sc9(t) {
  const tPe = at(8, 'perú') - .3;
  if (t < tPe) {
    daySky(t);
    ctx.fillStyle = '#8A5A34'; ctx.fillRect(-40, 1500, W + 80, H);
    ctx.fillStyle = '#A06A3E'; for (let x = -40; x < W; x += 120) { ctx.beginPath(); ctx.ellipse(x + 60, 1520, 50, 16, 0, 0, 7); ctx.fill(); }
    [[140, .95, 0], [380, 1.1, 1], [700, 1.0, 2], [940, 1.15, 3]].forEach(([x, s, p]) => cornPlant(x, 1520, s, t, p));
    // banderín de México (colores, sin escudo)
    popIn(t, at(8, 'méxico') - .1, k => { ctx.save(); ctx.translate(540, 320); ctx.scale(k, k); ctx.rotate(-.04); [['#1E7A3E', -180], ['#FFFFFF', -60], ['#C8102E', 60]].forEach(([c, x]) => { ctx.fillStyle = c; ctx.fillRect(x, -70, 120, 140); }); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.strokeRect(-180, -70, 360, 140); ctx.restore(); label('MÉXICO', 540, 470, { size: 54, bg: '#FFD84A' }); });
    bigNumber('9,000', 540, 760, 170, t, at(8, '9000') - .1, { sub: 'AÑOS' });
  } else {
    // excavación en Perú
    const g = ctx.createLinearGradient(0, 0, 0, 900); g.addColorStop(0, '#F7C98A'); g.addColorStop(1, '#FBE6C2'); ctx.fillStyle = g; ctx.fillRect(-40, -40, W + 80, H + 80);
    ctx.fillStyle = '#E2B07A'; ctx.beginPath(); ctx.moveTo(-40, 900); ctx.quadraticCurveTo(300, 760, 600, 880); ctx.quadraticCurveTo(850, 800, W + 40, 870); ctx.lineTo(W + 40, H); ctx.lineTo(-40, H); ctx.fill();
    [['#D49A60', 1060], ['#C2864E', 1440], ['#A8703E', 1720]].forEach(([c, y]) => { ctx.fillStyle = c; ctx.fillRect(-40, y, W + 80, H); });
    roundRect(220, 1440, 640, 240, 20); ctx.fillStyle = 'rgba(60,30,10,0.35)'; ctx.fill();
    popcorn(420, 1560, .45, { seed: 30, color: '#E8C48A', color2: '#B88A50', hull: false }); popcorn(640, 1590, .38, { seed: 31, color: '#E8C48A', color2: '#B88A50', hull: false });
    person(800, 1440, 1.0, { coat: '#8A6A3A', hat: 'fedora', hatColor: '#6A4A2A', band: '#3A2A1A', arms: [-1.0, .3], face: -1, eyes: 'wide', mouth: 'o' });
    sparkle(420, 1500, 1.2, t); sparkle(640, 1530, 1, t);
    label('PERÚ', 540, 300, { size: 60, bg: '#FFD84A' });
    bigNumber('6,700', 540, 640, 170, t, at(8, '6700') - .1, { sub: 'AÑOS' });
  }
  captions(CAPS[8], t);
}
/* 10 — pregunta */
function butter(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); roundRect(-80, -50, 160, 100, 14); inked('#FFE27A', 6); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-60, -36, 50, 12); roundRect(-100, 20, 200, 40, 10); inked('#3F7AE0', 6); ctx.restore(); }
function chile(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-60, -40); ctx.quadraticCurveTo(90, -60, 70, 70); ctx.quadraticCurveTo(40, 0, -60, 10); ctx.closePath(); inked('#D7261E', 6); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(0, -30, 30, 6, -.1, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-60, -16); ctx.lineTo(-96, -40); ctx.lineWidth = 12; ctx.strokeStyle = '#2F7A3A'; ctx.stroke(); ctx.restore(); }
function caramel(x, y, s) { popcorn(x, y, s * .7, { seed: 44, color: '#E8A04A', color2: '#A85A1A', hull: false }); }
function sc10(t) {
  kitchen(t);
  // caja de palomitas a rayas
  ctx.save(); ctx.translate(540, 1150);
  for (let i = 0; i < 12; i++) popcorn(-230 + (i % 6) * 92, -330 - Math.floor(i / 6) * 70 + (i % 2) * 20, .62, { seed: 50 + i, rot: i, hull: false });
  ctx.beginPath(); ctx.moveTo(-280, -320); ctx.lineTo(280, -320); ctx.lineTo(210, 220); ctx.lineTo(-210, 220); ctx.closePath(); ctx.save(); ctx.clip();
  for (let i = -6; i < 6; i++) { ctx.fillStyle = i % 2 ? '#E3352B' : '#FFFFFF'; ctx.fillRect(i * 56, -330, 56, 560); }
  ctx.restore(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
  questionBox('¿Cómo te las', 'comes tú?', t, cap(9, 0) + .2, { y: 330, size: 60 });
  popIn(t, at(9, 'mantequilla') - .1, k => { butter(200, 1590, k); label('MANTEQUILLA', 200, 1740, { size: 34 }); });
  popIn(t, at(9, 'chile') - .1, k => { chile(540, 1590, k * 1.1); label('CHILE', 540, 1740, { size: 34, bg: '#FFB36B' }); });
  popIn(t, at(9, 'caramelo') - .1, k => { caramel(880, 1590, k); label('CARAMELO', 880, 1740, { size: 34, bg: '#F2C27A' }); });
  captions(CAPS[9], t);
}
startVideo([sc1, sc2, sc3, sc4, sc5, sc6, sc7, sc8, sc9, sc10], 3.0);
