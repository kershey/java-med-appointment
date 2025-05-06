'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import { getCurrentUserData } from '@/app/firebase/auth';
import { User, UserRole } from '@/app/types';

// Auth context interface
interface AuthContextType {
  user: FirebaseUser | null;
  userData: Partial<User> | null;
  loading: boolean;
  userRole: UserRole | null;
  accessDeniedReason: string | null; // New state for access denial reason
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  userRole: null,
  accessDeniedReason: null, // Default access denial reason
});

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<Partial<User> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(
    null
  ); // New state

  useEffect(() => {
    // Setup firebase auth state listener
    console.log('[AuthContext] Setting up onAuthStateChanged listener.');
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log('[AuthContext] onAuthStateChanged triggered.');
      if (authUser) {
        console.log('[AuthContext] authUser found:', {
          uid: authUser.uid,
          emailVerified: authUser.emailVerified,
        });
        console.log(
          '[AuthContext] Fetching Firestore data for UID:',
          authUser.uid
        );
        const firestoreResult = await getCurrentUserData(authUser.uid);
        console.log('[AuthContext] Firestore result:', firestoreResult);

        if (firestoreResult.success && firestoreResult.userData) {
          const fsData = firestoreResult.userData as User;
          console.log('[AuthContext] Firestore data retrieved:', fsData);

          if (!authUser.emailVerified) {
            console.log('[AuthContext] Access denied: Email not verified.');
            setUser(null);
            setUserData(null);
            setUserRole(null);
            setAccessDeniedReason(
              'Email not verified. Please check your inbox.'
            );
          } else if (fsData.status !== 'Active') {
            console.log(
              `[AuthContext] Access denied: Status is ${fsData.status}, not Active.`
            );
            setUser(null);
            setUserData(null);
            setUserRole(null);
            setAccessDeniedReason(
              `Account is ${fsData.status}. Please contact support.`
            );
          } else {
            // User is verified and active
            console.log(
              '[AuthContext] Access granted: User verified and active.'
            );
            setUser(authUser);
            setUserData(fsData);
            setUserRole(fsData.userType as UserRole);
            setAccessDeniedReason(null);
          }
        } else {
          // Failed to get Firestore data, treat as unauthenticated
          console.log(
            '[AuthContext] Access denied: Failed to load Firestore user data.'
          );
          setUser(null);
          setUserData(null);
          setUserRole(null);
          setAccessDeniedReason('Failed to load user data.');
        }
      } else {
        // No Firebase authUser
        console.log(
          '[AuthContext] No authUser found (logged out or initial state).'
        );
        setUser(null);
        setUserData(null);
        setUserRole(null);
        setAccessDeniedReason(null);
      }
      console.log('[AuthContext] Setting loading to false.');
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      console.log('[AuthContext] Unsubscribing from onAuthStateChanged.');
      unsubscribe();
    };
  }, []);

  // Provide auth context value
  const value = {
    user,
    userData,
    loading,
    userRole,
    accessDeniedReason, // Provide new state
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only after loading is complete,
          DashboardLayout will handle redirect if user is null */}
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
