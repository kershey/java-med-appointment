'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  getAllActiveDoctors,
  getDoctorById,
  DoctorWithUserInfo,
} from '@/app/firebase/doctors';
import { auth } from '@/app/firebase/config';
import {
  createAppointment,
  getPatientAppointments,
} from '@/app/firebase/appointments';
import { AppointmentStatus, PaymentStatus } from '@/app/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import {
  format,
  addDays,
  isAfter,
  isBefore,
  isToday,
  parseISO,
} from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Form schema
const appointmentFormSchema = z.object({
  doctorId: z.string().min(1, { message: 'Please select a doctor' }),
  appointmentDate: z.string().min(1, { message: 'Please select a date' }),
  appointmentTime: z.string().min(1, { message: 'Please select a time' }),
  appointmentType: z.enum(['in-person', 'video'], {
    required_error: 'Please select an appointment type',
  }),
  symptoms: z
    .string()
    .min(3, { message: 'Please enter your symptoms' })
    .max(500),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// Generate date slots for the next 14 days
const generateDateSlots = () => {
  const slots = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const date = addDays(today, i);
    // Only include weekdays (Monday-Friday)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      slots.push({
        date,
        formatted: format(date, 'EEE, MMM d, yyyy'),
        value: format(date, 'yyyy-MM-dd'),
      });
    }
  }

  return slots;
};

// Generate time slots based on doctor's schedule
const generateTimeSlots = (
  doctor: DoctorWithUserInfo | undefined,
  selectedDate: string
) => {
  if (!doctor || !selectedDate) return [];

  const dayOfWeek = format(parseISO(selectedDate), 'EEEE').toLowerCase();
  const doctorSchedule = doctor.schedule[dayOfWeek];

  if (!doctorSchedule) return [];

  const startTime = doctorSchedule.start;
  const endTime = doctorSchedule.end;

  // Parse start and end time
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const slots = [];
  let hour = startHour;
  let minute = startMinute;

  // Generate 30-minute slots
  while (hour < endHour || (hour === endHour && minute < endMinute)) {
    const formattedHour = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedMinute = minute.toString().padStart(2, '0');

    slots.push(`${formattedHour}:${formattedMinute} ${ampm}`);

    // Increment by 30 minutes
    minute += 30;
    if (minute >= 60) {
      hour += 1;
      minute = 0;
    }
  }

  return slots;
};

const APPOINTMENTS_PER_DAY_LIMIT = 10; // Optional limit on appointments per day

export default function BookAppointmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitData, setSubmitData] = useState<AppointmentFormValues | null>(
    null
  );
  const [doctors, setDoctors] = useState<DoctorWithUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dateSlots] = useState(generateDateSlots());
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<{
    [key: string]: number;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  // Fetch doctors data from Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getAllActiveDoctors();
        if (result.success && result.doctors) {
          setDoctors(result.doctors);
        } else {
          console.error('Error fetching doctors:', result.error);
          setError('Failed to load doctors. Please try again.');
        }
      } catch (error) {
        console.error('Error in fetchDoctors:', error);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Check for authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setError('You must be logged in to book an appointment');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRetryFetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllActiveDoctors();
      if (result.success && result.doctors) {
        setDoctors(result.doctors);
        setError(null);
      } else {
        console.error('Error fetching doctors:', result.error);
        setError('Failed to load doctors. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleRetryFetchDoctors:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update time slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const doctor = doctors.find((d) => d.uid === selectedDoctor);
      const slots = generateTimeSlots(doctor, selectedDate);
      setTimeSlots(slots);

      // Check existing appointments for the selected doctor and date
      fetchExistingAppointments(selectedDoctor, selectedDate);
    }
  }, [selectedDoctor, selectedDate, doctors]);

  // Fetch existing appointments for the selected doctor and date
  const fetchExistingAppointments = async (doctorId: string, date: string) => {
    try {
      const result = await getPatientAppointments(auth.currentUser?.uid || '');
      if (result.success && result.appointments) {
        // Count appointments per doctor per date
        const appointmentCounts: { [key: string]: number } = {};

        result.appointments.forEach((app) => {
          const appDate = format(app.datetime, 'yyyy-MM-dd');
          const key = `${app.doctorId}_${appDate}`;
          appointmentCounts[key] = (appointmentCounts[key] || 0) + 1;
        });

        setExistingAppointments(appointmentCounts);
      }
    } catch (error) {
      console.error('Error fetching existing appointments:', error);
    }
  };

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointmentType: 'in-person',
      symptoms: '',
    },
  });

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    form.setValue('doctorId', doctorId);
    setCurrentStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    form.setValue('appointmentDate', date);
    setCurrentStep(3);
  };

  const handleTimeSelect = (time: string) => {
    form.setValue('appointmentTime', time);
    setCurrentStep(4);
  };

  const getSelectedDoctorDetails = () => {
    return doctors.find((doc) => doc.uid === selectedDoctor);
  };

  const onSubmit = async (data: AppointmentFormValues) => {
    if (!auth.currentUser) {
      setError('You must be logged in to book an appointment');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Check for duplicate appointments
      const dateKey = `${data.doctorId}_${data.appointmentDate}`;
      if (existingAppointments[dateKey] && existingAppointments[dateKey] > 0) {
        setError(
          'You already have an appointment with this doctor on this date'
        );
        setSubmitting(false);
        return;
      }

      // Parse date and time to create datetime
      const [hour, minute] = data.appointmentTime.split(':');
      const ampm = data.appointmentTime.split(' ')[1];
      let hourInt = parseInt(hour);

      if (ampm === 'PM' && hourInt !== 12) {
        hourInt += 12;
      } else if (ampm === 'AM' && hourInt === 12) {
        hourInt = 0;
      }

      const appointmentDateTime = new Date(data.appointmentDate);
      appointmentDateTime.setHours(hourInt);
      appointmentDateTime.setMinutes(parseInt(minute));

      // Create appointment in Firestore
      const appointmentData = {
        patientId: auth.currentUser.uid,
        doctorId: data.doctorId,
        datetime: appointmentDateTime,
        symptoms: data.symptoms,
        type: data.appointmentType,
        status: 'Pending' as AppointmentStatus,
        paymentStatus: 'Pending' as PaymentStatus,
        queueNumber: undefined,
      };

      const result = await createAppointment(appointmentData);

      if (result.success) {
        setSubmitData(data);
        setAppointmentId(result.appointmentId || null);
        setShowConfirmation(true);

        toast({
          title: 'Appointment Requested',
          description:
            'Your appointment has been successfully submitted and is pending approval.',
        });
      } else {
        setError('Failed to book appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (showConfirmation) {
    const doctor = doctors.find((d) => d.uid === submitData?.doctorId);

    return (
      <div>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-4">
            <div className="mx-auto rounded-full bg-green-100 p-3 w-fit">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-center text-2xl mt-4">
              Appointment Requested!
            </CardTitle>
            <CardDescription className="text-center text-base">
              Your appointment has been submitted and is pending approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  {doctor?.userInfo?.profileImage ? (
                    <AvatarImage
                      src={doctor.userInfo.profileImage}
                      alt={doctor.userInfo?.fullName || 'Doctor'}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {doctor?.userInfo?.fullName
                        ? doctor.userInfo.fullName.charAt(0)
                        : 'D'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-medium leading-snug">
                    {doctor?.fullName ||
                      doctor?.userInfo?.fullName ||
                      (doctor ? `Dr. ${doctor.uid.substring(0, 5)}` : 'Doctor')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {doctor &&
                    doctor.specializations &&
                    doctor.specializations.length > 0
                      ? doctor.specializations.join(', ')
                      : 'General Practice'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 mb-4">
                <div className="flex items-center gap-2.5 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{submitData?.appointmentDate}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{submitData?.appointmentTime}</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>
                    {submitData?.appointmentType === 'in-person'
                      ? 'In-Person Appointment'
                      : 'Video Consultation'}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm">
                <p className="text-yellow-800">
                  Your appointment is currently{' '}
                  <strong>pending approval</strong> from the clinic. You will be
                  notified once it's confirmed.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/appointments">View All Appointments</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/patient">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  router.push('/appointments');
                }
              }}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentStep > 1 ? 'Back' : 'Cancel'}
            </Button>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-10 h-1 rounded-full ${
                    step <= currentStep ? 'bg-primary' : 'bg-primary/20'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          <CardTitle className="text-2xl">
            {currentStep === 1 && 'Select a Doctor'}
            {currentStep === 2 && 'Select a Date'}
            {currentStep === 3 && 'Select a Time'}
            {currentStep === 4 && 'Appointment Details'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 &&
              'Choose a healthcare provider for your appointment'}
            {currentStep === 2 && 'Select a preferred date for your visit'}
            {currentStep === 3 && 'Choose an available time slot'}
            {currentStep === 4 && 'Provide details about your medical concern'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {error ? (
                <div className="flex flex-col items-center justify-center p-8 border border-red-200 rounded-lg bg-red-50">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-red-800 mb-2">
                    {error.includes('logged in')
                      ? 'Authentication Required'
                      : 'Error Loading Doctors'}
                  </h3>
                  <p className="text-red-600 mb-4 text-center">
                    {error.includes('logged in')
                      ? 'You need to be logged in to book an appointment'
                      : 'There was a problem retrieving doctor information'}
                  </p>
                  {error.includes('logged in') ? (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-red-300 hover:bg-red-100"
                      onClick={() => router.push('/auth/login')}
                    >
                      Sign In
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-red-300 hover:bg-red-100"
                      onClick={handleRetryFetchDoctors}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try again
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      {doctors.length === 0 ? (
                        <div className="text-center p-8">
                          <p className="text-muted-foreground mb-2">
                            No doctors are currently available.
                          </p>
                        </div>
                      ) : (
                        doctors.map((doctor) => (
                          <div
                            key={doctor.uid}
                            className={`relative rounded-lg border p-4 transition-colors hover:bg-accent/50 cursor-pointer ${
                              selectedDoctor === doctor.uid
                                ? 'border-primary bg-accent/50'
                                : 'border-muted'
                            }`}
                            onClick={() => handleDoctorSelect(doctor.uid)}
                          >
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                {doctor.userInfo?.profileImage ? (
                                  <AvatarImage
                                    src={doctor.userInfo.profileImage}
                                    alt={doctor.userInfo?.fullName || 'Doctor'}
                                  />
                                ) : (
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {doctor.userInfo?.fullName
                                      ? doctor.userInfo.fullName.charAt(0)
                                      : 'D'}
                                  </AvatarFallback>
                                )}
                              </Avatar>

                              <div className="flex-1">
                                <h3 className="font-medium">
                                  {doctor.fullName ||
                                    doctor.userInfo?.fullName ||
                                    `Dr. ${doctor.uid.substring(0, 5)}`}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {doctor.specializations?.length > 0
                                    ? doctor.specializations.join(', ')
                                    : 'General Practice'}
                                </p>
                                <div className="mt-2 flex items-center text-sm">
                                  <MapPin className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {doctor.clinicAddress ||
                                      'Location not specified'}
                                  </span>
                                </div>
                                <div className="mt-1 text-sm">
                                  <span className="font-medium">Fee:</span> ₱
                                  {doctor.consultationFee?.toLocaleString() ||
                                    '0'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {dateSlots.map((slot) => (
                          <div
                            key={slot.value}
                            className={`relative rounded-lg border p-3 transition-colors hover:bg-accent/50 cursor-pointer ${
                              selectedDate === slot.value
                                ? 'border-primary bg-accent/50'
                                : 'border-muted'
                            }`}
                            onClick={() => handleDateSelect(slot.value)}
                          >
                            <p className="text-sm font-medium">
                              {slot.formatted}
                            </p>
                            {isToday(slot.date) && (
                              <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                                Today
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      {timeSlots.length === 0 ? (
                        <div className="text-center p-8">
                          <p className="text-muted-foreground mb-2">
                            No available time slots for this date.
                          </p>
                          <Button onClick={() => setCurrentStep(2)}>
                            Choose another date
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {timeSlots.map((time) => (
                            <div
                              key={time}
                              className={`relative rounded-lg border p-3 text-center transition-colors hover:bg-accent/50 cursor-pointer ${
                                form.getValues('appointmentTime') === time
                                  ? 'border-primary bg-accent/50'
                                  : 'border-muted'
                              }`}
                              onClick={() => handleTimeSelect(time)}
                            >
                              <p className="font-medium">{time}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 4 && (
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="p-4 border rounded-lg mb-4">
                        <h3 className="font-medium mb-1">
                          Appointment Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                          {selectedDoctor && (
                            <div className="flex">
                              <span className="w-24 text-muted-foreground">
                                Doctor:
                              </span>
                              <span className="font-medium">
                                {getSelectedDoctorDetails()?.fullName ||
                                  getSelectedDoctorDetails()?.userInfo
                                    ?.fullName ||
                                  (getSelectedDoctorDetails()
                                    ? `Dr. ${getSelectedDoctorDetails()?.uid.substring(
                                        0,
                                        5
                                      )}`
                                    : 'Doctor')}
                              </span>
                            </div>
                          )}
                          {selectedDate && (
                            <div className="flex">
                              <span className="w-24 text-muted-foreground">
                                Date:
                              </span>
                              <span className="font-medium">
                                {format(parseISO(selectedDate), 'MMMM d, yyyy')}
                              </span>
                            </div>
                          )}
                          {form.getValues('appointmentTime') && (
                            <div className="flex">
                              <span className="w-24 text-muted-foreground">
                                Time:
                              </span>
                              <span className="font-medium">
                                {form.getValues('appointmentTime')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-base">Appointment Type</Label>
                          <RadioGroup
                            defaultValue={form.getValues('appointmentType')}
                            onValueChange={(value) =>
                              form.setValue(
                                'appointmentType',
                                value as 'in-person' | 'video'
                              )
                            }
                            className="grid grid-cols-2 gap-4 mt-2"
                          >
                            <div>
                              <RadioGroupItem
                                value="in-person"
                                id="in-person"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="in-person"
                                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <div className="rounded-full bg-primary/10 p-2 text-primary mb-2">
                                  <MapPin className="h-5 w-5" />
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold mb-1">
                                    In-Person
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Visit the clinic in person
                                  </div>
                                </div>
                              </Label>
                            </div>

                            <div>
                              <RadioGroupItem
                                value="video"
                                id="video"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="video"
                                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <div className="rounded-full bg-primary/10 p-2 text-primary mb-2">
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    height="24"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    width="24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4z" />
                                    <rect
                                      height="12"
                                      rx="2"
                                      width="15"
                                      x="3"
                                      y="6"
                                    />
                                  </svg>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold mb-1">
                                    Video Call
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Consult via video conference
                                  </div>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label htmlFor="symptoms" className="text-base">
                            Symptoms or Reason for Visit
                          </Label>
                          <Textarea
                            id="symptoms"
                            className="mt-2"
                            placeholder="Please describe your symptoms or reason for the appointment..."
                            rows={4}
                            {...form.register('symptoms')}
                          />
                          {form.formState.errors.symptoms && (
                            <p className="text-destructive text-sm mt-1">
                              {form.formState.errors.symptoms.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Request Appointment'
                        )}
                      </Button>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
