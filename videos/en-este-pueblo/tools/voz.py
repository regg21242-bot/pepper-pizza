"""Voz del narrador (Álvaro, más rápido y un poco más agudo) para cada plano con texto.
Salidas: assets/voz/lineas/p<N>.wav (procesada) y assets/voz/palabras.json {plano: [[ini, fin, palabra], ...], dur: {plano: s}}"""
import asyncio, json, os, subprocess
import edge_tts
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(RAIZ, 'assets', 'voz', 'lineas')
VOZ, RATE, PITCH = 'es-ES-AlvaroNeural', '+18%', '+8Hz'   # +8 % más rápido que la v1, mismo tono
G = json.load(open(os.path.join(RAIZ, 'guion.json')))
async def tts(texto, mp3):
    for a in range(6):
        try:
            c = edge_tts.Communicate(texto, VOZ, rate=RATE, pitch=PITCH, boundary='WordBoundary', proxy=os.environ.get('HTTPS_PROXY'))
            w = []
            with open(mp3, 'wb') as f:
                async for ch in c.stream():
                    if ch['type'] == 'audio': f.write(ch['data'])
                    elif ch['type'] == 'WordBoundary': w.append([ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7, ch['text']])
            if w: return w
        except Exception as e: print('reintento', a, e)
        await asyncio.sleep(3)
    raise SystemExit('sin voz')
# cadena de la voz: pasa-altos 90, presencia +2 dB 3.5 kHz, de-esser suave, compresor 3:1 (5/80 ms)
CADENA = 'highpass=f=90,equalizer=f=3500:t=q:w=1:g=2,deesser=i=0.35:m=0.5:f=0.45:s=o,acompressor=threshold=0.08:ratio=3:attack=5:release=80:makeup=1.6'
async def main():
    pal, dur = {}, {}
    for p in G['planos']:
        if not p['texto']: continue
        n = str(p['plano']); mp3 = os.path.join(OUT, f'p{n}.mp3'); wav = os.path.join(OUT, f'p{n}.wav')
        w = await tts(p['texto'], mp3)
        ini, fin = max(0, w[0][0] - .04), w[-1][1] + .14   # recorte por los límites de palabra
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-af', f'atrim={ini:.3f}:{fin:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st={fin - ini - .04:.3f}:d=0.04,' + CADENA, '-ar', '48000', '-ac', '1', wav], check=True)
        pal[n] = [[round(a - ini, 3), round(b - ini, 3), t] for a, b, t in w]; dur[n] = round(fin - ini, 3)
        print(n, dur[n], p['texto'])
    json.dump({'palabras': pal, 'dur': dur}, open(os.path.join(RAIZ, 'assets', 'voz', 'palabras.json'), 'w'), ensure_ascii=False, indent=0)
asyncio.run(main())
