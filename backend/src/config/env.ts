import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5001),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().min(1, 'MONGODB_DB_NAME is required'),
  ALLOWED_ORIGINS: z.string().optional().default(''),
  FIREBASE_ADMIN_PROJECT_ID: z.string().optional(),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().optional(),
  REQUIRE_AUTH: z
    .string()
    .optional()
    .transform((value) => (value ?? '').toLowerCase() === 'true')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[backend] Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = {
  port: parsed.data.PORT,
  mongoUri: parsed.data.MONGODB_URI,
  mongoDbName: parsed.data.MONGODB_DB_NAME,
  allowedOrigins: parsed.data.ALLOWED_ORIGINS
    ? parsed.data.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [],
  firebase: {
    projectId: parsed.data.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: parsed.data.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: parsed.data.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  requireAuth: parsed.data.REQUIRE_AUTH
};
