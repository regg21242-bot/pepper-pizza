/* Serie "Luna" — escenarios y orden de la parte 1.  window.ESC.crear(renderer, T) → { lista, miniaturas } */
(function () {
  const THREE = window.THREE, N = window.N, L = window.L, { rng, clamp, lerp, prog, ease, easeOut } = N, { HDR, CIAN, ROJO, sm, M, rbox, cv, glow, rr, logo } = L;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const nueva = (bg = '#07080E') => { const s = new THREE.Scene(); s.background = new THREE.Color(bg); return s; };
  const camara = (fov = 40) => new THREE.PerspectiveCamera(fov, 1080 / 1920, .01, 900);
  const mira = (cam, p, l, fov) => { cam.position.copy(p); cam.lookAt(l); if (fov) cam.fov = fov; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); };
  const FONT = (w, s) => `${w} ${s}px Nunito, sans-serif`;
  const MANO = (s) => `italic 700 ${s}px "Comic Sans MS", "Segoe Print", "Bradley Hand", Nunito, cursive`;

  // ================= escenas 2D (interfaz): un plano con canvas animado y cámara que se acerca =================
  function escUI(draw, o = {}) {
    const scene = nueva(o.bg || '#05060A'), cam = camara(40);
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const x = c.getContext('2d'); const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.92), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scene.add(pl);
    const d0 = 1.92 / 2 / Math.tan(20 * Math.PI / 180);
    const e = { scene, cam, upd: t => { const k = prog(t, e.a, e.b); x.clearRect(0, 0, 1080, 1920); draw(x, t, k); tex.needsUpdate = true;
      const z = d0 * lerp(o.z0 || 1.0, o.z1 || .9, ease(k)); mira(cam, V3(o.dx ? o.dx * (k - .5) : 0, 0, z), V3(0, 0, 0)); pl.rotation.set(o.rx || 0, o.ry ? o.ry * (k - .5) : 0, 0); },
      post: () => Object.assign({ focus: d0, ap: 0, bloom: .9, umbral: .95 }, o.post || {}) };
    return e;
  }

  // ================= ático: ventanal + ciudad, altavoz, lámpara de arco, sofá, madera, cámaras domo, pantalla =================
  function escAtico(T, o = {}) {
    const scene = nueva('#06070C'), cam = camara(o.fov || 36);
    scene.add(new THREE.HemisphereLight('#4A5A9A', '#120C0A', .35));
    // ventanal (pared z = -2) con la ciudad enorme detrás
    const ciudad = new THREE.Mesh(new THREE.PlaneGeometry(260, 130), new THREE.MeshBasicMaterial({ map: L.texCiudad(), color: HDR(1.25, 1.2, 1.25), toneMapped: false })); ciudad.position.set(0, -19.5, -70); scene.add(ciudad);
    const marcoM = sm('#101114', { roughness: .5, metalness: .4 });
    for (let i = -3; i <= 3; i++) scene.add(M(new THREE.BoxGeometry(.05, 3.2, .08), marcoM, i * 1.1, 1.6, -2));
    scene.add(M(new THREE.BoxGeometry(8, .08, .1), marcoM, 0, .02, -2)); scene.add(M(new THREE.BoxGeometry(8, .1, .1), marcoM, 0, 3.15, -2));
    const vidrio = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.2), new THREE.MeshBasicMaterial({ color: '#8AA4D8', transparent: true, opacity: .05, depthWrite: false })); vidrio.position.set(0, 1.6, -2.01); scene.add(vidrio);
    // suelo, techo, pared de madera (izquierda) con listones verticales
    scene.add(M(new THREE.PlaneGeometry(14, 10).rotateX(-Math.PI / 2), sm('#17120E', { roughness: .35, metalness: .1 }), 0, 0, 2));
    scene.add(M(new THREE.PlaneGeometry(14, 10).rotateX(Math.PI / 2), sm('#0D0D10', { roughness: .9 }), 0, 3.2, 2));
    const madT = cv(1024, 512, (x, w, h) => { const r = rng(5); for (let i = 0; i < w; i += 32) { const v = 70 + r() * 30; x.fillStyle = `rgb(${v + 30 | 0},${v * .62 | 0},${v * .38 | 0})`; x.fillRect(i, 0, 28, h); x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(i + 28, 0, 4, h); for (let j = 0; j < 30; j++) { x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(i + r() * 28, 0, 1.5, h); } } });
    madT.wrapS = THREE.RepeatWrapping; madT.repeat.set(2, 1);
    const pared = M(new THREE.PlaneGeometry(8, 3.2), sm('#FFFFFF', { map: madT, roughness: .7 }), -3.6, 1.6, 1.5); pared.rotation.y = Math.PI / 2; scene.add(pared);
    // pantalla en la pared de madera (logo, calendario, charla)
    const pc = document.createElement('canvas'); pc.width = 1280; pc.height = 720; const px = pc.getContext('2d'); const ptex = new THREE.CanvasTexture(pc); ptex.encoding = THREE.sRGBEncoding;
    const pant = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .9), new THREE.MeshBasicMaterial({ map: ptex, toneMapped: false })); pant.rotation.y = Math.PI / 2; pant.position.set(-3.57, 1.75, 1.2); scene.add(pant);
    scene.add(M(new THREE.BoxGeometry(.04, .96, 1.66), sm('#08080A', { roughness: .3 }), -3.6, 1.75, 1.2));
    const pantL = new THREE.PointLight(CIAN, .0, 3, 1.5); pantL.position.set(-3.1, 1.75, 1.2); scene.add(pantL);
    // lámpara de arco con cono de luz cálida
    const lamp = new THREE.Group(); lamp.position.set(-2.2, 0, -.6); scene.add(lamp); const metal = sm('#2A2620', { metalness: .7, roughness: .35 });
    lamp.add(M(new THREE.CylinderGeometry(.22, .24, .05, 32), sm('#1A1A1E', { metalness: .4 }), 0, .025, 0));
    const curva = new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(.05, 1.4, 0), V3(.5, 2.3, 0), V3(1.2, 2.45, 0), V3(1.7, 2.15, 0)]); lamp.add(M(new THREE.TubeGeometry(curva, 40, .018, 8), metal));
    const pant2 = M(new THREE.ConeGeometry(.2, .22, 32, 1, true), sm('#C8A060', { side: THREE.DoubleSide, metalness: .6, roughness: .3, emissive: '#3A2410' }), 1.7, 2.05, 0); lamp.add(pant2);
    const foco = new THREE.SpotLight('#FFB868', 6, 6, .55, .6, 1.3); foco.position.set(1.7, 2.0, 0); foco.target.position.set(1.9, 0, .2); foco.castShadow = true; foco.shadow.mapSize.set(1024, 1024); lamp.add(foco, foco.target);
    const bombi = glow('#FFC880', .35, .9); bombi.position.set(1.7, 1.95, 0); lamp.add(bombi);
    const conoV = new THREE.Mesh(new THREE.ConeGeometry(1.0, 2.0, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#FFB060', transparent: true, opacity: .05, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); conoV.position.set(1.7, 1.0, 0); lamp.add(conoV);
    // sofá oscuro
    const sofa = new THREE.Group(); sofa.position.set(-1.0, 0, .9); sofa.rotation.y = .35; scene.add(sofa); const tela = sm('#1C1A1E', { roughness: .95 });
    sofa.add(M(rbox(2.2, .4, .9, .1), tela, 0, .3, 0)); sofa.add(M(rbox(2.2, .55, .22, .1), tela, 0, .7, -.36)); for (const s of [-1, 1]) sofa.add(M(rbox(.22, .5, .9, .08), tela, s * 1.1, .45, 0));
    for (const s of [-1, 1]) sofa.add(M(rbox(.9, .14, .7, .06), sm('#26222A', { roughness: .95 }), s * .48, .56, .05));
    // mesa baja junto al ventanal con el altavoz
    const mesa = M(rbox(.7, .45, .45, .04), sm('#0A0A0C', { roughness: .35, metalness: .3 }), .6, .225, -1.35); scene.add(mesa);
    const alt = L.altavoz(1); alt.position.set(.6, .45, -1.35); scene.add(alt);
    // cámaras domo en el techo
    const domos = [[.6, 3.18, -1.0], [-2.4, 3.18, .4], [2.4, 3.18, .2]].map(p => { const d = L.domo(); d.position.set(...p); scene.add(d); return d; });
    // luz ambiente fría de la ciudad
    const cityL = new THREE.DirectionalLight('#6A7AC8', .55); cityL.position.set(1, 2, -6); scene.add(cityL);
    const relleno = new THREE.PointLight('#FFB070', .0, 8, 1.4); relleno.position.set(0, 2.5, 2); scene.add(relleno);
    function pintaPantalla(modo, t, k) { px.fillStyle = '#05070C'; px.fillRect(0, 0, 1280, 720); pantL.intensity = modo ? .8 : 0;
      if (modo === 'logo') { logo(px, 640, 300, 170 * (.9 + .1 * easeOut(k * 3))); px.fillStyle = CIAN; px.font = FONT(900, 92); px.textAlign = 'center'; px.shadowColor = CIAN; px.shadowBlur = 30; px.globalAlpha = clamp(k * 3 - .3); px.fillText('LUNA', 640, 600); px.globalAlpha = 1; px.shadowBlur = 0; }
      if (modo === 'cal') { logo(px, 120, 110, 50); px.fillStyle = CIAN; px.font = FONT(900, 68); px.textAlign = 'left'; px.fillText('30 DÍAS', 200, 132);
        for (let i = 0; i < 30; i++) { const cx = 150 + (i % 10) * 104, cy = 230 + Math.floor(i / 10) * 140, on = i < Math.floor(k * 34); px.strokeStyle = on ? CIAN : 'rgba(63,230,242,.35)'; px.lineWidth = 4; rr(px, cx - 42, cy - 50, 84, 100, 14); px.stroke(); if (on) { px.fillStyle = 'rgba(63,230,242,.18)'; px.fill(); }
          px.fillStyle = on ? '#E8FFFF' : 'rgba(200,240,255,.5)'; px.font = FONT(800, 40); px.textAlign = 'center'; px.fillText(String(i + 1), cx, cy + 14); } }
      if (modo === 'charla') { logo(px, 640, 220, 120); px.fillStyle = '#FFFFFF'; px.font = FONT(900, 150); px.textAlign = 'center'; px.fillText('23:10', 640, 520); px.fillStyle = CIAN; px.font = FONT(900, 52); px.fillText('CHARLA DE ESTA NOCHE', 640, 620); }
      ptex.needsUpdate = true; }
    const e = { scene, cam, alt, domos, foco, relleno, pintaPantalla, upd: t => { o.upd && o.upd(t, e); }, post: () => Object.assign({ focus: 2.5, ap: .25, bloom: 1.1, umbral: .9 }, o.post ? o.post(e.t) : {}) };
    e.upd = t => { e.t = t; o.upd(t, e); }; return e;
  }

  // ================= torre en ilustración plana (atardecer / noche, ventanas que se apagan) =================
  function dibujaTorre(x, W, H, o) { const noche = o.noche, r = rng(7);
    const g = x.createLinearGradient(0, 0, 0, H); if (noche) { g.addColorStop(0, '#04050E'); g.addColorStop(.6, '#0E1030'); g.addColorStop(1, '#1A1236'); } else { g.addColorStop(0, '#2A1650'); g.addColorStop(.45, '#7A3A86'); g.addColorStop(.75, '#E86A5A'); g.addColorStop(1, '#F8A050'); }
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    if (!noche) { x.fillStyle = 'rgba(255,220,150,.9)'; x.beginPath(); x.arc(W * .78, H * .8, 130, 0, 7); x.fill(); }
    else for (let i = 0; i < 120; i++) { x.fillStyle = `rgba(220,230,255,${r() * .7})`; x.fillRect(r() * W, r() * H * .6, 2, 2); }
    // edificios de fondo
    for (let i = 0; i < 12; i++) { const w = 140 + r() * 160, h = 500 + r() * 1100, X = i * 180 - 60; x.fillStyle = noche ? '#0B0D1C' : '#3A2448'; x.fillRect(X, H - h, w, h);
      for (let yy = H - h + 30; yy < H; yy += 50) for (let xx = X + 20; xx < X + w - 20; xx += 40) if (r() < .4) { x.fillStyle = noche ? 'rgba(255,200,120,.35)' : 'rgba(255,190,140,.35)'; x.fillRect(xx, yy, 18, 24); } }
    // la torre
    const tw = 700, tx = W / 2 - tw / 2, top = 520, pisos = 34, ph = (H - top - 160) / pisos;
    x.fillStyle = noche ? '#12142A' : '#4A2E5A'; x.fillRect(tx, top + 160, tw, H - top - 160); x.fillStyle = noche ? '#0C0E1E' : '#3A2248'; x.fillRect(tx + tw - 60, top + 160, 60, H - top - 160);
    const off = o.off != null ? o.off : -1;
    for (let p = 0; p < pisos; p++) { const y = top + 160 + p * ph + 12, nivel = pisos - p;   // nivel 1 = planta baja
      for (let c = 0; c < 9; c++) { const X = tx + 36 + c * 76, enc = off < 0 || nivel > off; const cols = ['#F6E6C4', '#F8C878', '#A8D4F0', '#F2D49A'];
        x.fillStyle = enc ? cols[Math.floor(r() * 4)] : '#0A0B16'; x.globalAlpha = enc ? (noche ? .9 : .85) : 1; x.fillRect(X, y, 52, ph - 24); x.globalAlpha = 1; } }
    // ático con ventanal dorado
    x.fillStyle = noche ? '#16182E' : '#4A2E5A'; x.fillRect(tx + 60, top, tw - 120, 170);
    x.fillStyle = '#FFD27A'; x.shadowColor = '#FFB040'; x.shadowBlur = 60; x.fillRect(tx + 90, top + 30, tw - 180, 110); x.shadowBlur = 0;
    x.fillStyle = 'rgba(40,24,10,.5)'; for (let i = 1; i < 6; i++) x.fillRect(tx + 90 + i * (tw - 180) / 6, top + 30, 6, 110);
    x.fillStyle = noche ? '#0C0E1E' : '#2E1A3A'; x.fillRect(tx + 40, top - 14, tw - 80, 20);
  }
  function escTorre(T, o = {}) { const W = 2160, H = 3840; const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    const scene = nueva('#05060A'), cam = camara(40); const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.16, 3.84), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scene.add(pl);
    const d0 = 1.92 / 2 / Math.tan(20 * Math.PI / 180); let last = null;
    const e = { scene, cam, upd: t => { const k = prog(t, e.a, e.b); const st = o.estado(t, k); const key = JSON.stringify(st); if (key !== last) { x.clearRect(0, 0, W, H); dibujaTorre(x, W, H, st); tex.needsUpdate = true; last = key; }
      const z = o.zoom(k), cy = o.cy ? o.cy(k) : 0; mira(cam, V3(0, cy, d0 * z), V3(0, cy, 0)); }, post: () => ({ focus: d0, ap: 0, bloom: 1.0, umbral: .85 }) };
    return e; }

  // ================= multitud gris con una silueta bajo un foco cian =================
  function escFoco(T, o = {}) { const scene = nueva('#06070C'), cam = camara(38);
    scene.add(new THREE.HemisphereLight('#3A4060', '#0A0A10', .45)); scene.add(M(new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), sm('#101218', { roughness: .8 })));
    const gris = sm('#5A5E68', { roughness: .8 }), r = rng(3); let elegido = null;
    for (let i = 0; i < 70; i++) { const g = new THREE.Group(), a = r() * Math.PI * 2, d = 1 + r() * 9; g.position.set(Math.cos(a) * d, 0, Math.sin(a) * d - 2); if (i === 0) g.position.set(0, 0, 0); scene.add(g);
      g.add(M(new THREE.CapsuleGeometry(.22, .8, 6, 16), i === 0 ? sm('#7A8090') : gris, 0, .65, 0)); g.add(M(new THREE.SphereGeometry(.18, 24, 16), i === 0 ? sm('#7A8090') : gris, 0, 1.45, 0)); if (i === 0) elegido = g; }
    const sp = new THREE.SpotLight(CIAN, 12, 12, .22, .4, 1.2); sp.position.set(0, 7, 0); sp.target = elegido; sp.castShadow = true; scene.add(sp);
    const cono = new THREE.Mesh(new THREE.ConeGeometry(1.3, 7, 40, 1, true), new THREE.MeshBasicMaterial({ color: CIAN, transparent: true, opacity: .07, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); cono.position.set(0, 3.5, 0); scene.add(cono);
    const aro = new THREE.Mesh(new THREE.RingGeometry(.6, .66, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: HDR(.6, 2.5, 2.8), transparent: true, opacity: .8, toneMapped: false })); aro.position.y = .01; scene.add(aro);
    const e = { scene, cam, upd: t => { const k = ease(prog(t, e.a, e.b)); mira(cam, V3(lerp(5.5, 3.2, k), lerp(3.6, 2.6, k), lerp(8, 5, k)), V3(0, 1.0, 0)); sp.intensity = 12 * clamp((t - e.a) * 2); }, post: () => ({ focus: 6, ap: .15, bloom: 1.1, umbral: .9 }) };
    return e; }

  // ================= bodegón: objeto sobre superficie con luz suave (tarjeta, enchufe, cafetera, mesita, puerta) =================
  function bodegon(o) { const scene = nueva(o.bg || '#0A0806'), cam = camara(o.fov || 34);
    scene.add(new THREE.HemisphereLight(o.cielo || '#8A90B0', '#1A120C', o.hemi || .45));
    const key = new THREE.SpotLight(o.luz || '#FFE2C0', o.kI || 5, 10, .6, .7, 1.2); key.position.set(...(o.keyP || [1.2, 2.4, 1.6])); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; scene.add(key); scene.add(key.target);
    const rim = new THREE.DirectionalLight(o.rimC || '#6A8AFF', o.rimI || .7); rim.position.set(-2, 1.5, -2); scene.add(rim);
    return { scene, cam, key }; }
  function mesaMadera(scene, y = 0, col = '#3A2416') { const t = cv(1024, 1024, (x, w, h) => { const r = rng(8); x.fillStyle = col; x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { x.strokeStyle = `rgba(${r() < .5 ? '0,0,0' : '255,220,180'},${.04 + r() * .06})`; x.lineWidth = 1 + r() * 3; x.beginPath(); const yy = r() * h; x.moveTo(0, yy); x.bezierCurveTo(w * .3, yy + (r() - .5) * 40, w * .6, yy + (r() - .5) * 40, w, yy + (r() - .5) * 20); x.stroke(); } });
    const m = M(new THREE.PlaneGeometry(6, 6).rotateX(-Math.PI / 2), sm('#FFFFFF', { map: t, roughness: .45 }), 0, y, 0); scene.add(m); return m; }

  function escTarjeta(T, o = {}) { const B = bodegon({ keyP: [.6, 1.6, .9], kI: 2.6 }), { scene, cam } = B; mesaMadera(scene, 0, '#2A1A10');
    const cardT = cv(1024, 640, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#1A1B20'); g.addColorStop(1, '#0A0A0E'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      const cg = x.createLinearGradient(80, 200, 260, 380); cg.addColorStop(0, '#F2D27A'); cg.addColorStop(.5, '#B88A30'); cg.addColorStop(1, '#E8C060'); x.fillStyle = cg; rr(x, 80, 210, 170, 130, 18); x.fill(); x.strokeStyle = 'rgba(60,40,10,.6)'; x.lineWidth = 4; for (const yy of [255, 295]) { x.beginPath(); x.moveTo(80, yy); x.lineTo(250, yy); x.stroke(); } x.beginPath(); x.moveTo(165, 210); x.lineTo(165, 340); x.stroke();
      logo(x, 820, 170, 80); x.fillStyle = CIAN; x.font = FONT(900, 56); x.textAlign = 'right'; x.fillText('LUNA', w - 70, 330); x.fillStyle = '#C8CCD4'; x.font = FONT(800, 40); x.fillText('LLAVE · ÁTICO', w - 70, 400); x.fillStyle = '#5A5E68'; x.font = FONT(700, 30); x.textAlign = 'left'; x.fillText('Nº 0001', 80, h - 60); });
    const cn = sm('#0A0A0C', { roughness: .4 }); const card = M(new THREE.BoxGeometry(.0856, .054, .0018), [cn, cn, cn, cn, sm('#FFFFFF', { map: cardT, roughness: .35, metalness: .3 }), cn], 0, .0009, 0); card.rotation.set(-Math.PI / 2, 0, .25); card.position.set(-.012, .0009, -.006); scene.add(card);
    const posT = cv(512, 512, (x, w, h) => { x.fillStyle = '#F8E260'; x.fillRect(0, 0, w, h); const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(120,90,0,.18)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = '#1A2A6A'; x.font = MANO(76); x.save(); x.translate(50, 180); x.rotate(-.05); x.fillText('Bienvenido.', 0, 0); x.font = MANO(66); x.fillText('— Marcos', 90, 140); x.restore(); });
    const pg = new THREE.PlaneGeometry(.042, .042, 8, 8); { const p = pg.attributes.position; for (let i = 0; i < p.count; i++) { const yy = p.getY(i); p.setZ(i, yy > .011 ? (yy - .011) * .35 : 0); } pg.computeVertexNormals(); }
    const pos = M(pg, sm('#E8E0B0', { map: posT, roughness: .9, side: THREE.DoubleSide }), .04, .0025, .03); pos.rotation.set(-Math.PI / 2, 0, -.12); scene.add(pos);
    const e = { scene, cam, upd: t => { const k = ease(prog(t, e.a, e.b)); mira(cam, V3(lerp(.08, .05, k), lerp(.25, .19, k), lerp(.19, .14, k)), V3(.012, 0, .01)); }, post: () => ({ focus: .19, ap: .45, bloom: .7, umbral: 1.0, grano: 1 }) };
    return e; }

  function enchufe(scene, conEtiqueta = true) { const g = new THREE.Group(); scene.add(g);
    g.add(M(rbox(.09, .09, .012, .012), sm('#9A9EA6', { roughness: .45 }), 0, 0, 0)); g.add(M(new THREE.CylinderGeometry(.03, .03, .006, 40).rotateX(Math.PI / 2), sm('#7A7E86', { roughness: .5 }), 0, 0, .008));
    const clav = M(rbox(.05, .05, .03, .012), sm('#E8E8EC', { roughness: .4 }), 0, 0, .025); g.add(clav);
    const cable = new THREE.CatmullRomCurve3([V3(0, -.02, .03), V3(0, -.06, .05), V3(.01, -.14, .07), V3(.03, -.3, .06)]); g.add(M(new THREE.TubeGeometry(cable, 30, .0045, 10), sm('#EDEDF0', { roughness: .5 })));
    let et = null; if (conEtiqueta) { const etT = cv(400, 520, (x, w, h) => { x.fillStyle = '#D8262E'; x.beginPath(); x.moveTo(0, 90); x.lineTo(70, 0); x.lineTo(w, 0); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill(); x.fillStyle = '#F2EEE6'; x.beginPath(); x.arc(70, 70, 24, 0, 7); x.fill();
        x.fillStyle = '#FFFFFF'; x.font = FONT(900, 74); x.textAlign = 'center'; x.fillText('NUNCA', w / 2 + 10, 230); x.font = FONT(900, 50); x.fillText('DESCONECTAR', w / 2 + 6, 310); x.font = MANO(80); x.fillText('— M.', w / 2 + 40, 440); });
      et = new THREE.Group(); et.position.set(.0, -.04, .045); g.add(et); const hilo = M(new THREE.CylinderGeometry(.0008, .0008, .05), sm('#F2EEE6'), 0, -.025, 0); et.add(hilo);
      const tag = M(new THREE.PlaneGeometry(.06, .078), sm('#FFFFFF', { map: etT, roughness: .8, side: THREE.DoubleSide }), 0, -.085, 0); et.add(tag); }
    return { g, et }; }
  function escEnchufe(T, o = {}) { const B = bodegon({ bg: '#0C0C10', keyP: [.5, .6, .9], kI: 3.5, luz: '#FFE8D0' }), { scene, cam } = B;
    const pt = cv(512, 512, (x, w, h) => { x.fillStyle = '#5A5650'; x.fillRect(0, 0, w, h); const r = rng(2); for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${r() < .5 ? 0 : 255},${r() < .5 ? 0 : 255},${r() < .5 ? 0 : 255},.03)`; x.fillRect(r() * w, r() * h, 3, 3); } });
    scene.add(M(new THREE.PlaneGeometry(3, 3), sm('#FFFFFF', { map: pt, roughness: .95 }), 0, 0, -.006));
    const E = enchufe(scene, true);
    const e = { scene, cam, E, upd: t => { const k = ease(prog(t, e.a, e.b)); if (E.et) E.et.rotation.z = .12 * Math.sin(t * 1.3) * (o.quieto ? .3 : 1);
      const z0 = o.cerca ? .22 : .32, z1 = o.cerca ? .17 : .25; mira(cam, V3(lerp(.05, .03, k), lerp(-.03, -.05, k), lerp(z0, z1, k)), V3(0, -.07, 0)); }, post: () => ({ focus: o.cerca ? .2 : .28, ap: .35, bloom: .8, umbral: 1.0, grano: 1 }) };
    return e; }

  function escCafetera(T, o = {}) { const B = bodegon({ bg: '#0A0908', keyP: [-.8, 1.6, 1.2], kI: 5 }), { scene, cam } = B; mesaMadera(scene, 0, '#1E140C');
    const acero = sm('#B8BCC4', { metalness: .9, roughness: .28 }), negro = sm('#141416', { roughness: .4 });
    const cf = new THREE.Group(); scene.add(cf); cf.add(M(rbox(.3, .42, .3, .03), acero, 0, .21, 0)); cf.add(M(rbox(.32, .05, .34, .02), negro, 0, .44, 0)); cf.add(M(rbox(.28, .03, .2, .01), negro, 0, .015, .1));
    cf.add(M(new THREE.CylinderGeometry(.025, .02, .06, 20), negro, 0, .3, .16)); const logoT = cv(256, 256, (x) => logo(x, 128, 128, 90)); const lp = new THREE.Mesh(new THREE.PlaneGeometry(.08, .08), new THREE.MeshBasicMaterial({ map: logoT, transparent: true, toneMapped: false, color: HDR(1.4, 1.4, 1.4) })); lp.position.set(0, .36, .151); cf.add(lp);
    const taza = new THREE.Group(); taza.position.set(0, .03, .1); cf.add(taza); taza.add(M(new THREE.CylinderGeometry(.045, .036, .08, 32, 1, true), sm('#F2F0EC', { side: THREE.DoubleSide, roughness: .3 }), 0, .04, 0)); taza.add(M(new THREE.CylinderGeometry(.036, .036, .005, 32), sm('#F2F0EC'), 0, .002, 0));
    const asa = M(new THREE.TorusGeometry(.02, .006, 8, 20, Math.PI), sm('#F2F0EC'), .05, .045, 0); asa.rotation.z = -Math.PI / 2; taza.add(asa);
    const cafe = M(new THREE.CylinderGeometry(.042, .036, 1, 32), sm('#3A1E10', { roughness: .2 }), 0, 0, 0); taza.add(cafe);
    const chorro = M(new THREE.CylinderGeometry(.003, .003, .18, 8), sm('#4A2A14', { roughness: .2 }), 0, .17, .06); cf.add(chorro);
    const vapor = []; for (let i = 0; i < 10; i++) { const v = glow('#FFFFFF', .05, .12); taza.add(v); vapor.push(v); }
    const e = { scene, cam, upd: t => { const k = prog(t, e.a, e.b), lleno = clamp((t - e.a - .4) / 2.6); cafe.scale.y = Math.max(.001, lleno * .07); cafe.position.y = .004 + lleno * .035; chorro.visible = lleno > 0 && lleno < 1;
      vapor.forEach((v, i) => { const u = ((t * .35 + i / 10) % 1); v.position.set(.01 * Math.sin(i * 3 + t * 2), .08 + u * .14, 0); v.material.opacity = lleno > .5 ? .12 * Math.sin(u * Math.PI) : 0; v.scale.setScalar(.03 + u * .06); });
      mira(cam, V3(lerp(.35, .2, ease(k)), lerp(.32, .24, ease(k)), lerp(.62, .45, ease(k))), V3(0, .2, .05)); }, post: () => ({ focus: .55, ap: .3, bloom: .8, umbral: 1.0, grano: 1 }) };
    return e; }

  function escMesita(T, o = {}) { const B = bodegon({ bg: '#07060A', keyP: [-.7, 1.2, .8], kI: 5.5, luz: '#FFC890', rimI: .25 }), { scene, cam } = B;
    scene.add(M(new THREE.PlaneGeometry(4, 3), sm('#1E1A22', { roughness: .95 }), 0, .8, -.35));
    const mes = M(rbox(.55, .5, .4, .02), sm('#4A2E1C', { roughness: .55 }), 0, .25, 0); scene.add(mes); scene.add(M(rbox(.5, .015, .03, .005), sm('#C8A060', { metalness: .8 }), 0, .3, .2));
    // foto enmarcada (sepia; se vuelve gris)
    const fc = document.createElement('canvas'); fc.width = 400; fc.height = 500; const fx = fc.getContext('2d'); const ftex = new THREE.CanvasTexture(fc); ftex.encoding = THREE.sRGBEncoding;
    const pintaFoto = (gris) => { const sep = (r, g, b) => gris ? `rgb(${(r + g + b) / 3 | 0},${(r + g + b) / 3 | 0},${(r + g + b) / 3 | 0})` : `rgb(${r},${g},${b})`;
      const g = fx.createLinearGradient(0, 0, 0, 500); g.addColorStop(0, sep(200, 170, 130)); g.addColorStop(1, sep(150, 110, 70)); fx.fillStyle = g; fx.fillRect(0, 0, 400, 500);
      L.retrato(fx, 200, 230, 1.35, { piel: sep(205, 160, 115), pelo: sep(80, 55, 35), ropa: sep(110, 80, 55), gorra: sep(120, 70, 40), bigote: true }); fx.save(); fx.globalCompositeOperation = 'color'; fx.fillStyle = gris ? '#808080' : '#8A5A2A'; fx.fillRect(0, 0, 400, 500); fx.restore();
      fx.fillStyle = 'rgba(80,50,20,.18)'; for (let i = 0; i < 600; i++) fx.fillRect(i * 37 % 400, i * 91 % 500, 2, 2); ftex.needsUpdate = true; };
    pintaFoto(false);
    const marco = new THREE.Group(); marco.position.set(-.1, .5, -.05); marco.rotation.set(-.12, .3, 0); scene.add(marco);
    marco.add(M(rbox(.17, .21, .015, .006), sm('#2A1A10', { roughness: .4 }), 0, .105, 0)); const fp = new THREE.Mesh(new THREE.PlaneGeometry(.13, .165), new THREE.MeshStandardMaterial({ map: ftex, roughness: .6 })); fp.position.set(0, .105, .0085); marco.add(fp);
    const pata = M(new THREE.BoxGeometry(.02, .15, .005), sm('#2A1A10'), 0, .07, -.04); pata.rotation.x = -.4; marco.add(pata);
    // llavero de coche viejo
    const ll = new THREE.Group(); ll.position.set(.1, .501, .08); ll.rotation.y = .6; scene.add(ll);
    ll.add(M(new THREE.TorusGeometry(.014, .0025, 8, 24).rotateX(Math.PI / 2), sm('#C8C8CC', { metalness: .9, roughness: .3 }), 0, .002, 0));
    ll.add(M(rbox(.032, .045, .01, .008).rotateX(Math.PI / 2), sm('#1A1A1E', { roughness: .5 }), .028, .005, .02)); ll.add(M(new THREE.BoxGeometry(.006, .003, .04), sm('#B8A070', { metalness: .9, roughness: .3 }), -.02, .003, .025));
    // altavoz pequeño redondo
    const mini = new THREE.Group(); mini.position.set(.16, .5, -.08); scene.add(mini); mini.add(M(new THREE.SphereGeometry(.045, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), sm('#121316', { roughness: .8 }), 0, 0, 0));
    const an = M(new THREE.TorusGeometry(.03, .003, 10, 48).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: HDR(.5, 2.6, 3), toneMapped: false }), 0, .04, 0); mini.add(an); const mh = glow(CIAN, .12, .6); mh.position.y = .045; mini.add(mh);
    const ml = new THREE.PointLight(CIAN, .6, 1, 1.5); ml.position.set(0, .1, .05); mini.add(ml);
    let gris = false;
    const e = { scene, cam, upd: t => { const k = ease(prog(t, e.a, e.b));
      if (o.foto) { const g = t > T.fotoGris; if (g !== gris) { gris = g; pintaFoto(g); } const kk = ease(prog(t, e.a, e.b)); mira(cam, V3(lerp(-.02, -.07, kk), lerp(.64, .61, kk), lerp(.42, .22, kk)), V3(-.1, .6, -.05)); }
      else mira(cam, V3(lerp(.45, .3, k), lerp(.88, .76, k), lerp(1.0, .72, k)), V3(.03, .55, -.02));
      const pul = .8 + .2 * Math.sin(t * 2.2); an.material.color.setRGB(.5 * pul, 2.6 * pul, 3 * pul); }, post: () => ({ focus: o.foto ? .2 : .7, ap: .35, bloom: .9, umbral: .95, grano: 1 }) };
    return e; }

  function escPuerta(T, o = {}) { const B = bodegon({ bg: '#09080A', keyP: [.9, 2.0, 1.4], kI: 3.2, luz: '#FFE2C8' }), { scene, cam } = B;
    scene.add(M(new THREE.PlaneGeometry(4, 3.2), sm('#2A2420', { roughness: .95 }), 0, 1.6, -.03));
    const madT = cv(512, 1024, (x, w, h) => { const r = rng(3); x.fillStyle = '#5A3620'; x.fillRect(0, 0, w, h); for (let i = 0; i < 200; i++) { x.strokeStyle = `rgba(0,0,0,${.05 + r() * .08})`; x.lineWidth = 1 + r() * 3; const xx = r() * w; x.beginPath(); x.moveTo(xx, 0); x.bezierCurveTo(xx + (r() - .5) * 30, h * .3, xx + (r() - .5) * 30, h * .6, xx, h); x.stroke(); } });
    scene.add(M(rbox(.95, 2.1, .06, .01), sm('#FFFFFF', { map: madT, roughness: .5 }), 0, 1.05, 0));
    const tir = M(new THREE.CylinderGeometry(.012, .012, .5, 16), sm('#C8CCD4', { metalness: .9, roughness: .2 }), .36, 1.05, .07); scene.add(tir); for (const y of [.85, 1.25]) { const s = M(new THREE.CylinderGeometry(.008, .008, .05, 10).rotateX(Math.PI / 2), sm('#C8CCD4', { metalness: .9 }), .36, y, .05); scene.add(s); }
    const cc = document.createElement('canvas'); cc.width = 256; cc.height = 384; const cx = cc.getContext('2d'); const ct = new THREE.CanvasTexture(cc); ct.encoding = THREE.sRGBEncoding;
    const pintaCerr = (k) => { cx.fillStyle = '#0A0A0C'; cx.fillRect(0, 0, 256, 384); cx.fillStyle = `rgba(232,50,58,${.6 + .4 * k})`; cx.font = FONT(900, 34); cx.textAlign = 'center'; cx.fillText('BLOQUEADA', 128, 90); cx.beginPath(); cx.arc(128, 200, 46, Math.PI, 0); cx.strokeStyle = cx.fillStyle; cx.lineWidth = 12; cx.stroke(); rr(cx, 72, 200, 112, 90, 12); cx.fill(); for (let i = 0; i < 9; i++) { cx.fillStyle = 'rgba(232,50,58,.25)'; cx.beginPath(); cx.arc(70 + (i % 3) * 58, 320 + Math.floor(i / 3) * 0, 0, 0, 7); cx.fill(); } ct.needsUpdate = true; };
    const cer = M(rbox(.12, .18, .025, .015), sm('#16171A', { metalness: .5, roughness: .3 }), .36, 1.45, .045); scene.add(cer); const disp = new THREE.Mesh(new THREE.PlaneGeometry(.09, .135), new THREE.MeshBasicMaterial({ map: ct, toneMapped: false })); disp.position.set(.36, 1.45, .059); scene.add(disp);
    const rl = new THREE.PointLight('#FF3030', .5, 1.2, 1.5); rl.position.set(.36, 1.45, .25); scene.add(rl);
    const e = { scene, cam, upd: t => { const k = ease(prog(t, e.a, e.b)); const bl = Math.sin(t * 9) > 0 ? 1 : .35; pintaCerr(bl); rl.intensity = .4 + .4 * bl;
      mira(cam, V3(lerp(1.3, .9, k), lerp(1.4, 1.35, k), lerp(2.4, 1.6, k)), V3(.15, 1.2, 0)); }, post: () => ({ focus: 1.8, ap: .2, bloom: 1.0, umbral: .9, grano: 1 }) };
    return e; }

  // ================= dormitorio en visión nocturna =================
  function escNocturna(T, o = {}) { const scene = nueva('#020302'), cam = camara(52);
    scene.add(new THREE.HemisphereLight('#FFFFFF', '#202020', .9)); const ir = new THREE.SpotLight('#FFFFFF', 3, 12, .9, .6, 1.2); ir.position.set(1.2, 2.8, 2.5); scene.add(ir); scene.add(ir.target);
    scene.add(M(new THREE.PlaneGeometry(8, 8).rotateX(-Math.PI / 2), sm('#6A6A6A', { roughness: .9 })));
    scene.add(M(new THREE.PlaneGeometry(8, 3), sm('#5A5A5A', { roughness: .95 }), 0, 1.5, -1.6));
    const cama = new THREE.Group(); scene.add(cama); cama.add(M(rbox(1.6, .35, 2.1, .06), sm('#7A7A7A'), 0, .2, 0)); cama.add(M(rbox(1.7, .8, .1, .04), sm('#5A5A5A'), 0, .5, -1.05));
    const cob = M(rbox(1.62, .16, 1.5, .08), sm('#9A9A9A', { roughness: 1 }), 0, .45, .28); scene.add(cob); scene.add(M(rbox(.6, .14, .35, .07), sm('#B0B0B0'), -.35, .44, -.75));
    const cuerpo = M(new THREE.CapsuleGeometry(.2, .9, 6, 16), sm('#9A9A9A', { roughness: 1 }), .2, .55, .15); cuerpo.rotation.x = Math.PI / 2; scene.add(cuerpo); scene.add(M(new THREE.SphereGeometry(.13, 24, 16), sm('#8A8A8A'), .22, .58, -.62));
    scene.add(M(rbox(.45, .45, .4, .02), sm('#6A6A6A'), 1.15, .22, -1.1)); const alt = L.altavoz(.5); alt.position.set(1.15, .45, -1.1); scene.add(alt);
    const ondas = []; for (let i = 0; i < 5; i++) { const a = new THREE.Mesh(new THREE.RingGeometry(.9, .96, 64), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); a.position.set(1.15, .72, -1.1); scene.add(a); ondas.push(a); }
    const e = { scene, cam, upd: t => { const k = ease(prog(t, e.a, e.b)); mira(cam, V3(lerp(-1.4, -1.0, k), lerp(2.7, 2.5, k), lerp(2.6, 2.2, k)), V3(.4, .4, -.5)); alt.setColor(1, 1);
      ondas.forEach((a, i) => { const u = ((t - e.a) * .7 - i * .22); const f = u - Math.floor(u); a.visible = t > T.ondas; a.scale.setScalar(.05 + f * .6); a.material.opacity = (1 - f) * .8; a.lookAt(cam.position); }); },
      post: () => ({ focus: 3, ap: .05, bloom: .9, umbral: .8, verde: 1, grano: 1 }) };
    return e; }

  // ================= móvil inclinado: bloqueo con notificación y chat =================
  function escChat(T, o = {}) { const scene = nueva('#06070C'), cam = camara(34); scene.add(new THREE.HemisphereLight('#7A86C8', '#100C10', .6));
    const k1 = new THREE.DirectionalLight('#DDE4FF', .8); k1.position.set(-1, 2, 2); scene.add(k1);
    const r = rng(6); for (let i = 0; i < 24; i++) { const b = glow(r() < .7 ? '#FFC07A' : '#7AA0FF', .2 + r() * .3, .25 + r() * .3); b.position.set((r() - .5) * 3, (r() - .5) * 3.4, -2.5 - r() * 2); scene.add(b); }
    const mv = L.movil(); scene.add(mv.grp); mv.grp.rotation.set(-.25, .32, -.12); const x = mv.x, W = mv.W, H = mv.H;
    const MSG = ['He visto que se ha ido la luz.', 'Mañana a las 9 paso a revisar a Luna.', 'Y no le hagas caso: a veces se inventa cosas.'];
    function pinta(t) { const ch = t >= T.abreChat; x.save();
      if (!ch) { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0A1030'); g.addColorStop(.6, '#1A1648'); g.addColorStop(1, '#2A1A3A'); x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = FONT(700, 36); x.fillText('domingo, 4 de mayo', W / 2, 200); x.font = FONT(900, 200); x.fillText('04:03', W / 2, 400);
        const kn = easeOut(prog(t, T.notifMarcos, T.notifMarcos + .5)); if (kn > 0) { const y = 520 - 60 * (1 - kn); x.globalAlpha = kn; x.fillStyle = 'rgba(30,32,44,.88)'; rr(x, 30, y, W - 60, 150, 30); x.fill();
          x.fillStyle = '#2E7AF2'; x.beginPath(); x.arc(100, y + 75, 42, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = FONT(900, 44); x.fillText('M', 100, y + 90); x.textAlign = 'left'; x.font = FONT(900, 36); x.fillText('Marcos', 165, y + 62); x.font = FONT(600, 32); x.fillStyle = '#C8CCD8'; x.fillText('Nuevo mensaje', 165, y + 108); x.textAlign = 'right'; x.font = FONT(600, 26); x.fillText('ahora', W - 60, y + 58); } }
      else { x.fillStyle = '#0C0D12'; x.fillRect(0, 0, W, H); x.fillStyle = '#16171E'; x.fillRect(0, 0, W, 210); x.fillStyle = '#2E7AF2'; x.beginPath(); x.arc(110, 140, 46, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = FONT(900, 46); x.textAlign = 'center'; x.fillText('M', 110, 156);
        x.textAlign = 'left'; x.font = FONT(900, 40); x.fillText('Marcos Rey', 180, 130); x.fillStyle = '#3AD86A'; x.font = FONT(700, 30); x.fillText('en línea', 180, 172); x.fillStyle = '#8A8E9A'; x.font = FONT(700, 28); x.textAlign = 'center'; x.fillText('04:03', W / 2, 290);
        let y = 340; MSG.forEach((m, i) => { const t0 = T.abreChat + .5 + i * 1.0; if (t < t0 - .7) return; if (t < t0) { x.fillStyle = '#2A2C36'; rr(x, 40, y, 140, 80, 40); x.fill(); for (let d = 0; d < 3; d++) { x.fillStyle = `rgba(220,224,235,${.4 + .6 * Math.max(0, Math.sin(t * 9 - d))})`; x.beginPath(); x.arc(80 + d * 30, y + 40, 9, 0, 7); x.fill(); } return; }
          x.font = FONT(700, 36); const lines = []; let cur = ''; m.split(' ').forEach(wd => { if (x.measureText(cur + wd).width > 400) { lines.push(cur.trim()); cur = ''; } cur += wd + ' '; }); lines.push(cur.trim());
          const bh = 40 + lines.length * 48, ka = easeOut(prog(t, t0, t0 + .25)); x.globalAlpha = ka; x.fillStyle = '#2A2C36'; rr(x, 40, y, 470, bh, 30); x.fill(); x.fillStyle = '#EEF0F6'; x.textAlign = 'left'; lines.forEach((l, j) => x.fillText(l, 70, y + 58 + j * 48)); x.globalAlpha = 1; y += bh + 24; }); }
      x.restore(); mv.upd(); }
    const e = { scene, cam, upd: t => { const k = ease(prog(t, e.a, e.b)); const vib = t > T.notifMarcos && t < T.notifMarcos + .6 ? Math.sin(t * 150) * .002 : 0; mv.grp.position.set(vib, 0, 0); pinta(t);
      mira(cam, V3(lerp(.06, .02, k), lerp(.05, .01, k), lerp(.5, .34, k)), V3(0, 0, 0)); }, post: () => ({ focus: .4, ap: .45, bloom: .8, umbral: 1.0 }) };
    return e; }

  window.ESC = { escUI, escAtico, escTorre, escFoco, escTarjeta, escEnchufe, escCafetera, escMesita, escPuerta, escNocturna, escChat, enchufe, mira, nueva, camara, V3, FONT, MANO };
})();
