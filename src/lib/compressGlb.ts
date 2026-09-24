"use client";

import { Document, WebIO } from "@gltf-transform/core";
import { dedup, draco, prune, quantize } from "@gltf-transform/functions";

const MAX_TEXTURE_SIZE = 2048;
const JPEG_QUALITY = 0.8;

async function resizeTexturesIfNeeded(doc: Document) {
  // Only in browser with OffscreenCanvas/createImageBitmap
  if (typeof createImageBitmap === "undefined") return;
  const hasCanvas =
    typeof OffscreenCanvas !== "undefined" || typeof document !== "undefined";
  if (!hasCanvas) return;

  // Tekstur baseColor = lossy (JPEG aman). Normal/alpha map = harus lossless (PNG).
  const baseColorTextures = new Set(doc.getRoot().listMaterials().map((m) => m.getBaseColorTexture() ?? null));

  for (const tex of doc.getRoot().listTextures()) {
    const image = tex.getImage();
    const mime = tex.getMimeType();
    const isDiffuse = baseColorTextures.has(tex);
    // Lossy hanya untuk diffuse; yang lain resize tapi tetap lossless
    const outMime = isDiffuse ? "image/jpeg" : (mime.startsWith("image/png") ? "image/png" : "image/jpeg");
    if (!image || !mime) continue;

    let bitmap: ImageBitmap | null = null;
    try {
      const blob = new Blob([image as BlobPart], { type: mime });
      bitmap = await createImageBitmap(blob);
    } catch {
      continue;
    }
    if (!bitmap) continue;

    if (bitmap.width <= MAX_TEXTURE_SIZE && bitmap.height <= MAX_TEXTURE_SIZE) {
      bitmap.close();
      continue;
    }

    const scale = Math.min(MAX_TEXTURE_SIZE / bitmap.width, MAX_TEXTURE_SIZE / bitmap.height);
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    try {
      let outBlob: Blob;
      if (typeof OffscreenCanvas !== "undefined") {
        const canvas = new OffscreenCanvas(w, h);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          bitmap.close();
          continue;
        }
        ctx.drawImage(bitmap, 0, 0, w, h);
        outBlob = await canvas.convertToBlob({ type: "image/jpeg", quality: JPEG_QUALITY });
      } else {
        // fallback via DOM canvas
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          bitmap.close();
          continue;
        }
        ctx.drawImage(bitmap, 0, 0, w, h);
        outBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
            "image/jpeg",
            JPEG_QUALITY
          );
        });
      }
      const buf = await outBlob.arrayBuffer();
      tex.setImage(new Uint8Array(buf));
      tex.setMimeType("image/jpeg");
    } catch {
      // keep original on failure
    } finally {
      bitmap.close();
    }
  }
}

/**
 * Compress GLB ArrayBuffer via glTF-Transform.
 * Pipeline: dedup -> prune -> resize textures -> quantize -> draco
 * Returns compressed buffer. Falls back to draco-less if draco encoder unavailable.
 */
export async function compressGlbBuffer(input: ArrayBuffer): Promise<ArrayBuffer> {
  const io = new WebIO();
  const doc = await io.readBinary(new Uint8Array(input));

  // Texture resize before quantize/draco (operates on images)
  await resizeTexturesIfNeeded(doc);

  // Core mesh/material transforms
  // ponytail: weld() dihapus — terlalu lambat untuk mesh besar di browser.
  // Upgrade: jalankan weld via CLI @gltf-transform/offline bila kompresi butuh hasil lebih kecil.
  await doc.transform(dedup(), prune());

  // Quantize reduces precision before draco
  await doc.transform(quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));

  // Draco last; if it fails (encoder missing), keep quantize result
  try {
    await doc.transform(draco());
  } catch (e) {
    console.warn("[compressGlb] draco skipped:", e);
  }

  const out = await io.writeBinary(doc);
  // out is Uint8Array; return detached ArrayBuffer slice
  return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
}

export function toCompressedFile(original: File, compressedBuf: ArrayBuffer): File {
  const name = original.name.replace(/\.glb$/i, "") + ".glb";
  return new File([compressedBuf], name, { type: "model/gltf-binary" });
}
