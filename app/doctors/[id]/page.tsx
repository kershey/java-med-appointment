'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  getDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { DoctorProfile, User } from '@/app/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ClockIcon, MapPinIcon, DollarSignIcon, UserIcon } from 'lucide-react';

interface DoctorWithUser extends DoctorProfile {
  userInfo?: User;
}

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function DoctorDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [doctor, setDoctor] = useState<DoctorWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get doctor profile
        const doctorDoc = await getDoc(doc(db, 'doctors', params.id));

        if (!doctorDoc.exists()) {
          setError('Doctor profile not found');
          return;
        }

        const doctorData = {
          ...doctorDoc.data(),
          uid: doctorDoc.id,
        } as DoctorProfile;

        // Get user data
        const userQuery = await getDocs(
          query(collection(db, 'users'), where('uid', '==', params.id))
        );

        let userData: User | undefined;

        if (!userQuery.empty) {
          userData = userQuery.docs[0].data() as User;
        }

        setDoctor({ ...doctorData, userInfo: userData });
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setError('Failed to load doctor information');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[70vh]">
        <p>Loading doctor information...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-red-500 mb-4">
            {error || 'Doctor information not available'}
          </p>
          <Button onClick={() => router.push('/doctors')}>
            Back to Doctors List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => router.push('/doctors')}
      >
        ← Back to Doctors List
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Doctor Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden">
                {doctor.userInfo?.profileImage ? (
                  <Image
                    src={doctor.userInfo.profileImage}
                    alt={doctor.userInfo.fullName}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-gray-500 bg-gray-100">
                    {doctor.userInfo?.fullName?.charAt(0) || 'D'}
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl">
                Dr. {doctor.userInfo?.fullName}
              </CardTitle>
              {doctor.specializations.length > 0 && (
                <CardDescription className="mt-2">
                  {doctor.specializations.join(', ')}
                </CardDescription>
              )}

              <div className="flex flex-wrap gap-1 mt-4 justify-center">
                {doctor.specializations.map((spec, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <DollarSignIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Consultation Fee</p>
                  <p className="text-gray-600">
                    ₱{doctor.consultationFee.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Clinic Address</p>
                  <p className="text-gray-600">{doctor.clinicAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <UserIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">Status</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        doctor.availability ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    ></span>
                    <p className="text-gray-600">
                      {doctor.availability
                        ? 'Available for appointments'
                        : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button className="w-full">Book Appointment</Button>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Details Section */}
        <div className="md:col-span-2">
          <Tabs defaultValue="about">
            <TabsList className="w-full">
              <TabsTrigger value="about" className="flex-1">
                About
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1">
                Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>About Dr. {doctor.userInfo?.fullName}</CardTitle>
                </CardHeader>
                <CardContent>
                  {doctor.bio ? (
                    <p className="text-gray-700 whitespace-pre-line">
                      {doctor.bio}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      No biography information available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Consultation Schedule</CardTitle>
                  <CardDescription>
                    Days and hours when the doctor is available for appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.keys(doctor.schedule || {}).length > 0 ? (
                      daysOfWeek.map((day) => (
                        <div
                          key={day}
                          className="flex items-center gap-3 py-2 border-b last:border-0"
                        >
                          <div className="w-24 font-medium">{day}</div>
                          {doctor.schedule && doctor.schedule[day] ? (
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4 text-gray-500" />
                              <span>
                                {doctor.schedule[day].start} -{' '}
                                {doctor.schedule[day].end}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">Not available</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">
                        No schedule information available.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
