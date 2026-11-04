import asyncio, json, subprocess, os, edge_tts
LINES = {
 1: ["Hace cien años,", "si vivías en Inglaterra,", "te despertaba esto:"],
 2: ["Un hombre con un palo", "larguísimo", "golpeando tu ventana", "a las cuatro de la mañana."],
 3: ["Era la Revolución Industrial:", "millones trabajaban en fábricas", "y llegar tarde", "te costaba dinero.", "Y un despertador", "era un lujo."],
 4: ["Así nació un oficio:", "el knocker-upper,", "el despertador humano.", "Iba casa por casa", "y no se iba hasta ver", "que te despertabas."],
 5: ["Le pagaban unas monedas", "a la semana.", "Y le dejaban la hora", "escrita con tiza", "junto a la puerta."],
 6: ["Y en Londres,", "una mujer, Mary Smith,", "lo hacía con…", "¡una cerbatana", "de guisantes secos!"],
 7: ["¿Y quién despertaba", "al despertador humano?", "Nadie: trabajaban de noche", "y dormían de día."],
 8: ["Cuando los despertadores", "se volvieron baratos,", "el oficio desapareció.", "¿Tú pagarías por que te despierten así?"],
}
async def one(text, path):
    c = edge_tts.Communicate(text, "es-MX-JorgeNeural", rate="+8%", proxy=os.environ["HTTPS_PROXY"])
    await c.save(path)
async def main():
    res = {}
    for s, ls in LINES.items():
        for i, l in enumerate(ls):
            p = f"s{s}_{i}.mp3"
            await one(l, p)
            d = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
            res.setdefault(s, []).append([l, p, d])
    json.dump(res, open("durs.json","w"), ensure_ascii=False, indent=1)
    for s, ls in res.items(): print(s, round(sum(x[2] for x in ls),2), [round(x[2],2) for x in ls])
asyncio.run(main())
