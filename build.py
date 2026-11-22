"""Arma el sitio: copia las pantallas del canvas (dc/*.dc.html) y sus recursos,
cambiando las direcciones internas del artefacto (/_blob/<id>) por archivos locales.
Uso: python3 build.py <carpeta de trabajo con gui/project, blobs/ y npm/>"""
import os, re, shutil, subprocess, sys

SITE = os.path.dirname(os.path.abspath(__file__))
S = sys.argv[1]
SRC_DC = os.path.join(S, "gui", "project")
BLOBS = os.path.join(S, "blobs")
NAMES = {  # nombres legibles para los archivos del sitio
    "1a45b9639c9cb744cf496238614251fd": "tramo0", "b7635569b0861e9b7e804da28358055b": "tramo1", "ff91bf18bee43b8a692926d968a74dbe": "tramo2",
    "d87b7e364a68490710c79ad6d2e6d2f1": "tramo3", "ef8e364d14b5c7e9a51074d86000324a": "tramo4", "0416e7c75b4de1fd7f5dfb92fcdf2519": "tramo5", "8c2fd5557b3c455a5cd1d1a25c4e5547": "tramo6",
    "1feb1d4ec6f2e9e64267d3bc2cab0181": "tramo0", "df56f55c72118710c960a24b5296630d": "tramo1", "507ac3698824fd59256f7ef1da864569": "tramo2",
    "2d76914396e561bbbc945b2b33a27ffe": "tramo3", "39247284bd0e5629dedfefddb8e81e7f": "tramo4", "7c5a1449ed8906880150a41b8c0728c4": "tramo5",
    "f36bcc1c2c8af18655a2e48229792858": "tramo6", "78b142dbd9b49a5971d0f356c2886257": "sprites", "e04af81b0083e5ead348d37017db4fcf": "dormido1",
    "2de85611d7f1d41ed6abc95bb909b004": "dormido2", "a8211948342642ad44ce1a78bb266623": "cesto", "123522bc6884eaea6204d1b2caad9a77": "mojado",
    "2ceb79975e3ccf18c676c424d3516648": "sos", "17098684bf6fc482a2f7b305b81fe606": "fuera-de-servicio", "9b220fbbe27e0cd764a5ea5518ac2ae1": "tren-a",
    "d7ffd391379468f32a384db35bc5f9b8": "luz0", "d6b7ed64085b806927d755eb81b1db4f": "luz1", "e391198e12dd782134eddaadec93e516": "luz2",
    "3307372e90a7f1df348639d0bfc62cf2": "luz4", "74ced3df2f576147ecec7763fa714233": "luz5", "ff9447b93eab7e5cf875f7c89813123b": "luz6",
    "401d37931137f641d0bbea3512450d84": "frente1", "71b6b0f0a3b67cf522bdb951cc7e04a4": "frente2", "a35e1f981c8365310b19cf762be6432c": "frente4",
    "077205bd2f64714cceb0d463963ece4a": "inicio", "e81841d7d4e0e45d62559d01ce813a0b": "final",
    "6b951be773a38246e9b3ab722b9bc4f2": "ambiente", "b83d510f4cd6221807d9ce156a80d66c": "artista", "125e44b4f34220a6aa6aeb1a2a09e7df": "papel",
    "7be023788ae3c0d0c03a4f8ee205f3b6": "puerta", "77e479a7bc96b90959deb5886095c71f": "timbre", "0db6f002e9dfd08f9e07bbd4e20c373b": "tren",
    "603b2a40e6211807ad2937a5aa3d679a": "ventiladores",
    "f9d2c57da1371508ed1ce23a16a829ce": "tren-h", "43cd79a8fc4f3db98671310de8c07f46": "sprites",
}

def main():
    used = {}
    for name in ["Recorrido", "FinalTarde", "FinalChoque", "Inicio"]:
        t = open(os.path.join(SRC_DC, name + ".dc.html"), encoding="utf-8").read()
        def sub(m):
            bid = m.group(1)
            src = [f for f in os.listdir(BLOBS) if f.startswith(bid)]
            if not src: raise SystemExit("falta el recurso " + bid)
            ext = os.path.splitext(src[0])[1]
            dst = ("assets/snd/" + NAMES[bid] + ".mp3") if ext == ".mp4" else ("assets/img/" + NAMES.get(bid, bid) + ext)
            used[bid] = (os.path.join(BLOBS, src[0]), dst)
            return dst
        t = re.sub(r"/_blob/([0-9a-f]{32})", sub, t)
        t = re.sub(r'<link rel="preconnect" href="https://fonts.googleapis.com">\n?', "", t)
        t = re.sub(r'<link href="https://fonts.googleapis.com/[^"]*" rel="stylesheet">\n?', "", t)
        open(os.path.join(SITE, "dc", name + ".dc.html"), "w", encoding="utf-8").write(t)
    shutil.rmtree(os.path.join(SITE, "assets", "img"), ignore_errors=True)
    shutil.rmtree(os.path.join(SITE, "assets", "snd"), ignore_errors=True)
    for src, dst in used.values():
        out = os.path.join(SITE, dst); os.makedirs(os.path.dirname(out), exist_ok=True)
        if dst.endswith(".mp3"):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-codec:a", "libmp3lame", "-b:a", "128k", out], check=True)
        else:
            shutil.copyfile(src, out)
    # ícono y portada para compartir (se rehacen porque assets/img se borró arriba)
    from PIL import Image, ImageDraw
    img = os.path.join(SITE, "assets", "img")
    tramo = [v[0] for k, v in used.items() if NAMES.get(k) == "tramo0"][0]
    cover = Image.open(tramo).convert("RGB").resize((1200, 630), Image.NEAREST)
    cover.save(os.path.join(img, "portada.png"))
    ico = Image.new("RGBA", (64, 64), (0, 0, 0, 0)); d = ImageDraw.Draw(ico)
    d.ellipse((2, 2, 61, 61), fill=(7, 7, 5)); d.ellipse((6, 6, 57, 57), fill=(242, 194, 0))
    for r in [(20, 16, 27, 47), (37, 16, 44, 47), (27, 28, 37, 35)]: d.rectangle(r, fill=(16, 17, 12))
    ico.save(os.path.join(img, "icono.png"))
    fonts = os.path.join(SITE, "assets", "fonts"); os.makedirs(fonts, exist_ok=True)
    npm = os.path.join(S, "npm")
    for pkg, f in [("fontsource-silkscreen-5.0.13", "silkscreen-latin-400-normal.woff2"), ("fontsource-silkscreen-5.0.13", "silkscreen-latin-700-normal.woff2"), ("fontsource-vt323-5.0.13", "vt323-latin-400-normal.woff2")]:
        shutil.copyfile(os.path.join(npm, pkg, "package", "files", f), os.path.join(fonts, f))
    shutil.copyfile(os.path.join(npm, "fontsource-silkscreen-5.0.13", "package", "LICENSE"), os.path.join(fonts, "OFL-silkscreen.txt"))
    shutil.copyfile(os.path.join(npm, "fontsource-vt323-5.0.13", "package", "LICENSE"), os.path.join(fonts, "OFL-vt323.txt"))
    vend = os.path.join(SITE, "vendor"); os.makedirs(vend, exist_ok=True)
    shutil.copyfile(os.path.join(npm, "preact-10.24.3", "package", "dist", "preact.module.js"), os.path.join(vend, "preact.module.js"))
    shutil.copyfile(os.path.join(npm, "preact-10.24.3", "package", "LICENSE"), os.path.join(vend, "PREACT-LICENSE"))
    print("pantallas: 4, recursos:", len(used))

main()
