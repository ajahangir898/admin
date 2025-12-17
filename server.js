import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

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
    // Production: serve static files
    app.use(express.static(path.resolve(__dirname, 'dist/client'), {
      index: false,
      maxAge: '1y',
      immutable: true
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
      console.error(e.stack);
      next(e);
    }
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 SSR Server running at http://localhost:${port}`);
  });
}

createServer();
