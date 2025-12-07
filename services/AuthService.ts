import { auth } from './firebaseConfig';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';

interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

class AuthServiceImpl {
  private persistenceReady: Promise<void>;

  constructor() {
    this.persistenceReady = typeof window === 'undefined'
      ? Promise.resolve()
      : setPersistence(auth, browserLocalPersistence).catch(error => {
          console.warn('Unable to set Firebase Auth persistence', error);
        });
  }

  private shouldForceRedirect() {
    if (typeof window === 'undefined') {
      return true;
    }
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    const ua = nav?.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/i.test(ua);
    const isStandaloneDisplayMode = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
    const isNavigatorStandalone = Boolean((nav as any)?.standalone);
    const isIOSPWA = isIOS && (isStandaloneDisplayMode || isNavigatorStandalone);
    const isInAppBrowser = /FBAN|FBAV|Instagram|Snapchat|Twitter|LinkedIn|WhatsApp|Messenger/i.test(ua);
    return isIOSPWA || isInAppBrowser;
  }

  private shouldFallbackToRedirect(error: unknown) {
    if (!error || typeof error !== 'object' || !('code' in error)) {
      return false;
    }
    const fallbackCodes = new Set([
      'auth/popup-blocked',
      'auth/operation-not-supported-in-this-environment',
      'auth/popup-blocked-unsupported-browser'
    ]);
    const code = (error as { code?: string }).code;
    return Boolean(code && fallbackCodes.has(code));
  }

  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  async login(email: string, password: string) {
    await this.persistenceReady;
    return signInWithEmailAndPassword(auth, email, password);
  }

  async register(payload: RegisterPayload) {
    const { email, password, name } = payload;
    await this.persistenceReady;
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      try {
        await updateProfile(credential.user, { displayName: name });
      } catch (error) {
        console.warn('Failed to update display name', error);
      }
    }
    return credential.user;
  }

  async logout() {
    await this.persistenceReady;
    return signOut(auth);
  }

  async loginWithGoogle() {
    await this.persistenceReady;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    if (this.shouldForceRedirect()) {
      return signInWithRedirect(auth, provider);
    }
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      if (this.shouldFallbackToRedirect(error)) {
        return signInWithRedirect(auth, provider);
      }
      throw error;
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }
}

export const AuthService = new AuthServiceImpl();
export type { FirebaseUser };
