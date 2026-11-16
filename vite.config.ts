import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

function disableViteHmrClientWs(): Plugin {
  return {
    name: 'disable-vite-hmr-client-ws',
    apply: 'serve',
    enforce: 'post',
    transform(code, id) {
      const cleanId = id.split('?')[0].replace(/\\/g, '/');
      if (cleanId.endsWith('/vite/dist/client/client.mjs')) {
        return code
          .replace(
            'transport.connect(createHMRHandler(handleMessage));',
            '/* HMR WebSocket disabled */',
          )
          .replace(
            'setupForwardConsoleHandler(transport, forwardConsole);',
            '/* Console forwarding disabled */',
          );
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), disableViteHmrClientWs()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Split large dependencies into separate chunks so every file stays
          // under Bonto's 1MB per-file upload limit.
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('@firebase') || id.includes('/firebase/')) return 'chunk-firebase';
            if (id.includes('@google') || id.includes('/genai/')) return 'chunk-genai';
            if (id.includes('/react') || id.includes('scheduler') || id.includes('react-dom')) return 'chunk-react';
            return 'chunk-vendor';
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: false as const,
      ws: false as const,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
