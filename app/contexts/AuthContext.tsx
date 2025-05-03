'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// Define user type that extends Firebase User with our custom fields
export type UserRole = 'Patient' | 'Doctor' | 'Staff' | 'Admin';

export interface UserData {
  uid: string;
  email: string | null;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  birthDate: Timestamp | null;
  address: string;
  contactNumber: string;
  userType: UserRole;
  status: 'Active' | 'Disabled' | 'RedTag';
  profileImage: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Get additional user data from Firestore
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
