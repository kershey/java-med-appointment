'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/app/firebase/auth';

export default function DashboardPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logoutUser();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">
              Welcome, {userData.firstName} {userData.lastName}
            </h2>
            <p className="text-gray-600">
              This is your dashboard where you can manage your appointments and
              medical records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-blue-800 mb-2">
                Upcoming Appointments
              </h3>
              <p className="text-gray-600 mb-4">
                You have no upcoming appointments.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/appointments')}
              >
                Book Appointment
              </Button>
            </div>

            <div className="bg-green-50 p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-green-800 mb-2">
                Medical Records
              </h3>
              <p className="text-gray-600 mb-4">
                View your medical history and prescriptions.
              </p>
              <Button variant="outline" className="w-full">
                View Records
              </Button>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-orange-800 mb-2">
                Profile Settings
              </h3>
              <p className="text-gray-600 mb-4">
                Update your personal information and preferences.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/profile')}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
