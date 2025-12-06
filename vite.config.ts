import path from 'path';
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite';
import type { PluginOption, PreviewServer, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { createTenantApiMiddleware } from './server/tenantsApi';

const toPosixPath = (id: string) => id.split('\\').join('/');

const vendorChunkMatchers = [
  { name: 'react-dom', matcher: /node_modules\/react-dom\// },
  { name: 'react-jsx-runtime', matcher: /node_modules\/react\/jsx-runtime/ },
  { name: 'react-core', matcher: /node_modules\/react\// },
  { name: 'scheduler', matcher: /node_modules\/scheduler\// },
  { name: 'icons-chunk', matcher: /node_modules\/lucide-react\// },
  { name: 'loading-indicators', matcher: /node_modules\/react-loading-indicators\// }
];

const resolveFirebaseChunk = (normalized: string) => {
  if (normalized.includes('node_modules/firebase/')) {
    const pkg = normalized.split('node_modules/firebase/')[1]?.split('/')?.[0];
    if (pkg) return `firebase-${pkg}`;
  }
  if (normalized.includes('node_modules/@firebase/')) {
    const pkg = normalized.split('node_modules/@firebase/')[1]?.split('/')?.[0];
    if (pkg) return `firebase-${pkg}`;
  }
  return undefined;
};

const resolveRechartsChunk = (normalized: string) => {
  if (!normalized.includes('node_modules/recharts/')) return undefined;
  const segment = normalized.split('node_modules/recharts/')[1];
  if (!segment) return 'recharts';
  const folder = segment.split('/')[0].replace(/\W+/g, '-');
  return `recharts-${folder || 'core'}`;
};

const manualChunkResolver = (id: string): string | undefined => {
  const normalized = toPosixPath(id);

  if (normalized.includes('node_modules')) {
    const firebaseChunk = resolveFirebaseChunk(normalized);
    if (firebaseChunk) return firebaseChunk;
    const rechartsChunk = resolveRechartsChunk(normalized);
    if (rechartsChunk) return rechartsChunk;

    const vendorMatch = vendorChunkMatchers.find(({ matcher }) => matcher.test(normalized));
    if (vendorMatch) return vendorMatch.name;

    const pkgName = normalized.match(/node_modules\/([^/]+)/)?.[1];
    if (pkgName?.startsWith('@')) {
      const scoped = normalized.match(/node_modules\/(@[^/]+\/[^/]+)/)?.[1];
      if (scoped) return `pkg-${scoped.replace(/[\/]/g, '-')}`;
    }
    if (pkgName) return `pkg-${pkgName}`;
    return 'vendor';
  }

  if (normalized.includes('/pages/')) {
    const segment = normalized.split('/pages/')[1];
    if (segment) {
      const pageName = segment.split('/')[0].replace(/\W+/g, '-').toLowerCase();
      return `page-${pageName}`;
    }
  }

  if (normalized.includes('/components/')) {
    const componentSegment = normalized.split('/components/')[1];
    if (componentSegment) {
      const componentName = componentSegment.split('/')[0].replace(/\W+/g, '-').toLowerCase();
      return `cmp-${componentName}`;
    }
  }

  return undefined;
};

const tenantApiPlugin = (): PluginOption => ({
  name: 'tenant-api-mock',
  configureServer(server: ViteDevServer) {
    server.middlewares.use(createTenantApiMiddleware());
  },
  configurePreviewServer(server: PreviewServer) {
    server.middlewares.use(createTenantApiMiddleware());
  }
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tenantApiPlugin(), splitVendorChunkPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './setupTests.ts',
        css: true
      },
      build: {
        chunkSizeWarningLimit: 200,
        rollupOptions: {
          output: {
            manualChunks(id) {
              return manualChunkResolver(id);
            }
          }
        }
      }
    };
});
