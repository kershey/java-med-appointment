'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { AppointmentCard } from '@/app/components/AppointmentCard';
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
  Calendar,
  Sparkles,
  FileText,
  PlusCircle,
  ArrowRight,
  Bell,
  CheckCircle2,
  User,
  FileHeart,
} from 'lucide-react';
import {
  getUpcomingPatientAppointments,
  getPastPatientAppointments,
  cancelAppointment,
  UIAppointment,
} from '@/app/firebase/appointments';

export default function PatientDashboardPage() {
  const { user, userData } = useAuth();
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    UIAppointment[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch upcoming appointments
        const upcomingResult = await getUpcomingPatientAppointments(user.uid);
        if (upcomingResult.success && upcomingResult.appointments) {
          setUpcomingAppointments(upcomingResult.appointments);
        }

        // Fetch past appointments
        const pastResult = await getPastPatientAppointments(user.uid);
        if (pastResult.success && pastResult.appointments) {
          setPastAppointments(pastResult.appointments);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (id: string) => {
    try {
      const result = await cancelAppointment(id, 'Cancelled by patient');

      if (result.success) {
        // Refresh the appointment data
        if (user) {
          const upcomingResult = await getUpcomingPatientAppointments(user.uid);
          if (upcomingResult.success && upcomingResult.appointments) {
            setUpcomingAppointments(upcomingResult.appointments);
          }
        }
      } else {
        console.error('Error cancelling appointment:', result.error);
      }
    } catch (error) {
      console.error('Error in handleCancelAppointment:', error);
    }
  };

  // Handle appointment rescheduling
  const handleRescheduleAppointment = (id: string) => {
    console.log(`Rescheduling appointment with ID: ${id}`);
    // Implementation would navigate to rescheduling page
  };

  const transformStatusForCard = (
    status: string
  ): 'confirmed' | 'pending' | 'canceled' | 'completed' => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'confirmed';
      case 'pending':
        return 'pending';
      case 'canceled':
        return 'canceled';
      case 'completed':
        return 'completed';
      default:
        return 'pending';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-medium">
              Welcome back, {userData?.firstName || 'Patient'}
            </h1>
            <p className="text-muted-foreground">
              Your health dashboard provides quick access to appointments,
              records, and care services.
            </p>
          </div>
          <div className="flex gap-3 md:self-end">
            <Button asChild>
              <Link href="/appointments/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Book Appointment
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
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">
                {upcomingAppointments.length}
              </div>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/appointments">
                View Schedule
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">2</div>
              <Bell className="h-5 w-5 text-accent" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/messages">
                View Messages
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Medical Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">7</div>
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/records">
                View Records
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Health Reminders */}
      <section className="bg-primary/5 rounded-xl p-6 border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-medium mb-1">Health Reminders</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Stay on track with your health goals and required check-ups.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-background rounded-lg p-3 border">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">Annual Physical Due</p>
                  <p className="text-xs text-muted-foreground">
                    Schedule by July 30
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-background rounded-lg p-3 border">
                <FileHeart className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Prescription Refill</p>
                  <p className="text-xs text-muted-foreground">
                    Request by next week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">My Appointments</h2>
          <div className="flex gap-2">
            <Button
              variant={showUpcoming ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowUpcoming(true)}
            >
              Upcoming
            </Button>
            <Button
              variant={!showUpcoming ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowUpcoming(false)}
            >
              Past
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="size-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto"></div>
            <p className="ml-4">Loading appointments...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {showUpcoming ? (
              upcomingAppointments.length === 0 ? (
                <div className="md:col-span-2 text-center p-8 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    You don&apos;t have any upcoming appointments.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/appointments/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Book New Appointment
                    </Link>
                  </Button>
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={{
                      ...appointment,
                      status: transformStatusForCard(appointment.status),
                    }}
                    onCancel={() => handleCancelAppointment(appointment.id)}
                    onReschedule={() =>
                      handleRescheduleAppointment(appointment.id)
                    }
                  />
                ))
              )
            ) : pastAppointments.length === 0 ? (
              <div className="md:col-span-2 text-center p-8 border border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  You don&apos;t have any past appointments.
                </p>
              </div>
            ) : (
              pastAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={{
                    ...appointment,
                    status: transformStatusForCard(appointment.status),
                  }}
                  isPast={true}
                />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
