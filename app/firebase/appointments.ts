import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { Appointment, AppointmentStatus } from '../types';
import { format } from 'date-fns';

// Interface for UI-ready appointment data
export interface UIAppointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: Date;
  time: string;
  location: string;
  status: AppointmentStatus;
  patientId?: string;
  doctorId?: string;
  // Additional UI-specific properties
  virtualAvailable?: boolean;
  teleHealthUrl?: string;
  aiPreDiagnosis?: boolean;
  preparationSteps?: string[];
  estimatedWaitTime?: string;
}

// Get appointments for a patient
export const getPatientAppointments = async (
  patientId: string,
  statusFilter?: AppointmentStatus
) => {
  try {
    let q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      orderBy('datetime', 'desc')
    );

    if (statusFilter) {
      q = query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        where('status', '==', statusFilter),
        orderBy('datetime', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        datetime: data.datetime.toDate(),
        symptoms: data.symptoms,
        queueNumber: data.queueNumber,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        type: data.type,
        cancelReason: data.cancelReason,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    return { success: true, appointments };
  } catch (error) {
    console.error('Error getting patient appointments:', error);
    return { success: false, error };
  }
};

// Get appointments for a doctor
export const getDoctorAppointments = async (
  doctorId: string,
  statusFilter?: AppointmentStatus
) => {
  try {
    let q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      orderBy('datetime', 'desc')
    );

    if (statusFilter) {
      q = query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctorId),
        where('status', '==', statusFilter),
        orderBy('datetime', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        datetime: data.datetime.toDate(),
        symptoms: data.symptoms,
        queueNumber: data.queueNumber,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        type: data.type,
        cancelReason: data.cancelReason,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    return { success: true, appointments };
  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    return { success: false, error };
  }
};

// Get a single appointment by ID
export const getAppointmentById = async (appointmentId: string) => {
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const appointment: Appointment = {
        id: docSnap.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        datetime: data.datetime.toDate(),
        symptoms: data.symptoms,
        queueNumber: data.queueNumber,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        type: data.type,
        cancelReason: data.cancelReason,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };

      return { success: true, appointment };
    } else {
      return { success: false, error: 'Appointment not found' };
    }
  } catch (error) {
    console.error('Error getting appointment:', error);
    return { success: false, error };
  }
};

// Create a new appointment
export const createAppointment = async (
  appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    // Convert Date objects to Firestore Timestamps
    const firestoreData = {
      ...appointmentData,
      datetime: Timestamp.fromDate(appointmentData.datetime),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'appointments'), firestoreData);

    return { success: true, appointmentId: docRef.id };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, error };
  }
};

// Update an appointment
export const updateAppointment = async (
  appointmentId: string,
  appointmentData: Partial<Appointment>
) => {
  try {
    const docRef = doc(db, 'appointments', appointmentId);

    // Convert Date objects to Firestore Timestamps if they exist in the update data
    const firestoreData: Record<string, unknown> = {
      ...appointmentData,
      updatedAt: serverTimestamp(),
    };

    if (appointmentData.datetime) {
      firestoreData.datetime = Timestamp.fromDate(appointmentData.datetime);
    }

    await updateDoc(docRef, firestoreData);

    return { success: true };
  } catch (error) {
    console.error('Error updating appointment:', error);
    return { success: false, error };
  }
};

// Cancel an appointment
export const cancelAppointment = async (
  appointmentId: string,
  cancelReason: string
) => {
  try {
    const docRef = doc(db, 'appointments', appointmentId);

    await updateDoc(docRef, {
      status: 'Cancelled' as AppointmentStatus,
      cancelReason,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return { success: false, error };
  }
};

// Transform Firestore appointment data to UI format
export const transformAppointmentForUI = async (
  appointment: Appointment
): Promise<UIAppointment> => {
  try {
    // Get doctor data to display name and specialty
    const doctorDocRef = doc(db, 'doctors', appointment.doctorId);
    const doctorUserDocRef = doc(db, 'users', appointment.doctorId);

    const [doctorDoc, doctorUserDoc] = await Promise.all([
      getDoc(doctorDocRef),
      getDoc(doctorUserDocRef),
    ]);

    let doctorName = 'Unknown Doctor';
    let doctorSpecialty = 'Unknown Specialty';
    let location = 'Main Clinic';

    if (doctorUserDoc.exists()) {
      const doctorData = doctorUserDoc.data();
      doctorName = `Dr. ${doctorData.lastName}`;

      if (doctorData.firstName) {
        doctorName = `Dr. ${doctorData.firstName} ${doctorData.lastName}`;
      }
    }

    if (doctorDoc.exists()) {
      const doctorProfile = doctorDoc.data();

      if (
        doctorProfile.specializations &&
        doctorProfile.specializations.length > 0
      ) {
        doctorSpecialty = doctorProfile.specializations[0];
      }

      if (doctorProfile.clinicAddress) {
        location = doctorProfile.clinicAddress;
      }
    }

    // Format the time string
    const time =
      format(appointment.datetime, 'h:mm a') +
      ' - ' +
      format(new Date(appointment.datetime.getTime() + 30 * 60000), 'h:mm a');

    return {
      id: appointment.id,
      doctorName,
      doctorSpecialty,
      date: appointment.datetime,
      time,
      location,
      status: appointment.status,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
    };
  } catch (error) {
    console.error('Error transforming appointment:', error);
    // Return a basic version if transformation fails
    return {
      id: appointment.id,
      doctorName: 'Doctor',
      doctorSpecialty: 'Specialty',
      date: appointment.datetime,
      time: format(appointment.datetime, 'h:mm a'),
      location: 'Clinic',
      status: appointment.status,
    };
  }
};

// Get upcoming appointments for patient
export const getUpcomingPatientAppointments = async (
  patientId: string,
  maxResults = 10
) => {
  try {
    const now = new Date();
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      where('datetime', '>=', now),
      where('status', 'in', ['Pending', 'Approved']),
      orderBy('datetime', 'asc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        datetime: data.datetime.toDate(),
        symptoms: data.symptoms,
        queueNumber: data.queueNumber,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        type: data.type,
        cancelReason: data.cancelReason,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    // Transform appointments for UI
    const uiAppointments: UIAppointment[] = [];
    for (const appointment of appointments) {
      const uiAppointment = await transformAppointmentForUI(appointment);
      uiAppointments.push(uiAppointment);
    }

    return { success: true, appointments: uiAppointments };
  } catch (error) {
    console.error('Error getting upcoming appointments:', error);
    return { success: false, error };
  }
};

// Get past appointments for patient
export const getPastPatientAppointments = async (
  patientId: string,
  maxResults = 10
) => {
  try {
    const now = new Date();
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      where('datetime', '<', now),
      orderBy('datetime', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        datetime: data.datetime.toDate(),
        symptoms: data.symptoms,
        queueNumber: data.queueNumber,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        type: data.type,
        cancelReason: data.cancelReason,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    // Transform appointments for UI
    const uiAppointments: UIAppointment[] = [];
    for (const appointment of appointments) {
      const uiAppointment = await transformAppointmentForUI(appointment);
      uiAppointments.push(uiAppointment);
    }

    return { success: true, appointments: uiAppointments };
  } catch (error) {
    console.error('Error getting past appointments:', error);
    return { success: false, error };
  }
};

export const getAppointmentsWithDetails = async (
  userId: string,
  userType: 'Patient' | 'Doctor'
) => {
  try {
    // Get appointments based on user type
    const field = userType === 'Patient' ? 'patientId' : 'doctorId';
    const q = query(
      collection(db, 'appointments'),
      where(field, '==', userId),
      orderBy('datetime', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        datetime: data.datetime.toDate(),
        symptoms: data.symptoms,
        queueNumber: data.queueNumber,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        type: data.type,
        cancelReason: data.cancelReason,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    });

    // Transform appointments to UI format with doctor and patient info
    const uiAppointments: UIAppointment[] = [];

    for (const appointment of appointments) {
      try {
        const uiAppointment = await transformAppointmentForUI(appointment);
        uiAppointments.push(uiAppointment);
      } catch (error) {
        console.error('Error transforming appointment:', error);
      }
    }

    return { success: true, appointments: uiAppointments };
  } catch (error) {
    console.error('Error getting appointments with details:', error);
    return { success: false, error };
  }
};
