#!/bin/bash
# Uso: bash lib/hacer.sh <carpeta>   → voz (si falta), audio, render → <carpeta>/<carpeta>.mp4
set -e; cd "$(dirname "$0")/../$1"; N=$(basename "$PWD")
[ -f tiempos.js ] || python3 ../lib/voz.py
python3 ../lib/audio.py
echo "render $N inicio $(date +%T)" >> ../build.log
node ../lib/render.cjs "$N.mp4" build/audio.wav > build/render.log 2>&1
echo "render $N fin $(date +%T)" >> ../build.log
