"""Voz de niño (opción C: edge-tts + rubberband) para "En este pueblo".
Pruebas:   python3 tools/voz_nino.py pruebas      → assets/voz/pruebas_nino/prueba_<voz>.wav
Cadena: edge-tts (tono y velocidad) → rubberband +3 semitonos sin preservar formantes → pasa-altos 120 Hz →
+3 dB a 3 kHz / −2 dB a 300 Hz → de-esser 6–8 kHz → compresor 4:1 (3/60 ms) → −14 LUFS, −1 dBTP → tono ≈ 280 Hz."""
import asyncio, json, os, subprocess, sys, tempfile, math
import edge_tts
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from tono import tono
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); PRU = os.path.join(RAIZ, 'assets', 'voz', 'pruebas_nino')
# voz → (tono en Hz equivalente al % pedido sobre su tono natural medido, velocidad)
VOCES = {'dalia': ('es-MX-DaliaNeural', '+56Hz', '+12%'),    # 224 Hz natural × 25 %
         'jorge': ('es-MX-JorgeNeural', '+62Hz', '+12%'),    # 138 Hz natural × 45 %
         'paloma': ('es-US-PalomaNeural', '+52Hz', '+12%')}  # 207 Hz natural × 25 %
ENFASIS_HZ, ENFASIS_VOL = 40, '+25%'     # palabras de énfasis: más agudas y más fuertes
SEMITONOS = 3
def ff(*a): subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], check=True)
async def tts(texto, voz, pitch, rate, vol, mp3):
    for a in range(6):
        try:
            c = edge_tts.Communicate(texto, voz, rate=rate, pitch=pitch, volume=vol, boundary='WordBoundary', proxy=os.environ.get('HTTPS_PROXY'))
            w = []
            with open(mp3, 'wb') as f:
                async for ch in c.stream():
                    if ch['type'] == 'audio': f.write(ch['data'])
                    elif ch['type'] == 'WordBoundary': w.append([ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7, ch['text']])
            if w: return w
        except Exception as e: print('reintento', a, e)
        await asyncio.sleep(3)
    raise SystemExit('sin voz')
def mas_hz(p, d): return f'{int(p[:-2]) + d:+d}Hz'
async def frase(trozos, clave, salida, pausa=.2):
    """trozos: [(texto, enfasis)] → wav crudo (48 kHz mono) con los trozos unidos por pausas cortas; devuelve palabras con tiempos."""
    voz, pitch, rate = VOCES[clave]; tmp = tempfile.mkdtemp(); partes, pal, t = [], [], 0.0
    for i, (tx, enf) in enumerate(trozos):
        mp3 = os.path.join(tmp, f'{i}.mp3'); wav = os.path.join(tmp, f'{i}.wav')
        w = await tts(tx, voz, mas_hz(pitch, ENFASIS_HZ) if enf else pitch, rate, ENFASIS_VOL if enf else '+0%', mp3)
        ini, fin = max(0, w[0][0] - .03), w[-1][1] + .08
        ff('-i', mp3, '-af', f'atrim={ini:.3f}:{fin:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st={fin - ini - .03:.3f}:d=0.03', '-ar', '48000', '-ac', '1', wav)
        pal += [[round(t + a - ini, 3), round(t + b - ini, 3), x] for a, b, x in w]; t += fin - ini
        partes.append(wav)
        if i < len(trozos) - 1:
            sil = os.path.join(tmp, f's{i}.wav'); ff('-f', 'lavfi', '-i', f'anullsrc=r=48000:cl=mono', '-t', str(pausa), sil); partes.append(sil); t += pausa
    lista = os.path.join(tmp, 'l.txt'); open(lista, 'w').write(''.join(f"file '{p}'\n" for p in partes))
    ff('-f', 'concat', '-safe', '0', '-i', lista, '-c', 'pcm_s16le', salida)
    return pal, t
CADENA = ('highpass=f=120,equalizer=f=3000:t=q:w=1:g=3,equalizer=f=300:t=q:w=1:g=-2,'
          'deesser=i=0.4:m=0.5:f=0.29:s=o,acompressor=threshold=0.1:ratio=4:attack=3:release=60:makeup=2')
def loud(src, dst):
    """normaliza a −14 LUFS y −1 dBTP (loudnorm en dos pasadas)"""
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    ff('-i', src, '-af', f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000", '-ar', '48000', '-ac', '1', dst)
def procesar(crudo, dst, objetivo=280, corr=None):
    """corr: factor de tono extra ya decidido (para que toda la narración use el mismo); si es None se calcula aquí."""
    tmp = dst + '.tmp.wav'
    ff('-i', crudo, '-af', f'rubberband=pitch={2 ** (SEMITONOS / 12):.5f}:formant=shifted:pitchq=quality,' + CADENA, tmp); loud(tmp, dst)
    m = tono(dst)[0]
    if corr is None: corr = objetivo / m if (m < 260 or m > 300) else 1.0
    if abs(corr - 1) > .005:
        ff('-i', dst, '-af', f'rubberband=pitch={corr:.5f}:formant=shifted:pitchq=quality', tmp); loud(tmp, dst)
    os.remove(tmp); return corr, tono(dst)
async def pruebas():
    os.makedirs(PRU, exist_ok=True)
    for k in VOCES:
        crudo = os.path.join(PRU, f'crudo_{k}.wav'); _, dur = await frase([('En este pueblo, todo el mundo se va de fiesta…', False), ('¡menos yo!', True)], k, crudo)
        corr, (m, lo, hi) = procesar(crudo, os.path.join(PRU, f'prueba_{k}.wav')); os.remove(crudo)
        print(f'{k}: {dur:.2f} s, {11 / dur:.1f} palabras/s, corrección de tono ×{corr:.3f}, tono final {m:.0f} Hz (p5 {lo:.0f}, p95 {hi:.0f})')
if __name__ == '__main__':
    if sys.argv[1:] == ['pruebas']: asyncio.run(pruebas())
