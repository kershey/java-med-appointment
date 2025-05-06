'use client';

import { useEffect } from 'react';
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

export default function StaffDashboard() {
  const { user, userData, userRole, loading } = useAuth();
  const router = useRouter();

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
              <div className="text-3xl font-bold">0</div>
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
              <div className="text-3xl font-bold">0</div>
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
              <div className="text-3xl font-bold">0</div>
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
      </section>
    </div>
  );
}
