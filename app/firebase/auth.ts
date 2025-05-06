import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { UserRole, UserStatus } from '../types';

interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  userType?: UserRole;
  additionalData?: Record<string, unknown>;
}

// Register a new user
export const registerUser = async ({
  email,
  password,
  firstName,
  lastName,
  middleName = '',
  userType = 'Patient',
  additionalData = {},
}: RegisterUserData) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Format full name
    const fullName = middleName
      ? `${firstName} ${middleName} ${lastName}`
      : `${firstName} ${lastName}`;

    // Update profile display name
    await updateProfile(user, {
      displayName: fullName,
    });

    // Send email verification
    await sendEmailVerification(user);

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      fullName,
      firstName,
      lastName,
      middleName,
      gender: '',
      birthDate: null,
      address: '',
      contactNumber: '',
      userType,
      status:
        userType === 'Admin'
          ? ('Active' as UserStatus)
          : ('Inactive' as UserStatus), // Set Admin accounts to Active automatically
      profileImage: '',
      isVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData,
    });

    // If registering as a doctor, create doctor profile
    if (userType === 'Doctor') {
      await setDoc(doc(db, 'doctors', user.uid), {
        uid: user.uid,
        specializations: [],
        clinicAddress: '',
        schedule: {},
        consultationFee: 0,
        bio: '',
        availability: false,
        profileStatus: 'Pending' as UserStatus,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error };
  }
};

// Login user
export const loginUser = async (email: string, password: string) => {
  console.log('[loginUser] Attempting login for:', email);
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log(
      '[loginUser] Firebase sign-in successful for UID:',
      userCredential.user.uid
    );

    // Fetch user data from Firestore to get role
    console.log(
      '[loginUser] Fetching Firestore data for UID:',
      userCredential.user.uid
    );
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('[loginUser] Firestore data found:', userData);
      return {
        success: true,
        user: userCredential.user,
        userType: userData.userType,
        status: userData.status,
      };
    } else {
      console.log(
        '[loginUser] Firestore document not found for UID:',
        userCredential.user.uid
      );
      return {
        success: true,
        user: userCredential.user,
        error: 'Firestore user data not found.',
      };
    }
  } catch (error) {
    console.error('[loginUser] Error during login:', error);
    return { success: false, error };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Fetch current user data from Firestore
export const getCurrentUserData = async (uid: string) => {
  console.log('[getCurrentUserData] Fetching data for UID:', uid);
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('[getCurrentUserData] Data found:', userData);
      return {
        success: true,
        userData: userData,
      };
    } else {
      console.warn(
        '[getCurrentUserData] User document not found for UID:',
        uid
      );
      return {
        success: false,
        error: 'User not found',
      };
    }
  } catch (error) {
    console.error('[getCurrentUserData] Error fetching data:', error);
    return { success: false, error };
  }
};

// Update user status (for admin activation)
export const updateUserStatus = async (uid: string, newStatus: UserStatus) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        status: newStatus,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error('[updateUserStatus] Error updating status:', error);
    return { success: false, error };
  }
};
