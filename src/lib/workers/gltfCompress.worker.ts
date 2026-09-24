import { compressGlbBuffer, toCompressedFile } from "../compressGlb";

export interface CompressRequest {
  type: "compress";
  file: File;
}

export interface CompressResult {
  type: "result";
  compressedFile: File;
  ratio: number; // 0-100%
}

export interface CompressError {
  type: "error";
  message: string;
}

self.onmessage = async (e: MessageEvent<CompressRequest>) => {
  try {
    const { file } = e.data;
    const inputBuf = await file.arrayBuffer();
    const compressedBuf = await compressGlbBuffer(inputBuf);
    const ratio = Math.round(
      (1 - compressedBuf.byteLength / inputBuf.byteLength) * 100
    );
    const compressedFile = toCompressedFile(file, compressedBuf);
    self.postMessage({ type: "result", compressedFile, ratio } satisfies CompressResult);
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : "Compression failed",
    } satisfies CompressError);
  }
};
