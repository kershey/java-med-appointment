'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import {
  CalendarDays,
  Users,
  ArrowRight,
  User,
  ClipboardList,
  Clock,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getCountFromServer,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/app/firebase/config';

export default function DoctorDashboard() {
  const { user, userData, userRole, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    activePatients: 0,
    queuePosition: 0,
    hasSetAvailability: false,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Protect the route
  useEffect(() => {
    if (!loading && (!user || userRole !== 'Doctor')) {
      router.push('/auth/login/doctor');
    }
  }, [user, userRole, loading, router]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!user || userRole !== 'Doctor') return;

      try {
        setIsLoadingStats(true);

        // Count today's appointments for this doctor
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppointmentsQuery = query(
          collection(db, 'appointments'),
          where('doctorId', '==', user.uid),
          where('datetime', '>=', today),
          where('datetime', '<', tomorrow),
          where('status', '==', 'Approved')
        );
        const todayAppointmentsSnapshot = await getCountFromServer(
          todayAppointmentsQuery
        );
        const todayAppointments = todayAppointmentsSnapshot.data().count;

        // Count active patients (unique patients with approved appointments)
        const activePatientQuery = query(
          collection(db, 'appointments'),
          where('doctorId', '==', user.uid),
          where('status', 'in', ['Approved', 'Completed'])
        );
        const activePatientSnapshot = await getDocs(activePatientQuery);
        const uniquePatientIds = new Set();
        activePatientSnapshot.docs.forEach((doc) => {
          uniquePatientIds.add(doc.data().patientId);
        });
        const activePatients = uniquePatientIds.size;

        // Check if doctor has set their availability
        const doctorScheduleQuery = query(
          collection(db, 'doctors'),
          where('uid', '==', user.uid)
        );
        const doctorSnapshot = await getDocs(doctorScheduleQuery);
        let hasSetAvailability = false;
        if (!doctorSnapshot.empty) {
          const doctorData = doctorSnapshot.docs[0].data();
          hasSetAvailability =
            Object.keys(doctorData.schedule || {}).length > 0;
        }

        setStats({
          todayAppointments,
          activePatients,
          queuePosition: 0, // Would need real-time queue data
          hasSetAvailability,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (user && userRole === 'Doctor') {
      fetchStats();
    }
  }, [user, userRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="size-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        <p className="mt-6 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If not authenticated or not a doctor, return null (useEffect will redirect)
  if (!user || userRole !== 'Doctor') {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-medium">
              Welcome, Dr. {userData?.lastName || 'Doctor'}
            </h1>
            <p className="text-muted-foreground">
              Manage your appointments, patient records, and schedule here.
            </p>
          </div>
          <div className="flex gap-3 md:self-end">
            <Button asChild>
              <Link href="/appointments/doctor">
                <CalendarDays className="mr-2 h-4 w-4" />
                View Schedule
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/doctor/profile">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Today&apos;s Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              {isLoadingStats ? (
                <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold">
                  {stats.todayAppointments}
                </div>
              )}
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/appointments/doctor">
                View Schedule
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Active Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              {isLoadingStats ? (
                <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold">{stats.activePatients}</div>
              )}
              <Users className="h-5 w-5 text-accent" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/patients">
                View Patients
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Queue Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              {isLoadingStats ? (
                <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold">
                  {stats.queuePosition || 'N/A'}
                </div>
              )}
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/queue">
                Manage Queue
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Recent Patients */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="h-5 w-48 bg-muted animate-pulse rounded mt-1"></div>
            ) : stats.activePatients > 0 ? (
              <p className="text-muted-foreground">
                You have {stats.activePatients} active patient
                {stats.activePatients !== 1 ? 's' : ''}.
              </p>
            ) : (
              <p className="text-muted-foreground">
                No recent patient records found.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/patients">
                <Users className="mr-2 h-4 w-4" />
                View All Patients
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="h-5 w-48 bg-muted animate-pulse rounded mt-1"></div>
            ) : stats.hasSetAvailability ? (
              <p className="text-muted-foreground">
                Your schedule is set. You have {stats.todayAppointments}{' '}
                appointment{stats.todayAppointments !== 1 ? 's' : ''} today.
              </p>
            ) : (
              <p className="text-muted-foreground">
                You have not set your availability yet.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/doctor/profile">
                <ClipboardList className="mr-2 h-4 w-4" />
                Update Availability
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
