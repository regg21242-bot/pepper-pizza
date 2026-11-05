/* El hombre que vendió la Torre Eiffel — escenas */
const LUSTIG = { coat: '#2B2B33', hat: 'fedora', hatColor: '#2B2B33', band: '#8A2B2B', mustache: true, tie: '#8A2B2B' };
const POISSON = { coat: '#5A4A3A', hat: 'tophat', mustache: true, glasses: false, tie: '#2E4A6A' };

function eiffel(x, gy, s, t, o = {}) {
  ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
  const col = o.col || '#8A5A3A', dark = shade(col, -.35);
  const H1 = 1200;
  const leg = side => { // pata curva
    ctx.beginPath(); ctx.moveTo(side * 330, 0); ctx.quadraticCurveTo(side * 200, -260, side * 120, -430);
    ctx.lineTo(side * 70, -430); ctx.quadraticCurveTo(side * 120, -240, side * 200, 0); ctx.closePath(); inked(col, 6);
  };
  leg(-1); leg(1);
  // arco entre patas
  ctx.beginPath(); ctx.moveTo(-200, 0); ctx.quadraticCurveTo(0, -330, 200, 0); ctx.lineWidth = 14; ctx.strokeStyle = dark; ctx.stroke();
  // celosía de las patas
  ctx.strokeStyle = dark; ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) { const y = -i * 48; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * (330 - i * 24), y); ctx.lineTo(sd * (200 - i * 9), y - 48); ctx.moveTo(sd * (200 - i * 9), y); ctx.lineTo(sd * (330 - (i + 1) * 24), y - 48); ctx.stroke(); } }
  // primera plataforma
  roundRect(-170, -470, 340, 44, 4); inked(col, 6);
  // cuerpo medio
  ctx.beginPath(); ctx.moveTo(-120, -470); ctx.quadraticCurveTo(-70, -640, -50, -800); ctx.lineTo(50, -800); ctx.quadraticCurveTo(70, -640, 120, -470); ctx.closePath(); inked(col, 6);
  ctx.save(); ctx.clip(); ctx.strokeStyle = dark; ctx.lineWidth = 3; for (let y = -470; y > -800; y -= 36) { ctx.beginPath(); ctx.moveTo(-130, y); ctx.lineTo(130, y - 36); ctx.moveTo(130, y); ctx.lineTo(-130, y - 36); ctx.stroke(); } ctx.restore();
  roundRect(-80, -830, 160, 34, 4); inked(col, 6);
  // parte alta
  ctx.beginPath(); ctx.moveTo(-50, -830); ctx.lineTo(-14, -H1 + 60); ctx.lineTo(14, -H1 + 60); ctx.lineTo(50, -830); ctx.closePath(); inked(col, 6);
  ctx.save(); ctx.clip(); ctx.strokeStyle = dark; ctx.lineWidth = 3; for (let y = -830; y > -H1; y -= 30) { ctx.beginPath(); ctx.moveTo(-60, y); ctx.lineTo(60, y - 30); ctx.moveTo(60, y); ctx.lineTo(-60, y - 30); ctx.stroke(); } ctx.restore();
  roundRect(-26, -H1 + 30, 52, 40, 6); inked(col, 5);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -H1 + 30); ctx.lineTo(0, -H1 - 40); ctx.stroke();
  ctx.fillStyle = '#E3352B'; ctx.beginPath(); ctx.moveTo(0, -H1 - 40); ctx.lineTo(40 + Math.sin(t * 6) * 6, -H1 - 28); ctx.lineTo(0, -H1 - 16); ctx.fill();
  ctx.restore();
}
function haussmann(x, gy, w, idx, t) {
  const r = rng(900 + idx); const h = 470 + r() * 90, top = gy - h;
  ctx.fillStyle = '#E9DFC8'; ctx.fillRect(x, top, w, h); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(x, top, w, h);
  ctx.strokeStyle = 'rgba(120,100,70,0.25)'; ctx.lineWidth = 2; for (let y = top + 40; y < gy; y += 40) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke(); }
  // tejado de pizarra con buhardillas
  ctx.beginPath(); ctx.moveTo(x - 10, top); ctx.lineTo(x + 30, top - 120); ctx.lineTo(x + w - 30, top - 120); ctx.lineTo(x + w + 10, top); ctx.closePath(); inked('#5E6878', 6);
  for (let k = 0; k < 2; k++) { const dx = x + 60 + k * (w - 160); roundRect(dx, top - 100, 60, 80, 6); inked('#E9DFC8', 4); roundRect(dx + 12, top - 86, 36, 56, 4); inked('#3A4A6A', 3); }
  for (let k = 0; k < 2; k++) { ctx.fillStyle = '#B85A3A'; ctx.fillRect(x + 40 + k * (w - 120), top - 170, 40, 60); ctx.strokeRect(x + 40 + k * (w - 120), top - 170, 40, 60); }
  // ventanas altas con balcón de hierro
  for (let f = 0; f < 2; f++) for (let k = 0; k < 3; k++) {
    const wx = x + 30 + k * (w - 60) / 3, wy = top + 40 + f * 170, ww = (w - 60) / 3 - 30;
    roundRect(wx, wy, ww, 110, 4); inked(r() > .7 ? '#FFD98A' : '#3A4A6A', 4);
    ctx.strokeStyle = '#1E1E24'; ctx.lineWidth = 4; ctx.strokeRect(wx - 6, wy + 80, ww + 12, 30);
    for (let b = 0; b < 5; b++) { ctx.beginPath(); ctx.moveTo(wx + b * ww / 4, wy + 80); ctx.lineTo(wx + b * ww / 4, wy + 110); ctx.stroke(); }
  }
  // planta baja: café
  ctx.fillStyle = ['#2E5A4A', '#7A2B2B', '#2E3A6A'][idx % 3]; ctx.fillRect(x, gy - 170, w, 170); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(x, gy - 170, w, 170);
  roundRect(x + 20, gy - 140, w - 40, 110, 4); inked('#FFE9B0', 4);
  for (let k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? '#C8322E' : '#F3EAD2'; ctx.fillRect(x + k * w / 8, gy - 200, w / 8, 34); }
  ctx.strokeRect(x, gy - 200, w, 34);
}
function paris(t, camX = 0, o = {}) {
  daySky(t, o);
  eiffel(o.tx ?? 760 - camX * .4, 1520, o.ts || 1.0, t, o);
  const gy = 1600;
  for (let i = -1; i < 5; i++) haussmann(i * 340 - (camX % 340) - 40, gy, 330, i + Math.floor(camX / 340), t);
  cobbles(gy, camX, o);
}
function newspaper(x, y, s, t, head) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-.04);
  roundRect(-300, -380, 600, 760, 6); inked('#F1ECDD', 7);
  ctx.fillStyle = INK; ctx.font = `900 64px Georgia, serif`; ctx.textAlign = 'center'; ctx.fillText('LE JOURNAL', 0, -300);
  ctx.fillRect(-270, -280, 540, 6); ctx.font = `700 22px ${FONT}`; ctx.fillText('PARÍS · 1925', 0, -250);
  ctx.font = `900 40px ${FONT}`; head.forEach((l, i) => ctx.fillText(l, 0, -190 + i * 48));
  ctx.save(); ctx.translate(-130, 30); ctx.scale(.26, .26); eiffel(0, 400, 1, t, { col: '#6A6A6A' }); ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 12; i++) ctx.fillRect(20, -60 + i * 26, 250 - (i % 3) * 30, 10);
  for (let i = 0; i < 6; i++) ctx.fillRect(-270, 230 + i * 24, 540 - (i % 2) * 80, 10);
  ctx.restore();
}
function briefcase(x, y, s, open, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(-130, -80, 260, 170, 14); inked('#6A3E24', 6);
  roundRect(-40, -110, 80, 34, 10); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
  if (open) for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(-80 + (i % 3) * 80, -60 - Math.floor(i / 3) * 24); ctx.rotate((i - 2) * .1); roundRect(-50, -24, 100, 48, 4); inked('#9AC48A', 4); ctx.fillStyle = '#2E5A2E'; ctx.font = `900 30px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('₣', 0, 2); ctx.restore(); }
  ctx.fillStyle = '#E7C25A'; ctx.fillRect(-12, -10, 24, 24);
  ctx.restore();
}
function franc(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  roundRect(-80, -40, 160, 80, 6); inked('#9AC48A', 5); ctx.strokeStyle = '#2E5A2E'; ctx.lineWidth = 3; ctx.strokeRect(-70, -30, 140, 60);
  ctx.fillStyle = '#2E5A2E'; ctx.font = `900 38px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('₣', 0, 2);
  ctx.restore();
}

/* 1 — vendió la Torre Eiffel */
function scene1(t) {
  paris(t, 0, { ts: 1.05, tx: 620 });
  parchment([['1925', 110, FONT]], 260, 420, 340, 190, t, .2, { write: .5, tOut: cap(0, 1) + .2 });
  const p = person(330, 1720, 1.3, Object.assign({}, LUSTIG, { arms: t > cap(0, 1) ? [2.4, -.2] : [.2, -.2], armLen: 140, eyes: t > cap(0, 3) ? 'happy' : 'open', mouth: 'grin', face: 1 }));
  if (t > cap(0, 1)) { ctx.save(); ctx.translate(p.hands[0].x + 10, p.hands[0].y - 110); roundRect(-110, -60, 220, 120, 10); inked('#FFF6DC', 6); ctx.fillStyle = '#B3261E'; ctx.font = `900 44px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SE VENDE', 0, 4); ctx.restore(); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(p.hands[0].x, p.hands[0].y); ctx.lineTo(p.hands[0].x + 10, p.hands[0].y - 50); ctx.stroke(); }
  stamp('VENDIDA', 640, 800, t, cap(0, 2) + .3, { size: 110 });
  if (t > cap(0, 3)) sfxText('¡guiño!', 520, 960, t, cap(0, 3), { size: 60, color: '#FFFFFF', dur: 1.4 });
  captions(CAPS[0], t);
}
/* 2 — Victor Lustig y el periódico */
function scene2(t) {
  paris(t, 400, { ts: .8, tx: 860 });
  dim(t, 0, .3);
  const p = person(540, 1720, 1.45, Object.assign({}, LUSTIG, { arms: t > cap(1, 2) ? [1.6, 1.6] : [.2, 1.3], armLen: 140, eyes: 'open', mouth: t > cap(1, 1) ? 'grin' : 'smile', face: 1 }));
  popIn(t, .3, k => { ctx.save(); ctx.translate(540, 500); ctx.scale(k, k); label('Victor Lustig', 0, 0, { size: 56, bg: '#FFF6DC' }); ctx.restore(); }, cap(1, 2) - .3);
  stamp('ESTAFADOR', 540, 640, t, cap(1, 1), { size: 90, tOut: cap(1, 2) - .3 });
  if (t > cap(1, 2) - .2) {
    const k = easeBack(prog(t, cap(1, 2) - .2, cap(1, 2) + .3));
    newspaper(540, 760, .95 * k, t, ['¿CUÁNTO CUESTA', 'MANTENER LA TORRE?']);
  }
  if (t > cap(1, 5) - .1) for (let i = 0; i < 12; i++) { const d = t - cap(1, 5) + .1 - i * .05; if (d > 0) franc(540 + Math.sin(i * 2.3) * 380, 300 + d * 500 + (i % 3) * 60, .9, d * 3 + i); }
  captions(CAPS[1], t);
}
/* 3 — se disfraza de funcionario; hotel de lujo */
function chandelier(x, y, t) {
  ctx.strokeStyle = '#B8902E'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y - 60); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y, 180, 50, 0, 0, Math.PI); inked('#E2B33C', 5);
  for (let i = 0; i < 7; i++) { const lx = x - 150 + i * 50; ctx.fillStyle = '#FFF3C0'; ctx.shadowColor = '#FFD84A'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(lx, y - 10, 12, 0, 7); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(200,230,255,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, y + 10); ctx.lineTo(lx, y + 50 + (i % 2) * 20); ctx.stroke(); }
}
function hotel(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5A1E2B'); g.addColorStop(1, '#3A1420');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(226,179,60,0.25)'; ctx.lineWidth = 4;
  for (let x = 60; x < W; x += 200) { roundRect(x, 260, 140, 760, 8); ctx.stroke(); }
  for (const cx of [270, 810]) chandelier(cx, 260, t);
  ctx.fillStyle = '#2A1A14'; ctx.fillRect(0, 1450, W, H - 1450);
  ctx.fillStyle = '#7A1E2B'; ctx.beginPath(); ctx.moveTo(340, 1450); ctx.lineTo(740, 1450); ctx.lineTo(980, H); ctx.lineTo(100, H); ctx.closePath(); ctx.fill();
}
function scene3(t) {
  if (t < cap(2, 3) - .2) {
    paris(t, 800, { ts: .75, tx: 260 });
    dim(t, 0, .35);
    const k = easeOut(prog(t, .5, cap(2, 1)));
    const p = person(540, 1720, 1.45, Object.assign({}, LUSTIG, { hat: k > .5 ? 'tophat' : 'fedora', arms: [1.4, -.2], armLen: 140, eyes: 'open', mouth: 'smile', face: 1 }));
    if (k > .5) { ctx.save(); ctx.translate(540 + 20, 1720 - 330); ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); inked('#E7C25A', 5); ctx.restore(); }
    if (t > cap(2, 1)) { // carta con sello oficial
      popIn(t, cap(2, 1), kk => {
        ctx.save(); ctx.translate(780, 760); ctx.scale(kk, kk); ctx.rotate(.08);
        roundRect(-170, -120, 340, 240, 8); inked('#F6F1E4', 6);
        ctx.fillStyle = INK; ctx.font = `900 30px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('MINISTERIO', 0, -60); ctx.fillText('DE CORREOS', 0, -24);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 3; i++) ctx.fillRect(-120, 10 + i * 24, 240 - i * 40, 10);
        ctx.beginPath(); ctx.arc(100, 80, 34, 0, 7); inked('#B3261E', 4);
        ctx.restore();
      });
    }
    if (t > .9 && t < 1.6) sfxText('¡puf!', 540, 980, t, .9, { size: 80, color: '#FFFFFF', dur: .7 });
  } else {
    hotel(t);
    // mesa con comerciantes
    roundRect(170, 1280, 740, 60, 10); inked('#6A3E24', 6);
    for (const x of [230, 850]) { ctx.fillStyle = '#4A2A18'; ctx.fillRect(x, 1340, 24, 200); }
    const cols = ['#5A4A3A', '#3A4A5A', '#4A5A3A', '#5A3A4A'];
    [260, 420, 660, 820].forEach((x, i) => person(x, 1500, 1.0, { coat: cols[i], hat: i === 1 ? 'tophat' : (i === 2 ? 'fedora' : 'hair'), hatColor: '#3A3A44', mustache: i % 2 === 0, arms: [.6, -.3], eyes: 'open', mouth: 'flat', face: x < 540 ? 1 : -1 }));
    person(540, 1760, 1.35, Object.assign({}, LUSTIG, { hat: 'tophat', arms: [2.2, -.2], armLen: 140, eyes: 'open', mouth: 'smile', face: 1 }));
    popIn(t, cap(2, 4), k => { ctx.save(); ctx.translate(540, 520); ctx.scale(k, k); label('comerciantes de chatarra', 0, 0, { size: 42, bg: '#FFD84A' }); ctx.restore(); });
  }
  captions(CAPS[2], t);
}
/* 4 — el plan: desmontarla en secreto */
function scene4(t) {
  hotel(t);
  dim(t, 0, .4);
  // la torre se desmonta en piezas
  const k = prog(t, cap(3, 2) - .2, cap(3, 3) + .3);
  ctx.save(); ctx.translate(540, 1150);
  ctx.save(); ctx.beginPath(); ctx.rect(-500, -1100, 1000, 1150 - k * 600); ctx.clip(); eiffel(0, 0, .75, t); ctx.restore();
  const r = rng(3);
  for (let i = 0; i < 18 * k; i++) { const a = r() * Math.PI * 2, d = 120 + r() * 300 * k; ctx.save(); ctx.translate(Math.cos(a) * d, -400 * (1 - k) - 200 + Math.sin(a) * d * .6 + k * 300); ctx.rotate(r() * 6 + t); ctx.fillStyle = '#8A5A3A'; ctx.fillRect(-40, -8, 80, 16); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-40, -8, 80, 16); ctx.restore(); }
  ctx.restore();
  if (k > 0) { ctx.save(); ctx.translate(800, 1180); label('→ CHATARRA', 0, 0, { size: 40, bg: '#C9CED8' }); ctx.restore(); }
  stamp('SECRETO DE ESTADO', 540, 560, t, cap(3, 5), { size: 66, color: '#B3261E' });
  if (t > cap(3, 5)) sfxText('shhh…', 300, 980, t, cap(3, 5) + .2, { size: 80, color: '#FFFFFF', dur: 1.3 });
  captions(CAPS[3], t);
}
/* 5 — Poisson paga… y soborna */
function scene5(t) {
  hotel(t);
  const pay = cap(4, 3), bribe = cap(4, 5);
  const lp = person(320, 1700, 1.35, Object.assign({}, LUSTIG, { hat: 'tophat', arms: t > pay ? [1.6, -.2] : [.3, -.2], armLen: 140, eyes: t > bribe ? 'happy' : 'open', mouth: 'grin', face: 1 }));
  const pp = person(760, 1700, 1.35, Object.assign({}, POISSON, { arms: t > pay - .3 ? [1.5, -.2] : [.2, -.2], armLen: 140, eyes: 'open', mouth: t > cap(4, 2) ? 'smile' : 'flat', face: -1 }));
  popIn(t, cap(4, 1), k => { ctx.save(); ctx.translate(760, 820); ctx.scale(k, k); label('André Poisson', 0, 0, { size: 46, bg: '#FFF6DC' }); ctx.restore(); }, pay - .3);
  if (t > cap(4, 2)) sfxText('¡trato!', 760, 820, t, cap(4, 2), { size: 70, color: '#9CFF9A', dur: 1.2 });
  if (t > pay - .3) {
    const k = easeInOut(prog(t, pay - .3, pay + .6));
    briefcase(lerp(pp.hands[0].x, lp.hands[0].x + 60, k), lerp(pp.hands[0].y, lp.hands[0].y, k) - Math.sin(k * Math.PI) * 120, .8, k > .8, t);
  }
  if (t > bribe - .3) {
    const k = easeInOut(prog(t, bribe - .3, bribe + .4));
    ctx.save(); ctx.translate(lerp(pp.hands[0].x, lp.hands[0].x + 40, k), lerp(pp.hands[0].y - 60, lp.hands[0].y - 120, k)); ctx.rotate(-.2);
    roundRect(-70, -45, 140, 90, 6); inked('#E9DCC0', 5); ctx.beginPath(); ctx.moveTo(-70, -45); ctx.lineTo(0, 10); ctx.lineTo(70, -45); ctx.lineWidth = 4; ctx.stroke(); franc(10, -50, .5, .2); ctx.restore();
    popIn(t, bribe, kk => { ctx.save(); ctx.translate(540, 560); ctx.scale(kk, kk); label('+ SOBORNO', 0, 0, { size: 54, bg: '#FFD84A' }); ctx.restore(); });
  }
  captions(CAPS[4], t);
}
/* 6 — Lustig huye; Poisson, avergonzado */
function train(x, y, t) {
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < 6; i++) { const k = (t * .8 + i / 6) % 1; ctx.fillStyle = `rgba(230,230,240,${.6 * (1 - k)})`; ctx.beginPath(); ctx.arc(140 + k * 260, -260 - k * 200, 40 + k * 70, 0, 7); ctx.fill(); }
  roundRect(-260, -200, 340, 200, 16); inked('#2E4A6A', 6);
  roundRect(80, -140, 180, 140, 10); inked('#1E2D4A', 6);
  roundRect(110, -240, 50, 100, 6); inked('#1E1E24', 5);
  roundRect(-230, -170, 110, 80, 8); inked('#FFE9B0', 4);
  ctx.save(); ctx.beginPath(); ctx.rect(-230, -170, 110, 80); ctx.clip();
  person(-175, -40, .45, Object.assign({}, LUSTIG, { arms: [2.6, -.2], eyes: 'happy', mouth: 'grin' })); ctx.restore();
  for (const wx of [-200, -40, 180]) { ctx.save(); ctx.translate(wx, 0); ctx.rotate(t * 8); ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); inked('#3A3A44', 6); ctx.strokeStyle = '#C9CED8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.moveTo(0, -40); ctx.lineTo(0, 40); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function scene6(t) {
  const split = cap(5, 1) - .2;
  if (t < split) {
    daySky(t, {});
    hills(1300, '#7FA35A', '#5E8A44');
    ctx.fillStyle = '#6E6052'; ctx.fillRect(0, 1450, W, H - 1450);
    ctx.fillStyle = '#4A3A2A'; for (let x = -((t * 900) % 120); x < W; x += 120) ctx.fillRect(x, 1470, 60, 24);
    ctx.fillStyle = '#9A9AA8'; ctx.fillRect(0, 1450, W, 12);
    train(lerp(300, 820, prog(t, 0, split)), 1440, t);
    popIn(t, .3, k => { ctx.save(); ctx.translate(540, 520); ctx.scale(k, k); label('→ Austria', 0, 0, { size: 50, bg: '#FFD84A' }); ctx.restore(); });
  } else {
    hotel(t); dim(t, split, .3);
    person(540, 1740, 1.5, Object.assign({}, POISSON, { arms: [2.75, 2.65], armLen: 112, eyes: 'closed', mouth: 'frown', blush: true, face: 1, tilt: .15 }));
    sfxText('¡qué vergüenza!', 540, 820, t, cap(5, 2), { size: 70, color: '#FF7FB5', dur: 1.6 });
    noSign(800, 520, 110, t, cap(5, 3), () => { ctx.fillStyle = '#fff'; ctx.font = `900 46px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('POLICÍA', 0, 2); });
  }
  captions(CAPS[5], t);
}
/* 7 — vuelve y la vende otra vez */
function scene7(t) {
  paris(t, 0, { ts: 1.05, tx: 620 });
  const k = easeOut(prog(t, 0, cap(6, 1)));
  const p = person(lerp(-150, 330, k), 1720, 1.3, Object.assign({}, LUSTIG, { walk: k < 1 ? t * 8 : undefined, bob: k < 1, arms: t > cap(6, 2) ? [2.4, -.2] : [.2, -.2], armLen: 140, eyes: 'happy', mouth: 'grin', face: 1 }));
  if (t > cap(6, 2)) { ctx.save(); ctx.translate(p.hands[0].x + 10, p.hands[0].y - 110); roundRect(-110, -60, 220, 120, 10); inked('#FFF6DC', 6); ctx.fillStyle = '#B3261E'; ctx.font = `900 44px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SE VENDE', 0, 4); ctx.restore(); }
  stamp('VENDIDA ×2', 640, 780, t, cap(6, 3), { size: 100 });
  captions(CAPS[6], t);
}
/* 8 — lo denuncian y escapa */
function scene8(t) {
  paris(t, t * 260, { ts: .9, tx: 820 });
  const run = t * 12;
  person(620, 1720, 1.2, Object.assign({}, LUSTIG, { walk: run, bob: true, arms: [Math.sin(run) * .9, -Math.sin(run) * .9], armLen: 130, eyes: 'wide', mouth: 'o', face: 1, tilt: .12 }));
  for (let i = 0; i < 2; i++) person(180 - i * 170, 1720, 1.2, { coat: '#1E2D5A', hat: 'police', walk: run + i, bob: true, arms: [i ? 2.4 : Math.sin(run) * .9, -Math.sin(run) * .9], armLen: 130, eyes: 'open', mouth: 'o', brows: 'angry', face: 1, tilt: .1 });
  sfxText('¡PRIIIIT!', 260, 980, t, .3, { size: 70, color: '#FFFFFF', dur: 1.4 });
  questionBox('¿Tú te habrías', 'dejado engañar?', t, cap(7, 2));
  captions(CAPS[7], t);
}
startVideo([scene1, scene2, scene3, scene4, scene5, scene6, scene7, scene8]);
