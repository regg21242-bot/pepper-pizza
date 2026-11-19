/* Serie "Ferry" — resto de escenarios y el orden de la parte 1 (sustituye ESC.crear).
   Reutilizables: escPuerto, escTel, escSalon, escMapa, escCamarote, escMuelle, escPulsera, escTerminal, escSala, escPasilloCristal. */
(function () {
  const THREE = window.THREE, N = window.N, F = window.F, E = window.ESC, { rng, clamp, lerp, prog, ease, easeOut } = N, { HDR, sm, M, rbox } = F;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const nueva = (bg = '#0A0E1C', fog) => { const s = new THREE.Scene(); s.background = new THREE.Color(bg); if (fog) s.fog = new THREE.Fog(bg, fog[0], fog[1]); return s; };
  const camara = (fov = 40) => new THREE.PerspectiveCamera(fov, 1080 / 1920, .01, 900);
  const mira = (cam, p, l, fov) => { cam.position.copy(p); cam.lookAt(l); if (fov) cam.fov = fov; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); };
  const glowS = (c, s, op = 1) => { const g = N.glow(c, s, op); g.material.fog = false; return g; };
  const texto = (w, h, draw) => N.canvasTex(w, h, draw);
  const camino = (keys) => { const cp = new THREE.CatmullRomCurve3(keys.map(k => V3(...k[1])), false, 'centripetal'), cl = new THREE.CatmullRomCurve3(keys.map(k => V3(...k[2])), false, 'centripetal');
    return t => { const a = keys[0][0], b = keys[keys.length - 1][0]; let u = clamp((t - a) / (b - a)); u = u * u * (3 - 2 * u) * .5 + u * .5; return [cp.getPoint(u), cl.getPoint(u)]; }; };

  // ---------------- agua nocturna con reflejos ----------------
  function agua(scene, size = 600, col = '#0A1428') {
    const geo = new THREE.PlaneGeometry(size, size, 1, 1); const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, roughness: .18, metalness: .6, transparent: true, opacity: .86 })); m.rotation.x = -Math.PI / 2; m.renderOrder = 2; scene.add(m);
    const olas = texto(512, 512, (x, w, h) => { const r = rng(4); x.clearRect(0, 0, w, h); for (let i = 0; i < 380; i++) { x.fillStyle = `rgba(150,180,255,${.05 + r() * .12})`; x.fillRect(r() * w, r() * h, 20 + r() * 60, 2); } }, false); olas.wrapS = olas.wrapT = THREE.RepeatWrapping; olas.repeat.set(size / 20, size / 20);
    const capa = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: olas, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); capa.rotation.x = -Math.PI / 2; capa.position.y = .02; capa.renderOrder = 3; scene.add(capa);
    return { m, capa, upd: t => { olas.offset.set(t * .01, t * .03); } };
  }
  // reflejo: copia del objeto invertida bajo el agua
  function reflejo(scene, obj) { const r = obj.clone(true); r.scale.y *= -1; r.traverse(o => { if (o.isMesh) { o.castShadow = false; if (o.material && o.material.side !== undefined) { o.material = o.material.clone(); o.material.side = THREE.DoubleSide; } } }); scene.add(r); return r; }

  // ---------------- puerto de noche (escena 1 y loop) ----------------
  function escPuerto(T, o = {}) {
    const scene = nueva('#070B1A', [60, 260]); const cam = camara(42);
    scene.add(new THREE.HemisphereLight('#4A5AA8', '#0A0A14', .55));
    const luna = new THREE.DirectionalLight('#9AAAFF', .5); luna.position.set(-40, 60, -30); scene.add(luna);
    const cielo = new THREE.Mesh(new THREE.SphereGeometry(500, 24, 16), new THREE.MeshBasicMaterial({ map: texto(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#050816'); g.addColorStop(.42, '#0E1636'); g.addColorStop(.5, '#2A2A52'); g.addColorStop(1, '#070B1A'); x.fillStyle = g; x.fillRect(0, 0, w, h); }), side: THREE.BackSide, fog: false })); scene.add(cielo);
    const r = rng(2); for (let i = 0; i < 160; i++) { const s = glowS('#DDE6FF', .6 + r() * .8, .5 + r() * .5); const a = r() * Math.PI * 2, e = .15 + r() * 1.1; s.position.set(Math.cos(a) * 400 * Math.cos(e), 400 * Math.sin(e), Math.sin(a) * 400 * Math.cos(e)); scene.add(s); }
    const W = agua(scene);
    const barco = F.barco(); barco.rotation.y = -Math.PI / 2; scene.add(barco); const rb = reflejo(scene, barco);
    const foco1 = new THREE.SpotLight('#E8EEFF', 1.6, 90, .5, .6, 1.2); foco1.position.set(-14, 22, 30); foco1.target = barco; scene.add(foco1); const foco2 = new THREE.SpotLight('#FFD8A8', 1.1, 90, .5, .6, 1.2); foco2.position.set(16, 18, 24); foco2.target = barco; scene.add(foco2);
    // puerto: muelles, grúas, farolas, luces de la ciudad al fondo
    const muelle = sm('#3A3E48', { roughness: .9 });
    for (const s of [-1, 1]) { scene.add(M(new THREE.BoxGeometry(14, 2, 160), muelle, s * 26, .4, -40)); for (let z = -110; z < 30; z += 14) { const f = glowS('#FFC27A', 3.2, .9); f.position.set(s * 21, 8, z); scene.add(f); scene.add(M(new THREE.CylinderGeometry(.15, .15, 8), sm('#2A2C34'), s * 21, 4, z)); const rf = glowS('#FFB060', 2.2, .35); rf.scale.set(1.5, 9, 1); rf.position.set(s * 21, -4, z); scene.add(rf); } }
    for (let i = 0; i < 3; i++) { const gr = new THREE.Group(); gr.position.set(-34 + i * 9, 0, -120 - i * 6); scene.add(gr); gr.add(M(new THREE.BoxGeometry(1.2, 26, 1.2), sm('#7A2A26'), 0, 13, 0)); gr.add(M(new THREE.BoxGeometry(22, 1.2, 1.2), sm('#7A2A26'), 6, 26, 0)); const lr = glowS('#FF3A3A', 2, .9); lr.position.set(0, 27.5, 0); scene.add(lr); lr.position.add(gr.position); }
    for (let i = 0; i < 120; i++) { const l = glowS(r() < .7 ? '#FFD49A' : '#BFD0FF', 1.4 + r() * 1.5, .6 + r() * .4); l.position.set((r() - .5) * 300, 2 + r() * 14, -170 - r() * 60); scene.add(l); }
    for (let i = 0; i < 26; i++) { const b = M(new THREE.BoxGeometry(8 + r() * 14, 8 + r() * 30, 8), sm('#0E1222'), (r() - .5) * 320, 0, -185 - r() * 40); b.position.y = b.geometry.parameters.height / 2; scene.add(b); }
    const pose = camino([[-1.2, [5, 3.4, 44], [0, 6.5, 0]], [0, [4.2, 3.2, 40], [0, 6.5, 0]], [2.6, [2.6, 2.8, 32], [0, 6.8, 0]]]);
    const upd = t => { W.upd(t); let tt = t; if (t >= (o.loop || 1e9)) tt = t - (o.fin || 95.8); // el loop termina en el cuadro 0
      const z = -6 + (tt + 1.2) * 1.4; barco.position.set(0, 0, z); rb.position.set(0, 0, z);
      const [p, l] = pose(tt); mira(cam, p, l); };
    return { scene, cam, upd, post: t => ({ focus: 50, ap: .02, bloom: 1.1, umbral: .9 }) };
  }

  // ---------------- móvil en mano (escenas 2, 5, 6, 17) ----------------
  function escTel(T, o = {}) {
    const scene = nueva(o.bg || '#0B0F1E'); const cam = camara(34);
    scene.add(new THREE.HemisphereLight('#8A9CFF', '#1A1424', .7));
    const key = new THREE.DirectionalLight('#E8EEFF', 1.2); key.position.set(-1, 2, 2); scene.add(key);
    const rim = new THREE.DirectionalLight('#6A7CFF', 1.0); rim.position.set(2, 1, -1.5); scene.add(rim);
    const r = rng(o.seed || 12); for (let i = 0; i < 26; i++) { const b = glowS(r() < .8 ? (o.bokeh || '#9AB4FF') : '#FFD08A', .25 + r() * .35, .25 + r() * .3); b.position.set((r() - .5) * 3.2, (r() - .3) * 3.4, -2.5 - r() * 2); scene.add(b); }
    scene.add(M(new THREE.PlaneGeometry(12, 10), sm(o.pared || '#141A30', { roughness: 1 }), 0, 0, -5));
    const mv = F.movil(); const g = new THREE.Group(); g.add(mv.grp); g.add(F.mano()); scene.add(g); g.rotation.set(-.12, .14, .04);
    let dedo = null; if (o.dedo) { dedo = F.dedo(); dedo.scale.setScalar(.62); dedo.rotation.set(.15, -.2, .55); scene.add(dedo); }
    const a = o.a, b = o.b;
    const upd = t => { const k = prog(t, a, b);
      let vib = 0; if (o.vibra) vib = o.vibra(t);
      g.position.set(.003 * Math.sin(t * 1.3) + vib * Math.sin(t * 160) * .0025, .002 * Math.sin(t * 1.7) - .004, 0);
      const z0 = o.z0 || .47, z1 = o.z1 || .39; mira(cam, V3(.015 - .02 * k + (o.dx || 0), (o.dy || 0), lerp(z0, z1, ease(k))), V3(o.lx || 0, (o.ly != null ? o.ly : -.004), 0));
      if (dedo) { const p = o.dedo(t); dedo.position.set(p[0], p[1], p[2]); dedo.visible = p[3] !== false; }
      o.pintar(t, mv);
    };
    return { scene, cam, upd, post: t => Object.assign({ focus: cam.position.length(), ap: .5, bloom: .7, umbral: 1.1 }, o.post ? o.post(t) : {}) };
  }

  // ---------------- salón de pasajeros (escenas 3, 7b y 8) ----------------
  function escSalon(T, o = {}) {
    const scene = nueva('#0C1222', [8, 30]); const cam = camara(44);
    scene.add(new THREE.HemisphereLight('#9AA8E8', '#141018', .45));
    const W = 9, L = 22, H = 2.8;
    scene.add(M(new THREE.BoxGeometry(W, .1, L), sm('#2A3048', { roughness: .8 }), 0, -.05, -L / 2 + 3));
    scene.add(M(new THREE.BoxGeometry(W, .1, L), sm('#C8CCD8', { roughness: .9 }), 0, H, -L / 2 + 3));
    for (const s of [-1, 1]) { scene.add(M(new THREE.BoxGeometry(.1, H, L), sm('#D8DCE4', { roughness: .9 }), s * W / 2, H / 2, -L / 2 + 3));
      for (let z = 1; z > -L + 3; z -= 2.2) { const v = M(rbox(.9, .6, .05, .14), sm('#05070E', { roughness: .1, metalness: .6 }), s * (W / 2 - .06), 1.6, z); v.rotation.y = Math.PI / 2; scene.add(v); } }
    // luces de techo frías
    for (let z = 1; z > -L + 3; z -= 3) for (const x of [-2.2, 2.2]) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.4, .02, .35), new THREE.MeshBasicMaterial({ color: HDR(1.0, 1.05, 1.2) })); p.position.set(x, H - .02, z); scene.add(p); }
    for (let z = 0; z > -L + 3; z -= 5) { const l = new THREE.PointLight('#DDE6FF', .7, 9, 1.4); l.position.set(0, H - .4, z); scene.add(l); }
    const frontal = new THREE.PointLight('#C8D4FF', 1.2, 12, 1.2); frontal.position.set(2, 1.8, 3); scene.add(frontal);
    // altavoz del techo con anillos
    const alt = new THREE.Group(); alt.position.set(0, H - .03, -1.2); scene.add(alt);
    alt.add(M(new THREE.CylinderGeometry(.32, .32, .04, 32), sm('#E8EAF0', { roughness: .5 }), 0, 0, 0)); const rej = M(new THREE.CylinderGeometry(.26, .26, .02, 32), sm('#3A3E48', { roughness: .6, metalness: .4 }), 0, -.025, 0); alt.add(rej);
    const anillos = []; for (let i = 0; i < 4; i++) { const a = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 64), new THREE.MeshBasicMaterial({ color: HDR(1.6, 1.7, 2), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })); a.rotation.x = Math.PI / 2; a.position.set(0, H - .07, -1.2); scene.add(a); anillos.push(a); }
    // filas de asientos con pasajeros
    const asM = sm('#2A4A8A', { roughness: .85 }), asM2 = sm('#22283A');
    const gente = F.multitud(40, o.seed || 7); let n = 0; const sentados = [], telefonos = [];
    for (let fila = 0; fila < 7; fila++) for (const x0 of [-3.1, -2.4, -1.7, 1.7, 2.4, 3.1]) {
      const z = -fila * 1.35; const as = new THREE.Group(); as.position.set(x0, 0, z); scene.add(as);
      as.add(M(rbox(.62, .12, .58, .04), asM, 0, .46, 0)); as.add(M(rbox(.62, .7, .12, .05), asM, 0, .86, -.28)); as.add(M(new THREE.BoxGeometry(.06, .46, .5), asM2, -.3, .23, 0));
      if (o.vacio && o.vacio(fila, x0)) continue; const p = gente[n++ % gente.length].clone(); const ud = gente[(n - 1) % gente.length].userData;
      p.position.set(x0, .02, z + .02); p.scale.setScalar(.92); scene.add(p);
      // piernas hacia delante (sentados)
      p.children.forEach(c => { if (c.isGroup && c.position.y === .7) { c.rotation.x = -Math.PI / 2; c.position.z = .02; } }); p.position.y = -.2;
      sentados.push(p);
      const cabeza = p.children.find(c => c.isGroup && Math.abs(c.position.y - 1.45) < .01);
      if (o.moviles) { const tel = new THREE.Mesh(new THREE.BoxGeometry(.08, .15, .012), new THREE.MeshBasicMaterial({ color: HDR(1.4, 1.6, 2.0), toneMapped: false })); tel.position.set(0, 1.08, .32); tel.rotation.x = -.9; p.add(tel); telefonos.push(tel);
        p.children.forEach(c => { if (c.isGroup && Math.abs(c.position.y - 1.18) < .01) { c.rotation.x = -1.15; c.rotation.z = -Math.sign(c.position.x) * .35; } });
        if (cabeza) cabeza.rotation.x = .38;
        const luz = N.glow('#BFD4FF', .5, .5); luz.position.set(0, 1.25, .3); p.add(luz); }
    }
    const pose = camino(o.camino);
    const upd = t => { const [p, l] = pose(t); mira(cam, p, l, o.fov || 44);
      anillos.forEach((a, i) => { const u = o.anillos ? ((t - o.anillos - i * .38) % 1.6) / 1.6 : -1; a.visible = o.anillos && t > o.anillos && u >= 0; if (!a.visible) return; a.scale.setScalar(.25 + u * 1.6); a.material.opacity = (1 - u) * .85; });
      if (o.parpadeo) telefonos.forEach((tl, i) => tl.material.color.setScalar(1.4 + .2 * Math.sin(t * 2 + i))); };
    return { scene, cam, upd, sentados, post: t => Object.assign({ focus: 4, ap: .18, bloom: .8, umbral: 1.2 }, o.post ? o.post(t) : {}) };
  }

  // ---------------- mapa de ruta (escena 4) ----------------
  function escMapa(T, o = {}) {
    const scene = nueva('#06080F'); const cam = camara(40);
    const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920; const x = cv.getContext('2d'); const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    const plano = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.92), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scene.add(plano);
    // costa (Península arriba a la izquierda, Mallorca abajo a la derecha) — formas simplificadas
    const costa = [[0, 330], [120, 360], [230, 330], [330, 380], [420, 520], [450, 640], [400, 760], [330, 880], [290, 1000], [220, 1120], [130, 1220], [0, 1260]];
    const isla = [[650, 1180], [760, 1120], [880, 1150], [960, 1240], [950, 1350], [880, 1430], [760, 1450], [690, 1400], [640, 1300]];
    const P0 = [395, 620], P1 = [745, 1300];
    const pint = (k, tt) => { x.fillStyle = '#0B1C3A'; x.fillRect(0, 0, 1080, 1920);
      x.strokeStyle = 'rgba(80,120,200,.12)'; x.lineWidth = 2; for (let i = 0; i < 1080; i += 90) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 1920); x.stroke(); } for (let j = 0; j < 1920; j += 90) { x.beginPath(); x.moveTo(0, j); x.lineTo(1080, j); x.stroke(); }
      const forma = (pts, cerrar) => { x.beginPath(); x.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) { const m = [(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]; x.quadraticCurveTo(pts[i - 1][0], pts[i - 1][1], m[0], m[1]); } if (cerrar) x.closePath(); };
      x.fillStyle = '#1C3A2A'; forma(costa.concat([[0, 1260]])); x.lineTo(0, 330); x.fill(); x.strokeStyle = '#3A6A4A'; x.lineWidth = 4; forma(costa); x.stroke();
      x.fillStyle = '#1C3A2A'; forma(isla, true); x.fill(); x.stroke();
      // ruta
      x.setLineDash([22, 16]); x.strokeStyle = 'rgba(255,210,58,.45)'; x.lineWidth = 8; x.beginPath(); x.moveTo(...P0); x.quadraticCurveTo(620, 820, ...P1); x.stroke(); x.setLineDash([]);
      const q = (u) => { const a = 1 - u; return [a * a * P0[0] + 2 * a * u * 620 + u * u * P1[0], a * a * P0[1] + 2 * a * u * 820 + u * u * P1[1]]; };
      x.strokeStyle = '#FFD23A'; x.lineWidth = 9; x.beginPath(); x.moveTo(...P0); for (let u = 0; u <= k; u += .01) x.lineTo(...q(u)); x.stroke();
      for (const [p, nom, dx] of [[P0, 'BARCELONA', -20], [P1, 'PALMA', 30]]) { x.fillStyle = '#FFD23A'; x.beginPath(); x.arc(p[0], p[1], 16, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 5; x.stroke(); x.fillStyle = '#fff'; x.font = '900 40px Nunito, sans-serif'; x.textAlign = dx < 0 ? 'right' : 'left'; x.fillText(nom, p[0] + dx, p[1] - 26); }
      // barquito
      const b = q(k), b2 = q(Math.min(1, k + .01)), ang = Math.atan2(b2[1] - b[1], b2[0] - b[0]);
      x.save(); x.translate(b[0], b[1]); x.rotate(ang); x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.arc(0, 0, 44 + 8 * Math.sin(tt * 4), 0, 7); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.moveTo(30, 0); x.lineTo(14, -14); x.lineTo(-26, -14); x.lineTo(-26, 14); x.lineTo(14, 14); x.closePath(); x.fill(); x.fillStyle = '#D8262E'; x.fillRect(-26, 4, 46, 6); x.fillStyle = '#1C2A4A'; x.fillRect(-14, -8, 18, 16); x.restore();
      // panel inferior
      x.fillStyle = 'rgba(8,12,24,.88)'; x.beginPath(); x.roundRect(60, 1480, 820, 300, 30); x.fill(); x.strokeStyle = 'rgba(255,210,58,.6)'; x.lineWidth = 3; x.stroke();
      const min = Math.round(lerp(460, 12, k)); x.textAlign = 'left'; x.fillStyle = '#9AA6C0'; x.font = '800 30px Nunito, sans-serif'; x.fillText('TIEMPO HASTA EL DESTINO', 100, 1540); x.fillText('LLEGADA', 600, 1540);
      x.fillStyle = '#fff'; x.font = '900 64px Nunito, sans-serif'; x.fillText(`${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`, 100, 1620); x.fillText('07:15', 600, 1620);
      x.fillStyle = '#FFD23A'; x.font = '900 40px Nunito, sans-serif'; x.fillText('BARCELONA → PALMA', 100, 1720); tex.needsUpdate = true; };
    const upd = t => { const k = ease(prog(t, o.a + .4, o.b - .6)); pint(k, t); const z = lerp(2.6, 2.1, ease(prog(t, o.a, o.b))); mira(cam, V3(.05 - .1 * prog(t, o.a, o.b), -.05, z), V3(0, -.02, 0)); plano.rotation.set(-.12, .06, 0); };
    return { scene, cam, upd, post: () => ({ focus: 2.3, ap: .1, bloom: .6, umbral: 1.3 }) };
  }

  // ---------------- camarote con ojo de buey (escenas 7a y 9) ----------------
  function escCamarote(T, o = {}) {
    const scene = nueva('#0A0E1C'); const cam = camara(36);
    scene.add(new THREE.HemisphereLight('#8A96D8', '#141018', .35));
    const lamp = new THREE.PointLight('#DDE4FF', 1.2, 6, 1.5); lamp.position.set(.3, 2.3, .8); scene.add(lamp);
    scene.add(M(new THREE.BoxGeometry(5, 3, .1), sm('#C8CCD6', { roughness: .9 }), 0, 1.5, -1.2));
    scene.add(M(new THREE.BoxGeometry(.1, 3, 5), sm('#B8BCC8', { roughness: .9 }), -1.6, 1.5, 0)); scene.add(M(new THREE.BoxGeometry(5, .1, 5), sm('#2A3048'), 0, 0, 0));
    // litera
    scene.add(M(rbox(1.0, .3, 2.0, .05), sm('#2A4A8A'), -1.0, .45, -.1)); scene.add(M(new THREE.BoxGeometry(1.0, .25, 2.0), sm('#3A3E48'), -1.0, .18, -.1)); scene.add(M(rbox(.5, .14, .35, .05), sm('#F2F2F6'), -1.0, .66, -.95));
    // ojo de buey: aro metálico, cristal, mar oscuro con luna; cortina
    const ob = new THREE.Group(); ob.position.set(.35, 1.55, -1.07); scene.add(ob);
    ob.add(M(new THREE.TorusGeometry(.32, .06, 16, 48), sm('#9AA2B0', { metalness: .8, roughness: .3 })));
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ob.add(M(new THREE.SphereGeometry(.018, 8, 6), sm('#C8CCD4', { metalness: .8 }), Math.cos(a) * .32, Math.sin(a) * .32, .05)); }
    const marT = texto(512, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0A1030'); g.addColorStop(.55, '#1A2050'); g.addColorStop(.56, '#060A18'); g.addColorStop(1, '#03050C'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#E8ECFF'; x.beginPath(); x.arc(340, 150, 34, 0, 7); x.fill(); x.fillStyle = 'rgba(200,210,255,.35)'; for (let i = 0; i < 10; i++) x.fillRect(300 + (i % 3) * 8, 300 + i * 14, 80 - i * 6, 3); });
    const vista = new THREE.Mesh(new THREE.CircleGeometry(.31, 48), new THREE.MeshBasicMaterial({ map: marT, toneMapped: false })); vista.position.z = -.01; ob.add(vista);
    const azul = new THREE.Mesh(new THREE.CircleGeometry(.31, 48), new THREE.MeshBasicMaterial({ color: '#2A6AFF', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); azul.position.z = .015; azul.renderOrder = 5; ob.add(azul);
    const cort = M(new THREE.BoxGeometry(.8, .9, .03, 8, 1, 1), sm('#7A2A30', { roughness: 1 }), 0, 0, .08); ob.add(cort); { const p = cort.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + .025 * Math.sin(p.getX(i) * 30)); cort.geometry.computeVertexNormals(); }
    { const barr = M(new THREE.CylinderGeometry(.01, .01, 1.0), sm('#C8CCD4', { metalness: .8 }), 0, .47, .1); barr.rotation.z = Math.PI / 2; ob.add(barr); }
    // protagonista sentado en la litera, con el móvil
    const yo = F.personaje(F.PROTA); yo.position.set(-.7, .25, .2); yo.rotation.y = .7; scene.add(yo); yo.children.forEach(c => { if (c.isGroup && c.position.y === .7) { c.rotation.x = -Math.PI / 2; } });
    yo.children.forEach(c => { if (c.isGroup && Math.abs(c.position.y - 1.18) < .01) c.rotation.x = -1.1; });
    const tel = new THREE.Mesh(new THREE.BoxGeometry(.08, .15, .012), new THREE.MeshBasicMaterial({ color: HDR(1.6, 1.4, 1.8), toneMapped: false })); tel.position.set(0, 1.0, .42); tel.rotation.x = -1.1; tel.material.color = HDR(.9, .85, 1.1); yo.add(tel);
    const mano = F.mano(); mano.scale.setScalar(2.2); mano.rotation.set(0, 0, -.4); scene.add(mano);
    const upd = t => {
      if (o.modo === 'palido') { const k = ease(prog(t, T.palido, T.palido + 1.2)); yo.palido(k); yo.userData.cabeza.rotation.set(.2 - .25 * k, 0, 0);
        mira(cam, V3(lerp(.6, .35, ease(prog(t, o.a, o.b))), 1.45, lerp(1.5, 1.1, ease(prog(t, o.a, o.b)))), V3(-.6, 1.5, .2)); mano.visible = false; cort.position.x = 0; }
      else { const k = ease(prog(t, T.cortina, T.cortina + .55)); cort.position.x = -.62 * k; cort.scale.x = 1 - .4 * k;
        mano.visible = true; mano.position.set(ob.position.x + .3 - .62 * k, ob.position.y - .12, ob.position.z + .2);
        azul.material.opacity = k * (.25 + .25 * Math.max(0, Math.sin(t * 9))); mira(cam, V3(.5, 1.48, .25), V3(.33, 1.52, -1.14)); }
    };
    return { scene, cam, upd, post: () => ({ focus: o.modo === 'palido' ? 1.3 : 1.4, ap: o.modo === 'palido' ? .3 : .12, bloom: .8, umbral: 1.1 }) };
  }

  // ---------------- muelle vacío con coches de luces azules (escenas 10 y 11) ----------------
  function escMuelle(T, o = {}) {
    const scene = nueva('#060914', [40, 200]); const cam = camara(o.fov || 44);
    scene.add(new THREE.HemisphereLight('#3A4A90', '#08080E', .45));
    const W = agua(scene);
    const barco = F.barco(); barco.position.set(0, 0, -6); scene.add(barco); const rb = reflejo(scene, barco); rb.position.copy(barco.position);
    const piso = M(new THREE.BoxGeometry(90, 2, 40), sm('#3A3E48', { roughness: .9 }), 0, .2, 18); scene.add(piso);
    const tex = texto(256, 256, (x) => { x.fillStyle = '#E8C83A'; x.fillRect(0, 0, 256, 18); }); scene.add(M(new THREE.BoxGeometry(90, .02, .4), sm('#E8C83A'), 0, 1.22, .3));
    for (let i = 0; i < 4; i++) { const f = M(new THREE.CylinderGeometry(.18, .18, 12), sm('#2A2C34'), -30 + i * 20, 7.2, 30); scene.add(f); const sp = new THREE.SpotLight('#E8F0FF', 2.4, 60, .7, .5, 1.2); sp.position.set(-30 + i * 20, 13, 30); sp.target.position.set(-30 + i * 20, 0, 8); scene.add(sp, sp.target); const gl = glowS('#E8F0FF', 3, .9); gl.position.set(-30 + i * 20, 13.2, 30); scene.add(gl); }
    // coches blancos con barras de luces azules
    const coches = [], azules = []; const r = rng(9);
    for (let i = 0; i < 12; i++) { const c = new THREE.Group(); const ang = (i / 12) * Math.PI - Math.PI; const x = Math.cos(ang) * 22 + (r() - .5) * 3, z = 9 + Math.abs(Math.sin(ang)) * 9 + (r() - .5) * 2; c.position.set(x, 1.2, z); c.rotation.y = Math.atan2(-x, -(z - 4)) + (r() - .5) * .3; scene.add(c);
      c.add(M(rbox(1.9, .8, 4.4, .2), sm('#F2F4F6', { roughness: .35 }), 0, .7, 0)); c.add(M(rbox(1.7, .7, 2.4, .2), sm('#F2F4F6', { roughness: .35 }), 0, 1.35, -.2)); c.add(M(new THREE.BoxGeometry(1.72, .5, 2.2), sm('#1A2230', { roughness: .1, metalness: .6 }), 0, 1.38, -.2));
      for (const s of [-1, 1]) for (const zz of [-1.4, 1.4]) { const ru = M(new THREE.CylinderGeometry(.38, .38, .3, 14), sm('#141418'), s * .9, .38, zz); ru.rotation.z = Math.PI / 2; c.add(ru); }
      const barra = M(new THREE.BoxGeometry(1.2, .12, .3), sm('#2A2C34'), 0, 1.76, -.2); c.add(barra);
      for (const s of [-1, 1]) { const l = glowS('#3A7AFF', 2.2, 1); l.position.set(s * .4, 1.85, -.2); c.add(l); azules.push([l, i, s]); }
      const fa = glowS('#FFFFFF', 1.2, .9); fa.position.set(0, .8, 2.25); c.add(fa); coches.push(c); }
    const luzAz = new THREE.PointLight('#3A6AFF', 0, 40, 1.4); luzAz.position.set(0, 4, 14); scene.add(luzAz);
    // pasarela y trajes blancos
    const pas = new THREE.Group(); pas.position.set(4, 3.6, -2.4); scene.add(pas); const tabla = M(new THREE.BoxGeometry(1.6, .12, 7), sm('#9AA2AE', { metalness: .5, roughness: .4 }), 0, 0, 3.5); pas.add(tabla);
    for (const s of [-1, 1]) pas.add(M(new THREE.BoxGeometry(.05, .9, 7), sm('#C8CCD4', { metalness: .6 }), s * .78, .45, 3.5));
    const trajes = F.multitud(7, 31, { traje: true, ropa: '#ECEEF2', pantalon: '#ECEEF2' });
    trajes.forEach((p, i) => { p.position.set(4 + (i - 3) * .9, 1.2, 8.6 + (i % 2) * .7); p.rotation.y = Math.PI + (i - 3) * .05; p.scale.setScalar(1.15); scene.add(p); });
    const upd = t => { W.upd(t);
      azules.forEach(([l, i, s]) => { const ph = Math.sin(t * 12 + i * 1.3 + (s > 0 ? Math.PI : 0)); l.material.opacity = ph > 0 ? 1 : .15; l.scale.setScalar(ph > 0 ? 2.4 : 1.2); });
      luzAz.intensity = 4 + 3 * Math.max(0, Math.sin(t * 12));
      const kp = o.pasarela ? ease(prog(t, T.pasarela, T.pasarela + 2.2)) : 1; pas.rotation.x = lerp(-1.2, -.42, kp);
      trajes.forEach(p => p.visible = !!o.trajes);
      if (o.pose) { const [p, l] = o.pose(t); mira(cam, p, l); } };
    return { scene, cam, upd, post: () => ({ focus: o.focus || 30, ap: o.ap || .03, bloom: 1.1, umbral: .95 }) };
  }

  // ---------------- muñeca con pulsera (escena 12) ----------------
  function escPulsera(T, o = {}) {
    const scene = nueva('#0C1020'); const cam = camara(30);
    scene.add(new THREE.HemisphereLight('#AAB8F0', '#141018', .6)); const k1 = new THREE.DirectionalLight('#FFFFFF', 1.3); k1.position.set(1, 2, 2); scene.add(k1);
    scene.add(M(new THREE.PlaneGeometry(6, 6), sm('#1A2034', { roughness: 1 }), 0, 0, -1.2));
    const brazo = M(new THREE.CylinderGeometry(.075, .085, 1.2, 24), sm(F.PROTA.piel, { roughness: .6 }), 0, 0, 0); brazo.rotation.z = Math.PI / 2; scene.add(brazo);
    const manga = M(new THREE.CylinderGeometry(.1, .11, .6, 24), sm(F.PROTA.ropa), -.75, 0, 0); manga.rotation.z = Math.PI / 2; scene.add(manga);
    const manoP = M(rbox(.16, .2, .07, .03), sm(F.PROTA.piel, { roughness: .6 }), .66, 0, 0); manoP.rotation.z = Math.PI / 2; scene.add(manoP);
    const pT = texto(1024, 160, (x, w, h) => { x.fillStyle = '#F4F4F2'; x.fillRect(0, 0, w, h); x.fillStyle = '#16161C'; const r = rng(3); let xx = 40; while (xx < 420) { const ww = 2 + Math.floor(r() * 6); x.fillRect(xx, 30, ww, 100); xx += ww + 2 + Math.floor(r() * 5); }
      x.font = '900 46px Nunito, sans-serif'; x.textAlign = 'left'; x.fillText('FERRY 0614', 450, 70); x.font = '700 28px Nunito, sans-serif'; x.fillStyle = '#6A6A74'; x.fillText('PASAJERO', 452, 118); x.fillStyle = '#16161C'; x.font = '900 120px Nunito, sans-serif'; x.fillText('112', 760, 128); });
    const pul = new THREE.Mesh(new THREE.CylinderGeometry(.088, .088, .07, 48, 1, true), new THREE.MeshStandardMaterial({ map: pT, roughness: .5, side: THREE.DoubleSide })); pul.rotation.z = Math.PI / 2; pul.rotation.x = -1.2; pul.position.set(.38, 0, 0); scene.add(pul);
    const guante = F.dedo('#ECEEF2', '#ECEEF2'); guante.scale.setScalar(1.6); scene.add(guante);
    const upd = t => { const k = ease(prog(t, T.pulsera, T.pulsera + 1.0)); pul.position.x = lerp(.75, .38, k); pul.scale.setScalar(lerp(1.25, 1, k));
      guante.scale.setScalar(1.1); guante.position.set(lerp(.85, .55, k), .16, .16); guante.rotation.set(.3, .4, 2.6);
      const kc = ease(prog(t, o.a, o.b)); mira(cam, V3(lerp(.55, .4, kc), lerp(.18, .1, kc), lerp(1.0, .62, kc)), V3(.36, 0, 0)); };
    return { scene, cam, upd, post: () => ({ focus: .65, ap: .35, bloom: .6, umbral: 1.2 }) };
  }

  // ---------------- terminal de llegadas (escena 13) ----------------
  function escTerminal(T, o = {}) {
    const scene = nueva('#0E1220', [10, 40]); const cam = camara(46);
    scene.add(new THREE.HemisphereLight('#B8C4F0', '#181418', .55));
    scene.add(M(new THREE.BoxGeometry(14, .1, 30), sm('#8A8E98', { roughness: .3, metalness: .1 }), 0, -.05, -10)); scene.add(M(new THREE.BoxGeometry(14, .1, 30), sm('#2A2E3A'), 0, 4.2, -10));
    for (const s of [-1, 1]) scene.add(M(new THREE.BoxGeometry(.1, 4.2, 30), sm('#C8CCD4'), s * 7, 2.1, -10));
    for (let z = 2; z > -24; z -= 3.5) { const p = new THREE.Mesh(new THREE.BoxGeometry(3, .03, .5), new THREE.MeshBasicMaterial({ color: HDR(1.8, 1.9, 2.1) })); p.position.set(0, 4.14, z); scene.add(p); const l = new THREE.PointLight('#E8EEFF', .8, 10, 1.4); l.position.set(0, 3.8, z); scene.add(l); }
    const letT = texto(1024, 220, (x, w, h) => { x.fillStyle = '#16181E'; x.fillRect(0, 0, w, h); x.fillStyle = '#FFD23A'; x.font = '900 92px Nunito, sans-serif'; x.textAlign = 'center'; x.fillText('LLEGADAS · ARRIVALS', w / 2, 112); x.font = '900 70px Nunito, sans-serif'; x.fillText('↓', w / 2, 196); });
    const let1 = new THREE.Mesh(new THREE.PlaneGeometry(3.4, .73), new THREE.MeshBasicMaterial({ map: letT, toneMapped: false })); let1.position.set(0, 3.4, -9); scene.add(let1);
    // cintas separadoras y gente detrás, mirándote
    const postes = sm('#C8CCD4', { metalness: .8, roughness: .3 }), cinta = sm('#2A3A8A');
    const gente = F.multitud(22, 13); const mir = [];
    for (const s of [-1, 1]) { for (let z = 0; z > -14; z -= 1.6) { scene.add(M(new THREE.CylinderGeometry(.04, .04, .95), postes, s * 1.3, .47, z)); scene.add(M(new THREE.CylinderGeometry(.13, .13, .03), postes, s * 1.3, .01, z)); scene.add(M(new THREE.BoxGeometry(.02, .06, 1.6), cinta, s * 1.3, .88, z - .8)); }
      for (let i = 0; i < 11; i++) { const p = gente[(s > 0 ? 11 : 0) + i]; p.position.set(s * (1.9 + (i % 2) * .7), 0, -i * 1.25 + (i % 2) * .4); p.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(p); mir.push(p); } }
    const upd = t => { const k = prog(t, o.a, o.b); const cz = lerp(3.2, -2.5, k); mira(cam, V3(0, 1.6, cz), V3(0, 1.75, cz - 8));
      mir.forEach((p, i) => { const dz = cam.position.z - p.position.z; const yaw = Math.atan2(cam.position.x - p.position.x, dz) - p.rotation.y; const kk = ease(prog(t, o.a + .2 + i * .04, o.a + 1.0 + i * .04)); p.userData.cabeza.rotation.y = lerp(0, clamp(yaw, -1.2, 1.2), kk); }); };
    return { scene, cam, upd, post: () => ({ focus: 5, ap: .12, bloom: .8, umbral: 1.2 }) };
  }

  // ---------------- sala de interrogatorio (escena 15) ----------------
  function escSala(T, o = {}) {
    const scene = nueva('#06070C'); const cam = camara(40);
    scene.add(new THREE.HemisphereLight('#5A64A0', '#08080C', .45)); const rel = new THREE.PointLight('#8A9AE0', 1.4, 8, 1.4); rel.position.set(2.5, 1.8, 1.5); scene.add(rel);
    const sp = new THREE.SpotLight('#F2F4FF', 6, 8, .55, .45, 1.2); sp.position.set(0, 3.2, 0); sp.target.position.set(0, 0, 0); sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); scene.add(sp, sp.target);
    const cono = new THREE.Mesh(new THREE.ConeGeometry(1.7, 3, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#DDE4FF', transparent: true, opacity: .05, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); cono.position.set(0, 1.6, 0); scene.add(cono);
    scene.add(M(new THREE.BoxGeometry(10, .1, 10), sm('#2A2E38'), 0, -.05, 0)); for (const [x, z, ry] of [[0, -3.5, 0], [-3.5, 0, Math.PI / 2], [3.5, 0, Math.PI / 2]]) { const w = M(new THREE.BoxGeometry(7, 3.4, .1), sm('#3A404C', { roughness: .95 }), x, 1.7, z); w.rotation.y = ry; scene.add(w); }
    scene.add(M(new THREE.CylinderGeometry(.25, .4, .2, 20, 1, true), sm('#2A2C34', { side: THREE.DoubleSide }), 0, 3.1, 0)); const bomb = glowS('#FFFFFF', .5, 1); bomb.position.set(0, 3.0, 0); scene.add(bomb);
    scene.add(M(new THREE.BoxGeometry(1.6, .06, .9), sm('#8A8E98', { metalness: .5, roughness: .4 }), 0, .78, 0)); for (const x of [-.75, .75]) for (const z of [-.4, .4]) scene.add(M(new THREE.BoxGeometry(.05, .78, .05), sm('#5A5E68'), x, .39, z));
    const hojaT = texto(512, 700, (x, w, h) => { x.fillStyle = '#F4F2EC'; x.fillRect(0, 0, w, h); x.fillStyle = '#2A2A34'; x.font = '800 30px Nunito, sans-serif'; x.fillText('DECLARACIÓN · PASAJERO 112', 30, 60); x.fillRect(30, 76, 450, 3);
      x.font = '600 26px Nunito, sans-serif'; for (let i = 0; i < 11; i++) { const y = 130 + i * 50; if (i % 2 === 0) { x.fillStyle = '#C81E26'; x.font = '800 30px Nunito, sans-serif'; x.fillText('— no recuerda', 40, y); } else { x.fillStyle = '#8A8A94'; x.fillRect(40, y - 18, 300 + (i * 37) % 120, 8); } } });
    const hoja = new THREE.Mesh(new THREE.PlaneGeometry(.32, .44), new THREE.MeshStandardMaterial({ map: hojaT, roughness: .8 })); hoja.rotation.set(-Math.PI / 2, 0, .12); hoja.position.set(.05, .815, .05); scene.add(hoja);
    { const pluma = M(new THREE.CylinderGeometry(.008, .008, .16), sm('#16161C'), .28, .82, .12); pluma.rotation.set(Math.PI / 2, 0, .6); scene.add(pluma); }
    const silla = (x, z, ry) => { const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = ry; s.add(M(new THREE.BoxGeometry(.5, .05, .5), sm('#3A3E48'), 0, .46, 0)); s.add(M(new THREE.BoxGeometry(.5, .5, .05), sm('#3A3E48'), 0, .72, -.24)); scene.add(s); };
    silla(0, .85, Math.PI); silla(0, -.85, 0);
    const yo = F.personaje(F.PROTA); yo.position.set(0, -.2, .9); yo.rotation.y = Math.PI; yo.children.forEach(c => { if (c.isGroup && c.position.y === .7) c.rotation.x = -Math.PI / 2; }); scene.add(yo);
    const agM = { ropa: '#1A1E2A', pantalon: '#1A1E2A' }; const ag = [F.personaje(Object.assign({ piel: '#A86B44', pelo: 'rapado' }, agM)), F.personaje(Object.assign({ piel: '#EDC9A8', pelo: 'corto', colPelo: '#6A6A6E' }, agM)), F.personaje(Object.assign({ piel: '#7A4A2C', pelo: 'barba' }, agM))];
    ag[0].position.set(0, -.2, -.85); ag[0].children.forEach(c => { if (c.isGroup && c.position.y === .7) c.rotation.x = -Math.PI / 2; });
    ag[1].position.set(-1.4, 0, -2.4); ag[2].position.set(1.4, 0, -2.4); ag.forEach(a => scene.add(a));
    const upd = t => { const k = ease(prog(t, o.a, o.b)); mira(cam, V3(lerp(2.9, 2.3, k), lerp(2.5, 2.2, k), lerp(2.9, 3.2, k)), V3(-.1, .95, -1.0), 44);
      const km = ease(prog(t, T.semiran || 71.7, (T.semiran || 71.7) + .5)); ag[1].userData.cabeza.rotation.y = .9 * km; ag[2].userData.cabeza.rotation.y = -.9 * km;
      ag[0].userData.cabeza.rotation.x = .1 * Math.sin(t * .8); };
    return { scene, cam, upd, post: () => ({ focus: 2.8, ap: .18, bloom: .9, umbral: 1.0, oscuro: .2 }) };
  }

  // ---------------- pasillo con cristal: los pasajeros en fila hacia la puerta (escena 16) ----------------
  function escPasilloCristal(T, o = {}) {
    const P = E.escPasillo(T, o), scene = P.scene, cam = P.cam;
    // otra puerta al fondo del pasillo de al lado (detrás del cristal) con letrero y luz blanca
    const X = 2.5, Z = -12.5;
    const marco = M(new THREE.BoxGeometry(1.4, 2.3, .1), sm('#C8D0DC'), X, 1.15, Z); scene.add(marco);
    const luz = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0), new THREE.MeshBasicMaterial({ color: HDR(3, 3.1, 3.3), toneMapped: false })); luz.position.set(X, 1.0, Z + .06); scene.add(luz);
    const hoja = M(new THREE.BoxGeometry(1.02, 2.02, .06), sm('#9AA2AE', { metalness: .6, roughness: .35 }), X, 1.01, Z + .1); scene.add(hoja);
    const letT = texto(512, 128, (x, w, h) => { x.fillStyle = '#C81E26'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '900 62px Nunito, sans-serif'; x.textAlign = 'center'; x.fillText('SOLO PERSONAL', w / 2, 86); });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .25), new THREE.MeshBasicMaterial({ map: letT, toneMapped: false })); sign.position.set(X, 2.4, Z + .08); scene.add(sign);
    const bl = new THREE.PointLight('#F0F4FF', 0, 6, 1.4); bl.position.set(X, 1.2, Z + .8); scene.add(bl);
    const fila = F.multitud(9, 51); fila.forEach((p, i) => { p.rotation.y = Math.PI; scene.add(p); });
    const upd = t => {
      const ab = t < T.puertaCierra - .9 ? ease(prog(t, o.a + .2, o.a + 1.2)) : 1 - ease(prog(t, T.puertaCierra - .9, T.puertaCierra));
      hoja.position.x = X + 1.05 * ab; bl.intensity = 3 * ab; luz.visible = ab > .01;
      fila.forEach((p, i) => { const z = -3 - (t - o.a) * .95 + i * 1.05; p.position.set(X + Math.sin(i * 1.7) * .08, 0, Math.max(Z - .3, z)); p.visible = z > Z + .1 || (z > Z - .2 && ab > .3);
        const ph = (t * 3.4 + i) % (Math.PI * 2); p.userData.piernas[0].rotation.x = .35 * Math.sin(ph); p.userData.piernas[1].rotation.x = -.35 * Math.sin(ph); p.userData.brazos[0].rotation.x = -.25 * Math.sin(ph); p.userData.brazos[1].rotation.x = .25 * Math.sin(ph); });
      const k = ease(prog(t, o.a, o.b)); mira(cam, V3(lerp(-.7, -.5, k), 1.5, lerp(.6, -.6, k)), V3(X, 1.25, lerp(-6.0, -8.5, k)), 50);
    };
    return { scene, cam, upd, post: () => ({ focus: 6, ap: .08, bloom: .7, umbral: 1.4, oscuro: .35 }) };
  }

  // ---------------- orden de la parte 1 ----------------
  function crear(renderer, T) {
    const C = T.cortes, sp = (i) => ({ a: C[i], b: C[i + 1] || T.end });
    const fondoPantalla = (k = 0) => ({});
    const lista = [];
    const add = (i, esc) => lista.push(Object.assign(esc, sp(i)));
    add(0, escPuerto(T, sp(0)));
    add(1, escTel(T, Object.assign(sp(1), { pintar: (t, mv) => mv.dibujar('bloqueo', { anio: t < T.anioRueda ? 2026 : 2026 + 7 * ease(prog(t, T.anioRueda, T.anioRueda + .75)), mas7: prog(t, T.mas7, T.mas7 + .45) }) })));
    add(2, escSalon(T, Object.assign(sp(2), { moviles: true, parpadeo: true, fov: 42, camino: [[C[2], [4.6, 1.45, 4.2], [2.3, .95, -3]], [C[3], [3.4, 1.35, 3.6], [2.0, .95, -3.5]]] })));
    add(3, escMapa(T, sp(3)));
    add(4, escTel(T, Object.assign(sp(4), { seed: 3, dedo: t => { const k = ease(prog(t, T.toqueRed - .6, T.toqueRed)), k2 = ease(prog(t, T.toqueRed + .15, T.toqueRed + .6)); return [lerp(.07, .019, k) + .06 * k2, lerp(-.05, .022, k) - .05 * k2, lerp(.04, .012, k) + .04 * k2, t < T.toqueRed + .9]; },
      pintar: (t, mv) => t < T.toqueRed + .7 ? mv.dibujar('control', { toque: prog(t, T.toqueRed - .1, T.toqueRed + .4) }) : mv.dibujar('bloqueo', { anio: 2026, red: prog(t, T.toqueRed + .7, T.toqueRed + 1.0), t }) })));
    const NOT = [{ de: 'Mamá', txt: 'Llámame', hace: 'hace 7 años' }, { de: 'Hermano', txt: '¿Dónde estás?', hace: 'hace 6 años' }, { de: 'Banco', txt: 'Su cuenta ha sido cerrada', hace: 'hace 4 años' }, { de: 'Mamá', txt: 'Hoy habrías cumplido 35', hace: 'hace 1 año' },
      { de: 'Laura', txt: 'Te echo de menos', hace: 'hace 5 años' }, { de: 'Trabajo', txt: 'Baja definitiva', hace: 'hace 6 años' }, { de: 'Mamá', txt: '¿Estás ahí?', hace: 'hace 7 años' }];
    add(5, escTel(T, Object.assign(sp(5), { seed: 5, z0: .42, z1: .34, ly: -.01, vibra: t => { const k = prog(t, T.mensajes0, C[6]); const per = lerp(1.1, .25, k); return ((t - T.mensajes0) % per) < per * .45 && t > T.mensajes0 ? 1 : 0; },
      pintar: (t, mv) => { const s = T.saltos; const anio = t < s[0] ? 2026 : t < s[1] ? 2027 : t < s[2] ? 2030 : 2033; const n = Math.floor(clamp((t - T.mensajes0) / (C[6] - .6 - T.mensajes0)) ** 1.6 * 4210);
        const vis = []; const k = Math.max(0, (t - T.mensajes0) * 2.4); for (let i = 0; i < Math.min(NOT.length, Math.floor(k) + 1) && t >= T.mensajes0; i++) { const ki = k - i; vis.unshift(Object.assign({}, NOT[i], { a: clamp(ki * 2), dy: -40 * (1 - clamp(ki * 2)) })); }
        mv.dibujar('bloqueo', { anio, mas7: t >= s[2] ? 1 : 0, contador: t >= T.mensajes0 ? n : null, notifs: vis.slice(0, 4) }); } })));
    // 7: primero tu cara (camarote) y luego el salón, todos quietos mirando al frente
    const pal = escCamarote(T, Object.assign(sp(6), { modo: 'palido' })), quietos = escSalon(T, { seed: 9, fov: 48, camino: [[23.6, [2.6, 1.35, 3.4], [2.4, 1.0, -4]], [C[7], [2.2, 1.3, 2.6], [2.4, 1.0, -4]]] });
    lista.push(Object.assign(pal, { a: C[6], b: 23.6 })); lista.push(Object.assign(quietos, { a: 23.6, b: C[7] }));
    add(7, escSalon(T, Object.assign(sp(7), { seed: 11, anillos: T.dingdong + .6, fov: 50, camino: [[C[7], [.6, 1.1, 2.2], [0, 2.2, -1.6]], [C[8], [.3, 1.5, .8], [0, 2.8, -1.2]]] })));
    add(8, escCamarote(T, Object.assign(sp(8), { modo: 'cortina' })));
    add(9, escMuelle(T, Object.assign(sp(9), { pose: t => { const k = ease(prog(t, C[9], C[10])), a = lerp(.6, 1.15, k); return [V3(Math.cos(a) * 46, lerp(26, 18, k), Math.sin(a) * 46 + 8), V3(0, 2, 4)]; } })));
    add(10, escMuelle(T, Object.assign(sp(10), { pasarela: true, trajes: true, fov: 40, focus: 9, ap: .08, pose: t => { const k = ease(prog(t, C[10], C[11])); return [V3(lerp(12, 11, k), lerp(4.4, 3.8, k), lerp(17, 15.5, k)), V3(4, lerp(2.8, 2.2, k), 5.5)]; } })));
    add(11, escPulsera(T, sp(11)));
    add(12, escTerminal(T, sp(12)));
    add(13, E.escMemorial(T, sp(13)));
    add(14, escSala(T, Object.assign(sp(14))));
    add(15, escPasilloCristal(T, sp(15)));
    add(16, escTel(T, Object.assign(sp(16), { seed: 8, bg: '#06070C', pared: '#0A0C14', bokeh: '#5A6AA0', z0: .4, z1: .34, ly: -.008, vibra: t => (t > T.vibraFinal && t < T.vibraFinal + .5) || (t > T.vibraFinal + .8 && t < T.vibraFinal + 1.3) ? 1 : 0,
      pintar: (t, mv) => mv.dibujar('bloqueo', { anio: 2033, oscurecer: .55, propio: prog(t, T.vibraFinal, T.vibraFinal + .5), circulo: prog(t, T.circulo, T.circulo + .6) }) })));
    const fin = E.escPasillo(T, sp(17)); fin.upd = t => { mira(fin.cam, V3(-.1, 1.5, lerp(-2, -4.5, ease(prog(t, C[17], C[18])))), V3(0, 1.45, -fin.L)); }; fin.post = () => ({ focus: 6, ap: .12, bloom: .7, umbral: 1.3, oscuro: 1.2 }); add(17, fin);
    lista.push(Object.assign(escPuerto(T, { loop: C[18], fin: T.end }), { a: C[18], b: T.end + 1 }));
    lista.sort((p, q) => p.a - q.a);
    // miniaturas de las tarjetas
    const casa = E.escCasa(), pasB = E.escPasillo(T, {});
    const foto = (esc, prep) => { if (prep) prep(); renderer.setRenderTarget(null); renderer.render(esc.scene, esc.cam); const c = document.createElement('canvas'); c.width = 520; c.height = 392; c.getContext('2d').drawImage(renderer.domElement, 0, 560, 1080, 814, 0, 0, 520, 392); return c; };
    const miniaturas = { A: foto(casa), B: foto(pasB, () => mira(pasB.cam, V3(0, 1.5, -6), V3(0, 1.5, -pasB.L))) };
    return { lista, miniaturas };
  }
  Object.assign(window.ESC, { crear, escPuerto, escTel, escSalon, escMapa, escCamarote, escMuelle, escPulsera, escTerminal, escSala, escPasilloCristal });
})();
