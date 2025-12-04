import { db } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export async function runFirebaseDiagnostics() {
  const results: Record<string, any> = {};
  try {
    if (!db) throw new Error('Firestore `db` is not initialized');

    // Try listing collections (get a small collection)
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      results.readProducts = { ok: true, count: snapshot.size };
    } catch (e) {
      results.readProducts = { ok: false, error: (e as Error).message };
    }

    // Try write/read/delete a temp doc
    const testRef = doc(db, 'diagnostics', '__test_doc__');
    try {
      await setDoc(testRef, { createdAt: Date.now(), tag: 'diagnostic' });
      results.write = { ok: true };
      const read = await getDoc(testRef);
      results.readBack = { ok: read.exists(), data: read.exists() ? read.data() : null };
      await deleteDoc(testRef);
      results.delete = { ok: true };
    } catch (e) {
      results.write = { ok: false, error: (e as Error).message };
    }

    // Return summary
    return { ok: true, details: results };
  } catch (err) {
    return { ok: false, error: (err as Error).message, details: results };
  }
}

// Expose to window for quick browser console diagnostics
(window as any).runFirebaseDiagnostics = runFirebaseDiagnostics;

export default { runFirebaseDiagnostics };
