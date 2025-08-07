import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
require('ts-node/register');
const { default: nameBundle } = await import('./vite-plugin-name-bundle.ts');

const SOURCE = 'public/full-icon.png';
const OUT_DIR = 'public';
const ICONS = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateIcons() {
  try {
    await fs.access(SOURCE);
  } catch {
    console.warn(`⚠️ Icon generation skipped: '${SOURCE}' not found`);
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const { name, size } of ICONS) {
    const dest = path.join(OUT_DIR, name);
    await sharp(SOURCE).resize(size, size).toFile(dest);
    console.log(`✅ Generated ${name}`);
  }

  // Use 48x48 PNG as favicon.ico (safe & browser compatible)
  const faviconPath = path.join(OUT_DIR, 'favicon.ico');
  await sharp(SOURCE)
    .resize(48, 48)
    .toFile(faviconPath);
  console.log('✅ Generated favicon.ico');
}

export default defineConfig(({ base = '/' }) => ({
  base,
  plugins: [
    react(),
    nameBundle(),

    {
      name: 'generate-icons',
      apply: 'build',
      async buildStart() {
        console.log('🔧 Generating icons...');
        await generateIcons();
      },
    },

    VitePWA({
      filename: 'manifest.webmanifest',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      injectManifest: false,
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png',
      ],
      manifest: {
        name: 'OpenRoll',
        short_name: 'OpenRoll',
        start_url: base,
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#222222',
        icons: [
          {
            src: `${base}icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: `${base}icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: `${base}apple-touch-icon.png`,
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
    }),

    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
  },
}));
