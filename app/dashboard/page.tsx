'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/app/firebase/auth';
import {
  CalendarDays,
  FileText,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BellRing,
  CalendarClock,
  MessageSquare,
  User,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="size-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return null; // Redirect handled by useEffect
  }

  // Mock data for the dashboard
  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: 'Tomorrow, 10:00 AM',
      status: 'confirmed',
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      specialty: 'General Medicine',
      date: 'Friday, May 12, 2:30 PM',
      status: 'pending',
    },
  ];

  const recentNotifications = [
    {
      id: 1,
      title: 'Appointment Reminder',
      message:
        'Your appointment with Dr. Sarah Johnson is tomorrow at 10:00 AM',
      time: '2 hours ago',
      type: 'reminder',
    },
    {
      id: 2,
      title: 'Prescription Ready',
      message: 'Your prescription for Amoxicillin is ready for pickup',
      time: '1 day ago',
      type: 'info',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="bg-card border-b border-border/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="text-primary h-5 w-5" />
              <h1 className="text-lg font-medium">Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button size="sm" variant="ghost" className="relative">
                <BellRing className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 size-2 bg-primary rounded-full"></span>
              </Button>

              <Button size="sm" variant="ghost" className="gap-2">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">{userData.firstName}</span>
              </Button>

              <Button size="sm" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>
                Welcome back, {userData.firstName} {userData.lastName}
              </CardTitle>
              <CardDescription>
                Here's what's happening with your health today.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-lg">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarClock className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="font-medium">
                    {upcomingAppointments.length} Appointments
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-secondary/30 p-4 rounded-lg">
                <div className="size-10 rounded-lg bg-secondary/40 flex items-center justify-center">
                  <MessageSquare className="size-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="font-medium">2 Unread</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-accent/10 p-4 rounded-lg">
                <div className="size-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <FileText className="size-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="font-medium">3 New Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointments Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>
                    Your schedule for the next 7 days
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/appointments')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`size-10 rounded-full flex items-center justify-center ${
                              appointment.status === 'confirmed'
                                ? 'bg-accent/10 text-accent'
                                : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {appointment.status === 'confirmed' ? (
                              <CheckCircle2 className="size-5" />
                            ) : (
                              <Clock className="size-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{appointment.doctor}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.specialty}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{appointment.date}</p>
                          <p
                            className={`text-sm ${
                              appointment.status === 'confirmed'
                                ? 'text-accent'
                                : 'text-primary'
                            }`}
                          >
                            {appointment.status === 'confirmed'
                              ? 'Confirmed'
                              : 'Pending'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      No upcoming appointments
                    </p>
                    <Button
                      onClick={() => router.push('/appointments')}
                      variant="secondary"
                      className="mt-4"
                    >
                      Book Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-secondary/10 flex justify-center">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push('/appointments')}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Medical Records</CardTitle>
                <CardDescription>
                  Your latest tests and medical documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <FileText className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Blood Test Results</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: Apr 15, 2023
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md bg-accent/10 flex items-center justify-center">
                      <FileText className="size-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">X-Ray Report</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: Mar 28, 2023
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
              <CardFooter className="border-t bg-secondary/10 flex justify-center">
                <Button variant="ghost" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Records
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Your recent alerts and messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex gap-3 items-start border-b border-border/50 pb-4 last:border-0"
                    >
                      <div
                        className={`size-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                          notification.type === 'reminder'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent/10 text-accent'
                        }`}
                      >
                        {notification.type === 'reminder' ? (
                          <BellRing className="size-4" />
                        ) : (
                          <AlertCircle className="size-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-secondary/10 flex justify-center">
                <Button variant="ghost" className="w-full">
                  View All Notifications
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/appointments')}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Doctor
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Update Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
