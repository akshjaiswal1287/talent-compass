import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: [
      '@midnight-ntwrk/compact-js',
    ],
    alias: {
      buffer: fileURLToPath(
        new URL('./src/lib/midnight/shims/buffer-browser.js', import.meta.url),
      ),
      'object-inspect': fileURLToPath(
        new URL('./src/lib/midnight/shims/object-inspect-browser.js', import.meta.url),
      ),
      'cross-fetch': fileURLToPath(
        new URL('./src/lib/midnight/shims/cross-fetch-browser.js', import.meta.url),
      ),
      'graphql-tag': fileURLToPath(
        new URL('./node_modules/graphql-tag/lib/index.js', import.meta.url),
      ),
      'graphql-ws': fileURLToPath(
        new URL('./node_modules/graphql-ws/dist/client.js', import.meta.url),
      ),
      'isomorphic-ws': fileURLToPath(
        new URL('./src/lib/midnight/shims/isomorphic-ws-browser.js', import.meta.url),
      ),
      '@midnight-ntwrk/ledger-v8': fileURLToPath(
        new URL('./src/lib/midnight/wasm/ledger-v8-browser.js', import.meta.url),
      ),
      '@midnight-ntwrk/onchain-runtime-v3': fileURLToPath(
        new URL('./src/lib/midnight/wasm/onchain-runtime-v3-browser.js', import.meta.url),
      ),
    },
  },
  optimizeDeps: {
    include: [
      'base64-js',
      'ieee754',
    ],
    exclude: [
      '@midnight-ntwrk/compact-js',
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/dapp-connector-api',
      '@midnight-ntwrk/ledger-v8',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
      '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
      '@midnight-ntwrk/midnight-js-network-id',
      '@midnight-ntwrk/onchain-runtime-v3',
    ],
    needsInterop: [
      'base64-js',
      'ieee754',
    ],
  },
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  preview: {
    port: 5175,
    strictPort: true,
  },
  build: {
    target: 'esnext',
  },
})
