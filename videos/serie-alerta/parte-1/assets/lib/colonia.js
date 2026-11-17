/* Serie "Alerta" — colonia costera de noche (inspirada en La Paz, B.C.S.; sin marcas).
   Calle recta (eje Z), edificios de 3-4 pisos con balcones de herrería y persianas, coches estacionados,
   farolas de sodio (se pueden apagar una por una), palmeras, tu recámara (1er piso del edificio TU, lado +x)
   con pasillo y cocina, y el celular genérico con sus pantallas (alerta roja, batería baja, mensaje 2).
   Uso: const C = window.COLONIA(renderer, scene); C.farola(i, k); C.cel.pantalla('alerta', {...}); */
(function () {
  const THREE = window.THREE, N = window.N, { rng, clamp, lerp, prog, ease, easeOut } = N;
  const HDR = (r, g, b) => new THREE.Color(r, g, b), V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const std = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .85, metalness: 0 }, o));
  const G = 3.4, U = 3.0;   // planta baja y pisos altos

  function COLONIA(renderer, scene) {
    const g = new THREE.Group(); scene.add(g); const r = rng(31);
    // ---------- cielo nocturno, luna, niebla ----------
    const skyT = N.canvasTex(512, 512, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); [[0, '#03040E'], [.3, '#0A0C24'], [.44, '#1A1440'], [.5, '#2C1E52'], [.53, '#1A1236'], [1, '#08060F']].forEach(([a, c]) => gr.addColorStop(a, c)); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      const rs = rng(5); for (let i = 0; i < 520; i++) { const y = rs() * h * .46; x.fillStyle = `rgba(255,255,255,${.25 + rs() * .6})`; x.fillRect(rs() * w, y, rs() < .1 ? 2 : 1, rs() < .1 ? 2 : 1); } });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 24), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -10; scene.add(sky);
    const luna = N.glow('#C8D4FF', 60, .9); luna.material.fog = false; luna.material.color = HDR(1.4, 1.5, 2.0); luna.position.set(260, 300, -420); scene.add(luna);
    scene.fog = new THREE.Fog('#120E2C', 30, 170);
    scene.add(new THREE.HemisphereLight('#5A5CC8', '#1A0E26', .62));
    const moon = new THREE.DirectionalLight('#8A9AFF', .42); moon.position.set(60, 90, -50); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
    const msc = moon.shadow.camera; msc.left = msc.bottom = -60; msc.right = msc.top = 60; msc.far = 300; moon.shadow.bias = -.0008; moon.shadow.normalBias = .05; scene.add(moon, moon.target);

    // ---------- piso ----------
    const asfT = N.canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#2C2A33'; x.fillRect(0, 0, w, h); const rs = rng(8); for (let i = 0; i < 2600; i++) { const v = 30 + rs() * 40 | 0; x.fillStyle = `rgba(${v + 8},${v + 4},${v + 14},.5)`; x.fillRect(rs() * w, rs() * h, 1.5, 1.5); } });
    asfT.wrapS = asfT.wrapT = THREE.RepeatWrapping; asfT.repeat.set(60, 140);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(240, 560), std('#FFFFFF', { map: asfT, roughness: .92 })); piso.rotation.x = -Math.PI / 2; piso.position.z = -80; piso.receiveShadow = true; g.add(piso);
    const banT = N.canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#8E8A86'; x.fillRect(0, 0, w, h); const rs = rng(3); for (let i = 0; i < 1500; i++) { const v = 120 + rs() * 40 | 0; x.fillStyle = `rgba(${v},${v - 4},${v - 8},.35)`; x.fillRect(rs() * w, rs() * h, 2, 2); } x.strokeStyle = 'rgba(40,36,34,.55)'; x.lineWidth = 3; x.strokeRect(0, 0, w, h); });
    banT.wrapS = banT.wrapT = THREE.RepeatWrapping; banT.repeat.set(1.6, 130);
    for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(3.2, .16, 520), [std('#6E6A66'), std('#6E6A66'), std('#FFFFFF', { map: banT }), std('#6E6A66'), std('#6E6A66'), std('#6E6A66')]); b.position.set(s * 5.6, .08, -78); b.receiveShadow = true; g.add(b); }
    const linea = new THREE.InstancedMesh(new THREE.BoxGeometry(.14, .02, 2.6), std('#C9A23A', { roughness: .6 }), 130); { const D = new THREE.Object3D(); let n = 0; for (let z = -335; z < 175; z += 5) { D.position.set(0, .015, z); D.updateMatrix(); linea.setMatrixAt(n++, D.matrix); } linea.count = n; } linea.frustumCulled = false; g.add(linea);

    // ---------- edificios ----------
    const PAL = ['#E8A06A', '#F2CF7A', '#6FC8B4', '#E87A6A', '#F0E2C8', '#9A8AE8', '#F2B84A', '#8CD07A', '#E890B0', '#6AA8E8'];
    const persT = N.canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#1A1C2A'; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) { x.fillStyle = '#3A3C52'; x.fillRect(4, y + 1, w - 8, 5); x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(4, y + 6, w - 8, 1); } });
    const herrT = N.canvasTex(256, 128, (x, w, h) => { x.strokeStyle = '#fff'; x.lineWidth = 7; x.strokeRect(4, 6, w - 8, h - 10); x.lineWidth = 4; for (let i = 16; i < w - 8; i += 14) { x.beginPath(); x.moveTo(i, 8); x.lineTo(i, h - 6); x.stroke(); } x.lineWidth = 3.5; for (let i = 20; i < w; i += 56) { x.beginPath(); x.arc(i, 34, 13, 0, 7); x.stroke(); x.beginPath(); x.arc(i + 28, 34, 13, 0, 7); x.stroke(); } }, false);
    const cortT = N.canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#5A5E66'; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) { x.fillStyle = '#6E727A'; x.fillRect(0, y, w, 5); x.fillStyle = '#3E4248'; x.fillRect(0, y + 8, w, 2); } });
    const edif = [], ventanas = [], inst = { marco: [], persiana: [], puerta: [], cortina: [], losa: [], reja: [], repisa: [] };
    const especiales = { TU: { side: 1, z0: -8, z1: 12, F: 4, col: '#F0C878' }, ENF: { side: -1, z0: -6.5, z1: 6.5, F: 4, col: '#7FB8D8' } };
    // la calle sigue hasta el fondo como ciudad (tramos extra con su propio azar, para no cambiar lo de en medio)
    const r2 = rng(77), finZ = { '-1': 78, '1': 78 };
    for (const [side, zA, zB, R_] of [[-1, -78, 78, r], [1, -78, 78, r], [-1, -330, -78.3, r2], [1, -330, -78.3, r2], [-1, null, 175, r2], [1, null, 175, r2]]) {
      const extra = R_ !== r; let z = zA === null ? finZ[side] + .3 : zA; while (z < zB) { let e;
        const esp = Object.entries(especiales).find(([k, v]) => v.side === side && z < v.z1 && z + 4 > v.z0);
        if (esp) { const v = esp[1]; e = { id: esp[0], side, z0: v.z0, z1: v.z1, F: v.F, col: v.col }; }
        else { const w = 8 + R_() * 6; let z1 = z + w; const sig = Object.values(especiales).find(v => v.side === side && v.z0 > z && v.z0 < z1); if (sig) z1 = sig.z0 - .3; if (extra) z1 = Math.min(z1, zB); if (z1 - z < 5) { z = z1 + .3; continue; } e = { side, z0: z, z1, F: 3 + Math.floor(R_() * 2), col: PAL[Math.floor(R_() * PAL.length)] }; }
        const w = e.z1 - e.z0, d = 12, h = G + (e.F - 1) * U, x = side * (7.2 + d / 2), zc = (e.z0 + e.z1) / 2; Object.assign(e, { w, d, h, x, zc });
        const grp = new THREE.Group(); grp.position.set(x, 0, zc); g.add(grp); e.grp = grp;
        grp.add(N.M(new THREE.BoxGeometry(d, h, w - .06), std(new THREE.Color(e.col).multiplyScalar(1.0)), 0, h / 2, 0));
        const zc2 = new THREE.Color(e.col).multiplyScalar(.7); grp.add(N.M(new THREE.BoxGeometry(d + .05, .9, w), std(zc2), 0, .45, 0));
        grp.add(N.M(new THREE.BoxGeometry(d + .2, .22, w + .05), std('#E8E0D2'), 0, G, 0));
        grp.add(N.M(new THREE.BoxGeometry(d + .3, .45, w + .2), std('#E8E0D2'), 0, h + .1, 0)); grp.add(N.M(new THREE.BoxGeometry(d - .1, .06, w - .1), std('#3A3238', { roughness: 1 }), 0, h + .35, 0));
        grp.add(N.M(new THREE.BoxGeometry(d - .3, 1.0, .25), std(e.col), 0, h + .7, w / 2 - .2)); grp.add(N.M(new THREE.BoxGeometry(d - .3, 1.0, .25), std(e.col), 0, h + .7, -w / 2 + .2));
        grp.add(N.M(new THREE.BoxGeometry(1.2, .9, 1.2), std('#D8D8DC'), side * 2, h + .8, w / 4)); // tinaco
        const fx = side * 7.2, rot = side > 0 ? -Math.PI / 2 : Math.PI / 2, nx = -side;
        const at = (zz, y, out) => [fx + nx * out, y, zz];
        const n = Math.max(1, Math.floor((w - 1) / 3)), u0 = zc - (n - 1) * 1.5;
        for (let c = 0; c < n; c++) { const zz = u0 + c * 3;
          if (c % 2 === 0) { inst.puerta.push([...at(zz, 1.2, .05), 1.2, 2.4, .12, rot]); inst.repisa.push([...at(zz, 2.55, .15), 1.6, .12, .3, rot]); }
          else inst.cortina.push([...at(zz, 1.35, .05), 2.4, 2.6, .1, rot]);
          for (let f = 1; f < e.F; f++) { const yb = G + (f - 1) * U, balc = e.id === 'ENF' ? (f === 3 && c === Math.floor(n / 2)) || R_() < .35 : R_() < .4;
            const skip = e.id === 'TU' && f === 1 && Math.abs(zz) < 1.6;   // tu ventana: hueco real para ver hacia afuera
            const slot = { e, f, c, z: zz, y: yb + (balc ? 1.15 : 1.55), balc, fx, nx, skip };
            if (e.id === 'ENF') { if (balc) { inst.losa.push([...at(zz, yb + .02, .5), 2.0, .14, 1.0, rot]); inst.reja.push([...at(zz, yb + .55, .98), 2.0, .95, 1, rot]); } else inst.repisa.push([...at(zz, yb + .74, .38), 1.5, .1, .25, rot]); }
            else if (!skip) { if (balc) { inst.marco.push([...at(zz, yb + 1.15, .03), 1.3, 2.3, .1, rot]); inst.persiana.push([...at(zz, yb + 1.15, .09), 1.05, 2.1, 1, rot]);
                inst.losa.push([...at(zz, yb + .02, .5), 2.0, .14, 1.0, rot]); inst.reja.push([...at(zz, yb + .55, .98), 2.0, .95, 1, rot]); }
              else { inst.marco.push([...at(zz, yb + 1.55, .03), 1.4, 1.5, .1, rot]); inst.persiana.push([...at(zz, yb + 1.55, .09), 1.15, 1.25, 1, rot]); inst.repisa.push([...at(zz, yb + .74, .12), 1.5, .1, .25, rot]); } }
            if (!extra) ventanas.push(slot); } }
        if (!extra) { edif.push(e); finZ[side] = e.z1; } z = e.z1 + .3; } }
    const mk = (geo, mat, list, cast) => { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)); m.castShadow = !!cast; m.receiveShadow = true; m.frustumCulled = false; const D = new THREE.Object3D();
      list.forEach((it, i) => { D.position.set(it[0], it[1], it[2]); D.rotation.set(0, it[6], 0); D.scale.set(it[3], it[4], it[5]); D.updateMatrix(); m.setMatrixAt(i, D.matrix); }); g.add(m); return m; };
    const caja = new THREE.BoxGeometry(1, 1, 1), plano = new THREE.PlaneGeometry(1, 1);
    mk(caja, std('#2A2420', { roughness: .6 }), inst.marco);
    const persM = new THREE.MeshStandardMaterial({ map: persT, roughness: .5, metalness: .2 }); mk(plano, persM, inst.persiana);
    mk(caja, std('#3A2A22', { roughness: .7 }), inst.puerta); mk(caja, std('#FFFFFF', { map: cortT, metalness: .5, roughness: .45 }), inst.cortina);
    mk(caja, std('#D8D0C2'), inst.losa, true); mk(plano, new THREE.MeshStandardMaterial({ color: '#141212', map: herrT, alphaTest: .5, side: THREE.DoubleSide, roughness: .5, metalness: .5 }), inst.reja, true);
    mk(caja, std('#E8E0D2'), inst.repisa);

    // ---------- pantallas de celular en las ventanas de enfrente ----------
    const ENF = edif.find(e => e.id === 'ENF'), TU = edif.find(e => e.id === 'TU');
    const vEnf = ventanas.filter(v => v.e === ENF);
    // ventanas de enfrente: vidrio con marco y cruceta; detrás, una persona con la carita gris iluminada por su celular
    const marcoM = std('#1C1A1E', { roughness: .6 }), fondoM = new THREE.MeshBasicMaterial({ color: '#040509' }), vidrioM = new THREE.MeshBasicMaterial({ color: '#2A3A60', transparent: true, opacity: .22, depthWrite: false });
    const DIR = V3(0, -.55, .85).normalize();
    const cabezaGeo = (() => { const geo = new THREE.SphereGeometry(.12, 18, 14); const n = geo.attributes.normal, c = new Float32Array(n.count * 3);
      for (let i = 0; i < n.count; i++) { const k = Math.max(0, n.getX(i) * DIR.x + n.getY(i) * DIR.y + n.getZ(i) * DIR.z); c.set([.04 + .2 * k, .045 + .23 * k, .06 + .29 * k], i * 3); } geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); return geo; })();
    const hombrosGeo = (() => { const geo = new THREE.BoxGeometry(.42, .24, .16, 4, 2, 1); const n = geo.attributes.normal, p2 = geo.attributes.position, c = new Float32Array(n.count * 3);
      for (let i = 0; i < n.count; i++) { const k = Math.max(0, n.getZ(i)) * (.35 + .65 * Math.max(0, .5 - Math.abs(p2.getX(i)) * 2)); c.set([.025 + .1 * k, .03 + .12 * k, .045 + .17 * k], i * 3); } geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); return geo; })();
    const brillos = vEnf.map((v, i) => { const rs = rng(90 + i), ww = v.balc ? 1.05 : 1.15, hh = v.balc ? 2.1 : 1.25, yc = v.y;
      const grp = new THREE.Group(); grp.position.set(v.fx, yc, v.z); grp.rotation.y = v.nx > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(grp);
      const fondo = new THREE.Mesh(new THREE.PlaneGeometry(ww, hh), fondoM); fondo.position.z = .012; grp.add(fondo);
      for (const [x, y, w, h] of [[0, hh / 2 + .04, ww + .16, .08], [0, -hh / 2 - .04, ww + .16, .08], [-ww / 2 - .04, 0, .08, hh + .16], [ww / 2 + .04, 0, .08, hh + .16]]) grp.add(N.M(new THREE.BoxGeometry(w, h, .36), marcoM, x, y, .18));
      grp.add(N.M(new THREE.BoxGeometry(.045, hh, .04), marcoM, 0, 0, .34)); grp.add(N.M(new THREE.BoxGeometry(ww, .045, .04), marcoM, 0, v.balc ? .25 : .08, .34));
      const vid = new THREE.Mesh(new THREE.PlaneGeometry(ww, hh), vidrioM); vid.position.z = .33; vid.renderOrder = 4; grp.add(vid);
      const dx = (rs() - .5) * .3 * ww, yh = (v.balc ? -.12 : -.02) + (rs() - .5) * .06;
      const persona = new THREE.Group(); persona.position.set(dx, yh, 0); persona.scale.setScalar(1.35); grp.add(persona);
      const cabeza = new THREE.Mesh(cabezaGeo, new THREE.MeshBasicMaterial({ vertexColors: true, color: '#FFFFFF' })); cabeza.position.set(0, 0, .15); cabeza.scale.set(1, 1.08, .75); persona.add(cabeza);
      const hombros = new THREE.Mesh(hombrosGeo, new THREE.MeshBasicMaterial({ vertexColors: true, color: '#FFFFFF' })); hombros.position.set(0, -.27, .1); persona.add(hombros);
      const pant = new THREE.Mesh(new THREE.PlaneGeometry(.05, .09), new THREE.MeshBasicMaterial({ color: HDR(2.2, 2.6, 3.2) })); pant.position.set(.03, -.2, .24); pant.rotation.x = -.6; persona.add(pant);
      const halo = N.glow('#9FC8FF', .4, .5); halo.material.color = HDR(.55, .8, 1.25); halo.material.fog = false; halo.position.set(.03, -.16, .26); persona.add(halo);
      const luz = N.glow('#7FA8FF', .9, .12); luz.material.fog = false; luz.position.set(0, -.05, .05); persona.add(luz);
      return { v, grp, persona, cabeza, hombros, pant, halo, luz, ph: rs() * 6 }; });
    // k: 0..1 brillo de cada pantalla (apagada = 0)
    function pantallasEnf(k, t = 0) { brillos.forEach(b => { const kk = k * (.85 + .15 * Math.sin(t * 1.3 + b.ph)); b.persona.visible = kk > .01; b.cabeza.material.color.setScalar(kk); b.hombros.material.color.setScalar(kk); b.pant.material.color.setRGB(2.2 * kk, 2.6 * kk, 3.2 * kk); b.halo.material.opacity = .5 * kk; b.luz.material.opacity = .18 * kk; }); }
    // ventana del vecino del tercero (balcón central)
    const vVec = vEnf.find(v => v.f === 3 && v.balc && v.c === Math.floor(Math.max(1, Math.floor((ENF.w - 1) / 3)) / 2)) || vEnf.filter(v => v.f === 3)[0];
    const luzVec = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.05), new THREE.MeshBasicMaterial({ color: HDR(5, 3.4, 1.6), transparent: true, opacity: 0 })); luzVec.position.set(vVec.fx + vVec.nx * .03, vVec.y, vVec.z); luzVec.rotation.y = Math.PI / 2; g.add(luzVec);
    const luzVecL = new THREE.PointLight('#FFC27A', 0, 18, 1.5); luzVecL.position.set(vVec.fx + vVec.nx * 1.2, vVec.y + .3, vVec.z); g.add(luzVecL);

    // ---------- farolas de sodio ----------
    const farolas = [], charcoT = N.canvasTex(256, 256, (x) => { const gr = x.createRadialGradient(128, 128, 0, 128, 128, 126); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); }, false);
    const anilloT = N.canvasTex(256, 256, (x) => { const gr = x.createRadialGradient(128, 128, 60, 128, 128, 126); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.7, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); }, false);
    const poste = std('#22201E', { roughness: .5, metalness: .4 });
    let side = 1; for (let z = -66; z <= 70; z += 15) { const sx = side * 4.5; side = -side; const f = new THREE.Group(); f.position.set(sx, 0, z); g.add(f);
      f.add(N.M(new THREE.CylinderGeometry(.08, .12, 6.5, 8), poste, 0, 3.25, 0)); const brazo = N.M(new THREE.BoxGeometry(1.6, .08, .08), poste, -Math.sign(sx) * .8, 6.4, 0); f.add(brazo);
      f.add(N.M(new THREE.BoxGeometry(.7, .16, .32), poste, -Math.sign(sx) * 1.55, 6.32, 0));
      const bm = new THREE.MeshBasicMaterial({ color: HDR(6, 2.6, .55) }); const bulbo = new THREE.Mesh(new THREE.BoxGeometry(.56, .05, .24), bm); bulbo.position.set(-Math.sign(sx) * 1.55, 6.22, 0); f.add(bulbo);
      const halo = N.glow('#FF8A2A', 3.2, .55); halo.material.color = HDR(2.2, .9, .2); halo.position.set(sx - Math.sign(sx) * 1.55, 6.1, z); g.add(halo);
      const pm = new THREE.MeshBasicMaterial({ map: charcoT, color: HDR(1.0, .42, .1), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .9 });
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), pm); pool.rotation.x = -Math.PI / 2; pool.position.set(sx - Math.sign(sx) * 1.8, .2, z); pool.renderOrder = 2; g.add(pool);
      const L = new THREE.PointLight('#FF8A2A', 5, 15, 2); L.position.set(sx - Math.sign(sx) * 1.55, 5.9, z); g.add(L);
      const am = new THREE.MeshBasicMaterial({ map: anilloT, color: '#000000', transparent: true, opacity: 0, depthWrite: false, fog: false }); const anillo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), am); const borde = new THREE.Mesh(new THREE.RingGeometry(.47, .5, 96), new THREE.MeshBasicMaterial({ color: HDR(1.4, .55, .15), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); borde.position.z = .001; anillo.add(borde); anillo.rotation.x = -Math.PI / 2; anillo.position.copy(pool.position).setY(.24); anillo.renderOrder = 3; g.add(anillo);
      farolas.push({ f, bm, halo, pm, L, anillo, am, z, x: sx, k: 1 }); }
    // k: 1 encendida, 0 apagada · pop: 0..1 progreso del anillo oscuro al apagarse
    function farola(i, k, pop = 0) { const F = farolas[i]; if (!F) return; F.k = k; F.bm.color.setRGB(6 * k + .05, 2.6 * k + .03, .55 * k + .02); F.halo.material.opacity = .55 * k; F.pm.opacity = .9 * k; F.L.intensity = 5 * k;
      F.anillo.visible = pop > 0 && pop < 1; if (F.anillo.visible) { F.anillo.scale.setScalar(2 + pop * 26); F.am.opacity = .9 * Math.sin(Math.PI * Math.min(1, pop * 1.2)); F.anillo.children[0].material.opacity = .8 * (1 - pop); } }

    // ---------- coches, palmeras ----------
    const coche = (col) => { const c = new THREE.Group(), pin = std(col, { roughness: .35, metalness: .4 }), vid = std('#0A0C14', { roughness: .1, metalness: .6 });
      c.add(N.M(new THREE.BoxGeometry(1.8, .62, 4.2), pin, 0, .55, 0)); c.add(N.M(new THREE.BoxGeometry(1.6, .55, 2.2), vid, 0, 1.12, -.2)); c.add(N.M(new THREE.BoxGeometry(1.62, .08, 2.0), pin, 0, 1.42, -.2));
      for (const [x, z] of [[-.85, 1.35], [.85, 1.35], [-.85, -1.35], [.85, -1.35]]) { const w = N.cyl(.34, .34, .24, std('#121214', { roughness: .8 }), 14, x, .34, z); w.rotation.z = Math.PI / 2; c.add(w); }
      for (const x of [-.6, .6]) { c.add(N.M(new THREE.BoxGeometry(.3, .12, .04), std('#D8D8D0'), x, .68, 2.11)); c.add(N.M(new THREE.BoxGeometry(.3, .12, .04), std('#6A1418'), x, .68, -2.11)); } return c; };
    const colC = ['#8A1E24', '#E8E8EA', '#2A4A7A', '#1A1A1E', '#9AA0A8', '#3A6A4A', '#C8A040', '#5A2A6A'];
    const coches = []; for (const s of [-1, 1]) { let z = -70 + r() * 6; while (z < 70) { if (!(s > 0 && z > -2 && z < 4)) { const c = coche(colC[Math.floor(r() * colC.length)]); c.position.set(s * 2.9, 0, z); c.rotation.y = s > 0 ? 0 : Math.PI; g.add(c); coches.push(c); } z += 5.4 + r() * 4.5; } }
    const palmera = (x, z, h = 7) => { const p = new THREE.Group(); p.position.set(x, .16, z); g.add(p); let px = 0; for (let i = 0; i < 9; i++) { const seg = N.cyl(.16, .2, h / 9, std('#6A5038'), 6, px, (i + .5) * h / 9, 0); seg.rotation.z = .035 * i; p.add(seg); px += .04 * i * .3; }
      for (let i = 0; i < 8; i++) { const lp = new THREE.Group(); lp.position.set(px, h, 0); lp.rotation.y = i * Math.PI * 2 / 8; const hoja = N.box(2.8, .05, .45, std('#24502E'), 1.3, -.2, 0); hoja.rotation.z = -.45; lp.add(hoja); p.add(lp); } return p; };
    for (const [x, z] of [[-6.6, -30], [6.6, -44], [-6.6, 22], [6.6, 38], [-6.6, -58], [6.6, -16], [-6.6, 48]]) palmera(x, z, 6.5 + (z % 3 + 3) * .4);

    // ---------- tu recámara (1er piso del edificio TU, ventana a la calle en z=0) ----------
    const RX0 = 7.36, RD = 4.6, RW = 4.4, RY = G + .12, RH = 2.75, RX1 = RX0 + RD;
    const cuarto = new THREE.Group(); g.add(cuarto);
    const madT = N.canvasTex(512, 512, (x, w, h) => { const rs = rng(4); for (let j = 0; j < 8; j++) { let xx = -rs() * 200; while (xx < w) { const L = 160 + rs() * 200, v = rs() * 24 - 12; x.fillStyle = `rgb(${120 + v | 0},${80 + v | 0},${54 + v | 0})`; x.fillRect(xx, j * 64, L - 3, 61); xx += L; } } });
    madT.wrapS = madT.wrapT = THREE.RepeatWrapping; madT.repeat.set(2, 2);
    const paredM = new THREE.MeshStandardMaterial({ color: '#B8B0C8', roughness: .95, side: THREE.BackSide }), nada = new THREE.MeshBasicMaterial({ visible: false });
    const room = new THREE.Mesh(new THREE.BoxGeometry(RD, RH, RW), [paredM, nada, new THREE.MeshStandardMaterial({ color: '#D8D4DC', side: THREE.BackSide }), new THREE.MeshStandardMaterial({ map: madT, roughness: .6, side: THREE.BackSide }), paredM, paredM]);
    room.position.set(RX0 + RD / 2, RY + RH / 2, 0); cuarto.add(room);
    // pared de la ventana con hueco (ventana 1.3 x 1.5 en z=0)
    const pV = std('#B8B0C8', { roughness: .95 }), wy0 = G + 1.55 - .75, wy1 = G + 1.55 + .75;
    const pieza = (z0, z1, y0, y1) => { const m = N.M(new THREE.BoxGeometry(.1, y1 - y0, z1 - z0), pV, RX0, (y0 + y1) / 2, (z0 + z1) / 2); cuarto.add(m); };
    pieza(-RW / 2, -.65, RY, RY + RH); pieza(.65, RW / 2, RY, RY + RH); pieza(-.65, .65, RY, wy0); pieza(-.65, .65, wy1, RY + RH);
    for (const [a, b, c, d] of [[-.7, .7, wy0 - .05, wy0 + .02], [-.7, .7, wy1 - .02, wy1 + .05]]) cuarto.add(N.M(new THREE.BoxGeometry(.18, d - c, b - a), std('#2A2420'), RX0, (c + d) / 2, (a + b) / 2));
    for (const z of [-.68, .68, 0]) cuarto.add(N.M(new THREE.BoxGeometry(.16, 1.5, .05), std('#2A2420'), RX0, G + 1.55, z));
    // cortina morada (dos paños con pliegues)
    const pano = (z0, ancho) => { const geo = new THREE.PlaneGeometry(ancho, 2.05, 28, 1); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 18) * .045); geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#4A2280', roughness: .9, side: THREE.DoubleSide })); m.rotation.y = Math.PI / 2; m.position.set(RX0 + .22, G + 1.5, z0); m.castShadow = true; cuarto.add(m); return m; };
    const cortIzq = pano(-.62, .78), cortDer = pano(.62, .78);
    cuarto.add(N.M(new THREE.CylinderGeometry(.02, .02, 2.2, 6), std('#2A2420'), RX0 + .24, G + 2.55, 0)); cuarto.children[cuarto.children.length - 1].rotation.x = Math.PI / 2;
    // cama (cabecera contra la pared del fondo), buró y celular
    const bz = -.55, cama = new THREE.Group(); cama.position.set(RX1 - 1.1, RY, bz); cuarto.add(cama);
    cama.add(N.M(new THREE.BoxGeometry(2.1, .32, 1.5), std('#6A4630'), 0, .2, 0)); cama.add(N.M(new THREE.BoxGeometry(.1, 1.0, 1.55), std('#5A3A26'), 1.05, .5, 0));
    cama.add(N.M(new THREE.BoxGeometry(2.0, .22, 1.42), std('#E8E6EE'), 0, .47, 0));
    const cobGeo = new THREE.BoxGeometry(1.5, .14, 1.56, 12, 1, 8); { const p = cobGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, p.getY(i) + Math.sin(x * 5 + z * 3) * .03 + (Math.abs(z) > .7 ? -.08 : 0)); } cobGeo.computeVertexNormals(); }
    const cobija = new THREE.Mesh(cobGeo, std('#2A4CA0', { roughness: 1 })); cobija.position.set(-.25, .6, 0); cobija.castShadow = cobija.receiveShadow = true; cama.add(cobija);
    cama.add(N.M(new THREE.BoxGeometry(.45, .16, 1.1), std('#F2F0F6'), .72, .65, 0));
    // alguien dormido: cabeza en la almohada y el bulto del cuerpo bajo la cobija
    const durmiente = new THREE.Group(); cama.add(durmiente);
    const cabD = N.M(new THREE.SphereGeometry(.11, 20, 16), std('#B88060', { flatShading: false, roughness: .7 }), .66, .82, .05); cabD.scale.set(1.05, .9, 1); durmiente.add(cabD);
    const peloD = N.M(new THREE.SphereGeometry(.118, 20, 16, 0, Math.PI * 2, 0, Math.PI * .5), std('#2A1E18', { flatShading: false, roughness: .9 }), .675, .83, .05); peloD.rotation.z = -1.75; durmiente.add(peloD);
    const cuerpoD = N.M(new THREE.SphereGeometry(.5, 20, 12), cobija.material, -.2, .63, .02); cuerpoD.scale.set(1.35, .2, .72); durmiente.add(cuerpoD);
    const hombroD = N.M(new THREE.SphereGeometry(.2, 16, 10), cobija.material, .36, .66, .05); hombroD.scale.set(.8, .5, 1.5);
    const ojoM = std('#3A2420'); [-.04, .04].forEach(z => { const o = N.M(new THREE.BoxGeometry(.012, .006, .03), ojoM, .62, .915, .05 + z); durmiente.add(o); }); N.M; durmiente.add(N.M(new THREE.BoxGeometry(.03, .025, .02), std('#A87050'), .58, .92, .05)); durmiente.add(hombroD);
    const buro = new THREE.Group(); buro.position.set(RX1 - .35, RY, bz + 1.15); cuarto.add(buro); const mbT = madT.clone(); mbT.needsUpdate = true; mbT.repeat.set(.5, .5); buro.add(N.M(new THREE.BoxGeometry(.5, .55, .5), std('#B07850', { roughness: .45, map: mbT }), 0, .275, 0)); buro.add(N.M(new THREE.BoxGeometry(.4, .02, .02), std('#C8B070', { metalness: .8 }), -.26, .32, 0));
    buro.add(N.M(new THREE.BoxGeometry(.02, .16, .4), std('#5A3A26'), -.25, .32, 0));
    // lámpara de buró (apagada) y vaso
    buro.add(N.M(new THREE.CylinderGeometry(.05, .07, .3, 10), std('#D8D0C0'), .1, .7, -.12)); buro.add(N.M(new THREE.CylinderGeometry(.1, .14, .16, 12, 1, true), std('#E8E0D0', { side: THREE.DoubleSide }), .1, .9, -.12));
    // pasillo y cocina (para escenas 10-12): sale por la pared +z hacia la cocina
    const PZ0 = RW / 2, PZ1 = 9.5, PX = RX1 - .9, PW = 1.4;
    const pasT = madT.clone(); pasT.needsUpdate = true; pasT.repeat.set(.6, 3.4);
    // pasillo en penumbra azul (paredes con textura de aplanado, techo oscuro)
    const aplT = N.canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#4A5290'; x.fillRect(0, 0, w, h); const ra = rng(31); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${ra() < .5 ? '20,24,60' : '120,130,200'},${.05 + ra() * .07})`; x.beginPath(); x.arc(ra() * w, ra() * h, 2 + ra() * 14, 0, 7); x.fill(); } }); aplT.wrapS = aplT.wrapT = THREE.RepeatWrapping; aplT.repeat.set(2, 2);
    const pasM = new THREE.MeshStandardMaterial({ color: '#7A84C0', map: aplT, roughness: .95, side: THREE.BackSide }), techoP = new THREE.MeshStandardMaterial({ color: '#2A2E52', side: THREE.BackSide });
    const pas = new THREE.Mesh(new THREE.BoxGeometry(PW, RH, PZ1 - PZ0), [pasM, pasM, techoP, new THREE.MeshStandardMaterial({ map: pasT, color: '#9A8A8A', roughness: .5, side: THREE.BackSide }), nada, nada]);
    pas.position.set(PX, RY + RH / 2, (PZ0 + PZ1) / 2); cuarto.add(pas);
    room.material[4] = nada; // la pared +z del cuarto se arma con hueco de puerta
    const pZM = std('#3C4680', { roughness: .95, map: aplT }); const pZ = (x0, x1, y0, y1) => cuarto.add(N.M(new THREE.BoxGeometry(x1 - x0, y1 - y0, .1), pZM, (x0 + x1) / 2, (y0 + y1) / 2, PZ0));
    pZ(RX0, PX - PW / 2, RY, RY + RH); pZ(PX + PW / 2, RX1, RY, RY + RH); pZ(PX - PW / 2, PX + PW / 2, RY + 2.1, RY + RH);
    const KZ0 = PZ1, KZ1 = KZ0 + 3.2, KX0 = RX0 + .4, KX1 = RX1;
    const coc = new THREE.Mesh(new THREE.BoxGeometry(KX1 - KX0, RH, KZ1 - KZ0), [pasM, pasM, techoP, new THREE.MeshStandardMaterial({ color: '#5A5A70', roughness: .5, side: THREE.BackSide }), pasM, nada]);
    coc.position.set((KX0 + KX1) / 2, RY + RH / 2, (KZ0 + KZ1) / 2); cuarto.add(coc);
    const pasF = pasM.clone(); pasF.side = THREE.FrontSide; const pK = (x0, x1, y0, y1) => cuarto.add(N.M(new THREE.BoxGeometry(x1 - x0, y1 - y0, .1), pasF, (x0 + x1) / 2, (y0 + y1) / 2, KZ0));
    pK(KX0, PX - PW / 2, RY, RY + RH); pK(PX + PW / 2, KX1, RY, RY + RH); pK(PX - PW / 2, PX + PW / 2, RY + 2.1, RY + RH);
    const refri = new THREE.Group(); refri.position.set(PX + .1, RY, KZ1 - .45); cuarto.add(refri);
    refri.add(N.M(new THREE.BoxGeometry(.8, 1.85, .7), std('#E4E6EA', { roughness: .4 }), 0, .925, 0));
    const puertaR = new THREE.Group(); puertaR.position.set(-.4, 0, -.36); refri.add(puertaR); puertaR.add(N.M(new THREE.BoxGeometry(.8, 1.2, .06), std('#EEF0F4', { roughness: .35 }), .4, .62, 0)); puertaR.add(N.M(new THREE.BoxGeometry(.03, .5, .04), std('#9AA0A8', { metalness: .8 }), .74, .9, -.05));
    refri.add(N.M(new THREE.BoxGeometry(.8, .6, .06), std('#EEF0F4', { roughness: .35 }), 0, 1.55, -.36));
    const luzRefri = new THREE.Mesh(new THREE.PlaneGeometry(.7, 1.1), new THREE.MeshBasicMaterial({ color: HDR(3.5, 3.6, 3.8) })); luzRefri.position.set(0, .62, -.33); luzRefri.rotation.y = Math.PI; refri.add(luzRefri);
    const refriL = new THREE.SpotLight('#E8F0FF', 0, 12, .55, .7, 1.2); refriL.position.set(PX + .1, RY + .7, KZ1 - .9); refriL.target.position.set(PX, RY, PZ0 - 2); cuarto.add(refriL, refriL.target);
    // puerta de madera cerrada al fondo del pasillo (sin luz) y puerta del cuarto abierta
    const madP = std('#7E5232', { roughness: .55, flatShading: false }), madP2 = std('#5E3C24', { roughness: .6 }), DWf = .86, DHf = 2.06;
    cuarto.add(N.M(new THREE.BoxGeometry((PW - DWf) / 2, 2.1, .1), pasM.clone(), PX - PW / 2 + (PW - DWf) / 4, RY + 1.05, KZ0 - .06)); cuarto.add(N.M(new THREE.BoxGeometry((PW - DWf) / 2, 2.1, .1), pasM.clone(), PX + PW / 2 - (PW - DWf) / 4, RY + 1.05, KZ0 - .06));
    cuarto.children.slice(-2).forEach(o => o.material.side = THREE.FrontSide);
    cuarto.add(N.M(new THREE.BoxGeometry(DWf, DHf, .05), madP, PX, RY + DHf / 2, KZ0 - .08));
    [[.62], [1.5]].forEach(([y]) => cuarto.add(N.M(new THREE.BoxGeometry(DWf - .24, y < 1 ? .72 : .7, .02), madP2, PX, RY + y, KZ0 - .11)));
    const mF = std('#3A2416', { roughness: .7 }); cuarto.add(N.M(new THREE.BoxGeometry(.06, DHf + .06, .08), mF, PX - DWf / 2 - .03, RY + (DHf + .06) / 2, KZ0 - .09)); cuarto.add(N.M(new THREE.BoxGeometry(.06, DHf + .06, .08), mF, PX + DWf / 2 + .03, RY + (DHf + .06) / 2, KZ0 - .09)); cuarto.add(N.M(new THREE.BoxGeometry(DWf + .12, .06, .08), mF, PX, RY + DHf + .03, KZ0 - .09));
    cuarto.add(N.M(new THREE.SphereGeometry(.028, 12, 10), std('#D8C8A0', { metalness: .8, roughness: .3 }), PX - DWf / 2 + .1, RY + 1.0, KZ0 - .14));
    const hojaC = N.M(new THREE.BoxGeometry(.04, 2.05, .82), madP, PX - PW / 2 + .04, RY + 1.03, PZ0 - .45); cuarto.add(hojaC);
    const azulP = new THREE.PointLight('#5A6AE0', .55, 6, 1.6); azulP.position.set(PX, RY + 2.3, (PZ0 + PZ1) / 2); cuarto.add(azulP);
    const fondoL = new THREE.PointLight('#8A96E0', 2.2, 3.6, 1.4); fondoL.position.set(PX - .2, RY + 1.7, KZ0 - 1.3); cuarto.add(fondoL);
    // puerta entreabierta en la pared +x del pasillo (izquierda vista desde la cama): sale una luz cálida suave
    const pc = new THREE.Group(); pc.position.set(PX + PW / 2 - .01, RY, PZ0 + 2.6); cuarto.add(pc);
    const marcoPC = std("#3A2618", { roughness: .7 }), DW = .82, DH = 2.02;
    pc.add(N.M(new THREE.BoxGeometry(.04, DH + .06, .07), marcoPC, -.02, (DH + .06) / 2, -DW / 2 - .035)); pc.add(N.M(new THREE.BoxGeometry(.04, DH + .06, .07), marcoPC, -.02, (DH + .06) / 2, DW / 2 + .035)); pc.add(N.M(new THREE.BoxGeometry(.04, .07, DW + .14), marcoPC, -.02, DH + .035, 0));
    const hueco = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), new THREE.MeshBasicMaterial({ map: N.canvasTex(64, 256, (x, w, h) => { const gg = x.createLinearGradient(0, 0, w, 0); gg.addColorStop(0, '#0E0A10'); gg.addColorStop(.55, '#2A1A14'); gg.addColorStop(1, '#C8783A'); x.fillStyle = gg; x.fillRect(0, 0, w, h); }), color: HDR(1.0, .85, .7) }));
    hueco.rotation.y = -Math.PI / 2; hueco.position.set(-.002, DH / 2, 0); pc.add(hueco);
    const hoja = new THREE.Group(); hoja.position.set(-.01, 0, -DW / 2); pc.add(hoja); hoja.rotation.y = .55;   // abierta hacia el pasillo, poquito
    hoja.add(N.M(new THREE.BoxGeometry(.04, DH - .02, DW - .02), std('#5A3A24', { roughness: .6 }), -.02, DH / 2, DW / 2)); hoja.add(N.M(new THREE.SphereGeometry(.025, 10, 8), std('#C8A060', { metalness: .8, roughness: .3 }), -.06, 1.0, DW - .1));
    const rendija = new THREE.Mesh(new THREE.PlaneGeometry(.05, DH - .05), new THREE.MeshBasicMaterial({ color: HDR(2.2, 1.3, .6), transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); rendija.rotation.y = -Math.PI / 2; rendija.position.set(-.004, DH / 2, DW / 2 - .03); pc.add(rendija);
    const calT = N.canvasTex(128, 256, (x, w, h) => { const gg = x.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, 'rgba(255,255,255,.9)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.beginPath(); x.moveTo(w * .3, 0); x.lineTo(w * .7, 0); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill(); }, false);
    const calPiso = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.1), new THREE.MeshBasicMaterial({ map: calT, color: HDR(.4, .21, .08), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    calPiso.geometry.translate(0, -.55, 0); calPiso.rotation.set(-Math.PI / 2, 0, -Math.PI / 2 + .15); calPiso.position.set(-.02, .006, .15); calPiso.renderOrder = 3; pc.add(calPiso);
    const calL = new THREE.PointLight('#FF9A4A', 1.6, 4.2, 1.6); calL.position.set(-.35, 1.2, .3); pc.add(calL);
    const calG = N.glow('#FFA050', 1, .45); calG.material.color = HDR(1.0, .55, .22); calG.scale.set(.7, 2.3, 1); calG.position.set(-.06, DH / 2, DW / 2 - .05); pc.add(calG);
    const tablon = N.M(new THREE.BoxGeometry(PW - .1, .012, .22), std('#6A4630', { roughness: .6 }), PX, RY + .005, (PZ0 + PZ1) / 2 + 1.0); cuarto.add(tablon);
    cuarto.traverse(o => { if (o.isMesh) { o.receiveShadow = true; } });
    const luzCalle = new THREE.PointLight('#FF8A3A', 1.8, 7, 2); luzCalle.position.set(RX0 + .6, G + 1.6, 0); cuarto.add(luzCalle);
    const relleno = new THREE.PointLight('#5A5AC8', .7, 8, 2); relleno.position.set(RX0 + 2.5, RY + 2.3, -.5); cuarto.add(relleno);

    // ---------- el celular (genérico, sin marca) ----------
    const cel = (() => { const grp = new THREE.Group(); const w = .075, h = .158, rr = .011;
      const sh = new THREE.Shape(); sh.moveTo(-w / 2 + rr, -h / 2); sh.lineTo(w / 2 - rr, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rr); sh.lineTo(w / 2, h / 2 - rr); sh.quadraticCurveTo(w / 2, h / 2, w / 2 - rr, h / 2); sh.lineTo(-w / 2 + rr, h / 2); sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rr); sh.lineTo(-w / 2, -h / 2 + rr); sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rr, -h / 2);
      const bg = new THREE.ExtrudeGeometry(sh, { depth: .006, bevelEnabled: true, bevelSize: .0015, bevelThickness: .0015, bevelSegments: 3 }); bg.translate(0, 0, -.003);
      grp.add(new THREE.Mesh(bg, std('#16181E', { roughness: .3, metalness: .6 })));
      const cv = document.createElement('canvas'); cv.width = 540; cv.height = 1140; const ctx = cv.getContext('2d'); const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
      const scrM = new THREE.MeshBasicMaterial({ map: tex, color: HDR(1, 1, 1) }); const scr = new THREE.Mesh(new THREE.PlaneGeometry(w - .004, h - .004), scrM); scr.position.z = .0047; grp.add(scr);
      grp.rotation.x = -Math.PI / 2;   // acostado, pantalla hacia arriba
      let firma = null;
      function rr2(x, y, ww, hh, r) { ctx.beginPath(); ctx.roundRect(x, y, ww, hh, r); }
      function txt(s, x, y, px, col, w = 900, al = 'center') { ctx.font = `${w} ${px}px Nunito, sans-serif`; ctx.fillStyle = col; ctx.textAlign = al; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
      function barra(col) { txt('03:00', 46, 46, 34, col, 900, 'left'); ctx.fillStyle = col; for (let i = 0; i < 4; i++) ctx.fillRect(380 + i * 12, 58 - i * 7 - 8, 8, 8 + i * 7); rr2(440, 32, 56, 28, 6); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke(); ctx.fillRect(498, 41, 5, 10); ctx.fillStyle = '#FF5A5A'; ctx.fillRect(444, 36, 10, 20); }
      function alerta(titulo, cuerpo, ok = true) { const gr = ctx.createLinearGradient(0, 0, 0, 1140); gr.addColorStop(0, '#D0141E'); gr.addColorStop(1, '#7A0610'); ctx.fillStyle = gr; ctx.fillRect(0, 0, 540, 1140); barra('#FFE8E8');
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(270, 130); ctx.lineTo(352, 270); ctx.lineTo(188, 270); ctx.closePath(); ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.fill(); txt('!', 270, 222, 96, '#C8101C');
        txt('ALERTA DE EMERGENCIA', 270, 318, 36, '#FFFFFF'); txt('Alerta extrema · ahora', 270, 362, 27, '#FFD0D0', 700);
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(60, 398, 420, 3);
        let yy = 430; cuerpo.forEach(([s, px]) => { yy += px * .62; txt(s, 270, yy, px, '#FFFFFF'); yy += px * .62; });
        if (ok) { rr2(150, 1000, 240, 78, 39); ctx.fillStyle = '#FFFFFF'; ctx.fill(); txt('OK', 270, 1040, 40, '#B00E18'); }
        txt(titulo, 270, 400 - 20, 1, 'rgba(0,0,0,0)'); }
      function bateria(k) { if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; rr2(34, 560, 472, 330, 34); ctx.fillStyle = 'rgba(60,8,14,.93)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,200,200,.55)'; ctx.lineWidth = 3; ctx.stroke();
        rr2(66, 598, 74, 38, 8); ctx.strokeStyle = '#FFD0D0'; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = '#FF4A4A'; ctx.fillRect(72, 604, 14, 26);
        txt('Batería baja', 160, 617, 38, '#FFFFFF', 900, 'left'); txt('Batería restante: 20%', 270, 700, 32, '#FFE0E0', 700);
        rr2(60, 760, 200, 86, 22); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fill(); txt('Ahorrar', 160, 790, 30, '#FFFFFF', 800); txt('batería', 160, 824, 30, '#FFFFFF', 800);
        rr2(280, 760, 200, 86, 22); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fill(); txt('Cerrar', 380, 803, 32, '#FFFFFF', 800); ctx.restore(); }
      const CUERPO1 = [['NO', 84], ['ENCIENDAS', 76], ['NINGUNA', 84], ['LUZ', 84]];
      const CUERPO2 = [['Mensaje 2 de 2', 34], ['SE GUÍA POR', 60], ['LA LUZ.', 60], ['', 20], ['Si ves que se apagan', 36], ['las farolas cerca,', 36], ['NO TE MUEVAS.', 52]];
      // estado: 'negro' | 'alerta' | 'alerta2';  bat: opacidad de la notificación; brillo: 0..1
      function pantalla(estado, o = {}) { const bat = o.bat || 0, f = estado + '|' + bat.toFixed(2);
        if (f !== firma) { firma = f; ctx.clearRect(0, 0, 540, 1140);
          if (estado === 'negro') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 540, 1140); }
          else if (estado === 'alerta') { alerta('', CUERPO1); bateria(bat); }
          else if (estado === 'alerta2') { alerta('', CUERPO2); }
          tex.needsUpdate = true; }
        const b = o.brillo != null ? o.brillo : 1; scrM.color.setRGB(.06 + 1.3 * b, .06 + 1.3 * b, .06 + 1.3 * b); }
      pantalla('negro'); return { grp, pantalla, scr, canvas: cv }; })();
    cel.grp.position.set(RX1 - .42, RY + .556, bz + 1.12); cel.grp.rotation.z = .35; cuarto.add(cel.grp);
    const rojoL = new THREE.PointLight('#FF1A28', 0, 7, 1.6); rojoL.position.copy(cel.grp.position).add(V3(0, .25, 0)); cuarto.add(rojoL);
    // anillos rojos concéntricos de la alarma
    const anilloRojoM = () => new THREE.MeshBasicMaterial({ color: HDR(3, .25, .3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const anillosRojos = [...Array(6)].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(.96, 1, 96), anilloRojoM()); m.rotation.x = -Math.PI / 2; m.position.copy(cel.grp.position).add(V3(0, .01, 0)); m.renderOrder = 6; cuarto.add(m); return m; });
    function alarma(t, k, t0 = 0) { rojoL.intensity = 5 * k * (.75 + .25 * Math.sin(t * 18)); anillosRojos.forEach((a, i) => { const u = ((t - t0) * .55 + i / 6) % 1; a.visible = k > 0; a.scale.setScalar(.05 + u * 4.5); a.material.opacity = k * Math.min(1, u * 5) * (1 - u); }); }

    return { group: g, edif, ventanas, TU, ENF, brillos, pantallasEnf, vVec, luzVec, luzVecL, farolas, farola, coches, cuarto, cel, rojoL, alarma, cortIzq, cortDer, refri, puertaR, luzRefri, refriL, tablon, puertaCalida: pc, calL, cama, buro, durmiente,
      R: { RX0, RX1, RY, RW, RH, bz, PX, PZ0, PZ1, KZ0, KZ1, wy0, wy1 }, sky, moon, G, U };
  }
  window.COLONIA = COLONIA;
})();
