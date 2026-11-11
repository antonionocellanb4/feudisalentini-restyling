// uso: node tools/cdp.mjs <url> <out-prefix> <w> <h> <steps.json>  steps: [{js:"..."}|{jsfile:"path"}|{move:[x,y]}|{hover:"css"}|{wheel:deltaY,n:ripetizioni,gap:ms}|{click:[x,y]}|{drag:[[x,y],...],gap:ms}|{wait:ms}|{shot:"nome"}] -> <out-prefix>-<nome>.jpg ; env TOUCH=1 = telefono touch, SCROLLBARS=1 = barre di scorrimento visibili (come Chrome su Windows), LOADWAIT=ms attesa iniziale, REDUCE=1 = prefers-reduced-motion
import { spawn } from "node:child_process";
import { writeFileSync, readFileSync, existsSync, mkdtempSync } from "node:fs";
const [url, out, w, h, stepsFile] = process.argv.slice(2);
const steps = JSON.parse(readFileSync(stepsFile, "utf8"));
// un Chrome proprio per ogni esecuzione: porta scelta da Chrome (0) e profilo nuovo, così più test in parallelo
// non si collegano mai a un altro browser (né a quello dell'utente)
const prof = mkdtempSync(`${process.env.TEMP}/cdp-prof-`);
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${prof}`, `--window-size=${w},${h}`, ...(process.env.SCROLLBARS ? [] : ["--hide-scrollbars"]), "about:blank"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let port; for (let i = 0; i < 80 && !port; i++) { if (existsSync(`${prof}/DevToolsActivePort`)) port = readFileSync(`${prof}/DevToolsActivePort`, "utf8").split("\n")[0].trim(); else await sleep(150); }
if (!port) { console.log("errors: chrome non partito"); chrome.kill(); process.exit(1); }
let list; for (let i = 0; i < 40; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (list.find((t) => t.type === "page")) break; } catch {} await sleep(250); }
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pend = {}; const logs = [];
ws.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; } if (d.method === "Runtime.exceptionThrown") logs.push(d.params.exceptionDetails.exception?.description); if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") logs.push(JSON.stringify(d.params.args.map(a=>a.value))); });
const send = (method, params = {}) => new Promise((r) => { pend[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: +w, height: +h, deviceScaleFactor: 1, mobile: +w < 600 });
if (process.env.TOUCH) {
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Emulation.setUserAgentOverride", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1", platform: "iPhone" });
}
const media = [...(process.env.TOUCH ? [{ name: "hover", value: "none" }, { name: "pointer", value: "coarse" }] : []), ...(process.env.REDUCE ? [{ name: "prefers-reduced-motion", value: "reduce" }] : [])];
if (media.length) await send("Emulation.setEmulatedMedia", { features: media });
await send("Page.navigate", { url }); await sleep(+(process.env.LOADWAIT ?? 2500));
for (const s of steps) {
  if (s.jsfile) s.js = readFileSync(s.jsfile, "utf8");
  if (s.js) { const r = await send("Runtime.evaluate", { expression: s.js, awaitPromise: true, returnByValue: true }); if (r.result?.result?.value !== undefined) console.log("js:", JSON.stringify(r.result.result.value)); }
  if (s.move) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: s.move[0], y: s.move[1] });
  if (s.hover) { const r = await send("Runtime.evaluate", { expression: `(()=>{const b=document.querySelector(${JSON.stringify(s.hover)}).getBoundingClientRect();return [b.left+b.width*${s.fx ?? 0.3},b.top+b.height/2]})()`, returnByValue: true }); const [x, y] = r.result.result.value; for (let k = 1; k <= 6; k++) { await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: x - 60 + k * 10, y }); await sleep(30); } }
  if (s.wheel) { for (let k = 0; k < (s.n ?? 1); k++) { await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: +w / 2, y: +h / 2, deltaX: 0, deltaY: s.wheel }); await sleep(s.gap ?? 60); } }
  if (s.click) await (async () => { for (const t of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type: t, x: s.click[0], y: s.click[1], button: "left", clickCount: 1 }); })();
  if (s.drag) { const P = s.drag; await send("Input.dispatchMouseEvent", { type: "mousePressed", x: P[0][0], y: P[0][1], button: "left", buttons: 1, clickCount: 1 }); for (const [x, y] of P.slice(1)) { await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "left", buttons: 1 }); await sleep(s.gap ?? 16); } const [x, y] = P[P.length - 1]; await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: 1 }); }
  if (s.wait) await sleep(s.wait);
  if (s.shot) { const r = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 }); writeFileSync(`${out}-${s.shot}.jpg`, Buffer.from(r.result.data, "base64")); }
}
console.log("errors:", logs.length ? logs : "none");
ws.close(); chrome.kill(); process.exit(0);
