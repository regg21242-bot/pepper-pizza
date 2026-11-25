"""Narración (Álvaro) de una historia: una línea de guion = una toma.
Uso (desde la carpeta del video): python3 ../lib/voz.py
Lee guion.json {voz?, rate?, pitch?, lineas: [{t, pausa?}]}; '*' marca palabras resaltadas (no se leen).
Salidas: build/voz.wav (48 kHz mono) y tiempos.js (window.T = {lineas:[{ini, fin, corte, palabras:[[a,b,w,hl]]}], fin})."""
import asyncio, json, os, re, subprocess
import edge_tts
G = json.load(open('guion.json')); os.makedirs('build', exist_ok=True)
VOZ, RATE, PITCH = G.get('voz', 'es-ES-AlvaroNeural'), G.get('rate', '+10%'), G.get('pitch', '-2Hz')
INICIO, PAUSA = .25, .32
CADENA = 'highpass=f=80,equalizer=f=3200:t=q:w=1:g=2,equalizer=f=250:t=q:w=1:g=-1.5,deesser=i=0.3:m=0.5:f=0.3:s=o,acompressor=threshold=0.09:ratio=3:attack=5:release=80:makeup=1.5'
def ff(*a): subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], check=True)
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
def marcas(texto):
    """palabras del guion con su marca de resaltado (*palabra* o *varias palabras*)"""
    out, dentro = [], False
    for tk in texto.split():
        abre, cierra = tk.lstrip('¿¡"\'').startswith('*'), tk.rstrip('.,;:!?…"\'').endswith('*')
        if abre: dentro = True
        out.append((tk.replace('*', ''), dentro))
        if cierra: dentro = False
    return out
async def main():
    lineas, partes, t = [], [], INICIO
    sil = 'build/sil.wav'
    for i, L in enumerate(G['lineas']):
        txt = L['t']; mp3, wav = f'build/l{i}.mp3', f'build/l{i}.wav'
        w = await tts(txt.replace('*', ''), mp3)
        ini, fin = max(0, w[0][0] - .03), w[-1][1] + .12
        ff('-i', mp3, '-af', f'atrim={ini:.3f}:{fin:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st={fin - ini - .04:.3f}:d=0.04,' + CADENA, '-ar', '48000', '-ac', '1', wav)
        mk = marcas(txt)
        # empareja las palabras de edge con las del guion (mismo número casi siempre); si no, usa las de edge
        pal = []
        for k, (a, b, x) in enumerate(w):
            texto_g, hl = mk[k] if len(mk) == len(w) else (x, False)
            pal.append([round(t + a - ini, 3), round(t + b - ini, 3), texto_g, hl])
        d = fin - ini; pausa = L.get('pausa', PAUSA)
        lineas.append({'ini': round(t, 3), 'fin': round(t + d, 3), 'palabras': pal}); partes += [wav]; t += d
        if i < len(G['lineas']) - 1:
            s = f'build/s{i}.wav'; ff('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', f'{pausa:.3f}', s); partes.append(s); t += pausa
        print(i, round(d, 2), txt)
    # cortes: a la mitad de cada pausa
    for i, L in enumerate(lineas): L['corte'] = 0.0 if i == 0 else round((lineas[i - 1]['fin'] + L['ini']) / 2, 3)
    cola = G.get('cola', 1.2); fin = round(t + cola, 3)
    ff('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', str(INICIO), sil)
    open('build/lista.txt', 'w').write(''.join(f"file '{os.path.basename(p)}'\n" for p in [sil] + partes))
    ff('-f', 'concat', '-safe', '0', '-i', 'build/lista.txt', '-af', f'apad=whole_dur={fin}', '-ar', '48000', '-ac', '1', 'build/voz.wav')
    T = {'lineas': lineas, 'voz_fin': round(t, 3), 'fin': fin}
    open('tiempos.js', 'w').write('window.T = ' + json.dumps(T, ensure_ascii=False) + ';\n')
    print('voz', round(t, 2), 's  total', fin)
asyncio.run(main())
