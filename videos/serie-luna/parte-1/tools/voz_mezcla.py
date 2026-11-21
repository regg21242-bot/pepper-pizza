"""Coloca t1..t27.wav con sus pausas → assets/voz/voz.wav y assets/voz/tiempos.json (inicios/fin de cada línea)."""
import subprocess, json
n = 27
G = [.5, .25, .45, .5, .4, .4, .35, .4, .3, .45, .45, .35, .55, .5, .5, .5, .45, .45, .5, .45, .45, .45, .45, .4, .8, .4, 5.2]; COLA = 1.2
dur = lambda f: float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
t, ini, fin = 0, [], []
for i in range(n):
    t += G[i]
    if i == 7: t += 1.4   # escena 7: "23:10 · charla de esta noche"
    if i == 16: t += .3
    ini.append(round(t, 2)); t += dur(f'assets/voz/t{i+1}.wav'); fin.append(round(t, 2))
total = round(t + COLA, 1)
args, flt = [], []
for i in range(n): args += ['-i', f'assets/voz/t{i+1}.wav']; flt.append(f'[{i}]adelay={int(ini[i]*1000)}:all=1[a{i}]')
flt.append(''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0,apad=whole_dur={total}[o]')
subprocess.run(['ffmpeg','-v','error','-y',*args,'-filter_complex',';'.join(flt),'-map','[o]','-ar','48000','-ac','1','assets/voz/voz.wav'], check=True)
json.dump({'ini': ini, 'fin': fin, 'total': total}, open('assets/voz/tiempos.json', 'w'))
print('ini', ini); print('fin', fin); print('total', total)
