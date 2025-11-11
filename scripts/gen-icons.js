import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function run() {
  const svgPath = resolve('public/icons/plannersystem-logo.svg');
  const svg = await readFile(svgPath);

  // Ícones padrão (any)
  const outputsAny = [
    { size: 192, out: resolve('public/android-chrome-192x192.png') },
    { size: 512, out: resolve('public/android-chrome-512x512.png') },
    { size: 192, out: resolve('public/icons/icon-192x192.png') },
    { size: 512, out: resolve('public/icons/icon-512x512.png') },
    { size: 180, out: resolve('public/apple-touch-icon.png') },
    { size: 32, out: resolve('public/favicon-32x32.png') },
    { size: 16, out: resolve('public/favicon-16x16.png') },
  ];

  for (const { size, out } of outputsAny) {
    await sharp(svg)
      .resize(size, size, { fit: 'cover' })
      .png({ quality: 100 })
      .toFile(out);
    console.log(`Generated ${out}`);
  }

  // Ícones maskable com zona segura (padding ~10%)
  const maskableOutputs = [
    { size: 192, out: resolve('public/icons/maskable-icon-192x192.png') },
    { size: 512, out: resolve('public/icons/maskable-icon-512x512.png') },
  ];

  for (const { size, out } of maskableOutputs) {
    const pad = Math.round(size * 0.1);
    const inner = size - pad * 2;
    await sharp(svg)
      .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ quality: 100 })
      .toFile(out);
    console.log(`Generated ${out}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});