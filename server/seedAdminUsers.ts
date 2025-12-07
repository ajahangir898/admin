import path from 'path';
import { promises as fs } from 'fs';
import process from 'process';
import { getAdminAuth, getAdminFirestore } from './firebaseAdmin';

interface SeedAdminAccount {
  email: string;
  password: string;
  displayName?: string;
  tenantId?: string;
  role?: string;
}

const resolveFromCwd = (relativePath: string) => path.resolve(process.cwd(), relativePath);

const ensureAccountsFile = async (targetPath: string, samplePath: string) => {
  try {
    await fs.access(targetPath);
    return;
  } catch {
    const sampleContents = await fs.readFile(samplePath, 'utf-8');
    await fs.writeFile(targetPath, sampleContents, 'utf-8');
    console.info(`[seed:admins] Created ${path.relative(process.cwd(), targetPath)}. Fill it with your admin accounts and re-run the script.`);
    process.exit(1);
  }
};

const loadAccounts = async (filePath: string): Promise<SeedAdminAccount[]> => {
  const raw = await fs.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('adminUsers.json must export an array of admin definitions');
  }
  return parsed;
};

const main = async () => {
  const auth = getAdminAuth();
  if (!auth) {
    console.error('[seed:admins] Firebase Admin SDK is not configured. Set FIREBASE_ADMIN_* env vars or GOOGLE_APPLICATION_CREDENTIALS.');
    process.exit(1);
  }
  const firestore = getAdminFirestore();

  const targetPath = resolveFromCwd(process.argv[2] || 'server/adminUsers.json');
  const samplePath = resolveFromCwd('server/adminUsers.sample.json');
  await ensureAccountsFile(targetPath, samplePath);
  const accounts = await loadAccounts(targetPath);
  if (!accounts.length) {
    console.warn('[seed:admins] adminUsers.json is empty. Add at least one admin definition.');
    return;
  }

  const results: Array<{ email: string; action: 'created' | 'updated'; tenantId?: string }> = [];

  for (const account of accounts) {
    const email = account.email?.trim().toLowerCase();
    if (!email || !account.password) {
      console.warn('[seed:admins] Skipping entry without email/password.');
      continue;
    }
    const displayName = account.displayName?.trim() || 'Tenant Admin';

    let record;
    let action: 'created' | 'updated' = 'updated';
    try {
      record = await auth.getUserByEmail(email);
    } catch (error: any) {
      if (error?.code === 'auth/user-not-found') {
        record = await auth.createUser({
          email,
          password: account.password,
          displayName,
        });
        action = 'created';
      } else {
        throw error;
      }
    }

    const updates: Record<string, string> = {};
    if (record.displayName !== displayName) {
      updates.displayName = displayName;
    }
    if (Object.keys(updates).length) {
      record = await auth.updateUser(record.uid, updates);
    }

    if (account.role) {
      const currentRole = (record.customClaims as { role?: string } | undefined)?.role;
      if (currentRole !== account.role) {
        await auth.setCustomUserClaims(record.uid, { ...record.customClaims, role: account.role });
      }
    }

    if (firestore && account.tenantId) {
      await firestore.collection('tenants').doc(account.tenantId).set({
        adminEmail: email,
        adminAuthUid: record.uid,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    results.push({ email, action, tenantId: account.tenantId });
    console.info(`[seed:admins] ${action === 'created' ? 'Created' : 'Updated'} ${email}${account.tenantId ? ` (tenant: ${account.tenantId})` : ''}`);
  }

  console.info(`\n[seed:admins] Done. Processed ${results.length} account(s).`);
};

main().catch((error) => {
  console.error('[seed:admins] Failed to seed admins', error);
  process.exit(1);
});
