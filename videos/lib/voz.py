"""Genera la narración de cada escena y los tiempos de subtítulos.
Uso (desde la carpeta del vídeo): python3 ../lib/voz.py carpeta_trabajo
Salidas: carpeta/escena_N.wav y tiempos.js (subtítulos + duración de escenas)."""
import asyncio, json, os, sys, subprocess, re
import edge_tts
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
G = json.load(open('guion.json'))
PAD_IN, PAD_OUT = 0.35, 0.55

async def tts(text, mp3):
    words = []
    for a in range(5):
        try:
            c = edge_tts.Communicate(text, G['voz'], rate=G['rate'], boundary='WordBoundary', proxy=os.environ.get('HTTPS_PROXY'))
            words = []
            with open(mp3, 'wb') as f:
                async for ch in c.stream():
                    if ch['type'] == 'audio': f.write(ch['data'])
                    elif ch['type'] == 'WordBoundary':
                        words.append((ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7, ch['text']))
            if words: return words
        except Exception as e:
            print('reintento', a, e)
        await asyncio.sleep(3)
    raise SystemExit('No se pudo generar la voz')

BR = re.compile(r'\{([^|}]*)\|([^}]*)\}')
def spoken(text):   # lo que lee la voz: {1284|mil doscientos...} -> palabras
    return BR.sub(r'\2', text).replace('*', '')

def tokens(text):
    """[(texto_subtítulo, nº de palabras habladas)] — {a|b} se muestra 'a' y cuenta las palabras de 'b'."""
    out, inside = [], False
    for tk in re.findall(r'\S*\{[^}]*\}\S*|\S+', text):
        disp = BR.sub(r'\1', tk)
        weight = sum(1 for w in BR.sub(r'\2', tk).split() if re.search(r'[\wáéíóúñü]', w))
        core = disp.replace('*', '')
        opens, closes = disp.startswith('*') or disp.startswith('¿*') or disp.startswith('¡*'), disp.rstrip('.,:;?!…').endswith('*')
        if opens: inside = True
        if inside:
            m = re.match(r'^([¿¡]?)(.*?)([.,:;?!…]*)$', core)
            disp = f"{m.group(1)}*{m.group(2)}*{m.group(3)}"
        if closes: inside = False
        out.append((disp, weight))
    return out

def chunk(text, words):
    toks = tokens(text)
    phrases, cur = [], []
    for tk in toks:
        cur.append(tk)
        if re.search(r'[.,:;?!…]\**$', tk[0]): phrases.append(cur); cur = []
    if cur: phrases.append(cur)
    out = []
    for ph in phrases:
        n = len(ph)
        if n <= 5: out.append(ph); continue
        k = -(-n // 4); size = -(-n // k)
        for i in range(0, n, size): out.append(ph[i:i + size])
    res, wi = [], 0
    for c in out:
        res.append((words[min(wi, len(words) - 1)][0], ' '.join(d for d, _ in c)))
        wi += sum(w for _, w in c)
    return res

async def main():
    caps, durs = [], []
    for n, text in enumerate(G['escenas'], 1):
        clean = spoken(text)
        mp3 = os.path.join(OUT, f'escena_{n}.mp3')
        words = await tts(clean, mp3)
        dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]))
        first, last = words[0][0], words[-1][1]
        # recorta el silencio inicial y deja PAD_IN de entrada
        wav = os.path.join(OUT, f'escena_{n}.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, first - 0.05):.3f}', '-t', f'{last - first + 0.25:.3f}', '-i', mp3, '-ar', '44100', '-ac', '1', wav], check=True)
        shift = PAD_IN - first
        ws = [(a + shift, b + shift, t) for a, b, t in words]
        caps.append([[round(t, 2), s] for t, s in chunk(text, ws)])
        durs.append(round(PAD_IN + (last - first) + PAD_OUT, 2))
        print(n, durs[-1], len(words))
    with open('tiempos.js', 'w') as f:
        f.write('// Generado por voz.py — no editar a mano\n')
        f.write('const CAPS = ' + json.dumps(caps, ensure_ascii=False) + ';\n')
        f.write('const DURS = ' + json.dumps(durs) + ';\n')
        f.write(f'const PAD_IN = {PAD_IN};\n')
    print('total', round(sum(durs), 2))
asyncio.run(main())
