import path from 'path';
import { defineConfig, loadEnv, splitVendorChunkPlugin, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const toPosixPath = (id: string) => id.split('\\').join('/');

// Critical chunks that should be modulepreloaded for parallel loading
// Priority order matters - these will load in parallel instead of sequentially
// Keep this list MINIMAL - only truly critical above-the-fold chunks
const CRITICAL_JS_CHUNKS = [
  // Core React chunks - required for any rendering
  'react-dom',
  'react-core', 
  'scheduler',
  'react-jsx-runtime',
  // App entry chunks
  'index-',
  // Store page critical path - ONLY above-the-fold
  'page-storehome',
  'store-herosection',
  'cmp-storeheader'
  // Note: icons-chunk, categoriessection, productgrid deferred to reduce initial load
];

// Critical CSS patterns for preloading (ordered by priority)
const CRITICAL_CSS_PATTERNS = [
  { pattern: 'index-', priority: 1 }    // Main CSS bundle - highest priority
];

/**
 * Vite plugin to optimize critical request chains by:
 * 1. Injecting modulepreload hints for parallel JS loading
 * 2. Preloading CSS for faster styling
 * 3. Converting non-critical CSS to non-render-blocking
 * This dramatically reduces sequential loading waterfall
 */
function criticalPreloadPlugin(): Plugin {
  let resolvedBase = '/';

  return {
    name: 'critical-preload',
    enforce: 'post',
    configResolved(config) {
      const base = config.base || '/';
      resolvedBase = base.endsWith('/') ? base : `${base}/`;
    },
    transformIndexHtml(html, ctx) {
      // Only process in build mode
      if (!ctx.bundle) return html;

      // Collect CSS files and JS modulepreloads
      const cssFiles: Array<{ fileName: string; priority: number }> = [];
      const modulepreloadLinks: string[] = [];
      const allJsChunks: string[] = [];

      // Find critical assets from the bundle
      for (const [fileName, chunk] of Object.entries(ctx.bundle) as [string, { type: string; code?: string }][]) {
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
        
        // Modulepreload critical JS chunks for parallel loading
        if (fileName.endsWith('.js') && 'code' in chunk) {
          allJsChunks.push(fileName);
          if (CRITICAL_JS_CHUNKS.some(name => fileName.includes(name))) {
            // Add fetchpriority="high" for critical chunks
            modulepreloadLinks.push(`<link rel="modulepreload" href="${resolvedBase}${fileName}" fetchpriority="high" crossorigin />`);
          }
        }
      }

      // Sort CSS files by priority
      cssFiles.sort((a, b) => a.priority - b.priority);

      // Create preload hints for CSS with crossorigin for subdomain support
      const cssPreloads = cssFiles.map(({ fileName }) => 
        `<link rel="preload" href="${resolvedBase}${fileName}" as="style" fetchpriority="high" crossorigin />`
      ).join('\n    ');

      const allPreloads = [cssPreloads, ...modulepreloadLinks].filter(Boolean).join('\n    ');
      
      if (allPreloads) {
        html = html.replace(
          /<head>/i,
          `<head>\n    <!-- Critical resource preloads for parallel loading -->\n    ${allPreloads}`
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
  // Split heavy dependencies into separate chunks for better caching
  { name: 'pkg-toast', matcher: /node_modules\/react-hot-toast\// },
  { name: 'pkg-socket', matcher: /node_modules\/socket\.io/ },
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
      // Force ImageSearch into its own chunk with explicit name
      if (pageName === 'imagesearch-tsx' || pageName === 'imagesearch') {
        return 'page-visual-search';
      }
      return `page-${pageName}`;
    }
  }

  // Visual search service should be in the same chunk as ImageSearch
  if (normalized.includes('/services/visualSearchService')) {
    return 'page-visual-search';
  }

  // Store components - split into individual chunks for parallel loading
  if (normalized.includes('/components/store/')) {
    const segment = normalized.split('/components/store/')[1];
    if (segment) {
      const componentName = segment.split('/')[0].replace(/\.(tsx|ts|jsx|js)$/, '').toLowerCase();
      return `store-${componentName}`;
    }
  }

  // SuperAdmin tab components - split each into its own chunk for optimal lazy loading
  // IMPORTANT: Keep this list synchronized with components/superadmin/*Tab.tsx files
  // The lowercase names below match the actual component file names (e.g., OverviewTab.tsx → 'overviewtab')
  if (normalized.includes('/components/superadmin/')) {
    const segment = normalized.split('/components/superadmin/')[1];
    if (segment) {
      const fileName = segment.split('/')[0];
      const componentName = fileName.replace(/\.(tsx|ts|jsx|js)$/, '').toLowerCase();
      
      // Tab components get individual chunks (each 8-22KB, loaded on-demand)
      const tabComponents = [
        'overviewtab', 'settingstab', 'notificationstab', 'themeconfigtab',
        'chatconfigtab', 'subscriptionstab', 'bulkannouncementstab',
        'supportticketstab', 'merchantsuccesstab'
      ];
      
      if (tabComponents.includes(componentName)) {
        return `superadmin-${componentName}`;
      }
      
      // Core UI components bundled together (Sidebar, TopBar - loaded immediately with dashboard, ~9KB)
      // NavItem, StatsCard, etc. are small utility components used by Sidebar/TopBar
      if (['sidebar', 'topbar', 'navitem', 'statscard', 'servermetric', 'quickactionbutton'].includes(componentName)) {
        return 'superadmin-ui';
      }
      
      // Types and utilities (~500 bytes)
      if (componentName === 'types' || componentName === 'utils' || componentName === 'index') {
        return 'superadmin-core';
      }
      
      // Other superadmin components
      return `superadmin-${componentName}`;
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

export default defineConfig(({ mode, isSsrBuild }) => {
    const env = loadEnv(mode, '.', '');
    
    // CDN configuration for build assets
    // When VITE_CDN_ENABLED is true and VITE_CDN_STATIC_URL is set, use it as base URL for assets
    const cdnEnabled = env.VITE_CDN_ENABLED === 'true';
    const cdnStaticUrl = env.VITE_CDN_STATIC_URL || env.VITE_CDN_BASE_URL || '';
    const normalizeBase = (value: string) => {
      if (!value || value === '/') return '/';
      return value.endsWith('/') ? value : `${value}/`;
    };
    const baseUrl = (mode === 'production' && cdnEnabled && cdnStaticUrl) ? normalizeBase(cdnStaticUrl) : '/';
    
    return {
      // Set base URL for all assets (CDN in production if configured)
      base: baseUrl,
      publicDir: 'public',
      // Treat manifest.json as static asset to prevent JSON parsing issues
      assetsInclude: ['**/*.json'],
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: ['.systemnextit.com', 'systemnextit.com', 'localhost', '.localhost'],
        warmup: {
          clientFiles: [
            './App.tsx', 
            './entry-client.tsx', 
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
          'socket.io-client'
        ],
        holdUntilCrawlEnd: false,
        esbuildOptions: {
          target: 'esnext',
          treeShaking: true
        }
      },
      ssr: {
        noExternal: ['react-hot-toast', 'lucide-react']
      },
      esbuild: {
        target: 'esnext',
        logOverride: { 'this-is-undefined-in-esm': 'silent' },
        treeShaking: true,
        legalComments: 'none',
        drop: mode === 'production' ? ['debugger'] : [] // Temporarily keep console.log for debugging
      },
      plugins: [
        react(),
        splitVendorChunkPlugin(),
        criticalPreloadPlugin()
      ],
      // Handle JSON files explicitly
      json: {
        namedExports: true,
        stringify: false
      },
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
        cssMinify: mode === 'production',
        // Minify for better performance
        minify: mode === 'production' ? 'esbuild' : false,
        // Faster builds
        sourcemap: false,
        // Remove unused code
        reportCompressedSize: false,
        // Optimize assets
        assetsInlineLimit: 4096, // Inline assets < 4KB
        rollupOptions: {
          input: isSsrBuild ? './entry-server.tsx' : './index.html',
          output: {
            manualChunks: isSsrBuild ? undefined : (id) => manualChunkResolver(id),
            // Ensure consistent chunk naming for better caching
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
            // Compact output
            compact: true,
            // Hoist transitive imports for better parallelization
            hoistTransitiveImports: true
          },
          treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
            // More aggressive tree shaking
            preset: 'smallest'
          }
        }
      }
    };
});
