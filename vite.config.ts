import path from 'path';
import { defineConfig, loadEnv, splitVendorChunkPlugin, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const toPosixPath = (id: string) => id.split('\\').join('/');

/**
 * Vite plugin to optimize critical request chains by injecting preload hints
 * This reduces the maximum critical path latency by loading CSS and JS in parallel
 */
function criticalPreloadPlugin(): Plugin {
  return {
    name: 'critical-preload',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      // Only process in build mode
      if (!ctx.bundle) return html;

      const preloadLinks: string[] = [];
      const modulepreloadLinks: string[] = [];

      // Find critical assets from the bundle
      for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
        // Preload main CSS files (critical for LCP)
        if (fileName.endsWith('.css')) {
          // Prioritize main index CSS and skeleton loader CSS
          if (fileName.includes('index-') || fileName.includes('skeleton')) {
            preloadLinks.unshift(`<link rel="preload" href="/${fileName}" as="style" />`);
          }
        }
        
        // Modulepreload critical JS chunks (react-dom, react-core, main index)
        if (fileName.endsWith('.js') && 'code' in chunk) {
          const criticalChunks = ['react-dom', 'react-core', 'scheduler', 'index-'];
          if (criticalChunks.some(name => fileName.includes(name))) {
            modulepreloadLinks.push(`<link rel="modulepreload" href="/${fileName}" />`);
          }
        }
      }

      // Inject preload hints right after the opening head tag
      const allPreloads = [...preloadLinks, ...modulepreloadLinks].join('\n    ');
      
      if (allPreloads) {
        // Insert preload links after <head> but before other elements
        return html.replace(
          /<head>/,
          `<head>\n    <!-- Critical resource preloads to reduce request chain latency -->\n    ${allPreloads}`
        );
      }

      return html;
    }
  };
}

const vendorChunkMatchers = [
  { name: 'react-dom', matcher: /node_modules\/react-dom\// },
  { name: 'react-jsx-runtime', matcher: /node_modules\/react\/jsx-runtime/ },
  { name: 'react-core', matcher: /node_modules\/react\// },
  { name: 'scheduler', matcher: /node_modules\/scheduler\// },
  { name: 'icons-chunk', matcher: /node_modules\/lucide-react\// }
];

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

  // Separate heavy store modals into their own chunks
  if (normalized.includes('/components/store/')) {
    const segment = normalized.split('/components/store/')[1];
    if (segment) {
      const componentName = segment.split('/')[0].replace(/\.(tsx|ts|jsx|js)$/, '').toLowerCase();
      return `store-modal-${componentName}`;
    }
  }

  return undefined;
};

export default defineConfig(({ mode, isSsrBuild }) => {
    const env = loadEnv(mode, '.', '');
    return {
      publicDir: 'public',
      server: {
        port: 3000,
        host: '0.0.0.0',
        warmup: {
          clientFiles: ['./App.tsx', './entry-client.tsx', './components/SkeletonLoaders.tsx', './pages/StoreHome.tsx']
        }
      },
      optimizeDeps: {
        include: [
          'react', 
          'react-dom', 
          'react-dom/client',
          'lucide-react',
          'react-hot-toast',
          'react-loading-skeleton',
          'socket.io-client'
        ],
        holdUntilCrawlEnd: false,
        esbuildOptions: {
          target: 'es2020'
        }
      },
      ssr: {
        noExternal: ['react-hot-toast', 'react-loading-skeleton', 'lucide-react']
      },
      esbuild: {
        target: 'es2020',
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
      },
      plugins: [react(), splitVendorChunkPlugin(), criticalPreloadPlugin()],
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
        target: 'es2020',
        chunkSizeWarningLimit: 200,
        outDir: isSsrBuild ? 'dist/server' : 'dist/client',
        // Enable CSS code splitting for better caching
        cssCodeSplit: true,
        // Minify CSS for smaller bundle size
        cssMinify: true,
        rollupOptions: {
          input: isSsrBuild ? './entry-server.tsx' : './index.html',
          output: {
            manualChunks: isSsrBuild ? undefined : (id) => manualChunkResolver(id),
            // Ensure consistent chunk naming for better caching
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          }
        }
      }
    };
});
