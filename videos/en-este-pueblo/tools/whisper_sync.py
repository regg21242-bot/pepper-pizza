"""Vuelve a sincronizar los subtítulos con Whisper (faster-whisper small) sobre cada línea de voz ya procesada.
Si Whisper encuentra el mismo número de palabras que el guion, se usan sus tiempos con el texto del guion;
si no, se conservan los tiempos de edge-tts. Reescribe assets/voz/palabras.json (agrega "fuente" por plano).
Uso: /root/.venvs/video/bin/python tools/whisper_sync.py"""
import json, os
from faster_whisper import WhisperModel
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PJ = os.path.join(RAIZ, 'assets', 'voz', 'palabras.json'); V = json.load(open(PJ))
m = WhisperModel('small', device='cpu', compute_type='int8')
fuente = {}
for n, ws in V['palabras'].items():
    wav = os.path.join(RAIZ, 'assets', 'voz', 'lineas', f'p{n}.wav')
    segs, _ = m.transcribe(wav, language='es', word_timestamps=True, beam_size=5, vad_filter=False)
    wh = [w for s in segs for w in s.words]
    if len(wh) == len(ws):
        dur = V['dur'][n]
        V['palabras'][n] = [[round(max(0, w.start), 3), round(min(dur, w.end), 3), t[2]] for w, t in zip(wh, ws)]; fuente[n] = 'whisper'
    else: fuente[n] = 'edge'
    print(n, fuente[n], ' '.join(w.word.strip() for w in wh))
V['fuente'] = fuente
json.dump(V, open(PJ, 'w'), ensure_ascii=False, indent=0)
print('whisper:', sum(v == 'whisper' for v in fuente.values()), 'de', len(fuente))
