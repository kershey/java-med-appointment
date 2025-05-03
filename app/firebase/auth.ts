import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// Register a new user
export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update profile display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    // Send email verification
    await sendEmailVerification(user);

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email,
      firstName,
      lastName,
      middleName: '',
      gender: '',
      birthDate: null,
      address: '',
      contactNumber: '',
      userType: 'Patient',
      status: 'Active',
      profileImage: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error };
  }
};

// Login user
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
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
