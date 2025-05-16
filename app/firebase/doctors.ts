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

    if (doctorsSnapshot.empty) {
      console.log('No doctors found in the database');
      return { success: true, doctors: [] };
    }

    // Get all doctors
    let doctorsData = doctorsSnapshot.docs.map((doc) => {
      // Ensure all required fields are present
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        fullName: data.fullName || '',
        specializations: data.specializations || [],
        clinicAddress: data.clinicAddress || '',
        schedule: data.schedule || {},
        consultationFee:
          typeof data.consultationFee === 'number' ? data.consultationFee : 0,
        availability: data.availability === true,
        profileStatus: data.profileStatus || 'Pending',
      } as DoctorProfile;
    });

    // Filter active doctors with proper null/undefined checking
    doctorsData = doctorsData.filter(
      (doc) => doc.profileStatus === 'Active' && doc.availability === true
    );

    // If no active doctors are found after filtering
    if (doctorsData.length === 0) {
      console.log('No active doctors found after filtering');
      return { success: true, doctors: [] };
    }

    console.log(
      `Found ${doctorsData.length} active doctors, fetching user info...`
    );

    // Get corresponding user data for each doctor
    const doctorsWithUserInfo: DoctorWithUserInfo[] = [];

    // Get all doctor UIDs
    const doctorIds = doctorsData.map((doctor) => doctor.uid);

    // Create a map to store user data by ID for quicker lookup
    const userDataMap: Record<string, User> = {};

    // Get all users that match our doctor IDs (more efficient than individual queries)
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('uid', 'in', doctorIds)
      );
      const userSnapshot = await getDocs(userQuery);

      // Populate the map
      userSnapshot.docs.forEach((doc) => {
        const userData = doc.data() as User;
        userDataMap[userData.uid] = userData;
      });

      console.log(`Found user info for ${userSnapshot.docs.length} doctors`);
    } catch (error) {
      console.error('Error batch fetching user data:', error);
      // Continue even if this fails, we'll just use doctorData without userInfo
    }

    // Combine doctor profiles with user info
    for (const doctor of doctorsData) {
      const userData = userDataMap[doctor.uid];
      if (userData) {
        // If the doctor document doesn't have a fullName but the user document does,
        // update the doctor document with the fullName from the user document
        if (!doctor.fullName && userData.fullName) {
          try {
            const doctorRef = doc(db, 'doctors', doctor.uid);
            await updateDoc(doctorRef, {
              fullName: userData.fullName,
              updatedAt: serverTimestamp(),
            });
            // Update the doctor object in memory as well
            doctor.fullName = userData.fullName;
          } catch (error) {
            console.warn(
              `Could not update doctor ${doctor.uid} with fullName:`,
              error
            );
            // Continue even if this fails
          }
        }

        doctorsWithUserInfo.push({
          ...doctor,
          userInfo: userData,
        });
      } else {
        // Still include the doctor even without user info
        console.log(`No user data found for doctor ${doctor.uid}`);
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

    // If fullName is not included in the update data,
    // try to get it from the user document
    if (!data.fullName) {
      try {
        const userDoc = await getDoc(doc(db, 'users', doctorId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.fullName) {
            data.fullName = userData.fullName;
          }
        }
      } catch (error) {
        console.warn('Could not retrieve fullName from user document:', error);
        // Continue with the update even if this fails
      }
    }

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

// Migration function to update all doctor documents with fullName from user documents
export const syncAllDoctorNames = async (): Promise<{
  success: boolean;
  updated?: number;
  error?: unknown;
}> => {
  try {
    // 1. Get all doctor documents
    const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
    const doctorIds = doctorsSnapshot.docs.map((doc) => doc.id);

    if (doctorIds.length === 0) {
      return { success: true, updated: 0 };
    }

    console.log(
      `Found ${doctorIds.length} doctor documents to check for name syncing`
    );

    // 2. Get all corresponding user documents
    let updatedCount = 0;

    // Process in batches of 10 to avoid hitting Firestore limits
    for (let i = 0; i < doctorIds.length; i += 10) {
      const batchIds = doctorIds.slice(i, i + 10);

      try {
        const userQuery = query(
          collection(db, 'users'),
          where('uid', 'in', batchIds)
        );
        const userSnapshot = await getDocs(userQuery);

        // Create a mapping of uid to fullName
        const fullNameMap: Record<string, string> = {};
        userSnapshot.docs.forEach((doc) => {
          const userData = doc.data() as User;
          if (userData.fullName) {
            fullNameMap[userData.uid] = userData.fullName;
          }
        });

        // 3. Update each doctor document that doesn't have a fullName
        for (const doctorDoc of doctorsSnapshot.docs.filter((doc) =>
          batchIds.includes(doc.id)
        )) {
          const doctorData = doctorDoc.data() as DoctorProfile;
          const doctorId = doctorDoc.id;

          // Only update if the doctor document doesn't have a fullName
          // but there is a fullName in the user document
          if (!doctorData.fullName && fullNameMap[doctorId]) {
            const doctorRef = doc(db, 'doctors', doctorId);
            await updateDoc(doctorRef, {
              fullName: fullNameMap[doctorId],
              updatedAt: serverTimestamp(),
            });
            updatedCount++;
            console.log(
              `Updated doctor ${doctorId} with fullName: ${fullNameMap[doctorId]}`
            );
          }
        }
      } catch (error) {
        console.error(`Error processing batch ${i}-${i + 10}:`, error);
        // Continue with next batch even if this one fails
      }
    }

    console.log(
      `Successfully updated ${updatedCount} doctor documents with fullName`
    );
    return { success: true, updated: updatedCount };
  } catch (error) {
    console.error('Error syncing doctor names:', error);
    return { success: false, error };
  }
};
