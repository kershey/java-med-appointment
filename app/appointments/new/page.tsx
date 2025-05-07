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
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  getAllActiveDoctors,
  DoctorWithUserInfo,
} from '@/app/firebase/doctors';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Form schema
const appointmentFormSchema = z.object({
  doctorId: z.string().min(1, { message: 'Please select a doctor' }),
  appointmentDate: z.string().min(1, { message: 'Please select a date' }),
  appointmentTime: z.string().min(1, { message: 'Please select a time' }),
  appointmentType: z.enum(['in-person', 'video'], {
    required_error: 'Please select an appointment type',
  }),
  reasonForVisit: z
    .string()
    .min(3, { message: 'Please enter a reason for your visit' })
    .max(500),
  insurance: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// Mock time slots
const timeSlots = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
];

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

  // Fetch doctors data from Firestore
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const result = await getAllActiveDoctors();
        if (result.success && result.doctors) {
          setDoctors(result.doctors);
        } else {
          console.error('Error fetching doctors:', result.error);
        }
      } catch (error) {
        console.error('Error in fetchDoctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointmentType: 'in-person',
      reasonForVisit: '',
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

  const onSubmit = (data: AppointmentFormValues) => {
    setSubmitData(data);
    setShowConfirmation(true);

    // Here we would typically send the data to a backend API
    console.log('Appointment data:', data);

    toast({
      title: 'Appointment Booked!',
      description: 'Your appointment has been successfully scheduled.',
    });

    // Redirect to appointments page after a delay
    setTimeout(() => {
      router.push('/appointments');
    }, 3000);
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
              Appointment Confirmed!
            </CardTitle>
            <CardDescription className="text-center text-base">
              Your appointment has been successfully scheduled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {doctor?.userInfo?.fullName.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 className="font-medium leading-snug">
                    {doctor?.userInfo?.fullName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {doctor?.specializations.join(', ')}
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
            {currentStep === 1 && 'Select Doctor'}
            {currentStep === 2 && 'Select Date'}
            {currentStep === 3 && 'Select Time'}
            {currentStep === 4 && 'Appointment Details'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Choose a healthcare provider for your visit'}
            {currentStep === 2 && 'Select an available appointment date'}
            {currentStep === 3 && 'Choose a time slot for your appointment'}
            {currentStep === 4 && 'Complete your appointment details'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 1: Select Doctor */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-4">
                <h2 className="text-xl font-medium mb-4">Select a Doctor</h2>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="size-16 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="ml-4">Loading doctors...</p>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-gray-500">
                      No doctors available at the moment. Please try again
                      later.
                    </p>
                  </div>
                ) : (
                  doctors.map((doctor) => (
                    <div
                      key={doctor.uid}
                      className={`p-4 border rounded-md cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${
                        selectedDoctor === doctor.uid
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      }`}
                      onClick={() => handleDoctorSelect(doctor.uid)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={doctor.userInfo?.profileImage}
                            alt={doctor.userInfo?.fullName || ''}
                          />
                          <AvatarFallback>
                            {doctor.userInfo?.fullName
                              ?.split(' ')
                              .map((name) => name.charAt(0))
                              .join('')
                              .substring(0, 2) || 'DR'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {doctor.userInfo?.fullName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specializations.join(', ')}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Consultation Fee: ₱
                            {doctor.consultationFee.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Step 2: Select Date */}
            {currentStep === 2 && selectedDoctor && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium">Select a Date</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    type="button"
                  >
                    Change Doctor
                  </Button>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getSelectedDoctorDetails()?.userInfo?.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium leading-snug">
                        {getSelectedDoctorDetails()?.userInfo?.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getSelectedDoctorDetails()?.specializations.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {getSelectedDoctorDetails()?.availability.map((date) => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? 'default' : 'outline'}
                      className={`h-auto py-3 px-4 justify-start ${
                        selectedDate === date
                          ? ''
                          : 'border-muted-foreground/20'
                      }`}
                      onClick={() => handleDateSelect(date)}
                      type="button"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-xs text-muted-foreground">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                          })}
                        </span>
                        <span className="text-base font-medium mt-0.5">
                          {new Date(date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Select Time */}
            {currentStep === 3 && selectedDoctor && selectedDate && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium">Select a Time</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    type="button"
                  >
                    Change Date
                  </Button>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getSelectedDoctorDetails()?.userInfo?.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium leading-snug">
                        {getSelectedDoctorDetails()?.userInfo?.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getSelectedDoctorDetails()?.specializations.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="ml-15 pl-15 mt-2 text-sm flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className="h-auto py-3 justify-center border-muted-foreground/20"
                      onClick={() => handleTimeSelect(time)}
                      type="button"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Additional Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium">Appointment Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    type="button"
                  >
                    Change Time
                  </Button>
                </div>

                <div className="p-4 bg-muted/20 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getSelectedDoctorDetails()?.userInfo?.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium leading-snug">
                        {getSelectedDoctorDetails()?.userInfo?.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getSelectedDoctorDetails()?.specializations.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="ml-15 pl-15 mt-2 text-sm space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(selectedDate!).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{form.getValues().appointmentTime}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="appointmentType">Appointment Type</Label>
                      <RadioGroup
                        defaultValue={form.getValues().appointmentType}
                        onValueChange={(value) =>
                          form.setValue(
                            'appointmentType',
                            value as 'in-person' | 'video'
                          )
                        }
                        className="flex flex-col space-y-1 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in-person" id="in-person" />
                          <Label htmlFor="in-person" className="font-normal">
                            In-person visit
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="video" id="video" />
                          <Label htmlFor="video" className="font-normal">
                            Video consultation
                          </Label>
                        </div>
                      </RadioGroup>
                      {form.formState.errors.appointmentType && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.appointmentType.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="reasonForVisit">Reason for Visit</Label>
                      <textarea
                        id="reasonForVisit"
                        {...form.register('reasonForVisit')}
                        className="mt-1 w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Please briefly describe your symptoms or reason for the appointment"
                      />
                      {form.formState.errors.reasonForVisit && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.reasonForVisit.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="insurance">
                        Insurance Information (Optional)
                      </Label>
                      <Input
                        id="insurance"
                        {...form.register('insurance')}
                        className="mt-1"
                        placeholder="Insurance provider and policy number"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="submit" className="min-w-[120px]">
                    Book Appointment
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
