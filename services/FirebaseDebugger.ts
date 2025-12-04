/**
 * Firebase Debugging Helper
 * Use this to diagnose Firebase connectivity and data persistence issues
 */

import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export const FirebaseDebugger = {
  /**
   * Test if Firebase is properly initialized and connected
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!db) {
        return { success: false, message: '❌ Firebase DB is not initialized (db is null/undefined)' };
      }

      console.log('✓ Firebase DB instance exists:', db);
      return { success: true, message: '✓ Firebase DB is initialized' };
    } catch (error) {
      return { success: false, message: `❌ Firebase initialization error: ${error}` };
    }
  },

  /**
   * Test reading from a Firestore collection
   */
  async testRead(collectionName: string = 'products'): Promise<{ success: boolean; count: number; data?: any; error?: string }> {
    try {
      if (!db) {
        return { success: false, count: 0, error: 'Firebase DB not initialized' };
      }

      console.log(`Testing read from collection: ${collectionName}`);
      const snapshot = await getDocs(collection(db, collectionName));
      const count = snapshot.size;
      const sampleData = snapshot.docs.slice(0, 2).map(d => ({ id: d.id, ...d.data() }));

      console.log(`✓ Read successful - found ${count} documents`, sampleData);
      return { success: true, count, data: sampleData };
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.error(`❌ Read failed: ${errorMsg}`, error);
      return { success: false, count: 0, error: errorMsg };
    }
  },

  /**
   * Test writing to a Firestore collection
   */
  async testWrite(collectionName: string = 'test_collection'): Promise<{ success: boolean; docId?: string; error?: string }> {
    try {
      if (!db) {
        return { success: false, error: 'Firebase DB not initialized' };
      }

      const testDoc = {
        timestamp: new Date().toISOString(),
        message: 'Firebase write test',
        testId: Math.random().toString(36).substring(7)
      };

      console.log(`Testing write to collection: ${collectionName}`, testDoc);

      // Write with a timestamp-based ID
      const docId = `test_${Date.now()}`;
      await setDoc(doc(db, collectionName, docId), testDoc);

      console.log(`✓ Write successful - doc ID: ${docId}`);
      return { success: true, docId };
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.error(`❌ Write failed: ${errorMsg}`, error);

      // Check for common Firebase errors
      if (errorMsg.includes('PERMISSION_DENIED')) {
        console.error('💡 Hint: Check Firestore Security Rules - you may not have write permission for this collection');
      }
      if (errorMsg.includes('NOT_FOUND')) {
        console.error('💡 Hint: Firestore collection does not exist. Create it through Firebase Console.');
      }

      return { success: false, error: errorMsg };
    }
  },

  /**
   * Test reading a specific document (config doc)
   */
  async testReadDoc(docPath: string = 'configurations/website_config'): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!db) {
        return { success: false, error: 'Firebase DB not initialized' };
      }

      const [collectionPath, docId] = docPath.split('/');
      console.log(`Testing read from doc: ${collectionPath}/${docId}`);

      const docRef = doc(db, collectionPath, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`✓ Document read successful:`, data);
        return { success: true, data };
      } else {
        console.warn(`⚠ Document does not exist: ${docPath}`);
        return { success: false, error: `Document not found: ${docPath}` };
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.error(`❌ Document read failed: ${errorMsg}`, error);
      return { success: false, error: errorMsg };
    }
  },

  /**
   * Comprehensive diagnostic report
   */
  async runDiagnostics(): Promise<{ 
    dbInitialized: boolean;
    canRead: boolean;
    canWrite: boolean;
    configsAccessible: boolean;
    summary: string;
  }> {
    console.log('🔍 Running Firebase Diagnostics...\n');

    const connResult = await this.testConnection();
    const readResult = await this.testRead('products');
    const writeResult = await this.testWrite('test_writes');
    const configResult = await this.testReadDoc('configurations/website_config');

    const summary = `
Firebase Diagnostic Report:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ DB Initialized: ${connResult.success}
✓ Can Read Collections: ${readResult.success} (found ${readResult.count} products)
✓ Can Write Documents: ${writeResult.success}
✓ Config Accessible: ${configResult.success}

${!readResult.success ? '❌ READ ERROR: ' + readResult.error : ''}
${!writeResult.success ? '❌ WRITE ERROR: ' + writeResult.error : ''}
${!configResult.success ? '❌ CONFIG ERROR: ' + configResult.error : ''}

Next Steps:
1. If DB is not initialized: Check firebaseConfig.ts credentials
2. If reads fail: Check Firestore rules allow read access
3. If writes fail: Check Firestore rules allow write access
4. If configs fail: Ensure configurations/website_config document exists in Firestore
5. Check browser console for any network/CORS errors
6. Verify Firebase project ID matches firebaseConfig.ts
    `.trim();

    return {
      dbInitialized: connResult.success,
      canRead: readResult.success,
      canWrite: writeResult.success,
      configsAccessible: configResult.success,
      summary
    };
  }
};

// Export a helper to run diagnostics in console
if (typeof window !== 'undefined') {
  (window as any).firebaseDebug = FirebaseDebugger;
  console.log('💡 Firebase debugger available as: window.firebaseDebug');
  console.log('   Run: firebaseDebug.runDiagnostics() to test connection');
}
