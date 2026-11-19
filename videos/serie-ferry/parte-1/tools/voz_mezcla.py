"""Coloca t1..t18.wav con sus pausas y genera assets/voz/voz.wav. Imprime los inicios (para T en film.html)."""
import subprocess, json
G = [.5, .3, .5, .45, .5, .55, 1.1, .5, .55, .55, .45, .45, .5, .45, .5, .5, 1.4, .7]; COLA = 1.1
dur = lambda f: float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
t, ini, fin = 0, [], []
for i in range(18):
    t += G[i]; ini.append(round(t, 2)); d = dur(f'assets/voz/t{i+1}.wav'); t += d; fin.append(round(t, 2))
total = round(t + COLA, 1)
args = []; flt = []
for i in range(18): args += ['-i', f'assets/voz/t{i+1}.wav']; flt.append(f'[{i}]adelay={int(ini[i]*1000)}:all=1[a{i}]')
flt.append(''.join(f'[a{i}]' for i in range(18)) + f'amix=inputs=18:normalize=0,apad=whole_dur={total}[o]')
subprocess.run(['ffmpeg','-v','error','-y',*args,'-filter_complex',';'.join(flt),'-map','[o]','-ar','48000','-ac','1','assets/voz/voz.wav'], check=True)
json.dump({'ini': ini, 'fin': fin, 'total': total}, open('assets/voz/tiempos.json', 'w'))
print('ini', ini); print('fin', fin); print('total', total)
