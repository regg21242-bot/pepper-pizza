/* Personajes 2D semirrealistas (canvas) compartidos por todas las escenas: "el flaco" y "tú".
   window.P2 = { flaco, tu, chipBag, chip, couch, ... }.  Todo determinista. */
(function () {
  let ctx = null;
  const setCtx = c => { ctx = c; };
  const lerp = (a, b, k) => a + (b - a) * k;
  function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; if (k > 0) { r += (255 - r) * k; g += (255 - g) * k; b += (255 - b) * k; } else { r *= 1 + k; g *= 1 + k; b *= 1 + k; } return `rgb(${r | 0},${g | 0},${b | 0})`; }
  function soft(fn, blur, alpha = 1) { ctx.save(); ctx.filter = `blur(${blur}px)`; ctx.globalAlpha *= alpha; fn(); ctx.restore(); }
  const INK = 'rgba(60,32,20,0.55)';

  /* extremidad: cápsula que se adelgaza, con sombreado a lo ancho */
  function limb(x1, y1, x2, y2, w1, w2, col, o = {}) {
    const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1 + nx * w1, y1 + ny * w1); ctx.lineTo(x2 + nx * w2, y2 + ny * w2);
    ctx.arc(x2, y2, w2, a + Math.PI / 2, a - Math.PI / 2, true);
    ctx.lineTo(x1 - nx * w1, y1 - ny * w1);
    ctx.arc(x1, y1, w1, a - Math.PI / 2, a + Math.PI / 2, true);
    ctx.closePath();
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, w = Math.max(w1, w2);
    const g = ctx.createLinearGradient(mx - nx * w, my - ny * w, mx + nx * w, my + ny * w);
    g.addColorStop(0, shade(col, -.22)); g.addColorStop(.45, shade(col, .1)); g.addColorStop(1, shade(col, -.3));
    ctx.fillStyle = g; ctx.fill();
    if (o.line !== false) { ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.restore();
  }
  function hand(x, y, r, skin, ang = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    const g = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r * 1.2); g.addColorStop(0, shade(skin, .15)); g.addColorStop(1, shade(skin, -.2));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 1.1, 0, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-r * .85, -r * .15, r * .38, r * .55, -.6, 0, 7); ctx.fillStyle = shade(skin, -.05); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(120,60,40,0.35)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(r * .1, -r * .5 + i * r * .45); ctx.lineTo(r * .8, -r * .5 + i * r * .45); ctx.stroke(); }
    ctx.restore();
  }
  /* cara: ojos, cejas, nariz y boca según la expresión */
  function face(o, R) {
    const e = o.expr || 'smile', look = o.look || [0, 0];
    // ojos
    for (const s of [-1, 1]) {
      const ex = s * R * .36, ey = -R * .06;
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(ex, ey, R * .17, R * (e === 'happy' ? .06 : e === 'shock' ? .19 : .14), 0, 0, 7); ctx.fill();
      if (e !== 'happy') {
        ctx.fillStyle = '#5A3A22'; ctx.beginPath(); ctx.arc(ex + look[0] * R * .06, ey + look[1] * R * .05, R * .095, 0, 7); ctx.fill();
        ctx.fillStyle = '#1A100A'; ctx.beginPath(); ctx.arc(ex + look[0] * R * .06, ey + look[1] * R * .05, R * .05, 0, 7); ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ex + look[0] * R * .06 - R * .03, ey + look[1] * R * .05 - R * .035, R * .025, 0, 7); ctx.fill();
      } else { ctx.strokeStyle = '#3A2214'; ctx.lineWidth = R * .045; ctx.beginPath(); ctx.arc(ex, ey + R * .04, R * .12, Math.PI + .3, -.3); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(80,40,20,0.6)'; ctx.lineWidth = R * .025; ctx.beginPath(); ctx.ellipse(ex, ey, R * .17, R * (e === 'shock' ? .19 : .14), 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      // ceja: en preocupación sube la punta de adentro
      const worry = e === 'worried' || e === 'sad' ? 1 : e === 'shock' ? .5 : 0;
      const by = ey - R * .27, inX = ex - s * R * .17, outX = ex + s * R * .17;
      ctx.strokeStyle = o.hair || '#2A1A10'; ctx.lineWidth = R * .07; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(outX, by + worry * R * .05); ctx.quadraticCurveTo(ex, by - R * .07 - worry * R * .02, inX, by - worry * R * .1); ctx.stroke();
    }
    // nariz
    ctx.strokeStyle = 'rgba(120,60,40,0.6)'; ctx.lineWidth = R * .035; ctx.beginPath(); ctx.moveTo(R * .02, R * .05); ctx.quadraticCurveTo(R * .1, R * .22, -R * .04, R * .25); ctx.stroke();
    soft(() => { ctx.fillStyle = 'rgba(150,70,50,0.35)'; ctx.beginPath(); ctx.ellipse(0, R * .24, R * .1, R * .05, 0, 0, 7); ctx.fill(); }, 3);
    // mejillas
    soft(() => { ctx.fillStyle = 'rgba(230,110,90,0.35)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * R * .5, R * .22, R * .14, R * .08, 0, 0, 7); ctx.fill(); } }, 6);
    // boca
    ctx.lineCap = 'round'; ctx.strokeStyle = '#7A2E22'; ctx.lineWidth = R * .045; ctx.fillStyle = '#7A2E22';
    const my = R * .45;
    if (e === 'smile' || e === 'happy') { ctx.beginPath(); ctx.arc(0, my - R * .12, R * .22, .35, Math.PI - .35); ctx.stroke(); }
    else if (e === 'grin') { ctx.beginPath(); ctx.moveTo(-R * .24, my - R * .04); ctx.quadraticCurveTo(0, my + R * .2, R * .24, my - R * .04); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFF'; ctx.fillRect(-R * .17, my - R * .03, R * .34, R * .05); }
    else if (e === 'worried' || e === 'sad') { ctx.beginPath(); ctx.moveTo(-R * .17, my + R * .02); ctx.bezierCurveTo(-R * .06, my - R * .06, R * .06, my + R * .06, R * .17, my - R * .01); ctx.stroke(); }
    else if (e === 'shock') { ctx.beginPath(); ctx.ellipse(0, my, R * .09, R * .12, 0, 0, 7); ctx.fill(); }
    else if (e === 'chew') { const k = .5 + .5 * Math.sin((o.t || 0) * 18); ctx.beginPath(); ctx.ellipse(0, my, R * .13, R * (.03 + .05 * k), 0, 0, 7); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(-R * .15, my); ctx.lineTo(R * .15, my); ctx.stroke(); }
  }
  function headDraw(x, y, R, o) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt || 0);
    // pelo de atrás
    ctx.fillStyle = o.hair; ctx.beginPath(); ctx.ellipse(0, -R * .18, R * 1.04, R * 1.02, 0, 0, 7); ctx.fill();
    // orejas
    for (const s of [-1, 1]) { ctx.fillStyle = shade(o.skin, -.08); ctx.beginPath(); ctx.ellipse(s * R * .95, R * .05, R * .17, R * .25, 0, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
    // cara
    const g = ctx.createRadialGradient(-R * .3, -R * .35, R * .1, 0, 0, R * 1.25); g.addColorStop(0, shade(o.skin, .14)); g.addColorStop(.7, o.skin); g.addColorStop(1, shade(o.skin, -.22));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, R * .92 * (o.faceW || 1), R * 1.05, 0, 0, 7); ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
    face(o, R);
    // pelo de enfrente
    ctx.fillStyle = o.hair;
    if (o.hairStyle === 'rizos') {
      for (let i = 0; i < 11; i++) { const a = Math.PI * (1.05 + i * .09), rr = R * (.95 + (i % 2) * .08); ctx.beginPath(); ctx.arc(Math.cos(a) * rr * .95, Math.sin(a) * rr * .92 - R * .12, R * .27, 0, 7); ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(0, -R * .78, R * .75, R * .3, 0, 0, 7); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(-R * .98, -R * .05); ctx.quadraticCurveTo(-R * 1.0, -R * 1.08, 0, -R * 1.1); ctx.quadraticCurveTo(R * 1.02, -R * 1.06, R * .97, -R * .1);
      ctx.quadraticCurveTo(R * .7, -R * .55, R * .15, -R * .58); ctx.quadraticCurveTo(-R * .25, -R * .45, -R * .55, -R * .62); ctx.quadraticCurveTo(-R * .85, -R * .5, -R * .98, -R * .05); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.ellipse(-R * .3, -R * .85, R * .3, R * .08, -.3, 0, 7); ctx.fill();
    ctx.restore();
  }
  /* persona: pose 'sit' o 'stand'. o.armL / o.armR: [ánguloHombro, ánguloCodo] en radianes (0 = colgando) */
  function person(x, y, s, o) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const W = o.build, torsoH = o.torsoH, sh = W * .5, hip = W * .42, skin = o.skin, sit = o.pose !== 'stand';
    const bob = o.bob || 0; ctx.translate(0, -bob);
    // piernas
    const legW = W * .12, legLen = o.legLen;
    for (const sd of [-1, 1]) {
      const hx = sd * hip * .52, kick = sd < 0 ? (o.legBounce || 0) : 0;
      if (sit) {
        const kx = hx * 1.35, ky = 52 - kick * 14, fx = kx + sd * 6, fy = ky + legLen * .62;
        limb(hx, 0, kx, ky, legW * 1.35, legW * 1.25, o.pants);
        ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.ellipse(kx, ky - 4, legW * 1.1, legW * .7, 0, 0, 7); ctx.fill();
        limb(kx, ky + 8, fx, fy, legW * 1.05, legW * .85, o.pants);
        shoe(fx, fy, legW, sd);
      } else {
        const sw = o.walk !== undefined ? Math.sin(o.walk + (sd > 0 ? 0 : Math.PI)) : 0;
        const kx = hx + sw * 22, ky = legLen * .5, fx = hx + sw * 40, fy = legLen - Math.max(0, -sw) * 10 - kick * 20;
        limb(hx, 0, kx, ky, legW * 1.15, legW, o.pants);
        limb(kx, ky, fx, fy, legW, legW * .8, o.pants);
        shoe(fx, fy, legW, sd);
      }
    }
    // brazo de atrás (izquierdo de la persona = derecha de la pantalla) se dibuja después del torso si está al frente
    const drawArm = (side) => {
      const [a1, a2] = side < 0 ? (o.armL || [.15, .25]) : (o.armR || [-.15, -.25]);
      const shx = side * (sh - W * .04), shy = -torsoH + 30, L1 = torsoH * .52, L2 = torsoH * .48;
      const ex = shx + Math.sin(-a1 * -side) * L1 * side * 0 + Math.sin(a1) * L1, ey = shy + Math.cos(a1) * L1;
      const hx = ex + Math.sin(a1 + a2) * L2, hy = ey + Math.cos(a1 + a2) * L2;
      limb(shx, shy, ex, ey, W * .13, W * .11, o.shirt);
      limb(ex - Math.sin(a1) * 4, ey - Math.cos(a1) * 4, hx, hy, W * .09, W * .075, skin);
      ctx.beginPath(); ctx.arc(shx, shy + 6, W * .135, 0, 7); const sg = ctx.createRadialGradient(shx - 8, shy - 4, 4, shx, shy, W * .14); sg.addColorStop(0, shade(o.shirt, .15)); sg.addColorStop(1, shade(o.shirt, -.2)); ctx.fillStyle = sg; ctx.fill();
      hand(hx, hy, W * .095, skin, a1 + a2);
      return [hx, hy];
    };
    // torso (playera) con panza
    const belly = o.belly || 0;
    ctx.beginPath();
    ctx.moveTo(-sh, -torsoH + 10); ctx.quadraticCurveTo(-sh - 4, -torsoH * .5, -hip - belly * 20, -10);
    ctx.quadraticCurveTo(-hip * .5, 18 + belly * 26, 0, 18 + belly * 30); ctx.quadraticCurveTo(hip * .5, 18 + belly * 26, hip + belly * 20, -10);
    ctx.quadraticCurveTo(sh + 4, -torsoH * .5, sh, -torsoH + 10); ctx.quadraticCurveTo(0, -torsoH - 18, -sh, -torsoH + 10); ctx.closePath();
    const tg = ctx.createLinearGradient(-sh, 0, sh, 0); tg.addColorStop(0, shade(o.shirt, -.25)); tg.addColorStop(.4, shade(o.shirt, .1)); tg.addColorStop(1, shade(o.shirt, -.3));
    ctx.fillStyle = tg; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
    // pliegues y cuello
    ctx.strokeStyle = 'rgba(0,0,0,0.14)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-sh * .55, -torsoH * .35); ctx.quadraticCurveTo(-sh * .2, -torsoH * .3, -sh * .1, -torsoH * .42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sh * .3, -torsoH * .2); ctx.quadraticCurveTo(sh * .5, -torsoH * .15, sh * .6, -torsoH * .3); ctx.stroke();
    if (belly) { ctx.beginPath(); ctx.moveTo(-hip * .7, -torsoH * .12); ctx.quadraticCurveTo(0, 2 + belly * 10, hip * .7, -torsoH * .12); ctx.stroke(); }
    limb(0, -torsoH - 8, 0, -torsoH - 40, W * .085, W * .08, skin, { line: false });
    ctx.fillStyle = shade(o.shirt, -.3); ctx.beginPath(); ctx.ellipse(0, -torsoH + 2, W * .16, W * .06, 0, 0, Math.PI); ctx.fill();
    // brazos
    const hL = drawArm(-1), hR = drawArm(1);
    // cabeza
    headDraw(0, -torsoH - 40 - o.headR * .9, o.headR, Object.assign({}, o, { t: o.t }));
    ctx.restore();
    return { handL: [x + hL[0] * s, y + (hL[1] - bob) * s], handR: [x + hR[0] * s, y + (hR[1] - bob) * s], head: [x, y + (-torsoH - 40 - o.headR * .9 - bob) * s], s };
  }
  function shoe(x, y, w, sd) {
    ctx.fillStyle = '#2E2E36'; ctx.beginPath(); ctx.ellipse(x + sd * 6, y + w * .5, w * 1.3, w * .7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#F2F2F2'; ctx.fillRect(x + sd * 6 - w * 1.25, y + w * .85, w * 2.5, w * .3);
  }
  /* los dos personajes (mismos en todas las escenas) */
  const FLACO = { build: 190, torsoH: 330, legLen: 360, headR: 78, skin: '#E2AE86', shirt: '#4FA36A', pants: '#3A4A6A', hair: '#2A1A12', hairStyle: 'rizos', faceW: .92 };
  const TU = { build: 250, torsoH: 285, legLen: 300, headR: 88, skin: '#D69A70', shirt: '#F08A3A', pants: '#46506A', hair: '#3A2416', hairStyle: 'corto', belly: .8, faceW: 1.04 };
  const flaco = (x, y, s, o = {}) => person(x, y, s, Object.assign({}, FLACO, o));
  const tu = (x, y, s, o = {}) => person(x, y, s, Object.assign({}, TU, o));

  /* bolsa genérica de papitas (sin marca) */
  function chipBag(x, y, s, rot = 0, open = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-90, -120); for (let i = 0; i <= 12; i++) ctx.lineTo(-90 + i * 15, -120 + (i % 2 ? -8 : 0));
    ctx.quadraticCurveTo(108, 0, 96, 120); ctx.lineTo(-96, 120); ctx.quadraticCurveTo(-108, 0, -90, -120); ctx.closePath();
    const g = ctx.createLinearGradient(-100, 0, 100, 0); g.addColorStop(0, '#C83A2A'); g.addColorStop(.35, '#F25A3A'); g.addColorStop(.6, '#FFC24A'); g.addColorStop(1, '#C8402A');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-50, -30, 14, 70, .1, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.ellipse(0, 20, 62, 44, 0, 0, 7); ctx.fill();
    chip(0, 18, .9, .2);
    ctx.fillStyle = '#B8261C'; ctx.font = '900 30px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('PAPITAS', 0, -50);
    if (open) { ctx.fillStyle = '#2A1408'; ctx.beginPath(); ctx.ellipse(0, -118, 80 * open, 10 * open, 0, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function chip(x, y, s, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-34, -4); ctx.bezierCurveTo(-30, -26, 20, -30, 34, -10); ctx.bezierCurveTo(40, 12, 10, 28, -14, 24); ctx.bezierCurveTo(-34, 20, -38, 8, -34, -4); ctx.closePath();
    const g = ctx.createRadialGradient(-8, -8, 4, 0, 0, 40); g.addColorStop(0, '#FFE58A'); g.addColorStop(1, '#E8A83A');
    ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(140,80,20,0.7)'; ctx.stroke();
    ctx.fillStyle = 'rgba(190,110,40,0.45)'; for (const [a, b] of [[-12, -6], [10, -10], [4, 10], [-18, 10]]) { ctx.beginPath(); ctx.arc(a, b, 2.5, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  /* sillón */
  function couch(x, y, w, col = '#3E7F86') {
    ctx.save(); ctx.translate(x, y);
    soft(() => { ctx.fillStyle = 'rgba(40,20,10,0.4)'; ctx.beginPath(); ctx.ellipse(0, 230, w * .55, 40, 0, 0, 7); ctx.fill(); }, 20);
    const back = (yy, h, c) => { ctx.beginPath(); ctx.roundRect(-w / 2, yy, w, h, 50); const g = ctx.createLinearGradient(0, yy, 0, yy + h); g.addColorStop(0, shade(c, .15)); g.addColorStop(1, shade(c, -.2)); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); };
    back(-330, 300, col);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.roundRect(s * w / 2 - 70, -150, 140, 360, 50); const g = ctx.createLinearGradient(s * w / 2 - 70, 0, s * w / 2 + 70, 0); g.addColorStop(0, shade(col, -.15)); g.addColorStop(.5, shade(col, .12)); g.addColorStop(1, shade(col, -.25)); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.beginPath(); ctx.roundRect(-w / 2 + 60, -40, w - 120, 110, 30); ctx.fillStyle = shade(col, .05); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(0, 66); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-w / 2 + 50, 70, w - 100, 140, 20); ctx.fillStyle = shade(col, -.15); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore();
  }
  /* mesita de centro (tapa las espinillas: se leen sentados) */
  function coffeeTable(x, y, w, items) {
    ctx.save(); ctx.translate(x, y);
    soft(() => { ctx.fillStyle = 'rgba(40,20,10,0.4)'; ctx.beginPath(); ctx.ellipse(0, 150, w * .55, 26, 0, 0, 7); ctx.fill(); }, 14);
    // faldón al frente (tapa espinillas y pies)
    ctx.beginPath(); ctx.roundRect(-w / 2 + 16, 10, w - 32, 150, 10); const fg = ctx.createLinearGradient(0, 10, 0, 160); fg.addColorStop(0, '#8A5A34'); fg.addColorStop(1, '#5A3A20'); ctx.fillStyle = fg; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,220,180,0.25)'; ctx.lineWidth = 3; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.roundRect(sx * w * .22 - w * .18, 34, w * .36, 100, 8); ctx.stroke(); }
    ctx.beginPath(); ctx.roundRect(-w / 2, -16, w, 44, 14); const g = ctx.createLinearGradient(0, -16, 0, 28); g.addColorStop(0, '#B8834E'); g.addColorStop(1, '#7A5030'); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = 'rgba(255,240,210,0.35)'; ctx.fillRect(-w / 2 + 20, -12, w - 40, 6);
    if (items) items();
    ctx.restore();
  }
  /* barra de energía tipo videojuego */
  function energyBar(x, y, w, k, label = 'ENERGÍA') {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(20,20,30,0.85)'; ctx.beginPath(); ctx.roundRect(-8, -8, w + 16, 66, 14); ctx.fill();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.stroke();
    const n = 10, sw = (w - 18) / n;
    for (let i = 0; i < n; i++) { const on = i / n < k; ctx.fillStyle = on ? (k > .5 ? '#5BE36A' : k > .25 ? '#F2C230' : '#F2563A') : 'rgba(255,255,255,0.12)'; ctx.fillRect(4 + i * sw, 4, sw - 4, 42); }
    ctx.fillStyle = '#FFF'; ctx.font = '900 30px Nunito, sans-serif'; ctx.textAlign = 'left'; ctx.fillText('⚡ ' + label, 0, -22);
    ctx.restore();
  }
  window.P2 = { setCtx, shade, soft, limb, hand, person, flaco, tu, chipBag, chip, couch, energyBar, coffeeTable, FLACO, TU };
})();
