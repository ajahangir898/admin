import { auth } from './firebaseConfig';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
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

  getCurrentUser() {
    return auth.currentUser;
  }
}

export const AuthService = new AuthServiceImpl();
export type { FirebaseUser };
