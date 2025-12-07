import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { App } from 'firebase-admin/app';

let adminApp: App | null = null;

const buildCredential = () => {
  if (process.env.FIREBASE_ADMIN_CREDENTIAL === 'application') {
    return applicationDefault();
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return cert({
      projectId,
      clientEmail,
      privateKey,
    });
  }

  return null;
};

const ensureAdminApp = () => {
  if (adminApp) return adminApp;
  const cred = buildCredential();
  if (!cred) return null;
  adminApp = initializeApp({
    credential: cred,
  }, 'admin-sdk');
  return adminApp;
};

export const getAdminAuth = () => {
  const app = ensureAdminApp();
  if (!app) return null;
  return getAuth(app);
};

export const getAdminFirestore = () => {
  const app = ensureAdminApp();
  if (!app) return null;
  return getFirestore(app);
};
