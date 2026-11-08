/* ¿Cómo funciona un volcán? — corte transversal, estilo cine oscuro */
const LAVA = '#FF6A1A', LAVA2 = '#FFB23F', HOT = '#FFE8A0';
const CX = 540, PEAK = 470, GROUND = 800, CHAMBER = { x: 540, y: 1330, rx: 270, ry: 120 };

function glow(x, y, r, col, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col.replace('A', String(.75 * a))); g.addColorStop(1, col.replace('A', '0'));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}
const LG = 'rgba(255,120,40,A)';
function coneProfile() {
  ctx.beginPath(); ctx.moveTo(-40, GROUND + 10);
  ctx.lineTo(120, GROUND); ctx.quadraticCurveTo(340, GROUND - 40, 470, PEAK + 20);
  ctx.lineTo(505, PEAK); ctx.lineTo(575, PEAK); ctx.lineTo(610, PEAK + 20);
  ctx.quadraticCurveTo(740, GROUND - 40, 960, GROUND); ctx.lineTo(W + 40, GROUND + 10);
}
/* corte del volcán. o: chamber, conduit (0..1 llenado), blobs, bubbles, erupt, flow, shake */
function crossSection(t, o = {}) {
  ctx.save();
  if (o.shake) ctx.translate(Math.sin(t * 50) * o.shake * 6, Math.cos(t * 43) * o.shake * 4);
  // cielo nocturno
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND); sky.addColorStop(0, '#05070F'); sky.addColorStop(1, '#1A1626');
  ctx.fillStyle = sky; ctx.fillRect(-60, -60, W + 120, GROUND + 60);
  const r = rng(4); for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,255,240,${.2 + .5 * r()})`; ctx.beginPath(); ctx.arc(r() * W, r() * 700, 1 + r() * 1.4, 0, 7); ctx.fill(); }
  // subsuelo por capas
  const layers = [['#3A2E28', 0], ['#2E2622', 160], ['#352A26', 330], ['#2A221F', 520], ['#30241F', 720], ['#3A221A', 920]];
  for (const [c, d] of layers) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-60, GROUND + d); for (let x = -60; x <= W + 60; x += 60) ctx.lineTo(x, GROUND + d + Math.sin(x / 150 + d) * 14); ctx.lineTo(W + 60, H + 60); ctx.lineTo(-60, H + 60); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,0.04)'; for (let i = 0; i < 260; i++) { ctx.beginPath(); ctx.arc(r() * W, GROUND + r() * (H - GROUND), 2 + r() * 5, 0, 7); ctx.fill(); }
  // manto incandescente abajo
  const mg = ctx.createLinearGradient(0, 1700, 0, H); mg.addColorStop(0, 'rgba(255,90,20,0)'); mg.addColorStop(1, `rgba(255,90,20,${.55 + .1 * Math.sin(t * 2)})`);
  ctx.fillStyle = mg; ctx.fillRect(-60, 1650, W + 120, H - 1600);
  // cono del volcán (sobre la superficie)
  coneProfile(); ctx.lineTo(W + 40, GROUND + 60); ctx.lineTo(-40, GROUND + 60); ctx.closePath();
  const cg = ctx.createLinearGradient(0, PEAK, 0, GROUND); cg.addColorStop(0, '#4A3A34'); cg.addColorStop(1, '#2E2420');
  ctx.fillStyle = cg; ctx.fill();
  // línea de corte (borde del perfil)
  coneProfile(); ctx.strokeStyle = 'rgba(230,195,106,0.55)'; ctx.lineWidth = 3; ctx.stroke();
  // conducto alimentador y chimenea
  const pipe = (y1, y2, w) => { ctx.beginPath(); ctx.moveTo(CX - w, y1); ctx.bezierCurveTo(CX - w - 20, (y1 + y2) / 2, CX - w + 20, (y1 + y2) / 2, CX - w, y2); ctx.lineTo(CX + w, y2); ctx.bezierCurveTo(CX + w + 20, (y1 + y2) / 2, CX + w - 20, (y1 + y2) / 2, CX + w, y1); ctx.closePath(); };
  ctx.fillStyle = '#1A1210'; pipe(PEAK, CHAMBER.y - 60, 26); ctx.fill(); pipe(CHAMBER.y + 60, H + 40, 34); ctx.fill();
  ctx.beginPath(); ctx.ellipse(CHAMBER.x, CHAMBER.y, CHAMBER.rx, CHAMBER.ry, 0, 0, 7); ctx.fill();
  // magma en el conducto inferior (siempre algo de flujo desde el manto)
  const feed = o.feed ?? 1;
  if (feed > 0) { ctx.save(); pipe(CHAMBER.y + 60, H + 40, 30); ctx.clip(); const fg = ctx.createLinearGradient(0, CHAMBER.y, 0, H); fg.addColorStop(0, LAVA2); fg.addColorStop(1, LAVA); ctx.globalAlpha = feed; ctx.fillStyle = fg; ctx.fillRect(0, CHAMBER.y + 40 + (1 - feed) * 500, W, H); ctx.restore(); }
  // cámara magmática
  const ch = o.chamber ?? 1;
  if (ch > 0) {
    glow(CHAMBER.x, CHAMBER.y, 420, LG, ch * (.8 + .2 * Math.sin(t * 3)));
    ctx.save(); ctx.beginPath(); ctx.ellipse(CHAMBER.x, CHAMBER.y, CHAMBER.rx - 6, CHAMBER.ry - 6, 0, 0, 7); ctx.clip();
    const top = CHAMBER.y + CHAMBER.ry - ch * CHAMBER.ry * 2;
    const g = ctx.createLinearGradient(0, top, 0, CHAMBER.y + CHAMBER.ry); g.addColorStop(0, HOT); g.addColorStop(.3, LAVA2); g.addColorStop(1, LAVA);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, top); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, top + Math.sin(x / 40 + t * 3) * 6); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    // burbujas de gas dentro de la cámara
    const nb = Math.floor((o.gas ?? 0) * 40);
    for (let i = 0; i < nb; i++) { const rr = rng(i * 13 + 1); const bx = CHAMBER.x - 230 + rr() * 460, ph = (t * (.3 + rr() * .4) + rr()) % 1, by = CHAMBER.y + 90 - ph * 190; const s = (o.bubbleSize ?? .4) * (3 + ph * 10); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, s, 0, 7); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,200,120,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(CHAMBER.x, CHAMBER.y, CHAMBER.rx, CHAMBER.ry, 0, 0, 7); ctx.stroke();
  }
  // magma subiendo por la chimenea
  const cf = o.conduit ?? 0;
  if (cf > 0) {
    const ytop = lerp(CHAMBER.y - 60, PEAK, cf);
    ctx.save(); pipe(PEAK, CHAMBER.y - 40, 22); ctx.clip();
    const g = ctx.createLinearGradient(0, ytop, 0, CHAMBER.y); g.addColorStop(0, HOT); g.addColorStop(.4, LAVA2); g.addColorStop(1, LAVA);
    ctx.fillStyle = g; ctx.fillRect(0, ytop, W, CHAMBER.y - ytop + 40); ctx.restore();
    glow(CX, ytop, 140, LG, .8);
    // burbujas que crecen al subir
    if (o.bubbles) for (let i = 0; i < 14; i++) { const ph = (t * .45 + i / 14) % 1, y = lerp(CHAMBER.y - 60, ytop, ph); if (y < ytop) continue; const s = 3 + ph * 16; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(CX + Math.sin(i * 2.1 + t * 2) * 10, y, s, 0, 7); ctx.stroke(); }
  }
  // gotas de magma que suben por la corteza (desde el manto)
  if (o.blobs) for (let i = 0; i < 9; i++) { const ph = (t * .22 + i / 9) % 1, x = CX + Math.sin(i * 1.7) * 150 + Math.sin(t + i) * 12, y = lerp(1880, CHAMBER.y + 80, ph); const s = 10 + Math.sin(i) * 4 + 10; ctx.fillStyle = LAVA2; glow(x, y, s * 4, LG, o.blobs * .6); ctx.globalAlpha = o.blobs; ctx.beginPath(); ctx.ellipse(x, y, s, s * 1.2, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  // erupción
  const e = o.erupt ?? 0;
  if (e > 0) {
    // columna de ceniza
    if (o.ash !== false) for (let i = 0; i < 26; i++) { const ph = (t * .35 + i / 26) % 1, y = PEAK - 20 - ph * 520 * e, x = CX + Math.sin(i * 2.3 + t) * (30 + ph * 220); ctx.fillStyle = `rgba(${90 + ph * 50},${80 + ph * 40},${76 + ph * 40},${.85 * (1 - ph * .6)})`; ctx.beginPath(); ctx.arc(x, y, 40 + ph * 110, 0, 7); ctx.fill(); }
    // fuente de lava y bombas
    for (let i = 0; i < 20; i++) { const ph = (t * 1.2 + i / 20) % 1, ang = -Math.PI / 2 + (i % 2 ? 1 : -1) * (.15 + (i % 5) * .08), v = 360 * e; const x = CX + Math.cos(ang) * v * ph, y = PEAK + Math.sin(ang) * v * ph + 420 * ph * ph; glow(x, y, 26, LG, .7); ctx.fillStyle = i % 3 ? LAVA2 : HOT; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); }
    glow(CX, PEAK, 220, LG, e);
  }
  // ríos de lava por las laderas
  const f = o.flow ?? 0;
  if (f > 0) for (const sd of [-1, 1]) {
    ctx.save(); ctx.strokeStyle = LAVA; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.shadowColor = LAVA; ctx.shadowBlur = 30;
    ctx.beginPath(); const n = 40;
    for (let i = 0; i <= n * f; i++) { const u = i / n, x = CX + sd * (40 + u * 420), y = lerp(PEAK + 10, GROUND - 10, Math.pow(u, .8)) + Math.sin(u * 12) * 6; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.strokeStyle = HOT; ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
function cinemaVignette() {
  const v = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function zoomed(cx, cy, z, fn) { ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy); fn(); ctx.restore(); }
function arrowUp(x, y, s, a, col = '#FFFFFF') { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(36, 0); ctx.lineTo(12, 0); ctx.lineTo(12, 50); ctx.lineTo(-12, 50); ctx.lineTo(-12, 0); ctx.lineTo(-36, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }

/* 1 — ¿qué pasa dentro? */
function sc1(t) {
  crossSection(t, { chamber: .7, shake: .4 + .3 * Math.sin(t * 2), erupt: 0 });
  for (let i = 0; i < 6; i++) { const ph = (t * .4 + i / 6) % 1; ctx.fillStyle = `rgba(160,150,150,${.4 * (1 - ph)})`; ctx.beginPath(); ctx.arc(CX + Math.sin(i + t) * 30 + ph * 60, PEAK - 30 - ph * 220, 26 + ph * 60, 0, 7); ctx.fill(); }
  cinemaVignette();
  tag('Volcán por dentro', 540, 1560, t, .6, { color: LAVA });
  say(CAPS[0], t);
}
/* 2 — la roca se derrite: magma */
function sc2(t) {
  const z = lerp(1, 1.9, easeInOut(prog(t, 0, 2.5)));
  zoomed(540, lerp(960, 1650, easeInOut(prog(t, 0, 2.5))), z, () => crossSection(t, { chamber: .0, feed: 0, blobs: prog(t, cap(1, 4), cap(1, 4) + .8) }));
  // granos de roca que se ponen incandescentes
  const melt = prog(t, cap(1, 2), cap(1, 4) + .4);
  const r = rng(7);
  for (let i = 0; i < 70; i++) { const x = r() * W, y = 1000 + r() * 800, s = 8 + r() * 16; const hot = clamp(melt * 1.6 - r() * .6); ctx.fillStyle = `rgb(${lerp(80, 255, hot)},${lerp(66, 140, hot)},${lerp(60, 40, hot)})`; if (hot > .5) glow(x, y, s * 3, LG, hot * .5); ctx.beginPath(); ctx.ellipse(x, y, s, s * .8, r(), 0, 7); ctx.fill(); }
  cinemaVignette();
  readout('Temperatura', `${Math.round(lerp(700, 1200, melt))} °C`, 110, 1480, 860, t, cap(1, 2), { vsize: 44 });
  tag('Magma', 540, 1640, t, cap(1, 5), { color: LAVA });
  say(CAPS[1], t);
}
/* 3 — sube y se acumula en la cámara magmática */
function sc3(t) {
  const fill = easeInOut(prog(t, cap(2, 3), cap(2, 5)));
  crossSection(t, { chamber: .15 + .7 * fill, blobs: 1 });
  arrowUp(840, 1600, 1, prog(t, cap(2, 0), cap(2, 0) + .4) * .6, LAVA2);
  cinemaVignette();
  leader(760, 1180, CHAMBER.x + 180, CHAMBER.y - 60, prog(t, cap(2, 4), cap(2, 4) + .4), GOLD);
  tag('Cámara magmática', 760, 1140, t, cap(2, 4), { color: LAVA });
  readout('Profundidad', 'pocos km', 110, 1560, 860, t, cap(2, 6), { vsize: 44 });
  say(CAPS[2], t);
}
/* 4 — gases disueltos: como un refresco cerrado */
function soda(x, y, s, t, open) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(-70, -170, 140, 320, 30); const g = ctx.createLinearGradient(-70, 0, 70, 0); g.addColorStop(0, 'rgba(120,180,120,.55)'); g.addColorStop(.5, 'rgba(200,240,200,.35)'); g.addColorStop(1, 'rgba(80,140,80,.55)'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(60,30,10,.6)'; ctx.fillRect(-64, -60, 128, 204);
  roundRect(-30, -220, 60, 50, 8); ctx.fillStyle = '#C8322E'; ctx.fill();
  for (let i = 0; i < 18; i++) { const rr = rng(i + 3), ph = (t * .3 + rr()) % 1; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(-50 + rr() * 100, 130 - ph * 180, open ? 4 + ph * 6 : 2, 0, 7); ctx.fill(); }
  ctx.restore();
}
function sc4(t) {
  zoomed(CHAMBER.x, CHAMBER.y, 2.1, () => crossSection(t, { chamber: .85, gas: 1, bubbleSize: .15 }));
  cinemaVignette();
  tag('H₂O · vapor de agua', 540, 560, t, cap(3, 1), { color: '#7FD3FF' });
  tag('CO₂ · dióxido de carbono', 540, 660, t, cap(3, 3), { color: '#B6FFB0' });
  if (t > cap(3, 4) - .2) { ctx.fillStyle = `rgba(0,0,0,${.55 * prog(t, cap(3, 4) - .2, cap(3, 4) + .2)})`; ctx.fillRect(0, 0, W, H); popIn(t, cap(3, 4), k => soda(540, 1080, 1.4 * k, t, false)); tag('Refresco cerrado', 540, 1520, t, cap(3, 5), { color: GOLD }); }
  say(CAPS[3], t);
}
/* 5 — la presión baja y crecen las burbujas */
function sc5(t) {
  zoomed(CX, 1000, 1.35, () => crossSection(t, { chamber: .9, gas: 1, bubbleSize: .6, conduit: .55 + .1 * Math.sin(t * 2), bubbles: true }));
  cinemaVignette();
  for (let i = 0; i < 3; i++) arrowUp(820, 1200 - ((t * 120 + i * 140) % 420), .8, .7 * prog(t, cap(4, 4), cap(4, 4) + .3), '#FFFFFF');
  readout('Presión', t < cap(4, 1) ? 'Alta' : 'Bajando ↓', 110, 1500, 860, t, cap(4, 0), { vsize: 44 });
  tag('Burbujas', 300, 900, t, cap(4, 3), { color: '#FFFFFF' });
  say(CAPS[4], t);
}
/* 6 — sale por la chimenea: lava */
function sc6(t) {
  const up = easeIn(prog(t, cap(5, 2) - .3, cap(5, 4) - .1));
  const boom = cap(5, 4) - .1;
  crossSection(t, { chamber: .9, gas: .8, conduit: .3 + .7 * up, bubbles: true, erupt: prog(t, boom, boom + .6), flow: prog(t, boom + .3, boom + 2.2), shake: t > boom ? 1 : up * .5 });
  if (t > boom && t < boom + .12) { ctx.fillStyle = 'rgba(255,240,200,.85)'; ctx.fillRect(0, 0, W, H); }
  cinemaVignette();
  tag('Chimenea', 300, 1120, t, cap(5, 4), { color: GOLD });
  if (t > cap(5, 6)) tag('Lava', 540, 1560, t, cap(5, 6), { color: LAVA });
  say(CAPS[5], t);
}
/* 7 — espeso = explosiva · líquido = fluye */
function sc7(t) {
  const split = cap(6, 4) - .2;
  if (t < split) {
    zoomed(CX, 760, 1.15, () => crossSection(t, { chamber: .9, conduit: 1, erupt: 1, shake: .8, flow: 0 }));
    cinemaVignette();
    readout('Magma', 'Espeso', 110, 1440, 860, t, cap(6, 0) + .2, { vsize: 44 });
    tag('Erupción explosiva', 540, 1600, t, cap(6, 3), { color: '#FF5A4F' });
  } else {
    zoomed(CX, 760, 1.15, () => crossSection(t, { chamber: .9, conduit: 1, erupt: .35, ash: false, flow: 1 }));
    cinemaVignette();
    readout('Magma', 'Líquido', 110, 1440, 860, t, split + .2, { vsize: 44 });
    tag('Lava que fluye', 540, 1600, t, cap(6, 5), { color: LAVA2 });
  }
  say(CAPS[6], t);
}
/* 8 — 1.000 °C y el Popocatépetl */
function popo(t) {
  const sky = ctx.createLinearGradient(0, 0, 0, 1500); sky.addColorStop(0, '#0A0C1A'); sky.addColorStop(1, '#3A2A3A'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.beginPath(); ctx.moveTo(-40, 1500); ctx.lineTo(380, 760); ctx.lineTo(470, 730); ctx.lineTo(560, 735); ctx.lineTo(660, 770); ctx.lineTo(1120, 1500); ctx.closePath();
  const g = ctx.createLinearGradient(0, 730, 0, 1500); g.addColorStop(0, '#4A4A5A'); g.addColorStop(1, '#1E1A22'); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.moveTo(380, 760); ctx.lineTo(470, 730); ctx.lineTo(560, 735); ctx.lineTo(660, 770); ctx.lineTo(720, 860); ctx.lineTo(640, 830); ctx.lineTo(580, 880); ctx.lineTo(520, 840); ctx.lineTo(450, 890); ctx.lineTo(400, 840); ctx.lineTo(330, 860); ctx.closePath(); ctx.fillStyle = '#E8ECF2'; ctx.fill();
  for (let i = 0; i < 10; i++) { const ph = (t * .25 + i / 10) % 1; ctx.fillStyle = `rgba(200,200,210,${.45 * (1 - ph)})`; ctx.beginPath(); ctx.arc(515 + ph * 160 + Math.sin(i) * 20, 700 - ph * 380, 30 + ph * 90, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#120E14'; ctx.fillRect(0, 1500, W, H - 1500);
  const r = rng(9); for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(255,220,150,${.4 + .4 * r()})`; ctx.fillRect(r() * W, 1520 + r() * 200, 3, 3); }
}
function sc8(t) {
  if (t < cap(7, 3) - .2) {
    zoomed(CX, 700, 1.4, () => crossSection(t, { chamber: .9, conduit: 1, erupt: .5, ash: false, flow: 1 }));
    cinemaVignette();
    const k = easeOut(prog(t, cap(7, 2) - .3, cap(7, 2) + .6));
    readout('Temperatura de la lava', `+${Math.round(k * 1000).toLocaleString('es-ES')} °C`, 110, 1480, 860, t, cap(7, 1), { vsize: 48 });
  } else {
    popo(t); cinemaVignette();
    tag('Popocatépetl · México', 540, 1620, t, cap(7, 5), { color: LAVA });
    readout('Estado', 'Activo', 110, 1440, 860, t, cap(7, 4), { vsize: 44 });
  }
  say(CAPS[7], t);
}
/* 9 — pregunta */
function sc9(t) {
  popo(t); cinemaVignette();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H);
  popIn(t, cap(8, 0) + .1, k => { ctx.save(); ctx.translate(540, 1000); ctx.scale(k, k); glass(-400, -150, 800, 300, 26); ctx.fillStyle = '#fff'; ctx.font = `800 66px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('¿Vivirías cerca', 0, -50); ctx.fillText('de un volcán?', 0, 30); ctx.font = `600 34px ${FONT}`; ctx.fillStyle = GOLD; ctx.fillText('Comenta 👇', 0, 105); ctx.restore(); });
  say(CAPS[8], t);
}
startVideo([sc1, sc2, sc3, sc4, sc5, sc6, sc7, sc8, sc9], 3.0);
