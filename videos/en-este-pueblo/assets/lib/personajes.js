/* "En este pueblo" — personajes de bloques (reutilizables en todo el video).
   Uso: const P = window.PUEBLO_P; const g = P.crear('prota'); g.cara('feliz'); g.pose(t, 'botar'|'caminar'|'bailar'|'quieto') */
(function () {
  const THREE = window.THREE; if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
  const sm = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .72, metalness: 0 }, o));
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; };
  function rbox(w, h, d, r) { r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4); const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const b = Math.min(r * .6, d * .25); const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * b, bevelEnabled: true, bevelSize: b, bevelThickness: b, bevelSegments: 3, curveSegments: 4 }); g.translate(0, 0, -(d - 2 * b) / 2);
    // UV de la cara frontal: 0..1 sobre el rectángulo
    const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h); return g; }
  const M = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
  // plano "calcomanía" pegado a una cara del bloque
  const decal = (w, h, t, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: .8, polygonOffset: true, polygonOffsetFactor: -2 })); m.position.z = z; m.receiveShadow = true; return m; };

  // ---------------- caras (canvas 256x256, se pegan al frente de la cabeza) ----------------
  const ROJO = '#E8212B';
  function dibujaCara(x, expr, o = {}) {
    const W = 256; x.clearRect(0, 0, W, W); x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#141414'; x.fillStyle = '#141414';
    const ojo = (cx, cy, rx = 15, ry = 24) => { x.fillStyle = '#141414'; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(cx + rx * .3, cy - ry * .4, rx * .32, ry * .22, 0, 0, 7); x.fill(); };
    const feliz = (cx, cy) => { x.lineWidth = 10; x.beginPath(); x.arc(cx, cy + 10, 18, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); };
    const ceja = (cx, cy, a = 0) => { x.lineWidth = 8; x.beginPath(); x.moveTo(cx - 18, cy + a); x.lineTo(cx + 18, cy - a); x.stroke(); };
    const bocaAbierta = (cy, w = 70, h = 46) => { x.fillStyle = ROJO; x.lineWidth = 9; x.beginPath(); x.moveTo(128 - w / 2, cy); x.quadraticCurveTo(128, cy + h * 2.2, 128 + w / 2, cy); x.closePath(); x.fill(); x.stroke(); };
    const L = 86, R = 170, Y = 108;
    switch (expr) {
      case 'feliz': feliz(L, Y); feliz(R, Y); bocaAbierta(160, o.bocaGrande ? 100 : 76, o.bocaGrande ? 60 : 44); break;
      case 'guino': ojo(L, Y); feliz(R, Y); ceja(L, 72); x.lineWidth = 10; x.beginPath(); x.moveTo(92, 172); x.quadraticCurveTo(140, 200, 178, 158); x.stroke(); break;
      case 'sorpresa': for (const cx of [L, R]) { x.lineWidth = 7; x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, Y, 22, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#141414'; x.beginPath(); x.arc(cx, Y, 9, 0, 7); x.fill(); } ceja(L, 70, -4); ceja(R, 70, 4); x.fillStyle = ROJO; x.lineWidth = 7; x.beginPath(); x.ellipse(128, 178, 15, 18, 0, 0, 7); x.fill(); x.stroke(); break;
      case 'preocupado': ojo(L, Y, 13, 20); ojo(R, Y, 13, 20); ceja(L, 76, 7); ceja(R, 76, -7); x.lineWidth = 9; x.beginPath(); x.moveTo(92, 176); for (let i = 0; i <= 8; i++) x.lineTo(92 + i * 9, 176 + (i % 2 ? -7 : 7)); x.stroke(); break;
      case 'triste': ojo(L, Y, 19, 28); ojo(R, Y, 19, 28); ceja(L, 70, 6); ceja(R, 70, -6); x.lineWidth = 9; x.beginPath(); x.moveTo(104, 182); x.lineTo(152, 182); x.stroke(); x.fillStyle = '#5AB4FF'; x.beginPath(); x.moveTo(R + 6, 132); x.quadraticCurveTo(R + 20, 160, R + 6, 168); x.quadraticCurveTo(R - 8, 160, R + 6, 132); x.fill(); break;
      case 'recta': ojo(L, Y); ojo(R, Y); x.lineWidth = 9; x.beginPath(); x.moveTo(100, 176); x.lineTo(156, 176); x.stroke(); break;
      case 'seria': ojo(L, Y); ojo(R, Y); ceja(L, 74, -3); ceja(R, 74, 3); x.lineWidth = 9; x.beginPath(); x.moveTo(104, 178); x.lineTo(152, 174); x.stroke(); break;
      default: /* 'lado': sonrisa de lado */ ojo(L, Y); ojo(R, Y); x.lineWidth = 10; x.beginPath(); x.moveTo(96, 166); x.quadraticCurveTo(136, 192, 176, 156); x.stroke(); }
    if (o.lentes) { x.strokeStyle = '#141414'; x.lineWidth = 9; x.strokeRect(L - 34, Y - 32, 68, 60); x.strokeRect(R - 34, Y - 32, 68, 60); x.beginPath(); x.moveTo(L + 34, Y - 6); x.lineTo(R - 34, Y - 6); x.stroke(); }
    if (o.rubor) { x.fillStyle = 'rgba(255,120,140,.35)'; x.beginPath(); x.ellipse(60, 150, 18, 10, 0, 0, 7); x.ellipse(196, 150, 18, 10, 0, 0, 7); x.fill(); }
  }

  // ---------------- ropa ----------------
  const estrellita = (x, cx, cy, r, col) => { x.fillStyle = col; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); };
  const estrellas = (x, w, h, seed = 1, n = 26) => { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const cols = ['#FF9CC8', '#FFFFFF', '#F2C230', '#9FD4FF']; for (let i = 0; i < n; i++) estrellita(x, r() * w, r() * h, 6 + r() * 6, cols[i % 4]); };
  function telaSudadera() { return tex(512, 512, (x, w, h) => { x.fillStyle = '#2142C9'; x.fillRect(0, 0, w, h); estrellas(x, w, h, 7, 34);
    // bolsillo canguro
    x.fillStyle = 'rgba(10,20,90,.35)'; x.beginPath(); x.moveTo(110, 340); x.lineTo(402, 340); x.lineTo(440, 500); x.lineTo(72, 500); x.closePath(); x.fill(); x.strokeStyle = 'rgba(10,20,90,.6)'; x.lineWidth = 6; x.stroke();
    // texto
    x.fillStyle = '#F2C230'; x.strokeStyle = '#7A5A00'; x.lineWidth = 4; x.textAlign = 'center'; x.font = 'bold 50px Georgia, "DejaVu Serif", serif'; x.strokeText('¡en este pueblo!', w / 2, 230); x.fillText('¡en este pueblo!', w / 2, 230);
    x.font = 'italic 28px Georgia, "DejaVu Serif", serif'; x.fillText('más allá de las reglas', w / 2, 278);
    // cordones
    x.strokeStyle = '#F2C230'; x.lineWidth = 9; for (const cx of [210, 302]) { x.beginPath(); x.moveTo(cx, 0); x.lineTo(cx + (cx < 256 ? -8 : 8), 150); x.stroke(); x.fillStyle = '#F2C230'; x.beginPath(); x.arc(cx + (cx < 256 ? -8 : 8), 160, 11, 0, 7); x.fill(); }
    x.fillStyle = 'rgba(10,20,90,.4)'; x.beginPath(); x.moveTo(170, 0); x.quadraticCurveTo(256, 70, 342, 0); x.fill(); }); }
  function telaPantalon(texto) { return tex(256, 512, (x, w, h) => { x.fillStyle = '#2142C9'; x.fillRect(0, 0, w, h); estrellas(x, w, h, 3, 14);
    if (texto) { x.save(); x.translate(w / 2 + 10, h / 2); x.rotate(Math.PI / 2); x.fillStyle = '#F2C230'; x.font = 'bold 46px Georgia, "DejaVu Serif", serif'; x.textAlign = 'center'; x.fillText('en este pueblo', 0, 14); x.restore(); } }); }
  function telaLisa(col, fn) { return tex(256, 256, (x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); if (fn) fn(x, w, h); }); }
  const conBotones = (col = '#FFFFFF', cuello) => (x, w, h) => { if (cuello) { x.fillStyle = cuello; x.beginPath(); x.moveTo(60, 0); x.lineTo(128, 70); x.lineTo(196, 0); x.lineTo(160, 0); x.lineTo(128, 36); x.lineTo(96, 0); x.closePath(); x.fill(); } else { x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.moveTo(92, 0); x.lineTo(128, 60); x.lineTo(164, 0); x.fill(); } x.fillStyle = col; for (const y of [96, 140]) { x.beginPath(); x.arc(128, y, 10, 0, 7); x.fill(); } };
  const overol = (col, debajo) => (x, w, h) => { x.fillStyle = debajo; x.fillRect(0, 0, w, h); x.fillStyle = col; x.fillRect(40, 90, w - 80, h - 90); x.fillRect(48, 0, 28, 100); x.fillRect(w - 76, 0, 28, 100); x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(62, 100, 8, 0, 7); x.arc(w - 62, 100, 8, 0, 7); x.fill(); x.fillStyle = 'rgba(0,0,0,.15)'; x.fillRect(84, 130, 88, 60); };

  // ---------------- gorros y pelo ----------------
  function gorroFiesta(col, raya = '#FFFFFF', pompon = '#FFFFFF') { const g = new THREE.Group(); const t = tex(128, 256, (x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); x.fillStyle = raya; for (let y = 20; y < h; y += 56) { x.save(); x.translate(0, y); x.rotate(-.25); x.fillRect(-20, 0, w + 60, 16); x.restore(); } });
    g.add(M(new THREE.ConeGeometry(.16, .42, 16), sm('#FFFFFF', { map: t }), 0, .21, 0)); g.add(M(new THREE.SphereGeometry(.06, 12, 10), sm(pompon, { roughness: 1 }), 0, .43, 0)); return g; }
  function gorroTejido() { const g = new THREE.Group(), azul = sm('#2142C9', { roughness: .95 });
    g.add(M(rbox(.56, .26, .56, .08), azul, 0, .13, 0)); g.add(M(rbox(.6, .14, .6, .05), sm('#1C38AE', { roughness: .95 }), 0, .02, 0));
    const st = tex(128, 128, (x, w) => estrellita(x, w / 2, w / 2 + 6, 56, '#F2C230')); const d = decal(.2, .2, st, .302); d.position.y = .04; g.add(d); return g; }
  function gorra(col) { const g = new THREE.Group(), m = sm(col); g.add(M(rbox(.54, .18, .54, .1), m, 0, .09, 0)); g.add(M(new THREE.BoxGeometry(.4, .04, .24), m, 0, .02, .36)); return g; }
  function chongo(col, alto) { const g = new THREE.Group(), m = sm(col, { roughness: .9 }); g.add(M(rbox(.54, .14, .54, .06), m, 0, .02, -.01)); g.add(M(rbox(.54, .32, .1, .05), m, 0, -.1, -.24)); const b = M(new THREE.SphereGeometry(.13, 14, 12), m, 0, alto ? .2 : .12, -.06); b.scale.y = .85; g.add(b); return g; }
  function picos(col) { const g = new THREE.Group(), m = sm(col, { roughness: .9 }); g.add(M(rbox(.54, .1, .54, .04), m, 0, .02, 0));
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const c = M(new THREE.ConeGeometry(.08, .2, 4), m, Math.cos(a) * .17, .1, Math.sin(a) * .17); c.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); g.add(c); } g.add(M(new THREE.ConeGeometry(.09, .24, 4), m, 0, .14, 0)); return g; }
  function peloCorto(col) { const g = new THREE.Group(), m = sm(col, { roughness: .9 }); g.add(M(rbox(.54, .12, .54, .05), m, 0, .02, -.01)); g.add(M(rbox(.54, .22, .08, .04), m, 0, -.06, -.24)); return g; }
  function sombreroCopa() { const g = new THREE.Group(), n = sm('#16161A', { roughness: .5 }); g.add(M(new THREE.CylinderGeometry(.36, .36, .03, 20), n, 0, 0, 0)); g.add(M(new THREE.CylinderGeometry(.22, .22, .42, 20), n, 0, .22, 0)); g.add(M(new THREE.CylinderGeometry(.225, .225, .07, 20), sm('#FF7FB8'), 0, .06, 0)); return g; }

  // ---------------- cuerpo base ----------------
  const DEF = { piel: '#F2C6A0', torso: '#2142C9', mangas: null, pierna: '#2A2E3A', tenis: '#F2F2F2', suela: '#8A8E96' };
  function avatar(o) {
    o = Object.assign({}, DEF, o); const g = new THREE.Group(), U = {};
    const piel = sm(o.piel, { roughness: .6 });
    const torsoMat = o.telaTorso ? [sm('#FFFFFF', { map: o.telaTorso }), sm(o.torso)] : [sm(o.torso)];
    // piernas (pivote en la cadera)
    U.piernas = [];
    for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(s * .135, .72, 0); g.add(p);
      const pm = o.telaPierna && s > 0 ? sm('#FFFFFF', { map: o.telaPierna }) : (o.telaPiernaL && s < 0 ? sm('#FFFFFF', { map: o.telaPiernaL }) : sm(o.pierna));
      const leg = M(rbox(.24, .62, .26, .04), pm, 0, -.3, 0); p.add(leg);
      p.add(M(rbox(.26, .1, .32, .04), sm(o.tenis), 0, -.66, .03)); p.add(M(new THREE.BoxGeometry(.265, .03, .33), sm(o.suela), 0, -.705, .03)); U.piernas.push(p); }
    // torso
    const torso = M(rbox(.56, .64, .3, .05), torsoMat[torsoMat.length - 1], 0, 1.04, 0); g.add(torso); U.torso = torso;
    if (o.telaTorso) { const d = decal(.54, .62, o.telaTorso.clone ? o.telaTorso : o.telaTorso, .151); d.material = new THREE.MeshStandardMaterial({ map: o.telaTorso, roughness: .8 }); torso.add(d); }
    if (o.capucha) { const c = M(rbox(.5, .16, .16, .06), sm(o.torso, { roughness: .95 }), 0, .34, -.12); torso.add(c); }
    // brazos (pivote en el hombro)
    U.brazos = [];
    for (const s of [-1, 1]) { const b = new THREE.Group(); b.position.set(s * .38, 1.3, 0); g.add(b);
      b.add(M(rbox(.2, .5, .24, .04), o.telaManga ? sm('#FFFFFF', { map: o.telaManga }) : sm(o.mangas || o.torso), 0, -.22, 0));
      b.add(M(rbox(.2, .16, .24, .04), piel, 0, -.55, 0)); U.brazos.push(b); }
    // cabeza (cubo un poco redondeado) + cara calcomanía
    const cab = new THREE.Group(); cab.position.set(0, 1.62, 0); g.add(cab); U.cabeza = cab;
    cab.add(M(rbox(.5, .5, .5, .07), piel, 0, 0, 0));
    const cc = document.createElement('canvas'); cc.width = cc.height = 256; const cx = cc.getContext('2d'); const ct = new THREE.CanvasTexture(cc); ct.encoding = THREE.sRGBEncoding; ct.anisotropy = 8;
    const cara = new THREE.Mesh(new THREE.PlaneGeometry(.46, .46), new THREE.MeshStandardMaterial({ map: ct, transparent: true, roughness: .7, polygonOffset: true, polygonOffsetFactor: -2 })); cara.position.z = .2511; cab.add(cara); U.caraCanvas = cc;
    if (o.pelo) { const h = o.pelo(); h.position.y = .2; cab.add(h); }
    if (o.gorro) { const h = o.gorro(); h.position.y = o.gorroY != null ? o.gorroY : .25; if (o.gorroRot) h.rotation.z = o.gorroRot; cab.add(h); U.gorro = h; }
    if (o.extra) o.extra(g, U);
    g.userData = U;
    let caraActual = null; g.cara = (expr) => { const key = expr; if (key === caraActual) return; caraActual = key; dibujaCara(cx, expr, o.caraOpts || {}); ct.needsUpdate = true; };
    g.cara(o.expr || 'lado');
    // poses (deterministas, por tiempo)
    g.pose = (t, tipo, k = 1) => { const [bi, bd] = U.brazos, [pi, pd] = U.piernas; bi.rotation.set(0, 0, 0); bd.rotation.set(0, 0, 0); pi.rotation.set(0, 0, 0); pd.rotation.set(0, 0, 0); cab.rotation.set(0, 0, 0); g.position.y = g.userData.y0 || 0;
      if (tipo === 'caminar') { const a = Math.sin(t * 7) * .6 * k; pi.rotation.x = a; pd.rotation.x = -a; bi.rotation.x = -a; bd.rotation.x = a; }
      else if (tipo === 'bailar') { const a = Math.sin(t * 8); bi.rotation.z = -2.6 + .35 * a; bd.rotation.z = 2.6 + .35 * a; g.position.y += Math.abs(Math.sin(t * 8)) * .08; cab.rotation.z = .1 * a; pi.rotation.x = .15 * a; pd.rotation.x = -.15 * a; }
      else if (tipo === 'botar') { const f = (t * 2.2) % 1; bd.rotation.x = -.9 + .5 * Math.sin(f * Math.PI * 2); bi.rotation.x = -.2; }
      else if (tipo === 'tirar') { bi.rotation.x = -2.9 * k; bd.rotation.x = -2.9 * k; g.position.y += .1 * Math.sin(k * Math.PI); }
      else if (tipo === 'sentado') { pi.rotation.x = pd.rotation.x = -Math.PI / 2; g.position.y -= .32; bi.rotation.x = bd.rotation.x = -.3; }
      else if (tipo === 'reir') { const a = Math.sin(t * 14); bi.rotation.x = bd.rotation.x = -.5 + .1 * a; cab.rotation.x = -.15 + .06 * a; g.position.y += Math.abs(a) * .03; }
      else if (tipo === 'brazos') { bi.rotation.x = bd.rotation.x = -.8; } };
    return g;
  }

  // ---------------- balón ----------------
  function balon(r = .16) { const t = tex(512, 256, (x, w, h) => { x.fillStyle = '#E07A28'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 900; i++) x.fillRect((i * 97) % w, (i * 61) % h, 2, 2); x.strokeStyle = '#1A1A1A'; x.lineWidth = 7; x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.moveTo(w / 4, 0); x.lineTo(w / 4, h); x.moveTo(3 * w / 4, 0); x.lineTo(3 * w / 4, h); x.stroke(); x.beginPath(); x.ellipse(w / 2, h / 2, 90, h / 2, 0, 0, 7); x.stroke(); });
    return M(new THREE.SphereGeometry(r, 28, 20), sm('#FFFFFF', { map: t, roughness: .65 })); }

  // ---------------- pez y pecera ----------------
  function pecera() { const g = new THREE.Group();
    const mesa = new THREE.Group(); g.add(mesa); mesa.add(M(new THREE.CylinderGeometry(.6, .6, .05, 32), sm('#F4F4F2', { roughness: .4 }), 0, .78, 0)); mesa.add(M(new THREE.CylinderGeometry(.05, .05, .76, 12), sm('#141416'), 0, .38, 0)); mesa.add(M(new THREE.CylinderGeometry(.26, .28, .03, 24), sm('#141416'), 0, .015, 0));
    g.add(M(new THREE.CylinderGeometry(.22, .25, .08, 12), sm('#D9C9A6', { roughness: .6 }), 0, .845, 0));
    const agua = M(new THREE.SphereGeometry(.3, 32, 24, 0, Math.PI * 2, Math.PI * .3, Math.PI * .7), new THREE.MeshStandardMaterial({ color: '#7FC8F0', transparent: true, opacity: .1, roughness: .05, depthWrite: false }), 0, 1.16, 0); g.add(agua);
    const vidrio = new THREE.Mesh(new THREE.SphereGeometry(.32, 40, 28, 0, Math.PI * 2, Math.PI * .12, Math.PI * .88), new THREE.MeshPhysicalMaterial({ color: '#E8F4FF', transparent: true, opacity: .1, roughness: .02, metalness: 0, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false })); vidrio.position.y = 1.16; vidrio.renderOrder = 5; g.add(vidrio);
    const brillo = new THREE.Mesh(new THREE.PlaneGeometry(.06, .2), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: .55, depthWrite: false })); brillo.position.set(-.16, 1.26, .27); brillo.rotation.z = .5; g.add(brillo);
    // pez de bloques
    const pez = new THREE.Group(); pez.position.set(0, 1.12, 0); g.add(pez); const nar = sm('#F28A1A', { roughness: .45, emissive: '#7A3000', emissiveIntensity: .35 }), ama = sm('#F7B030', { roughness: .45, emissive: '#6A3A00', emissiveIntensity: .3 });
    const cuerpo = M(new THREE.SphereGeometry(.1, 16, 12), nar); cuerpo.scale.set(1.3, 1, .8); pez.add(cuerpo);
    const cola = M(new THREE.BoxGeometry(.02, .14, .1), ama, -.16, 0, 0); cola.rotation.z = .2; pez.add(cola); const aleta = M(new THREE.BoxGeometry(.08, .05, .015), ama, 0, .1, 0); aleta.rotation.z = -.4; pez.add(aleta);
    for (const s of [-1, 1]) pez.add(M(new THREE.SphereGeometry(.018, 8, 6), sm('#101010'), .08, .03, s * .07));
    const gp = gorroFiesta('#9FD4FF'); gp.scale.setScalar(.38); gp.position.set(.03, .085, 0); gp.rotation.z = -.2; pez.add(gp);
    const burbujas = []; for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), new THREE.MeshStandardMaterial({ color: '#FFFFFF', transparent: true, opacity: .6 })); g.add(b); burbujas.push(b); }
    g.userData = { pez, cola, burbujas }; g.anima = (t, baile = 0) => { const a = t * (1 + baile * 2.5); pez.position.set(Math.cos(a) * .1, 1.12 + .03 * Math.sin(t * 3), Math.sin(a) * .08); pez.rotation.y = -a + Math.PI / 2 * baile; pez.rotation.z = .25 * baile * Math.sin(t * 6); cola.rotation.y = .5 * Math.sin(t * 12);
      burbujas.forEach((b, i) => { const u = ((t * .5 + i / 6) % 1); b.position.set(.04 * Math.sin(i * 2), 1.0 + u * .32, .03 * Math.cos(i * 3)); b.material.opacity = .6 * (1 - u); }); };
    return g; }

  // ---------------- catálogo ----------------
  const CAT = {
    prota: () => avatar({ piel: '#F2C6A0', torso: '#2142C9', telaTorso: telaSudadera(), telaManga: telaPantalon(false), telaPierna: telaPantalon(true), telaPiernaL: telaPantalon(false), capucha: true, gorro: gorroTejido, gorroY: .14, expr: 'lado' }),
    linda: (o = {}) => avatar({ piel: '#F2C6A0', torso: '#9C6BC7', telaTorso: telaLisa('#9C6BC7', conBotones('#FFFFFF')), pierna: '#8A8E98', tenis: '#F2F2F2', pelo: () => chongo('#8B5A2B', true), gorro: o.sinGorro ? null : () => gorroFiesta('#8B5A2B', '#E8C8A0'), gorroY: .42, gorroRot: .15, expr: 'feliz', caraOpts: { lentes: true } }),
    abuela: (o = {}) => avatar({ piel: '#F0C8A8', torso: '#C9A3C8', telaTorso: telaLisa('#C9A3C8', overol('#C9A3C8', '#B58FD6')), mangas: '#B58FD6', pierna: '#C9A3C8', tenis: '#F2A0C8', suela: '#C87A9E', pelo: () => chongo('#D8D8DC', false), gorro: o.sinGorro ? null : () => gorroFiesta('#7CC36A'), gorroY: .36, gorroRot: -.12, expr: 'feliz', caraOpts: { lentes: true } }),
    nino_gorro: () => avatar({ piel: '#F2C6A0', torso: '#8FD29A', telaTorso: telaLisa('#8FD29A', conBotones('#FFFFFF', '#FFFFFF')), pierna: '#3A4A6A', pelo: () => picos('#E07A2E'), gorro: () => gorroFiesta('#7CC36A'), gorroY: .36, gorroRot: .1, expr: 'feliz', caraOpts: { bocaGrande: true } }),
    kevin: () => avatar({ piel: '#C89270', torso: '#E34B3E', telaTorso: telaLisa('#E34B3E', (x) => { x.strokeStyle = '#FFFFFF'; x.lineWidth = 8; for (const cx of [104, 152]) { x.beginPath(); x.moveTo(cx, 0); x.lineTo(cx, 110); x.stroke(); } x.fillStyle = 'rgba(0,0,0,.15)'; x.fillRect(64, 170, 128, 70); }), capucha: true, pierna: '#6A7486', tenis: '#3A6AD8', suela: '#FFFFFF', gorro: () => gorra('#E34B3E'), gorroY: .17, expr: 'lado' }),
    rubio: () => avatar({ piel: '#F2C6A0', torso: '#9FC4E8', telaTorso: telaLisa('#FFFFFF', overol('#9FC4E8', '#FFFFFF')), mangas: '#FFFFFF', pierna: '#9FC4E8', pelo: () => picos('#F3D06B'), gorro: () => gorroFiesta('#F08A3C'), gorroY: .36, expr: 'sorpresa' }),
    invitado_verde: () => avatar({ piel: '#E0B08A', torso: '#4FA85A', pierna: '#3A3E4A', pelo: () => peloCorto('#5A3A22'), gorro: () => gorroFiesta('#9FD4FF'), gorroY: .3, expr: 'feliz' }),
    invitado_blanco: () => avatar({ piel: '#F2C6A0', torso: '#F4F4F4', telaTorso: telaLisa('#F4F4F4', (x, w) => estrellita(x, w / 2, 130, 64, '#FF7FB8')), pierna: '#4A5A7A', pelo: () => peloCorto('#6A4028'), gorro: () => gorroFiesta('#F2C230'), gorroY: .3, expr: 'feliz' }),
    invitada_amarilla: () => avatar({ piel: '#D8A07A', torso: '#F2D04A', pierna: '#6A5A8A', pelo: () => { const g = new THREE.Group(), m = sm('#F2E2B8', { roughness: 1 }); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.add(M(new THREE.SphereGeometry(.09, 10, 8), m, Math.cos(a) * .24, 0, Math.sin(a) * .24 - .02)); } g.add(M(rbox(.5, .1, .5, .04), m, 0, .02, 0)); return g; }, gorro: () => gorroFiesta('#FF9CC8'), gorroY: .3, expr: 'feliz' }),
    alcalde: () => { const g = avatar({ piel: '#F4F6FA', torso: '#F4F6FA', mangas: '#F4F6FA', pierna: '#F4F6FA', tenis: '#E4E8EE', suela: '#C8CCD4', gorro: sombreroCopa, gorroY: .26, expr: 'lado' }); g.userData.torso.scale.set(1.15, 1, 1.15); return g; },
    pecera,
  };
  window.PUEBLO_P = { crear: (k, o) => CAT[k](o), CAT, avatar, balon, pecera, gorroFiesta, dibujaCara, rbox, sm, M, tex, estrellita };
})();
