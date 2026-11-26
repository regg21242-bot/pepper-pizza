"""Voz de "Quédate a oscuras": una frase = un archivo (audio/vo_NN.mp3), pausas exactas, vo_full.wav,
tiempos por palabra con Whisper (subs/palabras.json + .srt) y tiempos.js para el motor.
Uso (desde quedate-oscuras/):  /root/.venvs/video/bin/python voz.py   (necesita edge_tts en ese venv o en python3)"""
import asyncio, json, os, re, subprocess, difflib, unicodedata
import edge_tts
G = json.load(open('guion.json'))
VOZ, RATE, PITCH, RATE_S = G['voz'], G['rate'], G['pitch'], G['rate_susurro']
INICIO, P_NORMAL, P_SUSP, P_LARGA = .30, .35, .80, 1.40
FX = ('highpass=f=80,equalizer=f=3000:t=q:w=1:g=1.5,deesser=i=0.25:m=0.5:f=0.3:s=o,'
      'acompressor=threshold=0.1:ratio=3:attack=6:release=90:makeup=1.4,'
      'aecho=1.0:0.9:23|41|67:0.10|0.07|0.05')  # reverb corta de cuarto (~0.6 s, wet ~10 %)
os.makedirs('audio', exist_ok=True); os.makedirs('subs', exist_ok=True)
def ff(*a): subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], check=True)
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))

def tokens(texto):
    """→ lista de (pantalla, voz, resaltada) por palabra; quita «» y ⏸ de la voz."""
    out = []
    texto = re.sub(r'\{(.+?)\|(.+?)\}', lambda m: '{' + m.group(1) + '|' + m.group(2).replace(' ', '_') + '}', texto)
    for m in re.finditer(r'\[\[(.+?)\]\]|(\S+)', texto):
        hl = m.group(1) is not None; s = m.group(1) or m.group(2)
        # pega puntuación que quedó fuera de [[ ]]
        if not hl and out and re.fullmatch(r'[.,;:!?…»"]+', s): out[-1] = (out[-1][0] + s, out[-1][1] + s, out[-1][2]); continue
        for w in s.split():
            mm = re.search(r'\{(.+?)\|(.+?)\}', w)
            pant, voz = (w.replace(mm.group(0), mm.group(1)), w.replace(mm.group(0), mm.group(2))) if mm else (w, w)
            out.append((pant, voz.replace('_', ' '), hl))
    return out

def frases(esc):
    """parte el texto de una escena en frases: en ⏸ y en fin de oración. → [(texto, pausa_después)]"""
    partes = re.split(r'\s*(⏸⏸|⏸)\s*', esc['t'].strip()); res = []
    for k in range(0, len(partes), 2):
        trozo = partes[k].strip(); marca = partes[k + 1] if k + 1 < len(partes) else ''
        if not trozo: continue
        sub = [s for s in re.split(r'(?<=[.?!»])\s+(?=[^\s])', trozo) if s.strip()]
        for j, s in enumerate(sub):
            p = P_NORMAL if j < len(sub) - 1 else {'⏸': P_SUSP, '⏸⏸': P_LARGA}.get(marca, P_NORMAL)
            res.append((s, p))
    return res

async def tts(texto, mp3, rate):
    for a in range(6):
        try:
            c = edge_tts.Communicate(texto, VOZ, rate=rate, pitch=PITCH, boundary='WordBoundary', proxy=os.environ.get('HTTPS_PROXY'))
            w = []
            with open(mp3, 'wb') as f:
                async for ch in c.stream():
                    if ch['type'] == 'audio': f.write(ch['data'])
                    elif ch['type'] == 'WordBoundary': w.append([ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7, ch['text']])
            if w: return w
        except Exception as e: print('reintento', a, e)
        await asyncio.sleep(3)
    raise SystemExit('sin voz')

def norm(s): return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if c.isalnum() and unicodedata.category(c) != 'Mn')

async def main():
    t, n, partes, escenas, palabras = INICIO, 0, [], [], []
    for ei, esc in enumerate(G['escenas']):
        lista = frases(esc); e_ini = None
        for fi, (txt, pausa) in enumerate(lista):
            n += 1; mp3, wav = f'audio/vo_{n:02d}.mp3', f'audio/vo_{n:02d}.wav'
            tk = tokens(txt); voz_txt = ' '.join(v for _, v, _ in tk).replace('«', '').replace('»', '')
            w = await tts(voz_txt, mp3, RATE_S if esc.get('susurro') else RATE)
            ini, fin = max(0, w[0][0] - .03), w[-1][1] + .14
            gan = ',volume=3dB' if esc.get('susurro') else ''
            ff('-i', mp3, '-af', f'atrim={ini:.3f}:{fin:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st={fin - ini - .04:.3f}:d=0.04{gan}', '-ar', '48000', '-ac', '1', wav)
            d = dur(wav)
            if e_ini is None: e_ini = t
            for k, (pant, _, hl) in enumerate(tk):
                a, b = (w[k][0], w[k][1]) if len(w) == len(tk) else (w[min(k, len(w) - 1)][0], w[min(k, len(w) - 1)][1])
                palabras.append({'w': pant, 'hl': hl, 'esc': ei, 'a_edge': round(t + a - ini, 3), 'b_edge': round(t + b - ini, 3)})
            partes.append(wav); t += d
            print(f'{n:02d} esc{esc["n"]:>2} {d:5.2f}s pausa {pausa:.2f}  {voz_txt}')
            last = ei == len(G['escenas']) - 1 and fi == len(lista) - 1
            if not last:
                s = f'audio/sil_{n:02d}.wav'; ff('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', f'{pausa:.3f}', s); partes.append(s); t += pausa
        escenas.append({'n': esc['n'], 'ini_voz': round(e_ini, 3)})
    voz_fin = t; cola = 6.0; total = round(voz_fin + cola, 3)
    ff('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', str(INICIO), 'audio/sil_00.wav')
    open('audio/lista.txt', 'w').write(''.join(f"file '{os.path.basename(p)}'\n" for p in ['audio/sil_00.wav'] + partes))
    ff('-f', 'concat', '-safe', '0', '-i', 'audio/lista.txt', '-af', FX + f',apad=whole_dur={total}', '-ar', '48000', '-ac', '1', 'audio/vo_full.wav')
    # ---- Whisper sobre la voz ya generada ----
    from faster_whisper import WhisperModel
    m = WhisperModel('small', device='cpu', compute_type='int8')
    segs, _ = m.transcribe('audio/vo_full.wav', language='es', word_timestamps=True, beam_size=5, vad_filter=False,
                           initial_prompt=' '.join(p['w'] for p in palabras))
    WW = [(x.start, x.end, x.word.strip()) for s in segs for x in s.words]
    A = [norm(p['w']) for p in palabras]; B = [norm(x[2]) for x in WW]
    sm = difflib.SequenceMatcher(None, A, B, autojunk=False); ok = 0
    for p in palabras: p['a'], p['b'], p['src'] = p['a_edge'], p['b_edge'], 'edge'
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            p, x = palabras[blk.a + k], WW[blk.b + k]
            if abs(x[0] - p['a_edge']) < .6: p['a'], p['b'], p['src'] = round(x[0], 3), round(x[1], 3), 'whisper'; ok += 1
    for i in range(1, len(palabras)):  # orden estricto
        if palabras[i]['a'] < palabras[i - 1]['a']: palabras[i]['a'] = palabras[i - 1]['b']
    print(f'Whisper: {ok}/{len(palabras)} palabras con tiempo de Whisper (el resto, de edge-tts)')
    for ei, e in enumerate(escenas):
        pw = [p for p in palabras if p['esc'] == ei]; e['primera'] = pw[0]['a']; e['ultima'] = pw[-1]['b']
    for ei, e in enumerate(escenas):  # corte: 0.12 s antes de la primera palabra de la escena
        e['corte'] = 0.0 if ei == 0 else round(e['primera'] - .12, 3)
    json.dump({'palabras': palabras, 'escenas': escenas, 'voz_fin': round(voz_fin, 3), 'fin': total}, open('subs/palabras.json', 'w'), ensure_ascii=False, indent=0)
    def ts(s): h, r = divmod(s, 3600); mi, se = divmod(r, 60); return f'{int(h):02d}:{int(mi):02d}:{int(se):02d},{int(round((se % 1) * 1000)):03d}'
    srt, k = [], 0
    for ei in range(len(escenas)):
        pw = [p for p in palabras if p['esc'] == ei]; grupo = []
        for j, p in enumerate(pw):
            grupo.append(p)
            if re.search(r'[.?!…»:]$', p['w']) or len(grupo) >= 5 or j == len(pw) - 1:
                k += 1; srt.append(f"{k}\n{ts(grupo[0]['a'])} --> {ts(grupo[-1]['b'] + .2)}\n{' '.join(g['w'] for g in grupo)}\n"); grupo = []
    open('subs/quedate_a_oscuras_p1.srt', 'w').write('\n'.join(srt))
    T = {'palabras': [[p['a'], p['b'], p['w'], p['hl'], p['esc']] for p in palabras], 'escenas': escenas, 'voz_fin': round(voz_fin, 3), 'fin': total}
    open('tiempos.js', 'w').write('window.T = ' + json.dumps(T, ensure_ascii=False) + ';\n')
    print('voz', round(voz_fin, 2), 's   total', total, 's')
asyncio.run(main())
