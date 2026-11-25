#!/bin/bash
# Comprime el render a ~7 Mbps (2 pasadas) → finales/<carpeta>.mp4
set -e; cd "$(dirname "$0")/.."; N=$1; P=/tmp/pass_$N
ffmpeg -v error -y -i $N/$N.mp4 -c:v libx264 -preset slow -b:v 7000k -maxrate 12000k -bufsize 24000k -pix_fmt yuv420p -pass 1 -passlogfile $P -an -f mp4 /dev/null
ffmpeg -v error -y -i $N/$N.mp4 -c:v libx264 -preset slow -b:v 7000k -maxrate 12000k -bufsize 24000k -pix_fmt yuv420p -pass 2 -passlogfile $P -c:a copy -movflags +faststart finales/$N.mp4
rm -f $P*; ls -la finales/$N.mp4
