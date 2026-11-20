"""Bottiglia vera in Blender (18 nov 2026, "lascia stare le etichette, mi interessa la bottiglia in sé"). Dal profilo misurato sulla foto del catalogo (assets/3d/<nome>.json, tools/bottiglia_3d.py)
   una bottiglia fisica: vetro col suo spessore e il fondo rientrante, il vino come liquido fino al livello (col menisco), capsula liscia (le pieghe tolte il 18 nov: "lisci perfetti") e il castello del marchio.
   L'etichetta è la stessa srotolata dalla foto (non si rifà). Resa Cycles da studio come il catalogo: fondale bianco dietro, due strisce di luce ai lati, il resto scuro (fa i bordi del vetro).
   uso: blender.exe -b --factory-startup -P tools/bottiglia_blender.py -- assets/3d/tre-cuori.json tools/blender/tre-cuori.png [--alto 0.327] [--spp 384] [--px 1000] [--giro 72]
   --giro N: invece di un'immagine, N viste della bottiglia che gira su sé stessa (luci e macchina ferme, come su un piatto girevole) in <uscita senza .png>-giro/000.png...
   (per la pagina: tools/giro_web.py le taglia e le fa webp).
   --velo: la pelle di vetro, vino e capsula per il 3D della pagina (sul bianco e sul nero, senza etichetta), poi tools/velo_blender.py.
   Misure vere: il collo sotto il tappo è largo 30,5 mm in tutte le bottiglie, da lì l'altezza (--alto la impone). Il colore del vino viene dal velo del json (la foto al centro della bottiglia).
   shortcut: spessore del vetro (2 mm, chiesto da lui; 6 mm sul fondo) e profondità del fondo (13 mm) stimati, non misurati sulla bottiglia vera."""
import argparse
import json
import math
import os
import sys

import bpy

p = argparse.ArgumentParser()
p.add_argument('dati')
p.add_argument('uscita')
p.add_argument('--alto', type=float)
p.add_argument('--spp', type=int, default=384)
p.add_argument('--px', type=int, default=1000)
p.add_argument('--giro', type=int, default=0)
p.add_argument('--velo', action='store_true')
A = p.parse_args(sys.argv[sys.argv.index('--') + 1:])
base = A.dati[:-5]
dati = json.load(open(A.dati, encoding='utf-8'))
radice = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

bpy.ops.wm.read_factory_settings(use_empty=True)
scena = bpy.context.scene

# ---- il profilo della foto, un filo più liscio (i riflessi sul vetro mostrano ogni gradino dei pixel), in metri
P = dati['profilo']
finestra = lambda i: range(max(5, i - 2), min(len(P) - 1, i + 3))  # solo la parete: fondo e tallone (i primi cinque punti) restano come sono
liscio = P[:5] + [[sum(P[j][0] for j in finestra(i)) / len(finestra(i)), P[i][1]] for i in range(5, len(P) - 1)] + [P[-1]]
raggio = lambda q: next((liscio[i - 1][0] + (liscio[i][0] - liscio[i - 1][0]) * (q - liscio[i - 1][1]) / max(1e-9, liscio[i][1] - liscio[i - 1][1]) for i in range(1, len(liscio)) if liscio[i][1] >= q), 0)
H = A.alto or 0.01525 / raggio(0.97)  # collo sotto il tappo: 30,5 mm
cap = dati['capsula'] * H
rv = lambda z: raggio(z / H) * H  # raggio esterno del vetro alla quota z. 18 nov, "colli lisci perfetti": sotto la capsula il vetro non si stringe più (la fessura fra i due faceva una riga scura sotto il bordo)

# ---- il vetro: esterno dal centro del fondo (che rientra) su fino all'orlo, poi l'interno giù fino al centro del fondo
FONDO, T_PARETE, T_COLLO, T_BASE = 0.013, 0.002, 0.002, 0.006  # 18 nov: "spessore al vetro 0.2" = 2 mm (prima 3, e 5 nel collo); il fondo resta spesso come nelle bottiglie vere
T_CAP, T_ET = 0.0004, 0.0004  # "un piccolo spessore sul collo" (la capsula fa uno scalino sul vetro) e "un po' di spessore sull'etichetta" (un foglio, coi bordi di carta)
rt, z_tallone = liscio[4][0] * H, liscio[4][1] * H  # dove il tallone diventa parete
r_anello = liscio[1][0] * H  # l'anello su cui poggia
esterno = [(r_anello * k / 10, FONDO * (1 - (k / 10) ** 2) ** 0.8) for k in range(11)]
esterno += [(x * H, y * H) for x, y in liscio[2:-1]]
z_orlo, r_foro = H - 0.0025, 0.0093  # l'orlo sotto il tappo e il foro del sughero
esterno = [(rv(z) if z > cap else r, z) for r, z in esterno if z < z_orlo - 0.0005]
esterno.append((rv(z_orlo), z_orlo))
interno_parete = []
for i in range(len(esterno) - 1, 10, -1):  # la parete interna: l'esterna spostata verso dentro lungo la normale
    (r0, z0), (r1, z1) = esterno[i - 1], esterno[i]
    if z1 < z_tallone:
        break
    lung = math.hypot(r1 - r0, z1 - z0) or 1e-9
    t = T_COLLO if r1 < 0.45 * rt else T_PARETE + (T_COLLO - T_PARETE) * max(0, min(1, (0.75 * rt - r1) / (0.3 * rt)))
    interno_parete.append((max(r_foro if z1 > cap else 0.002, r1 - t * (z1 - z0) / lung), z1 + t * (r1 - r0) / lung))
r_iw, z_iw = interno_parete[-1]
interno_fondo = [(r_iw - (r_iw - (r_anello - T_PARETE)) * (1 - math.cos(k / 6 * math.pi / 2)), z_iw - (z_iw - T_BASE) * math.sin(k / 6 * math.pi / 2)) for k in range(1, 7)]  # scende dritto, poi piega verso il centro
interno_fondo += [((r_anello - T_PARETE) * (1 - k / 10), T_BASE + (FONDO + T_BASE - T_BASE) * (1 - (1 - k / 10) ** 2) ** 0.8) for k in range(1, 11)]
vetro = esterno + [(r_foro, z_orlo)] + interno_parete + interno_fondo

# ---- il vino: la cavità (un decimo di millimetro dentro il vetro, per non lasciare aria fra i due) fino al livello, col menisco che sale sulla parete
z_liv = dati['vetro']['livello'] * H if 'vetro' in dati else cap - 0.013  # vetro scuro: in foto (Philia) il collo vuoto sotto la capsula è alto 1,3 cm
cavita = list(reversed(interno_parete + interno_fondo))
vino = [(r + 0.0001 if r > 0 else 0, z - 0.0001) for r, z in cavita if z < z_liv]
r_liv = next(r for r, z in reversed(interno_parete) if z >= z_liv) + 0.0001
vino += [(r_liv, z_liv + 0.0012), (r_liv - 0.0025, z_liv + 0.0002), (0, z_liv)]

# ---- la capsula: la sagoma della foto sopra la sua quota; in fondo il bordo, in cima lo spigolo tondo
z_top = H
capsula = [(rv(cap), cap), (raggio(cap / H) * H + T_CAP, cap)]  # il bordo in fondo: dal vetro al suo spessore
capsula += [(raggio(q) * H + T_CAP, q * H) for x, q in liscio[2:-1] if cap < q * H < z_top - 0.002]
r_cima = capsula[-1][0]
capsula += [(r_cima - 0.0015 + 0.0015 * math.cos(k / 4 * math.pi / 2), z_top - 0.0015 + 0.0015 * math.sin(k / 4 * math.pi / 2)) for k in range(1, 5)] + [(0, z_top - 0.0002)]


def gira(nome, prof, mat, n=256, da=0.0, quanto=2 * math.pi, uv=False, pieghe=None):
    """Il profilo girato attorno all'asse verticale. I punti sull'asse diventano un vertice solo. Con uv l'immagine va da sinistra a destra (vista dalla macchina) e dal basso in alto."""
    chiuso = abs(quanto - 2 * math.pi) < 1e-6
    m = n if chiuso else n + 1
    verts, facce, anelli = [], [], []
    for r, z in prof:
        if r < 1e-7:
            anelli.append([len(verts)]); verts.append((0, 0, z)); continue
        anello = []
        for j in range(m):
            a = da + quanto * j / n
            rr = r * (1 + pieghe(z, a)) if pieghe else r
            anello.append(len(verts)); verts.append((rr * math.cos(a), rr * math.sin(a), z))
        anelli.append(anello)
    for a0, a1 in zip(anelli, anelli[1:]):
        for j in range(n if chiuso else n):
            j1 = (j + 1) % m if chiuso else j + 1
            if len(a0) == 1 and len(a1) == 1:
                continue
            if len(a0) == 1:
                facce.append((a0[0], a1[j], a1[j1]))
            elif len(a1) == 1:
                facce.append((a0[j], a0[j1], a1[0]))
            else:
                facce.append((a0[j], a0[j1], a1[j1], a1[j]))
    me = bpy.data.meshes.new(nome)
    me.from_pydata(verts, [], facce)
    if uv:
        z0, z1 = prof[0][1], prof[-1][1]
        lay = me.uv_layers.new()
        for f in me.polygons:
            for li in f.loop_indices:
                x, y, z = verts[me.loops[li].vertex_index]
                a = math.atan2(y, x)
                while a < da - 1e-6:
                    a += 2 * math.pi
                lay.data[li].uv = ((a - da) / quanto, (z - z0) / (z1 - z0))
    for f in me.polygons:
        f.use_smooth = True
    me.validate()
    ob = bpy.data.objects.new(nome, me)
    ob.data.materials.append(mat)
    scena.collection.objects.link(ob)
    return ob


def foglio(nome, z0, z1, da, quanto, r_vetro, spess, mat_fronte, mat_carta, n=128, righe=40):
    """L'etichetta come un foglio con il suo spessore, appoggiato al vetro: davanti la grafica (uv come gira), dietro e sui quattro bordi la carta (secondo materiale)."""
    zs = [z0 + (z1 - z0) * i / righe for i in range(righe + 1)]
    ang = [da + quanto * j / n for j in range(n + 1)]
    k = lambda lato, i, j: (lato * (righe + 1) + i) * (n + 1) + j  # lato 0 fuori, 1 dentro
    verts = [((r_vetro(z) + 0.0001 + (spess if lato == 0 else 0)) * math.cos(a), (r_vetro(z) + 0.0001 + (spess if lato == 0 else 0)) * math.sin(a), z)
             for lato in (0, 1) for z in zs for a in ang]
    facce, mats = [], []
    for i in range(righe):
        for j in range(n):
            facce.append((k(0, i, j), k(0, i, j + 1), k(0, i + 1, j + 1), k(0, i + 1, j))); mats.append(0)  # davanti, verso fuori
            facce.append((k(1, i, j), k(1, i + 1, j), k(1, i + 1, j + 1), k(1, i, j + 1))); mats.append(1)  # dietro, verso il vetro
    for j in range(n):
        facce.append((k(0, 0, j), k(1, 0, j), k(1, 0, j + 1), k(0, 0, j + 1))); mats.append(1)  # bordo basso
        facce.append((k(0, righe, j), k(0, righe, j + 1), k(1, righe, j + 1), k(1, righe, j))); mats.append(1)  # bordo alto
    facce.append(tuple([k(0, i, 0) for i in range(righe + 1)] + [k(1, i, 0) for i in range(righe, -1, -1)])); mats.append(1)  # bordo sinistro
    facce.append(tuple(reversed([k(0, i, n) for i in range(righe + 1)] + [k(1, i, n) for i in range(righe, -1, -1)]))); mats.append(1)  # bordo destro
    me = bpy.data.meshes.new(nome)
    me.from_pydata(verts, [], facce)
    lay = me.uv_layers.new()
    for f in me.polygons:
        for li in f.loop_indices:
            v = me.loops[li].vertex_index % ((righe + 1) * (n + 1))
            lay.data[li].uv = ((v % (n + 1)) / n, (v // (n + 1)) / righe)
    me.polygons.foreach_set('material_index', mats)
    for f in me.polygons:
        f.use_smooth = f.material_index == 0
    me.validate()
    ob = bpy.data.objects.new(nome, me)
    ob.data.materials.append(mat_fronte); ob.data.materials.append(mat_carta)
    scena.collection.objects.link(ob)
    return ob


def materiale(nome):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links, m.node_tree.nodes['Principled BSDF']


def lineare(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


# vetro bianco (flint): trasparente, appena verde dove è spesso (il fondo)
m_vetro, nn, ll, bs = materiale('vetro')
bs.inputs['Base Color'].default_value = (1, 1, 1, 1)  # il grigio 0,8 di Blender tingerebbe la luce che passa, a ogni superficie
bs.inputs['Roughness'].default_value = 0.0
bs.inputs['IOR'].default_value = 1.52
bs.inputs['Transmission Weight'].default_value = 1.0
va = nn.new('ShaderNodeVolumeAbsorption'); va.inputs['Color'].default_value = (0.9, 0.97, 0.94, 1); va.inputs['Density'].default_value = 4.0
ll.new(va.outputs[0], nn['Material Output'].inputs['Volume'])
if 'vetro' not in dati:  # vetro scuro (Collezione 53, Philia), anche lui trasparente: foglia morta, letto sul collo vuoto di Philia in foto (65,50,0 attraverso due pareti)
    foglia = [lineare(c / 255) for c in (65, 50, 1)]
    sig = [-math.log(c) / (2 * T_PARETE) for c in foglia]
    va.inputs['Color'].default_value = (*[1 - s / max(sig) for s in sig], 1); va.inputs['Density'].default_value = max(sig)

# il vino: colore dal velo del json al centro della bottiglia (com'è in foto sul bianco), diviso quanto rende il fondale attraverso il vetro senza vino; diventa assorbimento lungo il diametro
FONDALE = 0.944  # misurato sulla ripresa (tools/blender/<nome>-velo-bianco.png contro la foto, alla quota del velo); con 0,9 stimato il vino veniva chiaro: Marpiccolo "in sovraesposizione" (18 nov)
m_vino, nn, ll, bs = materiale('vino')
bs.inputs['Base Color'].default_value = (1, 1, 1, 1)
bs.inputs['Roughness'].default_value = 0.0
bs.inputs['IOR'].default_value = 1.34
bs.inputs['Transmission Weight'].default_value = 1.0
if 'vetro' not in dati:  # dietro il vetro scuro un rosso pieno: quasi nero, come in foto
    va = nn.new('ShaderNodeVolumeAbsorption'); va.inputs['Color'].default_value = (0.55, 0.05, 0.08, 1); va.inputs['Density'].default_value = 150.0
    ll.new(va.outputs[0], nn['Material Output'].inputs['Volume'])
else:
    v = dati['vetro']['velo'][31]
    foto = [lineare((c / 255) * (v[3] / 255) + 1 - v[3] / 255) for c in v[:3]]
    d = 2 * (raggio(dati['etichetta'][1] + 0.03) * H - T_PARETE)  # il diametro dove il velo è letto in foto: il corpo appena sopra l'etichetta
    sigma = [-math.log(min(0.999, max(0.02, c / FONDALE))) / d for c in foto]
    dens = max(sigma)
    va = nn.new('ShaderNodeVolumeAbsorption'); va.inputs['Color'].default_value = (*[1 - s / dens for s in sigma], 1); va.inputs['Density'].default_value = dens
    ll.new(va.outputs[0], nn['Material Output'].inputs['Volume'])
    print('vino: colore in foto', [round(c, 3) for c in foto], 'diametro', round(d, 4), 'densità', round(dens, 2))

# la capsula: il colore della foto, opaca
m_cap, nn, ll, bs = materiale('capsula')
cc = dati.get('capsulaColore', '#0e0e0e')
bs.inputs['Base Color'].default_value = (0.6, 0.6, 0.58, 1) if dati.get('capsulaMetallo') else (*[lineare(int(cc[i:i + 2], 16) / 255) * 0.92 for i in (1, 3, 5)], 1)  # stagnola: argento chiaro (in foto è grigia perché riflette lo studio)
bs.inputs['Roughness'].default_value = 0.1 if dati.get('capsulaMetallo') else 0.45  # stagnola lucida: le strisce dello studio vengono nette, come in foto
bs.inputs['Metallic'].default_value = 1.0 if dati.get('capsulaMetallo') else 0.0

# l'etichetta: la foto srotolata; ruvidezza e lamina dall'orm (verde, blu); dal retro carta bianca
m_et, nn, ll, bs = materiale('etichetta')
im = nn.new('ShaderNodeTexImage'); im.image = bpy.data.images.load(os.path.abspath(base + '-etichetta.webp'))
orm = nn.new('ShaderNodeTexImage'); orm.image = bpy.data.images.load(os.path.abspath(base + '-orm.webp')); orm.image.colorspace_settings.name = 'Non-Color'
sep = nn.new('ShaderNodeSeparateColor'); ll.new(orm.outputs['Color'], sep.inputs['Color'])
ll.new(im.outputs['Color'], bs.inputs['Base Color']); ll.new(sep.outputs['Green'], bs.inputs['Roughness']); ll.new(sep.outputs['Blue'], bs.inputs['Metallic'])
retro = nn.new('ShaderNodeBsdfDiffuse'); retro.inputs['Color'].default_value = (0.85, 0.85, 0.83, 1)
geo = nn.new('ShaderNodeNewGeometry'); mix = nn.new('ShaderNodeMixShader')
ll.new(geo.outputs['Backfacing'], mix.inputs['Fac']); ll.new(bs.outputs['BSDF'], mix.inputs[1]); ll.new(retro.outputs['BSDF'], mix.inputs[2])
ll.new(mix.outputs['Shader'], nn['Material Output'].inputs['Surface'])

# il castello: il marchio (assets/logo/feudi-marchio.svg, due poligoni) disegnato qui in un'immagine con l'alfa; oro se è lamina, altrimenti inchiostro del suo colore
if 'castello' in dati:
    W_, H_ = 240, 357
    pol = [[(0, 0.53), (17.69, 13.2), (30.02, 0.34), (42.35, 13.2), (60.05, 0.53), (60.05, 23.31), (0, 23.31)],
           [(0, 29.14), (60.05, 29.14), (60.05, 89.35), (36.27, 89.35), (36.27, 56.31), (23.78, 56.31), (23.78, 89.35), (0, 89.35)]]
    dentro = lambda x, y, pg: sum(1 for (x0, y0), (x1, y1) in zip(pg, pg[1:] + pg[:1]) if (y0 > y) != (y1 > y) and x < x0 + (y - y0) * (x1 - x0) / (y1 - y0)) % 2 == 1
    img = bpy.data.images.new('castello', W_, H_, alpha=True)
    px = []
    for j in range(H_):
        y = (H_ - 1 - j + 0.5) * 89.35 / H_
        for i in range(W_):
            x = (i + 0.5) * 60.05 / W_
            px += [1, 1, 1, 1.0 if any(dentro(x, y, pg) for pg in pol) else 0.0]
    img.pixels = px
    m_ca, nn, ll, bs = materiale('castello')
    t = nn.new('ShaderNodeTexImage'); t.image = img
    ll.new(t.outputs['Alpha'], bs.inputs['Alpha'])
    k = dati['castello']
    if k.get('metallo', True):
        bs.inputs['Base Color'].default_value = (0.78, 0.6, 0.32, 1); bs.inputs['Metallic'].default_value = 1.0; bs.inputs['Roughness'].default_value = 0.3
    else:
        col = k['colore']; bs.inputs['Base Color'].default_value = (*[lineare(int(col[i:i + 2], 16) / 255) for i in (1, 3, 5)], 1); bs.inputs['Roughness'].default_value = 0.6

# ---- i pezzi. Il davanti guarda la macchina (-Y): l'etichetta è centrata a -90°
FRONTE = -math.pi / 2
gira('vetro', vetro, m_vetro)
gira('vino', vino, m_vino)
capsula_ob = gira('capsula', capsula, m_cap)  # 18 nov: "i colli troppo realistici, rendiamoli lisci perfetti": niente pieghe in fondo
capsula_ob.visible_glossy = False  # il suo riflesso sulla spalla scura faceva un pallino nero, come un buco
capsula_ob.data.set_sharp_from_angle(angle=math.radians(30))  # lo spigolo in fondo resta netto: con le normali sfumate fra bordo e fianco si scuriva in una riga grigia
e0, e1 = dati['etichetta'][0] * H, dati['etichetta'][1] * H
arco = math.radians(dati['arco'])
m_carta, nn, ll, bs = materiale('carta')  # retro e bordi dell'etichetta
bs.inputs['Base Color'].default_value = (0.86, 0.86, 0.84, 1); bs.inputs['Roughness'].default_value = 0.9
foglio('etichetta', e0, e1, FRONTE - arco / 2, arco, rv, T_ET, m_et, m_carta)
if 'castello' in dati:
    qc, hc = dati['castello']['quota'] * H, dati['castello']['alto'] * H
    rc = raggio(qc / H) * H + T_CAP + 0.00012
    ac = hc * 60.05 / 89.35 / rc
    gira('castello', [(rc, qc - hc / 2 + hc * i / 4) for i in range(5)], m_ca, n=16, da=FRONTE - ac / 2, quanto=ac, uv=True)

# ---- lo studio del catalogo: fondale bianco dietro (luce e sfondo), strisce di luce ai lati e dietro, una luce larga davanti che il vetro non specchia, il resto scuro
def per_raggio(nn, ll, presa, altri, *tipi):
    """Una forza che vale 1 per i raggi dei tipi dati (dalla macchina, attraverso il vetro) e 'altri' per il resto (la luce che arriva su capsula ed etichetta, i riflessi)."""
    lp = nn.new('ShaderNodeLightPath'); acc = lp.outputs[tipi[0]]
    for t in tipi[1:]:
        mx = nn.new('ShaderNodeMath'); mx.operation = 'MAXIMUM'; ll.new(acc, mx.inputs[0]); ll.new(lp.outputs[t], mx.inputs[1]); acc = mx.outputs[0]
    ma = nn.new('ShaderNodeMath'); ma.operation = 'MULTIPLY_ADD'; ma.inputs[1].default_value = 1 - altri; ma.inputs[2].default_value = altri
    ll.new(acc, ma.inputs[0]); ll.new(ma.outputs[0], presa)
    return ma


# come il catalogo, una tenda bianca: attraverso il vetro si vede bianco tutto attorno (il vino resta rosa anche dove fa da lente); per la luce su capsula ed etichetta
# e per i riflessi sul vetro lo studio è grigio, così i bordi si staccano dal fondale e la capsula bianca non brucia
mondo = bpy.data.worlds.new('mondo'); scena.world = mondo; mondo.use_nodes = True
mondo.node_tree.nodes['Background'].inputs['Color'].default_value = (1, 1, 1, 1)
tenda = per_raggio(mondo.node_tree.nodes, mondo.node_tree.links, mondo.node_tree.nodes['Background'].inputs['Strength'], 0.25, 'Is Transmission Ray')
TENDA = 0.5  # 18 nov: ai lati la tenda è grigia, non bianca: i bordi del vino che fa da lente scuriscono come in foto (bianca li faceva sparire nel fondo)
tenda.inputs[1].default_value = TENDA - 0.25
m_fon, nn, ll, bs = materiale('fondale')
em = nn.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (1.06, 1.06, 1.06, 1)  # un filo oltre il bianco: lo sfondo esce pulito a 255
dietro = per_raggio(nn, ll, em.inputs['Strength'], 0.4, 'Is Camera Ray', 'Is Transmission Ray')
ll.new(em.outputs[0], nn['Material Output'].inputs['Surface'])
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 1.0, H / 2), rotation=(math.pi / 2, 0, 0))
fondale = bpy.context.active_object; fondale.scale = (3.5, 2.5, 1); fondale.data.materials.append(m_fon)  # largo: il vino fa da lente e guarda molto di lato


def luce(nome, dove, guarda, w, h, forza, specchio=True, diffusa=True):
    d = bpy.data.lights.new(nome, 'AREA'); d.shape = 'RECTANGLE'; d.size = w; d.size_y = h; d.energy = forza
    ob = bpy.data.objects.new(nome, d); ob.location = dove; scena.collection.objects.link(ob)
    v = [g - o for g, o in zip(guarda, dove)]
    ob.rotation_euler = (math.atan2(math.hypot(v[0], v[1]), -v[2]), 0, math.atan2(-v[0], v[1]))  # il -Z della luce verso il punto guardato
    ob.visible_glossy, ob.visible_diffuse = specchio, diffusa
    ob.visible_transmission = False  # nessuna luce si vede attraverso il vetro: quella davanti faceva un rettangolo bianco, le strisce viste attraverso il vino i bordi bianchi
    return ob


# le strisce fanno solo i riflessi sul vetro (non illuminano capsula ed etichetta, che brucerebbero); la luce davanti illumina e non si specchia
luce('striscia_sx', (-1.1, 0.35, H / 2), (0, 0, H / 2), 0.45, 1.6, 6, diffusa=False)  # 18 nov: erano 220 e 45, bruciavano in righe bianche che sul fondo bianco della pagina sparivano ("in sovraesposizione")
luce('striscia_dx', (1.1, 0.5, H / 2), (0, 0, H / 2), 0.5, 1.6, 3, diffusa=False)
luce('davanti', (0.4, -2.2, H * 0.9), (0, 0, H / 2), 1.4, 1.4, 45, specchio=False)
luce('sinistra', (-2.2, 0, H * 0.9), (0, 0, H / 2), 1.4, 1.4, 42, specchio=False)  # 18 nov: la capsula è chiara a sinistra come in foto (prima la schiarivano le strisce forti, ora abbassate)

# ---- la macchina: 200 mm come nella pagina, tre gradi sopra, la bottiglia all'85% dell'altezza come nel catalogo
cd = bpy.data.cameras.new('macchina'); cd.lens = 200; cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 24
mac = bpy.data.objects.new('macchina', cd); scena.collection.objects.link(mac); scena.camera = mac
dist = (H / 0.85 / 2) / math.tan(math.atan(12 / 200))
su = math.radians(3)
mac.location = (0, -dist * math.cos(su), H / 2 + dist * math.sin(su))
mac.rotation_euler = (math.pi / 2 - su, 0, 0)

# ---- resa
pref = bpy.context.preferences.addons['cycles'].preferences
pref.compute_device_type = 'OPTIX'; pref.get_devices()
for dv in pref.devices:
    dv.use = dv.type == 'OPTIX'
scena.render.engine = 'CYCLES'; scena.cycles.device = 'GPU'
scena.cycles.samples = A.spp; scena.cycles.use_adaptive_sampling = True; scena.cycles.adaptive_threshold = 0.008
scena.cycles.use_denoising = True; scena.cycles.denoiser = 'OPENIMAGEDENOISE'
scena.cycles.max_bounces = 32; scena.cycles.transmission_bounces = 32; scena.cycles.transparent_max_bounces = 16
scena.cycles.glossy_bounces = 8; scena.cycles.diffuse_bounces = 3; scena.cycles.volume_bounces = 2
scena.cycles.caustics_reflective = False; scena.cycles.caustics_refractive = True; scena.cycles.blur_glossy = 0.3
scena.render.resolution_x, scena.render.resolution_y = A.px, round(A.px * 1024 / 653)
scena.render.film_transparent = False
scena.view_settings.view_transform = 'Standard'; scena.view_settings.look = 'None'
scena.render.image_settings.file_format = 'PNG'
scena.render.filepath = os.path.abspath(A.uscita)
print(f'bottiglia alta {H * 100:.1f} cm, capsula da {cap * 100:.1f} cm, livello {z_liv * 100:.1f} cm, macchina a {dist:.2f} m')
if A.velo:  # la pelle della bottiglia per il 3D della pagina (tools/velo_blender.py): vetro, vino e capsula senza etichetta né castello, di fronte e in proiezione parallela,
    # una volta sul bianco e una sul nero (attraverso il vetro si vede nero): dalla differenza si sa quanta luce passa e di che colore
    for nome in ('etichetta', 'castello'):
        if nome in bpy.data.objects:
            bpy.data.objects[nome].hide_render = True
    cd.type = 'ORTHO'; cd.ortho_scale = H * 1.02
    mac.location = (0, -dist, H / 2); mac.rotation_euler = (math.pi / 2, 0, 0)
    sagoma = sorted([(z, r) for r, z in esterno if z <= cap] + [(z, r) for r, z in capsula if z > cap])  # il contorno girato: vetro sotto la capsula, capsula sopra
    alto = 2048; largo = 2 * math.ceil(alto * 2 * max(r for z, r in sagoma) * 1.06 / (H * 1.02) / 2)
    scena.render.resolution_x, scena.render.resolution_y = largo, alto
    radice_out = os.path.abspath(A.uscita[:-4])
    json.dump({'alto': alto, 'largo': largo, 'scala': 1.02, 'sagoma': [[round(z / H, 5), round(r / H, 6)] for z, r in sagoma]}, open(radice_out + '-velo.json', 'w'))
    for fondo, forza in (('bianco', 1.0), ('nero', 0.0)):
        tenda.inputs[1].default_value = forza * TENDA - 0.25; dietro.inputs[1].default_value = forza - 0.4
        scena.render.filepath = radice_out + f'-velo-{fondo}.png'
        bpy.ops.render.render(write_still=True)
elif A.giro:  # il piatto girevole: tutti i pezzi della bottiglia (non il fondale) girano attorno al loro asse, che è l'asse della bottiglia
    pezzi = [o for o in scena.objects if o.type == 'MESH' and o != fondale]
    cartella = os.path.abspath(A.uscita[:-4] + '-giro')
    os.makedirs(cartella, exist_ok=True)
    scena.render.use_persistent_data = True  # la scena resta caricata fra una vista e l'altra
    for i in range(A.giro):
        for o in pezzi:
            o.rotation_euler.z = 2 * math.pi * i / A.giro
        scena.render.filepath = os.path.join(cartella, f'{i:03d}.png')
        bpy.ops.render.render(write_still=True)
else:
    bpy.ops.render.render(write_still=True)
