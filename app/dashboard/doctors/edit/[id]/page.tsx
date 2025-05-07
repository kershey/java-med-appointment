'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  getDocs,
  query,
  collection,
  where,
} from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { DoctorProfile, User, UserStatus } from '@/app/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { CheckIcon, Loader2 } from 'lucide-react';

// Available specializations
const specializations = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Ophthalmology',
  'Gynecology',
  'ENT',
  'Psychiatry',
  'Dentistry',
];

// Days of week
const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface ScheduleTime {
  start: string;
  end: string;
}

interface DoctorProfileFormState extends Omit<DoctorProfile, 'schedule'> {
  schedule: Record<string, ScheduleTime | null>;
}

interface DoctorEditPageParams {
  params: {
    id: string;
  };
}

export default function EditDoctorProfilePage({
  params,
}: DoctorEditPageParams) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [selectedSpecializations, setSelectedSpecializations] = useState<
    string[]
  >([]);
  const [currentSpecialization, setCurrentSpecialization] =
    useState<string>('');
  const [formState, setFormState] = useState<DoctorProfileFormState>({
    uid: '',
    specializations: [],
    clinicAddress: '',
    schedule: {
      Monday: null,
      Tuesday: null,
      Wednesday: null,
      Thursday: null,
      Friday: null,
      Saturday: null,
      Sunday: null,
    },
    consultationFee: 0,
    bio: '',
    availability: false,
    profileStatus: 'Pending' as UserStatus,
  });

  const { toast } = useToast();
  const router = useRouter();
  const { userData: authUserData } = useAuth();

  // Check if current user is staff or admin
  const isAuthorized =
    authUserData?.userType === 'Admin' || authUserData?.userType === 'Staff';

  useEffect(() => {
    if (!isAuthorized) {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user data
        const userDocRef = doc(db, 'users', params.id);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          toast({
            title: 'User not found',
            description: 'The specified doctor user does not exist',
            variant: 'destructive',
          });
          router.push('/dashboard/doctors');
          return;
        }

        const userData = userDoc.data() as User;
        setUserData(userData);

        // Check if this user is a doctor
        if (userData.userType !== 'Doctor') {
          toast({
            title: 'Not a doctor',
            description: 'This user is not registered as a doctor',
            variant: 'destructive',
          });
          router.push('/dashboard/doctors');
          return;
        }

        // Fetch doctor profile data if exists
        const doctorQuery = query(
          collection(db, 'doctors'),
          where('uid', '==', params.id)
        );

        const doctorDocs = await getDocs(doctorQuery);

        if (!doctorDocs.empty) {
          const doctorData = doctorDocs.docs[0].data() as DoctorProfile;

          // Convert schedule data to the format expected by the form
          const formattedSchedule: Record<string, ScheduleTime | null> = {
            ...formState.schedule,
          };

          // Process schedule from Firestore
          Object.entries(doctorData.schedule || {}).forEach(
            ([day, timeSlot]) => {
              if (timeSlot) {
                formattedSchedule[day] = {
                  start: timeSlot.start || '',
                  end: timeSlot.end || '',
                };
              }
            }
          );

          setFormState({
            ...doctorData,
            schedule: formattedSchedule,
          });

          setSelectedSpecializations(doctorData.specializations || []);
        } else {
          // Initialize with default values and userId
          setFormState({
            ...formState,
            uid: params.id,
          });
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load doctor information',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    params.id,
    router,
    toast,
    isAuthorized,
    authUserData?.userType,
    formState,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'consultationFee') {
      // Parse as number and ensure it's not negative
      const numValue = Math.max(0, parseFloat(value) || 0);
      setFormState({ ...formState, [name]: numValue });
    } else {
      setFormState({ ...formState, [name]: value });
    }
  };

  const handleSpecializationAdd = () => {
    if (
      currentSpecialization &&
      !selectedSpecializations.includes(currentSpecialization)
    ) {
      const updatedSpecializations = [
        ...selectedSpecializations,
        currentSpecialization,
      ];
      setSelectedSpecializations(updatedSpecializations);
      setFormState({ ...formState, specializations: updatedSpecializations });
      setCurrentSpecialization('');
    }
  };

  const handleSpecializationRemove = (specialization: string) => {
    const updatedSpecializations = selectedSpecializations.filter(
      (s) => s !== specialization
    );
    setSelectedSpecializations(updatedSpecializations);
    setFormState({ ...formState, specializations: updatedSpecializations });
  };

  const handleScheduleChange = (
    day: string,
    field: 'start' | 'end',
    value: string
  ) => {
    const updatedSchedule = { ...formState.schedule };

    // Initialize the day's schedule if it doesn't exist
    if (!updatedSchedule[day]) {
      updatedSchedule[day] = { start: '', end: '' };
    }

    // Update the specific field
    if (updatedSchedule[day]) {
      updatedSchedule[day] = {
        ...updatedSchedule[day]!,
        [field]: value,
      };
    }

    setFormState({ ...formState, schedule: updatedSchedule });
  };

  const handleToggleScheduleDay = (day: string, enabled: boolean) => {
    const updatedSchedule = { ...formState.schedule };

    if (enabled) {
      // Enable this day with default times
      updatedSchedule[day] = { start: '09:00', end: '17:00' };
    } else {
      // Disable this day
      updatedSchedule[day] = null;
    }

    setFormState({ ...formState, schedule: updatedSchedule });
  };

  const handleStatusChange = (status: UserStatus) => {
    setFormState({ ...formState, profileStatus: status });
  };

  const handleAvailabilityToggle = () => {
    setFormState({ ...formState, availability: !formState.availability });
  };

  const validateForm = (): boolean => {
    // Basic validation
    if (!formState.clinicAddress.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Clinic address is required',
        variant: 'destructive',
      });
      return false;
    }

    if (formState.specializations.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one specialization is required',
        variant: 'destructive',
      });
      return false;
    }

    if (formState.consultationFee <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Consultation fee must be greater than zero',
        variant: 'destructive',
      });
      return false;
    }

    // Schedule validation - ensure start time is before end time
    for (const day in formState.schedule) {
      const timeSlot = formState.schedule[day];
      if (timeSlot) {
        if (timeSlot.start >= timeSlot.end) {
          toast({
            title: 'Schedule Error',
            description: `${day}: End time must be after start time`,
            variant: 'destructive',
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Convert schedule to the format expected by Firestore
      const firestoreSchedule: Record<string, { start: string; end: string }> =
        {};

      Object.entries(formState.schedule).forEach(([day, timeSlot]) => {
        if (timeSlot) {
          firestoreSchedule[day] = {
            start: timeSlot.start,
            end: timeSlot.end,
          };
        }
      });

      // Prepare the doctor profile data
      const doctorProfileData: Omit<DoctorProfile, 'uid'> = {
        specializations: formState.specializations,
        clinicAddress: formState.clinicAddress,
        schedule: firestoreSchedule,
        consultationFee: formState.consultationFee,
        bio: formState.bio || '',
        availability: formState.availability,
        profileStatus: formState.profileStatus,
      };

      // Check if profile already exists
      const doctorQuery = query(
        collection(db, 'doctors'),
        where('uid', '==', params.id)
      );

      const doctorDocs = await getDocs(doctorQuery);

      if (!doctorDocs.empty) {
        // Update existing profile
        const docId = doctorDocs.docs[0].id;
        await updateDoc(doc(db, 'doctors', docId), doctorProfileData);
      } else {
        // Create new profile
        await setDoc(doc(db, 'doctors', params.id), {
          uid: params.id,
          ...doctorProfileData,
        });
      }

      // Also update the user's status in users collection
      await updateDoc(doc(db, 'users', params.id), {
        status: formState.profileStatus,
      });

      toast({
        title: 'Success',
        description: 'Doctor profile updated successfully',
      });

      // Redirect back to doctors list
      router.push('/dashboard/doctors');
    } catch (error) {
      console.error('Error saving doctor profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save doctor profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading doctor information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Edit Doctor Profile: {userData?.fullName}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/doctors')}
        >
          Back to Doctors List
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Basic Info</TabsTrigger>
              <TabsTrigger value="specializations">Specializations</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            {/* Basic Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Edit the doctor&apos;s basic profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicAddress">Clinic Address</Label>
                    <Textarea
                      id="clinicAddress"
                      name="clinicAddress"
                      placeholder="Enter clinic address"
                      value={formState.clinicAddress}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consultationFee">
                      Consultation Fee (₱)
                    </Label>
                    <Input
                      id="consultationFee"
                      name="consultationFee"
                      type="number"
                      min="0"
                      step="10"
                      placeholder="Enter consultation fee"
                      value={formState.consultationFee}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Doctor Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Enter doctor bio and qualifications"
                      value={formState.bio || ''}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specializations Tab */}
            <TabsContent value="specializations">
              <Card>
                <CardHeader>
                  <CardTitle>Specializations</CardTitle>
                  <CardDescription>
                    Add or remove medical specializations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1">
                      <Select
                        value={currentSpecialization}
                        onValueChange={setCurrentSpecialization}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {specializations.map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      onClick={handleSpecializationAdd}
                      disabled={!currentSpecialization}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">
                      Selected Specializations:
                    </h3>
                    {selectedSpecializations.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No specializations selected
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedSpecializations.map((spec) => (
                          <div
                            key={spec}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full"
                          >
                            <span>{spec}</span>
                            <button
                              type="button"
                              className="text-gray-500 hover:text-red-500 focus:outline-none"
                              onClick={() => handleSpecializationRemove(spec)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Consultation Schedule</CardTitle>
                  <CardDescription>
                    Set the days and hours when the doctor is available for
                    appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <Label
                            htmlFor={`${day}-toggle`}
                            className="text-base font-medium"
                          >
                            {day}
                          </Label>
                          <Switch
                            id={`${day}-toggle`}
                            checked={!!formState.schedule[day]}
                            onCheckedChange={(checked) =>
                              handleToggleScheduleDay(day, checked)
                            }
                          />
                        </div>

                        {formState.schedule[day] && (
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2">
                              <Label htmlFor={`${day}-start`}>Start Time</Label>
                              <Input
                                id={`${day}-start`}
                                type="time"
                                value={formState.schedule[day]?.start || ''}
                                onChange={(e) =>
                                  handleScheduleChange(
                                    day,
                                    'start',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`${day}-end`}>End Time</Label>
                              <Input
                                id={`${day}-end`}
                                type="time"
                                value={formState.schedule[day]?.end || ''}
                                onChange={(e) =>
                                  handleScheduleChange(
                                    day,
                                    'end',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Status Tab */}
            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Status</CardTitle>
                  <CardDescription>
                    Manage doctor&apos;s availability and account status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base">Profile Status</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['Pending', 'Active', 'Suspended'] as UserStatus[]).map(
                        (status) => (
                          <Button
                            key={status}
                            type="button"
                            variant={
                              formState.profileStatus === status
                                ? 'default'
                                : 'outline'
                            }
                            className="justify-start"
                            onClick={() => handleStatusChange(status)}
                          >
                            {formState.profileStatus === status && (
                              <CheckIcon className="mr-2 h-4 w-4" />
                            )}
                            {status}
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="availability" className="text-base">
                          Available for Appointments
                        </Label>
                        <p className="text-sm text-gray-500">
                          Toggle if the doctor is currently accepting
                          appointments
                        </p>
                      </div>
                      <Switch
                        id="availability"
                        checked={formState.availability}
                        onCheckedChange={handleAvailabilityToggle}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-between border rounded-lg p-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/doctors')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </div>
      </form>
    </div>
  );
}
