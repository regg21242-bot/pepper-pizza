/* Celular genérico detallado por capas REALES (sin marcas), para despieces.
   Unidades: 1 = 10 cm  →  15 cm de alto (1.5), 7.2 cm de ancho, 0.8 cm de grosor.
   Capas de adelante hacia atrás: cristal, OLED, marco, placa (con chip GPS), batería, bobina, tapa.
   Uso: const ph = window.CEL.crear(renderer);  ph.userData.despiece(k), .gps(...) */
(function () {
  const THREE = window.THREE;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
  const Wd = .72, Ht = 1.5, R = .1;
  function canvasTex(w, h, draw, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
  function rrShape(w, h, r) { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; }
  function slab(w, h, r, d, mat, bevel = .004) { const g = new THREE.ExtrudeGeometry(rrShape(w, h, r), { depth: d, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 10 }); g.translate(0, 0, -d / 2);
    // UV planas para las caras (0..1)
    const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
    const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m; }
  function ring(w, h, r, d, t, mat) { const s = rrShape(w, h, r); const hole = rrShape(w - t * 2, h - t * 2, Math.max(.01, r - t)); s.holes.push(new THREE.Path(hole.getPoints(40).reverse())); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: .004, bevelThickness: .004, bevelSegments: 3, curveSegments: 12 }); g.translate(0, 0, -d / 2); const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m; }
  const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
  const cyl = (r, d, mat, seg = 32) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d, seg), mat); m.rotation.x = Math.PI / 2; m.castShadow = m.receiveShadow = true; return m; };

  // entorno de estudio para reflejos (tiras de luz suaves)
  function estudio(renderer) {
    const tex = canvasTex(1024, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2A3A6A'); g.addColorStop(.5, '#0E1430'); g.addColorStop(1, '#05070F'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(255,255,255,.95)'; x.fillRect(w * .12, h * .18, w * .1, h * .05); x.fillRect(w * .55, h * .1, w * .22, h * .04);
      x.fillStyle = 'rgba(120,200,255,.8)'; x.fillRect(w * .82, h * .3, w * .05, h * .3); x.fillStyle = 'rgba(255,200,150,.5)'; x.fillRect(w * .35, h * .42, w * .08, h * .02); });
    tex.mapping = THREE.EquirectangularReflectionMapping; const pm = new THREE.PMREMGenerator(renderer); const env = pm.fromEquirectangular(tex).texture; pm.dispose(); return env;
  }

  function crear(renderer) {
    const g = new THREE.Group(), P = { capas: [] };
    // ---------- materiales PBR ----------
    const alu = new THREE.MeshPhysicalMaterial({ color: '#B9BEC7', metalness: 1, roughness: .32, clearcoat: .2 });
    const vidrioNegro = new THREE.MeshPhysicalMaterial({ color: '#05060A', metalness: .1, roughness: .04, clearcoat: 1, clearcoatRoughness: .02, reflectivity: 1, envMapIntensity: 3 });
    const tapaVidrio = new THREE.MeshPhysicalMaterial({ color: '#1C2436', metalness: .3, roughness: .12, clearcoat: 1, clearcoatRoughness: .05 });
    const chipM = new THREE.MeshStandardMaterial({ color: '#16171C', roughness: .7, metalness: .1 });
    const plata = new THREE.MeshStandardMaterial({ color: '#C9CED6', roughness: .3, metalness: 1 });
    const oro = new THREE.MeshStandardMaterial({ color: '#D8A84A', roughness: .3, metalness: 1 });
    const cobre = new THREE.MeshStandardMaterial({ color: '#D8783A', roughness: .25, metalness: 1 });
    const capa = (name, obj, z) => { const l = new THREE.Group(); l.add(obj); l.userData = { z, name }; g.add(l); P[name] = l; P.capas.push(l); return l; };

    // 1. cristal frontal (negro brillante)
    const glass = slab(Wd, Ht, R, .008, vidrioNegro, .003); capa('cristal', glass, .036);
    const cam0 = new THREE.Mesh(new THREE.CircleGeometry(.018, 24), new THREE.MeshStandardMaterial({ color: '#000', roughness: .1 })); cam0.position.set(0, Ht / 2 - .05, .0045); P.cristal.add(cam0);
    // 2. panel OLED (lámina con brillo de colores)
    const oledT = canvasTex(256, 512, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1A1030'); gr.addColorStop(.35, '#2A1F5A'); gr.addColorStop(.6, '#1A3A5A'); gr.addColorStop(.85, '#3A1A4A'); gr.addColorStop(1, '#14102A'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      x.globalAlpha = .18; for (let i = 0; i < h; i += 3) { x.fillStyle = ['#FF3A6A', '#3AFF8A', '#3A8AFF'][i % 3]; x.fillRect(0, i, w, 1); } x.globalAlpha = 1; });
    const oled = slab(Wd - .02, Ht - .02, R - .01, .004, new THREE.MeshPhysicalMaterial({ map: oledT, emissive: '#2A2A6A', emissiveMap: oledT, emissiveIntensity: .7, roughness: .25, metalness: .2, iridescence: 1, iridescenceIOR: 1.6 }), .0015);
    capa('oled', oled, .026);
    const flex = box(.12, .1, .002, cobre, .1, -Ht / 2 + .06, -.003); P.oled.add(flex);
    // 3. marco medio de aluminio con botones
    const marco = new THREE.Group(); marco.add(ring(Wd + .006, Ht + .006, R + .003, .07, .035, alu));
    const midPlate = slab(Wd - .06, Ht - .06, R - .03, .006, new THREE.MeshStandardMaterial({ color: '#3A404C', metalness: .35, roughness: .7 }), 0); midPlate.position.z = -.01; marco.add(midPlate);
    for (const [y, l] of [[.36, .16], [.16, .1], [-.0, .1]]) { const b = box(.012, l, .022, alu, Wd / 2 + .008, y, 0); marco.add(b); }
    const usb = box(.09, .012, .022, new THREE.MeshStandardMaterial({ color: '#0A0A0E' }), 0, -Ht / 2 - .002, 0); marco.add(usb);
    for (let i = 0; i < 6; i++) marco.add(box(.008, .01, .012, new THREE.MeshStandardMaterial({ color: '#0A0A0E' }), -.2 + i * .022, -Ht / 2 - .002, 0));
    capa('marco', marco, 0);
    // 4. placa base: azul petróleo con pistas doradas, chips y componentes
    const pcbT = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#0F3A40'; x.fillRect(0, 0, w, h);
      const r = (() => { let s = 7; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; })();
      x.strokeStyle = 'rgba(220,170,80,.85)'; x.lineWidth = 2; x.lineCap = 'round';
      for (let i = 0; i < 140; i++) { let px = r() * w, py = r() * h; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 3; k++) { if (r() < .5) px += (r() - .5) * 160; else py += (r() - .5) * 160; x.lineTo(px, py); } x.stroke(); x.fillStyle = 'rgba(230,190,100,.9)'; x.beginPath(); x.arc(px, py, 3, 0, 7); x.fill(); }
      x.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 60; i++) x.fillRect(r() * w, r() * h, 6, 2); });
    const board = new THREE.Group(); const pcb = slab(Wd - .06, .82, .04, .012, new THREE.MeshStandardMaterial({ map: pcbT, roughness: .55, metalness: .2 }), .002); pcb.position.y = .32; board.add(pcb);
    const rr = (() => { let s = 21; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; })();
    for (const [x, y, w, h] of [[-.14, .5, .18, .18], [.12, .52, .14, .14], [-.12, .26, .14, .1], [.06, .3, .1, .08], [-.2, .62, .06, .05]]) { const c = box(w, h, .016, chipM, x, y, .014); board.add(c);
      const t = box(w * .5, h * .25, .002, new THREE.MeshStandardMaterial({ color: '#3A3A44', roughness: .4 }), x, y, .023); board.add(t); }
    for (let i = 0; i < 46; i++) { const x = -.28 + rr() * .56, y = .1 + rr() * .56; board.add(box(.012 + rr() * .012, .006 + rr() * .008, .006, rr() < .5 ? plata : new THREE.MeshStandardMaterial({ color: '#4A3A2A', roughness: .6 }), x, y, .01)); }
    const shield = box(.2, .16, .01, plata, -.12, .26, .012); shield.material = new THREE.MeshStandardMaterial({ color: '#B8BEC6', metalness: 1, roughness: .45 }); board.add(shield);
    for (let i = 0; i < 2; i++) board.add(box(.06, .03, .012, oro, -.25 + i * .5, .1, .01));
    capa('placa', board, -.012);
    // 5. chip GPS (dorado, sobre la placa; se separa después)
    const gps = new THREE.Group(); gps.position.set(.2, .26, .016); board.add(gps);
    const gpsMat = new THREE.MeshStandardMaterial({ color: '#C9A050', metalness: .9, roughness: .3, emissive: '#FF2020', emissiveIntensity: 0 });
    const gpsBody = box(.13, .13, .02, gpsMat); gps.add(gpsBody); for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { gps.add(box(.008, .016, .004, plata, -.032 + i * .016, s * .049, -.004)); gps.add(box(.016, .008, .004, plata, s * .049, -.032 + i * .016, -.004)); }
    const gpsDot = new THREE.Mesh(new THREE.CircleGeometry(.008, 16), new THREE.MeshBasicMaterial({ color: '#FFFFFF' })); gpsDot.position.set(-.028, .028, .0085); gps.add(gpsDot);
    P.gps = gps; P.gpsMat = gpsMat;
    // 6. batería gris mate con etiqueta genérica
    const batT = canvasTex(256, 384, (x, w, h) => { x.fillStyle = '#8E949E'; x.fillRect(0, 0, w, h); x.fillStyle = '#E8ECF0'; x.fillRect(24, 40, w - 48, 150); x.fillStyle = '#2A2E36'; x.font = '900 34px Nunito, sans-serif'; x.textAlign = 'center'; x.fillText('Li-ion', w / 2, 100); x.font = '700 22px Nunito, sans-serif'; x.fillText('3.85 V', w / 2, 140); x.fillText('⚠ ♻', w / 2, 175);
      x.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 40; i++) x.fillRect(0, 220 + i * 4, w, 1); });
    const bat = slab(Wd - .1, .8, .03, .03, new THREE.MeshStandardMaterial({ map: batT, roughness: .75, metalness: .35 }), .003); bat.position.y = -.3; capa('bateria', bat, -.034);
    // 7. bobina de carga inalámbrica (espiral de cobre)
    const coil = new THREE.Group(); const pts = []; for (let i = 0; i <= 900; i++) { const a = i / 900 * Math.PI * 2 * 14, r = .06 + .14 * i / 900; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 1800, .0045, 6, false), cobre); tube.castShadow = true; coil.add(tube);
    const ferrita = new THREE.Mesh(new THREE.CircleGeometry(.215, 48), new THREE.MeshStandardMaterial({ color: '#141418', roughness: .9 })); ferrita.position.z = -.004; coil.add(ferrita);
    coil.position.y = -.12; capa('bobina', coil, -.055);
    // 8. tapa trasera de cristal con isla de cámara
    const back = slab(Wd, Ht, R, .008, tapaVidrio, .003); back.rotation.y = Math.PI; capa('tapa', back, -.07);
    const isla = new THREE.Group(); isla.position.set(-.17, Ht / 2 - .2, -.006); P.tapa.add(isla);
    const islaBase = slab(.3, .3, .07, .014, new THREE.MeshPhysicalMaterial({ color: '#141A28', metalness: .5, roughness: .2, clearcoat: 1 }), .004); islaBase.rotation.y = Math.PI; isla.add(islaBase);
    for (const [x, y, r] of [[-.065, .065, .052], [-.065, -.065, .052], [.07, .065, .04]]) { const lens = new THREE.Group(); lens.position.set(x, y, -.012); isla.add(lens);
      const ringM = cyl(r, .02, alu); lens.add(ringM); const glassL = cyl(r * .8, .022, new THREE.MeshPhysicalMaterial({ color: '#05060A', roughness: 0, metalness: .2, clearcoat: 1, iridescence: .6 })); lens.add(glassL);
      const inner = new THREE.Mesh(new THREE.CircleGeometry(r * .35, 24), new THREE.MeshStandardMaterial({ color: '#1A2A5A', roughness: 0, metalness: 1 })); inner.position.z = -.0115; inner.rotation.y = Math.PI; lens.add(inner); }
    const flash = cyl(.016, .016, new THREE.MeshStandardMaterial({ color: '#F4E8C8', emissive: '#FFF0C0', emissiveIntensity: .3 })); flash.position.set(.07, -.065, -.012); isla.add(flash);

    // despiece: k = 0 armado, 1 torre (con rebote); spin = giro propio por capa
    const gap = .5;
    P.despiece = (k, spin = 0) => P.capas.forEach((l, i) => { const zT = (3 - i) * gap; l.position.z = lerp(l.userData.z, zT, k); l.position.y = (i - 3) * .025 * k; l.rotation.z = spin * (i % 2 ? 1 : -1) * .05 * k; l.rotation.x = spin * .04 * k; });
    P.gpsSale = (k) => { gps.position.set(lerp(.2, .72, k), lerp(.26, .2, k), lerp(.016, .2, k)); gps.rotation.z = -.4 * k; gps.scale.setScalar(1 + .5 * k); };
    P.gpsBrillo = (v, off) => { gpsMat.emissiveIntensity = v * 1.6; gpsMat.color.set(off ? '#2A2A30' : '#C9A050'); gpsMat.metalness = off ? .3 : .9; gpsDot.material.color.set(off ? '#3A3A40' : '#FFFFFF'); };
    P.despiece(0); P.gpsSale(0); P.gpsBrillo(0, false);
    g.userData = P; return g;
  }
  window.CEL = { crear, estudio };
})();
