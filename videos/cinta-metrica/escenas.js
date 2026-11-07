/* La cinta métrica que casi todos usan mal — escenas */
const YEL = '#F2C21B', STEEL = ['#E8ECF0', '#9AA3AD', '#5E6772'];

function workshop(t, o = {}) {
  ctx.fillStyle = '#C9A57A'; ctx.fillRect(0, 0, W, H);
  // tablero perforado
  roundRect(40, 120, 1000, 980, 12); inked('#B98E5E', 7);
  ctx.fillStyle = 'rgba(60,40,20,0.45)'; for (let y = 160; y < 1080; y += 46) for (let x = 80; x < 1020; x += 46) { ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); }
  // herramientas colgadas (siluetas)
  ctx.save(); ctx.globalAlpha = o.dimTools ?? .55;
  ctx.fillStyle = '#5E6772'; ctx.strokeStyle = INK; ctx.lineWidth = 5;
  roundRect(120, 220, 40, 220, 10); inked('#C8322E', 5); roundRect(100, 180, 80, 60, 10); inked('#5E6772', 5);   // martillo
  roundRect(880, 200, 26, 260, 8); inked('#E3352B', 5); ctx.fillStyle = '#9AA3AD'; ctx.fillRect(886, 460, 14, 120);  // destornillador
  ctx.beginPath(); ctx.moveTo(700, 220); ctx.lineTo(820, 220); ctx.lineTo(820, 300); ctx.lineTo(700, 300); ctx.closePath(); inked('#5E6772', 5); // sierra
  ctx.restore();
  // banco de madera
  ctx.fillStyle = '#8A5A2E'; ctx.fillRect(0, 1250, W, H - 1250);
  ctx.strokeStyle = 'rgba(40,20,5,0.35)'; ctx.lineWidth = 4; for (let y = 1280; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(300, y + 10, 700, y - 10, W, y + 6); ctx.stroke(); }
  ctx.fillStyle = '#A8723E'; ctx.fillRect(0, 1230, W, 30); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(-5, 1230, W + 10, 30);
}
/* cuerpo de la cinta (la salida de la hoja queda en el lado derecho, abajo) */
function tapeCase(x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
  roundRect(-150, -150, 300, 300, 70); ctx.fillStyle = YEL; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
  roundRect(-110, -110, 220, 220, 50); inked('#1E1E24', 6);
  ctx.beginPath(); ctx.arc(0, 0, 60, 0, 7); inked('#3A3A44', 5);
  ctx.fillStyle = YEL; ctx.font = `900 34px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('5 m', 0, 2);
  roundRect(-40, -175, 80, 40, 10); inked('#C8322E', 5);         // botón de freno
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-90, -100, 30, 14, -.7, 0, 7); ctx.fill();
  ctx.restore();
}
/* hoja con marcas: desde (x0, y) hacia la derecha, longitud len (en px de pantalla) */
function blade(x0, y, len, s, offset = 0) {
  const h = 46 * s;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0, y - h / 2, len, h); ctx.clip();
  const g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, '#FFE066'); g.addColorStop(1, '#E8B814');
  ctx.fillStyle = g; ctx.fillRect(x0, y - h / 2, len, h);
  ctx.strokeStyle = INK; ctx.lineWidth = 2 * s;
  const step = 10 * s;
  for (let i = 0; ; i++) {
    const x = x0 + len - i * step - offset; if (x < x0) break;
    const L = i % 10 === 0 ? h * .55 : i % 5 === 0 ? h * .38 : h * .22;
    ctx.beginPath(); ctx.moveTo(x, y - h / 2); ctx.lineTo(x, y - h / 2 + L); ctx.stroke();
    if (i % 10 === 0 && i > 0) { ctx.fillStyle = INK; ctx.font = `900 ${Math.round(16 * s)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(String(i / 10), x, y + h / 2 - 4 * s); }
  }
  ctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(x0, y - h / 2, len, h);
}
/* gancho metálico al final de la hoja (x = borde interior donde termina la hoja) */
function hook(x, y, s, o = {}) {
  const h = 46 * s, th = 8 * s, lip = 70 * s;
  ctx.save();
  // remaches en la hoja (pestaña del gancho sobre la hoja)
  const tab = 54 * s;
  const sg = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2); sg.addColorStop(0, STEEL[0]); sg.addColorStop(.5, STEEL[1]); sg.addColorStop(1, STEEL[2]);
  roundRect(x - tab, y - h / 2 - 2 * s, tab + th, h + 4 * s, 4 * s); ctx.fillStyle = sg; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  for (const ry of [-.22, .22]) { ctx.beginPath(); ctx.arc(x - tab * .55, y + ry * h, 5 * s, 0, 7); ctx.fillStyle = STEEL[0]; ctx.fill(); ctx.stroke(); }
  // labio vertical del gancho (baja por debajo de la hoja)
  roundRect(x, y - h / 2 - 6 * s, th, h + lip, 3 * s); ctx.fillStyle = sg; ctx.fill(); ctx.stroke();
  // ranura para clavos
  if (o.slot !== false) { roundRect(x + th * .15, y + h / 2 + lip * .25, th * .7, lip * .35, 3 * s); ctx.fillStyle = '#2B2D3A'; ctx.fill(); }
  // dientes
  if (o.teeth !== false) { ctx.fillStyle = STEEL[2]; ctx.beginPath(); const by = y + h / 2 + lip - 6 * s; ctx.moveTo(x, by); for (let k = 0; k <= 4; k++) { ctx.lineTo(x + th * k / 4, by + (k % 2 ? 8 * s : 0)); } ctx.lineTo(x + th, by); ctx.fill(); }
  ctx.restore();
}
function arrowH(x1, x2, y, col = '#E3352B', w = 8) {
  ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  for (const [x, d] of [[x1, 1], [x2, -1]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d * 26, y - 18); ctx.lineTo(x + d * 26, y + 18); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function wood(x, y, w, h) {
  roundRect(x, y, w, h, 6); inked('#D9A866', 6);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = 'rgba(120,70,20,0.35)'; ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) { const yy = y + 14 + i * (h / 8); ctx.beginPath(); ctx.moveTo(x, yy); ctx.bezierCurveTo(x + w * .3, yy + 8, x + w * .7, yy - 8, x + w, yy + 4); ctx.stroke(); }
  ctx.restore();
}
function nail(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 8, 0, 0, 7); ctx.fillStyle = STEEL[1]; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = STEEL[2]; ctx.fillRect(-5, 0, 10, 26); ctx.strokeRect(-5, 0, 10, 26);
  ctx.restore();
}

/* 1 — la tienes en casa y la usas mal */
function scene1(t) {
  workshop(t);
  const sg = ctx.createRadialGradient(540, 880, 40, 540, 880, 600); sg.addColorStop(0, 'rgba(255,240,190,0.55)'); sg.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
  const ext = easeOut(prog(t, .3, 1.6)) * 540;
  blade(470, 1000, ext + 1, 2.0);
  hook(470 + ext, 1000, 2.0, {});
  tapeCase(330, 880, 1.6, t);
  popIn(t, .2, k => { ctx.save(); ctx.translate(540, 420); ctx.scale(k, k); label('Cinta métrica / flexómetro', 0, 0, { size: 48 }); ctx.restore(); });
  stamp('LA USAS MAL', 540, 640, t, cap(0, 3), { size: 96 });
  captions(CAPS[0], t);
}
/* 2 — el gancho se mueve: ¿roto? no, a propósito */
function scene2(t) {
  workshop(t, { dimTools: .3 });
  dim(t, 0, .35);
  const wig = t > cap(1, 2) - .2 ? Math.sin(t * 9) * 18 : 0;
  blade(-10, 760, 640 + wig, 3.0, -wig);
  hook(630 + wig, 760, 3.0, {});
  if (t > cap(1, 2)) arrowH(560, 820, 1180, '#FFFFFF', 10);
  stamp('¿ROTO?', 540, 420, t, cap(1, 3) - .2, { size: 100, color: '#E3352B', tOut: cap(1, 4) - .3 });
  stamp('✓ A PROPÓSITO', 540, 420, t, cap(1, 4) + .2, { size: 90, color: '#1F9D55' });
  captions(CAPS[1], t);
}
/* 3 — se mueve lo que mide de grueso: jalar desde un borde / empujar contra la pared */
function scene3(t) {
  workshop(t, { dimTools: .2 });
  dim(t, 0, .4);
  const pullT = cap(2, 3), pushT = cap(2, 5);
  // explicación del grosor
  if (t < pullT - .2) {
    blade(-10, 760, 640, 3.0); hook(630, 760, 3.0, {});
    const k = prog(t, cap(2, 1) - .2, cap(2, 1) + .4);
    if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = '#5BFF8A'; ctx.lineWidth = 8; ctx.strokeRect(624, 680, 36, 380); ctx.restore(); popIn(t, cap(2, 1), kk => { ctx.save(); ctx.translate(780, 1120); ctx.scale(kk, kk); label('grosor del gancho', 0, 0, { size: 42, bg: '#5BFF8A' }); ctx.restore(); }); }
    stamp('EXACTA', 540, 420, t, cap(2, 2) + .3, { size: 110, color: '#1F9D55' });
  } else {
    // arriba: jalar desde el borde de una tabla
    wood(560, 470, 420, 160);
    const ex = t > pushT - .2 ? 0 : 24;
    blade(80, 470, 480 + ex, 1.6); hook(560 + ex, 470, 1.6, { slot: false });
    label('JALAR', 300, 380, { size: 44, bg: '#FFD84A' });
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, 700, W, 6);
    // abajo: empujar contra una pared
    if (t > pushT - .2) {
      ctx.fillStyle = '#9AA0B0'; ctx.fillRect(820, 820, 200, 380); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(820, 820, 200, 380);
      const k = easeOut(prog(t, pushT - .2, pushT + .4));
      blade(200, 980, lerp(560, 608, k), 1.6); hook(200 + lerp(560, 608, k), 980, 1.6, { slot: false });
      label('EMPUJAR', 400, 880, { size: 44, bg: '#FFD84A' });
      sfxText('✓', 760, 1120, t, pushT + .4, { size: 110, color: '#5BFF8A', dur: 1.5 });
    }
  }
  captions(CAPS[2], t);
}
/* 4 — el agujerito: engancharla a un clavo y medir solo */
function scene4(t) {
  workshop(t, { dimTools: .3 });
  if (t < cap(3, 4) - .2) {
    dim(t, 0, .35);
    blade(-10, 700, 640, 3.0); hook(630, 700, 3.0, {});
    // zoom a la ranura
    if (t < cap(3, 2) - .1) { ctx.save(); ctx.strokeStyle = '#FFD84A'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(642, 950, 70 + Math.sin(t * 8) * 6, 0, 7); ctx.stroke(); ctx.restore(); }
    else { const k = easeOut(prog(t, cap(3, 2) - .1, cap(3, 2) + .4)); nail(643, lerp(1300, 935, k), 2.4); if (t > cap(3, 3)) popIn(t, cap(3, 3), kk => { ctx.save(); ctx.translate(780, 1100); ctx.scale(kk, kk); label('clavo o tornillo', 0, 0, { size: 42, bg: '#FFD84A' }); ctx.restore(); }); }
  } else {
    // tú solo midiendo una tabla larga
    wood(60, 1100, 960, 110);
    nail(110, 1100, 1.4);
    const ext = easeOut(prog(t, cap(3, 4) - .2, cap(3, 4) + .8)) * 560;
    tapeCase(110 + ext + 120, 1060, .55, t);
    blade(110, 1100, ext + 40, 1.0); hook(102, 1100, 1.0, { teeth: false });
    const p = person(110 + ext + 220, 1250, 1.2, { coat: '#2F7BE0', hat: 'hair', hatColor: '#5A3A22', arms: [1.6, .3], armLen: 130, eyes: 'happy', mouth: 'smile', face: -1 });
    popIn(t, cap(3, 4) + .3, k => { ctx.save(); ctx.translate(540, 520); ctx.scale(k, k); label('¡sin ayuda!', 0, 0, { size: 56, bg: '#5BFF8A' }); ctx.restore(); });
  }
  captions(CAPS[3], t);
}
/* 5 — borde dentado: raspar y marcar */
function scene5(t) {
  workshop(t, { dimTools: .3 });
  wood(0, 900, W, 360);
  const scr = t > cap(4, 3) - .2;
  const dx = scr ? Math.sin(t * 24) * 22 : 0;
  ctx.save(); ctx.translate(dx, 0);
  blade(-10, 640, 560, 3.0); hook(550, 640, 3.0, {});
  ctx.restore();
  if (scr) { const k = prog(t, cap(4, 3), cap(4, 5) + .4); ctx.strokeStyle = '#5A3010'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(530, 920); ctx.lineTo(530 + 80 * k, 920); ctx.moveTo(574, 905); ctx.lineTo(574, 905 + 120 * k); ctx.stroke(); }
  if (t < cap(4, 3)) noSign(830, 420, 110, t, cap(4, 2), () => { ctx.save(); ctx.rotate(-.7); roundRect(-80, -14, 160, 28, 6); inked('#F2C21B', 4); ctx.beginPath(); ctx.moveTo(80, -14); ctx.lineTo(110, 0); ctx.lineTo(80, 14); ctx.closePath(); inked('#E9D2B0', 4); ctx.restore(); });
  if (t > cap(4, 1)) { ctx.save(); ctx.strokeStyle = '#FFD84A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(586, 900 + (scr ? 0 : 0), 60, 0, 7); ctx.stroke(); ctx.restore(); }
  if (t > cap(4, 5)) sfxText('¡marca!', 760, 1080, t, cap(4, 5), { size: 70, color: '#FFFFFF', dur: 1.3 });
  captions(CAPS[4], t);
}
/* 6 — compás para dibujar círculos */
function scene6(t) {
  workshop(t, { dimTools: .3 });
  wood(60, 320, 960, 900);
  const cx = 540, cy = 770, R = 330;
  nail(cx, cy, 1.4);
  const k = prog(t, cap(5, 2) - .2, DURS[5] - .2);
  const a = -Math.PI / 2 + k * Math.PI * 2;
  // arco dibujado
  if (k > 0) { ctx.save(); ctx.strokeStyle = '#2B2D3A'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, a); ctx.stroke(); ctx.restore(); }
  // hoja girando
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
  blade(0, 0, R, 1.1); hook(-6, 0, 1.1, { teeth: false });
  ctx.translate(R, 0); ctx.rotate(-.4); roundRect(-14, -90, 28, 120, 6); inked('#F2C21B', 4); ctx.beginPath(); ctx.moveTo(-14, 30); ctx.lineTo(0, 56); ctx.lineTo(14, 30); ctx.closePath(); inked('#E9D2B0', 4);
  ctx.restore();
  popIn(t, cap(5, 4), kk => { ctx.save(); ctx.translate(540, 220); ctx.scale(kk, kk); label('= COMPÁS', 0, 0, { size: 60, bg: '#FFD84A' }); ctx.restore(); });
  captions(CAPS[5], t);
}
/* 7 — no la sueltes de golpe */
function scene7(t) {
  workshop(t, { dimTools: .3 });
  const snap = cap(6, 2) - .3, hit = snap + .35;
  const ext = t < snap ? 540 : Math.max(0, lerp(540, 0, easeIn(prog(t, snap, hit))));
  blade(470, 1000, ext + 1, 2.0);
  const bent = t > hit;
  ctx.save(); if (bent) { ctx.translate(470, 1000); ctx.rotate(.25); ctx.translate(-470, -1000); }
  hook(470 + ext, 1000, 2.0, {});
  ctx.restore();
  const shake = t > hit && t < hit + .3 ? Math.sin(t * 90) * 10 : 0;
  tapeCase(330 + shake, 880, 1.6, t);
  if (t > hit) sfxText('¡CLANK!', 660, 880, t, hit, { size: 110, color: '#FFFFFF', dur: 1.2 });
  if (t > cap(6, 4) - .2) { dim(t, cap(6, 4), .55); popIn(t, cap(6, 4), k => { ctx.save(); ctx.translate(540, 620); ctx.scale(k, k); roundRect(-360, -110, 720, 220, 24); inked('#FFF6DC', 7); ctx.fillStyle = INK; ctx.font = `900 80px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('120 cm  ≠  120 cm', 0, 6); ctx.restore(); }); stamp('MAL', 760, 480, t, cap(6, 5) + .3, { size: 100 }); }
  captions(CAPS[6], t);
}
/* 8 — ¿cuál no sabías? */
function scene8(t) {
  workshop(t, { dimTools: .3 }); dim(t, 0, .35);
  const items = ['1. El gancho se mueve', '2. Agujero para clavos', '3. Borde para marcar', '4. Hace de compás', '5. No la sueltes de golpe'];
  items.forEach((s, i) => popIn(t, .1 + i * .15, k => { ctx.save(); ctx.translate(540, 820 + i * 92); ctx.scale(k, k); label(s, 0, 0, { size: 40, bg: ['#FFD84A', '#5FD0FF', '#5BFF8A', '#FF7FB5', '#FFB23F'][i] }); ctx.restore(); }));
  questionBox('¿Cuál de estos', 'no sabías?', t, cap(7, 0) + .1, { y: 440 });
  captions(CAPS[7], t);
}
startVideo([scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8], 3.2);
