/* Serie "Ferry" — escenarios (cada uno con su escena, cámara y animación). Reutilizables en la parte 2.
   window.ESC.crear(renderer, T) → { lista: [{ a, b, scene, cam, upd(t), post(t) }], miniaturas: { A, B } } */
(function () {
  const THREE = window.THREE, N = window.N, F = window.F, { rng, clamp, lerp, prog, ease, easeOut } = N, { HDR, sm, M, rbox } = F;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const nueva = (bg = '#0A0E1C', fog) => { const s = new THREE.Scene(); s.background = new THREE.Color(bg); if (fog) s.fog = new THREE.Fog(bg, fog[0], fog[1]); return s; };
  const camara = (fov = 40) => new THREE.PerspectiveCamera(fov, 1080 / 1920, .01, 600);
  const mira = (cam, p, l, fov) => { cam.position.copy(p); cam.lookAt(l); if (fov) { cam.fov = fov; } cam.updateProjectionMatrix(); cam.updateMatrixWorld(); };
  const glowS = (c, s, op = 1) => { const g = N.glow(c, s, op); g.material.fog = false; return g; };
  const texto = (w, h, draw) => N.canvasTex(w, h, draw);

  // ---------------- 2 · mano con el móvil: 07:15 · 2026 → 2033 y "+7 AÑOS" ----------------
  function escMovil(T, o = {}) {
    const scene = nueva('#0B0F1E'); const cam = camara(34);
    scene.add(new THREE.HemisphereLight('#8A9CFF', '#1A1424', .7));
    const key = new THREE.DirectionalLight('#E8EEFF', 1.2); key.position.set(-1, 2, 2); scene.add(key);
    const rim = new THREE.DirectionalLight('#6A7CFF', 1.0); rim.position.set(2, 1, -1.5); scene.add(rim);
    // fondo: salón del ferry desenfocado (luces frías redondas)
    const r = rng(12); for (let i = 0; i < 26; i++) { const b = glowS(r() < .8 ? '#9AB4FF' : '#FFD08A', .25 + r() * .35, .25 + r() * .3); b.position.set((r() - .5) * 3.2, (r() - .3) * 3.4, -2.5 - r() * 2); scene.add(b); }
    const pared = M(new THREE.PlaneGeometry(12, 10), sm('#141A30', { roughness: 1 }), 0, 0, -5); scene.add(pared);
    const mv = F.movil(); const g = new THREE.Group(); g.add(mv.grp); const mano = F.mano(); g.add(mano); scene.add(g);
    g.rotation.set(-.12, .14, .04);
    const upd = t => {
      const a = o.a || 2.2; const k = t - a;
      g.position.set(.003 * Math.sin(t * 1.3), .002 * Math.sin(t * 1.7) - .004, 0); g.rotation.y = .14 - .05 * prog(t, a, a + 2.6);
      mira(cam, V3(.02 - .02 * prog(t, a, a + 2.6), .0, lerp(.47, .385, ease(prog(t, a - .3, a + 2.8)))), V3(0, -.004, 0));
      const anio = t < T.anioRueda ? 2026 : 2026 + 7 * ease(prog(t, T.anioRueda, T.anioRueda + .75));
      mv.dibujar('bloqueo', { anio, mas7: prog(t, T.mas7, T.mas7 + .45) });
    };
    return { scene, cam, upd, post: t => ({ focus: cam.position.length(), ap: .5, bloom: .7, umbral: 1.1 }) };
  }

  // ---------------- 14 · pared de fotos, flores y velas; pancarta ----------------
  function escMemorial(T, o = {}) {
    const scene = nueva('#0A0C16', [6, 22]); const cam = camara(42);
    scene.add(new THREE.HemisphereLight('#7A86C8', '#140E14', .35));
    const top = new THREE.SpotLight('#DDE6FF', 3.2, 16, .7, .6, 1.2); top.position.set(0, 6, 4); top.target.position.set(0, 2.2, 0); top.castShadow = true; top.shadow.mapSize.set(1024, 1024); scene.add(top, top.target);
    const banL = new THREE.SpotLight('#FFF0E0', 2.4, 9, .5, .6, 1.2); banL.position.set(0, 4.2, 4); banL.target.position.set(0, 5.6, 0); scene.add(banL, banL.target);
    const pared = M(new THREE.BoxGeometry(9, 6, .2), sm('#2C3248', { roughness: .95 }), 0, 3, -.1); scene.add(pared);
    const suelo = M(new THREE.PlaneGeometry(14, 10), sm('#151820', { roughness: .8 }), 0, 0, 3); suelo.rotation.x = -Math.PI / 2; scene.add(suelo);
    // polaroids
    const A = F.atlasRetratos(3, 27); const at = new THREE.CanvasTexture(A.canvas); at.encoding = THREE.sRGBEncoding; at.anisotropy = 8;
    const fotoM = new THREE.MeshStandardMaterial({ map: at, roughness: .55 }), marcoM = sm('#F2F0EA', { roughness: .6 });
    const r = rng(41), fotos = []; let tuya = null; const cols = 11, filas = 9;
    for (let j = 0; j < filas; j++) for (let i = 0; i < cols; i++) {
      if (r() < .07) continue; const x = (i - (cols - 1) / 2) * .62 + (r() - .5) * .12, y = .95 + j * .52 + (r() - .5) * .08;
      const esT = i === 6 && j === 3, k = esT ? A.prota : Math.floor(r() * (A.n * A.n)); if (!esT && k === A.prota) continue;
      const p = new THREE.Group(); p.position.set(x, y, .02 + r() * .01); p.rotation.z = (r() - .5) * .22; scene.add(p);
      p.add(M(new THREE.BoxGeometry(.4, .48, .008), marcoM));
      const gq = new THREE.PlaneGeometry(.34, .34), uv = gq.attributes.uv, cx = k % A.n, cy = Math.floor(k / A.n);
      for (let u = 0; u < uv.count; u++) uv.setXY(u, (cx + uv.getX(u)) / A.n, 1 - (cy + 1 - uv.getY(u)) / A.n);
      const ph = new THREE.Mesh(gq, fotoM); ph.position.set(0, .04, .0045); p.add(ph);
      const cinta = M(new THREE.BoxGeometry(.14, .045, .004), sm('#E8E0C8', { transparent: true, opacity: .8 }), 0, .24, .006); cinta.rotation.z = (r() - .5) * .4; p.add(cinta);
      if (esT) tuya = p; fotos.push(p); }
    // pancarta (3 líneas, cabe completa en el encuadre)
    const banT = texto(1200, 520, (x, w, h) => { x.fillStyle = '#7A1A22'; x.fillRect(0, 0, w, h); x.strokeStyle = '#F2E2C8'; x.lineWidth = 8; x.strokeRect(16, 16, w - 32, h - 32); x.fillStyle = '#FFF6E6'; x.textAlign = 'center';
      x.font = '900 120px Nunito, sans-serif'; x.fillText('FERRY 0614', w / 2, 158); x.font = '900 82px Nunito, sans-serif'; x.fillText('NUNCA OS OLVIDAREMOS', w / 2, 300); x.font = '800 84px Nunito, sans-serif'; x.fillStyle = '#F2C8A0'; x.fillText('14·06·2026', w / 2, 440); });
    const bg = new THREE.PlaneGeometry(2.6, 1.13, 24, 4); { const p = bg.attributes.position; for (let i = 0; i < p.count; i++) { const xx = p.getX(i); p.setZ(i, .04 * Math.sin(xx * 3.2)); p.setY(i, p.getY(i) - .05 * (1 - Math.pow(xx / 1.3, 2))); } bg.computeVertexNormals(); }
    const ban = M(bg, new THREE.MeshStandardMaterial({ map: banT, roughness: .8, side: THREE.DoubleSide }), 0, 5.55, .25); scene.add(ban);
    for (const s2 of [-1, 1]) scene.add(M(new THREE.CylinderGeometry(.012, .012, .5), sm('#C8C0B0'), s2 * 1.28, 6.3, .25));
    // flores y velas abajo
    const flores = ['#E83A4A', '#F2D04A', '#F4F2F0', '#E87AA8', '#F28A3A'], llamas = [];
    for (let i = 0; i < 34; i++) { const x = -3.6 + i * .22 + (r() - .5) * .1, z = .25 + r() * .7;
      if (i % 3 !== 1) { const ramo = new THREE.Group(); ramo.position.set(x, 0, z); ramo.position.y = .1; ramo.rotation.set(-1.42, (r() - .5) * 1.4, 0); scene.add(ramo);
        const cono = M(new THREE.ConeGeometry(.11, .38, 10, 1, true), sm(r() < .5 ? '#E8DCC0' : '#C8A880', { side: THREE.DoubleSide }), 0, .19, 0); cono.rotation.x = Math.PI; ramo.add(cono);
        for (let k = 0; k < 9; k++) { const fl = M(new THREE.IcosahedronGeometry(.06 + r() * .03, 1), sm(flores[Math.floor(r() * flores.length)], { roughness: .7, flatShading: true }), (r() - .5) * .16, .44 + r() * .12, (r() - .5) * .16); ramo.add(fl); } for (let k = 0; k < 4; k++) { const hj = M(new THREE.ConeGeometry(.03, .14, 4), sm('#3A7A3A'), (r() - .5) * .18, .42, (r() - .5) * .18); hj.rotation.z = (r() - .5) * 1.2; ramo.add(hj); } }
      else { const hV = .12 + r() * .2, vela = M(new THREE.CylinderGeometry(.045, .045, hV, 14), sm('#F2E8D2', { roughness: .5, emissive: '#3A2410' }), x, hV / 2, z + .2); scene.add(vela);
        const ll = glowS('#FFB04A', .22, .95); ll.material.color = HDR(1.6, .9, .3); ll.position.set(x, hV + .05, z + .2); scene.add(ll); llamas.push(ll); } }
    const calida = new THREE.PointLight('#FF9A4A', 2.6, 5, 1.6); calida.position.set(0, .5, 1.1); scene.add(calida);
    const calida2 = new THREE.PointLight('#FF9A4A', 1.4, 4, 1.6); calida2.position.set(-2.4, .4, 1); scene.add(calida2);
    const upd = t => { const a = o.a || 55.85, b = o.b || 63.45;
      llamas.forEach((l, i) => { l.scale.setScalar(.22 * (1 + .12 * Math.sin(t * 9 + i * 1.7))); }); calida.intensity = 2.6 + .3 * Math.sin(t * 7);
      // paneo: de las velas hacia arriba hasta la pancarta; luego acercamiento a tu foto
      const k1 = ease(prog(t, a, T.tuya - 1.2)), k2 = ease(prog(t, T.tuya - 1.0, b));
      const p1 = V3(lerp(-.6, .1, k1), lerp(.7, 4.0, k1), lerp(3.4, 6.2, k1)), l1 = V3(lerp(-.4, 0, k1), lerp(.4, 4.75, k1), 0);
      const tp = tuya.getWorldPosition(V3()); const p2 = V3(tp.x + .01, tp.y + .02, .6), l2 = tp.clone().add(V3(0, .04, 0));
      mira(cam, p1.lerp(p2, k2), l1.lerp(l2, k2));
    };
    return { scene, cam, upd, tuya, post: t => ({ focus: cam.position.distanceTo(V3(0, cam.position.y, 0)), ap: .3, bloom: .9, umbral: 1.0, oscuro: .08 }) };
  }

  // ---------------- pasillo blanco "SOLO PERSONAL" (escena 16 y fondo final) ----------------
  function escPasillo(T, o = {}) {
    const scene = nueva('#0C1018'); const cam = camara(46);
    scene.add(new THREE.HemisphereLight('#C8D4FF', '#2A2A34', .3));
    const L = 16, Wd = 2.4, Hh = 2.7;
    const paredM = sm('#DDE2EA', { roughness: .9 }), sueloM = sm('#B8BEC8', { roughness: .25, metalness: .1 });
    scene.add(M(new THREE.BoxGeometry(Wd, .05, L), sueloM, 0, -.025, -L / 2)); scene.add(M(new THREE.BoxGeometry(Wd, .05, L), paredM, 0, Hh, -L / 2));
    scene.add(M(new THREE.BoxGeometry(.05, Hh, L), paredM, -Wd / 2, Hh / 2, -L / 2));
    // pared derecha con un ventanal (cristal) a media altura
    const vz0 = -3, vz1 = -11;
    scene.add(M(new THREE.BoxGeometry(.05, Hh, -vz0), paredM, Wd / 2, Hh / 2, vz0 / 2)); scene.add(M(new THREE.BoxGeometry(.05, Hh, L + vz1), paredM, Wd / 2, Hh / 2, (vz1 - L) / 2));
    scene.add(M(new THREE.BoxGeometry(.05, .9, vz0 - vz1), paredM, Wd / 2, .45, (vz0 + vz1) / 2)); scene.add(M(new THREE.BoxGeometry(.05, .45, vz0 - vz1), paredM, Wd / 2, Hh - .225, (vz0 + vz1) / 2));
    const crist = new THREE.Mesh(new THREE.PlaneGeometry(vz0 - vz1, Hh - 1.35), new THREE.MeshStandardMaterial({ color: '#AFC8E0', transparent: true, opacity: .16, roughness: .05, metalness: .5 })); crist.rotation.y = -Math.PI / 2; crist.position.set(Wd / 2, .9 + (Hh - 1.35) / 2, (vz0 + vz1) / 2); scene.add(crist);
    // del otro lado del cristal: otro pasillo más frío
    scene.add(M(new THREE.BoxGeometry(.05, Hh, 12), sm('#C8D0DC'), Wd / 2 + 2.4, Hh / 2, -7)); scene.add(M(new THREE.BoxGeometry(2.4, .05, 12), sueloM, Wd / 2 + 1.2, 0, -7));
    // luces de techo
    for (let z = -1.5; z > -L; z -= 2.6) { const p = new THREE.Mesh(new THREE.BoxGeometry(.9, .03, .5), new THREE.MeshBasicMaterial({ color: HDR(1.6, 1.75, 2.0) })); p.position.set(0, Hh - .02, z); scene.add(p); const l = new THREE.PointLight('#E4ECFF', .45, 5, 1.6); l.position.set(0, Hh - .3, z); scene.add(l); }
    // puerta del fondo con letrero rojo
    const pf = M(new THREE.BoxGeometry(1.1, 2.1, .08), sm('#9AA2AE', { metalness: .6, roughness: .35 }), 0, 1.05, -L + .06); scene.add(pf);
    const let1 = texto(512, 128, (x, w, h) => { x.fillStyle = '#C81E26'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '900 62px Nunito, sans-serif'; x.textAlign = 'center'; x.fillText('SOLO PERSONAL', w / 2, 86); });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .25), new THREE.MeshBasicMaterial({ map: let1, toneMapped: false })); sign.position.set(0, 2.32, -L + .12); scene.add(sign);
    const sl = new THREE.PointLight('#FF3A3A', .9, 3, 1.5); sl.position.set(0, 2.2, -L + .6); scene.add(sl);
    const upd = t => { const a = o.a || 73.3; mira(cam, V3(-.25, 1.55, lerp(1.0, -1.2, ease(prog(t, a, a + 9)))), V3(.05, 1.4, -L)); };
    return { scene, cam, upd, sign, L, post: t => ({ focus: 8, ap: .08, bloom: .8, umbral: 1.3 }) };
  }

  // ---------------- miniatura A: puerta de casa iluminada ----------------
  function escCasa() {
    const scene = nueva('#0E1428'); const cam = camara(40);
    scene.add(new THREE.HemisphereLight('#5A6AC8', '#140E1A', .5));
    scene.add(M(new THREE.BoxGeometry(6, 4, .3), sm('#C8B496', { roughness: .95 }), 0, 2, -.15));
    scene.add(M(new THREE.BoxGeometry(1.1, 2.1, .1), sm('#6A3A22', { roughness: .6 }), 0, 1.25, .02));
    const vent = new THREE.Mesh(new THREE.PlaneGeometry(.5, .6), new THREE.MeshBasicMaterial({ color: HDR(2.4, 1.6, .7) })); vent.position.set(0, 1.65, .075); scene.add(vent);
    for (let i = 0; i < 3; i++) scene.add(M(new THREE.BoxGeometry(1.8 - i * .2, .1, .4 - i * .1), sm('#8A8A86'), 0, .05 + i * .1, .35 - i * .08));
    const lamp = glowS('#FFC07A', .9, .9); lamp.position.set(.85, 2.55, .2); scene.add(lamp); scene.add(M(new THREE.BoxGeometry(.14, .22, .14), sm('#2A2420'), .85, 2.55, .12));
    const pl = new THREE.PointLight('#FFB060', 3.5, 6, 1.5); pl.position.set(.85, 2.4, .6); scene.add(pl);
    for (const s of [-1, 1]) { scene.add(M(new THREE.CylinderGeometry(.18, .14, .34, 12), sm('#B0603A'), s * 1.2, .17, .4)); const pl2 = M(new THREE.IcosahedronGeometry(.28, 0), sm('#3A6A3A'), s * 1.2, .5, .4); scene.add(pl2); }
    mira(cam, V3(.9, 1.6, 7.2), V3(0, 1.35, 0));
    return { scene, cam };
  }

  function negro(a, b) { const scene = nueva('#05060C'); const cam = camara(); mira(cam, V3(0, 0, 5), V3(0, 0, 0)); return { a, b, scene, cam, upd: () => {} }; }

  function crear(renderer, T) {
    const C = T.cortes, lista = [];
    const mvl = escMovil(T, { a: C[1] }), mem = escMemorial(T, { a: C[13], b: C[14] }), pas = escPasillo(T, { a: C[15] }), casa = escCasa();
    const fin = escPasillo(T, { a: C[17] }); fin.upd = t => { mira(fin.cam, V3(-.1, 1.5, lerp(-2, -4.5, ease(prog(t, C[17], C[18])))), V3(0, 1.45, -fin.L)); };
    for (let i = 0; i < C.length; i++) {
      const a = C[i], b = C[i + 1] || T.end;
      let e = null;
      if (i === 1) e = mvl; else if (i === 13) e = mem; else if (i === 15) e = pas; else if (i === 17) e = Object.assign(fin, { post: () => ({ focus: 6, ap: .12, bloom: .7, umbral: 1.3, oscuro: 1.2 }) });
      lista.push(e ? Object.assign(e, { a, b }) : negro(a, b));
    }
    // miniaturas de las tarjetas (se toman una vez)
    const foto = (esc, prep) => { if (prep) prep(); renderer.setRenderTarget(null); renderer.render(esc.scene, esc.cam); const c = document.createElement('canvas'); c.width = 520; c.height = 392; const gl = renderer.domElement; c.getContext('2d').drawImage(gl, 0, 560, 1080, 814, 0, 0, 520, 392); return c; };
    const miniaturas = { A: foto(casa), B: foto(pas, () => mira(pas.cam, V3(0, 1.5, -6), V3(0, 1.5, -pas.L))) };
    return { lista, miniaturas };
  }
  window.ESC = { crear, escMovil, escMemorial, escPasillo, escCasa };
})();
