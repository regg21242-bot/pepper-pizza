"""Transcribe un audio o video en español con faster-whisper, con tiempos por palabra.

Uso:
  /root/.venvs/video/bin/python videos/lib/transcribir.py GRABACION.mp4 [opciones]

Opciones:
  --modelo small        tiny | base | small | medium | large-v3 (más grande = más preciso y más lento)
  --idioma es           código de idioma
  --palabras 4          palabras máximas por subtítulo (pocas palabras = estilo Shorts/TikTok)
  --salida carpeta/     dónde guardar (por defecto, junto al archivo)

Genera:
  NOMBRE.srt   subtítulos cortos, listos para cualquier editor
  NOMBRE.json  {"texto", "idioma", "duracion", "segmentos":[...], "palabras":[{"palabra","inicio","fin","prob"}]}
"""
import argparse, json, os, sys
from faster_whisper import WhisperModel


def ts(s):
    ms = int(round(s * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


def bloques(palabras, maximo):
    """Agrupa palabras en subtítulos cortos; corta también en signos de puntuación y pausas largas."""
    out, cur = [], []
    for i, w in enumerate(palabras):
        cur.append(w)
        sig = palabras[i + 1] if i + 1 < len(palabras) else None
        pausa = sig is not None and sig["inicio"] - w["fin"] > 0.6
        if len(cur) >= maximo or w["palabra"].rstrip().endswith((".", ",", "?", "!", ":", ";", "…")) or pausa or sig is None:
            out.append(cur); cur = []
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("archivo")
    ap.add_argument("--modelo", default="small")
    ap.add_argument("--idioma", default="es")
    ap.add_argument("--palabras", type=int, default=4)
    ap.add_argument("--salida")
    a = ap.parse_args()

    modelo = WhisperModel(a.modelo, device="cpu", compute_type="int8")
    segs, info = modelo.transcribe(a.archivo, language=a.idioma, word_timestamps=True, vad_filter=True)
    segmentos, palabras = [], []
    for s in segs:
        segmentos.append({"inicio": round(s.start, 3), "fin": round(s.end, 3), "texto": s.text.strip()})
        for w in s.words or []:
            palabras.append({"palabra": w.word.strip(), "inicio": round(w.start, 3), "fin": round(w.end, 3), "prob": round(w.probability, 3)})
        print(f"[{s.start:6.2f} → {s.end:6.2f}] {s.text.strip()}", file=sys.stderr)

    base = os.path.splitext(os.path.basename(a.archivo))[0]
    carpeta = a.salida or os.path.dirname(os.path.abspath(a.archivo))
    os.makedirs(carpeta, exist_ok=True)
    with open(os.path.join(carpeta, base + ".srt"), "w", encoding="utf-8") as f:
        for n, b in enumerate(bloques(palabras, a.palabras), 1):
            f.write(f"{n}\n{ts(b[0]['inicio'])} --> {ts(b[-1]['fin'])}\n{' '.join(w['palabra'] for w in b)}\n\n")
    with open(os.path.join(carpeta, base + ".json"), "w", encoding="utf-8") as f:
        json.dump({"texto": " ".join(s["texto"] for s in segmentos), "idioma": info.language,
                   "duracion": round(info.duration, 3), "segmentos": segmentos, "palabras": palabras}, f, ensure_ascii=False, indent=1)
    print(os.path.join(carpeta, base + ".srt"))
    print(os.path.join(carpeta, base + ".json"))


if __name__ == "__main__":
    main()
