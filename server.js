import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

// Cache durations
const ONE_YEAR = 31536000; // 1 year in seconds
const ONE_DAY = 86400; // 1 day in seconds
const ONE_WEEK = 604800; // 1 week in seconds

// Set cache headers based on file type and whether it's hashed
const setCacheHeaders = (res, filePath) => {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);
  
  // Check if file is in assets directory (Vite output) or has a content hash
  // Vite adds 8-character hashes like: filename.abc12345.js
  const isInAssets = normalizedPath.includes('/assets/');
  const hasHash = /\.[a-f0-9]{8}\.(js|css|woff2?|ttf|eot)$/i.test(filename);
  
  if (isInAssets || hasHash) {
    // Hashed assets: immutable, long cache (1 year)
    res.setHeader('Cache-Control', `public, max-age=${ONE_YEAR}, immutable`);
  } else if (['.js', '.css'].includes(ext)) {
    // Unhashed JS/CSS: short cache with revalidation
    res.setHeader('Cache-Control', `public, max-age=${ONE_DAY}, stale-while-revalidate=${ONE_WEEK}`);
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'].includes(ext)) {
    // Images: moderate cache with revalidation
    res.setHeader('Cache-Control', `public, max-age=${ONE_WEEK}, stale-while-revalidate=${ONE_YEAR}`);
  } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
    // Unhashed fonts: moderate cache with revalidation
    res.setHeader('Cache-Control', `public, max-age=${ONE_WEEK}, stale-while-revalidate=${ONE_YEAR}`);
  } else if (['.json', '.xml', '.txt'].includes(ext)) {
    // Config/data files: short cache with revalidation
    res.setHeader('Cache-Control', `public, max-age=${ONE_DAY}, stale-while-revalidate=${ONE_WEEK}`);
  } else {
    // Default: moderate cache
    res.setHeader('Cache-Control', `public, max-age=${ONE_DAY}`);
  }
};

async function createServer() {
  const app = express();

  // Use compression for faster responses
  app.use(compression());

  let vite;
  if (!isProduction) {
    // Development: use Vite's dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files with optimized caching
    app.use(express.static(path.resolve(__dirname, 'dist/client'), {
      index: false,
      setHeaders: setCacheHeaders
    }));
  }

  // Handle all routes with SSR
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template;
      let render;

      if (!isProduction) {
        // Development: read and transform HTML on the fly
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/entry-server.tsx')).render;
      } else {
        // Production: use pre-built files
        template = fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8');
        render = (await import('./dist/server/entry-server.js')).render;
      }

      // Render the app to HTML
      const { html: appHtml } = render();

      // Inject the rendered HTML into the template
      const finalHtml = template.replace(
        /<div id="root">[\s\S]*?<\/div>/,
        `<div id="root">${appHtml}</div>`
      );

      // Send response with cache headers
      res.status(200)
        .set({
          'Content-Type': 'text/html',
          'Cache-Control': isProduction ? 'public, max-age=0, must-revalidate' : 'no-cache'
        })
        .end(finalHtml);
    } catch (e) {
      // In development, let Vite fix the stack trace
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error('SSR Error:', e.message);
      console.error(e.stack);
      // Don't crash the server, return error page
      res.status(500).send(`
        <!DOCTYPE html>
        <html><body>
          <h1>Server Error</h1>
          <pre>${e.message}</pre>
        </body></html>
      `);
    }
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 SSR Server running at http://localhost:${port}`);
  });
}

createServer();
