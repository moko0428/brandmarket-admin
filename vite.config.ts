import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    !isDev &&
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.svg',
          'brand_market_192x192.png',
          'brand_market_512x512.png',
        ],
        manifest: {
          name: 'brandmarket-admin',
          short_name: 'bm-admin',
          start_url: '.',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#317EFB',
          icons: [
            {
              src: 'brand_market_192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'brand_market_512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
  ],
});
