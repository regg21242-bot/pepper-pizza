/* "En este pueblo" — personajes de bloques v2 (reutilizables en todo el video).
   Unidades: la cabeza mide 1.0 de ancho. El grupo se escala con ESC (altura final ≈ 1.8 m en la escena).
   Uso: const P = window.PUEBLO_P; const g = P.crear('prota'); g.cara('feliz'); g.pose(t, 'botar'|'caminar'|'bailar'|'quieto'|...) */
(function () {
  const THREE = window.THREE; if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
  const ESC = .42;
  const C = { piel: '#F2C6A0', kevin: '#C68E64', azul: '#2142C9', amarillo: '#F2C230', rosa: '#F28DB2', celeste: '#9CC8FF', rojo: '#E8212B', negro: '#111111' };
  const sm = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .6, metalness: 0 }, o));
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; };
  const M = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };

  // ---------- caja redondeada (bisel real en todas las aristas) con "inflado" opcional y UV frontal plana ----------
  function rbox(w, h, d, r, inflado = 0, seg = 6) {
    r = Math.min(r, w / 2, h / 2, d / 2) * .999;
    const g = new THREE.BoxGeometry(w, h, d, seg * 2, seg * 2, seg * 2), p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
    const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      const frente = p.getZ(i) > d / 2 - 1e-6; v.set(p.getX(i), p.getY(i), p.getZ(i)); c.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z)));
      const dir = v.clone().sub(c); if (dir.lengthSq() < 1e-12) dir.set(0, 0, 1); dir.normalize(); v.copy(c).addScaledVector(dir, r);
      if (inflado) { const ex = 1 - Math.pow(Math.abs(v.y) / (h / 2), 2), ey = 1 - Math.pow(Math.abs(v.x) / (w / 2), 2), ez = 1 - Math.pow(Math.abs(v.z) / (d / 2), 2); v.x += Math.sign(v.x) * inflado * Math.max(0, ex * ez); v.z += Math.sign(v.z) * inflado * Math.max(0, ex * ey); }
      p.setXYZ(i, v.x, v.y, v.z);
      // UV frontal plana; las caras de atrás van a una esquina "lisa" de la textura (0.02, 0.02)
      { const cu = q => Math.min(.995, Math.max(.005, q)), pu = cu((v.x + w / 2) / w), pv = cu((v.y + h / 2) / h); if (frente || v.z > 0) uv.setXY(i, pu, pv); else uv.setXY(i, pu, .005); }   // atrás: fila de abajo del lienzo (color base), sin rayas // sin costuras: los lados toman la orilla del frente
    }
    g.computeVertexNormals(); return g;
  }

  // ---------- caras (canvas 512 x 486 = 1.0 x 0.95 de la cabeza) ----------
  const FW = 512, FH = 486;
  function dibujaCara(x, expr, o = {}) {
    const W = FW, H = FH, piel = o.piel || C.piel; x.fillStyle = piel; x.fillRect(0, 0, W, H);
    x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = C.negro; x.fillStyle = C.negro;
    const ey = H * .45, ex = [W * .35, W * .65], ow = W * .14 / 2, oh = H * .22 / 2;
    const ojo = (cx) => { x.fillStyle = C.negro; x.beginPath(); x.ellipse(cx, ey, ow, oh, 0, 0, 7); x.fill(); x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(cx - ow * .35, ey - oh * .45, ow * .34, 0, 7); x.fill(); };
    const feliz = (cx) => { x.lineWidth = W * .04; x.beginPath(); x.moveTo(cx - W * .09, ey + H * .04); x.lineTo(cx, ey - H * .06); x.lineTo(cx + W * .09, ey + H * .04); x.stroke(); };
    const ceja = (cx, a = 0, dy = 0) => { x.lineWidth = W * .018; x.beginPath(); x.moveTo(cx - W * .07, ey - H * .2 + a + dy); x.lineTo(cx + W * .07, ey - H * .2 - a + dy); x.stroke(); };
    const sonrisa = (lado = 0) => { x.lineWidth = W * .03; x.beginPath(); const y = H * .68; x.moveTo(W * .35, y - lado * H * .02); x.quadraticCurveTo(W * .5, y + H * .1, W * .65, y - H * .02 - lado * H * .07); x.stroke(); };
    const bocaD = (esc = 1) => { const bw = W * .38 * esc, bh = H * .22 * esc, y0 = H * .62; x.lineWidth = W * .04;
      x.beginPath(); x.moveTo(W / 2 - bw / 2, y0); x.lineTo(W / 2 + bw / 2, y0); x.quadraticCurveTo(W / 2 + bw / 2, y0 + bh * 1.25, W / 2, y0 + bh); x.quadraticCurveTo(W / 2 - bw / 2, y0 + bh * 1.25, W / 2 - bw / 2, y0); x.closePath();
      x.fillStyle = C.rojo; x.fill(); x.save(); x.clip(); x.fillStyle = '#F7A0B0'; x.beginPath(); x.ellipse(W / 2, y0 + bh * .95, bw * .26, bh * .34, 0, 0, 7); x.fill(); x.restore(); x.strokeStyle = C.negro; x.stroke(); };
    switch (expr) {
      case 'feliz': feliz(ex[0]); feliz(ex[1]); bocaD(o.bocaGrande ? 1.25 : 1); break;
      case 'guino': ojo(ex[0]); feliz(ex[1]); sonrisa(1); break;
      case 'sorpresa': case 'sorpresa_lagrima': for (const cx of ex) { x.lineWidth = W * .022; x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(cx, ey, W * .085, 0, 7); x.fill(); x.stroke(); x.fillStyle = C.negro; x.beginPath(); x.arc(cx, ey, W * .03, 0, 7); x.fill(); }
        ceja(ex[0], -4, -H * .04); ceja(ex[1], 4, -H * .04); x.lineWidth = W * .025; x.fillStyle = C.rojo; x.beginPath(); x.ellipse(W / 2, H * .74, W * .045, H * .06, 0, 0, 7); x.fill(); x.stroke(); break;
      case 'preocupado': ojo(ex[0]); ojo(ex[1]); ceja(ex[0], 10); ceja(ex[1], -10); x.lineWidth = W * .03; x.beginPath(); for (let i = 0; i <= 8; i++) x.lineTo(W * .36 + i * W * .035, H * .72 + (i % 2 ? -H * .025 : H * .025)); x.stroke(); break;
      case 'triste': ojo(ex[0]); ojo(ex[1]); ceja(ex[0], 10); ceja(ex[1], -10); x.lineWidth = W * .03; x.beginPath(); x.moveTo(W * .4, H * .74); x.quadraticCurveTo(W * .5, H * .69, W * .6, H * .74); x.stroke();
        x.fillStyle = '#4AA8FF'; const tx = ex[1] + W * .03, ty = ey + oh * 1.1; x.beginPath(); x.moveTo(tx, ty); x.quadraticCurveTo(tx + W * .04, ty + H * .09, tx, ty + H * .11); x.quadraticCurveTo(tx - W * .04, ty + H * .09, tx, ty); x.fill(); break;
      case 'recta': ojo(ex[0]); ojo(ex[1]); x.lineWidth = W * .03; x.beginPath(); x.moveTo(W * .4, H * .7); x.lineTo(W * .6, H * .7); x.stroke(); break;
      case 'seria': ojo(ex[0]); ojo(ex[1]); ceja(ex[0], -3); ceja(ex[1], 3); x.lineWidth = W * .03; x.beginPath(); x.moveTo(W * .41, H * .71); x.lineTo(W * .59, H * .7); x.stroke(); break;
      case 'sonrisa': ojo(ex[0]); ojo(ex[1]); sonrisa(0); break;
      default: ojo(ex[0]); ojo(ex[1]); sonrisa(1);   // 'lado'
    }
    if (expr === 'sorpresa_lagrima') { x.fillStyle = '#4AA8FF'; const tx = ex[1] + W * .07, ty = ey + W * .09; x.beginPath(); x.moveTo(tx, ty); x.quadraticCurveTo(tx + W * .04, ty + H * .09, tx, ty + H * .11); x.quadraticCurveTo(tx - W * .04, ty + H * .09, tx, ty); x.fill(); }
    if (o.lentes) { const lw = W * .35, lh = H * .3; x.strokeStyle = C.negro; x.lineWidth = W * .032; for (const cx of ex) { x.beginPath(); x.roundRect(cx - lw / 2, ey - lh / 2, lw, lh, W * .02); x.stroke(); } x.beginPath(); x.moveTo(ex[0] + lw / 2, ey - lh * .15); x.lineTo(ex[1] - lw / 2, ey - lh * .15); x.stroke(); }
  }

  // ---------- telas ----------
  const estrellita = (x, cx, cy, r, col) => { x.fillStyle = col; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); };
  const estrellas = (x, w, h, seed = 1, n = 30, r0 = 7) => { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const cols = ['#FFFFFF', C.rosa, C.amarillo, C.celeste]; for (let i = 0; i < n; i++) estrellita(x, 8 + r() * (w - 16), 8 + r() * (h - 16), r0 + r() * r0 * .7, cols[i % 4]); };
  // textura con zona lisa en la esquina (0..8 px) para la espalda
  const tela = (col, fn, w = 512, h = 512) => tex(w, h, (x) => { x.fillStyle = col; x.fillRect(0, 0, w, h); if (fn) fn(x, w, h); x.fillStyle = col; x.fillRect(0, h - 10, 10, 10); });
  const telaEstrellas = (texto, seed) => tela(C.azul, (x, w, h) => { estrellas(x, w, h, seed, texto === 'pierna' ? 16 : 40, texto === 'pierna' ? 12 : 10);
    if (texto === 'sudadera') { x.textAlign = 'center'; x.fillStyle = C.amarillo; x.strokeStyle = '#1A2A80'; x.lineWidth = 6; x.font = 'bold 56px "DejaVu Serif", Georgia, serif'; x.strokeText('¡en este pueblo!', w / 2, h * .5); x.fillText('¡en este pueblo!', w / 2, h * .5); x.font = 'italic bold 26px "DejaVu Serif", Georgia, serif'; x.strokeText('más allá de las reglas', w / 2, h * .58); x.fillText('más allá de las reglas', w / 2, h * .58); }
    if (texto === 'pierna') { x.save(); x.translate(w / 2, h / 2); x.rotate(Math.PI / 2); x.textAlign = 'center'; x.fillStyle = C.amarillo; x.font = 'bold 84px "DejaVu Serif", Georgia, serif'; x.fillText('en este pueblo', 0, 30); x.restore(); } });

  function tronquito(x, cx, cy, s) { x.save(); x.translate(cx, cy);
    x.fillStyle = '#9A6640'; x.beginPath(); x.roundRect(-s * .42, -s * .5, s * .84, s * 1.05, s * .16); x.fill();
    x.strokeStyle = 'rgba(60,30,10,.45)'; x.lineWidth = s * .035; for (const k of [-.24, .02, .26]) { x.beginPath(); x.moveTo(s * k, -s * .2); x.lineTo(s * k + s * .02, s * .45); x.stroke(); }
    x.fillStyle = '#E9C890'; x.beginPath(); x.ellipse(0, -s * .5, s * .42, s * .13, 0, 0, 7); x.fill(); x.strokeStyle = '#B98A55'; x.lineWidth = s * .03; x.beginPath(); x.ellipse(0, -s * .5, s * .22, s * .065, 0, 0, 7); x.stroke();
    x.fillStyle = '#141414'; for (const e of [-.15, .15]) { x.beginPath(); x.arc(s * e, -s * .12, s * .06, 0, 7); x.fill(); }
    x.strokeStyle = '#141414'; x.lineWidth = s * .045; x.lineCap = 'round'; x.beginPath(); x.arc(0, s * .02, s * .13, .3, Math.PI - .3); x.stroke();
    x.strokeStyle = '#7A4A2A'; x.lineWidth = s * .07; x.beginPath(); x.moveTo(s * .4, s * .15); x.lineTo(s * .7, -s * .25); x.stroke();
    x.fillStyle = '#5DB36A'; x.beginPath(); x.ellipse(s * .74, -s * .33, s * .12, s * .06, -.7, 0, 7); x.fill(); x.restore(); }

  // ---------- piezas de pelo y gorros ----------
  const bola = (r, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = M(new THREE.SphereGeometry(r, 18, 14), m, x, y, z); o.scale.set(sx, sy, sz); return o; };
  const mechon = (w, h, d, m, x, y, z, rx = 0, rz = 0) => { const o = M(rbox(w, h, d, Math.min(w, h, d) * .45), m, x, y, z); o.rotation.set(rx, 0, rz); return o; };
  function pelo(estilo, col) { const g = new THREE.Group(), m = sm(col, { roughness: .7 });
    if (estilo === 'chongo') { // Linda / abuela: casco esculpido + mechones laterales + chongo alto
      g.add(M(rbox(1.12, .42, 1.08, .2, .03), m, 0, .42, -.02));
      for (const s of [-1, 1]) { g.add(mechon(.2, .62, .9, m, s * .54, .14, -.06)); g.add(mechon(.36, .2, .3, m, s * .26, .58, .42, .3, s * .15)); }
      g.add(mechon(.5, .22, .3, m, 0, .62, .44, .35)); g.add(M(rbox(1.08, .72, .2, .1), m, 0, .1, -.5));
      g.add(bola(.3, m, 0, .98, -.1, 1, .85, 1)); { const tr = M(new THREE.TorusGeometry(.2, .05, 8, 20), m, 0, .8, -.1); tr.rotation.x = Math.PI / 2; g.add(tr); } }
    else if (estilo === 'ondas') { g.add(M(rbox(1.12, .4, 1.08, .2, .03), m, 0, .42, -.02)); for (const s of [-1, 1]) for (let i = 0; i < 3; i++) g.add(bola(.17, m, s * .56, .38 - i * .22, -.05 + (i % 2) * .1, .8, 1, 1.2)); g.add(M(rbox(1.08, .7, .2, .1), m, 0, .1, -.5)); g.add(bola(.26, m, 0, .9, -.18, 1.1, .8, 1)); for (let i = 0; i < 3; i++) g.add(mechon(.28, .18, .26, m, -.3 + i * .3, .6, .42, .4)); }
    else if (estilo === 'picos') { g.add(M(rbox(1.1, .3, 1.06, .15, .02), m, 0, .42, -.02));
      const pico = (x, y, z, rx, rz, h = .42) => { const c = M(new THREE.ConeGeometry(.16, h, 5), m, x, y, z); c.rotation.set(rx, 0, rz); g.add(c); };
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; pico(Math.cos(a) * .42, .52, Math.sin(a) * .4, Math.sin(a) * .9, -Math.cos(a) * .9); }
      for (let i = 0; i < 5; i++) pico(-.36 + i * .18, .62, .4, .9, 0, .3); for (const s of [-1, 1]) for (let i = 0; i < 2; i++) pico(s * .55, .22 - i * .2, -.1 + i * .15, 0, -s * 1.4, .32); }
    else if (estilo === 'corto') { g.add(M(rbox(1.1, .36, 1.06, .17, .02), m, 0, .42, -.02)); for (let i = 0; i < 4; i++) g.add(mechon(.3, .2, .3, m, -.38 + i * .25, .58, .4, .45, (i - 1.5) * .1)); for (const s of [-1, 1]) g.add(mechon(.16, .42, .8, m, s * .53, .2, -.08)); g.add(M(rbox(1.06, .62, .18, .09), m, 0, .14, -.5)); }
    else if (estilo === 'rizos') { for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, b = (i % 3) * .3; g.add(bola(.2, m, Math.cos(a) * (.5 - b * .2), .42 + b * .25, Math.sin(a) * (.48 - b * .2) - .04)); } g.add(bola(.4, m, 0, .62, -.05, 1.3, .7, 1.3)); }
    return g; }
  function gorroFiesta(col) { const g = new THREE.Group(); const t = tex(128, 256, (x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); x.fillStyle = '#FFFFFF'; x.fillRect(0, h * .32, w, h * .1); x.fillRect(0, h * .62, w, h * .1); });
    g.add(M(new THREE.ConeGeometry(.34, .82, 24, 1, true), sm('#FFFFFF', { map: t, side: THREE.DoubleSide }), 0, .41, 0)); g.add(bola(.12, sm('#FFFFFF', { roughness: .9 }), 0, .84, 0)); return g; }
  function gorroTejido() { const g = new THREE.Group(); const tej = tex(256, 128, (x, w, h) => { x.fillStyle = C.azul; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(0,0,40,.18)'; x.lineWidth = 3; for (let i = 0; i < w; i += 12) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } });
    tej.wrapS = tej.wrapT = THREE.RepeatWrapping; tej.repeat.set(4, 2); const m = sm('#FFFFFF', { map: tej, roughness: .95 });
    const cup = M(new THREE.SphereGeometry(.56, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, .38, 0); cup.scale.set(1.0, .9, .98); g.add(cup);
    const band = M(rbox(1.1, .28, 1.05, .12, .015), m, 0, .3, 0); g.add(band);   // doblez grueso, recto y pegado a la cabeza
    const tEst = tex(128, 128, (x, w) => estrellita(x, w / 2, w / 2 + 6, 58, C.amarillo)); const st = new THREE.Mesh(new THREE.PlaneGeometry(.2, .2), new THREE.MeshStandardMaterial({ map: tEst, emissive: C.amarillo, emissiveMap: tEst, emissiveIntensity: .7, transparent: true, roughness: .4, polygonOffset: true, polygonOffsetFactor: -3 }));
    st.position.set(0, .3, .56); g.add(st); return g; }
  function gorra(col) { const g = new THREE.Group(), m = sm(col); const cup = M(new THREE.SphereGeometry(.57, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, .3, 0); cup.scale.set(1, .6, 1); g.add(cup);
    g.add(M(rbox(1.12, .08, 1.08, .04), m, 0, .3, 0)); const vis = M(rbox(.86, .06, .55, .1), m, 0, .3, .72); vis.rotation.x = .12; g.add(vis); g.add(bola(.07, m, 0, .65, 0)); return g; }
  function sombreroCopa() { const g = new THREE.Group(), n = sm('#14141A', { roughness: .25 }); g.add(M(new THREE.CylinderGeometry(.75, .75, .06, 32), n, 0, 0, 0)); g.add(M(new THREE.CylinderGeometry(.46, .46, .82, 32), n, 0, .44, 0)); g.add(M(new THREE.CylinderGeometry(.465, .465, .16, 32), sm(C.rosa), 0, .12, 0)); return g; }

  // ---------- relieves de ropa ----------
  const botones = (par, col, xs, ys, z) => { ys.forEach(y => { const b = M(new THREE.CylinderGeometry(.07, .07, .04, 16), sm(col), xs, y, z); b.rotation.x = Math.PI / 2; par.add(b); }); };
  const cordones = (par, col, z) => { for (const s of [-1, 1]) { par.add(M(new THREE.CylinderGeometry(.035, .035, .36, 10), sm(col), s * .18, .52, z)); par.add(bola(.06, sm(col), s * .18, .33, z)); } };
  const bolsilloCanguro = (par, col, z) => { const b = M(rbox(.95, .42, .06, .05), sm(col), 0, -.45, z); par.add(b); };
  const cuelloV = (par, col, z) => { for (const s of [-1, 1]) { const c = M(rbox(.42, .12, .05, .04), sm(col), s * .17, .64, z); c.rotation.z = s * .7; par.add(c); } };
  const cuelloAncho = (par, col, z) => { for (const s of [-1, 1]) { const c = M(rbox(.55, .3, .06, .08), sm(col), s * .3, .62, z); c.rotation.z = s * .35; par.add(c); } };
  const tirantes = (par, col, z) => { for (const s of [-1, 1]) par.add(M(rbox(.18, .62, .05, .04), sm(col), s * .42, .42, z)); par.add(M(rbox(.9, .45, .05, .05), sm(col), 0, .08, z)); par.add(M(rbox(.32, .2, .03, .03), sm(col), 0, .1, z + .03)); };
  const capucha = (par, col) => par.add(M(rbox(1.2, .42, .4, .18), sm(col, { roughness: .9 }), 0, .7, -.32));

  // ---------- avatar ----------
  function avatar(o) {
    o = Object.assign({ piel: C.piel, torso: C.azul, pierna: '#2A2E3A', zapato: '#F2F2F2', suela: '#9A9EA6' }, o); const RD = o.redondo ? 3.2 : 1;
    const raiz = new THREE.Group(), g = new THREE.Group(); g.scale.setScalar(ESC); raiz.add(g); const U = {};
    const piel = sm(o.piel);
    // piernas (pivote en la cadera, sin espacio entre ellas)
    U.piernas = [];
    for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(s * .395, 1.6, 0); g.add(p);
      const mat = (s > 0 ? o.matPiernaD : o.matPiernaI) || sm(o.pierna);
      p.add(M(rbox(.77, 1.4, .78, .065 * RD), mat, 0, -.7, 0));
      p.add(M(rbox(.79, .2, .98, .08), sm(o.zapato), 0, -1.5, .1)); p.add(M(rbox(.8, .06, 1.0, .03), sm(o.suela), 0, -1.6, .1)); U.piernas.push(p); }
    // torso 1.6 x 1.5 x 0.8
    const torso = M(rbox(1.6, 1.5, .8, .12 * RD), o.matTorso || sm(o.torso), 0, 2.35, 0); g.add(torso); U.torso = torso;
    if (o.ropa) o.ropa(torso, .405);
    // brazos 0.75 x 1.5 x 0.75 (pivote en el hombro, pegados al torso) con mano = último 22 %
    U.brazos = [];
    for (const s of [-1, 1]) { const b = new THREE.Group(); b.position.set(s * 1.175, 3.0, 0); g.add(b);
      b.add(M(rbox(.75, 1.17, .75, .06 * RD), o.matManga || sm(o.manga || o.torso), 0, -.585, 0)); b.add(M(rbox(.72, .33, .72, .08 * RD), piel, 0, -1.335, 0)); U.brazos.push(b); }
    // cabeza "malvavisco" 1.0 x 0.95 x 0.95, bisel 19 %, caras infladas; la cara va en la misma textura
    const HS = 1.25; const cab = new THREE.Group(); cab.position.set(0, 3.1 + .475 * HS, 0); cab.scale.setScalar(HS); g.add(cab); U.cabeza = cab;
    const cc = document.createElement('canvas'); cc.width = FW; cc.height = FH; const cx = cc.getContext('2d'); const ct = new THREE.CanvasTexture(cc); ct.encoding = THREE.sRGBEncoding; ct.anisotropy = 8;
    cab.add(M(rbox(1.0, .95, .95, o.redondo ? .3 : .19, .035, 8), sm('#FFFFFF', { map: ct, roughness: o.redondo ? .55 : .6 })));
    if (o.pelo) cab.add(pelo(o.pelo, o.colPelo));
    if (o.gorro) { const h = o.gorro(); h.position.y = o.gorroY != null ? o.gorroY : 0; if (o.gorroRot) h.rotation.z = o.gorroRot; if (o.gorroX) h.position.x = o.gorroX; cab.add(h); U.gorro = h; }
    if (o.extra) o.extra(g, U);
    raiz.userData = U;
    let actual = null; raiz.cara = (e) => { if (e === actual) return; actual = e; dibujaCara(cx, e, Object.assign({ piel: o.piel }, o.caraOpts || {})); ct.needsUpdate = true; };
    raiz.cara(o.expr || 'lado');
    // poses deterministas por tiempo
    raiz.pose = (t, tipo, k = 1) => { const [bi, bd] = U.brazos, [pi, pd] = U.piernas; [bi, bd, pi, pd].forEach(q => q.rotation.set(0, 0, 0)); cab.rotation.set(0, 0, 0); g.position.y = 0;
      if (tipo === 'caminar') { const a = Math.sin(t * 7) * .6 * k; pi.rotation.x = a; pd.rotation.x = -a; bi.rotation.x = -a; bd.rotation.x = a; }
      else if (tipo === 'bailar') { const a = Math.sin(t * 8); bi.rotation.z = -2.7 + .3 * a; bd.rotation.z = 2.7 + .3 * a; g.position.y = Math.abs(Math.sin(t * 8)) * .15; cab.rotation.z = .1 * a; pi.rotation.x = .12 * a; pd.rotation.x = -.12 * a; }
      else if (tipo === 'botar') { const f = (t * 2.2) % 1, e = Math.pow(2 * f - 1, 2); bd.rotation.x = -.42 + .22 * e; bd.rotation.z = .16; bi.rotation.x = .08 * Math.sin(t * 4.4); bi.rotation.z = -.07; pi.rotation.x = -.12; pd.rotation.x = .1; }
      else if (tipo === 'quieto') { bi.rotation.z = -.06; bd.rotation.z = .06; bi.rotation.x = .03 * Math.sin(t * 1.3); bd.rotation.x = -.03 * Math.sin(t * 1.3); }
      else if (tipo === 'guitarra') { const r = Math.sin(t * 11); bd.rotation.x = -1.05; bd.rotation.z = .55; bd.rotation.y = -.35; bi.rotation.x = -.62 + .1 * r; bi.rotation.z = .62; cab.rotation.z = .06 * Math.sin(t * 2.2); cab.rotation.x = .08; }
      else if (tipo === 'karate') { const a = Math.max(0, Math.sin(t * 6)); bi.rotation.x = -1.5 * (.35 + .65 * a); bi.rotation.z = .12; bd.rotation.x = -.95; bd.rotation.z = -.2; pi.rotation.z = -.32; pd.rotation.z = .32; g.position.y = -.045; }
      else if (tipo === 'lagartija') { const u = .5 - .5 * Math.cos(t * 3.2); bi.rotation.x = bd.rotation.x = -(1.21 - .1 * u); cab.rotation.x = 0; }
      else if (tipo === 'tirar') { bi.rotation.x = bd.rotation.x = -2.9 * k; g.position.y = .25 * Math.sin(Math.min(1, k) * Math.PI); }
      else if (tipo === 'sentado') { pi.rotation.x = pd.rotation.x = -Math.PI / 2; g.position.y = -.75; bi.rotation.x = bd.rotation.x = -.3; }
      else if (tipo === 'reir') { const a = Math.sin(t * 14); bi.rotation.x = bd.rotation.x = -.5 + .1 * a; cab.rotation.x = -.15 + .06 * a; g.position.y = Math.abs(a) * .06; }
      else if (tipo === 'sostener') { bi.rotation.x = bd.rotation.x = -1.05; bi.rotation.z = .42; bd.rotation.z = -.42; }
      else if (tipo === 'colgar') { bi.rotation.x = -2.6; bd.rotation.x = -2.75; bi.rotation.z = .2; bd.rotation.z = -.15; cab.rotation.x = -.25; }
      else if (tipo === 'brazos') { bi.rotation.x = bd.rotation.x = -.8; } };
    raiz.pose(0, 'quieto');
    return raiz;
  }

  // ---------- balón ----------
  function balon(r = .16) { const t = tex(512, 256, (x, w, h) => { x.fillStyle = '#E07A28'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 1200; i++) x.fillRect((i * 97) % w, (i * 61) % h, 2, 2); x.strokeStyle = '#1A1A1A'; x.lineWidth = 11; x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.moveTo(w / 4, 0); x.lineTo(w / 4, h); x.moveTo(3 * w / 4, 0); x.lineTo(3 * w / 4, h); x.stroke(); x.beginPath(); x.ellipse(w / 2, h / 2, 90, h / 2, 0, 0, 7); x.stroke(); });
    return M(new THREE.SphereGeometry(r, 32, 24), sm('#FFFFFF', { map: t, roughness: .6 })); }

  // ---------- pez y pecera ----------
  let ENV = null; function entorno() { if (ENV) return ENV; ENV = tex(512, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9AA4C8'); g.addColorStop(.5, '#4A4E66'); g.addColorStop(1, '#2A2630'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (const [cx, cy, r, a] of [[120, 70, 46, 1], [330, 60, 60, .8], [430, 110, 30, .6]]) { const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, `rgba(255,250,240,${a})`); rg.addColorStop(1, 'rgba(255,250,240,0)'); x.fillStyle = rg; x.fillRect(cx - r, cy - r, r * 2, r * 2); } }); ENV.mapping = THREE.EquirectangularReflectionMapping; return ENV; }
  function pecera() { const g = new THREE.Group();
    const mesa = new THREE.Group(); g.add(mesa); mesa.add(M(new THREE.CylinderGeometry(.6, .6, .07, 40), sm('#F4F4F2', { roughness: .45 }), 0, .78, 0)); { const tr = M(new THREE.TorusGeometry(.6, .035, 10, 48), sm('#F4F4F2'), 0, .78, 0); tr.rotation.x = Math.PI / 2; mesa.add(tr); }
    mesa.add(M(new THREE.CylinderGeometry(.05, .05, .76, 16), sm('#141416', { roughness: .4 }), 0, .38, 0)); mesa.add(M(new THREE.CylinderGeometry(.26, .28, .03, 24), sm('#141416'), 0, .015, 0));
    g.add(M(new THREE.CylinderGeometry(.22, .25, .08, 12), sm('#D9C9A6', { roughness: .6 }), 0, .855, 0));
    // esfera de vidrio real (transmisión), abertura arriba con borde grueso pegado, agua al 80 % con ondas
    const RV = .32, CY = 1.17, T0 = .16 * Math.PI, env = entorno();
    const vm = new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', transmission: 1, ior: 1.45, roughness: .05, thickness: .05, metalness: 0, envMap: env, envMapIntensity: 1.3, specularIntensity: 1, depthWrite: false });
    const vidrio = new THREE.Mesh(new THREE.SphereGeometry(RV, 64, 40, 0, Math.PI * 2, T0, Math.PI - T0), vm); vidrio.position.y = CY; g.add(vidrio);
    const borde = new THREE.Mesh(new THREE.TorusGeometry(RV * Math.sin(T0), .016, 12, 64), vm); borde.rotation.x = Math.PI / 2; borde.position.y = CY + RV * Math.cos(T0); g.add(borde);
    const TA = Math.acos(.43), RA = RV - .008, YS = CY + RA * Math.cos(TA);
    const am = new THREE.MeshStandardMaterial({ color: '#E8F2C0', transparent: true, opacity: .2, roughness: .05, envMap: env, envMapIntensity: .6, depthWrite: false, side: THREE.DoubleSide });
    const agua = new THREE.Mesh(new THREE.SphereGeometry(RA, 48, 32, 0, Math.PI * 2, TA, Math.PI - TA), am); agua.position.y = CY; g.add(agua);
    const sgeo = new THREE.RingGeometry(.001, RA * Math.sin(TA), 48, 10); sgeo.rotateX(-Math.PI / 2); const sup = new THREE.Mesh(sgeo, new THREE.MeshStandardMaterial({ color: '#E8F2C0', transparent: true, opacity: .32, roughness: .03, envMap: env, envMapIntensity: 1.2, depthWrite: false, side: THREE.DoubleSide })); sup.position.y = YS; g.add(sup);
    const sp0 = sgeo.attributes.position.array.slice();
    const pez = new THREE.Group(); pez.position.set(0, 1.12, 0); g.add(pez); const nar = sm('#F2A33A', { emissive: '#6A2A00', emissiveIntensity: .25 }), ama = sm('#F7C04A', { emissive: '#5A3A00', emissiveIntensity: .2 });
    const cuerpo = M(new THREE.SphereGeometry(.1, 24, 18), nar); cuerpo.scale.set(1.25, 1, .72); pez.add(cuerpo);
    const cola = M(rbox(.03, .15, .11, .012), ama, -.15, 0, 0); cola.rotation.z = .2; pez.add(cola); const aleta = M(rbox(.09, .05, .02, .01), ama, -.01, .1, 0); aleta.rotation.z = -.35; pez.add(aleta);
    for (const s of [-1, 1]) { pez.add(M(new THREE.SphereGeometry(.016, 10, 8), sm('#101010', { roughness: .2 }), .08, .03, s * .062)); pez.add(M(new THREE.SphereGeometry(.005, 6, 4), sm('#FFFFFF'), .087, .038, s * .07)); }
    { const bo = M(new THREE.TorusGeometry(.012, .004, 6, 12), sm('#B84A1A'), .124, -.01, 0); bo.rotation.y = Math.PI / 2; pez.add(bo); }
    const gp = gorroFiesta(C.celeste); gp.scale.setScalar(.13); gp.position.set(.03, .085, 0); gp.rotation.z = -.2; pez.add(gp);
    const burbujas = []; for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.005 + (i % 3) * .002, 12, 8), new THREE.MeshStandardMaterial({ color: '#FFFFFF', transparent: true, opacity: .55, roughness: .05, envMap: env, envMapIntensity: 1.5, depthWrite: false })); g.add(b); burbujas.push(b); }
    g.userData = { pez, cola, burbujas, agua: sup }; g.anima = (t, baile = 0) => { const a = t * (1 + baile * 2.5); pez.position.set(Math.cos(a) * .1, 1.08 + .025 * Math.sin(t * 3), Math.sin(a) * .08); pez.rotation.y = -a + Math.PI / 2 * baile; pez.rotation.z = .25 * baile * Math.sin(t * 6); cola.rotation.y = .5 * Math.sin(t * 12);
      const sp = sgeo.attributes.position; for (let i = 0; i < sp.count; i++) { const x = sp0[i * 3], z = sp0[i * 3 + 2]; sp.setY(i, .004 * Math.sin(x * 40 + t * 3) * Math.cos(z * 34 - t * 2.4)); } sp.needsUpdate = true; sgeo.computeVertexNormals();
      burbujas.forEach((b, i) => { const u = ((t * .45 + i / 9) % 1), y0 = 1.0 + (i % 3) * .03; b.position.set(.08 * Math.sin(i * 2.1) + .01 * Math.sin(t * 5 + i), y0 + u * (YS - y0 - .01), .06 * Math.cos(i * 3.3)); b.material.opacity = .55 * Math.min(1, u * 5) * (1 - Math.pow(u, 3)); b.visible = u < .98; }); };
    g.anima(1.3, 0); return g; }

  // ---------- catálogo ----------
  const lisa = (col) => sm(col);
  const CAT = {
    prota: () => { const tT = tela(C.azul, (x, w, h) => tronquito(x, w * .74, h * .3, w * .17));
      return avatar({ matTorso: sm('#FFFFFF', { map: tT }), torso: C.azul, manga: C.azul, pierna: '#1B2F9A', zapato: '#F4F4F4',
        ropa: (t, z) => { capucha(t, C.azul); cordones(t, C.amarillo, z + .02); bolsilloCanguro(t, '#1C38B0', z); t.add(M(rbox(1.63, .16, .83, .06), sm(C.amarillo), 0, -.69, 0)); },   // orilla amarilla
        extra: (g, U) => U.brazos.forEach(b => b.add(M(rbox(.77, .15, .77, .05), sm(C.amarillo), 0, -1.1, 0))),          // puños amarillos
        gorro: gorroTejido, gorroY: 0, expr: 'lado' }); },
    linda: (o = {}) => avatar({ torso: '#9C6BC7', pierna: '#8D8F96', zapato: '#7A7C84', suela: '#5A5C64', pelo: 'chongo', colPelo: '#8B5A2B', ropa: (t, z) => { cuelloV(t, '#FFFFFF', z); botones(t, '#FFFFFF', 0, [.2, -.15], z + .01); },
      gorro: o.sinGorro ? null : () => gorroFiesta('#8B5A2B'), gorroY: 1.1, gorroX: .15, gorroRot: -.18, expr: 'feliz', caraOpts: { lentes: true } }),
    abuela: (o = {}) => avatar({ torso: '#B89AD6', manga: '#B89AD6', pierna: '#C79BC6', zapato: '#E3A9C8', suela: '#C882A8', pelo: 'ondas', colPelo: '#D6D6D9', ropa: (t, z) => { tirantes(t, '#C79BC6', z); botones(t, '#FFFFFF', .3, [.32], z + .04); botones(t, '#FFFFFF', -.3, [.32], z + .04); },
      gorro: o.sinGorro ? null : () => gorroFiesta('#7CC36A'), gorroY: 1.02, gorroX: -.12, gorroRot: .15, expr: 'feliz', caraOpts: { lentes: true } }),
    nino_gorro: () => avatar({ torso: '#7FCB8C', pierna: '#7F8FB0', pelo: 'picos', colPelo: '#E07A2E', ropa: (t, z) => { cuelloAncho(t, '#FFFFFF', z); botones(t, '#FFFFFF', 0, [.22, -.12], z + .01); },
      gorro: () => gorroFiesta('#7CC36A'), gorroY: .8, gorroX: .05, gorroRot: -.12, expr: 'feliz', caraOpts: { bocaGrande: true } }),
    kevin: () => avatar({ piel: C.kevin, torso: '#E34B3E', pierna: '#6F7C96', zapato: '#3D6BD8', suela: '#FFFFFF', ropa: (t, z) => { capucha(t, '#E34B3E'); cordones(t, '#FFFFFF', z + .02); bolsilloCanguro(t, '#C83A30', z); }, gorro: () => gorra('#E34B3E'), gorroY: .02, expr: 'lado' }),
    rubio: () => avatar({ torso: '#7FAAD8', manga: '#7FAAD8', pierna: '#9FC4E8', zapato: '#8D8F96', suela: '#6A6C74', pelo: 'picos', colPelo: '#F3D06B', ropa: (t, z) => { tirantes(t, '#9FC4E8', z); }, gorro: () => gorroFiesta('#F2A33A'), gorroY: .8, gorroRot: .12, expr: 'sorpresa' }),
    invitado_verde: () => avatar({ piel: C.kevin, torso: '#5DB36A', pierna: '#6A7A6A', pelo: 'corto', colPelo: '#5A3A22', gorro: () => gorroFiesta(C.celeste), gorroY: .7, gorroRot: .1, expr: 'feliz' }),
    invitado_blanco: () => avatar({ torso: '#F4F4F4', matTorso: sm('#FFFFFF', { map: tela('#F4F4F4', (x, w, h) => estrellita(x, w / 2, h * .42, 120, C.rosa)) }), manga: '#F4F4F4', pierna: '#7A5A3A', pelo: 'corto', colPelo: '#6A4028', gorro: () => gorroFiesta(C.amarillo), gorroY: .7, gorroRot: -.1, expr: 'feliz' }),
    invitada_amarilla: () => avatar({ piel: '#8A5A3C', torso: '#F2D35B', pierna: '#6A7A6A', pelo: 'rizos', colPelo: '#F2E2B8', gorro: () => gorroFiesta('#F28DB2'), gorroY: 1.0, gorroRot: .1, expr: 'feliz' }),
    alcalde: () => { const g = new THREE.Group(), s = new THREE.Group(); s.scale.setScalar(ESC); g.add(s); const b = sm('#F4F6FA', { roughness: .55 });
      s.add(M(rbox(2.0, 1.6, 1.8, .7, .08), b, 0, .8, 0)); s.add(M(rbox(1.5, 1.3, 1.4, .55, .06), b, 0, 2.15, 0));
      for (const sx of [-1, 1]) { const br = M(rbox(.5, 1.0, .5, .2), b, sx * 1.0, 2.2, 0); br.rotation.z = sx * .5; s.add(br); }
      botones(s, '#14141A', 0, [2.4, 2.05], .72);
      const cab = new THREE.Group(); cab.position.y = 3.3; s.add(cab); const cc = document.createElement('canvas'); cc.width = FW; cc.height = FH; const ct = new THREE.CanvasTexture(cc); ct.encoding = THREE.sRGBEncoding;
      cab.add(M(rbox(1.1, 1.0, 1.0, .32, .05, 8), sm('#FFFFFF', { map: ct, roughness: .55 }))); const h = sombreroCopa(); h.position.y = .46; cab.add(h);
      let ac = null; g.cara = (e) => { if (e === ac) return; ac = e; dibujaCara(cc.getContext('2d'), e, { piel: '#F4F6FA' }); ct.needsUpdate = true; }; g.cara('lado'); g.pose = () => {}; g.userData = { cabeza: cab }; return g; },
    pecera,
  };
  const PALETAS = {
    prota: [C.azul, C.amarillo, '#1B2F9A', C.piel, '#9A6640', '#FFFFFF', '#E07A28'], linda: ['#9C6BC7', '#8B5A2B', '#8D8F96', C.piel, C.rojo, C.negro], abuela: ['#C79BC6', '#B89AD6', '#D6D6D9', '#E3A9C8', '#7CC36A', C.piel],
    nino_gorro: ['#E07A2E', '#7FCB8C', '#7CC36A', '#7F8FB0', C.piel, C.rojo], kevin: ['#E34B3E', C.kevin, '#6F7C96', '#3D6BD8', '#FFFFFF'], rubio: ['#F3D06B', '#F2A33A', '#9FC4E8', '#7FAAD8', C.piel],
    invitados: ['#5DB36A', '#F4F4F4', C.rosa, '#F2D35B', '#F2E2B8', '#8A5A3C', C.kevin], alcalde: ['#F4F6FA', '#14141A', C.rosa], pecera: ['#F2A33A', '#F7C04A', C.celeste, '#D9C9A6', '#F4F4F2', '#141416'] };
  window.PUEBLO_P = { crear: (k, o) => CAT[k](o), CAT, avatar, balon, pecera, gorroFiesta, dibujaCara, rbox, sm, M, tex, estrellita, ESC, PALETAS, C };
})();
