import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { DoctorProfile, User } from '../types';

export interface DoctorWithUserInfo extends DoctorProfile {
  userInfo?: User;
}

// Get all active doctors
export const getAllActiveDoctors = async (): Promise<{
  success: boolean;
  doctors?: DoctorWithUserInfo[];
  error?: unknown;
}> => {
  try {
    // Query for doctors
    const doctorsQuery = query(collection(db, 'doctors'));
    const doctorsSnapshot = await getDocs(doctorsQuery);

    // Get all doctors
    let doctorsData = doctorsSnapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          uid: doc.id,
        } as DoctorProfile)
    );

    // Filter active doctors
    doctorsData = doctorsData.filter(
      (doc) => doc.profileStatus === 'Active' && doc.availability
    );

    // Get corresponding user data for each doctor
    const doctorsWithUserInfo: DoctorWithUserInfo[] = [];

    for (const doctor of doctorsData) {
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', doctor.uid))
      );

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data() as User;
        doctorsWithUserInfo.push({
          ...doctor,
          userInfo: userData,
        });
      } else {
        doctorsWithUserInfo.push(doctor);
      }
    }

    return { success: true, doctors: doctorsWithUserInfo };
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return { success: false, error };
  }
};

// Get doctor by ID
export const getDoctorById = async (
  doctorId: string
): Promise<{
  success: boolean;
  doctor?: DoctorWithUserInfo;
  error?: unknown;
}> => {
  try {
    const doctorRef = doc(db, 'doctors', doctorId);
    const doctorSnapshot = await getDoc(doctorRef);

    if (!doctorSnapshot.exists()) {
      return { success: false, error: 'Doctor not found' };
    }

    const doctorData = {
      ...doctorSnapshot.data(),
      uid: doctorSnapshot.id,
    } as DoctorProfile;

    // Get user data for the doctor
    const userQuery = query(
      collection(db, 'users'),
      where('uid', '==', doctorId)
    );
    const userSnapshot = await getDocs(userQuery);

    // Combine doctor profile with user info
    const doctorWithUserInfo: DoctorWithUserInfo = { ...doctorData };
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data() as User;
      doctorWithUserInfo.userInfo = userData;
    }

    return { success: true, doctor: doctorWithUserInfo };
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return { success: false, error };
  }
};

// Update doctor profile
export const updateDoctorProfile = async (
  doctorId: string,
  data: Partial<DoctorProfile>
): Promise<{ success: boolean; error?: unknown }> => {
  try {
    const doctorRef = doc(db, 'doctors', doctorId);

    // Add updatedAt timestamp
    const updatedData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doctorRef, updatedData);
    return { success: true };
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    return { success: false, error };
  }
};

// Get doctors by specialization
export const getDoctorsBySpecialization = async (
  specialization: string
): Promise<{
  success: boolean;
  doctors?: DoctorWithUserInfo[];
  error?: unknown;
}> => {
  try {
    // Query for doctors with the specified specialization
    const doctorsQuery = query(collection(db, 'doctors'));
    const doctorsSnapshot = await getDocs(doctorsQuery);

    // Get all doctors
    let doctorsData = doctorsSnapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          uid: doc.id,
        } as DoctorProfile)
    );

    // Filter by active status and specialization
    doctorsData = doctorsData.filter(
      (doc) =>
        doc.profileStatus === 'Active' &&
        doc.availability &&
        doc.specializations.includes(specialization)
    );

    // Get corresponding user data for each doctor
    const doctorsWithUserInfo: DoctorWithUserInfo[] = [];

    for (const doctor of doctorsData) {
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', doctor.uid))
      );

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data() as User;
        doctorsWithUserInfo.push({
          ...doctor,
          userInfo: userData,
        });
      } else {
        doctorsWithUserInfo.push(doctor);
      }
    }

    return { success: true, doctors: doctorsWithUserInfo };
  } catch (error) {
    console.error('Error fetching doctors by specialization:', error);
    return { success: false, error };
  }
};

// Get top doctors (limit to a specific number)
export const getTopDoctors = async (
  count: number = 5
): Promise<{
  success: boolean;
  doctors?: DoctorWithUserInfo[];
  error?: unknown;
}> => {
  try {
    // Query for active doctors
    const doctorsQuery = query(collection(db, 'doctors'));
    const doctorsSnapshot = await getDocs(doctorsQuery);

    // Get all doctors
    let doctorsData = doctorsSnapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          uid: doc.id,
        } as DoctorProfile)
    );

    // Filter active doctors
    doctorsData = doctorsData.filter(
      (doc) => doc.profileStatus === 'Active' && doc.availability
    );

    // Limit to the requested count
    doctorsData = doctorsData.slice(0, count);

    // Get corresponding user data for each doctor
    const doctorsWithUserInfo: DoctorWithUserInfo[] = [];

    for (const doctor of doctorsData) {
      const userDoc = await getDocs(
        query(collection(db, 'users'), where('uid', '==', doctor.uid))
      );

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data() as User;
        doctorsWithUserInfo.push({
          ...doctor,
          userInfo: userData,
        });
      } else {
        doctorsWithUserInfo.push(doctor);
      }
    }

    return { success: true, doctors: doctorsWithUserInfo };
  } catch (error) {
    console.error('Error fetching top doctors:', error);
    return { success: false, error };
  }
};
