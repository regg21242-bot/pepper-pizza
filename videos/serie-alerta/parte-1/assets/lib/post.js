/* Post-proceso reutilizable (serie "Alerta"): profundidad de campo + bloom + desenfoque de movimiento
   + tinte rojo de alerta + viñeta + fundido entre dos cámaras. Uso:
     const PP = window.POST(renderer, W, H);
     PP.render(scene, camera, { focus, ap, mv: [x, y], rojo: 0..1, oscuro: 0..1, camB, fade }) */
(function () {
  const THREE = window.THREE;
  function POST(renderer, W, H) {
    const mkRT = (w, h, o = {}) => new THREE.WebGLRenderTarget(w, h, Object.assign({ type: THREE.HalfFloatType }, o));
    const rtS = mkRT(W, H, { samples: 4 }); rtS.depthTexture = new THREE.DepthTexture(W, H); rtS.depthTexture.type = THREE.UnsignedIntType;
    const rtA = mkRT(W, H, { samples: 4 }), rtD = mkRT(W, H), rtB1 = mkRT(W / 4, H / 4), rtB2 = mkRT(W / 4, H / 4);
    const qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), qs = new THREE.Scene(), q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); qs.add(q);
    const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
    const dofM = new THREE.ShaderMaterial({ uniforms: { tC: { value: rtS.texture }, tZ: { value: rtS.depthTexture }, focus: { value: 10 }, ap: { value: 0 }, near: { value: .05 }, far: { value: 1500 }, res: { value: new THREE.Vector2(W, H) } }, vertexShader: VS,
      fragmentShader: `uniform sampler2D tC, tZ; uniform float focus, ap, near, far; uniform vec2 res; varying vec2 vUv;
        float vz(vec2 uv){ float d = texture2D(tZ, uv).x * 2. - 1.; return 2. * near * far / (far + near - d * (far - near)); }
        float coc(float z){ return clamp(ap * abs(z - focus) / max(z, .01), 0., 1.) * 22.; }
        void main(){ vec3 c0 = texture2D(tC, vUv).rgb; float z = vz(vUv), r = coc(z); if (r < .6) { gl_FragColor = vec4(c0, 1.); return; }
          vec3 acc = c0; float ws = 1.;
          for (int i = 0; i < 40; i++) { float fi = float(i) + .5; float rr = sqrt(fi / 40.) * r; float th = fi * 2.39996; vec2 o = vec2(cos(th), sin(th)) * rr / res;
            float zs = vz(vUv + o); float w = zs < z ? clamp(coc(zs) / max(rr, 1.), 0., 1.) : 1.; acc += texture2D(tC, vUv + o).rgb * w; ws += w; }
          gl_FragColor = vec4(acc / ws, 1.); }` });
    const brightM = new THREE.ShaderMaterial({ uniforms: { tC: { value: rtS.texture }, thr: { value: 1.0 } }, vertexShader: VS, fragmentShader: `uniform sampler2D tC; uniform float thr; varying vec2 vUv; void main(){ vec3 c = vec3(0.); for(int i=0;i<4;i++){ vec2 o = vec2(float(i/2)-.5, float(i-2*(i/2))-.5)/vec2(270.,480.); c += texture2D(tC, vUv+o).rgb; } c *= .25; gl_FragColor = vec4(max(c - thr, 0.), 1.); }` });
    const blurM = new THREE.ShaderMaterial({ uniforms: { tC: { value: null }, dir: { value: new THREE.Vector2() } }, vertexShader: VS, fragmentShader: `uniform sampler2D tC; uniform vec2 dir; varying vec2 vUv; void main(){ vec3 c = texture2D(tC, vUv).rgb * .227; float w[4]; w[0]=.194; w[1]=.121; w[2]=.054; w[3]=.016; for(int i=1;i<5;i++){ c += (texture2D(tC, vUv + dir*float(i)).rgb + texture2D(tC, vUv - dir*float(i)).rgb) * w[i-1]; } gl_FragColor = vec4(c, 1.); }` });
    const finM = new THREE.ShaderMaterial({ uniforms: { tC: { value: rtD.texture }, tB: { value: rtB1.texture }, tA: { value: rtA.texture }, fade: { value: 0 }, mv: { value: new THREE.Vector2() }, bloom: { value: .9 }, rojo: { value: 0 }, oscuro: { value: 0 }, grano: { value: 0 } }, vertexShader: VS,
      fragmentShader: `uniform sampler2D tC, tB, tA; uniform float fade, bloom, rojo, oscuro, grano; uniform vec2 mv; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main(){ vec3 c = vec3(0.); for (int i = 0; i < 24; i++) { float s = float(i) / 23. - .5; c += texture2D(tC, vUv + mv * s).rgb; } c /= 24.;
          c += texture2D(tB, vUv).rgb * bloom; c = mix(c, texture2D(tA, vUv).rgb, fade);
          float L = dot(c, vec3(.3, .55, .15)); c = mix(c, vec3(L * 1.9 + .02, L * .28, L * .32), rojo * .85);
          vec2 q = vUv - .5; c *= 1. - (.45 + .4 * oscuro) * dot(q * vec2(1.25, .9), q * vec2(1.25, .9)) * 2.2;
          c *= 1. - oscuro * .55; c += (h(vUv * 1000. + grano) - .5) * .018;
          gl_FragColor = vec4(c, 1.);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }` });
    const pass = (m, tg) => { q.material = m; renderer.setRenderTarget(tg); renderer.render(qs, qc); };
    function render(scene, camera, o = {}) {
      if (o.camB && o.fade > 0) { renderer.setRenderTarget(rtA); renderer.render(scene, o.camB); }
      renderer.setRenderTarget(rtS); renderer.render(scene, camera);
      dofM.uniforms.near.value = camera.near; dofM.uniforms.far.value = camera.far; dofM.uniforms.focus.value = o.focus || 10; dofM.uniforms.ap.value = o.ap || 0; pass(dofM, rtD);
      brightM.uniforms.thr.value = o.umbral || 1.0; pass(brightM, rtB1);
      for (let i = 0; i < 3; i++) { blurM.uniforms.tC.value = rtB1.texture; blurM.uniforms.dir.value.set((1 + i) / 270, 0); pass(blurM, rtB2); blurM.uniforms.tC.value = rtB2.texture; blurM.uniforms.dir.value.set(0, (1 + i) / 480); pass(blurM, rtB1); }
      const u = finM.uniforms; u.mv.value.set(...(o.mv || [0, 0])); u.fade.value = o.camB ? (o.fade || 0) : 0; u.bloom.value = o.bloom != null ? o.bloom : .9; u.rojo.value = o.rojo || 0; u.oscuro.value = o.oscuro || 0; u.grano.value = o.grano || 0;
      pass(finM, null);
    }
    return { render };
  }
  window.POST = POST;
})();
