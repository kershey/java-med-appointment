// User role types
export type UserRole = 'Patient' | 'Doctor' | 'Staff' | 'Admin';

// User status types
export type UserStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended';

// Base user interface
export interface User {
  uid: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: string;
  birthDate?: Date | null;
  address?: string;
  contactNumber?: string;
  userType: UserRole;
  status: UserStatus;
  profileImage?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Doctor specific profile
export interface DoctorProfile {
  uid: string;
  fullName?: string;
  specializations: string[];
  clinicAddress: string;
  schedule: {
    [key: string]: { start: string; end: string }; // Key is day of week
  };
  consultationFee: number;
  bio?: string;
  availability: boolean;
  profileStatus: UserStatus;
}

// Appointment status
export type AppointmentStatus =
  | 'Pending'
  | 'Approved'
  | 'Cancelled'
  | 'Completed';

// Payment status
export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Failed';

// Payment method
export type PaymentMethod = 'GCash' | 'Cash' | 'Credit Card' | 'Other';

// Appointment type
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  datetime: Date;
  symptoms: string;
  queueNumber?: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  type?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Medical record type
export interface MedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  diagnosis: string;
  prescription?: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedBy: string;
}

// Notification type
export type NotificationType = 'Appointment' | 'Payment' | 'System' | 'Medical';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  actionLink?: string;
}
