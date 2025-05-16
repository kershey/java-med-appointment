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
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Clock,
  CalendarDays,
  MapPin,
  Loader2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  getUpcomingPatientAppointments,
  getPastPatientAppointments,
  cancelAppointment,
  UIAppointment,
  getAppointmentsWithDetails,
} from '@/app/firebase/appointments';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { getDoctorById } from '@/app/firebase/doctors';

export default function PatientDashboardPage() {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    UIAppointment[]
  >([]);
  const [pastAppointments, setPastAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Fetch appointment data with additional doctor information
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch appointments with doctor details
        const appointmentsResult = await getAppointmentsWithDetails(
          user.uid,
          'Patient'
        );

        if (appointmentsResult.success && appointmentsResult.appointments) {
          // Separate upcoming and past appointments
          const now = new Date();
          const upcoming: UIAppointment[] = [];
          const past: UIAppointment[] = [];

          appointmentsResult.appointments.forEach((appointment) => {
            if (
              appointment.date > now ||
              appointment.status === 'Pending' ||
              appointment.status === 'Approved'
            ) {
              upcoming.push(appointment);
            } else {
              past.push(appointment);
            }
          });

          // Sort upcoming by date
          upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
          // Sort past by date descending
          past.sort((a, b) => b.date.getTime() - a.date.getTime());

          setUpcomingAppointments(upcoming);
          setPastAppointments(past);
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
      setCancelling(id);
      const result = await cancelAppointment(id, 'Cancelled by patient');

      if (result.success) {
        toast({
          title: 'Appointment Cancelled',
          description: 'Your appointment has been successfully cancelled.',
        });

        // Remove the cancelled appointment from the list
        setUpcomingAppointments((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: 'Cancelled' } : app
          )
        );
      } else {
        toast({
          title: 'Error',
          description: 'Failed to cancel appointment. Please try again.',
          variant: 'destructive',
        });
        console.error('Error cancelling appointment:', result.error);
      }
    } catch (error) {
      console.error('Error in handleCancelAppointment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancelling(null);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
                {
                  upcomingAppointments.filter(
                    (app) => app.status !== 'Cancelled'
                  ).length
                }
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

      {/* Appointments Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium">Your Appointments</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/appointments">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : upcomingAppointments.filter((app) => app.status !== 'Cancelled')
                .length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Upcoming Appointments
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                    You don't have any upcoming appointments scheduled. Would
                    you like to book one now?
                  </p>
                  <Button asChild>
                    <Link href="/appointments/new">Book an Appointment</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingAppointments
                  .filter((app) => app.status !== 'Cancelled')
                  .slice(0, 5)
                  .map((appointment) => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-muted p-6 md:w-48 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r">
                          <CalendarDays className="h-8 w-8 text-primary mb-2" />
                          <p className="text-lg font-medium text-center">
                            {format(appointment.date, 'MMM d')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(appointment.date, 'EEEE, yyyy')}
                          </p>
                          <div className="mt-2 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-sm">{appointment.time}</span>
                          </div>
                        </div>

                        <div className="flex-1 p-6">
                          <div className="flex justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {appointment.doctorName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {appointment.doctorName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.doctorSpecialty}
                                </p>
                              </div>
                            </div>
                            <div>
                              <div
                                className={`text-xs px-2.5 py-0.5 rounded-full border ${getStatusBadgeColor(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 mb-4">
                            <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {appointment.virtualAvailable
                                  ? 'Video Consultation'
                                  : 'In-Person Visit'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {appointment.location}
                              </p>
                            </div>
                          </div>

                          {appointment.status === 'Approved' &&
                            appointment.queueNumber && (
                              <div className="bg-accent/20 p-3 rounded border border-accent/30 mb-4">
                                <p className="text-sm font-medium">
                                  Queue Number:{' '}
                                  <span className="text-accent font-bold">
                                    {appointment.queueNumber}
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Your assigned queue number for this
                                  appointment
                                </p>
                              </div>
                            )}

                          <div className="flex gap-2 mt-4">
                            <Button size="sm" asChild>
                              <Link href={`/appointments/${appointment.id}`}>
                                View Details
                              </Link>
                            </Button>

                            {appointment.status !== 'Completed' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    {cancelling === appointment.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                      <XCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Cancel
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Cancel Appointment
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel this
                                      appointment? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Keep Appointment
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleCancelAppointment(appointment.id)
                                      }
                                    >
                                      Yes, Cancel Appointment
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Past Appointments
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    You don't have any past appointments in our records.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pastAppointments.slice(0, 5).map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle>{appointment.doctorName}</CardTitle>
                          <CardDescription>
                            {appointment.doctorSpecialty}
                          </CardDescription>
                        </div>
                        <div
                          className={`text-xs px-2.5 py-0.5 h-fit rounded-full border ${getStatusBadgeColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{format(appointment.date, 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {appointment.virtualAvailable
                              ? 'Video Consultation'
                              : 'In-Person Visit'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/appointments/${appointment.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
