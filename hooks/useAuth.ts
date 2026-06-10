import { useState, useEffect } from 'react';
import { auth, isFirebaseConfigured, signInWithGoogle, logOutUser, syncUserProfile } from '../services/firebase';

export interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Simulate local persisted login for demo/mock mode
      const stored = localStorage.getItem('forge_mock_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
      return;
    }

    // Subscribe to Firebase Auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const authUser = await signInWithGoogle();
      const sessionUser: UserSession = {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName,
        photoURL: authUser.photoURL,
      };
      
      setUser(sessionUser);
      
      if (!isFirebaseConfigured) {
        localStorage.setItem('forge_mock_user', JSON.stringify(sessionUser));
      }
    } catch (error) {
      console.error('Login action failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        await logOutUser();
      } else {
        localStorage.removeItem('forge_mock_user');
      }
      setUser(null);
    } catch (error) {
      console.error('Logout action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isRealFirebase: isFirebaseConfigured
  };
};
