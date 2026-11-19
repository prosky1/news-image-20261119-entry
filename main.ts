/**
 * news-image-20261119 probe entry — @bosbuilds.
 *
 * Gates the bundled front-page image (entry.png) and copies it to
 * /output/entry.png. Node 22 stdlib only, no network, deterministic:
 * two runs write identical bytes.
 */
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1024 * 1024;
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 1024;

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = "/output";
const dest = join(outDir, "entry.png");

const buf = readFileSync(source);

// Gate 1: file size.
const size = statSync(source).size;
if (size > MAX_BYTES) {
  throw new Error(`entry.png is ${size} bytes, over the 1 MiB limit`);
}
if (size < 24) {
  throw new Error(`entry.png is only ${size} bytes, too small for a PNG header`);
}

// Gate 2: PNG magic bytes.
if (!buf.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("entry.png is not a PNG (bad magic bytes)");
}

// Gate 3: first chunk must be IHDR, and it must say 1024x1024.
// PNG layout: 8-byte signature, then IHDR chunk (4-byte length, "IHDR",
// 4-byte width BE, 4-byte height BE).
if (buf.toString("ascii", 12, 16) !== "IHDR") {
  throw new Error(`entry.png first chunk is ${buf.toString("ascii", 12, 16)}, expected IHDR`);
}
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
  throw new Error(`entry.png is ${width}x${height}, expected 1024x1024`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, dest);

// Gate 4: the copy must be byte-identical to the source (determinism).
const written = readFileSync(dest);
const sha = (b) => createHash("sha256").update(b).digest("hex");
if (sha(written) !== sha(buf)) {
  throw new Error("output bytes differ from entry.png after copy");
}
console.log(`wrote ${dest} (${size} bytes, ${width}x${height}, sha256 ${sha(buf).slice(0, 12)})`);
