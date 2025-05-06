'use client';

import { useState } from 'react';
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

// Mock data for doctors
const doctors = [
  {
    id: 'dr-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    availability: ['2023-06-15', '2023-06-16', '2023-06-17'],
    image: '/doctors/doctor1.jpg',
  },
  {
    id: 'dr-2',
    name: 'Dr. Michael Chen',
    specialty: 'General Medicine',
    availability: ['2023-06-15', '2023-06-18', '2023-06-19'],
    image: '/doctors/doctor2.jpg',
  },
  {
    id: 'dr-3',
    name: 'Dr. James Wilson',
    specialty: 'Dermatology',
    availability: ['2023-06-16', '2023-06-17', '2023-06-20'],
    image: '/doctors/doctor3.jpg',
  },
  {
    id: 'dr-4',
    name: 'Dr. Lisa Thompson',
    specialty: 'Neurology',
    availability: ['2023-06-17', '2023-06-18', '2023-06-21'],
    image: '/doctors/doctor4.jpg',
  },
  {
    id: 'dr-5',
    name: 'Dr. Robert Garcia',
    specialty: 'Orthopedics',
    availability: ['2023-06-15', '2023-06-19', '2023-06-22'],
    image: '/doctors/doctor5.jpg',
  },
];

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
    return doctors.find((doc) => doc.id === selectedDoctor);
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
    const doctor = doctors.find((d) => d.id === submitData?.doctorId);

    return (
      <div className="max-w-3xl mx-auto py-8">
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
                  {doctor?.name.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 className="font-medium leading-snug">{doctor?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {doctor?.specialty}
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
                      ? 'Main Clinic, Room 204'
                      : 'Virtual Appointment'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/appointments">View All Appointments</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/appointments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-medium">Book an Appointment</h1>
          <p className="text-muted-foreground">
            Schedule a visit with one of our healthcare professionals
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0"></div>
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex flex-col items-center relative z-10">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                ${
                  currentStep >= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {step}
            </div>
            <span className="text-xs text-muted-foreground mt-1.5">
              {step === 1
                ? 'Select Doctor'
                : step === 2
                ? 'Choose Date'
                : step === 3
                ? 'Choose Time'
                : 'Details'}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Step 1: Select Doctor */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">Select a Doctor</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className={`cursor-pointer hover:border-primary transition-colors
                    ${
                      selectedDoctor === doctor.id
                        ? 'border-primary bg-primary/5'
                        : ''
                    }
                  `}
                  onClick={() => handleDoctorSelect(doctor.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium leading-snug">
                          {doctor.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
              >
                Change Doctor
              </Button>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {getSelectedDoctorDetails()?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium leading-snug">
                    {getSelectedDoctorDetails()?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getSelectedDoctorDetails()?.specialty}
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
                    selectedDate === date ? '' : 'border-muted-foreground/20'
                  }`}
                  onClick={() => handleDateSelect(date)}
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
              >
                Change Date
              </Button>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {getSelectedDoctorDetails()?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium leading-snug">
                    {getSelectedDoctorDetails()?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getSelectedDoctorDetails()?.specialty}
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
              >
                Change Time
              </Button>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {getSelectedDoctorDetails()?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium leading-snug">
                    {getSelectedDoctorDetails()?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getSelectedDoctorDetails()?.specialty}
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
    </div>
  );
}
