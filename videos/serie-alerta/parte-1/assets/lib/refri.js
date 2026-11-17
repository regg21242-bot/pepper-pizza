/* Primer plano del refri mal cerrado (serie "Alerta"): cocina oscura con azulejo azul marino,
   refri de acero con reflejos, puerta entreabierta, luz fría que se derrama, vaho que baja y un anillo de luz.
   Uso: const RF = window.REFRI(renderer, scene); RF.update(t, activo); RF.O = punto de mira (frente del refri). */
(function () {
  const THREE = window.THREE, N = window.N, { rng, clamp, lerp, prog } = N;
  const HDR = (r, g, b) => new THREE.Color(r, g, b);
  function REFRI(renderer, scene) {
    const O = new THREE.Vector3(300, 0, 300);          // lejos de la colonia; solo se ve en su toma
    const g = new THREE.Group(); g.position.copy(O); g.visible = false; scene.add(g);

    // reflejos: entorno con tiras de luz frías (para que el acero brille)
    const envS = new THREE.Scene(); envS.background = new THREE.Color('#0A0C1C');
    const tira = (w, h, c, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry || 0; envS.add(m); };
    tira(2, 8, HDR(1.8, 2.0, 2.4), 5, 1, 2, -1.2); tira(1, 8, HDR(1.2, 1.4, 2.4), -5, 1, 1, 1.2); tira(10, 1, HDR(.5, .6, 1.2), 0, 5, 0); tira(2, 6, HDR(1.6, 1.8, 2.2), 1, 1, 6, Math.PI);
    const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromScene(envS, .02).texture; pm.dispose();
    const acero = new THREE.MeshStandardMaterial({ color: '#8C95A6', metalness: .9, roughness: .3, envMap: env, envMapIntensity: 1.0 });
    const cromo = new THREE.MeshStandardMaterial({ color: '#E8EEF6', metalness: 1, roughness: .12, envMap: env, envMapIntensity: 1.8 });

    // azulejo azul marino (como la pared de la referencia) y piso oscuro brillante
    const azT = N.canvasTex(1024, 1024, (x, w, h) => { x.fillStyle = '#0B1030'; x.fillRect(0, 0, w, h); const r = rng(7), tw = 128, th = 64;
      for (let j = 0; j < h / th; j++) for (let i = -1; i < w / tw + 1; i++) { const ox = (j % 2) * tw / 2, v = .85 + r() * .3; const gx = x.createLinearGradient(0, j * th, 0, j * th + th);
        gx.addColorStop(0, `rgb(${46 * v | 0},${58 * v | 0},${128 * v | 0})`); gx.addColorStop(1, `rgb(${30 * v | 0},${38 * v | 0},${92 * v | 0})`); x.fillStyle = gx; x.fillRect(i * tw + ox + 3, j * th + 3, tw - 6, th - 6);
        x.fillStyle = 'rgba(150,170,255,.18)'; x.fillRect(i * tw + ox + 3, j * th + 3, tw - 6, 3); } });
    azT.wrapS = azT.wrapT = THREE.RepeatWrapping; azT.repeat.set(3.2, 3.2);
    const pared = new THREE.MeshStandardMaterial({ map: azT, roughness: .38, metalness: 0, envMap: env, envMapIntensity: .35 });
    const piT = N.canvasTex(512, 512, (x, w, h) => { for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { x.fillStyle = (i + j) % 2 ? '#1A1C2E' : '#232638'; x.fillRect(i * 128, j * 128, 128, 128); } x.strokeStyle = '#0C0D16'; x.lineWidth = 4; for (let k = 0; k <= 4; k++) { x.beginPath(); x.moveTo(k * 128, 0); x.lineTo(k * 128, h); x.moveTo(0, k * 128); x.lineTo(w, k * 128); x.stroke(); } });
    piT.wrapS = piT.wrapT = THREE.RepeatWrapping; piT.repeat.set(3, 3);
    const piso = new THREE.MeshStandardMaterial({ map: piT, roughness: .22, metalness: .1, envMap: env, envMapIntensity: .6 });
    const M = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; g.add(o); return o; };
    const B = (w, h, d, m, x, y, z) => M(new THREE.BoxGeometry(w, h, d), m, x, y, z);

    // cuarto: pared de fondo (z = -.4), pared derecha, techo, piso
    B(7, .05, 7, piso, 0, -.025, 1.5); B(7, 3, .1, pared, 0, 1.5, -.45);
    const pd = B(.1, 3, 7, pared, 2.9, 1.5, 1.5); pd.material = pared.clone(); pd.material.map = azT.clone(); pd.material.map.needsUpdate = true; pd.material.map.repeat.set(3.2, 3.2);
    B(7, .1, 7, new THREE.MeshStandardMaterial({ color: '#0C0E1C' }), 0, 2.75, 1.5); B(7, 3, .1, new THREE.MeshStandardMaterial({ color: '#0C0E1C' }), 0, 1.5, 5);
    B(.1, 3, 7, new THREE.MeshStandardMaterial({ color: '#0C0E1C' }), -3.4, 1.5, 1.5);
    // barra de cocina a la izquierda con parrilla y una tetera
    B(1.6, .86, .62, new THREE.MeshStandardMaterial({ color: '#1C2246', roughness: .6 }), -1.35, .43, -.1);
    B(1.66, .05, .66, new THREE.MeshStandardMaterial({ color: '#C8CCD8', roughness: .25, envMap: env, envMapIntensity: .8 }), -1.35, .885, -.1);
    for (let i = 0; i < 2; i++) B(.6, .012, .012, cromo, -1.35 + (i - .5) * .78, .62, .22);
    

    // refri: cuerpo hueco (frente abierto en el compartimento de abajo), congelador cerrado arriba
    const RW = .8, RD = .7, RH = 1.9, zf = .35 + .02;   // frente del refri en z = .37 (la pared de fondo en -.4)
    const cz = -.03;                                     // centro del cuerpo
    const pR = (w, h, d, x, y, z) => B(w, h, d, acero, x, y, z);
    pR(.04, RH, RD, -RW / 2 + .02, RH / 2, cz); pR(.04, RH, RD, RW / 2 - .02, RH / 2, cz); pR(RW, .04, RD, 0, RH - .02, cz); pR(RW, .06, RD, 0, .03, cz);
    B(RW - .08, RH - .1, .03, new THREE.MeshStandardMaterial({ color: '#F4F8FF', emissive: HDR(.8, .9, 1.1), emissiveIntensity: 1 }), 0, RH / 2, cz - RD / 2 + .03);
    const interior = new THREE.MeshStandardMaterial({ color: '#E8F0FF', emissive: HDR(.38, .44, .55), roughness: .5 });
    B(.03, 1.22, RD - .06, interior, -RW / 2 + .055, .7, cz); B(.03, 1.22, RD - .06, interior, RW / 2 - .055, .7, cz);
    const vidrio = new THREE.MeshStandardMaterial({ color: '#CFE6FF', emissive: HDR(.6, .8, 1.0), transparent: true, opacity: .55, roughness: .1 });
    [.36, .72, 1.05].forEach(y => B(RW - .1, .012, RD - .08, vidrio, 0, y, cz + .01));
    B(RW, .05, RD, acero, 0, 1.33, cz);                                  // separación del congelador
    const congelador = B(RW, RH - 1.36, .06, acero, 0, (RH + 1.36) / 2, zf - .03);
    B(.02, .22, .03, cromo, RW / 2 - .09, 1.48, zf + .03);
    // comida genérica (sin marcas)
    const col = (c, e = .25) => new THREE.MeshStandardMaterial({ color: c, roughness: .45, emissive: new THREE.Color(c).multiplyScalar(e) });
    const r = rng(11);
    [['#F2F4F8', .09, .2, .1], ['#F2C14A', .07, .17, .06], ['#7FD06A', .06, .2, .07], ['#E85A5A', .08, .12, .09]].forEach(([c, ww, hh, dd], i) => B(ww, hh, dd, col(c), -.26 + i * .17, .375 + hh / 2, cz + .1 - r() * .15));
    for (let i = 0; i < 3; i++) { const bo = M(new THREE.CylinderGeometry(.035, .04, .24, 16), new THREE.MeshStandardMaterial({ color: ['#9FD8FF', '#FFB0A0', '#C8FFC0'][i], emissive: HDR(.25, .35, .45), transparent: true, opacity: .85, roughness: .1 }), -.22 + i * .1, .72 + .135, cz + .05); }
    for (let i = 0; i < 4; i++) M(new THREE.SphereGeometry(.045, 14, 10), col(['#FF6A3A', '#FF9A3A', '#E8D04A', '#FF5A5A'][i], .3), .1 + (i % 2) * .1, 1.05 + .05, cz + .12 - (i >> 1) * .1);
    B(.24, .07, .14, col('#F8F0E0', .3), -.18, .09 + .06, cz + .08);
    // luz interior y reflejo
    const luzI = new THREE.PointLight('#DDEBFF', 0, 4, 1.6); luzI.position.set(0, 1.1, cz + .1); g.add(luzI);
    const spot = new THREE.SpotLight('#D8E8FF', 0, 9, .62, .55, 1.3); spot.position.set(.25, .95, cz + .2); spot.target.position.set(1.2, 0, 3.2); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -.001; g.add(spot, spot.target);
    const ambar = new THREE.PointLight('#3A4AC8', .9, 9, 1.5); ambar.position.set(1.0, 2.3, 2.6); g.add(ambar);
    const frente = new THREE.PointLight('#7A88F0', 0, 7, 1.4); frente.position.set(-.5, 1.7, 2.3); g.add(frente);

    // puerta (bisagra a la izquierda), entreabierta
    const bis = new THREE.Group(); bis.position.set(-RW / 2, .06, zf); g.add(bis);
    const pu = new THREE.Mesh(new THREE.BoxGeometry(RW, 1.27, .07), acero); pu.position.set(RW / 2, .63, .035); pu.castShadow = pu.receiveShadow = true; bis.add(pu);
    const dentro = new THREE.Mesh(new THREE.BoxGeometry(RW - .1, 1.15, .02), interior); dentro.position.set(RW / 2, .63, -.005); bis.add(dentro);
    for (let i = 0; i < 3; i++) { const rep = new THREE.Mesh(new THREE.BoxGeometry(RW - .14, .1, .1), new THREE.MeshStandardMaterial({ color: '#E8F2FF', emissive: HDR(.5, .6, .75), transparent: true, opacity: .8 })); rep.position.set(RW / 2, .2 + i * .36, -.06); bis.add(rep); }
    const jaladera = new THREE.Group(); jaladera.position.set(RW - .07, .78, .1); bis.add(jaladera);
    jaladera.add(new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .62, 16), cromo)); [-.27, .27].forEach(y => { const s = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .07, 10), cromo); s.rotation.x = Math.PI / 2; s.position.set(0, y, -.03); jaladera.add(s); });
    // una notita pegada con imán (dibujo de niño, sin texto)
    const nota = new THREE.Mesh(new THREE.PlaneGeometry(.18, .22), new THREE.MeshStandardMaterial({ roughness: .9, map: N.canvasTex(128, 160, (x) => { x.fillStyle = '#F4EEDC'; x.fillRect(0, 0, 128, 160); x.strokeStyle = '#E2463A'; x.lineWidth = 5; x.beginPath(); x.moveTo(30, 120); x.lineTo(30, 80); x.lineTo(64, 50); x.lineTo(98, 80); x.lineTo(98, 120); x.closePath(); x.stroke(); x.strokeStyle = '#3A6AE2'; x.strokeRect(54, 92, 20, 28); x.fillStyle = '#F2B02A'; x.beginPath(); x.arc(104, 30, 14, 0, 7); x.fill(); }) }));
    nota.position.set(.3, .95, .072); nota.rotation.z = .06; bis.add(nota); const iman = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .012, 16), new THREE.MeshStandardMaterial({ color: '#E8443A', roughness: .3 })); iman.rotation.x = Math.PI / 2; iman.position.set(.3, 1.05, .08); bis.add(iman);

    // haz de luz que se derrama (planos aditivos) y cuña en el piso
    const hazT = N.canvasTex(128, 256, (x, w, h) => { const gg = x.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, 'rgba(255,255,255,.95)'); gg.addColorStop(.4, 'rgba(255,255,255,.35)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(0, 0, w, h);
      const gl = x.createLinearGradient(0, 0, w, 0); gl.addColorStop(0, 'rgba(0,0,0,1)'); gl.addColorStop(.25, 'rgba(0,0,0,0)'); gl.addColorStop(.75, 'rgba(0,0,0,0)'); gl.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = gl; x.fillRect(0, 0, w, h); }, false);
    const hazM = new THREE.MeshBasicMaterial({ map: hazT, color: HDR(.5, .6, .78), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const haces = []; for (let i = 0; i < 3; i++) { const h = new THREE.Mesh(new THREE.PlaneGeometry(.55 + i * .25, 2.4), hazM.clone()); h.geometry.translate(0, -1.2, 0); h.position.set(.33, .95, zf + .02); h.rotation.set(-1.0 - i * .08, .5 + i * .12, 0); h.renderOrder = 4; g.add(h); haces.push(h); }
    const cunaT = N.canvasTex(128, 512, (x, w, h) => { const gg = x.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, 'rgba(255,255,255,1)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.beginPath(); x.moveTo(w * .42, 0); x.lineTo(w * .58, 0); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill(); }, false);
    const cuna = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 3.4), new THREE.MeshBasicMaterial({ map: cunaT, color: HDR(.45, .55, .7), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    cuna.geometry.translate(0, -1.7, 0); cuna.rotation.x = -Math.PI / 2; cuna.rotation.z = .42; cuna.position.set(.38, .004, zf + .02); cuna.renderOrder = 3; g.add(cuna);
    // brillo de la rendija
    const rend = N.glow('#CFE4FF', .9, .9); rend.material.color = HDR(1.2, 1.4, 1.8); rend.position.set(.38, .75, zf + .05); rend.scale.set(.5, 1.5, 1); g.add(rend);

    // vaho frío que sale por la rendija y baja al piso (determinista)
    const vahoT = N.canvasTex(64, 64, (x) => { const gg = x.createRadialGradient(32, 32, 0, 32, 32, 31); gg.addColorStop(0, 'rgba(255,255,255,.55)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(0, 0, 64, 64); }, false);
    const vaho = []; const rv = rng(23); for (let i = 0; i < 70; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: vahoT, color: HDR(.55, .65, .85), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.userData = { f: rv(), y0: .15 + rv() * 1.0, dx: .2 + rv() * .5, dz: .3 + rv() * .9, s0: .08 + rv() * .12, v: .18 + rv() * .2 }; g.add(s); vaho.push(s); }

    // anillos de luz en el piso (como el "ploc" de la referencia) y chispitas
    const anillos = []; for (let i = 0; i < 3; i++) { const a = new THREE.Mesh(new THREE.RingGeometry(.493, .5, 128), new THREE.MeshBasicMaterial({ color: HDR(1.1, 1.5, 2.2), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); a.rotation.x = -Math.PI / 2; a.position.set(.55, .01, zf + .55); g.add(a); anillos.push(a); }
    const chispas = []; const rc = rng(5); for (let i = 0; i < 14; i++) { const c = N.glow('#DDEEFF', .035, 0); c.userData = { a: rc() * 6.28, r: .25 + rc() * .35, h: .1 + rc() * .35 }; g.add(c); chispas.push(c); }

    const PULSOS = [61.18, 62.55];
    function update(t, on) {
      g.visible = on; luzI.intensity = on ? 2.2 : 0; spot.intensity = on ? 5.5 : 0; ambar.intensity = on ? .9 : 0; frente.intensity = on ? 1.1 : 0; if (!on) return;
      const hum = 1 + .04 * Math.sin(t * 13) + .025 * Math.sin(t * 31);
      bis.rotation.y = -.42 - .025 * Math.sin(t * .7);                    // la puerta se mece apenas
      luzI.intensity = 1.1 * hum; spot.intensity = 3.2 * hum; haces.forEach((h, i) => h.material.opacity = (.11 - i * .025) * hum); cuna.material.opacity = .6 * hum; rend.material.opacity = .35 * hum;
      vaho.forEach(s => { const u = ((t * s.userData.v + s.userData.f) % 1); const d = s.userData; s.position.set(.36 + u * d.dx, Math.max(.05, d.y0 * (1 - u) - u * .1), zf + .05 + u * d.dz); s.scale.setScalar(d.s0 * (1 + u * 3)); s.material.opacity = Math.sin(u * Math.PI) * .16; });
      anillos.forEach((a, i) => { let k = -1; PULSOS.forEach(p => { const u = (t - p - i * .16) / 1.3; if (u > 0 && u < 1) k = u; }); a.visible = k >= 0; if (!a.visible) return; a.scale.setScalar(.25 + k * 2.4); a.material.opacity = (1 - k) * (1 - k) * (.55 - i * .15); });
      chispas.forEach(c => { let k = -1; PULSOS.forEach(p => { const u = (t - p) / 1.1; if (u > 0 && u < 1) k = u; }); const d = c.userData; c.material.opacity = k >= 0 ? Math.sin(k * Math.PI) * .9 : 0; const rr = d.r * (.4 + k * .9); c.position.set(.55 + Math.cos(d.a) * rr, .02 + d.h * Math.sin(Math.max(0, k) * Math.PI), zf + .55 + Math.sin(d.a) * rr * .6); });
    }
    return { grp: g, O, update, zf, jaladera };
  }
  window.REFRI = REFRI;
})();
