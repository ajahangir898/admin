import path from 'path';
import { defineConfig, loadEnv, splitVendorChunkPlugin, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const toPosixPath = (id: string) => id.split('\\').join('/');

// Critical chunks that should be modulepreloaded (must match vendorChunkMatchers names)
const CRITICAL_JS_CHUNKS = ['react-dom', 'react-core', 'scheduler', 'index-'];

// Critical CSS patterns for preloading (ordered by priority)
const CRITICAL_CSS_PATTERNS = [
  { pattern: 'index-', priority: 1 },    // Main CSS bundle - highest priority
  { pattern: 'skeleton', priority: 2 }   // Skeleton loaders CSS
];

/**
 * Vite plugin to optimize critical request chains by:
 * 1. Injecting preload hints for CSS and JS
 * 2. Converting main CSS to non-render-blocking using media="print" pattern
 * This reduces unused CSS impact by deferring non-critical CSS loading
 */
function criticalPreloadPlugin(): Plugin {
  return {
    name: 'critical-preload',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      // Only process in build mode
      if (!ctx.bundle) return html;

      // Collect CSS files and JS modulepreloads
      const cssFiles: Array<{ fileName: string; priority: number }> = [];
      const modulepreloadLinks: string[] = [];

      // Find critical assets from the bundle
      for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
        // Collect main CSS files
        if (fileName.endsWith('.css')) {
          const matchedPattern = CRITICAL_CSS_PATTERNS.find(p => fileName.includes(p.pattern));
          if (matchedPattern) {
            cssFiles.push({
              fileName,
              priority: matchedPattern.priority
            });
          }
        }
        
        // Modulepreload critical JS chunks
        if (fileName.endsWith('.js') && 'code' in chunk) {
          if (CRITICAL_JS_CHUNKS.some(name => fileName.includes(name))) {
            modulepreloadLinks.push(`<link rel="modulepreload" href="/${fileName}" />`);
          }
        }
      }

      // Sort CSS files by priority
      cssFiles.sort((a, b) => a.priority - b.priority);

      // Create preload hints for CSS with crossorigin for subdomain support
      const cssPreloads = cssFiles.map(({ fileName }) => 
        `<link rel="preload" href="/${fileName}" as="style" crossorigin />`
      ).join('\n    ');

      const allPreloads = [cssPreloads, ...modulepreloadLinks].filter(Boolean).join('\n    ');
      
      if (allPreloads) {
        html = html.replace(
          /<head>/i,
          `<head>\n    <!-- Critical resource preloads to reduce request chain latency -->\n    ${allPreloads}`
        );
      }

      // Convert CSS stylesheet links to non-render-blocking using media="print" pattern
      // This defers CSS loading without blocking first paint
      for (const { fileName } of cssFiles) {
        const escapedFileName = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const cssLinkRegex = new RegExp(
          `<link[^>]*href="[^"]*${escapedFileName}"[^>]*rel="stylesheet"[^>]*>|` +
          `<link[^>]*rel="stylesheet"[^>]*href="[^"]*${escapedFileName}"[^>]*>`,
          'gi'
        );
        
        html = html.replace(cssLinkRegex, (match) => {
          // Skip if already has media attribute or onload
          if (match.includes('media=') || match.includes('onload=')) {
            return match;
          }
          // Convert to non-render-blocking CSS using media="print" pattern
          // This loads CSS asynchronously and switches to media="all" when loaded
          const deferredCss = match
            .replace('rel="stylesheet"', 'rel="stylesheet" media="print" onload="this.media=\'all\'"');
          // Add noscript fallback for users without JavaScript
          const noscriptFallback = `<noscript>${match}</noscript>`;
          return `${deferredCss}\n    ${noscriptFallback}`;
        });
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
          clientFiles: [
            './App.tsx', 
            './entry-client.tsx', 
            './components/SkeletonLoaders.tsx', 
            './pages/StoreHome.tsx',
            './components/store/CategoriesSection.tsx',
            './components/store/HeroSection.tsx'
          ]
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
          target: 'esnext',
          treeShaking: true
        }
      },
      ssr: {
        noExternal: ['react-hot-toast', 'react-loading-skeleton', 'lucide-react']
      },
      esbuild: {
        target: 'esnext',
        logOverride: { 'this-is-undefined-in-esm': 'silent' },
        treeShaking: true,
        legalComments: 'none',
        drop: mode === 'production' ? ['console', 'debugger'] : []
      },
      plugins: [
        react(),
        splitVendorChunkPlugin(),
        criticalPreloadPlugin()
      ],
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
        target: 'esnext',
        chunkSizeWarningLimit: 150,
        outDir: isSsrBuild ? 'dist/server' : 'dist/client',
        // Enable CSS code splitting for better caching
        cssCodeSplit: true,
        // Minify CSS in production builds
        cssMinify: mode === 'production' ? 'lightningcss' : false,
        // Minify for better performance
        minify: mode === 'production' ? 'esbuild' : false,
        // Faster builds
        sourcemap: false,
        // Remove unused code
        reportCompressedSize: false,
        rollupOptions: {
          input: isSsrBuild ? './entry-server.tsx' : './index.html',
          output: {
            manualChunks: isSsrBuild ? undefined : (id) => manualChunkResolver(id),
            // Ensure consistent chunk naming for better caching
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
            // Compact output
            compact: true
          },
          treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false
          }
        }
      }
    };
});
