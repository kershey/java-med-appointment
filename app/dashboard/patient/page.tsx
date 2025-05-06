'use client';

import { useState } from 'react';
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

export default function PatientDashboardPage() {
  const { userData } = useAuth();
  const [showUpcoming, setShowUpcoming] = useState(true);

  // Mock data for upcoming appointments
  const upcomingAppointments = [
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialty: 'Cardiology',
      date: new Date(2023, 5, 25, 10, 0),
      time: '10:00 AM - 10:30 AM',
      location: 'Main Clinic, Room 204',
      status: 'confirmed',
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      doctorSpecialty: 'General Medicine',
      date: new Date(2023, 6, 12, 14, 30),
      time: '2:30 PM - 3:00 PM',
      location: 'North Branch, Room 105',
      status: 'pending',
    },
  ] as const;

  // Mock data for past appointments
  const pastAppointments = [
    {
      id: '3',
      doctorName: 'Dr. James Wilson',
      doctorSpecialty: 'Dermatology',
      date: new Date(2023, 4, 15, 9, 0),
      time: '9:00 AM - 9:30 AM',
      location: 'Main Clinic, Room 302',
      status: 'completed',
    },
    {
      id: '4',
      doctorName: 'Dr. Lisa Thompson',
      doctorSpecialty: 'Neurology',
      date: new Date(2023, 3, 28, 13, 0),
      time: '1:00 PM - 2:00 PM',
      location: 'Main Clinic, Room 118',
      status: 'completed',
    },
  ] as const;

  // Handle appointment cancellation
  const handleCancelAppointment = (id: string) => {
    console.log(`Cancelling appointment with ID: ${id}`);
    // Implementation would connect to backend cancellation service
  };

  // Handle appointment rescheduling
  const handleRescheduleAppointment = (id: string) => {
    console.log(`Rescheduling appointment with ID: ${id}`);
    // Implementation would navigate to rescheduling page
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

        <div className="grid gap-4 md:grid-cols-2">
          {showUpcoming
            ? upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onCancel={() => handleCancelAppointment(appointment.id)}
                  onReschedule={() =>
                    handleRescheduleAppointment(appointment.id)
                  }
                />
              ))
            : pastAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  isPast
                />
              ))}
        </div>
      </section>
    </div>
  );
}
