/* Serie "Ferry" — piezas reutilizables (parte 1 y 2): personajes low-poly de cabeza redonda y ojos grandes,
   móvil genérico (sin marca) con sus pantallas dibujadas en canvas, mano que lo sostiene, y utilidades.
   Uso: const F = window.F; */
(function () {
  const THREE = window.THREE, N = window.N, { rng, clamp, lerp, prog, ease, easeOut } = N;
  const HDR = (r, g, b) => new THREE.Color(r, g, b);
  const sm = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .7, metalness: 0 }, o));   // sombreado suave
  const M = (geo, mat, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
  function rbox(w, h, d, r = .03, seg = 3) {   // caja de esquinas redondeadas (extrusión)
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: Math.min(r * .5, d * .3), bevelThickness: Math.min(r * .5, d * .3), bevelSegments: seg, curveSegments: 6 }); g.translate(0, 0, -d / 2); return g;
  }

  // ---------- paleta ----------
  const PIEL = ['#F2D0B4', '#E3B38E', '#C98E62', '#A86B44', '#7A4A2C', '#5A3420', '#EDC9A8', '#B97B50'];
  const ROPA = ['#1E2A4A', '#2A3A5C', '#4A3424', '#5A2A30', '#2C2F38', '#3A2A48', '#1F3A3A', '#6A3A2A', '#243050'];
  const PELO = ['#1A1412', '#2E1E14', '#4A2E1A', '#8A5A2A', '#C8A060', '#6A6A6E', '#2A1A2A', '#B04A2A'];
  const PROTA = { piel: '#D9A27A', ropa: '#1E2A4A', pelo: 'corto', colPelo: '#2E1E14' };

  // ---------- personaje: cabeza redonda, ojos grandes, cuerpo de bloques ----------
  const geoCab = new THREE.SphereGeometry(.17, 32, 24), geoOjo = new THREE.SphereGeometry(.045, 20, 14), geoPup = new THREE.SphereGeometry(.027, 16, 12);
  const blanco = sm('#F4F2EE', { roughness: .35 }), negro = sm('#141418', { roughness: .25 });
  function personaje(o = {}) {
    const piel = o.piel || '#C98E62', ropa = o.ropa || '#1E2A4A', colPelo = o.colPelo || '#1A1412', pantalon = o.pantalon || '#22242C';
    const g = new THREE.Group(), pielM = sm(piel, { roughness: .6 }), ropaM = sm(ropa, { roughness: .85 }), pelM = sm(colPelo, { roughness: .9 }), panM = sm(pantalon, { roughness: .85 });
    // cuerpo
    const torso = M(rbox(.4, .46, .24, .06), ropaM, 0, 1.0, 0); g.add(torso);
    const cad = M(rbox(.38, .14, .24, .04), panM, 0, .72, 0); g.add(cad);
    const piernas = []; for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(s * .1, .7, 0); g.add(p); p.add(M(rbox(.15, .62, .17, .04), panM, 0, -.32, 0)); p.add(M(rbox(.16, .08, .26, .03), sm('#141418'), 0, -.66, .04)); piernas.push(p); }
    const brazos = []; for (const s of [-1, 1]) { const b = new THREE.Group(); b.position.set(s * .26, 1.18, 0); g.add(b); b.add(M(rbox(.12, .44, .14, .04), ropaM, 0, -.2, 0)); const mano = M(new THREE.SphereGeometry(.06, 14, 10), pielM, 0, -.45, 0); b.add(mano); brazos.push(b); }
    const cuello = M(new THREE.CylinderGeometry(.06, .07, .08, 12), pielM, 0, 1.26, 0); g.add(cuello);
    // cabeza
    const cabeza = new THREE.Group(); cabeza.position.set(0, 1.45, 0); g.add(cabeza);
    const craneo = M(geoCab, pielM); craneo.scale.set(1, 1.02, .98); cabeza.add(craneo);
    const ojos = []; for (const s of [-1, 1]) { const e = new THREE.Group(); e.position.set(s * .062, .015, .145); cabeza.add(e); const w = M(geoOjo, blanco); w.scale.set(1, 1.15, .55); e.add(w); const pu = M(geoPup, negro, 0, -.004, .02); pu.scale.set(1, 1.15, .6); e.add(pu); const br = M(new THREE.SphereGeometry(.008, 8, 6), sm('#FFFFFF', { emissive: '#FFFFFF', emissiveIntensity: .6 }), .01, .012, .033); e.add(br); ojos.push(e); }
    const boca = M(new THREE.BoxGeometry(.05, .008, .01), sm('#5A2A26'), 0, -.075, .16); cabeza.add(boca);
    for (const s of [-1, 1]) cabeza.add(M(new THREE.SphereGeometry(.03, 10, 8), pielM, s * .168, -.005, 0));   // orejas
    // pelo
    const estilo = o.pelo || 'corto';
    if (estilo !== 'rapado') { const cap = M(new THREE.SphereGeometry(.178, 28, 18, 0, Math.PI * 2, 0, Math.PI * (estilo === 'gorra' ? .45 : .52)), estilo === 'gorra' ? sm(o.colGorra || '#7A2A2A') : pelM); cap.rotation.x = -.35; cap.position.set(0, .01, -.01); cabeza.add(cap);
      if (estilo === 'gorra') { const vis = M(new THREE.CylinderGeometry(.12, .12, .015, 20, 1, false, 0, Math.PI), sm(o.colGorra || '#7A2A2A'), 0, .085, .12); vis.rotation.set(0, Math.PI / 2, 0); vis.rotation.z = -.15; cabeza.add(vis); } }
    if (estilo === 'largo') { const l = M(rbox(.34, .34, .1, .05), pelM, 0, -.12, -.1); cabeza.add(l); }
    if (estilo === 'mono') cabeza.add(M(new THREE.SphereGeometry(.075, 16, 12), pelM, 0, .14, -.13));
    if (estilo === 'rizado') { const rr = rng(5); for (let i = 0; i < 26; i++) { const a = rr() * Math.PI * 2, b = rr() * 1.1; cabeza.add(M(new THREE.SphereGeometry(.05 + rr() * .02, 10, 8), pelM, Math.cos(a) * Math.sin(b) * .17, Math.cos(b) * .17 + .02, Math.sin(a) * Math.sin(b) * .17 - .03)); } }
    if (estilo === 'barba') { const ca = M(new THREE.SphereGeometry(.178, 28, 18, 0, Math.PI * 2, 0, Math.PI * .5), pelM); ca.rotation.x = -.35; cabeza.add(ca); const ba = M(new THREE.SphereGeometry(.12, 16, 12), pelM, 0, -.1, .07); ba.scale.set(1.1, .7, .7); cabeza.add(ba); }
    if (o.traje) { const tm = sm('#ECEEF2', { roughness: .55 }); const cap = M(new THREE.SphereGeometry(.215, 28, 20), tm, 0, .02, -.01); cap.scale.set(1, 1.05, 1); cabeza.add(cap);
      const vis = M(new THREE.SphereGeometry(.17, 28, 16, -Math.PI * .35, Math.PI * .7, Math.PI * .28, Math.PI * .42), sm('#1A2430', { roughness: .08, metalness: .7 }), 0, .02, .07); vis.rotation.y = 0; cabeza.add(vis);
      ojos.forEach(e => e.visible = false); boca.visible = false; }
    g.userData = { cabeza, craneo, pielM, ojos, brazos, piernas, torso, boca };
    // sentado: piernas hacia delante
    g.sentar = () => { piernas.forEach(p => { p.rotation.x = -Math.PI / 2; }); g.position.y = -.25; };
    // cara pálida (gris): k 0..1
    const base = new THREE.Color(piel), gris = new THREE.Color('#B8BCC4');
    g.palido = k => { pielM.color.copy(base).lerp(gris, k); };
    g.mirar = (yaw = 0, pitch = 0) => { cabeza.rotation.set(pitch, yaw, 0); };
    return g;
  }
  function multitud(n, seed = 1, extra = {}) { const r = rng(seed), out = []; const est = ['corto', 'largo', 'mono', 'rapado', 'rizado', 'gorra', 'barba', 'corto'];
    for (let i = 0; i < n; i++) out.push(personaje(Object.assign({ piel: PIEL[Math.floor(r() * PIEL.length)], ropa: ROPA[Math.floor(r() * ROPA.length)], colPelo: PELO[Math.floor(r() * PELO.length)], pelo: est[Math.floor(r() * est.length)], colGorra: ['#7A2A2A', '#2A3A6A', '#C8A040'][i % 3] }, extra)));
    return out; }

  // ---------- el móvil (genérico) con su pantalla en canvas ----------
  const SW = 600, SH = 1300;
  function movil() {
    const g = new THREE.Group(), w = .075, h = .162;
    const cuerpo = M(rbox(w, h, .008, .011, 4), sm('#16181E', { roughness: .3, metalness: .6 })); g.add(cuerpo);
    const marco = M(rbox(w + .0012, h + .0012, .0062, .0115, 4), sm('#6A6E78', { roughness: .25, metalness: .9 })); g.add(marco);
    const cv = document.createElement('canvas'); cv.width = SW; cv.height = SH; const ctx = cv.getContext('2d'); const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(w - .004, h - .004), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.z = .0072; g.add(scr);
    const brillo = new THREE.Mesh(new THREE.PlaneGeometry(w - .004, h - .004), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: .05, depthWrite: false })); brillo.position.z = .0074; g.add(brillo);
    const cam = M(new THREE.CylinderGeometry(.0035, .0035, .002, 16), sm('#050506')); cam.rotation.x = Math.PI / 2; cam.position.set(0, h / 2 - .007, .0076); g.add(cam);
    const P = pantalla(ctx, SW, SH);
    return { grp: g, ctx, tex, dibujar: (estado, o) => { P(estado, o); tex.needsUpdate = true; } };
  }

  // fondo de bloqueo: atardecer morado-naranja con palmeras en silueta (se pinta una vez)
  const fondoBloq = (() => { const c = document.createElement('canvas'); c.width = SW; c.height = SH; const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 0, SH); gr.addColorStop(0, '#2A1A5A'); gr.addColorStop(.35, '#6A2E86'); gr.addColorStop(.58, '#D0587A'); gr.addColorStop(.72, '#F48A4A'); gr.addColorStop(.76, '#F8B060'); gr.addColorStop(.761, '#3A2A5A'); gr.addColorStop(1, '#1A1236'); x.fillStyle = gr; x.fillRect(0, 0, SW, SH);
    x.fillStyle = 'rgba(255,214,140,.95)'; x.beginPath(); x.arc(SW * .5, SH * .735, 84, Math.PI, 0); x.fill();
    x.fillStyle = 'rgba(255,190,120,.35)'; for (let i = 0; i < 9; i++) x.fillRect(SW * .5 - 70 + i * 3, SH * .77 + i * 16, 140 - i * 6, 5);
    const palma = (bx, by, hh, lean, s) => { x.strokeStyle = '#120A1E'; x.fillStyle = '#120A1E'; x.lineWidth = 16 * s; x.lineCap = 'round'; x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(bx + lean * .3, by - hh * .5, bx + lean, by - hh); x.stroke();
      const tx = bx + lean, ty = by - hh; for (let k = 0; k < 7; k++) { const a = -Math.PI * .95 + k * Math.PI / 6.5; x.beginPath(); x.moveTo(tx, ty); const ex = tx + Math.cos(a) * 150 * s, ey = ty + Math.sin(a) * 60 * s + 60 * s; x.quadraticCurveTo(tx + Math.cos(a) * 80 * s, ty + Math.sin(a) * 90 * s - 10, ex, ey); x.lineWidth = 12 * s; x.stroke(); } };
    palma(70, SH * .9, 520, 60, 1); palma(150, SH * .93, 380, -30, .75); palma(540, SH * .92, 470, -70, .95);
    x.fillStyle = '#120A1E'; x.fillRect(0, SH * .9, SW, SH * .1); return c; })();
  const rr = (x, X, Y, W, H, R) => { x.beginPath(); x.roundRect(X, Y, W, H, R); };
  function barra(x, hora) { x.fillStyle = '#fff'; x.font = '700 34px Nunito, sans-serif'; x.textAlign = 'left'; x.fillText(hora, 46, 62);
    for (let i = 0; i < 4; i++) { x.fillRect(SW - 168 + i * 13, 54 - i * 7, 9, 10 + i * 7); } x.strokeStyle = '#fff'; x.lineWidth = 3; rr(x, SW - 106, 38, 54, 26, 7); x.stroke(); x.fillRect(SW - 102, 42, 38, 18); x.fillRect(SW - 50, 46, 4, 10); }
  function pantalla(x, W, H) {
    return function (estado, o = {}) {
      x.save(); x.clearRect(0, 0, W, H);
      x.drawImage(fondoBloq, 0, 0);
      if (estado === 'negro') { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.restore(); return; }
      if (o.oscurecer) { x.fillStyle = `rgba(6,6,14,${o.oscurecer})`; x.fillRect(0, 0, W, H); }
      barra(x, '');
      // candado, fecha, hora gigante, año en cápsula
      x.textAlign = 'center'; x.fillStyle = '#fff';
      x.strokeStyle = '#fff'; x.lineWidth = 5; x.beginPath(); x.arc(W / 2, 128, 16, Math.PI, 0); x.stroke(); rr(x, W / 2 - 22, 128, 44, 32, 6); x.fill();
      x.font = '700 40px Nunito, sans-serif'; x.fillText(o.fecha || 'domingo, 14 de junio', W / 2, 232);
      x.font = '900 196px Nunito, sans-serif'; x.fillText(o.hora || '07:15', W / 2, 420);
      // cápsula del año con números que ruedan
      const anio = o.anio != null ? o.anio : 2026, cw = 210, ch = 76, cx = W / 2 - cw / 2, cy = 452;
      x.fillStyle = 'rgba(10,8,22,.62)'; rr(x, cx, cy, cw, ch, 38); x.fill();
      x.save(); rr(x, cx, cy, cw, ch, 38); x.clip(); x.font = '900 54px Nunito, sans-serif'; x.fillStyle = '#fff';
      const ent = Math.floor(anio), fr = anio - ent, sig = ent + 1, sa = String(ent), sb = String(sig);
      const dw = 31, x0 = W / 2 - dw * 1.5;
      for (let i = 0; i < 4; i++) { const cambia = sa[i] !== sb[i] && fr > 0, off = cambia ? fr * ch : 0; x.fillText(sa[i], x0 + i * dw, cy + 57 - off); if (cambia) x.fillText(sb[i], x0 + i * dw, cy + 57 - off + ch); }
      x.restore();
      // "+7 AÑOS" con pop
      if (o.mas7 > 0) { const k = o.mas7, s = k < .6 ? easeOut(k / .6) * 1.15 : 1.15 - .15 * ease((k - .6) / .4); x.save(); x.translate(W / 2, 590); x.scale(s, s);
        x.fillStyle = '#E8262E'; rr(x, -118, -38, 236, 76, 38); x.fill(); x.fillStyle = '#fff'; x.font = '900 46px Nunito, sans-serif'; x.fillText(o.textoRojo || '+7 AÑOS', 0, 16); x.restore(); }
      if (estado === 'control') { x.fillStyle = 'rgba(14,14,24,.72)'; x.fillRect(0, 0, W, H);
        const tile = (X0, Y0, w, h, on, col, dib) => { x.fillStyle = on ? col : 'rgba(60,60,72,.85)'; rr(x, X0, Y0, w, h, 34); x.fill(); x.save(); x.translate(X0 + w / 2, Y0 + h / 2); x.fillStyle = '#fff'; x.strokeStyle = '#fff'; x.lineWidth = 7; x.lineCap = 'round'; dib(); x.restore(); };
        const k = o.toque || 0, pulso = k > 0 && k < 1 ? 1 + .08 * Math.sin(k * Math.PI) : 1;
        tile(50, 230, 236, 236, true, '#F2A23A', () => { x.beginPath(); x.moveTo(-34, 30); x.lineTo(34, -30); x.stroke(); x.beginPath(); x.ellipse(0, 0, 16, 40, .8, 0, 7); x.stroke(); });
        x.save(); x.translate(168 + 146, 348); x.scale(pulso, pulso); x.translate(-168 - 146, -348);
        tile(314, 230, 236, 236, k >= .5, '#2EC85A', () => { for (let i = 0; i < 4; i++) x.fillRect(-46 + i * 26, 30 - i * 18, 18, 18 + i * 18); }); x.restore();
        tile(50, 494, 236, 236, true, '#2A7AF2', () => { x.beginPath(); x.arc(0, 26, 6, 0, 7); x.fill(); for (let i = 1; i < 4; i++) { x.beginPath(); x.arc(0, 26, i * 20, -Math.PI * .78, -Math.PI * .22); x.stroke(); } });
        tile(314, 494, 236, 236, true, '#2A7AF2', () => { x.beginPath(); x.moveTo(-16, -30); x.lineTo(18, 0); x.lineTo(-2, 16); x.lineTo(-2, -40); x.lineTo(18, -20); x.lineTo(-16, 10); x.stroke(); });
        x.fillStyle = 'rgba(60,60,72,.85)'; rr(x, 50, 758, 500, 110, 34); x.fill(); x.fillStyle = '#fff'; x.font = '800 36px Nunito, sans-serif'; x.textAlign = 'left'; x.fillText(k >= .5 ? 'Datos móviles: activados' : 'Datos móviles', 90, 826);
        x.fillStyle = 'rgba(60,60,72,.85)'; rr(x, 50, 896, 236, 300, 34); x.fill(); rr(x, 314, 896, 236, 300, 34); x.fill(); x.fillStyle = '#fff'; rr(x, 50, 1046, 236, 150, 34); x.fill(); rr(x, 314, 1086, 236, 110, 34); x.fill();
        x.restore(); return; }
      // red: cápsula "Buscando red" con indicador
      if (o.red > 0) { x.save(); x.globalAlpha = Math.min(1, o.red); x.fillStyle = 'rgba(12,12,24,.82)'; rr(x, W / 2 - 170, 650, 340, 80, 40); x.fill(); x.fillStyle = '#fff'; x.font = '800 36px Nunito, sans-serif'; x.textAlign = 'left'; x.fillText('Buscando red', W / 2 - 92, 703);
        x.strokeStyle = '#fff'; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); const a0 = (o.t || 0) * 7; x.arc(W / 2 - 128, 690, 18, a0, a0 + 4.2); x.stroke(); x.restore(); }
      // notificaciones apiladas + contador rojo
      if (o.notifs && o.notifs.length) {
        if (o.contador != null) { x.fillStyle = '#E8262E'; rr(x, W / 2 - 170, 640, 340, 70, 35); x.fill(); x.fillStyle = '#fff'; x.font = '900 40px Nunito, sans-serif'; x.textAlign = 'center'; x.fillText(o.contador.toLocaleString('es-ES') + ' mensajes', W / 2, 689); }
        o.notifs.forEach((nf, i) => { const y = 740 + i * 128 + (nf.dy || 0); if (y > H - 80) return; x.save(); x.globalAlpha = nf.a != null ? nf.a : 1;
          x.fillStyle = 'rgba(240,240,248,.88)'; rr(x, 30, y, W - 60, 112, 26); x.fill();
          x.fillStyle = '#2EC85A'; rr(x, 50, y + 22, 66, 66, 16); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(83, y + 52, 21, 17, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(70, y + 62); x.lineTo(64, y + 76); x.lineTo(80, y + 66); x.fill();
          x.textAlign = 'left'; x.fillStyle = '#16161C'; x.font = '800 30px Nunito, sans-serif'; x.fillText(nf.de, 134, y + 46); x.font = '600 28px Nunito, sans-serif'; x.fillStyle = '#33333C'; x.fillText(nf.txt, 134, y + 86);
          x.textAlign = 'right'; x.fillStyle = '#6A6A74'; x.font = '600 24px Nunito, sans-serif'; x.fillText(nf.hace, W - 52, y + 44); x.restore(); });
      }
      // notificación grande (mensaje desde tu número)
      if (o.propio > 0) { const k = o.propio, y = 660 - (1 - easeOut(k)) * 120; x.save(); x.globalAlpha = Math.min(1, k * 1.5);
        x.fillStyle = 'rgba(244,244,250,.95)'; rr(x, 26, y, W - 52, 330, 30); x.fill();
        x.fillStyle = '#2EC85A'; rr(x, 50, y + 26, 54, 54, 14); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.ellipse(77, y + 51, 17, 14, 0, 0, 7); x.fill();
        x.textAlign = 'left'; x.fillStyle = '#5A5A66'; x.font = '800 26px Nunito, sans-serif'; x.fillText('MENSAJES', 120, y + 62); x.textAlign = 'right'; x.fillText('ahora', W - 54, y + 62);
        x.textAlign = 'left'; x.fillStyle = '#16161C'; x.font = '900 36px Nunito, sans-serif'; x.fillText('Tú', 52, y + 126); x.font = '700 30px Nunito, sans-serif'; x.fillStyle = '#33333C'; x.fillText('+34 6' + '12 418 307', 112, y + 125);
        if (o.circulo > 0) { x.strokeStyle = '#E8262E'; x.lineWidth = 6; x.beginPath(); x.ellipse(232, y + 114, 140, 34, -.03, 0, Math.PI * 2 * Math.min(1, o.circulo)); x.stroke(); x.fillStyle = '#E8262E'; x.font = '800 24px Nunito, sans-serif'; x.globalAlpha = Math.min(1, o.circulo * 2) * Math.min(1, k * 1.5); x.fillText('(este número es el tuyo)', 112, y + 172); x.globalAlpha = Math.min(1, k * 1.5); }
        x.fillStyle = '#16161C'; x.font = '700 34px Nunito, sans-serif'; x.fillText('No vuelvas a casa.', 52, y + 238); x.fillText('Ya estoy cenando con mamá.', 52, y + 282); x.restore(); }
      x.restore();
    };
  }

  // ---------- mano low-poly que sostiene el móvil (desde abajo) ----------
  function mano(piel = PROTA.piel, manga = PROTA.ropa) {
    // la mano sostiene el móvil por detrás y por abajo: solo asoman las puntas de los dedos (derecha) y el pulgar (izquierda, abajo)
    const g = new THREE.Group(), pm = sm(piel, { roughness: .6 }), mm = sm(manga, { roughness: .85 });
    const palma = M(rbox(.07, .08, .022, .018), pm, .006, -.062, -.018); palma.rotation.z = -.12; g.add(palma);
    const pulgar = M(rbox(.015, .042, .014, .0065), pm, -.043, -.07, .001); pulgar.rotation.z = -.75; g.add(pulgar);
    for (let i = 0; i < 4; i++) { const f = M(rbox(.016, .03, .014, .0065), pm, .039, -.048 + i * .019, -.006); f.rotation.z = .5; g.add(f); }
    const mun = M(new THREE.CylinderGeometry(.026, .03, .11, 16), pm, .012, -.13, -.03); mun.rotation.set(.3, 0, -.15); g.add(mun);
    const mg = M(new THREE.CylinderGeometry(.038, .042, .2, 16), mm, .03, -.26, -.07); mg.rotation.set(.3, 0, -.15); g.add(mg);
    return g;
  }

  // ---------- mano con el índice estirado (para tocar la pantalla) ----------
  function dedo(piel = PROTA.piel, manga = PROTA.ropa) {
    const g = new THREE.Group(), pm = sm(piel, { roughness: .6 }), mm = sm(manga, { roughness: .85 });
    const ind = M(rbox(.018, .075, .017, .008), pm, 0, .03, 0); g.add(ind);
    const puno = M(rbox(.075, .07, .045, .02), pm, .018, -.035, -.012); g.add(puno);
    const mg = M(new THREE.CylinderGeometry(.036, .04, .22, 16), mm, .03, -.18, -.02); mg.rotation.z = -.15; g.add(mg);
    return g;
  }

  // ---------- el ferry: casco blanco con franja roja, cubiertas con ventanas encendidas ----------
  function barco() {
    const g = new THREE.Group(), L = 40, B = 7;
    const casco = new THREE.Shape(); casco.moveTo(-L / 2, -B / 2); casco.lineTo(L / 2 - 7, -B / 2); casco.quadraticCurveTo(L / 2 - 1, -B / 2 + .6, L / 2, 0); casco.quadraticCurveTo(L / 2 - 1, B / 2 - .6, L / 2 - 7, B / 2); casco.lineTo(-L / 2, B / 2); casco.lineTo(-L / 2, -B / 2);
    const ex = (h, mat, y, sc = 1) => { const geo = new THREE.ExtrudeGeometry(casco, { depth: h, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); const m = M(geo, mat, 0, y, 0); m.scale.set(sc, 1, sc); g.add(m); return m; };
    ex(1.2, sm('#1A1C24', { roughness: .6 }), -.8);      // obra viva (bajo el agua)
    ex(.9, sm('#EEF0F2', { roughness: .5 }), .4); ex(.55, sm('#D8262E', { roughness: .45 }), 1.3); ex(1.6, sm('#F2F4F6', { roughness: .5 }), 1.85);
    const ventM = new THREE.MeshBasicMaterial({ color: HDR(1.6, 1.4, 1.0), toneMapped: false }), ventO = sm('#1C2230', { roughness: .2, metalness: .5 });
    for (let d = 0; d < 3; d++) { const w = L * (.78 - d * .12), b = B * (.92 - d * .06), y = 3.45 + d * 1.5, x0 = -L * .08 - d * 1.2;
      g.add(M(new THREE.BoxGeometry(w, 1.5, b), sm('#F4F6F8', { roughness: .5 }), x0, y + .75, 0));
      for (let i = 0; i < w / .9 - 1; i++) { const lit = ((i * 7 + d * 3) % 5) !== 0; for (const s of [-1, 1]) { const v = new THREE.Mesh(new THREE.PlaneGeometry(.55, .55), lit ? ventM : ventO); v.position.set(x0 - w / 2 + .7 + i * .9, y + .8, s * (b / 2 + .01)); v.rotation.y = s > 0 ? 0 : Math.PI; g.add(v); } }
      for (let j = 0; j < 6; j++) { const fv = new THREE.Mesh(new THREE.PlaneGeometry(b * .11, .5), (j + d) % 3 ? ventM : ventO); fv.position.set(x0 + w / 2 + .01, y + .8, -b * .38 + j * b * .152); fv.rotation.y = Math.PI / 2; g.add(fv); } }
    const puente = M(new THREE.BoxGeometry(3, 1.2, B * 1.05), sm('#F4F6F8'), 4.2, 8.6, 0); g.add(puente); const pv = new THREE.Mesh(new THREE.PlaneGeometry(B * .95, .6), new THREE.MeshBasicMaterial({ color: HDR(1.0, 1.4, 1.8), toneMapped: false })); pv.position.set(5.71, 8.7, 0); pv.rotation.y = Math.PI / 2; g.add(pv);
    const chim = M(new THREE.CylinderGeometry(1.0, 1.25, 3, 16), sm('#F2F4F6'), -8, 10, 0); g.add(chim); g.add(M(new THREE.CylinderGeometry(1.02, 1.02, .7, 16), sm('#D8262E'), -8, 10.9, 0)); g.add(M(new THREE.CylinderGeometry(1.03, 1.03, .35, 16), sm('#1A1C24'), -8, 11.55, 0));
    g.add(M(new THREE.CylinderGeometry(.06, .06, 4, 6), sm('#C8CCD4'), 3.5, 11, 0));
    const luces = []; for (const [x, y, z, c] of [[19.5, 2.2, 0, '#FFFFFF'], [3.5, 13, 0, '#FFFFFF'], [4.2, 9.4, B * .55, '#3AFF5A'], [4.2, 9.4, -B * .55, '#FF3A3A'], [-19.8, 3, 0, '#FFFFFF']]) { const l = N.glow(c, 1.6, .95); l.material.fog = false; l.position.set(x, y, z); g.add(l); luces.push(l); }
    for (let i = 0; i < 9; i++) for (const s of [-1, 1]) { const l = N.glow('#FFE2B0', .7, .7); l.position.set(-16 + i * 3.5, 3.2, s * (B / 2 + .2)); g.add(l); }
    g.userData = { L, B, luces }; return g;
  }

  // ---------- retratos tipo polaroid (atlas 8x8) en el mismo estilo ----------
  function atlasRetratos(seed = 3, prota = 27) {
    const n = 8, cs = 160, c = document.createElement('canvas'); c.width = c.height = n * cs; const x = c.getContext('2d'), r = rng(seed);
    for (let k = 0; k < n * n; k++) { const ox = (k % n) * cs, oy = Math.floor(k / n) * cs, esP = k === prota;
      const fondo = ['#6A8AB0', '#8AA06A', '#B08A6A', '#7A6AA0', '#A0A0A8', '#6AA0A0', '#C09060'][Math.floor(r() * 7)];
      x.fillStyle = fondo; x.fillRect(ox, oy, cs, cs);
      const piel = esP ? PROTA.piel : PIEL[Math.floor(r() * PIEL.length)], pelo = esP ? PROTA.colPelo : PELO[Math.floor(r() * PELO.length)], ropa = esP ? PROTA.ropa : ROPA[Math.floor(r() * ROPA.length)], est = esP ? 0 : Math.floor(r() * 5);
      x.fillStyle = ropa; x.beginPath(); x.ellipse(ox + cs / 2, oy + cs + 10, 62, 50, 0, 0, 7); x.fill();
      if (est === 2) { x.fillStyle = pelo; x.fillRect(ox + cs / 2 - 46, oy + 60, 92, 70); }
      x.fillStyle = piel; x.beginPath(); x.arc(ox + cs / 2, oy + 76, 44, 0, 7); x.fill();
      x.fillStyle = pelo; if (est !== 4) { x.beginPath(); x.arc(ox + cs / 2, oy + 70, 46, Math.PI * 1.02, Math.PI * 1.98); x.fill(); }
      if (est === 3) { x.beginPath(); x.arc(ox + cs / 2, oy + 26, 18, 0, 7); x.fill(); }
      for (const s of [-1, 1]) { x.fillStyle = '#F6F4F0'; x.beginPath(); x.ellipse(ox + cs / 2 + s * 16, oy + 80, 10, 12, 0, 0, 7); x.fill(); x.fillStyle = '#141418'; x.beginPath(); x.ellipse(ox + cs / 2 + s * 16, oy + 81, 6, 7, 0, 0, 7); x.fill(); }
      x.fillStyle = '#5A2A26'; x.fillRect(ox + cs / 2 - 7, oy + 102, 14, 3); }
    return { canvas: c, n, prota };
  }

  window.F = { HDR, sm, M, rbox, PIEL, ROPA, PELO, PROTA, personaje, multitud, movil, mano, dedo, barco, atlasRetratos, SW, SH };
})();
