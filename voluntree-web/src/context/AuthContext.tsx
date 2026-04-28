import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import type { User, ConfirmationResult } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  role: 'worker' | 'volunteer' | 'coordinator' | null;
  loading: boolean;
  logout: () => Promise<void>;
  setRole: (role: 'worker' | 'volunteer' | 'coordinator') => Promise<void>;
  setupRecaptcha: (containerId: string) => void;
  sendOTP: (phoneNumber: string) => Promise<ConfirmationResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<'worker' | 'volunteer' | 'coordinator' | null>(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Try to fetch role from Firestore first, fall back to localStorage
        try {
          const roleDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (roleDoc.exists()) {
            setRoleState(roleDoc.data().role);
          } else {
            const savedRole = localStorage.getItem(`role_${currentUser.uid}`);
            if (savedRole) setRoleState(savedRole as any);
          }
        } catch (e) {
          // Firestore unavailable — use localStorage
          const savedRole = localStorage.getItem(`role_${currentUser.uid}`);
          if (savedRole) setRoleState(savedRole as any);
        }
      } else {
        setRoleState(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const setupRecaptcha = (containerId: string) => {
    if (recaptchaVerifier) return;
    const verifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible'
    });
    setRecaptchaVerifier(verifier);
  };

  const sendOTP = async (phoneNumber: string) => {
    if (!recaptchaVerifier) throw new Error("Recaptcha not initialized");
    return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const setRole = async (newRole: 'worker' | 'volunteer' | 'coordinator') => {
    if (!user) return;
    // Save role locally first (always works)
    localStorage.setItem(`role_${user.uid}`, newRole);
    setRoleState(newRole);
    // Then try to persist to Firestore (may fail if rules block it)
    try {
      await setDoc(doc(db, 'users', user.uid), { role: newRole }, { merge: true });
    } catch (e) {
      console.warn('Could not save role to Firestore (using localStorage):', e);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRoleState(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, logout, setRole, setupRecaptcha, sendOTP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
