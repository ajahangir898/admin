import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './config/env';
import { disconnectMongo } from './db/mongo';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { tenantsRouter } from './routes/tenants';
import { tenantDataRouter } from './routes/tenantData';
import { ensureTenantIndexes } from './services/tenantsService';
import { expensesRouter } from './routes/expenses';
import { profitLossRouter } from './routes/profitLoss';
import { incomesRouter } from './routes/incomes';
import dueListRoutes from './routes/dueListRoutes';
import uploadRouter from './routes/upload';
import authRouter from './routes/auth';
import { User } from './models/User';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: env.allowedOrigins.length
    ? env.allowedOrigins
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (_req, res) => {
  res.json({ name: 'seven-days-backend', version: '0.1.0' });
});

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/tenant-data', tenantDataRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/incomes', incomesRouter);
app.use('/api/profit-loss', profitLossRouter);
app.use('/api', dueListRoutes);
app.use('/', uploadRouter);

app.use(errorHandler);

const bootstrap = async () => {
  // Connect Mongoose for Entity/Transaction models
  try {
    await mongoose.connect(env.mongoUri, {
      dbName: env.mongoDbName,
    });
    console.log('[backend] Mongoose connected to MongoDB');
    
    // Seed default super admin user
    await seedDefaultAdmin();
  } catch (err) {
    console.error('[backend] Mongoose connection error:', err);
    process.exit(1);
  }

  await ensureTenantIndexes();
  const server = app.listen(env.port, () => {
    console.log(`[backend] API listening on port ${env.port}`);
  });

  const shutdown = async () => {
    console.log('\n[backend] Shutting down...');
    server.close(async () => {
      await mongoose.disconnect();
      await disconnectMongo();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

// Seed default super admin user
const seedDefaultAdmin = async () => {
  try {
    const adminEmail = 'admin@super.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin121', 12);
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
      });
      console.log('[backend] Default super admin created: admin@super.com');
    } else {
      console.log('[backend] Super admin already exists');
    }
  } catch (error) {
    console.error('[backend] Error seeding admin user:', error);
  }
};

bootstrap().catch((error) => {
  console.error('[backend] Failed to start server', error);
  process.exit(1);
});
