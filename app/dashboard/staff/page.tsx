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
  ClipboardCheck,
  CreditCard,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '@/app/firebase/config';

export default function StaffDashboard() {
  const { user, userData, userRole, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    todayQueue: 0,
    recentPayments: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Protect the route
  useEffect(() => {
    // Check if we have a redirection flag in sessionStorage
    const redirectFlag = sessionStorage.getItem('redirectToStaffDashboard');
    if (redirectFlag) {
      console.log('[StaffDashboard] Found redirect flag, clearing it');
      sessionStorage.removeItem('redirectToStaffDashboard');
    }

    if (!loading && (!user || userRole !== 'Staff')) {
      router.push('/auth/login/staff');
    }
  }, [user, userRole, loading, router]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!user || userRole !== 'Staff') return;

      try {
        setIsLoadingStats(true);

        // Count pending appointments
        const pendingAppointmentsQuery = query(
          collection(db, 'appointments'),
          where('status', '==', 'Pending')
        );
        const pendingAppointmentsSnapshot = await getCountFromServer(
          pendingAppointmentsQuery
        );
        const pendingAppointments = pendingAppointmentsSnapshot.data().count;

        // Count today's queue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayQueueQuery = query(
          collection(db, 'appointments'),
          where('datetime', '>=', today),
          where('datetime', '<', tomorrow),
          where('status', '==', 'Approved')
        );
        const todayQueueSnapshot = await getCountFromServer(todayQueueQuery);
        const todayQueue = todayQueueSnapshot.data().count;

        // Count recent payments (last 7 days)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const recentPaymentsQuery = query(
          collection(db, 'appointments'),
          where('paymentStatus', '==', 'Paid'),
          where('updatedAt', '>=', lastWeek)
        );
        const recentPaymentsSnapshot = await getCountFromServer(
          recentPaymentsQuery
        );
        const recentPayments = recentPaymentsSnapshot.data().count;

        setStats({
          pendingAppointments,
          todayQueue,
          recentPayments,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (user && userRole === 'Staff') {
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

  // If not authenticated or not a staff member, return null (useEffect will redirect)
  if (!user || userRole !== 'Staff') {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-medium">
              Welcome, {userData?.firstName || 'Staff Member'}
            </h1>
            <p className="text-muted-foreground">
              Manage appointments, patients, and clinic operations here.
            </p>
          </div>
          <div className="flex gap-3 md:self-end">
            <Button asChild>
              <Link href="/appointments/manage">
                <CalendarDays className="mr-2 h-4 w-4" />
                Manage Appointments
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                My Profile
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
              Pending Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              {isLoadingStats ? (
                <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold">
                  {stats.pendingAppointments}
                </div>
              )}
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/appointments/pending">
                Manage Appointments
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Today&apos;s Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              {isLoadingStats ? (
                <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold">{stats.todayQueue}</div>
              )}
              <Users className="h-5 w-5 text-accent" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/queue/manage">
                Manage Queue
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              {isLoadingStats ? (
                <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold">{stats.recentPayments}</div>
              )}
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/payments">
                Payment Records
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Additional Management Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Access and manage patient records, update information, and handle
              registrations.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/patients/manage">
                <Users className="mr-2 h-4 w-4" />
                Patient Records
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clinic Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage day-to-day clinic operations, resources, and schedules.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/clinic/operations">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Manage Operations
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Access and manage user records, update information, and handle
              registrations.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/staff/users">
                <Users className="mr-2 h-4 w-4" />
                User Management
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
