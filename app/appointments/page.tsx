'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { AppointmentCard } from '@/app/components/AppointmentCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ArrowRight,
  Search,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
} from 'date-fns';

export default function AppointmentsPage() {
  const { userData } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Mock data for appointments
  const appointments = [
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
    {
      id: '5',
      doctorName: 'Dr. Robert Garcia',
      doctorSpecialty: 'Orthopedics',
      date: new Date(2023, 5, 5, 11, 0),
      time: '11:00 AM - 11:45 AM',
      location: 'Main Clinic, Room 145',
      status: 'canceled',
    },
  ] as const;

  // Functions for calendar navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  // Filter appointments based on search query and status
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.doctorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      appointment.doctorSpecialty
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      appointment.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus
      ? appointment.status === filterStatus
      : true;

    return matchesSearch && matchesFilter;
  });

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your medical appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/appointments/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Book Appointment
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by doctor, specialty or location..."
            className="w-full pl-9 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(null)}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('confirmed')}
          >
            Confirmed
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <Tabs
        value={viewType}
        onValueChange={(value) => setViewType(value as 'list' | 'calendar')}
        className="w-full"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            {sortedAppointments.length} appointments
          </div>
        </div>

        {/* List View */}
        <TabsContent value="list" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedAppointments.length > 0 ? (
              sortedAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  id={appointment.id}
                  doctorName={appointment.doctorName}
                  doctorSpecialty={appointment.doctorSpecialty}
                  date={appointment.date}
                  time={appointment.time}
                  location={appointment.location}
                  status={appointment.status}
                  onCancelClick={
                    appointment.status !== 'completed' &&
                    appointment.status !== 'canceled'
                      ? handleCancelAppointment
                      : undefined
                  }
                  onRescheduleClick={
                    appointment.status !== 'completed' &&
                    appointment.status !== 'canceled'
                      ? handleRescheduleAppointment
                      : undefined
                  }
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-8 text-center border rounded-xl bg-muted/10">
                <ListFilter className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">
                  No appointments found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? `No appointments match your search for "${searchQuery}"`
                    : 'You have no appointments with the selected filter'}
                </p>
                <Button asChild>
                  <Link href="/appointments/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Book New Appointment
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <div key={day} className="text-sm font-medium py-1">
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the start of the month */}
                {Array.from({ length: startDay }).map((_, i) => (
                  <div
                    key={`empty-start-${i}`}
                    className="p-2 rounded-md h-24 border border-transparent"
                  ></div>
                ))}

                {/* Calendar days */}
                {daysInMonth.map((day) => {
                  const dayAppointments = appointments.filter(
                    (appt) =>
                      day.getDate() === appt.date.getDate() &&
                      day.getMonth() === appt.date.getMonth() &&
                      day.getFullYear() === appt.date.getFullYear()
                  );

                  return (
                    <div
                      key={day.toString()}
                      className={`p-1 rounded-md border h-24 relative overflow-hidden ${
                        isToday(day)
                          ? 'bg-primary/5 border-primary'
                          : isSameMonth(day, currentDate)
                          ? 'bg-card border-border/60 hover:border-primary/50'
                          : 'bg-muted/20 border-transparent text-muted-foreground/60'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1 p-1">
                        {format(day, 'd')}
                      </div>

                      <div className="space-y-1">
                        {dayAppointments.slice(0, 2).map((appt) => (
                          <Link
                            key={appt.id}
                            href={`/appointments/${appt.id}`}
                            className={`block text-xs truncate px-1.5 py-0.5 rounded ${
                              appt.status === 'confirmed'
                                ? 'bg-primary/10 text-primary'
                                : appt.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-500'
                                : appt.status === 'canceled'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-accent/10 text-accent'
                            }`}
                          >
                            {format(appt.date, 'h:mm a')} -{' '}
                            {appt.doctorName.split(' ')[1]}
                          </Link>
                        ))}

                        {dayAppointments.length > 2 && (
                          <div className="text-xs px-1.5 text-muted-foreground">
                            +{dayAppointments.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
