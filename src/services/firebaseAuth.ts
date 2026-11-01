import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse existing Firebase app instance if already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly'
];

const provider = new GoogleAuthProvider();
// Configure Google Drive readonly scope
SCOPES.forEach((scope) => provider.addScope(scope));

// Prompt user to select account if desired
provider.setCustomParameters({
  prompt: 'select_account'
});

// Flag to track interactive sign in
let isSigningIn = false;
// Secure in-memory token cache (never stored in localStorage)
let cachedAccessToken: string | null = null;

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

type AuthCallback = (state: AuthState) => void;
const subscribers = new Set<AuthCallback>();

const notifySubscribers = (state: AuthState) => {
  subscribers.forEach((cb) => {
    try {
      cb(state);
    } catch (e) {
      console.error('Error in auth subscriber callback', e);
    }
  });
};

export const subscribeToAuth = (cb: AuthCallback) => {
  subscribers.add(cb);
  cb({
    user: auth.currentUser,
    accessToken: cachedAccessToken,
    isAuthenticated: !!auth.currentUser && !!cachedAccessToken
  });
  return () => {
    subscribers.delete(cb);
  };
};

/**
 * Initializes the auth listener and cleans up token when signed out
 */
export const initAuth = (
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        notifySubscribers({ user, accessToken: cachedAccessToken, isAuthenticated: true });
        if (onSuccess) onSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User session exists in Firebase Auth, but in-memory OAuth token is expired/not present in memory yet
        cachedAccessToken = null;
        notifySubscribers({ user, accessToken: null, isAuthenticated: false });
        if (onFailure) onFailure();
      }
    } else {
      cachedAccessToken = null;
      notifySubscribers({ user: null, accessToken: null, isAuthenticated: false });
      if (onFailure) onFailure();
    }
  });
};

/**
 * Interactive Sign-In with Google popup
 * Prompts user for credentials and Google Drive permission
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Drive');
    }

    cachedAccessToken = credential.accessToken;
    notifySubscribers({
      user: result.user,
      accessToken: cachedAccessToken,
      isAuthenticated: true
    });

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * In-memory access token getter
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * In-memory current user getter
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Sign out user and clear token cache
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  notifySubscribers({ user: null, accessToken: null, isAuthenticated: false });
};
