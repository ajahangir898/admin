import { initializeApp, applicationDefault, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from '../config/env.js';

let adminApp: App | null = null;

const ensureApp = () => {
  if (adminApp) return adminApp;
  const { projectId, clientEmail, privateKey } = env.firebase;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey })
  }, 'backend-admin');

  return adminApp;
};

export const getAdminAuth = () => {
  const app = ensureApp();
  if (!app) return null;
  return getAuth(app);
};
