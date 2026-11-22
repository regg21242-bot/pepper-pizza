#!/bin/bash
# Renderiza la película en 4 partes (sin depender de un solo proceso largo) y las une en renders/video_mudo.mp4
cd "$(dirname "$0")/.."
P=(0 25 50 75 "")
for i in 0 1 2 3; do
  out=renders/parte_$i.mp4; [ -s "$out" ] && continue
  if [ -n "${P[$((i+1))]}" ]; then fin="--end ${P[$((i+1))]}"; else fin=""; fi
  echo "parte $i inicio $(date +%T)" >> renders/progreso.log
  npx hyperframes render -q standard --start ${P[$i]} $fin -o $out --quiet > renders/parte_$i.log 2>&1
  echo "parte $i fin $(date +%T) $(ls -la $out 2>/dev/null | awk '{print $5}')" >> renders/progreso.log
done
printf "file 'parte_0.mp4'\nfile 'parte_1.mp4'\nfile 'parte_2.mp4'\nfile 'parte_3.mp4'\n" > renders/lista.txt
ffmpeg -v error -y -f concat -safe 0 -i renders/lista.txt -an -c copy renders/video_mudo.mp4 && echo "LISTO $(date +%T)" >> renders/progreso.log
