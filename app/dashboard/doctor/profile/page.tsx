'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { DoctorProfile } from '@/app/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, User2, AlertCircle } from 'lucide-react';
import { MultiSelector } from '@/app/components/ui-custom/MultiSelector';

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

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function DoctorProfileEditPage() {
  const router = useRouter();
  const { user, userRole, loading } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedSpecializations, setSelectedSpecializations] = useState<
    string[]
  >([]);

  // Form state
  const [formData, setFormData] = useState({
    clinicAddress: '',
    consultationFee: 0,
    bio: '',
    availability: true,
    schedule: {} as Record<string, { start: string; end: string }>,
  });

  // Protect route - only doctors can access
  useEffect(() => {
    if (!loading && (!user || userRole !== 'Doctor')) {
      router.push('/auth/login');
    }
  }, [user, userRole, loading, router]);

  // Fetch doctor profile data
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!user?.uid) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get doctor profile
        const doctorRef = doc(db, 'doctors', user.uid);
        const doctorSnap = await getDoc(doctorRef);

        if (doctorSnap.exists()) {
          const data = doctorSnap.data() as DoctorProfile;
          setDoctorProfile({ ...data, uid: doctorSnap.id });
          setSelectedSpecializations(data.specializations);
          setFormData({
            clinicAddress: data.clinicAddress || '',
            consultationFee: data.consultationFee || 0,
            bio: data.bio || '',
            availability:
              data.availability !== undefined ? data.availability : true,
            schedule: data.schedule || {},
          });
        } else {
          // Create empty profile if it doesn't exist
          setDoctorProfile({
            uid: user.uid,
            specializations: [],
            clinicAddress: '',
            schedule: {},
            consultationFee: 0,
            availability: true,
            profileStatus: 'Active',
          });
        }
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
        setError('Failed to load your profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && userRole === 'Doctor') {
      fetchDoctorProfile();
    }
  }, [user, userRole]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'consultationFee' ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle availability toggle
  const handleAvailabilityChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      availability: checked,
    }));
  };

  // Handle schedule changes
  const handleScheduleChange = (
    day: string,
    field: 'start' | 'end',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...(prev.schedule[day] || { start: '09:00', end: '17:00' }),
          [field]: value,
        },
      },
    }));
  };

  // Save profile changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !doctorProfile) return;

    setIsSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const doctorRef = doc(db, 'doctors', user.uid);

      await updateDoc(doctorRef, {
        specializations: selectedSpecializations,
        clinicAddress: formData.clinicAddress,
        consultationFee: formData.consultationFee,
        bio: formData.bio,
        availability: formData.availability,
        schedule: formData.schedule,
        // Don't update profileStatus as that should be managed by admin
      });

      setSuccess('Profile updated successfully');

      // Update local state
      setDoctorProfile({
        ...doctorProfile,
        specializations: selectedSpecializations,
        clinicAddress: formData.clinicAddress,
        consultationFee: formData.consultationFee,
        bio: formData.bio,
        availability: formData.availability,
        schedule: formData.schedule,
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);

      // Auto-dismiss success message after 3 seconds
      if (!error) {
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="size-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <User2 className="h-6 w-6" />
          Edit Doctor Profile
        </h1>
        <p className="text-muted-foreground">
          Update your professional information, specializations, and
          availability
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 p-4 rounded-lg flex items-start gap-3 text-destructive">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3 text-green-600">
          <CheckCircle2 className="h-5 w-5 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations</Label>
              <MultiSelector
                options={specializations.map((spec) => ({
                  value: spec,
                  label: spec,
                }))}
                selected={selectedSpecializations.map((spec) => ({
                  value: spec,
                  label: spec,
                }))}
                onChange={(selected) =>
                  setSelectedSpecializations(selected.map((item) => item.value))
                }
                placeholder="Select your specializations"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedSpecializations.map((spec, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicAddress">Clinic Address</Label>
              <Textarea
                id="clinicAddress"
                name="clinicAddress"
                value={formData.clinicAddress}
                onChange={handleInputChange}
                placeholder="Enter your clinic address"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultationFee">Consultation Fee (₱)</Label>
              <Input
                id="consultationFee"
                name="consultationFee"
                type="number"
                min="0"
                step="50"
                value={formData.consultationFee}
                onChange={handleInputChange}
                placeholder="Enter your consultation fee"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell patients about your qualifications, experience, and approach"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="availability">Available for Appointments</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle off to temporarily hide your profile from booking
                </p>
              </div>
              <Switch
                id="availability"
                checked={formData.availability}
                onCheckedChange={handleAvailabilityChange}
              />
            </div>

            <div className="space-y-4 pt-4">
              <Label>Consultation Schedule</Label>
              {daysOfWeek.map((day) => (
                <div key={day} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 md:col-span-2">
                    <Label>{day}</Label>
                  </div>
                  <div className="col-span-4 md:col-span-5">
                    <Input
                      type="time"
                      value={formData.schedule[day]?.start || '09:00'}
                      onChange={(e) =>
                        handleScheduleChange(day, 'start', e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-1 text-center">to</div>
                  <div className="col-span-4 md:col-span-4">
                    <Input
                      type="time"
                      value={formData.schedule[day]?.end || '17:00'}
                      onChange={(e) =>
                        handleScheduleChange(day, 'end', e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/doctor')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
