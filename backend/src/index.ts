import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { env } from './config/env';
import { disconnectMongo } from './db/mongo';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { tenantsRouter } from './routes/tenants';
import { tenantDataRouter } from './routes/tenantData';
import { ensureTenantIndexes } from './services/tenantsService';
import { expensesRouter } from './routes/expenses';
import dueListRoutes from './routes/dueListRoutes';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: env.allowedOrigins.length
    ? env.allowedOrigins
    : undefined,
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
app.use('/api/tenant-data', tenantDataRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api', dueListRoutes);

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
