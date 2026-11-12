/* Modelos low-poly compartidos por todas las escenas (protagonista, vecino, edificio, utilería).
   Se cargan una vez como script global: window.M.  Todo es determinista (sin Math.random). */
(function () {
  const THREE = window.THREE;
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const mat = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .82, metalness: 0 }, o));
  const glow = (color) => new THREE.MeshBasicMaterial({ color, toneMapped: false });
  function box(w, h, d, m, x = 0, y = 0, z = 0) { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); g.position.set(x, y, z); g.castShadow = g.receiveShadow = true; return g; }
  function ball(r, m, x = 0, y = 0, z = 0, seg = 18) { const g = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * .7)), m); g.position.set(x, y, z); g.castShadow = true; return g; }
  function cyl(rt, rb, h, m, seg = 16) { const g = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); g.castShadow = true; return g; }

  const SKIN = mat('#D9A27A'), EYE = mat('#151018', { roughness: .3 });

  /* persona: {hoodie, pants, coat, cap, beard, hair, flashlight} → grupo con partes animables */
  function person(o = {}) {
    const g = new THREE.Group(), parts = {};
    const top = mat(o.top || '#F0A030'), pants = mat(o.pants || '#3A5A8C'), shoe = mat('#2A2A30');
    const long = !!o.coat;
    // piernas
    for (const s of [-1, 1]) {
      const leg = new THREE.Group(); leg.position.set(s * .17, .86, 0);
      leg.add(box(.24, .8, .26, pants, 0, -.4, 0)); leg.add(box(.26, .14, .36, shoe, 0, -.8, .05));
      g.add(leg); parts[s < 0 ? 'legL' : 'legR'] = leg;
    }
    // torso (sudadera o abrigo)
    const torso = box(.72, long ? 1.0 : .78, .42, top, 0, long ? 1.22 : 1.26, 0); g.add(torso);
    if (!long) { g.add(box(.5, .2, .06, mat(o.top ? o.top : '#E08E22'), 0, 1.06, .22)); }   // bolsa canguro
    if (long) { g.add(box(.06, .9, .02, mat('#3E2818'), 0, 1.2, .22)); }                    // cierre del abrigo
    // capucha / cuello
    g.add(box(.5, .16, .34, mat(o.top ? o.top : '#E08E22'), 0, 1.68, -.08));
    // brazos con hombro como pivote
    for (const s of [-1, 1]) {
      const arm = new THREE.Group(); arm.position.set(s * .46, 1.6, 0);
      arm.add(box(.2, .74, .24, top, 0, -.36, 0)); arm.add(ball(.11, SKIN, 0, -.78, 0, 10));
      g.add(arm); parts[s < 0 ? 'armL' : 'armR'] = arm;
    }
    // cabeza
    const head = new THREE.Group(); head.position.set(0, 2.02, 0); g.add(head); parts.head = head;
    head.add(ball(.32, SKIN, 0, 0, 0, 20));
    const eyes = [];
    for (const s of [-1, 1]) { const e = ball(.045, EYE, s * .11, .03, .29, 8); head.add(e); eyes.push(e); }
    // ojos cerrados (dormido): rayitas
    const shut = []; for (const s of [-1, 1]) { const l = box(.1, .018, .02, EYE, s * .11, .02, .31); l.visible = false; head.add(l); shut.push(l); }
    parts.sleep = (on) => { eyes.forEach(e => e.visible = !on); shut.forEach(l => l.visible = on); };
    if (o.hair) { const h = new THREE.Mesh(new THREE.SphereGeometry(.345, 20, 12, 0, Math.PI * 2, 0, Math.PI * .5), mat(o.hair)); h.position.set(0, .02, -.02); h.rotation.x = -.25; h.castShadow = true; head.add(h); }
    if (o.beard) { const b = ball(.24, mat(o.beard), 0, -.17, .12, 14); b.scale.set(1.15, .85, .8); head.add(b); head.add(box(.22, .05, .05, mat(o.beard), 0, -.05, .3)); }
    if (o.cap) { const c = new THREE.Mesh(new THREE.SphereGeometry(.35, 20, 10, 0, Math.PI * 2, 0, Math.PI * .5), mat(o.cap)); c.position.y = .06; c.castShadow = true; head.add(c);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .035, 16, 1, false, -Math.PI / 2, Math.PI), mat(o.cap)); brim.position.set(0, .09, .26); brim.scale.set(1.1, 1, 1.3); head.add(brim); }
    if (o.flashlight) {
      const fl = new THREE.Group(); fl.position.set(0, -.8, .1); parts.armR.add(fl);
      const body = cyl(.06, .06, .34, mat('#2A2A2A', { roughness: .4 }), 10); body.rotation.x = Math.PI / 2; body.position.z = .12; fl.add(body);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(.06, 12), glow('#FFF2C0')); lens.position.z = .3; fl.add(lens);
      const spot = new THREE.SpotLight('#FFE7B0', 6, 14, .45, .6, 1.2); spot.position.set(0, 0, .3); spot.castShadow = true;
      const tgt = new THREE.Object3D(); tgt.position.set(0, 0, 5); fl.add(tgt); spot.target = tgt; fl.add(spot);
      const beam = new THREE.Mesh(new THREE.ConeGeometry(.9, 4, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#FFE8B0', transparent: true, opacity: .05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      beam.rotation.x = -Math.PI / 2; beam.position.z = 2.3; fl.add(beam);
      parts.flash = fl; parts.spot = spot; parts.beam = beam;
    }
    g.userData = parts; return g;
  }

  /* vecino detallado: proporciones más reales, codos/rodillas, cara con nariz, cejas, bigote y barba */
  function prism(rt, rb, h, m, sx = 1, sz = 1) { const g = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 4), m); g.rotation.y = Math.PI / 4; const w = new THREE.Group(); w.add(g); w.scale.set(sx, 1, sz); g.castShadow = g.receiveShadow = true; return w; }
  let haloTex = null;
  function halo() {
    if (!haloTex) { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,250,225,1)'); gr.addColorStop(.25, 'rgba(255,215,140,.55)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); haloTex = new THREE.CanvasTexture(c); }
    return new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }));
  }
  function elder() {
    const g = new THREE.Group(), parts = {};
    const coat = mat('#4A3222', { roughness: .85 }), coatD = mat('#33221A'), pants = mat('#2E2E36'), shoe = mat('#18181C'), skin = mat('#D49C76'), hairM = mat('#9E9A94'), capM = mat('#B8282A');
    // piernas con rodilla
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * .13, 1.0, 0); g.add(hip);
      hip.add(box(.17, .5, .19, pants, 0, -.25, 0));
      const knee = new THREE.Group(); knee.position.y = -.5; hip.add(knee);
      knee.add(box(.15, .44, .17, pants, 0, -.22, 0)); knee.add(box(.18, .1, .32, shoe, 0, -.46, .06));
      parts[s < 0 ? 'legL' : 'legR'] = hip; parts[s < 0 ? 'kneeL' : 'kneeR'] = knee;
    }
    // abrigo largo: falda, torso, cuello, botones, bolsas
    const skirt = prism(.32, .37, .55, coat, 1.25, .7); skirt.position.y = .97; g.add(skirt);
    const torso = prism(.36, .31, .74, coat, 1.25, .72); torso.position.y = 1.6; g.add(torso);
    g.add(box(.5, .16, .3, coatD, 0, 1.97, -.01));
    for (const s of [-1, 1]) { const lap = box(.14, .34, .04, coatD, s * .1, 1.82, .2); lap.rotation.z = s * .25; g.add(lap); }
    for (let i = 0; i < 4; i++) g.add(ball(.022, mat('#1A120C'), .03, 1.62 - i * .2, .23, 6));
    for (const s of [-1, 1]) g.add(box(.16, .03, .04, coatD, s * .17, 1.05, .25));
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.075, .085, .13, 10), skin); neck.position.y = 2.05; g.add(neck);
    // brazos con codo
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(s * .38, 1.9, 0); g.add(sh);
      sh.add(ball(.11, coat, 0, -.02, 0, 10));
      sh.add(box(.15, .44, .17, coat, 0, -.22, 0));
      const el = new THREE.Group(); el.position.y = -.44; el.rotation.x = -.12; sh.add(el);
      el.add(box(.14, .38, .16, coat, 0, -.19, 0)); el.add(box(.155, .06, .175, coatD, 0, -.36, 0));
      const hand = ball(.075, skin, 0, -.45, .01, 10); hand.scale.set(1, 1.35, .8); el.add(hand);
      parts[s < 0 ? 'armL' : 'armR'] = sh; parts[s < 0 ? 'elbowL' : 'elbowR'] = el;
    }
    // cabeza
    const head = new THREE.Group(); head.position.set(0, 2.3, 0); g.add(head); parts.head = head;
    const skull = ball(.23, skin, 0, 0, 0, 22); skull.scale.set(.95, 1.12, 1); head.add(skull);
    for (const s of [-1, 1]) { const ear = ball(.05, skin, s * .215, 0, -.01, 8); ear.scale.set(.5, 1, .8); head.add(ear); }
    const nose = box(.06, .1, .09, skin, 0, -.02, .225); nose.rotation.x = -.25; head.add(nose);
    const eyes = [], shut = [];
    for (const s of [-1, 1]) {
      const w = ball(.034, mat('#F2EEE6', { roughness: .4 }), s * .078, .055, .195, 10); head.add(w);
      const pu = ball(.019, EYE, s * .078, .055, .224, 8); head.add(pu); eyes.push(w, pu);
      const l = box(.07, .015, .02, EYE, s * .078, .05, .225); l.visible = false; head.add(l); shut.push(l);
      const br = box(.095, .026, .035, hairM, s * .085, .115, .205); br.rotation.z = -s * .12; head.add(br);
      head.add(box(.07, .01, .01, mat('#B88060'), s * .08, .015, .218));   // ojeras / arruga
    }
    parts.sleep = (on) => { eyes.forEach(e => e.visible = !on); shut.forEach(l => l.visible = on); };
    const beard = ball(.2, hairM, 0, -.16, .07, 14); beard.scale.set(1.05, .85, .78); head.add(beard);
    const must = box(.17, .045, .06, hairM, 0, -.075, .215); head.add(must);
    for (const s of [-1, 1]) { const sb = box(.05, .12, .14, hairM, s * .2, -.04, .02); head.add(sb); }   // patillas
    // gorro de lana con doblez
    const dome = new THREE.Mesh(new THREE.SphereGeometry(.245, 20, 10, 0, Math.PI * 2, 0, Math.PI * .5), capM); dome.position.y = .07; dome.scale.set(1.02, 1.05, 1.04); dome.castShadow = true; head.add(dome);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(.252, .258, .09, 22), mat('#A02024')); cuff.position.y = .1; head.add(cuff);
    // linterna en la mano derecha
    const fl = new THREE.Group(); fl.position.set(0, -.47, .06); parts.elbowR.add(fl);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.045, .05, .26, 10), mat('#2A2A2A', { roughness: .4, metalness: .4 })); body.rotation.x = Math.PI / 2; body.position.z = .09; fl.add(body);
    const head2 = new THREE.Mesh(new THREE.CylinderGeometry(.07, .05, .08, 12), mat('#333', { metalness: .5, roughness: .4 })); head2.rotation.x = Math.PI / 2; head2.position.z = .25; fl.add(head2);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(.065, 14), glow('#FFF6D8')); lens.position.z = .292; fl.add(lens);
    const h = halo(); h.position.z = .33; h.scale.setScalar(.9); fl.add(h); parts.halo = h;
    const spot = new THREE.SpotLight('#FFE7B0', 7, 16, .42, .55, 1.2); spot.position.set(0, 0, .3); spot.castShadow = true;
    const tgt = new THREE.Object3D(); tgt.position.set(0, 0, 5); fl.add(tgt); spot.target = tgt; fl.add(spot);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(.9, 4, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#FFE8B0', transparent: true, opacity: .05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    beam.rotation.x = -Math.PI / 2; beam.position.z = 2.3; fl.add(beam);
    const pl = new THREE.PointLight('#FFD9A0', .8, 2.5, 2); pl.position.z = .4; fl.add(pl);
    parts.flash = fl; parts.spot = spot; parts.beam = beam; parts.lamp = pl;
    g.userData = parts; return g;
  }

  /* protagonista detallado: sudadera con capucha, jeans, tenis, cara con nariz y cejas */
  function youth() {
    const g = new THREE.Group(), parts = {};
    const hood = mat('#F2A033', { roughness: .9 }), hoodD = mat('#D8862A', { roughness: .9 }), jeans = mat('#3A5A8C', { roughness: .85 }), jeansD = mat('#2E4A76');
    const skin = mat('#D9A27A'), hairM = mat('#2A1C14'), sole = mat('#F2F2F2'), shoeM = mat('#2A2A34');
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * .13, 1.0, 0); g.add(hip);
      hip.add(box(.19, .5, .2, jeans, 0, -.25, 0));
      const knee = new THREE.Group(); knee.position.y = -.5; hip.add(knee);
      knee.add(box(.17, .44, .18, jeans, 0, -.22, 0)); knee.add(box(.18, .06, .19, jeansD, 0, -.42, 0));
      knee.add(box(.19, .1, .32, shoeM, 0, -.45, .06)); knee.add(box(.2, .035, .34, sole, 0, -.5, .06));
      parts[s < 0 ? 'legL' : 'legR'] = hip; parts[s < 0 ? 'kneeL' : 'kneeR'] = knee;
    }
    // sudadera: torso, resorte de la cintura, bolsa canguro, cordones, capucha atrás
    const torso = prism(.38, .35, .78, hood, 1.22, .72); torso.position.y = 1.5; g.add(torso);
    g.add(box(.62, .1, .36, hoodD, 0, 1.1, 0));
    g.add(box(.36, .2, .04, hoodD, 0, 1.3, .23));
    for (const s of [-1, 1]) g.add(box(.018, .22, .018, mat('#F4F0E8'), s * .06, 1.78, .25));
    const hd = ball(.26, hood, 0, 1.95, -.16, 16); hd.scale.set(1, .55, .62); g.add(hd);   // capucha caída en la espalda
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.075, .085, .13, 10), skin); neck.position.y = 2.0; g.add(neck);
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(s * .38, 1.84, 0); g.add(sh);
      sh.add(ball(.11, hood, 0, -.02, 0, 10));
      sh.add(box(.16, .44, .18, hood, 0, -.22, 0));
      const el = new THREE.Group(); el.position.y = -.44; el.rotation.x = -.12; sh.add(el);
      el.add(box(.15, .38, .17, hood, 0, -.19, 0)); el.add(box(.16, .07, .18, hoodD, 0, -.36, 0));
      const hand = ball(.075, skin, 0, -.45, .01, 10); hand.scale.set(1, 1.35, .8); el.add(hand);
      parts[s < 0 ? 'armL' : 'armR'] = sh; parts[s < 0 ? 'elbowL' : 'elbowR'] = el;
    }
    const head = new THREE.Group(); head.position.set(0, 2.27, 0); g.add(head); parts.head = head;
    const skull = ball(.23, skin, 0, 0, 0, 22); skull.scale.set(.95, 1.12, 1); head.add(skull);
    for (const s of [-1, 1]) { const ear = ball(.05, skin, s * .215, 0, -.01, 8); ear.scale.set(.5, 1, .8); head.add(ear); }
    const nose = box(.055, .09, .08, skin, 0, -.02, .22); nose.rotation.x = -.25; head.add(nose);
    head.add(box(.09, .015, .015, mat('#9A5A44'), 0, -.11, .215));   // boca
    const eyes = [], shut = [], brows = [];
    for (const s of [-1, 1]) {
      const w = ball(.034, mat('#F2EEE6', { roughness: .4 }), s * .078, .055, .195, 10); head.add(w);
      const pu = ball(.02, EYE, s * .078, .055, .224, 8); head.add(pu); eyes.push(w, pu);
      const l = box(.07, .015, .02, EYE, s * .078, .05, .225); l.visible = false; head.add(l); shut.push(l);
      const br = box(.09, .024, .03, hairM, s * .082, .115, .205); head.add(br); brows.push(br);
    }
    parts.sleep = (on) => { eyes.forEach(e => e.visible = !on); shut.forEach(l => l.visible = on); };
    parts.brows = (worry) => brows.forEach((b, i) => { const sd = i ? 1 : -1; b.rotation.z = -sd * .35 * worry; b.position.y = .115 + .02 * worry; });
    // pelo corto con fleco
    const hair = new THREE.Mesh(new THREE.SphereGeometry(.245, 20, 12, 0, Math.PI * 2, 0, Math.PI * .4), hairM); hair.position.set(0, .05, -.02); hair.scale.set(1.0, 1.12, 1.04); hair.rotation.x = -.22; hair.castShadow = true; head.add(hair);
    const back = ball(.232, hairM, 0, .02, -.055, 18); back.scale.set(.94, 1.06, .93); head.add(back);   // nuca con pelo
    const fringe = ball(.14, hairM, .03, .215, .12, 14); fringe.scale.set(1.55, .42, .95); fringe.rotation.set(.45, 0, -.15); head.add(fringe);   // copete peinado hacia un lado, arriba de las cejas
    for (const s of [-1, 1]) head.add(box(.03, .07, .1, hairM, s * .215, .1, .0));
    g.userData = parts; return g;
  }

  /* persona 3D configurable (estilo de la cuenta): playera, jeans, tenis; alto/ancho/panza; pelo corto o rizado.
     partes: legL/legR (cadera), kneeL/kneeR, armL/armR (hombro), elbowL/elbowR, head, brows(w), mouth(k), look(x,y), sleep(on), sit() */
  function person3d(o = {}) {
    const hS = o.height || 1, wS = o.width || 1, g = new THREE.Group(), parts = {};
    const shirt = mat(o.shirt || '#4FA36A', { roughness: .9 }), shirtD = mat(shade3(o.shirt || '#4FA36A', -.18), { roughness: .9 });
    const jeans = mat(o.pants || '#3A5A8C', { roughness: .85 }), skin = mat(o.skin || '#D9A27A'), hairM = mat(o.hair || '#2A1C14');
    const sole = mat('#F2F2F2'), shoeM = mat(o.shoes || '#2A2A34');
    const hipY = 1.0 * hS, thigh = .5 * hS, shin = .44 * hS;
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * .13 * wS, hipY, 0); g.add(hip);
      hip.add(box(.19 * Math.sqrt(wS), thigh, .2 * Math.sqrt(wS), jeans, 0, -thigh / 2, 0));
      const knee = new THREE.Group(); knee.position.y = -thigh; hip.add(knee);
      knee.add(box(.17 * Math.sqrt(wS), shin, .18, jeans, 0, -shin / 2, 0));
      knee.add(box(.19, .1, .32, shoeM, 0, -shin - .01, .06)); knee.add(box(.2, .035, .34, sole, 0, -shin - .06, .06));
      parts[s < 0 ? 'legL' : 'legR'] = hip; parts[s < 0 ? 'kneeL' : 'kneeR'] = knee;
    }
    const tH = .8 * hS, tY = hipY + tH / 2 + .02;
    const bel = o.belly || 0;
    const torso = prism(.38 * wS, (.36 + .07 * bel) * wS, tH, shirt, 1.18, (.72 + .14 * bel) * Math.sqrt(wS)); torso.position.y = tY; g.add(torso);
    // cuello de la playera
    const collar = new THREE.Mesh(new THREE.TorusGeometry(.1, .025, 6, 16), shirtD); collar.rotation.x = Math.PI / 2; collar.position.set(0, hipY + tH + .02, .02); g.add(collar);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.075, .085, .14, 10), skin); neck.position.y = hipY + tH + .07; g.add(neck);
    const shY = hipY + tH - .06;
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(s * (.36 * wS + .02), shY, 0); g.add(sh);
      sh.add(ball(.11 * Math.sqrt(wS), shirt, 0, -.02, 0, 10));
      sh.add(box(.17 * Math.sqrt(wS), .22, .19, shirt, 0, -.11, 0));                 // manga corta
      sh.add(box(.13 * Math.sqrt(wS), .24, .14, skin, 0, -.32, 0));                  // brazo
      const el = new THREE.Group(); el.position.y = -.44 * hS; el.rotation.x = -.12; sh.add(el);
      el.add(box(.12 * Math.sqrt(wS), .36 * hS, .13, skin, 0, -.18 * hS, 0));
      const hand = ball(.075, skin, 0, -.42 * hS, .01, 10); hand.scale.set(1, 1.3, .8); el.add(hand);
      const hp = new THREE.Object3D(); hp.position.set(0, -.44 * hS, .06); el.add(hp);
      parts[s < 0 ? 'armL' : 'armR'] = sh; parts[s < 0 ? 'elbowL' : 'elbowR'] = el; parts[s < 0 ? 'handL' : 'handR'] = hp;
    }
    const head = new THREE.Group(); head.position.set(0, hipY + tH + .32, 0); head.scale.setScalar(o.headScale || 1); g.add(head); parts.head = head;
    const skull = ball(.23, skin, 0, 0, 0, 22); skull.scale.set(.95 * (o.faceW || 1), 1.12, 1); head.add(skull);
    for (const s of [-1, 1]) { const ear = ball(.05, skin, s * .215 * (o.faceW || 1), 0, -.01, 8); ear.scale.set(.5, 1, .8); head.add(ear); }
    const nose = box(.055, .09, .08, skin, 0, -.02, .22); nose.rotation.x = -.25; head.add(nose);
    const mouth = box(.1, .02, .015, mat('#8A3A2C'), 0, -.11, .215); head.add(mouth);
    const smile = new THREE.Mesh(new THREE.TorusGeometry(.05, .011, 6, 12, Math.PI), mat('#8A3A2C')); smile.rotation.z = Math.PI; smile.position.set(0, -.085, .214); head.add(smile);
    for (const s of [-1, 1]) { const ch = ball(.04, mat('#E89A86', { roughness: 1 }), s * .12, -.06, .19, 8); ch.scale.set(1, .6, .4); head.add(ch); }
    const eyes = [], pupils = [], shut = [], brows = [];
    for (const s of [-1, 1]) {
      const w = ball(.036, mat('#F4F0E8', { roughness: .4 }), s * .078, .055, .195, 10); head.add(w); eyes.push(w);
      const pu = ball(.021, EYE, s * .078, .055, .226, 8); head.add(pu); pupils.push(pu);
      const l = box(.07, .015, .02, EYE, s * .078, .05, .227); l.visible = false; head.add(l); shut.push(l);
      const br = box(.09, .024, .03, hairM, s * .082, .118, .205); head.add(br); brows.push(br);
    }
    parts.sleep = (on) => { eyes.concat(pupils).forEach(e => e.visible = !on); shut.forEach(l => l.visible = on); };
    parts.brows = (worry) => brows.forEach((b, i) => { const sd = i ? 1 : -1; b.rotation.z = -sd * .35 * worry; b.position.y = .118 + .02 * worry; });
    parts.look = (x, y) => pupils.forEach((p, i) => { p.position.x = (i ? 1 : -1) * .078 + x * .012; p.position.y = .055 + y * .012; });
    parts.mouth = (mode, k = 0) => { // 'smile' | 'open' | 'chew' | 'flat' | 'o'
      smile.visible = mode === 'smile'; mouth.visible = mode !== 'smile';
      mouth.scale.set(mode === 'o' ? .5 : 1, mode === 'open' ? 4 : mode === 'o' ? 4 : mode === 'chew' ? 1 + 3 * k : 1, 1);
    };
    parts.mouth('smile');
    // pelo
    if (o.hairStyle === 'rizos') {
      const r = rng(o.seed || 7);
      for (let i = 0; i < 26; i++) { const th = r() * Math.PI * 2, ph = r() * 1.2; const x = Math.cos(th) * Math.sin(ph) * .24, z = Math.sin(th) * Math.sin(ph) * .24 - .02, y = Math.cos(ph) * .25 + .03; if (z > .17 && y < .12) continue; head.add(ball(.075 + r() * .03, hairM, x, y, z, 8)); }
    } else {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(.245, 20, 12, 0, Math.PI * 2, 0, Math.PI * .55), hairM); hair.position.set(0, .03, -.015); hair.scale.set(1.0 * (o.faceW || 1), 1.12, 1.04); hair.rotation.x = -.18; hair.castShadow = true; head.add(hair);
      const back = ball(.236, hairM, 0, 0, -.05, 18); back.scale.set(.97 * (o.faceW || 1), 1.08, .95); head.add(back);
      const fringe = box(.3, .05, .08, hairM, .03, .205, .165); fringe.rotation.set(.5, 0, -.12); head.add(fringe);
      for (const s of [-1, 1]) head.add(box(.04, .1, .12, hairM, s * .21 * (o.faceW || 1), .07, .03));
    }
    // sentado: muslos al frente, espinillas abajo
    parts.sit = (seatY) => { parts.legL.rotation.x = parts.legR.rotation.x = -Math.PI / 2; parts.kneeL.rotation.x = parts.kneeR.rotation.x = Math.PI / 2; g.position.y = seatY - hipY + .08; };
    parts.stand = () => { parts.legL.rotation.x = parts.legR.rotation.x = 0; parts.kneeL.rotation.x = parts.kneeR.rotation.x = 0; };
    parts.hipY = hipY;
    g.userData = parts; return g;
  }
  function shade3(hex, k) { const c = new THREE.Color(hex); if (k < 0) c.multiplyScalar(1 + k); else c.lerp(new THREE.Color('#ffffff'), k); return '#' + c.getHexString(); }
  const flaco3d = () => person3d({ shirt: '#2FA35A', pants: '#3A4A6A', skin: '#E0AA82', hair: '#22160E', hairStyle: 'rizos', height: 1.14, width: .82, faceW: .92, seed: 11 });
  const tu3d = () => person3d({ shirt: '#FF6A12', pants: '#46506A', skin: '#D49A70', hair: '#3A2416', hairStyle: 'corto', height: 1.0, width: 1.14, belly: .8, faceW: 1.05 });

  /* la mamá: pelo largo mojado, chamarra roja empapada, pantalón con lodo */
  function mom() {
    const g = new THREE.Group(), parts = {}, r = rng(23);
    const jacket = mat('#C8202A', { roughness: .28, metalness: .05 }), jacketD = mat('#8A1218', { roughness: .3 });
    const pants = mat('#2E3448', { roughness: .5 }), mud = mat('#5A4026', { roughness: 1 }), skin = mat('#C98E68', { roughness: .45 });
    const hairM = mat('#1A120C', { roughness: .22, metalness: .1 }), shoeM = mat('#3A2A1E', { roughness: 1 });
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * .12, .97, 0); g.add(hip);
      hip.add(box(.17, .48, .18, pants, 0, -.24, 0));
      const knee = new THREE.Group(); knee.position.y = -.48; hip.add(knee);
      knee.add(box(.15, .43, .16, pants, 0, -.21, 0)); knee.add(box(.17, .1, .3, shoeM, 0, -.44, .05));
      for (let i = 0; i < 4; i++) knee.add(box(.152 + .01, .06 + r() * .1, .02, mud, (r() - .5) * .04, -.15 - r() * .28, .08));   // salpicaduras de lodo
      hip.add(box(.06, .08, .02, mud, (r() - .5) * .08, -.35, .1));
      parts[s < 0 ? 'legL' : 'legR'] = hip; parts[s < 0 ? 'kneeL' : 'kneeR'] = knee;
    }
    const torso = prism(.35, .34, .78, jacket, 1.18, .72); torso.position.y = 1.4; g.add(torso);
    g.add(box(.02, .7, .02, mat('#D8D8E0', { metalness: .8, roughness: .3 }), 0, 1.4, .25));      // cierre
    g.add(box(.5, .14, .3, jacketD, 0, 1.82, -.01));                                                // cuello alto
    g.add(box(.38, .08, .03, mud, .05, 1.06, .25));                                                  // lodo en la chamarra
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.07, .08, .12, 10), skin); neck.position.y = 1.86; g.add(neck);
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(s * .35, 1.72, 0); g.add(sh);
      sh.add(ball(.1, jacket, 0, -.02, 0, 10)); sh.add(box(.15, .42, .17, jacket, 0, -.21, 0));
      const el = new THREE.Group(); el.position.y = -.42; el.rotation.x = -.12; sh.add(el);
      el.add(box(.14, .36, .16, jacket, 0, -.18, 0)); el.add(box(.15, .06, .17, jacketD, 0, -.34, 0));
      const hand = ball(.068, skin, 0, -.42, .01, 10); hand.scale.set(1, 1.3, .8); el.add(hand);
      parts[s < 0 ? 'armL' : 'armR'] = sh; parts[s < 0 ? 'elbowL' : 'elbowR'] = el;
    }
    const head = new THREE.Group(); head.position.set(0, 2.1, 0); g.add(head); parts.head = head;
    const skull = ball(.215, skin, 0, 0, 0, 22); skull.scale.set(.92, 1.12, 1); head.add(skull);
    const nose = box(.05, .085, .075, skin, 0, -.02, .205); nose.rotation.x = -.25; head.add(nose);
    head.add(box(.085, .016, .015, mat('#7A2A24'), 0, -.105, .2));
    const eyes = [], brows = [];
    for (const s of [-1, 1]) {
      head.add(ball(.033, mat('#F4F0E8', { roughness: .4 }), s * .074, .05, .182, 10));
      const pu = ball(.019, EYE, s * .074, .05, .211, 8); head.add(pu); eyes.push(pu);
      const br = box(.08, .018, .03, hairM, s * .078, .112, .19); br.rotation.z = -s * .32; head.add(br); brows.push(br);   // cejas de angustia (suben al centro)
    }
    // pelo largo, pegado por la lluvia
    const top = new THREE.Mesh(new THREE.SphereGeometry(.238, 20, 12, 0, Math.PI * 2, 0, Math.PI * .46), hairM); top.position.set(0, .03, -.03); top.scale.set(1, 1.14, 1.05); top.rotation.x = -.42; head.add(top);
    const backH = box(.4, .62, .12, hairM, 0, -.22, -.15); head.add(backH);
    for (const s of [-1, 1]) { const st = box(.07, .5, .1, hairM, s * .2, -.16, .05); st.rotation.z = s * .06; head.add(st); }
    // gotas de agua escurriendo
    const dropM = new THREE.MeshStandardMaterial({ color: '#BFE4FF', roughness: .05, transparent: true, opacity: .85 });
    const drops = []; for (let i = 0; i < 7; i++) { const d = ball(.009, dropM, (r() - .5) * .5, 1.2 + r() * .9, .2 + r() * .06, 6); d.scale.y = 1.6; g.add(d); drops.push({ d, y0: d.position.y, ph: r() }); }
    parts.drip = (t) => drops.forEach(o => { const k = (t * .6 + o.ph) % 1; o.d.position.y = o.y0 - k * .5; o.d.visible = k < .9; });
    parts.look = (x, y) => eyes.forEach((p, i) => { p.position.x = (i ? 1 : -1) * .074 + x * .012; p.position.y = .05 + y * .012; });
    g.userData = parts; return g;
  }
  const hero = () => youth();
  const vecino = () => elder();

  /* edificio con ventanas instanciadas (cada ventana con su color) */
  function building(w, h, d, seed, o = {}) {
    const g = new THREE.Group(), r = rng(seed);
    g.add(box(w, h, d, mat(o.color || '#1E2440', { roughness: .9 }), 0, h / 2, 0));
    g.add(box(w + .1, .12, d + .1, mat('#151A30'), 0, h + .06, 0));
    const cols = Math.max(1, Math.floor((w - .3) / .5)), rows = Math.max(1, Math.floor((h - .6) / .62));
    const faces = [[0, d / 2 + .01, 0], [Math.PI / 2, w / 2 + .01, 1]];
    let n = 0; const list = [];
    for (const [rot, off, side] of faces) { const c = side ? Math.max(1, Math.floor((d - .3) / .5)) : cols; for (let i = 0; i < c; i++) for (let j = 0; j < rows; j++) list.push({ rot, off, side, i, j, c }); }
    const win = new THREE.InstancedMesh(new THREE.PlaneGeometry(.28, .36), new THREE.MeshBasicMaterial({ toneMapped: false }), list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
    const base = [];
    list.forEach((it, k) => {
      const span = it.side ? d : w, x = -span / 2 + (span / it.c) * (it.i + .5), y = .55 + it.j * .62;
      if (it.side) pos.set(it.off, y, x); else pos.set(x, y, it.off);
      q.setFromEuler(new THREE.Euler(0, it.rot, 0)); m4.compose(pos, q, one); win.setMatrixAt(k, m4);
      const lit = r() < (o.lit ?? .45); base.push({ lit, ord: r() });
      win.setColorAt(k, new THREE.Color(lit ? '#FFC65A' : '#262C48'));
    });
    g.add(win);
    g.userData = { win, base,
      /* red: 0..1 — fracción de ventanas que ya se pusieron en rojo (en orden aleatorio fijo) */
      /* off: 0..1 — fracción de ventanas que ya se apagaron (se va la luz) */
      paint(red = 0, flicker = 0, off = 0) {
        base.forEach((b, k) => { const dark = b.ord > 1 - off; const isRed = !dark && b.ord < red; const c = dark ? new THREE.Color('#14182C') : isRed ? new THREE.Color('#FF2A2A').multiplyScalar(1 - flicker * .4 + .4 * flicker * Math.sin(k)) : new THREE.Color(b.lit ? '#FFC65A' : '#262C48'); win.setColorAt(k, c); });
        win.instanceColor.needsUpdate = true;
      } };
    g.userData.paint(0);
    return g;
  }
  /* cielo con degradado (azul marino → morado) */
  function sky(top = '#0B1236', bottom = '#4A2A6A') {
    const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { a: { value: new THREE.Color(top) }, b: { value: new THREE.Color(bottom) }, red: { value: 0 } },
      vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: 'uniform vec3 a; uniform vec3 b; uniform float red; varying vec3 p; void main(){ float k = smoothstep(-.1,.6,p.y); vec3 c = mix(b,a,k); c = mix(c, vec3(.45,.04,.08)*(1.-k*.6), red); gl_FragColor = vec4(c,1.); }' });
    const s = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), m); s.userData.mat = m; return s;
  }
  function stars(n = 400, seed = 9) {
    const r = rng(seed), pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const th = r() * Math.PI * 2, ph = r() * .5 + .08, R = 350; pos[i * 3] = Math.cos(th) * Math.cos(ph) * R; pos[i * 3 + 1] = Math.sin(ph) * R; pos[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * R; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: '#E8E8FF', size: 1.6, sizeAttenuation: false, transparent: true, opacity: .8 }));
  }
  /* celular: cuerpo + pantalla (textura de canvas que se puede redibujar) */
  function phone() {
    const g = new THREE.Group();
    g.add(box(.5, 1.0, .06, mat('#101018', { roughness: .35 })));
    const cv = document.createElement('canvas'); cv.width = 360; cv.height = 720;
    const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(.44, .92), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.z = .032; g.add(scr);
    g.userData = { cv, tex, ctx: cv.getContext('2d'), scr };
    return g;
  }

  /* cejas (para el primer plano dudando) */
  function addBrows(p) {
    if (p.userData.brows) return;
    const head = p.userData.head, brows = [];
    for (const s of [-1, 1]) { const b = box(.1, .024, .03, mat('#2A1C14'), s * .08, .12, .215); head.add(b); brows.push(b); }
    p.userData.brows = (worry) => brows.forEach((b, i) => { const s = i ? 1 : -1; b.rotation.z = -s * .35 * worry; b.position.y = .115 + .015 * worry; });
  }
  /* camioneta pickup low-poly */
  function truck(color = '#2E5A4A') {
    const g = new THREE.Group(), body = mat(color, { roughness: .5, metalness: .2 }), dark = mat('#14161E', { roughness: .4 });
    g.add(box(4.2, .7, 1.9, body, 0, .85, 0));                 // chasis
    g.add(box(1.9, .8, 1.8, body, .7, 1.6, 0));                 // cabina
    g.add(box(1.92, .55, 1.82, mat('#1A2A3A', { roughness: .15, metalness: .4 }), .7, 1.62, 0)); // vidrios
    g.add(box(2.0, .5, .08, body, -1.1, 1.45, .91)); g.add(box(2.0, .5, .08, body, -1.1, 1.45, -.91)); g.add(box(.08, .5, 1.9, body, -2.1, 1.45, 0)); // caja
    const wheels = [];
    for (const [x, z] of [[1.3, .95], [1.3, -.95], [-1.3, .95], [-1.3, -.95]]) { const w = cyl(.42, .42, .3, dark, 14); w.rotation.x = Math.PI / 2; w.position.set(x, .45, z); g.add(w); wheels.push(w); }
    for (const z of [.6, -.6]) { const h = box(.06, .18, .32, glow('#FFF4D0'), 2.11, .95, z); g.add(h); }
    for (const z of [.7, -.7]) g.add(box(.06, .2, .2, glow('#FF2A1A'), -2.11, .95, z));
    // dos cabecitas dentro de la cabina
    g.add(ball(.2, mat('#D9A27A'), .5, 1.75, .45, 12)); g.add(ball(.2, mat('#D9A27A'), .5, 1.75, -.45, 12));
    const capB = new THREE.Mesh(new THREE.SphereGeometry(.21, 12, 6, 0, Math.PI * 2, 0, Math.PI * .5), mat('#C8302A')); capB.position.set(.5, 1.8, -.45); g.add(capB);
    const beams = new THREE.SpotLight('#FFF0C8', 3, 30, .5, .5, 1); beams.position.set(2.2, 1, 0); const bt = new THREE.Object3D(); bt.position.set(12, 0, 0); g.add(bt); beams.target = bt; g.add(beams);
    g.userData = { wheels }; return g;
  }
  /* garrafón de agua azul */
  function jug(s = 1) {
    const g = new THREE.Group(), m = mat('#4AA8FF', { roughness: .15, transparent: true, opacity: .75 });
    const b = cyl(.32, .32, .7, m, 16); b.position.y = .35; g.add(b);
    const n = cyl(.12, .3, .2, m, 14); n.position.y = .8; g.add(n);
    const c = cyl(.1, .1, .1, mat('#1E5AC8'), 10); c.position.y = .95; g.add(c);
    g.scale.setScalar(s); return g;
  }
  /* reloj de pared: cara de canvas, manecillas que giran */
  function wallClock() {
    const g = new THREE.Group();
    const rim = cyl(.62, .62, .12, mat('#2A2A30', { roughness: .4 }), 32); rim.rotation.x = Math.PI / 2; g.add(rim);
    const cv = document.createElement('canvas'); cv.width = cv.height = 512; const c = cv.getContext('2d');
    c.fillStyle = '#F4EEDC'; c.fillRect(0, 0, 512, 512); c.fillStyle = '#1A1A20'; c.font = '700 64px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; c.fillText(String(i), 256 + Math.sin(a) * 190, 256 - Math.cos(a) * 190); }
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, r1 = i % 5 ? 236 : 222; c.lineWidth = i % 5 ? 3 : 7; c.beginPath(); c.moveTo(256 + Math.sin(a) * r1, 256 - Math.cos(a) * r1); c.lineTo(256 + Math.sin(a) * 248, 256 - Math.cos(a) * 248); c.stroke(); }
    const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
    const face = new THREE.Mesh(new THREE.CircleGeometry(.56, 48), new THREE.MeshStandardMaterial({ map: tex, roughness: .6 })); face.position.z = .065; g.add(face);
    const hand = (len, w, col, z) => { const h = new THREE.Group(); const m = box(w, len, .02, mat(col), 0, len / 2 - .05, 0); m.castShadow = false; h.add(m); h.position.z = z; g.add(h); return h; };
    const hh = hand(.3, .05, '#1A1A20', .08), mh = hand(.44, .035, '#1A1A20', .09), sh = hand(.48, .014, '#D02020', .1);
    g.add(ball(.035, mat('#D02020'), 0, 0, .11, 8));
    g.userData.set = (h, m, sec) => { hh.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; mh.rotation.z = -(m + sec / 60) / 60 * Math.PI * 2; sh.rotation.z = -Math.floor(sec) / 60 * Math.PI * 2; };
    return g;
  }
  /* mano (sin dedos detallados) sosteniendo el celular, con manga de sudadera */
  function handPhone() {
    const g = new THREE.Group(), ph = phone(); g.add(ph);
    const skin = mat('#D9A27A');
    g.add(box(.62, .5, .16, skin, 0, -.42, -.1));                 // palma detrás
    const thumb = box(.14, .34, .14, skin, -.3, -.2, .03); thumb.rotation.z = -.5; g.add(thumb);
    for (let i = 0; i < 3; i++) g.add(box(.1, .14, .1, skin, .3, -.1 - i * .17, .0));   // dedos asomando al borde
    g.add(box(.7, .6, .5, mat('#F2A033'), 0, -.95, -.15));        // manga
    g.userData = ph.userData; return g;
  }
  /* portón con barrotes y candado */
  function gate() {
    const g = new THREE.Group(), iron = mat('#3A3A44', { metalness: .6, roughness: .45 });
    const leaf = new THREE.Group(); g.add(leaf);
    leaf.add(box(2.6, .1, .1, iron, 1.3, 2.2, 0)); leaf.add(box(2.6, .1, .1, iron, 1.3, .25, 0));
    for (let i = 0; i <= 10; i++) leaf.add(box(.06, 2.0, .06, iron, .1 + i * .25, 1.22, 0));
    const lock = new THREE.Group(); lock.position.set(2.62, 1.2, .1); leaf.add(lock);
    lock.add(box(.22, .26, .1, mat('#C8A040', { metalness: .7, roughness: .3 }), 0, 0, 0));
    const sh = new THREE.Mesh(new THREE.TorusGeometry(.08, .022, 8, 16, Math.PI), mat('#B8B8C0', { metalness: .8, roughness: .3 })); sh.position.y = .14; lock.add(sh);
    g.userData = { leaf, lock, shackle: sh }; return g;
  }
  /* casita del cerro */
  function hut() {
    const g = new THREE.Group();
    g.add(box(4, 2.6, 3.4, mat('#8A6A4A'), 0, 1.3, 0));
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 3.1, 1.4, 4), mat('#5A2A22')); roof.rotation.y = Math.PI / 4; roof.position.y = 3.3; roof.scale.set(1, 1, .85); roof.castShadow = true; g.add(roof);
    g.add(box(.9, 1.8, .06, mat('#4A3020'), -.8, .9, 1.72));
    g.add(box(.9, .7, .06, glow('#FFC65A'), .9, 1.5, 1.72));
    return g;
  }
  window.M = { THREE, rng, mat, glow, box, ball, cyl, person, hero, vecino, building, sky, stars, phone, addBrows, truck, jug, wallClock, handPhone, gate, hut, person3d, flaco3d, tu3d, mom };
})();
