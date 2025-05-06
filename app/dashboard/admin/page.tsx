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
  Settings,
  Shield,
  BarChart3,
  BadgeCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, userData, userRole, loading } = useAuth();
  const router = useRouter();

  // Protect the route
  useEffect(() => {
    if (!loading && (!user || userRole !== 'Admin')) {
      router.push('/auth/login/admin');
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

  // If not authenticated or not an admin, return null (useEffect will redirect)
  if (!user || userRole !== 'Admin') {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-medium">
              Welcome, {userData?.firstName || 'Administrator'}
            </h1>
            <p className="text-muted-foreground">
              Manage all aspects of the Java Medical Clinic system here.
            </p>
          </div>
          <div className="flex gap-3 md:self-end">
            <Button asChild>
              <Link href="/dashboard/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                System Settings
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

      {/* System Status */}
      <section className="bg-primary/5 rounded-xl p-6 border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-medium mb-1">System Status</h2>
            <p className="text-green-600 text-sm font-medium mb-2">
              All systems operational
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-lg font-medium">1</p>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-sm text-muted-foreground">Active Doctors</p>
                <p className="text-lg font-medium">0</p>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-sm text-muted-foreground">
                  Appointments Today
                </p>
                <p className="text-lg font-medium">0</p>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-sm text-muted-foreground">
                  Pending Applications
                </p>
                <p className="text-lg font-medium">0</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">1</div>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/dashboard/admin/users">
                Manage Users
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Doctor Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">0</div>
              <Shield className="h-5 w-5 text-accent" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/dashboard/doctor-management">
                Review Applications
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              System Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">4</div>
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/dashboard/admin/reports">
                View Reports
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Management Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage all user accounts, permissions, and roles within the
              system.
            </p>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin/doctors">
                <Users className="mr-2 h-4 w-4" />
                Manage Doctors
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin/users?filter=Staff">
                <Users className="mr-2 h-4 w-4" />
                Manage Staff
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clinic Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configure clinic-wide settings, specializations, and parameters.
            </p>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin/specializations">
                <BadgeCheck className="mr-2 h-4 w-4" />
                Specializations
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* System Reports */}
      <Card>
        <CardHeader>
          <CardTitle>System Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Access and generate various reports for the clinic.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              asChild
            >
              <Link href="/dashboard/admin/reports/appointments">
                <CalendarDays className="mr-2 h-4 w-4" />
                Appointment Reports
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              asChild
            >
              <Link href="/dashboard/admin/reports/payments">
                <BarChart3 className="mr-2 h-4 w-4" />
                Payment Reports
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              asChild
            >
              <Link href="/dashboard/admin/reports/doctors">
                <Shield className="mr-2 h-4 w-4" />
                Doctor Performance
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start"
              asChild
            >
              <Link href="/dashboard/admin/reports/logs">
                <Settings className="mr-2 h-4 w-4" />
                System Logs
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
