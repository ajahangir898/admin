import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { env } from './config/env.js';
import { disconnectMongo } from './db/mongo.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { tenantsRouter } from './routes/tenants.js';
import { ensureTenantIndexes } from './services/tenantsService.js';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || !env.allowedOrigins.length || env.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '500kb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ name: 'seven-days-backend', version: '0.1.0' });
});

app.use('/health', healthRouter);
app.use('/api/tenants', tenantsRouter);

app.use(errorHandler);

const bootstrap = async () => {
  await ensureTenantIndexes();
  const server = app.listen(env.port, () => {
    console.log(`[backend] API listening on port ${env.port}`);
  });

  const shutdown = async () => {
    console.log('\n[backend] Shutting down...');
    server.close(async () => {
      await disconnectMongo();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

bootstrap().catch((error) => {
  console.error('[backend] Failed to start server', error);
  process.exit(1);
});
