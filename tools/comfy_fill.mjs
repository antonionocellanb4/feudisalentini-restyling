// riempie la parte trasparente di un PNG con Flux Fill su Comfy Cloud (tools/ponte_ai.py). A pagamento: una immagine a chiamata. La chiave non viene mai stampata
// uso: node tools/comfy_fill.mjs <ingresso.png con alfa> <uscita.png> <file col prompt> [seed]   chiave: COMFY_API_KEY, altrimenti quella del progetto ManyTask
import { readFileSync, writeFileSync } from 'node:fs';
const [ing, usc, fp, seedA] = process.argv.slice(2);
const riga = process.env.COMFY_API_KEY ? null : readFileSync('C:/Users/Utente/Downloads/manytask/.env.local', 'utf8').split(/\r?\n/).find((l) => l.startsWith('COMFY_API_KEY='));
const KEY = (process.env.COMFY_API_KEY ?? riga?.slice('COMFY_API_KEY='.length) ?? '').trim().replace(/^["']|["']$/g, '');
if (!KEY) throw new Error('manca COMFY_API_KEY');
const COMFY = 'https://cloud.comfy.org', H = { 'X-API-Key': KEY };
const form = new FormData();
form.append('image', new Blob([readFileSync(ing)], { type: 'image/png' }), `feudi-${Date.now()}.png`);
form.append('type', 'input'); form.append('overwrite', 'true');
const up = await fetch(`${COMFY}/api/upload/image`, { method: 'POST', headers: H, body: form }).then((r) => r.json());
if (!up?.name) throw new Error('caricamento non riuscito');
const seed = +(seedA ?? Math.floor(Math.random() * 2147483647));
const prompt = {
  3: { class_type: 'LoadImage', inputs: { image: up.name } },
  1: { class_type: 'FluxProFillNode', inputs: { image: ['3', 0], mask: ['3', 1], prompt: readFileSync(fp, 'utf8').trim(), prompt_upsampling: false, guidance: 60, steps: 50, seed } },
  2: { class_type: 'SaveImage', inputs: { images: ['1', 0], filename_prefix: 'feudi' } },
};
const res = await fetch(`${COMFY}/api/prompt`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, extra_data: { api_key_comfy_org: KEY } }) });
const j = await res.json().catch(() => null);
if (res.status === 402) throw new Error('402: ' + JSON.stringify(j).slice(0, 600));
if (!res.ok || !j?.prompt_id) throw new Error(`non partito (${res.status}): ${JSON.stringify(j?.error ?? j?.node_errors ?? {}).slice(0, 500)}`);
const id = j.prompt_id; console.log('partito, seed', seed);
const t0 = Date.now();
for (;;) {
  await new Promise((r) => setTimeout(r, 4000));
  const st = await fetch(`${COMFY}/api/job/${id}/status`, { headers: H }).then((r) => r.json()).catch(() => null);
  if (['error', 'non_retryable_error', 'lost', 'cancelled'].includes(st?.status)) throw new Error('fallita: ' + st.status);
  if (st?.status === 'success') break;
  if (Date.now() - t0 > 300000) throw new Error('troppo lunga, controllare il lavoro ' + id);
}
const job = await fetch(`${COMFY}/api/jobs/${id}`, { headers: H }).then((r) => r.json());
const out = job?.outputs?.['2']?.images?.[0];
if (!out?.filename) throw new Error('risultato mancante');
const v = await fetch(`${COMFY}/api/view?${new URLSearchParams({ filename: out.filename, subfolder: out.subfolder || '', type: 'output' })}`, { headers: H, redirect: 'manual' });
const file = await fetch(v.headers.get('location')).then((r) => r.arrayBuffer());
writeFileSync(usc, Buffer.from(file));
console.log('fatta in', Math.round((Date.now() - t0) / 1000), 's', usc);
