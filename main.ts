/**
 * news-image-20261119 MAIN entry.
 *
 * Takes the front-page image built for this competition (entry.png, sitting
 * next to this file), checks it is a well-formed 1024x1024 PNG under the
 * 1 MiB cap, and places a copy at $MAKEFUN_OUTPUT_DIR/entry.png
 * (default /output/entry.png). Node stdlib only; no network access.
 * The copy is byte-for-byte the input, so repeated runs agree exactly.
 */
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const SIZE_LIMIT = 1024 * 1024;
const WANT_W = 1024;
const WANT_H = 1024;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const inputPath = join(scriptDir, "entry.png");
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const outputPath = join(outputDir, "entry.png");

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function checkSize(data) {
  if (data.length > SIZE_LIMIT) {
    throw new Error(
      `entry.png is ${data.length} bytes, above the ${SIZE_LIMIT} byte cap`,
    );
  }
  if (data.length < 33) {
    throw new Error(
      `entry.png is ${data.length} bytes, too short to be a PNG`,
    );
  }
}

function checkSignature(data) {
  if (!data.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error("entry.png does not start with the PNG signature");
  }
}

function checkDimensions(data) {
  // A PNG begins with an 8-byte signature, then the IHDR chunk: a 4-byte
  // length, the letters IHDR, then width and height as 4-byte big-endian
  // ints.
  const firstChunk = data.toString("latin1", 12, 16);
  if (firstChunk !== "IHDR") {
    throw new Error(`first PNG chunk is ${firstChunk}, expected IHDR`);
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width !== WANT_W || height !== WANT_H) {
    throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
  }
  return { width, height };
}

function run() {
  const data = readFileSync(inputPath);
  checkSize(data);
  checkSignature(data);
  const { width, height } = checkDimensions(data);

  mkdirSync(outputDir, { recursive: true });
  copyFileSync(inputPath, outputPath);

  // The copy must hash identically to the input; anything else means the
  // write was interrupted or the filesystem mangled the bytes.
  const written = readFileSync(outputPath);
  if (sha256(written) !== sha256(data)) {
    throw new Error("output bytes differ from entry.png after copy");
  }
  console.log(
    `wrote ${outputPath} (${data.length} bytes, ${width}x${height}, ` +
      `sha256 ${sha256(data).slice(0, 12)})`,
  );
}

try {
  run();
} catch (err) {
  console.error(`main.ts: ${err.message}`);
  process.exitCode = 1;
}
