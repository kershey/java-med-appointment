'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {
  ListFilter,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  Filter,
  Sparkles,
  Clock,
  CalendarDays,
  CheckCircle2,
  CalendarX,
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
  isAfter,
  isBefore,
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { AppointmentCard } from '@/app/components/AppointmentCard';
import {
  getAppointmentsWithDetails,
  cancelAppointment,
  UIAppointment,
} from '@/app/firebase/appointments';

export default function AppointmentsPage() {
  const { user, userData } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'list' | 'calendar' | 'timeline'>(
    'list'
  );
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isAIFiltering, setIsAIFiltering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'upcoming' | 'past' | 'all'>(
    'upcoming'
  );
  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Fetch appointments from Firebase
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !userData || !userData.userType) return;

      try {
        setLoadingAppointments(true);
        const result = await getAppointmentsWithDetails(
          user.uid,
          userData.userType as 'Patient' | 'Doctor'
        );

        if (result.success && result.appointments) {
          setAppointments(result.appointments);
        } else {
          console.error('Error fetching appointments:', result.error);
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error in fetchAppointments:', error);
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [user, userData]);

  // Functions for calendar navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  // AI-enhanced filtering simulation
  useEffect(() => {
    if (isAIFiltering) {
      setIsLoading(true);
      // Simulate AI processing time
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isAIFiltering, searchQuery]);

  // Filter appointments based on time range
  const timeFilteredAppointments = appointments.filter((appointment) => {
    const today = new Date();

    if (timeRange === 'upcoming') {
      return isAfter(appointment.date, today) || isToday(appointment.date);
    } else if (timeRange === 'past') {
      return isBefore(appointment.date, today) && !isToday(appointment.date);
    }
    return true; // 'all' option
  });

  // Filter appointments based on search query, status, and AI features
  const filteredAppointments = timeFilteredAppointments.filter(
    (appointment) => {
      // Search matching
      const matchesSearch =
        appointment.doctorName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (appointment.doctorSpecialty &&
          appointment.doctorSpecialty
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        appointment.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Status matching
      const matchesFilter = filterStatus
        ? appointment.status === filterStatus
        : true;

      return matchesSearch && matchesFilter;
    }
  );

  // Sort appointments by date (newest first)
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  // Handle appointment cancellation
  const handleCancelAppointment = async (id: string) => {
    try {
      const result = await cancelAppointment(id, 'Cancelled by user');

      if (result.success) {
        // Update the local state to reflect the cancellation
        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment.id === id
              ? { ...appointment, status: 'Cancelled' as const }
              : appointment
          )
        );
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

  // Helper function to convert between different status formats
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

  // Helper function to safely check appointment status
  const hasStatus = (
    appointment: UIAppointment,
    statusToCheck: string
  ): boolean => {
    return appointment.status.toLowerCase() === statusToCheck.toLowerCase();
  };

  return (
    <div className="space-y-8">
      {/* Header - Updated to match dashboard style */}
      <section className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-medium">
              Medical Appointments
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Manage and track your healthcare journey with smart scheduling and
              AI-assisted preparation.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button asChild>
              <Link href="/appointments/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Appointment
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats - Updated to match dashboard style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-primary/5 rounded-xl p-4 border border-primary/20"
          >
            <p className="text-muted-foreground text-sm">Upcoming</p>
            <h3 className="text-xl font-bold">
              {
                timeFilteredAppointments.filter((a) =>
                  hasStatus(a, 'confirmed')
                ).length
              }
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-primary/5 rounded-xl p-4 border border-primary/20"
          >
            <p className="text-muted-foreground text-sm">Pending</p>
            <h3 className="text-xl font-bold">
              {
                timeFilteredAppointments.filter((a) => hasStatus(a, 'pending'))
                  .length
              }
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-primary/5 rounded-xl p-4 border border-primary/20"
          >
            <p className="text-muted-foreground text-sm">Virtual</p>
            <h3 className="text-xl font-bold">
              {
                timeFilteredAppointments.filter((a) => a.virtualAvailable)
                  .length
              }
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-primary/5 rounded-xl p-4 border border-primary/20"
          >
            <p className="text-muted-foreground text-sm">AI Pre-Diagnosis</p>
            <h3 className="text-xl font-bold">
              {timeFilteredAppointments.filter((a) => a.aiPreDiagnosis).length}
            </h3>
          </motion.div>
        </div>
      </section>

      {/* Advanced Search and Filter - Updated to match dashboard style */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="search"
                placeholder="Search appointments, doctors, locations..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                className={
                  isAIFiltering
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : ''
                }
                onClick={() => setIsAIFiltering(!isAIFiltering)}
              >
                <Sparkles
                  className={`mr-1 h-4 w-4 ${
                    isAIFiltering ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                AI Recommend
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-1 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => setTimeRange('upcoming')}
                    className={
                      timeRange === 'upcoming'
                        ? 'bg-primary/10 text-primary'
                        : ''
                    }
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Upcoming
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTimeRange('past')}
                    className={
                      timeRange === 'past' ? 'bg-primary/10 text-primary' : ''
                    }
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Past
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTimeRange('all')}
                    className={
                      timeRange === 'all' ? 'bg-primary/10 text-primary' : ''
                    }
                  >
                    <ListFilter className="mr-2 h-4 w-4" />
                    All
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Status Filters - Pill Style - Updated to match dashboard style */}
          <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
            <Badge
              variant={filterStatus === null ? 'default' : 'outline'}
              className="cursor-pointer rounded-full px-4 py-1 text-sm"
              onClick={() => setFilterStatus(null)}
            >
              All
            </Badge>
            <Badge
              variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
              className="cursor-pointer rounded-full px-4 py-1 text-sm"
              onClick={() => setFilterStatus('confirmed')}
            >
              Confirmed
            </Badge>
            <Badge
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              className="cursor-pointer rounded-full px-4 py-1 text-sm"
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </Badge>
            <Badge
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              className="cursor-pointer rounded-full px-4 py-1 text-sm"
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </Badge>
            <Badge
              variant={filterStatus === 'canceled' ? 'default' : 'outline'}
              className="cursor-pointer rounded-full px-4 py-1 text-sm"
              onClick={() => setFilterStatus('canceled')}
            >
              Canceled
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle and Content - Updated to match dashboard style */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <Tabs
              value={viewType}
              onValueChange={(value) =>
                setViewType(value as 'list' | 'calendar' | 'timeline')
              }
              className="w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="max-w-md w-full">
                  <TabsList className="grid grid-cols-3 p-1">
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>
                </div>

                <div className="text-sm text-muted-foreground flex items-center">
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></div>
                      <span>AI processing...</span>
                    </motion.div>
                  ) : (
                    <span>{sortedAppointments.length} appointments</span>
                  )}
                </div>
              </div>

              {/* List View - Updated to match dashboard style */}
              <TabsContent value="list" className="mt-2">
                <AnimatePresence>
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-center items-center h-64"
                    >
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
                        <p className="text-muted-foreground">
                          Analyzing your appointments with AI...
                        </p>
                      </div>
                    </motion.div>
                  ) : loadingAppointments ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="size-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto"></div>
                      <p className="ml-4">Loading appointments...</p>
                    </div>
                  ) : sortedAppointments.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {sortedAppointments.map((appointment, index) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <AppointmentCard
                            key={appointment.id}
                            appointment={{
                              ...appointment,
                              status: transformStatusForCard(
                                appointment.status
                              ),
                            }}
                            onCancel={() =>
                              handleCancelAppointment(appointment.id)
                            }
                            onReschedule={() =>
                              handleRescheduleAppointment(appointment.id)
                            }
                          />

                          {/* Enhanced Features - Updated to match dashboard style */}
                          {(appointment.virtualAvailable ||
                            appointment.aiPreDiagnosis ||
                            appointment.preparationSteps) && (
                            <div className="mt-2 space-y-2">
                              {appointment.virtualAvailable && (
                                <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 p-2 text-sm">
                                  <div className="flex items-center">
                                    <Badge
                                      variant="outline"
                                      className="bg-primary/10 text-primary mr-2"
                                    >
                                      Virtual Available
                                    </Badge>
                                    <span className="text-foreground">
                                      Telehealth option
                                    </span>
                                  </div>
                                  {appointment.teleHealthUrl &&
                                    hasStatus(appointment, 'confirmed') && (
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="text-primary p-0"
                                        asChild
                                      >
                                        <Link href={appointment.teleHealthUrl}>
                                          Join Virtual
                                        </Link>
                                      </Button>
                                    )}
                                </div>
                              )}

                              {appointment.aiPreDiagnosis && (
                                <div className="flex items-center gap-2 rounded-lg bg-accent/5 border border-accent/20 p-2 text-sm">
                                  <Badge
                                    variant="outline"
                                    className="bg-accent/10 text-accent"
                                  >
                                    AI Pre-Diagnosis
                                  </Badge>
                                  <span className="text-foreground">
                                    Available 24h before appointment
                                  </span>
                                </div>
                              )}

                              {appointment.preparationSteps &&
                                appointment.preparationSteps.length > 0 && (
                                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-2 text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant="outline"
                                        className="bg-primary/10 text-primary"
                                      >
                                        Preparation Required
                                      </Badge>
                                    </div>
                                    <ul className="text-muted-foreground text-xs pl-4 mt-1 space-y-1">
                                      {appointment.preparationSteps.map(
                                        (step, i) => (
                                          <li key={i} className="list-disc">
                                            {step}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center p-10 text-center border border-dashed rounded-xl bg-card"
                    >
                      <ListFilter className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">
                        No appointments found
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        {searchQuery
                          ? `No appointments match your search for "${searchQuery}"`
                          : `You have no ${
                              filterStatus ? filterStatus : ''
                            } appointments ${
                              timeRange === 'upcoming'
                                ? 'coming up'
                                : timeRange === 'past'
                                ? 'in the past'
                                : ''
                            }`}
                      </p>
                      <Button asChild>
                        <Link href="/appointments/new">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Book New Appointment
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              {/* Calendar View - Updated to match dashboard style */}
              <TabsContent value="calendar" className="mt-2">
                <Card className="border-none shadow-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-medium">
                        {format(currentDate, 'MMMM yyyy')}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={prevMonth}
                          className="h-8 w-8"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentDate(new Date())}
                        >
                          Today
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={nextMonth}
                          className="h-8 w-8"
                        >
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

                    <div className="grid grid-cols-7 gap-2">
                      {/* Empty cells for days before the start of the month */}
                      {Array.from({ length: startDay }).map((_, i) => (
                        <div
                          key={`empty-start-${i}`}
                          className="p-2 rounded-xl h-24 border border-transparent"
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
                            className={`p-1 rounded-xl border h-28 relative overflow-hidden transition-all duration-200 ${
                              isToday(day)
                                ? 'bg-primary/5 border-primary/20'
                                : isSameMonth(day, currentDate)
                                ? 'bg-card border-border hover:border-primary/20'
                                : 'bg-muted/30 border-transparent text-muted-foreground'
                            }`}
                          >
                            <div
                              className={`text-sm font-medium mb-1 p-1 rounded-full w-7 h-7 flex items-center justify-center ${
                                isToday(day)
                                  ? 'bg-primary text-primary-foreground'
                                  : ''
                              }`}
                            >
                              {format(day, 'd')}
                            </div>

                            <div className="space-y-1">
                              {dayAppointments.slice(0, 2).map((appt) => (
                                <Link
                                  key={appt.id}
                                  href={`/appointments/${appt.id}`}
                                  className={`block text-xs truncate px-2 py-1 rounded-lg ${
                                    hasStatus(appt, 'confirmed')
                                      ? 'bg-primary/10 text-primary'
                                      : hasStatus(appt, 'pending')
                                      ? 'bg-amber-500/10 text-amber-500'
                                      : hasStatus(appt, 'canceled')
                                      ? 'bg-destructive/10 text-destructive'
                                      : 'bg-accent/10 text-accent'
                                  }`}
                                >
                                  {format(appt.date, 'h:mm a')} ·{' '}
                                  {appt.doctorName.split(' ')[1]}
                                </Link>
                              ))}

                              {dayAppointments.length > 2 && (
                                <div className="text-xs px-2 py-0.5 text-muted-foreground font-medium bg-muted/50 rounded-lg">
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

              {/* Timeline View - Updated to match dashboard style */}
              <TabsContent value="timeline" className="mt-2">
                <div className="space-y-6">
                  {sortedAppointments.length > 0 ? (
                    <>
                      <div className="relative">
                        {/* Timeline */}
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-4 md:ml-6"></div>

                        {/* Appointments on timeline */}
                        <div className="space-y-8 relative">
                          {sortedAppointments.map((appointment, index) => (
                            <motion.div
                              key={appointment.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex gap-4 md:gap-6 relative"
                            >
                              {/* Timeline node */}
                              <div
                                className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex-shrink-0 flex items-center justify-center z-10 ${
                                  hasStatus(appointment, 'confirmed')
                                    ? 'bg-primary/10 text-primary'
                                    : hasStatus(appointment, 'pending')
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : hasStatus(appointment, 'canceled')
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'bg-accent/10 text-accent'
                                }`}
                              >
                                {hasStatus(appointment, 'confirmed') && (
                                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                                )}
                                {hasStatus(appointment, 'pending') && (
                                  <Clock className="h-4 w-4 md:h-5 md:w-5" />
                                )}
                                {hasStatus(appointment, 'canceled') && (
                                  <CalendarX className="h-4 w-4 md:h-5 md:w-5" />
                                )}
                                {hasStatus(appointment, 'completed') && (
                                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                                )}
                              </div>

                              {/* Appointment card */}
                              <div className="flex-1 bg-card rounded-xl shadow-sm border border-border p-4 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                  <div>
                                    <h3 className="font-medium text-lg">
                                      {appointment.doctorName}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                      {appointment.doctorSpecialty}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={`${
                                        hasStatus(appointment, 'confirmed')
                                          ? 'bg-primary/10 text-primary'
                                          : hasStatus(appointment, 'pending')
                                          ? 'bg-amber-500/10 text-amber-500'
                                          : hasStatus(appointment, 'canceled')
                                          ? 'bg-destructive/10 text-destructive'
                                          : 'bg-accent/10 text-accent'
                                      }`}
                                    >
                                      {appointment.status
                                        .charAt(0)
                                        .toUpperCase() +
                                        appointment.status.slice(1)}
                                    </Badge>

                                    {appointment.virtualAvailable && (
                                      <Badge
                                        variant="outline"
                                        className="bg-primary/10 text-primary"
                                      >
                                        Virtual
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 mt-3">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <CalendarDays className="h-4 w-4" />
                                      <span>
                                        {format(
                                          appointment.date,
                                          'EEEE, MMMM d, yyyy'
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Clock className="h-4 w-4" />
                                      <span>{appointment.time}</span>
                                    </div>
                                  </div>

                                  <div className="sm:text-right space-y-2">
                                    {appointment.estimatedWaitTime && (
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">
                                          Est. wait:
                                        </span>{' '}
                                        <span className="font-medium">
                                          {appointment.estimatedWaitTime}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex gap-2 sm:justify-end">
                                      {!hasStatus(appointment, 'completed') &&
                                        !hasStatus(appointment, 'canceled') && (
                                          <>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleRescheduleAppointment(
                                                  appointment.id
                                                )
                                              }
                                            >
                                              Reschedule
                                            </Button>

                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                handleCancelAppointment(
                                                  appointment.id
                                                )
                                              }
                                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                              Cancel
                                            </Button>
                                          </>
                                        )}

                                      <Button
                                        variant="default"
                                        size="sm"
                                        asChild
                                      >
                                        <Link
                                          href={`/appointments/${appointment.id}`}
                                        >
                                          Details
                                        </Link>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center p-10 text-center border border-dashed rounded-xl bg-card"
                    >
                      <ListFilter className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">
                        No appointments found
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        {searchQuery
                          ? `No appointments match your search for "${searchQuery}"`
                          : `You have no ${
                              filterStatus ? filterStatus : ''
                            } appointments ${
                              timeRange === 'upcoming'
                                ? 'coming up'
                                : timeRange === 'past'
                                ? 'in the past'
                                : ''
                            }`}
                      </p>
                      <Button asChild>
                        <Link href="/appointments/new">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Book New Appointment
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
