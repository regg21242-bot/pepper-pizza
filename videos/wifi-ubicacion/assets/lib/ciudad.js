/* Ciudad low-poly a la hora dorada para la serie "Nunca te lo explicaron".
   Una sola escena: calle principal larga (eje Z) + calles cruzadas en cuadrícula, edificios de 3-5 pisos,
   ventanas con marco, balcones de herrería, puertas, banqueta de adoquín en ondas, faroles con charcos de luz,
   personas sin rostro y un mapa 2D (vista desde arriba de la MISMA ciudad) para la transición mapa → 3D.
   Uso: const C = window.CIUDAD(renderer, scene);  C.update(t)  */
(function () {
  const THREE = window.THREE, N = window.N, { rng, clamp, lerp, prog, ease, easeOut } = N;
  const backOut = (k, c = 1.4) => { k = clamp(k); return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  const HDR = (r, g, b) => new THREE.Color(r, g, b);

  // ---------- trazado (compartido por el mapa 2D y la ciudad 3D) ----------
  const COLS = [[-69.2, -43.2], [-33.2, -7.2], [7.2, 33.2], [43.2, 69.2]];
  const ROWS = []; for (let k = 0; k < 9; k++) { const z1 = 40 - 34 * k; ROWS.push([z1 - 24, z1]); }
  const MAIN = 4;                                   // la calle principal va de x=-4 a x=4 (asfalto)
  const sideW = (x0, x1, side) => (side === 'x0' && Math.abs(x0) === 7.2) || (side === 'x1' && Math.abs(x1) === 7.2) ? 3.2 : 2.5;
  const BLOCKS = []; COLS.forEach(([x0, x1]) => ROWS.forEach(([z0, z1]) => BLOCKS.push({ x0, x1, z0, z1, sx0: sideW(x0, x1, 'x0'), sx1: sideW(x0, x1, 'x1') })));
  const MAP = { X0: -80, X1: 80, Z0: -200, Z1: 60, ppu: 8 };

  // ---------- texturas ----------
  function rrect(x, X, Y, w, h, r) { x.beginPath(); x.roundRect(X, Y, w, h, r); }
  const adoquinTex = N.canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#4E4A47'; x.fillRect(0, 0, w, h); const r = rng(5), s = 16;
    for (let j = 0; j < h / s; j++) for (let i = -1; i < w / s + 1; i++) {
      const px = i * s + (j % 2) * s / 2, py = j * s, cx = (px + s / 2) / w, cy = (py + s / 2) / h;
      const wave = Math.sin(cx * Math.PI * 4 + Math.sin(cy * Math.PI * 4) * 1.7);
      const v = (r() - .5) * 22, b = wave > 0 ? [206, 202, 196] : [120, 117, 114];
      x.fillStyle = `rgb(${b[0] + v | 0},${b[1] + v | 0},${b[2] + v | 0})`; rrect(x, px + 1.5, py + 1.5, s - 3, s - 3, 4); x.fill();
      x.fillStyle = 'rgba(255,255,255,.08)'; rrect(x, px + 3, py + 2.5, s - 8, 4, 2); x.fill();
    } });
  adoquinTex.wrapS = adoquinTex.wrapT = THREE.RepeatWrapping;
  const asfaltoTex = N.canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#56505A'; x.fillRect(0, 0, w, h); const r = rng(8);
    for (let i = 0; i < 2600; i++) { const v = 40 + r() * 40 | 0; x.fillStyle = `rgba(${v + 10},${v},${v + 8},.5)`; x.fillRect(r() * w, r() * h, 1.5, 1.5); } });
  asfaltoTex.wrapS = asfaltoTex.wrapT = THREE.RepeatWrapping;
  const herreriaTex = N.canvasTex(256, 128, (x, w, h) => { x.strokeStyle = '#fff'; x.lineWidth = 7; x.strokeRect(4, 6, w - 8, h - 10);
    x.lineWidth = 4; for (let i = 16; i < w - 8; i += 16) { x.beginPath(); x.moveTo(i, 8); x.lineTo(i, h - 6); x.stroke(); }
    x.lineWidth = 3.5; for (let i = 24; i < w; i += 64) { x.beginPath(); x.arc(i, 36, 14, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.arc(i + 32, 36, 14, 0, Math.PI * 2); x.stroke(); } }, false);
  const charcoTex = N.canvasTex(256, 256, (x) => { const g = x.createRadialGradient(128, 128, 0, 128, 128, 126); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }, false);
  const pinTex = N.canvasTex(256, 320, (x) => { x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 16; x.fillStyle = '#FF3D4F'; x.beginPath(); x.arc(128, 116, 100, Math.PI, 0); x.quadraticCurveTo(228, 200, 128, 312); x.quadraticCurveTo(28, 200, 28, 116); x.fill(); x.shadowColor = 'transparent'; x.fillStyle = '#fff'; x.beginPath(); x.arc(128, 116, 40, 0, 7); x.fill(); });

  // mapa 2D = vista desde arriba de este mismo trazado (calle principal en amarillo)
  function mapaTex() {
    const { X0, X1, Z0, Z1, ppu } = MAP, W = (X1 - X0) * ppu, H = (Z1 - Z0) * ppu;
    const P = (X, Z) => [(X - X0) * ppu, (Z - Z0) * ppu];
    return N.canvasTex(W, H, (x) => {
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, H);
      BLOCKS.forEach(b => { const [ax, az] = P(b.x0 - b.sx0, b.z0 - 2.5), [bx, bz] = P(b.x1 + b.sx1, b.z1 + 2.5); x.fillStyle = '#EEE8DC'; rrect(x, ax, az, bx - ax, bz - az, 10); x.fill();
        const [cx, cz] = P(b.x0, b.z0), [dx, dz] = P(b.x1, b.z1); x.fillStyle = '#D6C8AE'; rrect(x, cx, cz, dx - cx, dz - cz, 6); x.fill(); });
      (window.__CIUDAD_EDIF || []).forEach(e => { const [ax, az] = P(e.x - e.w / 2, e.z - e.d / 2); x.strokeStyle = '#C9BBA2'; x.lineWidth = 3; x.strokeRect(ax + 2, az + 2, e.w * ppu - 4, e.d * ppu - 4); });
      const [m0] = P(-MAIN, 0), [m1] = P(MAIN, 0); x.fillStyle = '#FFB81C'; x.fillRect(m0, 0, m1 - m0, H); x.fillStyle = '#F2A81E'; x.fillRect(m0, 0, 5, H); x.fillRect(m1 - 5, 0, 5, H);
      x.fillStyle = '#9A8E7A'; x.font = '900 34px Nunito, sans-serif'; x.textAlign = 'center'; x.save(); x.translate((m0 + m1) / 2, P(0, -40)[1]); x.rotate(-Math.PI / 2); x.fillStyle = '#B07A10'; x.fillText('AV. DEL MAR', 0, 12); x.restore();
    });
  }

  function CIUDAD(renderer, scene, o = {}) {
    const g = new THREE.Group(); scene.add(g); const r = rng(o.seed || 21);
    const std = (c, extra) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .85, metalness: 0 }, extra));

    // ---------- cielo, sol y niebla (hora dorada) ----------
    const skyT = N.canvasTex(16, 512, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); [[0, '#1E2466'], [.28, '#3E3C92'], [.40, '#7A5AAE'], [.47, '#D486A0'], [.5, '#F6A66C'], [.53, '#F8C48E'], [1, '#C88A78']].forEach(([a, c]) => gr.addColorStop(a, c)); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 24), new THREE.MeshBasicMaterial({ map: skyT, side: THREE.BackSide, fog: false, depthWrite: false })); sky.renderOrder = -10; scene.add(sky);
    scene.fog = new THREE.Fog('#C99AA6', 70, 320);
    const SUN_DIR = new THREE.Vector3(-.62, .2, -.76).normalize();
    const sunGlow = N.glow('#FFB070', 260, .9); sunGlow.material.color = HDR(2.4, 1.3, .6); sunGlow.material.fog = false; sunGlow.position.copy(SUN_DIR).multiplyScalar(560); scene.add(sunGlow);
    scene.add(new THREE.HemisphereLight('#C4AEDC', '#8A6048', 1.25));
    const sun = new THREE.DirectionalLight('#FFB066', 3.6); sun.position.copy(SUN_DIR).multiplyScalar(140).add(new THREE.Vector3(0, 0, -20)); sun.target.position.set(0, 0, -20);
    sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); const sc = sun.shadow.camera; sc.left = -75; sc.right = 75; sc.top = 75; sc.bottom = -75; sc.near = 10; sc.far = 320; sun.shadow.bias = -.0006; sun.shadow.normalBias = .05; scene.add(sun, sun.target);
    const fill = new THREE.DirectionalLight('#7A8AFF', .5); fill.position.set(40, 30, 40); scene.add(fill);
    const pm = new THREE.PMREMGenerator(renderer); const envT = N.canvasTex(256, 128, (x, w, h) => { x.drawImage(skyT.image, 0, 0, w, h); }); envT.mapping = THREE.EquirectangularReflectionMapping; const env = pm.fromEquirectangular(envT).texture;

    // ---------- piso: asfalto, banquetas de adoquín, rayas ----------
    const asf = asfaltoTex.clone(); asf.needsUpdate = true; asf.repeat.set(100, 150);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(400, 600), std('#FFFFFF', { map: asf, roughness: .95 })); piso.rotation.x = -Math.PI / 2; piso.position.set(0, 0, -100); piso.receiveShadow = true; g.add(piso);
    BLOCKS.forEach(b => { const w = b.x1 - b.x0 + b.sx0 + b.sx1, d = b.z1 - b.z0 + 5, t = adoquinTex.clone(); t.needsUpdate = true; t.repeat.set(w / 4, d / 4);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, .18, d), [std('#8A847C'), std('#8A847C'), std('#FFFFFF', { map: t, roughness: .8 }), std('#8A847C'), std('#8A847C'), std('#8A847C')]);
      m.position.set((b.x0 - b.sx0 + b.x1 + b.sx1) / 2, .09, (b.z0 + b.z1) / 2); m.receiveShadow = true; g.add(m); });
    const blanco = std('#EFE8D8', { roughness: .6 });
    const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(.22, .03, 2.4), blanco, 70); let nd = 0; const D = new THREE.Object3D();
    for (let z = 38; z > -300 && nd < 70; z -= 5.5) { D.position.set(0, .02, z); D.updateMatrix(); dashes.setMatrixAt(nd++, D.matrix); } dashes.count = nd; dashes.frustumCulled = false; g.add(dashes);
    const zebra = new THREE.InstancedMesh(new THREE.BoxGeometry(.7, .03, 2.6), blanco, 200); let nz = 0;
    ROWS.forEach(([z0, z1]) => { for (const zc of [z1 + 1.6, z0 - 1.6]) for (let xx = -3.3; xx <= 3.3; xx += 1.1) { D.position.set(xx, .02, zc); D.updateMatrix(); zebra.setMatrixAt(nz++, D.matrix); } }); zebra.count = nz; zebra.frustumCulled = false; g.add(zebra);

    // ---------- edificios ----------
    const PAL = ['#C8643C', '#D9A93A', '#6CC2B0', '#F1ECE2', '#E59AA0', '#E8C9A0', '#C8643C', '#6CC2B0'];
    const edif = [], inst = { marco: [], vidrio: [], luz: [], puerta: [], losa: [], reja: [], toldo: [], repisa: [] };
    BLOCKS.forEach(b => {
      const nzp = r() < .5 ? 2 : 3, zs = [b.z0]; for (let i = 1; i < nzp; i++) zs.push(b.z0 + (b.z1 - b.z0) * (i / nzp + (r() - .5) * .12)); zs.push(b.z1);
      const xm = (b.x0 + b.x1) / 2 + (r() - .5) * 3, xs = [b.x0, xm, b.x1];
      for (let i = 0; i < 2; i++) for (let j = 0; j < nzp; j++) {
        const x0 = xs[i], x1 = xs[i + 1], z0 = zs[j], z1 = zs[j + 1], w = x1 - x0, d = z1 - z0, F = 3 + Math.floor(r() * 3), h = 4 + (F - 1) * 3.2;
        const col = PAL[Math.floor(r() * PAL.length)], e = { x: (x0 + x1) / 2, z: (z0 + z1) / 2, w, d, h, F, col, faces: [] };
        if (x0 === b.x0) e.faces.push([-1, 0]); if (x1 === b.x1) e.faces.push([1, 0]); if (z0 === b.z0) e.faces.push([0, -1]); if (z1 === b.z1) e.faces.push([0, 1]);
        edif.push(e);
      } });
    window.__CIUDAD_EDIF = edif;
    const cream = std('#F3EBDD'), ladrillo = std('#A4503A', { roughness: .9 });
    edif.forEach((e, bi) => {
      const grp = new THREE.Group(); grp.position.set(e.x, 0, e.z); g.add(grp); e.grp = grp;
      const cuerpo = N.M(new THREE.BoxGeometry(e.w - .05, e.h, e.d - .05), std(e.col), 0, e.h / 2, 0); grp.add(cuerpo); e.mat = cuerpo.material; e.colBase = new THREE.Color(e.col);
      const zc = new THREE.Color(e.col).multiplyScalar(.72); grp.add(N.M(new THREE.BoxGeometry(e.w + .04, 1.0, e.d + .04), std(zc), 0, .5, 0));
      grp.add(N.M(new THREE.BoxGeometry(e.w + .16, .28, e.d + .16), cream, 0, 4.0, 0));
      grp.add(N.M(new THREE.BoxGeometry(e.w + .34, .5, e.d + .34), cream, 0, e.h - .1, 0));
      grp.add(N.M(new THREE.BoxGeometry(e.w - .3, .3, e.d - .3), ladrillo, 0, e.h + .05, 0));
      e.faces.forEach(([nx, nz]) => {
        const L = nx ? e.d : e.w, half = nx ? e.w / 2 : e.d / 2, rotY = nx ? nx * Math.PI / 2 : (nz > 0 ? 0 : Math.PI);
        const at = (u, y, out) => [e.x + nx * (half + out) + (nx ? 0 : u), y, e.z + nz * (half + out) + (nx ? u : 0)];
        const n = Math.max(1, Math.floor((L - 1.4) / 2.8)), u0 = -(n - 1) * 2.8 / 2;
        for (let c = 0; c < n; c++) { const u = u0 + c * 2.8;
          if (c % 3 === 1) { inst.puerta.push([bi, ...at(u, 1.35, .05), 1.3, 2.7, .14, rotY]); inst.repisa.push([bi, ...at(u, 2.8, .12), 1.7, .16, .3, rotY]); }
          else { inst.marco.push([bi, ...at(u, 1.75, .03), 2.2, 2.4, .12, rotY]); (r() < .55 ? inst.luz : inst.vidrio).push([bi, ...at(u, 1.75, .1), 1.9, 2.05, 1, rotY]);
            if (r() < .4) inst.toldo.push([bi, ...at(u, 3.25, .55), 2.4, .12, 1.1, rotY, ['#C8403A', '#2E6FD0', '#2E9A62', '#E8B02A'][Math.floor(r() * 4)]]); }
          for (let f = 1; f < e.F; f++) { const y = 4 + (f - 1) * 3.2 + 1.65;
            inst.marco.push([bi, ...at(u, y, .03), 1.3, 1.8, .12, rotY]); (r() < .33 ? inst.luz : inst.vidrio).push([bi, ...at(u, y, .1), 1.02, 1.5, 1, rotY]);
            inst.repisa.push([bi, ...at(u, y - .98, .12), 1.5, .12, .26, rotY]);
            if (r() < .28) { inst.losa.push([bi, ...at(u, y - 1.0, .45), 2.0, .16, .9, rotY]); inst.reja.push([bi, ...at(u, y - .5, .88), 2.0, .95, 1, rotY]); } } }
      }); });
    const mk = (geo, mat, list, cast) => { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)); m.castShadow = !!cast; m.receiveShadow = true; m.frustumCulled = false; m.userData.list = list; g.add(m);
      if (list[0] && list[0][8]) list.forEach((it, i) => m.setColorAt(i, new THREE.Color(it[8]))); return m; };
    const plano = new THREE.PlaneGeometry(1, 1), caja = new THREE.BoxGeometry(1, 1, 1);
    const IM = [
      mk(caja, std('#2A2320', { roughness: .6 }), inst.marco),
      mk(plano, new THREE.MeshStandardMaterial({ color: '#2E3A5A', roughness: .12, metalness: .75, envMap: env, envMapIntensity: 1.1 }), inst.vidrio),
      mk(plano, new THREE.MeshBasicMaterial({ color: HDR(2.7, 1.75, .78) }), inst.luz),
      mk(caja, std('#2B2220', { roughness: .7 }), inst.puerta),
      mk(caja, std('#E9DFCC'), inst.losa, true),
      mk(plano, new THREE.MeshStandardMaterial({ color: '#1E1A18', map: herreriaTex, alphaTest: .5, side: THREE.DoubleSide, roughness: .5, metalness: .5 }), inst.reja, true),
      mk(caja, std('#FFFFFF', { roughness: .8 }), inst.toldo, true),
      mk(caja, cream, inst.repisa),
    ];
    const Q = new THREE.Quaternion(), S = new THREE.Vector3(), Pv = new THREE.Vector3(), Mx = new THREE.Matrix4(), Yax = new THREE.Vector3(0, 1, 0), tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -.32);
    function instancias(kb) { IM.forEach(m => { m.userData.list.forEach((it, i) => { const k = kb[it[0]]; Q.setFromAxisAngle(Yax, it[7]); if (m === IM[6]) Q.multiply(tilt);
        Pv.set(it[1], it[2] * k, it[3]); S.set(it[4], it[5] * k, it[6]); Mx.compose(Pv, Q, S); m.setMatrixAt(i, Mx); }); m.instanceMatrix.needsUpdate = true; }); }

    // ---------- el módem (en la repisa de una ventana de planta baja, sobre la calle principal) ----------
    const casa = edif.filter(e => e.faces.some(f => f[0] === -1) && Math.abs(e.x - e.w / 2 - 7.2) < .01 && e.z < 2 && e.z > -14).sort((a, b) => Math.abs(a.z + 6) - Math.abs(b.z + 6))[0];
    const MZ = casa.z, MX = 7.2 - .32;
    const modem = N.modem(); modem.scale.setScalar(1.25); modem.rotation.y = -Math.PI / 2; modem.position.set(MX, 1.12, MZ); g.add(modem);
    g.add(N.M(new THREE.BoxGeometry(.7, .14, 1.6), cream, 7.2 - .3, 1.03, MZ));
    modem.userData.leds.forEach(l => l.material = new THREE.MeshBasicMaterial({ color: HDR(.6, 3, 3.2) }));
    const M = new THREE.Vector3(MX, 1.3, MZ);
    const pin = new THREE.Sprite(new THREE.SpriteMaterial({ map: pinTex, transparent: true, depthWrite: false, fog: false })); pin.renderOrder = 20; g.add(pin);

    // ---------- faroles con charcos de luz ----------
    const farol = [], charcos = [];
    const poste = std('#24201E', { roughness: .5, metalness: .4 }), bulbM = new THREE.MeshBasicMaterial({ color: HDR(6, 3.9, 1.7) });
    const charcoM = new THREE.MeshBasicMaterial({ map: charcoTex, color: HDR(.75, .42, .17), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .8 });
    const addFarol = (x, z, rot) => { const f = new THREE.Group(); f.position.set(x, 0, z); f.rotation.y = rot; g.add(f); farol.push(f);
      f.add(N.M(new THREE.CylinderGeometry(.07, .11, 4.8, 8), poste, 0, 2.4, 0)); f.add(N.M(new THREE.BoxGeometry(.9, .07, .07), poste, .42, 4.7, 0));
      f.add(N.M(new THREE.CylinderGeometry(.16, .24, .36, 6), poste, .82, 4.5, 0)); const b = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), bulbM); b.position.set(.82, 4.32, 0); f.add(b);
      const c = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), charcoM); c.rotation.x = -Math.PI / 2; c.position.set(x + Math.cos(rot) * .82, .2, z - Math.sin(rot) * .82); c.renderOrder = 2; g.add(c); charcos.push(c); };
    for (let z = 36; z > -230; z -= 12) { addFarol(-4.6, z, 0); addFarol(4.6, z - 6, Math.PI); }
    ROWS.slice(0, 4).forEach(([z0]) => { const zc = z0 - 5; for (let x = -74; x < 75; x += 14) if (Math.abs(x) > 10) { addFarol(x, zc - 3.6, -Math.PI / 2); } });
    for (const [x, z] of [[-4.6, MZ + 6], [4.6, MZ - 2], [-4.6, MZ - 18], [4.6, MZ + 10]]) { const L = new THREE.PointLight('#FFB060', 6, 14, 2); L.position.set(x, 4.3, z); g.add(L); }

    // ---------- personas ----------
    const ropa = ['#E86A4A', '#3A9A6A', '#E8D07A', '#5A6AE0', '#C85A9A', '#F2EEE6', '#7A4FC0', '#3AB0C0', '#D88A3A'];
    const gente = [];
    for (let i = 0; i < 34; i++) { const p = N.persona(ropa[i % ropa.length], { piel: ['#C68D68', '#E0B090', '#A87050', '#8A5A40'][i % 4], coleta: i % 4 === 0, pelo: ['#1E1A18', '#5A3A20', '#2A2A2A'][i % 3], pantalon: ['#2E3448', '#4A3A30', '#22252E'][i % 3] });
      const cel = i % 2 === 0; p.userData.phone.visible = cel; const scr = new THREE.MeshBasicMaterial({ color: HDR(.5, 1.4, 2.4) }); p.userData.screen.material = scr;
      const halo = N.glow('#6FD0FF', .55, cel ? .55 : 0); halo.material.color = HDR(.6, 1.6, 3); g.add(halo);
      const lane = [-6.2, -5.0, 5.2, 6.3][i % 4], dir = (i % 4 < 2) ? (i % 8 < 4 ? -1 : 1) : (i % 8 < 6 ? 1 : -1);
      g.add(p); gente.push({ p, cel, scr, halo, x: lane, z0: 40 - ((i * 37) % 130), dir, sp: 1.1 + (i % 5) * .08, ph: i * 1.7, hit: 0 }); }
    const zPer = (q, t) => { const span = 130; return ((q.z0 + q.dir * q.sp * t - 40) % span + span) % span + 40 - span; };
    gente.forEach(q => { if (q.x < 0) return; for (let k = 0; k < 40; k++) { let ok = true; for (let t = 3.4; t < 6.6; t += .1) { const z = zPer(q, t); if (z > MZ - 6 && z < MZ + 16) { ok = false; break; } } if (ok) break; q.z0 += 4; } });
    const heroe = N.persona('#E8B84A', { piel: '#C68D68', pelo: '#2A1A14', coleta: true, pantalon: '#2E3448' }); g.add(heroe);
    const heroeScr = new THREE.MeshBasicMaterial({ color: HDR(.3, .5, .9) }); heroe.userData.screen.material = heroeScr;
    const heroeHalo = N.glow('#6FD0FF', 1, 0); heroeHalo.material.color = HDR(.6, 1.8, 3.2); g.add(heroeHalo);
    const heroeZ = t => 4 - (t - 6.4) * 1.35, HX = -5.6;

    // ---------- anillos de señal cian ----------
    const ringGeo = new THREE.RingGeometry(.94, 1, 96);
    const ringM = () => new THREE.MeshBasicMaterial({ color: HDR(.35, 2.4, 2.8), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const anillos = [...Array(7)].map(() => { const m = new THREE.Mesh(ringGeo, ringM()); m.renderOrder = 5; g.add(m); return m; });
    const anillosPiso = [...Array(7)].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(.97, 1, 128), ringM()); m.rotation.x = -Math.PI / 2; m.renderOrder = 5; g.add(m); return m; });

    // ---------- mapa (plano encima de la ciudad aplanada) ----------
    const mapT = mapaTex();
    const mapa = new THREE.Mesh(new THREE.PlaneGeometry(MAP.X1 - MAP.X0, MAP.Z1 - MAP.Z0), new THREE.MeshBasicMaterial({ map: mapT, transparent: true, fog: false, depthWrite: false }));
    mapa.rotation.x = -Math.PI / 2; mapa.position.set((MAP.X0 + MAP.X1) / 2, .4, (MAP.Z0 + MAP.Z1) / 2); mapa.renderOrder = 1; g.add(mapa);

    // ---------- animación ----------
    const T = Object.assign({ crece: 1.62, anillos: 5.35, heroeCel: 8.35 }, o.T || {});
    const kb = new Float32Array(edif.length); let firma = null;
    const cam = new THREE.Vector3();
    function update(t, camera) {
      // edificios que crecen desde el mapa (primero los cercanos al pin)
      edif.forEach((e, i) => { const dd = Math.hypot(e.x - M.x, e.z - M.z), t0 = T.crece + dd / 130 * .9 + (i % 7) * .025; kb[i] = Math.max(.012, backOut(prog(t, t0, t0 + .75)));
        e.grp.scale.y = kb[i]; e.mat.color.copy(e.colBase).lerp(new THREE.Color('#DED3BF'), 1 - clamp(kb[i])); });
      const f = t < T.crece ? 'a' : t > T.crece + 2.2 ? 'b' : t.toFixed(4); if (f !== firma) { instancias(kb); firma = f; }
      const kEnv = easeOut(prog(t, T.crece + .3, T.crece + 1.0));
      mapa.material.opacity = 1 - ease(prog(t, T.crece + .05, T.crece + .55)); mapa.visible = mapa.material.opacity > .003;
      farol.forEach(f2 => f2.scale.set(1, Math.max(.001, kEnv), 1)); charcoM.opacity = .75 * kEnv; bulbM.visible = kEnv > .1;
      dashes.visible = zebra.visible = kEnv > .01; modem.scale.setScalar(1.25 * Math.max(.001, kEnv));
      // pin: grande en el mapa, luego flota sobre el módem y se desvanece al bajar
      const pk = 1 - ease(prog(t, 3.5, 4.1)); pin.visible = pk > .01; pin.material.opacity = pk;
      const py = lerp(2.4, 5.2, kEnv) + Math.sin(t * 4) * .15 * kEnv, ps = lerp(5.6, 2.2, kEnv); pin.position.set(M.x - .6, py + ps * .62, M.z); pin.scale.set(ps * .8, ps, 1);
      // gente caminando
      const ring = (tt) => (tt - T.anillos) * 7;   // radio del primer anillo
      gente.forEach((q, i) => { let z = zPer(q, t); if (Math.abs(q.x + 5.6) < 1 && Math.abs(z - heroeZ(t)) < 2.5) z += 5;
        q.p.position.set(q.x, .19, z); q.p.rotation.y = q.dir > 0 ? 0 : Math.PI; q.p.scale.setScalar(Math.max(.001, kEnv)); q.p.userData.camina(t * 5.6 + q.ph, .9);
        if (!q.cel) q.p.userData.armR.rotation.x = -q.p.userData.armL.rotation.x;
        q.p.updateMatrixWorld(true); const pp = q.p.userData.phone.getWorldPosition(cam); q.halo.position.copy(pp);
        const dist = Math.hypot(q.x - M.x, z - M.z), rr = ring(t), hit = q.cel && rr > dist ? Math.max(0, 1 - (rr - dist) / 9) : 0;
        q.halo.material.opacity = q.cel ? (.45 + 1.2 * hit) * kEnv : 0; q.halo.scale.setScalar(.5 + 1.4 * hit); q.scr.color.setRGB(.5 + 2 * hit, 1.4 + 2 * hit, 2.4 + 2 * hit); });
      // la persona que sigue la cámara
      heroe.visible = t > 4; heroe.position.set(HX, .19, heroeZ(t)); heroe.rotation.y = Math.PI; heroe.userData.camina(t * 5.4, .9);
      heroe.updateMatrixWorld(true); heroeHalo.position.copy(heroe.userData.phone.getWorldPosition(cam)); const hl = easeOut(prog(t, T.heroeCel, T.heroeCel + .3));
      heroeHalo.material.opacity = hl * (1 + .2 * Math.sin(t * 9)); heroeHalo.scale.setScalar(.4 + 1.1 * hl); heroeScr.color.setRGB(.3 + 2.4 * hl, .5 + 2.6 * hl, .9 + 2.8 * hl);
      // anillos: verticales mirando a la cámara + en el piso
      anillos.forEach((a, i) => { const rr = (t - T.anillos - i * .32) * 4.2; a.visible = rr > .05 && rr < 26; if (!a.visible) return; a.position.copy(M); if (camera) a.lookAt(camera.position); a.scale.setScalar(rr); a.material.opacity = Math.min(1, rr * 3) * Math.max(0, 1 - rr / 26); });
      anillosPiso.forEach((a, i) => { const rr = (t - T.anillos - .1 - i * .4) * 7; a.visible = rr > .1 && rr < 60; if (!a.visible) return; a.position.set(M.x, .23, M.z); a.scale.setScalar(rr); a.material.opacity = Math.max(0, 1 - rr / 60) * .9; });
      modem.userData.leds.forEach((l, j) => l.visible = Math.sin(t * 9 + j * 1.7) > -.4);
    }
    instancias(new Float32Array(edif.length).fill(1));
    return { group: g, update, M, MZ, edif, heroe, heroeZ, HX, T, BLOCKS, ROWS, env };
  }
  window.CIUDAD = CIUDAD;
})();
