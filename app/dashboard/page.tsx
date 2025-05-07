'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/app/firebase/auth';
import {
  getUpcomingPatientAppointments,
  UIAppointment,
} from '@/app/firebase/appointments';
import {
  DoctorWithUserInfo,
  getAllActiveDoctors,
} from '@/app/firebase/doctors';
import {
  Clock,
  BellRing,
  User,
  CalendarClock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: string;
}

export default function DashboardPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    UIAppointment[]
  >([]);
  const [recentNotifications, setRecentNotifications] = useState<
    Notification[]
  >([]);
  const [doctors, setDoctors] = useState<DoctorWithUserInfo[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoadingData(true);

        // Fetch upcoming appointments
        const appointmentsResult = await getUpcomingPatientAppointments(
          user.uid,
          2
        );
        if (appointmentsResult.success && appointmentsResult.appointments) {
          setUpcomingAppointments(appointmentsResult.appointments);
        }

        // If there are fewer than 2 upcoming appointments, fetch top doctors
        if (
          !appointmentsResult.appointments ||
          appointmentsResult.appointments.length < 2
        ) {
          const doctorsResult = await getAllActiveDoctors();
          if (doctorsResult.success && doctorsResult.doctors) {
            setDoctors(doctorsResult.doctors.slice(0, 3));
          }
        }

        // For notifications, we'll keep a simple mock version for now
        // This could be expanded with a real notifications system in the future
        setRecentNotifications([
          {
            id: 1,
            title: 'Appointment Reminder',
            message: 'Your next appointment is coming up soon',
            time: '2 hours ago',
            type: 'reminder',
          },
          {
            id: 2,
            title: 'New Message',
            message: 'You have a new message from your doctor',
            time: '1 day ago',
            type: 'info',
          },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleLogout = async () => {
    await logoutUser();
    router.push('/auth/login');
  };

  if (loading || loadingData) {
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
                Here&apos;s what&apos;s happening with your health today.
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
                  <MessageSquare className="size-5 text-accent" />
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
                          <div className="size-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                            <CheckCircle2 className="size-5" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {appointment.doctorName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.doctorSpecialty}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {format(appointment.date, 'MMM d, h:mm a')}
                          </p>
                          <p className="text-sm text-accent">
                            {appointment.status}
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
                      onClick={() => router.push('/appointments/new')}
                      variant="secondary"
                      className="mt-4"
                    >
                      Book an Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Doctors Section - show if fewer than 2 appointments */}
            {upcomingAppointments.length < 2 && doctors.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recommended Doctors</CardTitle>
                    <CardDescription>
                      Top-rated specialists available for consultation
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/doctors')}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.uid}
                        className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            {doctor.userInfo?.fullName.charAt(0) || 'D'}
                          </div>
                          <div>
                            <p className="font-medium">
                              {doctor.userInfo?.fullName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {doctor.specializations.join(', ')}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/doctors/${doctor.uid}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Notifications Section */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>
                    Stay updated on your health appointments
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Mark All Read
                </Button>
              </CardHeader>
              <CardContent>
                {recentNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex gap-4 border-b border-border/50 pb-4 last:border-0"
                      >
                        <div
                          className={`size-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                            notification.type === 'reminder'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-accent/10 text-accent'
                          }`}
                        >
                          {notification.type === 'reminder' ? (
                            <Clock className="h-5 w-5" />
                          ) : (
                            <AlertCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {notification.time}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      No recent notifications
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
