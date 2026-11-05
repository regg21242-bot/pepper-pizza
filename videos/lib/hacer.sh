#!/bin/bash
# Uso: lib/hacer.sh <carpeta_video> [solo-voz|solo-render]
# Genera voz + tiempos, audio y vídeo final (<carpeta>/<carpeta>.mp4)
set -e
D=$(cd "$1" && pwd); N=$(basename "$D")
W=${TMPWORK:-/tmp}/vid_$N; mkdir -p "$W"
cd "$D"
if [ "$2" != "solo-render" ]; then SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3 ../lib/voz.py "$W"; fi
[ "$2" == "solo-voz" ] && exit 0
python3 audio.py "$W" "$W/audio.wav"
NODE_PATH=$(npm root -g) node ../lib/render.js "$D/$N.mp4" "$W/audio.wav" 2>&1 | grep -E "Listo|Error"
