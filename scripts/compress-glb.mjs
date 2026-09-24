#!/usr/bin/env node
/**
 * Kompres GLB besar di mesin lokal (RAM bebas, tak terikat browser/VPS).
 * Pakai:  node scripts/compress-glb.mjs model.glb [out.glb]
 * Hasil:  file <nama>.compressed.glb (Draco + texture resize 2048)
 * Setelah kompres, upload hasil itu lewat /admin di panel admin.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { basename } from "node:path";
import { WebIO } from "@gltf-transform/core";
import { dedup, draco, prune, quantize, weld, resize } from "@gltf-transform/functions";

const input = process.argv[2];
if (!input || !existsSync(input)) {
  console.error("Pakai: node scripts/compress-glb.mjs <input.glb> [output.glb]");
  process.exit(1);
}

const t0 = Date.now();
const io = new WebIO();
const doc = await io.readBinary(readFileSync(input));

console.log("Membaca selesai. Jalankan: dedup -> prune -> weld -> resize(2048) -> quantize -> draco");
await doc.transform(dedup());
console.log("dedup done", ((Date.now() - t0) / 1000).toFixed(1), "s");
await doc.transform(prune());
await doc.transform(weld());
console.log("weld done", ((Date.now() - t0) / 1000).toFixed(1), "s");
await doc.transform(resize({ width: 2048, height: 2048 }));
console.log("resize done", ((Date.now() - t0) / 1000).toFixed(1), "s");
await doc.transform(quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
await doc.transform(draco());
console.log("draco done", ((Date.now() - t0) / 1000).toFixed(1), "s");

const out = await io.writeBinary(doc);
const output = process.argv[3] || input.replace(/\.glb$/i, "") + ".compressed.glb";
writeFileSync(output, out);

const mb = (n) => (n / 1048576).toFixed(1);
console.log(
  `Selesai: ${basename(input)} (${mb(readFileSync(input).length)} MB) -> ${basename(output)} (${mb(out.byteLength)} MB) dalam ${((Date.now() - t0) / 1000).toFixed(0)}s`
);
