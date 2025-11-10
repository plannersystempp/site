import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function run() {
  const svgPath = resolve('public/icons/plannersystem-logo.svg');
  const svg = await readFile(svgPath);

  const outputs = [
    { size: 192, out: resolve('public/android-chrome-192x192.png') },
    { size: 512, out: resolve('public/android-chrome-512x512.png') },
    { size: 192, out: resolve('public/icons/icon-192x192.png') },
    { size: 512, out: resolve('public/icons/icon-512x512.png') },
  ];

  for (const { size, out } of outputs) {
    await sharp(svg)
      .resize(size, size, { fit: 'cover' })
      .png({ quality: 100 })
      .toFile(out);
    console.log(`Generated ${out}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});