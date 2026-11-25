#!/bin/bash
# Renderiza en fila los videos que se le pasen (espera a que termine cualquier render en curso)
cd "$(dirname "$0")/.."
while pgrep -f "render.cjs" > /dev/null; do sleep 20; done
for v in "$@"; do bash lib/hacer.sh "$v"; done
echo "COLA LISTA $(date +%T)" >> build.log
